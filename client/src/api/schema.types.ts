import type { components } from './types';

// Auth
export type UserCreate = components['schemas']['UserCreate'];
export type UserRead = components['schemas']['UserRead'];
export type LoginPayload = components['schemas']['Body_login_auth_login_post'];
export type Token = components['schemas']['Token'];
export type HTTPValidationError = components['schemas']['HTTPValidationError'];
export type ValidationError = components['schemas']['ValidationError'];

// Warehouses
export type WarehouseCreate = components['schemas']['WarehouseCreate'];
export type WarehouseRead = components['schemas']['WarehouseRead'];
export type WarehouseUpdate = components['schemas']['WarehouseUpdate'];

// Items
export type ItemCreate = components['schemas']['ItemCreate'];
export type ItemRead = components['schemas']['ItemRead'];
export type ItemReadWithInventory = components['schemas']['ItemReadWithInventory'];
export type ItemUpdate = components['schemas']['ItemUpdate'];
export type PaginatedItems = components['schemas']['PaginatedItemWithInventoryResponse'];

// Inventory
export type InventoryCreate = components['schemas']['InventoryCreate'];
export type InventoryRead = components['schemas']['InventoryRead'];
export type InventoryUpdate = components['schemas']['InventoryUpdate'];
export type InventoryTransfer = components['schemas']['InventoryTransfer'];
export type InventoryTransferResponse = components['schemas']['InventoryTransferResponse'];
export type InventoryWithItem = components['schemas']['InventoryWithItem'];
export type InventoryWithWarehouse = components['schemas']['InventoryWithWarehouse'];

// General
export type PageInfo = components['schemas']['PageInfo'];
