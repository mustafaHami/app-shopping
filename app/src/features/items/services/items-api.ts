import { API_BASE_URL } from '@/src/constants/api';
import { Item } from '../types';
import { CreateItemSchema, UpdateItemSchema } from '../schemas/item-schema';

export const itemsApi = {
  async getAll(listId: string, userId: string): Promise<Item[]> {
    const response = await fetch(`${API_BASE_URL}/items/list/${listId}?userId=${userId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch items: ${response.status}`);
    }
    return response.json();
  },

  async getById(id: string, userId: string): Promise<Item> {
    const response = await fetch(`${API_BASE_URL}/items/${id}?userId=${userId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch item: ${response.status}`);
    }
    return response.json();
  },

  async create(data: CreateItemSchema, userId: string): Promise<Item> {
    const response = await fetch(`${API_BASE_URL}/items?userId=${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to create item: ${response.status}`);
    }
    return response.json();
  },

  async update(id: string, userId: string, data: UpdateItemSchema): Promise<Item> {
    const response = await fetch(`${API_BASE_URL}/items/${id}?userId=${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to update item: ${response.status}`);
    }
    return response.json();
  },

  async toggleChecked(id: string, userId: string): Promise<Item> {
    const response = await fetch(`${API_BASE_URL}/items/${id}/toggle?userId=${userId}`, {
      method: 'PATCH',
    });
    if (!response.ok) {
      throw new Error(`Failed to toggle item: ${response.status}`);
    }
    return response.json();
  },

  async delete(id: string, userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/items/${id}?userId=${userId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete item: ${response.status}`);
    }
  },
};
