import { supabase } from './supabase';
import { API_BASE_URL } from '@/src/constants/api';

/**
 * Get the current auth token from Supabase
 */
async function getAuthToken(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token || null;
}

/**
 * Get headers with authentication
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

export interface ApiClientOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  requireAuth?: boolean;
}

/**
 * API client with automatic authentication
 */
export async function apiClient<T>(endpoint: string, options: ApiClientOptions = {}): Promise<T> {
  const { method = 'GET', body, requireAuth = true } = options;

  const headers = requireAuth ? await getAuthHeaders() : { 'Content-Type': 'application/json' };

  const config: RequestInit = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, config);

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `API Error: ${response.status}`;

    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }

    throw new Error(errorMessage);
  }

  // Handle empty responses (e.g., 204 No Content)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T;
  }

  return response.json();
}
