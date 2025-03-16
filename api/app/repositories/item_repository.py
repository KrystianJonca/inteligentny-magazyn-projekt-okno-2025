from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.inventory import Inventory
from app.models.item import (
    Item,
    ItemCreate,
    ItemReadWithInventory,
    ItemUpdate,
    PaginatedItemWithInventoryResponse,
)
from app.models.pagination import PageInfo


class ItemRepository:
    """Repository for item database operations."""

    async def create(self, db: AsyncSession, item: ItemCreate) -> Item:
        """Create a new item."""
        db_item = Item.model_validate(item)
        db.add(db_item)
        await db.commit()
        await db.refresh(db_item)
        return db_item

    async def get_by_id(self, db: AsyncSession, item_id: int) -> ItemReadWithInventory | None:
        """Get an item by ID with total inventory information."""
        # Get the item
        result = await db.execute(select(Item).where(Item.item_id == item_id))
        item = result.scalar_one_or_none()

        if not item:
            return None

        # Calculate total inventory for this item
        inventory_result = await db.execute(
            select(func.sum(Inventory.quantity)).where(Inventory.item_id == item_id)
        )
        total_inventory = inventory_result.scalar_one() or 0

        # Create the response with total inventory
        return ItemReadWithInventory(
            item_id=item.item_id,
            name=item.name,
            description=item.description,
            sku=item.sku,
            total_inventory=total_inventory,
        )

    async def get_items(
        self,
        db: AsyncSession,
        search: str | None = None,
        page: int = 1,
        page_size: int = 10,
    ) -> PaginatedItemWithInventoryResponse:
        """
        Get items with pagination and total inventory information.
        If search is provided, filters items by name.
        """
        # Build the base query
        query = select(Item)
        count_query = select(func.count()).select_from(Item)

        # Apply search filter if provided
        if search:
            query = query.where(Item.name.ilike(f"%{search}%"))
            count_query = count_query.where(Item.name.ilike(f"%{search}%"))

        # Calculate offset
        offset = (page - 1) * page_size

        # Get total count
        count_result = await db.execute(count_query)
        total_items = count_result.scalar_one()

        # Get items for current page
        result = await db.execute(query.offset(offset).limit(page_size))
        items = result.scalars().all()

        # Get item IDs for the current page
        item_ids = [item.item_id for item in items]

        # If we have items, get their total inventory
        inventory_by_item = {}
        if item_ids:
            # Query to get the sum of inventory quantities grouped by item_id
            inventory_query = (
                select(
                    Inventory.item_id,
                    func.sum(Inventory.quantity).label("total_quantity"),
                )
                .where(Inventory.item_id.in_(item_ids))
                .group_by(Inventory.item_id)
            )

            inventory_result = await db.execute(inventory_query)
            inventory_by_item = {item_id: total for item_id, total in inventory_result}

        # Create ItemReadWithInventory objects
        items_with_inventory = [
            ItemReadWithInventory(
                item_id=item.item_id,
                name=item.name,
                description=item.description,
                sku=item.sku,
                total_inventory=inventory_by_item.get(item.item_id, 0),
            )
            for item in items
        ]

        # Calculate pagination info
        total_pages = (total_items + page_size - 1) // page_size if total_items > 0 else 1
        page_info = PageInfo(
            total_items=total_items,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
            has_next_page=page < total_pages,
        )

        return PaginatedItemWithInventoryResponse(items=items_with_inventory, page_info=page_info)

    async def update(self, db: AsyncSession, item_id: int, item_update: ItemUpdate) -> Item | None:
        """Update an item."""
        db_item = await db.execute(select(Item).where(Item.item_id == item_id))
        db_item = db_item.scalar_one_or_none()

        if not db_item:
            return None

        # Update only the fields that are provided
        item_data = item_update.model_dump(exclude_unset=True)
        for key, value in item_data.items():
            setattr(db_item, key, value)

        await db.commit()
        await db.refresh(db_item)
        return db_item

    async def delete(self, db: AsyncSession, item_id: int) -> bool:
        """Delete an item."""
        db_item = await db.execute(select(Item).where(Item.item_id == item_id))
        db_item = db_item.scalar_one_or_none()

        if not db_item:
            return False

        await db.delete(db_item)
        await db.commit()
        return True
