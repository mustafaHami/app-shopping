import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '../services/categories-api';

const CATEGORIES_QUERY_KEY = 'categories';

export function useCategories(userId: string) {
  return useQuery({
    queryKey: [CATEGORIES_QUERY_KEY, userId],
    queryFn: () => categoriesApi.getAll(userId),
    enabled: !!userId,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, userId }: { name: string; userId: string }) =>
      categoriesApi.create(name, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
    },
  });
}
