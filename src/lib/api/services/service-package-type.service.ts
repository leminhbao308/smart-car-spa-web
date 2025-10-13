/**
 * Service Package Type Management Service
 * Handles all service package type-related API calls
 */

import apiClient from "../axios";
import {
  ServicePackageType,
  ServicePackageTypePaginatedResponse,
  CreateServicePackageTypeRequest,
  UpdateServicePackageTypeRequest,
  UpdateServicePackageTypeStatusRequest,
  ServicePackageTypeFilterParam,
} from "../types/service-package-type.types";

export const servicePackageTypeService = {
  /**
   * Get all service package types with pagination
   */
  getAllServicePackageTypes: async (
    filterParam: ServicePackageTypeFilterParam = {}
  ): Promise<ServicePackageTypePaginatedResponse> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filterParam.page !== undefined) {
        queryParams.append("page", filterParam.page.toString());
      }
      if (filterParam.size !== undefined) {
        queryParams.append("size", filterParam.size.toString());
      }
      if (filterParam.sort) {
        queryParams.append("sort", filterParam.sort);
      }
      if (filterParam.direction) {
        queryParams.append("direction", filterParam.direction);
      }
      if (filterParam.search) {
        queryParams.append("search", filterParam.search);
      }
      if (filterParam.status) {
        queryParams.append("status", filterParam.status);
      }
      if (filterParam.customerType) {
        queryParams.append("customerType", filterParam.customerType);
      }

      const response = await apiClient.get(
        `/service-package-types/get-all?${queryParams.toString()}`
      );

      if (response.data.success && response.data.data) {
        // Data is already in snake_case format from backend
        return response.data;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch service package types"
        );
      }
    } catch (error: unknown) {
      console.log("Get all service package types error:", error);

      if (error && typeof error === "object" && "response" in error) {
        const errorResponse = error as { response?: { status?: number } };
        if (errorResponse.response?.status === 500) {
          throw new Error("Lỗi máy chủ. Vui lòng thử lại sau.");
        } else if (errorResponse.response?.status === 401) {
          throw new Error(
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
          );
        } else if (errorResponse.response?.status === 403) {
          throw new Error("Bạn không có quyền truy cập tài nguyên này.");
        }
      }
      throw error;
    }
  },

  /**
   * Get service package type by ID
   */
  getServicePackageTypeById: async (servicePackageTypeId: string): Promise<ServicePackageType> => {
    try {
      const response = await apiClient.get(`/service-package-types/${servicePackageTypeId}`);

      if (response.data.success && response.data.data) {
        // Data is already in camelCase format from backend, no conversion needed
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch service package type"
        );
      }
    } catch (error: unknown) {
      console.log("Get service package type by ID error:", error);

      if (error && typeof error === "object" && "response" in error) {
        const errorResponse = error as { response?: { status?: number } };
        if (errorResponse.response?.status === 404) {
          throw new Error("Không tìm thấy loại gói dịch vụ.");
        } else if (errorResponse.response?.status === 401) {
          throw new Error(
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
          );
        }
      }
      throw error;
    }
  },

  /**
   * Get service package type by code
   */
  getServicePackageTypeByCode: async (code: string): Promise<ServicePackageType> => {
    try {
      const response = await apiClient.get(`/service-package-types/code/${code}`);

      if (response.data.success && response.data.data) {
        // Data is already in camelCase format from backend, no conversion needed
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch service package type"
        );
      }
    } catch (error: unknown) {
      console.log("Get service package type by code error:", error);
      throw error;
    }
  },

  /**
   * Get active service package types
   */
  getActiveServicePackageTypes: async (): Promise<ServicePackageType[]> => {
    try {
      const response = await apiClient.get("/service-package-types/active");

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch active service package types"
        );
      }
    } catch (error: unknown) {
      console.log("Get active service package types error:", error);
      throw error;
    }
  },

  /**
   * Get default service package type
   */
  getDefaultServicePackageType: async (): Promise<ServicePackageType> => {
    try {
      const response = await apiClient.get("/service-package-types/default");

      if (response.data.success && response.data.data) {
        // Data is already in camelCase format from backend, no conversion needed
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch default service package type"
        );
      }
    } catch (error: unknown) {
      console.log("Get default service package type error:", error);
      throw error;
    }
  },

  /**
   * Create new service package type
   */
  createServicePackageType: async (
    data: CreateServicePackageTypeRequest
  ): Promise<ServicePackageType> => {
    try {
      // Data is already in snake_case format
      const apiData = data;
      const response = await apiClient.post("/service-package-types/create", apiData);

      console.log("Create service package type API response:", response);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Failed to create service package type"
        );
      }
    } catch (error: unknown) {
      console.log("Create service package type error:", error);

      if (error && typeof error === "object" && "response" in error) {
        const errorResponse = error as {
          response?: { status?: number; data?: { message?: string } };
        };
        if (errorResponse.response?.status === 400) {
          const errorMessage =
            errorResponse.response.data?.message ||
            "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.";
          throw new Error(errorMessage);
        } else if (errorResponse.response?.status === 409) {
          const errorMessage =
            errorResponse.response.data?.message ||
            "Loại gói dịch vụ đã tồn tại trong hệ thống.";
          throw new Error(errorMessage);
        } else if (errorResponse.response?.status === 500) {
          throw new Error("Lỗi máy chủ. Vui lòng thử lại sau.");
        } else if (errorResponse.response?.status === 401) {
          throw new Error(
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
          );
        } else if (errorResponse.response?.status === 403) {
          throw new Error("Bạn không có quyền thực hiện thao tác này.");
        }
      }
      const errorMessage =
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : "Không thể tạo loại gói dịch vụ. Vui lòng thử lại.";
      throw new Error(errorMessage);
    }
  },

  /**
   * Update service package type
   */
  updateServicePackageType: async (
    servicePackageTypeId: string,
    data: UpdateServicePackageTypeRequest
  ): Promise<ServicePackageType> => {
    try {
      console.log("Updating service package type with data:", data);

      // Data is already in snake_case format
      const apiData = data;
      const response = await apiClient.post(
        `/service-package-types/${servicePackageTypeId}/update`,
        apiData
      );

      console.log("Update service package type API response:", response);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Failed to update service package type"
        );
      }
    } catch (error: unknown) {
      console.error("Update service package type error:", error);

      const errorMessage =
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : "Không thể cập nhật loại gói dịch vụ. Vui lòng thử lại.";
      throw new Error(errorMessage);
    }
  },

  /**
   * Update service package type status
   */
  updateServicePackageTypeStatus: async (
    servicePackageTypeId: string,
    data: UpdateServicePackageTypeStatusRequest
  ): Promise<void> => {
    try {
      const response = await apiClient.post(
        `/service-package-types/${servicePackageTypeId}/status`,
        data
      );

      console.log("Update service package type status response:", response.data);

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to update service package type status"
        );
      }
    } catch (error: unknown) {
      console.log("Update service package type status error:", error);

      if (error && typeof error === "object" && "response" in error) {
        const errorResponse = error as { response?: { status?: number } };
        if (errorResponse.response?.status === 404) {
          throw new Error("Không tìm thấy loại gói dịch vụ.");
        } else if (errorResponse.response?.status === 401) {
          throw new Error(
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
          );
        } else if (errorResponse.response?.status === 403) {
          throw new Error("Bạn không có quyền thực hiện thao tác này.");
        }
      }
      throw error;
    }
  },

  /**
   * Delete service package type (soft delete)
   */
  deleteServicePackageType: async (servicePackageTypeId: string): Promise<void> => {
    try {
      const response = await apiClient.post(
        `/service-package-types/${servicePackageTypeId}/delete`
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to delete service package type"
        );
      }
    } catch (error: unknown) {
      console.log("Delete service package type error:", error);

      if (error && typeof error === "object" && "response" in error) {
        const errorResponse = error as {
          response?: { status?: number; data?: { message?: string } };
        };
        if (errorResponse.response?.status === 404) {
          throw new Error("Không tìm thấy loại gói dịch vụ để xóa.");
        } else if (errorResponse.response?.status === 403) {
          throw new Error("Bạn không có quyền xóa loại gói dịch vụ này.");
        } else if (errorResponse.response?.status === 500) {
          throw new Error("Lỗi máy chủ. Vui lòng thử lại sau.");
        } else if (errorResponse.response?.status === 401) {
          throw new Error(
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
          );
        }
      }
      const errorMessage =
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : "Không thể xóa loại gói dịch vụ. Vui lòng thử lại.";
      throw new Error(errorMessage);
    }
  },

  /**
   * Set service package type as default
   */
  setServicePackageTypeAsDefault: async (servicePackageTypeId: string): Promise<void> => {
    try {
      const response = await apiClient.post(
        `/service-package-types/${servicePackageTypeId}/set-default`
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to set service package type as default"
        );
      }
    } catch (error: unknown) {
      console.log("Set service package type as default error:", error);
      throw error;
    }
  },

  /**
   * Remove default status from service package type
   */
  removeServicePackageTypeDefaultStatus: async (servicePackageTypeId: string): Promise<void> => {
    try {
      const response = await apiClient.post(
        `/service-package-types/${servicePackageTypeId}/remove-default`
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to remove default status"
        );
      }
    } catch (error: unknown) {
      console.log("Remove default status error:", error);
      throw error;
    }
  },

  /**
   * Validate service package type code
   */
  validateServicePackageTypeCode: async (code: string): Promise<boolean> => {
    try {
      const response = await apiClient.get(
        `/service-package-types/validate-code?code=${code}`
      );

      if (response.data.success && response.data.data !== undefined) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Failed to validate service package type code"
        );
      }
    } catch (error: unknown) {
      console.log("Validate service package type code error:", error);
      throw error;
    }
  },

  /**
   * Search service package types
   */
  searchServicePackageTypes: async (keyword: string): Promise<ServicePackageType[]> => {
    try {
      const response = await apiClient.get(
        `/service-package-types/search?keyword=${keyword}`
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Failed to search service package types"
        );
      }
    } catch (error: unknown) {
      console.log("Search service package types error:", error);
      throw error;
    }
  },
};
