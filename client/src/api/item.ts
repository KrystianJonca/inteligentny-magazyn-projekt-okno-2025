import { apiClient } from './apiClient';
import type { ItemCreate, ItemReadWithInventory, ItemUpdate, PaginatedItems } from './schema.types';

interface GetItemsParams {
  search?: string | null;
  page?: number;
  page_size?: number;
}

// Get all items (paginated and searchable)
export const getItems = (params?: GetItemsParams): Promise<PaginatedItems> => {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.append('search', params.search);
  if (params?.page) queryParams.append('page', String(params.page));
  if (params?.page_size) queryParams.append('page_size', String(params.page_size));

  const endpoint = `/items/?${queryParams.toString()}`;
  return apiClient<PaginatedItems>(endpoint, { method: 'GET' });
};

// Get a single item by ID
export const getItemById = (itemId: number): Promise<ItemReadWithInventory> => {
  return apiClient<ItemReadWithInventory>(`/items/${itemId}`, { method: 'GET' });
};

// Create a new item
export const createItem = (data: ItemCreate): Promise<ItemReadWithInventory> => {
  return apiClient<ItemReadWithInventory>('/items/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Update an existing item
export const updateItem = (itemId: number, data: ItemUpdate): Promise<ItemReadWithInventory> => {
  return apiClient<ItemReadWithInventory>(`/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

// Delete an item
export const deleteItem = (itemId: number): Promise<void> => {
  // 204 No Content on success
  return apiClient<void>(`/items/${itemId}`, { method: 'DELETE' });
};
