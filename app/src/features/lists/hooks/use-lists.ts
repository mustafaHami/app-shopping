import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listsApi } from '../services/lists-api';
import { CreateListSchema, UpdateListSchema } from '../schemas/list-schema';

const LISTS_QUERY_KEY = 'lists';

export function useLists(userId: string) {
  return useQuery({
    queryKey: [LISTS_QUERY_KEY, userId],
    queryFn: () => listsApi.getAll(userId),
    enabled: !!userId,
  });
}

export function useList(id: string, userId: string) {
  return useQuery({
    queryKey: [LISTS_QUERY_KEY, id, userId],
    queryFn: () => listsApi.getById(id, userId),
    enabled: !!id && !!userId,
  });
}

export function useCreateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateListSchema) => listsApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [LISTS_QUERY_KEY, variables.ownerId] });
    },
  });
}

export function useUpdateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId, data }: { id: string; userId: string; data: UpdateListSchema }) =>
      listsApi.update(id, userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [LISTS_QUERY_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: [LISTS_QUERY_KEY, variables.userId] });
    },
  });
}

export function useDeleteList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) => listsApi.delete(id, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [LISTS_QUERY_KEY, variables.userId] });
    },
  });
}
