from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

from app.models.pagination import PageInfo

if TYPE_CHECKING:
    from app.models.inventory import Inventory


class ItemBase(SQLModel):
    """Base model for Item with common attributes."""

    name: str
    description: str
    sku: str | None = None


class Item(ItemBase, table=True):
    """Item model that maps to the database table."""

    __tablename__ = "items"

    item_id: int | None = Field(default=None, primary_key=True)

    # Define relationship with Inventory
    inventory_items: list["Inventory"] = Relationship(
        back_populates="item", sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


class ItemCreate(ItemBase):
    """Schema for creating a new item."""

    pass


class ItemRead(ItemBase):
    """Schema for reading item data."""


class ItemReadWithInventory(ItemRead):
    """Schema for reading item data with total inventory information."""

    item_id: int
    total_inventory: int


class ItemUpdate(SQLModel):
    """Schema for updating an item."""

    name: str | None = None
    description: str | None = None
    sku: str | None = None


class PaginatedItemWithInventoryResponse(SQLModel):
    """Paginated response for items with inventory information."""

    items: list[ItemReadWithInventory]
    page_info: PageInfo
