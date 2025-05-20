import { apiClient } from './apiClient';
import type {
  InventoryCreate,
  InventoryRead,
  InventoryUpdate,
  InventoryWithWarehouse,
} from './schema.types';

// Get all inventory records for a specific item (showing warehouses and quantities)
export const getInventoryByItem = (itemId: number): Promise<InventoryWithWarehouse[]> => {
  return apiClient<InventoryWithWarehouse[]>(`/inventory/item/${itemId}`, { method: 'GET' });
};

// Create a new inventory record (add an item to a warehouse)
export const createInventory = (data: InventoryCreate): Promise<InventoryRead> => {
  return apiClient<InventoryRead>('/inventory/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Update an existing inventory record (change quantity of an item in a warehouse)
export const updateInventory = (
  warehouseId: number,
  itemId: number,
  data: InventoryUpdate
): Promise<InventoryRead> => {
  return apiClient<InventoryRead>(`/inventory/${warehouseId}/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

// Delete an inventory record (remove an item from a warehouse)
export const deleteInventory = (warehouseId: number, itemId: number): Promise<void> => {
  return apiClient<void>(`/inventory/${warehouseId}/${itemId}`, { method: 'DELETE' });
};

// TODO: Add deleteInventory if needed later
