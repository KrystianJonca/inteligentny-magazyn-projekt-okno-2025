import { apiClient } from './apiClient';
import type { WarehouseCreate, WarehouseRead, WarehouseUpdate } from './schema.types';

// Get all warehouses
export const getWarehouses = (): Promise<WarehouseRead[]> => {
  return apiClient<WarehouseRead[]>('/warehouses/', { method: 'GET' });
};

// Get a single warehouse by ID
export const getWarehouseById = (warehouseId: number): Promise<WarehouseRead> => {
  return apiClient<WarehouseRead>(`/warehouses/${warehouseId}`, { method: 'GET' });
};

// Create a new warehouse
export const createWarehouse = (data: WarehouseCreate): Promise<WarehouseRead> => {
  return apiClient<WarehouseRead>('/warehouses/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Update an existing warehouse
export const updateWarehouse = (
  warehouseId: number,
  data: WarehouseUpdate
): Promise<WarehouseRead> => {
  return apiClient<WarehouseRead>(`/warehouses/${warehouseId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

// Delete a warehouse
export const deleteWarehouse = (warehouseId: number): Promise<void> => {
  // 204 No Content on success
  return apiClient<void>(`/warehouses/${warehouseId}`, { method: 'DELETE' });
};
