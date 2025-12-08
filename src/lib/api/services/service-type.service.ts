/**
 * Service Type Management Service
 * Handles all service type-related API calls
 */

import apiClient from "../axios";
import {
  ServiceType,
  ServiceTypeResponse,
  CreateServiceTypeRequest,
  UpdateServiceTypeRequest,
  ServiceTypeFilterParam,
  ServiceTypeStatistics,
} from "../types/service-type.types";

export class ServiceTypeService {
  /**
   * Get all service types with pagination and filtering
   */
  static async getAllServiceTypes(
    params: ServiceTypeFilterParam = {}
  ): Promise<ServiceTypeResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination params
      if (params.page !== undefined) queryParams.append("page", params.page.toString());
      if (params.size !== undefined) queryParams.append("size", params.size.toString());
      if (params.sort) queryParams.append("sort", params.sort);
      if (params.direction) queryParams.append("direction", params.direction);
      
      // Add filter params
      if (params.code) queryParams.append("code", params.code);
      if (params.name) queryParams.append("name", params.name);
      if (params.isActive !== undefined) queryParams.append("isActive", params.isActive.toString());
      if (params.search) queryParams.append("keyword", params.search);

      const url = `/service-types/get-all?${queryParams.toString()}`;
      console.log("ServiceType API URL:", url);
      console.log("Filter params:", params);
      
      const response = await apiClient.get(url);

      if (response.data.success && response.data.data) {
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch service types");
      }
    } catch (error: unknown) {
      console.log("Get all service types error:", error);
      
      if (error && typeof error === "object" && "response" in error) {
        const errorResponse = error as { response?: { status?: number } };
        if (errorResponse.response?.status === 500) {
          throw new Error("Lỗi máy chủ. Vui lòng thử lại sau.");
        } else if (errorResponse.response?.status === 401) {
          throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        } else if (errorResponse.response?.status === 403) {
          throw new Error("Bạn không có quyền truy cập tài nguyên này.");
        }
      }
      throw error;
    }
  }

  /**
   * Get service type by ID
   */
  static async getServiceTypeById(serviceTypeId: string): Promise<ServiceType> {
    try {
      const response = await apiClient.get(`/service-types/${serviceTypeId}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch service type");
      }
    } catch (error: unknown) {
      console.log("Get service type by ID error:", error);

      if (error && typeof error === "object" && "response" in error) {
        const errorResponse = error as { response?: { status?: number } };
        if (errorResponse.response?.status === 404) {
          throw new Error("Không tìm thấy loại dịch vụ.");
        } else if (errorResponse.response?.status === 401) {
          throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        }
      }
      throw error;
    }
  }

  /**
   * Get service type by code
   */
  static async getServiceTypeByCode(code: string): Promise<ServiceType> {
    try {
      const response = await apiClient.get(`/service-types/code/${code}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch service type");
      }
    } catch (error: unknown) {
      console.log("Get service type by code error:", error);
      throw error;
    }
  }

  /**
   * Get active service types
   */
  static async getActiveServiceTypes(): Promise<ServiceType[]> {
    try {
      const response = await apiClient.get("/service-types/active");
      return response.data.data;
    } catch (error: unknown) {
      console.log("Get active service types error:", error);
      throw error;
    }
  }

  /**
   * Search service types
   */
  static async searchServiceTypes(keyword: string): Promise<ServiceType[]> {
    try {
      const response = await apiClient.get(`/service-types/search?keyword=${encodeURIComponent(keyword)}`);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Search service types error:", error);
      throw error;
    }
  }

  /**
   * Create new service type
   */
  static async createServiceType(data: CreateServiceTypeRequest): Promise<ServiceType> {
    try {
      console.log("Creating service type with data:", data);

      const response = await apiClient.post("/service-types/create", data);

      console.log("Create service type API response:", response);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to create service type");
      }
    } catch (error: unknown) {
      console.log("Create service type error:", error);

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
            "Loại dịch vụ đã tồn tại trong hệ thống.";
          throw new Error(errorMessage);
        } else if (errorResponse.response?.status === 500) {
          throw new Error("Lỗi máy chủ. Vui lòng thử lại sau.");
        } else if (errorResponse.response?.status === 401) {
          throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        } else if (errorResponse.response?.status === 403) {
          throw new Error("Bạn không có quyền thực hiện thao tác này.");
        }
      }
      const errorMessage =
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : "Không thể tạo loại dịch vụ. Vui lòng thử lại.";
      throw new Error(errorMessage);
    }
  }

  /**
   * Update service type
   */
  static async updateServiceType(
    serviceTypeId: string,
    data: UpdateServiceTypeRequest
  ): Promise<ServiceType> {
    try {
      console.log("Updating service type with data:", data);

      const response = await apiClient.post(
        `/service-types/${serviceTypeId}/update`,
        data
      );

      console.log("Update service type API response:", response);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to update service type");
      }
    } catch (error: unknown) {
      console.log("Update service type error:", error);

      if (error && typeof error === "object" && "response" in error) {
        const errorResponse = error as {
          response?: { status?: number; data?: { message?: string } };
        };
        if (errorResponse.response?.status === 400) {
          const errorMessage =
            errorResponse.response.data?.message ||
            "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.";
          throw new Error(errorMessage);
        } else if (errorResponse.response?.status === 404) {
          throw new Error("Không tìm thấy loại dịch vụ.");
        } else if (errorResponse.response?.status === 409) {
          const errorMessage =
            errorResponse.response.data?.message ||
            "Loại dịch vụ đã tồn tại trong hệ thống.";
          throw new Error(errorMessage);
        } else if (errorResponse.response?.status === 500) {
          throw new Error("Lỗi máy chủ. Vui lòng thử lại sau.");
        } else if (errorResponse.response?.status === 401) {
          throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        } else if (errorResponse.response?.status === 403) {
          throw new Error("Bạn không có quyền thực hiện thao tác này.");
        }
      }
      const errorMessage =
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : "Không thể cập nhật loại dịch vụ. Vui lòng thử lại.";
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete service type (soft delete)
   */
  static async deleteServiceType(serviceTypeId: string): Promise<void> {
    try {
      const response = await apiClient.post(`/service-types/${serviceTypeId}/delete`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete service type");
      }
    } catch (error: unknown) {
      console.log("Delete service type error:", error);

      if (error && typeof error === "object" && "response" in error) {
        const errorResponse = error as {
          response?: { status?: number; data?: { message?: string } };
        };
        if (errorResponse.response?.status === 404) {
          throw new Error("Không tìm thấy loại dịch vụ để xóa.");
        } else if (errorResponse.response?.status === 403) {
          throw new Error("Bạn không có quyền xóa loại dịch vụ này.");
        } else if (errorResponse.response?.status === 500) {
          throw new Error("Lỗi máy chủ. Vui lòng thử lại sau.");
        } else if (errorResponse.response?.status === 401) {
          throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        }
      }
      const errorMessage =
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : "Không thể xóa loại dịch vụ. Vui lòng thử lại.";
      throw new Error(errorMessage);
    }
  }

  /**
   * Restore service type (undo soft delete)
   */
  static async restoreServiceType(serviceTypeId: string): Promise<void> {
    try {
      const response = await apiClient.post(`/service-types/${serviceTypeId}/restore`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to restore service type");
      }
    } catch (error: unknown) {
      console.log("Restore service type error:", error);
      throw error;
    }
  }

  /**
   * Update service type status
   */
  static async updateServiceTypeStatus(
    serviceTypeId: string,
    isActive: boolean
  ): Promise<void> {
    try {
      const response = await apiClient.post(
        `/service-types/${serviceTypeId}/status`,
        { is_active: isActive }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update service type status");
      }
    } catch (error: unknown) {
      console.log("Update service type status error:", error);
      throw error;
    }
  }

  /**
   * Activate service type
   */
  static async activateServiceType(serviceTypeId: string): Promise<void> {
    try {
      const response = await apiClient.post(`/service-types/${serviceTypeId}/activate`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to activate service type");
      }
    } catch (error: unknown) {
      console.log("Activate service type error:", error);
      throw error;
    }
  }

  /**
   * Deactivate service type
   */
  static async deactivateServiceType(serviceTypeId: string): Promise<void> {
    try {
      const response = await apiClient.post(`/service-types/${serviceTypeId}/deactivate`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to deactivate service type");
      }
    } catch (error: unknown) {
      console.log("Deactivate service type error:", error);
      throw error;
    }
  }

  /**
   * Validate service type code
   */
  static async validateServiceTypeCode(code: string): Promise<boolean> {
    try {
      const response = await apiClient.get(`/service-types/validate-code?code=${encodeURIComponent(code)}`);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Validate service type code error:", error);
      throw error;
    }
  }

  /**
   * Get service type statistics
   */
  static async getServiceTypeStatistics(): Promise<ServiceTypeStatistics> {
    try {
      const response = await apiClient.get("/service-types/statistics");
      return response.data.data;
    } catch (error: unknown) {
      console.log("Get service type statistics error:", error);
      throw error;
    }
  }
}
