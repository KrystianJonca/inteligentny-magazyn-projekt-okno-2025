from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.inventory import Inventory, InventoryCreate, InventoryUpdate


class InventoryRepository:
    """Repository for inventory database operations."""

    async def create(self, db: AsyncSession, inventory: InventoryCreate) -> Inventory:
        """Create a new inventory record."""
        db_inventory = Inventory.model_validate(inventory)
        db.add(db_inventory)
        await db.commit()
        await db.refresh(db_inventory)
        return db_inventory

    async def get_by_ids(
        self, db: AsyncSession, warehouse_id: int, item_id: int
    ) -> Inventory | None:
        """Get an inventory record by warehouse_id and item_id."""
        result = await db.execute(
            select(Inventory).where(
                and_(Inventory.warehouse_id == warehouse_id, Inventory.item_id == item_id)
            )
        )
        return result.scalar_one_or_none()

    async def get_by_warehouse(self, db: AsyncSession, warehouse_id: int) -> list[Inventory]:
        """Get all inventory records for a specific warehouse with item information."""
        result = await db.execute(
            select(Inventory)
            .options(joinedload(Inventory.item))
            .where(Inventory.warehouse_id == warehouse_id)
        )
        return result.unique().scalars().all()

    async def get_by_item(self, db: AsyncSession, item_id: int) -> list[Inventory]:
        """Get all inventory records for a specific item with warehouse information."""
        result = await db.execute(
            select(Inventory)
            .options(joinedload(Inventory.warehouse))
            .where(Inventory.item_id == item_id)
        )
        return result.unique().scalars().all()

    async def update(
        self,
        db: AsyncSession,
        warehouse_id: int,
        item_id: int,
        inventory_update: InventoryUpdate,
    ) -> Inventory | None:
        """Update an inventory record."""
        db_inventory = await self.get_by_ids(db, warehouse_id, item_id)
        if not db_inventory:
            return None

        # Update only the fields that are provided
        inventory_data = inventory_update.model_dump(exclude_unset=True)
        for key, value in inventory_data.items():
            setattr(db_inventory, key, value)

        await db.commit()
        await db.refresh(db_inventory)
        return db_inventory

    async def delete(self, db: AsyncSession, warehouse_id: int, item_id: int) -> bool:
        """Delete an inventory record."""
        db_inventory = await self.get_by_ids(db, warehouse_id, item_id)
        if not db_inventory:
            return False

        await db.delete(db_inventory)
        await db.commit()
        return True

    async def transfer(
        self,
        db: AsyncSession,
        source_warehouse_id: int,
        destination_warehouse_id: int,
        item_id: int,
        quantity: int,
    ) -> tuple[Inventory | None, Inventory | None]:
        """
        Transfer inventory from one warehouse to another.

        Returns a tuple of (source_inventory, destination_inventory) after the transfer.
        Returns (None, None) if the source inventory doesn't exist or has insufficient
        quantity.
        """
        # Get source inventory
        source_inventory = await self.get_by_ids(db, source_warehouse_id, item_id)
        if not source_inventory or source_inventory.quantity < quantity:
            return None, None

        # Get or create destination inventory
        destination_inventory = await self.get_by_ids(db, destination_warehouse_id, item_id)

        # Start transaction
        try:
            # Decrease quantity from source
            source_inventory.quantity -= quantity

            # If destination inventory exists, increase quantity
            if destination_inventory:
                destination_inventory.quantity += quantity
            else:
                # Create new inventory record at destination
                destination_inventory = Inventory(
                    warehouse_id=destination_warehouse_id,
                    item_id=item_id,
                    quantity=quantity,
                )
                db.add(destination_inventory)

            # Keep the record even if quantity becomes zero

            await db.commit()
            await db.refresh(source_inventory)

            # Refresh destination inventory if it exists
            if destination_inventory:
                await db.refresh(destination_inventory)

            return source_inventory, destination_inventory

        except Exception:
            await db.rollback()
            raise
