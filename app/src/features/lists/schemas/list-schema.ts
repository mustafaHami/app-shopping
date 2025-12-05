import { z } from 'zod';

export const listSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  ownerId: z.string().uuid(),
  createdAt: z.string(),
  updatedAt: z.string(),
  items: z.array(z.any()).optional(),
  members: z.array(z.any()).optional(),
});

export const invitationItemSchema = z.object({
  inviteePseudonym: z.string().min(1, 'Pseudonym is required'),
  role: z.enum(['READER', 'WRITER']),
});

export const createListSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  invitations: z.array(invitationItemSchema).optional(),
});

export const updateListSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
});

export type ListSchema = z.infer<typeof listSchema>;
export type InvitationItem = z.infer<typeof invitationItemSchema>;
export type CreateListSchema = z.infer<typeof createListSchema>;
export type UpdateListSchema = z.infer<typeof updateListSchema>;
