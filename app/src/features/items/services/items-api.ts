import { apiClient } from '@/src/lib/api-client';
import { supabase } from '@/src/lib/supabase';
import { API_BASE_URL } from '@/src/constants/api';
import { Item } from '../types';
import { CreateItemSchema, UpdateItemSchema } from '../schemas/item-schema';

export const itemsApi = {
  async getAll(listId: string): Promise<Item[]> {
    return apiClient<Item[]>(`/items/list/${listId}`);
  },

  async getById(id: string): Promise<Item> {
    return apiClient<Item>(`/items/${id}`);
  },

  async create(data: CreateItemSchema): Promise<Item> {
    return apiClient<Item>('/items', {
      method: 'POST',
      body: data,
    });
  },

  async update(id: string, data: UpdateItemSchema): Promise<Item> {
    return apiClient<Item>(`/items/${id}`, {
      method: 'PATCH',
      body: data,
    });
  },

  async toggleChecked(id: string): Promise<Item> {
    return apiClient<Item>(`/items/${id}/toggle`, {
      method: 'PATCH',
    });
  },

  async updateQuantity(id: string, quantity: number): Promise<Item> {
    return apiClient<Item>(`/items/${id}/quantity`, {
      method: 'PATCH',
      body: { quantity },
    });
  },

  async delete(id: string): Promise<void> {
    return apiClient<void>(`/items/${id}`, {
      method: 'DELETE',
    });
  },

  async uploadImage(id: string, imageUri: string): Promise<{ imageUrl: string }> {
    // Get auth token
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
      throw new Error('Authentication required');
    }

    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('image', {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    const response = await fetch(`${API_BASE_URL}/items/${id}/image`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type - let fetch handle it with the boundary for FormData
      },
    });

    if (!response.ok) {
      let errorMessage = 'Failed to upload image';
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch {
        errorMessage = await response.text();
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  async deleteImage(id: string): Promise<void> {
    return apiClient<void>(`/items/${id}/image`, {
      method: 'DELETE',
    });
  },
};
