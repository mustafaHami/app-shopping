import { z } from 'zod';

export const itemSchema = z.object({
  id: z.string().uuid(),
  listId: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  unit: z.string().optional(),
  notes: z.string().optional(),
  category: z.string().optional(),
  checked: z.boolean(),
  position: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  unit: z.string().optional(),
  notes: z.string().optional(),
  category: z.string().optional(),
  listId: z.string().uuid(),
});

export const updateItemSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0').optional(),
  unit: z.string().optional(),
  notes: z.string().optional(),
  category: z.string().optional(),
  checked: z.boolean().optional(),
});

export type ItemSchema = z.infer<typeof itemSchema>;
export type CreateItemSchema = z.infer<typeof createItemSchema>;
export type UpdateItemSchema = z.infer<typeof updateItemSchema>;
