import apiClient from '../axios';
import { ApiResponse } from '@/lib/api/types/common.types';

export interface Category {
  category_id: string;
  category_name: string;
  category_code: string;
  description?: string;
  is_active: boolean;
  created_date: string;
  modified_date: string;
  created_by: string;
  modified_by: string;
}

export interface CategoryResponse {
  content: Category[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

export const categoryService = {
  getAllCategories: async (params?: {
    page?: number;
    size?: number;
    sort?: string;
    direction?: 'ASC' | 'DESC';
    filters?: {
      is_active?: boolean;
      searchText?: string;
    };
  }): Promise<ApiResponse<CategoryResponse>> => {
    const response = await apiClient.get('/categories/get-all', { params });
    return response.data;
  },

  getActiveCategories: async (): Promise<ApiResponse<Category[]>> => {
    const response = await apiClient.get('/categories/active');
    return response.data;
  },

  getCategoryById: async (categoryId: string): Promise<ApiResponse<Category>> => {
    const response = await apiClient.get(`/categories/${categoryId}`);
    return response.data;
  },

  createCategory: async (data: any): Promise<ApiResponse<Category>> => {
    const response = await apiClient.post('/categories', data);
    return response.data;
  },

  updateCategory: async (categoryId: string, data: any): Promise<ApiResponse<Category>> => {
    const response = await apiClient.put(`/categories/${categoryId}`, data);
    return response.data;
  },

  deleteCategory: async (categoryId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/categories/${categoryId}`);
    return response.data;
  },

  updateCategoryStatus: async (categoryId: string, isActive: boolean): Promise<ApiResponse<Category>> => {
    const response = await apiClient.patch(`/categories/${categoryId}/status`, {
      is_active: isActive
    });
    return response.data;
  }
};