from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db_session
from app.models.inventory import (
    InventoryCreate,
    InventoryRead,
    InventoryTransfer,
    InventoryTransferResponse,
    InventoryUpdate,
    InventoryWithItem,
    InventoryWithWarehouse,
)
from app.repositories.inventory_repository import InventoryRepository

router = APIRouter(prefix="/inventory", tags=["inventory"])
inventory_repository = InventoryRepository()


@router.post("/", response_model=InventoryRead, status_code=status.HTTP_201_CREATED)
async def create_inventory(inventory: InventoryCreate, db: AsyncSession = Depends(get_db_session)):
    """Create a new inventory record."""
    return await inventory_repository.create(db, inventory)


@router.get("/warehouse/{warehouse_id}", response_model=list[InventoryWithItem])
async def get_inventory_by_warehouse(
    warehouse_id: int,
    db: AsyncSession = Depends(get_db_session),
):
    """Get all inventory records for a specific warehouse with item information."""
    return await inventory_repository.get_by_warehouse(db, warehouse_id)


@router.get("/item/{item_id}", response_model=list[InventoryWithWarehouse])
async def get_inventory_by_item(
    item_id: int,
    db: AsyncSession = Depends(get_db_session),
):
    """Get all inventory records for a specific item with warehouse information."""
    return await inventory_repository.get_by_item(db, item_id)


@router.get("/{warehouse_id}/{item_id}", response_model=InventoryRead)
async def get_inventory_by_warehouse_and_item(
    warehouse_id: int,
    item_id: int,
    db: AsyncSession = Depends(get_db_session),
):
    """Get a specific inventory record by warehouse_id and item_id with full details."""
    db_inventory = await inventory_repository.get_by_ids(db, warehouse_id, item_id)
    if db_inventory is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Inventory record not found"
        )
    return db_inventory


@router.patch("/{warehouse_id}/{item_id}", response_model=InventoryRead)
async def update_inventory(
    warehouse_id: int,
    item_id: int,
    inventory: InventoryUpdate,
    db: AsyncSession = Depends(get_db_session),
):
    """Update an inventory record."""
    db_inventory = await inventory_repository.update(db, warehouse_id, item_id, inventory)
    if db_inventory is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Inventory record not found"
        )
    return db_inventory


@router.delete("/{warehouse_id}/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_inventory(
    warehouse_id: int, item_id: int, db: AsyncSession = Depends(get_db_session)
):
    """Delete an inventory record."""
    success = await inventory_repository.delete(db, warehouse_id, item_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Inventory record not found"
        )
    return None


@router.post("/transfer", response_model=InventoryTransferResponse, status_code=status.HTTP_200_OK)
async def transfer_inventory(
    transfer: InventoryTransfer, db: AsyncSession = Depends(get_db_session)
):
    """
    Transfer inventory from one warehouse to another.

    This endpoint moves a specified quantity of an item from a source to a destination warehouse.
    If the source warehouse doesn't have enough quantity, the transfer will fail.
    If the item doesn't exist in the destination warehouse, a new inventory record will be created.
    """
    # Validate that source and destination warehouses are different
    if transfer.source_warehouse_id == transfer.destination_warehouse_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Source and destination warehouses must be different",
        )

    # Validate that quantity is positive
    if transfer.quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transfer quantity must be greater than zero",
        )

    # Perform the transfer
    source_inventory, destination_inventory = await inventory_repository.transfer(
        db,
        transfer.source_warehouse_id,
        transfer.destination_warehouse_id,
        transfer.item_id,
        transfer.quantity,
    )

    # Check if transfer was successful
    if source_inventory is None and destination_inventory is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transfer failed: Source inventory not found or has insufficient quantity",
        )

    # Return the updated inventory records
    return InventoryTransferResponse(
        message=f"Successfully transferred {transfer.quantity} units of item {transfer.item_id}",
        source_inventory=source_inventory,
        destination_inventory=destination_inventory,
    )
