import { apiClient } from '@/src/lib/api-client';
import { List } from '../types';
import { CreateListSchema, UpdateListSchema } from '../schemas/list-schema';

export const listsApi = {
  async getAll(): Promise<List[]> {
    return apiClient<List[]>('/lists');
  },

  async getById(id: string): Promise<List> {
    return apiClient<List>(`/lists/${id}`);
  },

  async create(data: CreateListSchema): Promise<List> {
    return apiClient<List>('/lists', {
      method: 'POST',
      body: data,
    });
  },

  async update(id: string, data: UpdateListSchema): Promise<List> {
    return apiClient<List>(`/lists/${id}`, {
      method: 'PATCH',
      body: data,
    });
  },

  async delete(id: string): Promise<void> {
    return apiClient<void>(`/lists/${id}`, {
      method: 'DELETE',
    });
  },
};
