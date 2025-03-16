from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.warehouse import (
    Warehouse,
    WarehouseCreate,
    WarehouseUpdate,
)


class WarehouseRepository:
    """Repository for warehouse database operations."""

    async def create(self, db: AsyncSession, warehouse: WarehouseCreate) -> Warehouse:
        """Create a new warehouse."""
        db_warehouse = Warehouse.model_validate(warehouse)
        db.add(db_warehouse)
        await db.commit()
        await db.refresh(db_warehouse)
        return db_warehouse

    async def get_by_id(self, db: AsyncSession, warehouse_id: int) -> Warehouse | None:
        """Get a warehouse by ID."""
        result = await db.execute(select(Warehouse).where(Warehouse.warehouse_id == warehouse_id))
        return result.scalar_one_or_none()

    async def get_all_warehouses(self, db: AsyncSession) -> list[Warehouse]:
        """Get all warehouses from the database."""
        result = await db.execute(select(Warehouse))
        return result.scalars().all()

    async def update(
        self, db: AsyncSession, warehouse_id: int, warehouse_update: WarehouseUpdate
    ) -> Warehouse | None:
        """Update a warehouse."""
        db_warehouse = await self.get_by_id(db, warehouse_id)
        if not db_warehouse:
            return None

        # Update only the fields that are provided
        warehouse_data = warehouse_update.model_dump(exclude_unset=True)
        for key, value in warehouse_data.items():
            setattr(db_warehouse, key, value)

        await db.commit()
        await db.refresh(db_warehouse)
        return db_warehouse

    async def delete(self, db: AsyncSession, warehouse_id: int) -> bool:
        """Delete a warehouse."""
        db_warehouse = await self.get_by_id(db, warehouse_id)
        if not db_warehouse:
            return False

        await db.delete(db_warehouse)
        await db.commit()
        return True
