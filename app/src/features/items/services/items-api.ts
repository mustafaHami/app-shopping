import { apiClient } from '@/src/lib/api-client';
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

  async delete(id: string): Promise<void> {
    return apiClient<void>(`/items/${id}`, {
      method: 'DELETE',
    });
  },
};
