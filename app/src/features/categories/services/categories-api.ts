import { API_BASE_URL } from '@/src/constants/api';
import { Category } from '../types';

export const categoriesApi = {
  async getAll(userId: string): Promise<Category[]> {
    const response = await fetch(`${API_BASE_URL}/categories?userId=${userId}`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch categories: ${response.status} ${errorText}`);
    }
    return response.json();
  },

  async create(name: string, userId: string): Promise<Category> {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, userId }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create category: ${response.status} ${errorText}`);
    }
    return response.json();
  },
};
