import apiClient from '../axios';
import { ProductTypeResponse } from '@/lib/api/types/product.types';

export const productTypeService = {
  getAllProductTypes: async (params?: {
    page?: number;
    size?: number;
    sort?: string;
    direction?: 'ASC' | 'DESC';
    filters?: {
      categoryId?: string;
      is_active?: boolean | "deleted";
      searchText?: string;
    };
  }): Promise<ProductTypeResponse> => {
    const response = await apiClient.get('/product-types', { params });
    return response.data;
  },

  getProductTypeById: async (productTypeId: string) => {
    const response = await apiClient.get(`/product-types/${productTypeId}`);
    return response.data;
  },

  createProductType: async (data: any) => {
    const response = await apiClient.post('/product-types', data);
    return response.data;
  },

  updateProductType: async (productTypeId: string, data: any) => {
    const response = await apiClient.put(`/product-types/${productTypeId}`, data);
    return response.data;
  },

  deleteProductType: async (productTypeId: string) => {
    const response = await apiClient.delete(`/product-types/${productTypeId}`);
    return response.data;
  },

  updateProductTypeStatus: async (productTypeId: string, isActive: boolean) => {
    const response = await apiClient.patch(`/product-types/${productTypeId}/status`, {
      is_active: isActive
    });
    return response.data;
  }
};
