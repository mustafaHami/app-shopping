import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsApi } from '../services/items-api';
import { CreateItemSchema, UpdateItemSchema } from '../schemas/item-schema';

const ITEMS_QUERY_KEY = 'items';

export function useItems(listId: string) {
  return useQuery({
    queryKey: [ITEMS_QUERY_KEY, listId],
    queryFn: () => itemsApi.getAll(listId),
    enabled: !!listId,
  });
}

export function useItem(id: string) {
  return useQuery({
    queryKey: [ITEMS_QUERY_KEY, id],
    queryFn: () => itemsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateItemSchema) => itemsApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [ITEMS_QUERY_KEY, variables.listId],
      });
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, listId }: { id: string; data: UpdateItemSchema; listId: string }) =>
      itemsApi.update(id, data),
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
    mutationFn: ({ id, listId }: { id: string; listId: string }) => itemsApi.toggleChecked(id),
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
    mutationFn: ({ id, listId }: { id: string; listId: string }) => itemsApi.delete(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [ITEMS_QUERY_KEY, variables.listId],
      });
    },
  });
}
