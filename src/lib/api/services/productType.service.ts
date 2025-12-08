import apiClient from '../axios';
import { 
  ProductTypeResponse, 
  ProductType, 
  CreateProductTypeRequest, 
  UpdateProductTypeRequest, 
  UpdateProductTypeStatusRequest,
  ProductTypeSearchParams 
} from '@/lib/api/types/product.types';

export const productTypeService = {
  // Get all product types with pagination and filters
  getAllProductTypes: async (params: ProductTypeSearchParams = {}): Promise<ProductTypeResponse> => {
    const response = await apiClient.get('/product-types/get-all', { params });
    return response.data;
  },

  // Get product type by ID
  getProductTypeById: async (productTypeId: string): Promise<ProductType> => {
    const response = await apiClient.get(`/product-types/${productTypeId}`);
    return response.data.data;
  },

  // Create new product type
  createProductType: async (data: CreateProductTypeRequest): Promise<ProductType> => {
    const response = await apiClient.post("/product-types/create", data);
    return response.data.data;
  },

  // Update product type
  updateProductType: async (
    productTypeId: string,
    data: UpdateProductTypeRequest
  ): Promise<ProductType> => {
    const response = await apiClient.post(`/product-types/${productTypeId}/update`, data);
    return response.data.data;
  },

  // Update product type status
  updateProductTypeStatus: async (
    productTypeId: string,
    data: UpdateProductTypeStatusRequest
  ): Promise<ProductType> => {
    const response = await apiClient.post(`/product-types/${productTypeId}/status`, data);
    return response.data.data;
  },

  // Delete product type (soft delete)
  deleteProductType: async (productTypeId: string): Promise<void> => {
    await apiClient.post(`/product-types/${productTypeId}/delete`);
  },

  // Get active product types only
  getActiveProductTypes: async (): Promise<ProductType[]> => {
    const response = await apiClient.get("/product-types/active");
    return response.data.data;
  },
};