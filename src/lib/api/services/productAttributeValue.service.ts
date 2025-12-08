import apiClient from '../axios';
import {
  ProductAttributeValue,
  CreateProductAttributeValueRequest,
  UpdateProductAttributeValueRequest,
  BulkUpdateProductAttributeValueRequest,
  BulkUpdateProductAttributeValuesRequest,
} from '../types/product.types';
import { ApiResponse } from '../types/common.types';

const API_URL = '/product-attribute-values';

export const productAttributeValueService = {
  // Lấy tất cả thuộc tính của một sản phẩm
  getProductAttributeValues: async (productId: string): Promise<ApiResponse<ProductAttributeValue[]>> => {
    const response = await apiClient.get(`${API_URL}/product/${productId}`);
    return response.data;
  },

  // Tạo thuộc tính mới cho sản phẩm
  createProductAttributeValue: async (data: CreateProductAttributeValueRequest): Promise<ApiResponse<ProductAttributeValue>> => {
    const response = await apiClient.post(API_URL, data);
    return response.data;
  },

  // Cập nhật thuộc tính sản phẩm
  updateProductAttributeValue: async (id: string, data: UpdateProductAttributeValueRequest): Promise<ApiResponse<ProductAttributeValue>> => {
    const response = await apiClient.put(`${API_URL}/${id}`, data);
    return response.data;
  },

  // Xóa thuộc tính sản phẩm
  deleteProductAttributeValue: async (id: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete(`${API_URL}/${id}`);
    return response.data;
  },

  // Tạo nhiều thuộc tính cùng lúc cho sản phẩm
  createMultipleProductAttributeValues: async (productId: string, attributeValues: CreateProductAttributeValueRequest[]): Promise<ApiResponse<ProductAttributeValue[]>> => {
    // Map to backend format
    const bulkUpdateRequest = {
      attribute_values: attributeValues.map(attr => ({
        attribute_id: attr.attribute_id,
        value_text: attr.value_text,
        value_number: attr.value_number,
        operation: attr.operation || 'CREATE' // Default to CREATE for new attributes
      }))
    };
    
    console.log("createMultipleProductAttributeValues request:", {
      url: `${API_URL}/products/${productId}/bulk-update`,
      productId,
      attributeValues: attributeValues.length,
      bulkUpdateRequest
    });
    
    const response = await apiClient.post(`${API_URL}/products/${productId}/bulk-update`, bulkUpdateRequest);
    return response.data;
  },

  // Cập nhật tất cả thuộc tính của sản phẩm (replace all) - Sử dụng API mới
  updateAllProductAttributeValues: async (productId: string, attributeValues: CreateProductAttributeValueRequest[]): Promise<ApiResponse<ProductAttributeValue[]>> => {
    // Chuyển đổi sang format API mới
    const bulkUpdateRequest: BulkUpdateProductAttributeValuesRequest = {
      attribute_values: attributeValues.map(attr => ({
        attribute_id: attr.attribute_id,
        value_text: attr.value_text,
        value_number: attr.value_number,
        operation: undefined // Sử dụng default behavior: UPDATE if exists, CREATE if not
      }))
    };

    const response = await apiClient.post(`${API_URL}/products/${productId}/bulk-update`, bulkUpdateRequest);
    return response.data;
  },

  // Cập nhật thuộc tính sản phẩm với operation cụ thể
  bulkUpdateProductAttributeValuesByProduct: async (
    productId: string, 
    attributeValues: Array<{
      attribute_id: string;
      value_text?: string | null;
      value_number?: number | null;
      operation?: 'DELETE'; // Chỉ hỗ trợ DELETE
    }>
  ): Promise<ApiResponse<ProductAttributeValue[]>> => {
    const bulkUpdateRequest: BulkUpdateProductAttributeValuesRequest = {
      attribute_values: attributeValues.map(attr => ({
        attribute_id: attr.attribute_id,
        value_text: attr.value_text,
        value_number: attr.value_number,
        operation: attr.operation || undefined // Chỉ gửi khi có giá trị
      }))
    };

    const response = await apiClient.post(`${API_URL}/products/${productId}/bulk-update`, bulkUpdateRequest);
    return response.data;
  },
};
