import { apiClient } from '@/src/lib/api-client';
import { Category } from '../types';

export const categoriesApi = {
  async getAll(): Promise<Category[]> {
    return apiClient<Category[]>('/categories');
  },

  async create(name: string): Promise<Category> {
    return apiClient<Category>('/categories', {
      method: 'POST',
      body: { name },
    });
  },
};
