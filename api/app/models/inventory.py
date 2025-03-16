from sqlmodel import Field, Relationship, SQLModel

from app.models.item import Item, ItemRead
from app.models.warehouse import Warehouse, WarehouseRead


class InventoryBase(SQLModel):
    """Base model for Inventory with common attributes."""

    warehouse_id: int = Field(foreign_key="warehouses.warehouse_id")
    item_id: int = Field(foreign_key="items.item_id")
    quantity: int


class Inventory(InventoryBase, table=True):
    """Inventory model that maps to the database table."""

    __tablename__ = "inventory"

    # Define composite primary key
    warehouse_id: int = Field(
        foreign_key="warehouses.warehouse_id",
        primary_key=True,
    )
    item_id: int = Field(
        foreign_key="items.item_id",
        primary_key=True,
    )

    # Define relationships
    warehouse: Warehouse | None = Relationship(
        back_populates="inventory_items",
    )
    item: Item | None = Relationship(back_populates="inventory_items")


class InventoryCreate(InventoryBase):
    """Schema for creating a new inventory record."""

    pass


class InventoryRead(InventoryBase):
    """Schema for reading inventory data."""

    pass


class InventoryWithItem(InventoryRead):
    """Schema for reading inventory data with item information."""

    item: ItemRead


class InventoryWithWarehouse(InventoryRead):
    """Schema for reading inventory data with warehouse information."""

    warehouse: WarehouseRead


class InventoryUpdate(SQLModel):
    """Schema for updating an inventory record."""

    quantity: int | None = None


class InventoryTransfer(SQLModel):
    """Schema for transferring inventory between warehouses."""

    source_warehouse_id: int
    destination_warehouse_id: int
    item_id: int
    quantity: int


class InventoryTransferResponse(SQLModel):
    """Response model for inventory transfer operations."""

    message: str
    source_inventory: InventoryRead
    destination_inventory: InventoryRead
