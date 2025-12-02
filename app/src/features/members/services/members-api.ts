import { apiClient } from '@/src/lib/api-client';
import type { ListMembersData, Invitation, ListMember } from '../types';
import type {
  CreateInvitationInput,
  UpdateMemberRoleInput,
  UpdateInvitationInput,
} from '../schemas/member-schema';

export const membersApi = {
  getListMembers: async (listId: string): Promise<ListMembersData> => {
    return apiClient<ListMembersData>(`/members/lists/${listId}`);
  },

  searchUserByPseudonym: async (pseudonym: string): Promise<{ pseudonym: string }> => {
    return apiClient<{ pseudonym: string }>(
      `/members/search?pseudonym=${encodeURIComponent(pseudonym)}`,
    );
  },

  sendInvitation: async (listId: string, data: CreateInvitationInput): Promise<Invitation> => {
    return apiClient<Invitation>(`/members/lists/${listId}/invitations`, {
      method: 'POST',
      body: data,
    });
  },

  updateMemberRole: async (
    listId: string,
    memberId: string,
    data: UpdateMemberRoleInput,
  ): Promise<ListMember> => {
    return apiClient<ListMember>(`/members/lists/${listId}/members/${memberId}`, {
      method: 'PATCH',
      body: data,
    });
  },

  removeMember: async (listId: string, memberId: string): Promise<{ message: string }> => {
    return apiClient<{ message: string }>(`/members/lists/${listId}/members/${memberId}`, {
      method: 'DELETE',
    });
  },

  getMyInvitations: async (): Promise<Invitation[]> => {
    return apiClient<Invitation[]>('/members/invitations');
  },

  updateInvitation: async (
    invitationId: string,
    data: UpdateInvitationInput,
  ): Promise<Invitation> => {
    return apiClient<Invitation>(`/members/invitations/${invitationId}`, {
      method: 'PATCH',
      body: data,
    });
  },

  cancelInvitation: async (listId: string, invitationId: string): Promise<{ message: string }> => {
    return apiClient<{ message: string }>(`/members/lists/${listId}/invitations/${invitationId}`, {
      method: 'DELETE',
    });
  },
};
