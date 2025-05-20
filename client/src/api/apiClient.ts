import type { HTTPValidationError, ValidationError } from './schema.types';

import { TOKEN_KEY } from '@/contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface RequestOptions extends RequestInit {
  isPublic?: boolean; // To allow requests to public endpoints like login/register
}

export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    if (response.status === 422) {
      const errorData: HTTPValidationError = await response.json();
      const messages =
        errorData.detail
          ?.map((err: ValidationError) => `${err.loc.join('.')} - ${err.msg}`)
          .join(', ') || response.statusText;
      throw new Error(`Validation Error: ${messages}`);
    }
    // Handle other common errors
    if (response.status === 401) {
      // Potentially trigger a logout or token refresh here
      throw new Error('Unauthorized: Please log in again.');
    }
    if (response.status === 403) {
      throw new Error('Forbidden: You do not have permission to perform this action.');
    }
    if (response.status === 404) {
      throw new Error('Not Found: The requested resource could not be found.');
    }
    // Generic error
    const errorText = await response.text();
    throw new Error(errorText || `API request failed with status ${response.status}`);
  }
  if (response.status === 204) {
    return undefined as T; // For No Content responses
  }
  return response.json();
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  const token = localStorage.getItem(TOKEN_KEY);

  if (!options.isPublic && token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && options.body) {
    // Don't set Content-Type for FormData
    headers.append('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return handleApiResponse<T>(response);
}

// Example usage for a GET request (will be used in warehouse.ts)
// export const getWarehouses = () => apiClient<WarehouseRead[]>('/warehouses/', { method: 'GET' });

// Example usage for a POST request (will be used in warehouse.ts)
// export const createWarehouse = (data: WarehouseCreate) =>
//   apiClient<WarehouseRead>('/warehouses/', { method: 'POST', body: JSON.stringify(data) });
