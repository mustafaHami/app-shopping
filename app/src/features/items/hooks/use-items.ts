import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsApi } from '../services/items-api';
import { CreateItemSchema, UpdateItemSchema } from '../schemas/item-schema';

const ITEMS_QUERY_KEY = 'items';

export function useItems(listId: string, userId: string) {
  return useQuery({
    queryKey: [ITEMS_QUERY_KEY, listId, userId],
    queryFn: () => itemsApi.getAll(listId, userId),
    enabled: !!listId && !!userId,
  });
}

export function useItem(id: string, userId: string) {
  return useQuery({
    queryKey: [ITEMS_QUERY_KEY, id, userId],
    queryFn: () => itemsApi.getById(id, userId),
    enabled: !!id && !!userId,
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, userId }: { data: CreateItemSchema; userId: string }) =>
      itemsApi.create(data, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [ITEMS_QUERY_KEY, variables.data.listId],
      });
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      userId,
      data,
      listId,
    }: {
      id: string;
      userId: string;
      data: UpdateItemSchema;
      listId: string;
    }) => itemsApi.update(id, userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [ITEMS_QUERY_KEY, variables.listId],
      });
    },
  });
}

export function useToggleItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId, listId }: { id: string; userId: string; listId: string }) =>
      itemsApi.toggleChecked(id, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [ITEMS_QUERY_KEY, variables.listId],
      });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId, listId }: { id: string; userId: string; listId: string }) =>
      itemsApi.delete(id, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [ITEMS_QUERY_KEY, variables.listId],
      });
    },
  });
}
