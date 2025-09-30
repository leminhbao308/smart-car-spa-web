/**
 * Service Management Service
 * Handles all service-related API calls
 */

import apiClient from "../axios";
import {
  ServiceResponse,
  CreateServiceRequest,
  UpdateServiceRequest,
  UpdateServiceStatusRequest,
  Service,
} from "../types/service.types";

export const serviceService = {
  /**
   * Get all services with pagination and filtering
   */
  getAllServices: async (
    page: number = 0,
    size: number = 10,
    sort: string = "createdDate",
    direction: string = "DESC"
  ): Promise<ServiceResponse> => {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sort: sort,
        direction: direction,
      });

      const response = await apiClient.get(
        `/services/get-all?${queryParams.toString()}`
      );

      if (response.data.success && response.data.data) {
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch services");
      }
    } catch (error: unknown) {
      console.log("Get all services error:", error);

      // Handle specific error cases
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
   * Get service by ID
   */
  getServiceById: async (serviceId: string): Promise<Service> => {
    try {
      const response = await apiClient.get(`/services/${serviceId}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch service");
      }
    } catch (error: unknown) {
      console.log("Get service by ID error:", error);

      if (error && typeof error === "object" && "response" in error) {
        const errorResponse = error as { response?: { status?: number } };
        if (errorResponse.response?.status === 404) {
          throw new Error("Không tìm thấy dịch vụ.");
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
   * Create new service
   */
  createService: async (data: CreateServiceRequest): Promise<Service> => {
    try {
      console.log("Creating service with data:", data);

      const response = await apiClient.post("/services/create", data);

      console.log("Create service API response:", response);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to create service");
      }
    } catch (error: unknown) {
      console.log("Create service error:", error);

      // Handle specific error cases
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
            "Dịch vụ đã tồn tại trong hệ thống.";
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
          : "Không thể tạo dịch vụ. Vui lòng thử lại.";
      throw new Error(errorMessage);
    }
  },

  /**
   * Update service
   */
  updateService: async (
    serviceId: string,
    data: UpdateServiceRequest
  ): Promise<Service> => {
    try {
      console.log("Updating service with data:", data);

      const response = await apiClient.post(
        `/services/${serviceId}/update`,
        data
      );

      console.log("Update service API response:", response);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to update service");
      }
    } catch (error: unknown) {
      console.log("Update service error:", error);

      // Handle specific error cases
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
          throw new Error("Không tìm thấy dịch vụ.");
        } else if (errorResponse.response?.status === 409) {
          const errorMessage =
            errorResponse.response.data?.message ||
            "Dịch vụ đã tồn tại trong hệ thống.";
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
          : "Không thể cập nhật dịch vụ. Vui lòng thử lại.";
      throw new Error(errorMessage);
    }
  },

  /**
   * Update service status
   */
  updateServiceStatus: async (
    serviceId: string,
    data: UpdateServiceStatusRequest
  ): Promise<Service> => {
    try {
      const response = await apiClient.post(
        `/services/${serviceId}/status`,
        data
      );

      console.log("Update service status response:", response.data);

      // Handle different response structures
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else if (response.data) {
        // If response.data exists but no success field, assume it's the service data
        return response.data;
      } else {
        throw new Error(
          response.data?.message || "Failed to update service status"
        );
      }
    } catch (error: unknown) {
      console.log("Update service status error:", error);

      if (error && typeof error === "object" && "response" in error) {
        const errorResponse = error as { response?: { status?: number } };
        if (errorResponse.response?.status === 404) {
          throw new Error("Không tìm thấy dịch vụ.");
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
   * Delete service (soft delete)
   */
  deleteService: async (serviceId: string): Promise<void> => {
    try {
      const response = await apiClient.post(`/services/${serviceId}/delete`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete service");
      }
    } catch (error: unknown) {
      console.log("Delete service error:", error);

      // Handle specific error cases
      if (error && typeof error === "object" && "response" in error) {
        const errorResponse = error as {
          response?: { status?: number; data?: { message?: string } };
        };
        if (errorResponse.response?.status === 404) {
          throw new Error("Không tìm thấy dịch vụ để xóa.");
        } else if (errorResponse.response?.status === 403) {
          throw new Error("Bạn không có quyền xóa dịch vụ này.");
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
          : "Không thể xóa dịch vụ. Vui lòng thử lại.";
      throw new Error(errorMessage);
    }
  },

  /**
   * Search services
   */
  searchServices: async (
    query: string,
    page: number = 0,
    size: number = 10
  ): Promise<ServiceResponse> => {
    try {
      const queryParams = new URLSearchParams({
        search: query,
        page: page.toString(),
        size: size.toString(),
      });

      const response = await apiClient.get(
        `/services/search?${queryParams.toString()}`
      );

      if (response.data.success && response.data.data) {
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to search services");
      }
    } catch (error: unknown) {
      console.log("Search services error:", error);
      throw error;
    }
  },

  /**
   * Get services by category
   */
  getServicesByCategory: async (
    categoryId: string,
    page: number = 0,
    size: number = 10
  ): Promise<ServiceResponse> => {
    try {
      const queryParams = new URLSearchParams({
        categoryId: categoryId,
        page: page.toString(),
        size: size.toString(),
      });

      const response = await apiClient.get(
        `/services/category?${queryParams.toString()}`
      );

      if (response.data.success && response.data.data) {
        return response.data;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch services by category"
        );
      }
    } catch (error: unknown) {
      console.log("Get services by category error:", error);
      throw error;
    }
  },
};

export { serviceService as ServiceService };
