import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../services/category.service';
import { Category, CategoryResponse } from '@/lib/api/services/category.service';
import { ApiResponse } from '@/lib/api/types/common.types';

export const useCategories = (params?: {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
  filters?: {
    is_active?: boolean;
    searchText?: string;
  };
}) => {
  return useQuery<ApiResponse<CategoryResponse>>({
    queryKey: ['categories', params],
    queryFn: () => categoryService.getAllCategories(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useActiveCategories = () => {
  return useQuery<ApiResponse<CategoryResponse>>({
    queryKey: ['activeCategories'],
    queryFn: () => categoryService.getActiveCategories(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCategory = (categoryId: string | null) => {
  return useQuery<ApiResponse<Category>>({
    queryKey: ['category', categoryId],
    queryFn: () => categoryService.getCategoryById(categoryId!),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
