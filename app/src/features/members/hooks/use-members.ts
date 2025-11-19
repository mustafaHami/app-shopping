import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membersApi } from '../services/members-api';
import type {
  CreateInvitationInput,
  UpdateMemberRoleInput,
  UpdateInvitationInput,
} from '../schemas/member-schema';

export const useListMembers = (listId: string) => {
  return useQuery({
    queryKey: ['members', 'list', listId],
    queryFn: () => membersApi.getListMembers(listId),
    enabled: !!listId,
  });
};

export const useSendInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, data }: { listId: string; data: CreateInvitationInput }) =>
      membersApi.sendInvitation(listId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['members', 'list', variables.listId] });
    },
  });
};

export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      listId,
      memberId,
      data,
    }: {
      listId: string;
      memberId: string;
      data: UpdateMemberRoleInput;
    }) => membersApi.updateMemberRole(listId, memberId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['members', 'list', variables.listId] });
    },
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, memberId }: { listId: string; memberId: string }) =>
      membersApi.removeMember(listId, memberId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['members', 'list', variables.listId] });
    },
  });
};

export const useMyInvitations = () => {
  return useQuery({
    queryKey: ['invitations', 'my'],
    queryFn: () => membersApi.getMyInvitations(),
  });
};

export const useUpdateInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invitationId, data }: { invitationId: string; data: UpdateInvitationInput }) =>
      membersApi.updateInvitation(invitationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
};

export const useCancelInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, invitationId }: { listId: string; invitationId: string }) =>
      membersApi.cancelInvitation(listId, invitationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['members', 'list', variables.listId] });
    },
  });
};
