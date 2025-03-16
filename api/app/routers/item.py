from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db_session
from app.models.item import (
    ItemCreate,
    ItemReadWithInventory,
    ItemUpdate,
    PaginatedItemWithInventoryResponse,
)
from app.repositories.item_repository import ItemRepository

router = APIRouter(prefix="/items", tags=["items"])
item_repository = ItemRepository()


@router.post("/", response_model=ItemReadWithInventory, status_code=status.HTTP_201_CREATED)
async def create_item(item: ItemCreate, db: AsyncSession = Depends(get_db_session)):
    """Create a new item."""
    db_item = await item_repository.create(db, item)
    # Get the item with inventory info after creation
    return await item_repository.get_by_id(db, db_item.item_id)


@router.get("/{item_id}", response_model=ItemReadWithInventory)
async def get_item(item_id: int, db: AsyncSession = Depends(get_db_session)):
    """Get an item by ID with total inventory information."""
    db_item = await item_repository.get_by_id(db, item_id)
    if db_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return db_item


@router.get("/", response_model=PaginatedItemWithInventoryResponse)
async def get_items(
    search: str | None = Query(None, description="Search items by name"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Number of items per page"),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Get all items with pagination and total inventory information.
    Returns pagination metadata along with the results.
    Optionally filter items by name using the search parameter.
    """
    return await item_repository.get_items(db, search, page, page_size)


@router.patch("/{item_id}", response_model=ItemReadWithInventory)
async def update_item(
    item_id: int,
    item: ItemUpdate,
    db: AsyncSession = Depends(get_db_session),
):
    """Update an item."""
    db_item = await item_repository.update(db, item_id, item)
    if db_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    # Get the updated item with inventory info
    return await item_repository.get_by_id(db, item_id)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(item_id: int, db: AsyncSession = Depends(get_db_session)):
    """Delete an item."""
    success = await item_repository.delete(db, item_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return None
