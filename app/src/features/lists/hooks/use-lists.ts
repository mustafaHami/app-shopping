import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listsApi } from '../services/lists-api';
import { CreateListSchema, UpdateListSchema } from '../schemas/list-schema';

const LISTS_QUERY_KEY = 'lists';

export function useLists() {
  return useQuery({
    queryKey: [LISTS_QUERY_KEY],
    queryFn: () => listsApi.getAll(),
  });
}

export function useList(id: string) {
  return useQuery({
    queryKey: [LISTS_QUERY_KEY, id],
    queryFn: () => listsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateListSchema) => listsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LISTS_QUERY_KEY] });
    },
  });
}

export function useUpdateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateListSchema }) => listsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [LISTS_QUERY_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: [LISTS_QUERY_KEY] });
    },
  });
}

export function useDeleteList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => listsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LISTS_QUERY_KEY] });
    },
  });
}
