import apiClient from '../axios';
import { ProductAttributeResponse } from '@/lib/api/types/product-attribute.types';

export const productAttributeService = {
  getAllProductAttributes: async (params?: {
    page?: number;
    size?: number;
    sort?: string;
    direction?: 'ASC' | 'DESC';
    filters?: {
      dataType?: string;
      isRequired?: boolean;
      is_active?: boolean | "deleted";
      searchText?: string;
    };
  }): Promise<ProductAttributeResponse> => {
    const response = await apiClient.get('/product-attributes/get-all', { params });
    return response.data;
  },

  getActiveProductAttributes: async (): Promise<any> => {
    const response = await apiClient.get('/product-attributes/active');
    return response.data;
  },

  getProductAttributeById: async (attributeId: string) => {
    const response = await apiClient.get(`/product-attributes/${attributeId}`);
    return response.data;
  },

  createProductAttribute: async (data: any) => {
    const response = await apiClient.post('/product-attributes/create', data);
    return response.data;
  },

  updateProductAttribute: async (attributeId: string, data: any) => {
    const response = await apiClient.post(`/product-attributes/${attributeId}/update`, data);
    return response.data;
  },

  deleteProductAttribute: async (attributeId: string) => {
    const response = await apiClient.post(`/product-attributes/${attributeId}/delete`);
    return response.data;
  },

  updateProductAttributeStatus: async (attributeId: string, isActive: boolean) => {
    const response = await apiClient.post(`/product-attributes/${attributeId}/status`, {
      is_active: isActive
    });
    return response.data;
  }
};
