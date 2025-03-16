from decimal import Decimal
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.inventory import Inventory


class WarehouseBase(SQLModel):
    """Base model for Warehouse with common attributes."""

    name: str
    square_footage: float
    address: str
    manager_name: str
    phone: str
    latitude: Decimal
    longitude: Decimal


class Warehouse(WarehouseBase, table=True):
    """Warehouse model that maps to the database table."""

    __tablename__ = "warehouses"

    warehouse_id: int | None = Field(default=None, primary_key=True)

    # Define relationship with Inventory
    inventory_items: list["Inventory"] = Relationship(
        back_populates="warehouse",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class WarehouseCreate(WarehouseBase):
    """Schema for creating a new warehouse."""

    pass


class WarehouseRead(WarehouseBase):
    """Schema for reading warehouse data."""

    warehouse_id: int


class WarehouseUpdate(SQLModel):
    """Schema for updating a warehouse."""

    name: str | None = None
    square_footage: float | None = None
    address: str | None = None
    manager_name: str | None = None
    phone: str | None = None
    latitude: Decimal | None = None
    longitude: Decimal | None = None
