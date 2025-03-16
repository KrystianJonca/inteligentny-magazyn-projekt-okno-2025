from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db_session
from app.models.warehouse import (
    WarehouseCreate,
    WarehouseRead,
    WarehouseUpdate,
)
from app.repositories.warehouse_repository import WarehouseRepository

router = APIRouter(prefix="/warehouses", tags=["warehouses"])
warehouse_repository = WarehouseRepository()


@router.post("/", response_model=WarehouseRead, status_code=status.HTTP_201_CREATED)
async def create_warehouse(warehouse: WarehouseCreate, db: AsyncSession = Depends(get_db_session)):
    """Create a new warehouse."""
    return await warehouse_repository.create(db, warehouse)


@router.get("/{warehouse_id}", response_model=WarehouseRead)
async def get_warehouse(warehouse_id: int, db: AsyncSession = Depends(get_db_session)):
    """Get a warehouse by ID."""
    db_warehouse = await warehouse_repository.get_by_id(db, warehouse_id)
    if db_warehouse is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found")
    return db_warehouse


@router.get("/", response_model=list[WarehouseRead])
async def get_warehouses(db: AsyncSession = Depends(get_db_session)):
    """
    Get all warehouses from the database.
    """
    return await warehouse_repository.get_all_warehouses(db)


@router.patch("/{warehouse_id}", response_model=WarehouseRead)
async def update_warehouse(
    warehouse_id: int,
    warehouse: WarehouseUpdate,
    db: AsyncSession = Depends(get_db_session),
):
    """Update a warehouse."""
    db_warehouse = await warehouse_repository.update(db, warehouse_id, warehouse)
    if db_warehouse is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found")
    return db_warehouse


@router.delete("/{warehouse_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_warehouse(warehouse_id: int, db: AsyncSession = Depends(get_db_session)):
    """Delete a warehouse."""
    success = await warehouse_repository.delete(db, warehouse_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found")
    return None
