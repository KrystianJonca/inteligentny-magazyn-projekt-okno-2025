import type { components } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    if (response.status === 422) {
      const errorData: components['schemas']['HTTPValidationError'] = await response.json();
      // Assuming the error structure from HTTPValidationError
      const messages =
        errorData.detail
          ?.map((err: components['schemas']['ValidationError']) => err.msg)
          .join(', ') || response.statusText;
      throw new Error(`Validation Error: ${messages}`);
    }
    throw new Error(response.statusText || 'API request failed');
  }
  if (response.status === 204) {
    // No content
    return undefined as T;
  }
  return response.json();
}

export async function registerUser(
  userData: components['schemas']['UserCreate']
): Promise<components['schemas']['UserRead']> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  return handleResponse<components['schemas']['UserRead']>(response);
}

export async function loginUser(
  loginData: components['schemas']['Body_login_auth_login_post']
): Promise<components['schemas']['Token']> {
  // The API expects x-www-form-urlencoded for login
  const formData = new URLSearchParams();
  formData.append('username', loginData.username);
  formData.append('password', loginData.password);
  if (loginData.grant_type) formData.append('grant_type', loginData.grant_type);
  formData.append('scope', loginData.scope || ''); // Ensure scope is present
  if (loginData.client_id) formData.append('client_id', loginData.client_id);
  if (loginData.client_secret) formData.append('client_secret', loginData.client_secret);

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });
  return handleResponse<components['schemas']['Token']>(response);
}
