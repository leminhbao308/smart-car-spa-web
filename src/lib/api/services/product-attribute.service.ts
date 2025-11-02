/**
 * Product Attribute Management Service
 * Handles all product attribute-related API calls
 */

import apiClient from "../axios";
import {
  ProductAttributeInfoDto,
  ProductAttributeFilterParam,
  CreateProductAttributeRequest,
  UpdateProductAttributeRequest,
  UpdateProductAttributeStatusRequest,
  ProductAttributeStatsDto,
} from "../types";

export class ProductAttributeService {
  /**
   * Get all product attributes with pagination and filtering
   */
  static async getAllProductAttributes(
    filterParam?: ProductAttributeFilterParam
  ): Promise<ProductAttributeInfoDto[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filterParam) {
        if (filterParam.page !== undefined) {
          queryParams.append("page", filterParam.page.toString());
        }
        if (filterParam.size !== undefined) {
          queryParams.append("size", filterParam.size.toString());
        }
        if (filterParam.attributeName) {
          queryParams.append("attributeName", filterParam.attributeName);
        }
        if (filterParam.attributeCode) {
          queryParams.append("attributeCode", filterParam.attributeCode);
        }
        if (filterParam.dataType) {
          queryParams.append("dataType", filterParam.dataType);
        }
        if (filterParam.isRequired !== undefined) {
          queryParams.append("isRequired", filterParam.isRequired.toString());
        }
        if (filterParam.isActive !== undefined) {
          queryParams.append("isActive", filterParam.isActive.toString());
        }
        if (filterParam.search) {
          queryParams.append("search", filterParam.search);
        }
      }

      const url = `/product-attributes/get-all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(url);

      if (response.data.success) {
        return response.data.data || response.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch product attributes");
      }
    } catch (error) {
      console.log("Get all product attributes error:", error);
      throw error;
    }
  }

  /**
   * Get product attribute by ID
   */
  static async getProductAttributeById(attributeId: string): Promise<ProductAttributeInfoDto> {
    try {
      const response = await apiClient.get(`/product-attributes/${attributeId}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch product attribute");
      }
    } catch (error) {
      console.log("Get product attribute by ID error:", error);
      throw error;
    }
  }

  /**
   * Get product attribute by code
   */
  static async getProductAttributeByCode(attributeCode: string): Promise<ProductAttributeInfoDto> {
    try {
      const response = await apiClient.get(`/product-attributes/code/${attributeCode}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch product attribute");
      }
    } catch (error) {
      console.log("Get product attribute by code error:", error);
      throw error;
    }
  }

  /**
   * Get product attributes by data type
   */
  static async getProductAttributesByDataType(dataType: string): Promise<ProductAttributeInfoDto[]> {
    try {
      const response = await apiClient.get(`/product-attributes/data-type/${dataType}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch product attributes by data type");
      }
    } catch (error) {
      console.log("Get product attributes by data type error:", error);
      throw error;
    }
  }

  /**
   * Get required product attributes
   */
  static async getRequiredProductAttributes(): Promise<ProductAttributeInfoDto[]> {
    try {
      const response = await apiClient.get("/product-attributes/required");

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch required product attributes");
      }
    } catch (error) {
      console.log("Get required product attributes error:", error);
      throw error;
    }
  }

  /**
   * Get active product attributes
   */
  static async getActiveProductAttributes(): Promise<ProductAttributeInfoDto[]> {
    try {
      const response = await apiClient.get("/product-attributes/active");

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch active product attributes");
      }
    } catch (error) {
      console.log("Get active product attributes error:", error);
      throw error;
    }
  }

  /**
   * Create new product attribute
   */
  static async createProductAttribute(
    attributeData: CreateProductAttributeRequest
  ): Promise<ProductAttributeInfoDto> {
    try {
      console.log("Creating product attribute with data:", attributeData);

      const response = await apiClient.post("/product-attributes/create", attributeData);
      console.log("Create product attribute API response:", response);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to create product attribute");
      }
    } catch (error) {
      console.log("Create product attribute error:", error);
      throw error;
    }
  }

  /**
   * Update existing product attribute
   */
  static async updateProductAttribute(
    attributeId: string,
    attributeData: UpdateProductAttributeRequest
  ): Promise<ProductAttributeInfoDto> {
    try {
      console.log("Updating product attribute with data:", attributeData);

      const response = await apiClient.post(`/product-attributes/${attributeId}/update`, attributeData);
      console.log("Update product attribute API response:", response);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to update product attribute");
      }
    } catch (error) {
      console.log("Update product attribute error:", error);
      throw error;
    }
  }

  /**
   * Delete product attribute (soft delete)
   */
  static async deleteProductAttribute(attributeId: string): Promise<void> {
    try {
      console.log("Deleting product attribute with ID:", attributeId);

      const response = await apiClient.post(`/product-attributes/${attributeId}/delete`);
      console.log("Delete product attribute API response:", response);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete product attribute");
      }
    } catch (error) {
      console.log("Delete product attribute error:", error);
      throw error;
    }
  }

  /**
   * Update product attribute status (isActive) only
   */
  static async updateProductAttributeStatus(
    attributeId: string,
    statusData: UpdateProductAttributeStatusRequest
  ): Promise<ProductAttributeInfoDto> {
    try {
      console.log("Updating product attribute status with data:", statusData);

      const response = await apiClient.post(`/product-attributes/${attributeId}/status`, statusData);
      console.log("Update product attribute status API response:", response);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to update product attribute status");
      }
    } catch (error) {
      console.log("Update product attribute status error:", error);
      throw error;
    }
  }

  /**
   * Validate product attribute code
   */
  static async validateProductAttributeCode(attributeCode: string): Promise<boolean> {
    try {
      const response = await apiClient.get(`/product-attributes/validate-code?code=${encodeURIComponent(attributeCode)}`);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to validate product attribute code");
      }
    } catch (error) {
      console.log("Validate product attribute code error:", error);
      throw error;
    }
  }

  /**
   * Get product attribute statistics
   */
  static async getProductAttributeStatistics(): Promise<ProductAttributeStatsDto> {
    try {
      const response = await apiClient.get("/product-attributes/statistics");

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch product attribute statistics");
      }
    } catch (error) {
      console.log("Get product attribute statistics error:", error);
      throw error;
    }
  }
}
