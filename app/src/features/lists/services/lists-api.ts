import { API_BASE_URL } from '@/src/constants/api';
import { List } from '../types';
import { CreateListSchema, UpdateListSchema } from '../schemas/list-schema';

export const listsApi = {
  async getAll(userId: string): Promise<List[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/lists?userId=${userId}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Failed to fetch lists: ${response.status} ${errorText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Network Error:', error);
      throw error;
    }
  },

  async getById(id: string, userId: string): Promise<List> {
    try {
      const response = await fetch(`${API_BASE_URL}/lists/${id}?userId=${userId}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Failed to fetch list: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Network Error:', error);
      throw error;
    }
  },

  async create(data: CreateListSchema): Promise<List> {
    try {
      const response = await fetch(`${API_BASE_URL}/lists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Failed to create list: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Network Error:', error);
      throw error;
    }
  },

  async update(id: string, userId: string, data: UpdateListSchema): Promise<List> {
    try {
      const response = await fetch(`${API_BASE_URL}/lists/${id}?userId=${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Failed to update list: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Network Error:', error);
      throw error;
    }
  },

  async delete(id: string, userId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/lists/${id}?userId=${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Failed to delete list: ${response.status}`);
      }
    } catch (error) {
      console.error('Network Error:', error);
      throw error;
    }
  },
};
