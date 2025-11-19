import { z } from 'zod';

export const roleSchema = z.enum(['READER', 'WRITER']);

export const createInvitationSchema = z.object({
  inviteeEmail: z.string().email(),
  role: roleSchema,
});

export const updateMemberRoleSchema = z.object({
  role: roleSchema,
});

export const updateInvitationSchema = z.object({
  status: z.enum(['ACCEPTED', 'DECLINED']),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type UpdateInvitationInput = z.infer<typeof updateInvitationSchema>;
