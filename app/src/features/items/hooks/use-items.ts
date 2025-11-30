import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsApi } from '../services/items-api';
import { CreateItemSchema, UpdateItemSchema } from '../schemas/item-schema';
import { Item } from '../types';

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
    onSuccess: (newItem, variables) => {
      // Add the new item to the cache instead of refetching
      queryClient.setQueryData<Item[]>([ITEMS_QUERY_KEY, variables.listId], old => {
        if (!old) return [newItem];
        return [newItem, ...old];
      });
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, listId }: { id: string; data: UpdateItemSchema; listId: string }) =>
      itemsApi.update(id, data),
    onSuccess: (updatedItem, variables) => {
      // Update the item in the cache instead of refetching
      queryClient.setQueryData<Item[]>([ITEMS_QUERY_KEY, variables.listId], old => {
        if (!old) return old;
        return old.map(item => (item.id === updatedItem.id ? updatedItem : item));
      });
    },
  });
}

export function useToggleItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, listId }: { id: string; listId: string }) => itemsApi.toggleChecked(id),
    // Optimistic update for instant UI response
    onMutate: async ({ id, listId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [ITEMS_QUERY_KEY, listId] });

      // Snapshot the previous value
      const previousItems = queryClient.getQueryData<Item[]>([ITEMS_QUERY_KEY, listId]);

      // Optimistically update the cache
      queryClient.setQueryData<Item[]>([ITEMS_QUERY_KEY, listId], old => {
        if (!old) return old;
        return old.map(item => (item.id === id ? { ...item, checked: !item.checked } : item));
      });

      // Return context with the snapshot
      return { previousItems, listId };
    },
    // If mutation fails, roll back to the previous value
    onError: (err, variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData([ITEMS_QUERY_KEY, context.listId], context.previousItems);
      }
    },
    // On success, update with the server response
    onSuccess: (data, variables) => {
      queryClient.setQueryData<Item[]>([ITEMS_QUERY_KEY, variables.listId], old => {
        if (!old) return old;
        return old.map(item => (item.id === data.id ? data : item));
      });
    },
  });
}

export function useUpdateQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, quantity, listId }: { id: string; quantity: number; listId: string }) =>
      itemsApi.updateQuantity(id, quantity),
    // Optimistic update for instant UI response
    onMutate: async ({ id, quantity, listId }) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: [ITEMS_QUERY_KEY, listId] });

      // Snapshot the previous value
      const previousItems = queryClient.getQueryData<Item[]>([ITEMS_QUERY_KEY, listId]);

      // Optimistically update the cache
      queryClient.setQueryData<Item[]>([ITEMS_QUERY_KEY, listId], old => {
        if (!old) return old;
        return old.map(item => (item.id === id ? { ...item, quantity } : item));
      });

      // Return context with the snapshot
      return { previousItems, listId };
    },
    // If mutation fails, roll back to the previous value
    onError: (err, variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData([ITEMS_QUERY_KEY, context.listId], context.previousItems);
      }
    },
    // On success, update with the server response to stay in sync
    onSuccess: (data, variables) => {
      queryClient.setQueryData<Item[]>([ITEMS_QUERY_KEY, variables.listId], old => {
        if (!old) return old;
        return old.map(item => (item.id === data.id ? data : item));
      });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, listId }: { id: string; listId: string }) => itemsApi.delete(id),
    onSuccess: (_, variables) => {
      // Remove the item from the cache instead of refetching
      queryClient.setQueryData<Item[]>([ITEMS_QUERY_KEY, variables.listId], old => {
        if (!old) return old;
        return old.filter(item => item.id !== variables.id);
      });
    },
  });
}

export function useUploadItemImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, imageUri, listId }: { id: string; imageUri: string; listId: string }) =>
      itemsApi.uploadImage(id, imageUri),
    onSuccess: (data, variables) => {
      // Update the item in the cache with the new image URL
      queryClient.setQueryData<Item[]>([ITEMS_QUERY_KEY, variables.listId], old => {
        if (!old) return old;
        return old.map(item =>
          item.id === variables.id ? { ...item, imageUrl: data.imageUrl } : item,
        );
      });
    },
  });
}

export function useDeleteItemImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, listId }: { id: string; listId: string }) => itemsApi.deleteImage(id),
    onSuccess: (_, variables) => {
      // Remove the image URL from the item in the cache
      queryClient.setQueryData<Item[]>([ITEMS_QUERY_KEY, variables.listId], old => {
        if (!old) return old;
        return old.map(item =>
          item.id === variables.id ? { ...item, imageUrl: undefined } : item,
        );
      });
    },
  });
}
