/**
 * Service Management Service
 * Handles all service-related API calls
 * Updated to match backend ServiceManagementController
 */

import apiClient from "../axios";
import {
  ServiceResponse,
  CreateServiceRequest,
  UpdateServiceRequest,
  UpdateServiceStatusRequest,
  Service,
  ServiceFilterParam,
  ServicePricingDto,
  ServicePricingInfoDto,
  UpdateLaborCostRequest,
} from "../types/service.types";

export class ServiceService {
  /**
   * Get all services with pagination and filtering
   */
  static async getAllServices(
    params: ServiceFilterParam = {}
  ): Promise<ServiceResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination params
      if (params.page !== undefined) queryParams.append("page", params.page.toString());
      if (params.size !== undefined) queryParams.append("size", params.size.toString());
      if (params.sort) queryParams.append("sort", params.sort);
      if (params.direction) queryParams.append("direction", params.direction);
      
      // Add filter params
      if (params.category_id) queryParams.append("categoryId", params.category_id);
      if (params.service_type_id) queryParams.append("serviceTypeId", params.service_type_id);
      if (params.skill_level) queryParams.append("skillLevel", params.skill_level);
      if (params.is_package !== undefined) queryParams.append("isPackage", params.is_package.toString());
      if (params.is_featured !== undefined) queryParams.append("isFeatured", params.is_featured.toString());
      if (params.is_active !== undefined) queryParams.append("isActive", params.is_active.toString());
      if (params.search) queryParams.append("keyword", params.search);

      const url = `/services/get-all?${queryParams.toString()}`;
      console.log("Service API URL:", url);
      console.log("Filter params:", params);
      
      const response = await apiClient.get(url);

      if (response.data.success && response.data.data) {
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch services");
      }
    } catch (error: unknown) {
      console.log("Get all services error:", error);
      
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
   * Get service by ID
   */
  static async getServiceById(serviceId: string): Promise<Service> {
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
          throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        }
      }
      throw error;
    }
  }

  /**
   * Get service by URL
   */
  static async getServiceByUrl(serviceUrl: string): Promise<Service> {
    try {
      const response = await apiClient.get(`/services/url/${serviceUrl}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch service");
      }
    } catch (error: unknown) {
      console.log("Get service by URL error:", error);
      throw error;
    }
  }

  /**
   * Get services by category
   */
  static async getServicesByCategory(categoryId: string): Promise<Service[]> {
    try {
      const response = await apiClient.get(`/services/category/${categoryId}`);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Get services by category error:", error);
      throw error;
    }
  }

  /**
   * Get services by type
   */
  static async getServicesByType(serviceTypeId: string): Promise<Service[]> {
    try {
      const response = await apiClient.get(`/services/type/${serviceTypeId}`);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Get services by type error:", error);
      throw error;
    }
  }

  /**
   * Get services by skill level
   */
  static async getServicesBySkillLevel(skillLevel: string): Promise<Service[]> {
    try {
      const response = await apiClient.get(`/services/skill-level/${skillLevel}`);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Get services by skill level error:", error);
      throw error;
    }
  }

  /**
   * Search services
   */
  static async searchServices(keyword: string): Promise<Service[]> {
    try {
      const response = await apiClient.get(`/services/search?keyword=${encodeURIComponent(keyword)}`);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Search services error:", error);
      throw error;
    }
  }

  /**
   * Get featured services
   */
  static async getFeaturedServices(): Promise<Service[]> {
    try {
      const response = await apiClient.get("/services/featured");
      return response.data.data;
    } catch (error: unknown) {
      console.log("Get featured services error:", error);
      throw error;
    }
  }

  /**
   * Get package services
   */
  static async getPackageServices(): Promise<Service[]> {
    try {
      const response = await apiClient.get("/services/package");
      return response.data.data;
    } catch (error: unknown) {
      console.log("Get package services error:", error);
      throw error;
    }
  }

  /**
   * Get non-package services
   */
  static async getNonPackageServices(): Promise<Service[]> {
    try {
      const response = await apiClient.get("/services/non-package");
      return response.data.data;
    } catch (error: unknown) {
      console.log("Get non-package services error:", error);
      throw error;
    }
  }

  /**
   * Create new service
   */
  static async createService(data: CreateServiceRequest): Promise<Service> {
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
          throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
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
  }

  /**
   * Update service
   */
  static async updateService(
    serviceId: string,
    data: UpdateServiceRequest
  ): Promise<Service> {
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
          throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
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
  }

  /**
   * Update service status
   */
  static async updateServiceStatus(
    serviceId: string,
    data: UpdateServiceStatusRequest
  ): Promise<void> {
    try {
      const response = await apiClient.post(
        `/services/${serviceId}/status`,
        data
      );

      console.log("Update service status response:", response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update service status");
      }
    } catch (error: unknown) {
      console.log("Update service status error:", error);

      if (error && typeof error === "object" && "response" in error) {
        const errorResponse = error as { response?: { status?: number } };
        if (errorResponse.response?.status === 404) {
          throw new Error("Không tìm thấy dịch vụ.");
        } else if (errorResponse.response?.status === 401) {
          throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        } else if (errorResponse.response?.status === 403) {
          throw new Error("Bạn không có quyền thực hiện thao tác này.");
        }
      }
      throw error;
    }
  }

  /**
   * Delete service (soft delete)
   */
  static async deleteService(serviceId: string): Promise<void> {
    try {
      const response = await apiClient.post(`/services/${serviceId}/delete`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete service");
      }
    } catch (error: unknown) {
      console.log("Delete service error:", error);

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
          throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        }
      }
      const errorMessage =
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : "Không thể xóa dịch vụ. Vui lòng thử lại.";
      throw new Error(errorMessage);
    }
  }

  /**
   * Get service count by category
   */
  static async getServiceCountByCategory(categoryId: string): Promise<number> {
    try {
      const response = await apiClient.get(`/services/category/${categoryId}/count`);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Get service count by category error:", error);
      throw error;
    }
  }

  /**
   * Get service count by type
   */
  static async getServiceCountByType(serviceTypeId: string): Promise<number> {
    try {
      const response = await apiClient.get(`/services/type/${serviceTypeId}/count`);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Get service count by type error:", error);
      throw error;
    }
  }

  /**
   * Get service count by skill level
   */
  static async getServiceCountBySkillLevel(skillLevel: string): Promise<number> {
    try {
      const response = await apiClient.get(`/services/skill-level/${skillLevel}/count`);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Get service count by skill level error:", error);
      throw error;
    }
  }

  /**
   * Get service pricing details
   */
  static async getServicePricing(serviceId: string, priceBookId?: string): Promise<ServicePricingDto> {
    try {
      const params = priceBookId ? `?priceBookId=${priceBookId}` : "";
      const response = await apiClient.get(`/services/${serviceId}/pricing${params}`);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Get service pricing error:", error);
      throw error;
    }
  }

  /**
   * Get service pricing info
   */
  static async getServicePricingInfo(serviceId: string): Promise<ServicePricingInfoDto> {
    try {
      const response = await apiClient.get(`/services/${serviceId}/pricing-info`);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Get service pricing info error:", error);
      throw error;
    }
  }

  /**
   * Recalculate service base price
   */
  static async recalculateBasePrice(serviceId: string, priceBookId?: string): Promise<ServicePricingDto> {
    try {
      const params = priceBookId ? `?priceBookId=${priceBookId}` : "";
      const response = await apiClient.post(`/${serviceId}/recalculate-base-price${params}`);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Recalculate base price error:", error);
      throw error;
    }
  }

  /**
   * Update service labor cost
   */
  static async updateLaborCost(serviceId: string, data: UpdateLaborCostRequest): Promise<ServicePricingInfoDto> {
    try {
      const response = await apiClient.post(`/services/${serviceId}/update-labor-cost`, data);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Update labor cost error:", error);
      throw error;
    }
  }
}