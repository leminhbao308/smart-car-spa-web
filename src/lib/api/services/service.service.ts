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
      if (params.page !== undefined)
        queryParams.append("page", params.page.toString());
      if (params.size !== undefined)
        queryParams.append("size", params.size.toString());
      if (params.sort) queryParams.append("sort", params.sort);
      if (params.direction) queryParams.append("direction", params.direction);

      // Add filter params
      if (params.category_id)
        queryParams.append("category_id", params.category_id);
      if (params.service_type_id)
        queryParams.append("service_type_id", params.service_type_id);
      if (params.skill_level)
        queryParams.append("skill_level", params.skill_level);
      if (params.is_featured !== undefined)
        queryParams.append("is_featured", params.is_featured.toString());
      if (params.is_active !== undefined)
        queryParams.append("is_active", params.is_active.toString());
      if (params.branch_id)
        queryParams.append("branch_id", params.branch_id);
      if (params.service_process_id)
        queryParams.append("service_process_id", params.service_process_id);
      if (params.is_default_process !== undefined)
        queryParams.append("is_default_process", params.is_default_process.toString());
      if (params.search) queryParams.append("search", params.search);

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
          throw new Error(
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
          );
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
  static async getServiceById(service_id: string): Promise<Service> {
    try {
      const response = await apiClient.get(`/services/${service_id}`);

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
  }

  /**
   * Get service by URL
   */
  static async getServiceByUrl(service_url: string): Promise<Service> {
    try {
      const response = await apiClient.get(`/services/url/${service_url}`);

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
  static async getServicesByCategory(category_id: string): Promise<Service[]> {
    try {
      const response = await apiClient.get(`/services/category/${category_id}`);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Get services by category error:", error);
      throw error;
    }
  }

  /**
   * Get services by type
   */
  static async getServicesByType(service_type_id: string): Promise<Service[]> {
    try {
      const response = await apiClient.get(`/services/type/${service_type_id}`);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Get services by type error:", error);
      throw error;
    }
  }

  /**
   * Get services by skill level
   */
  static async getServicesBySkillLevel(
    skill_level: string
  ): Promise<Service[]> {
    try {
      const response = await apiClient.get(
        `/services/skill-level/${skill_level}`
      );
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
      const response = await apiClient.get(
        `/services/search?keyword=${encodeURIComponent(keyword)}`
      );
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
  }

  /**
   * Update service
   */
  static async updateService(
    service_id: string,
    data: UpdateServiceRequest
  ): Promise<Service> {
    try {
      console.log("Updating service with data:", data);

      const response = await apiClient.post(
        `/services/${service_id}/update`,
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
  }

  /**
   * Update service status
   */
  static async updateServiceStatus(
    service_id: string,
    data: UpdateServiceStatusRequest
  ): Promise<void> {
    try {
      const response = await apiClient.post(
        `/services/${service_id}/status`,
        data
      );

      console.log("Update service status response:", response.data);

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to update service status"
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
  }

  /**
   * Delete service (soft delete)
   */
  static async deleteService(service_id: string): Promise<void> {
    try {
      const response = await apiClient.post(`/services/${service_id}/delete`);

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
  }

  /**
   * Get service count by category
   */
  static async getServiceCountByCategory(category_id: string): Promise<number> {
    try {
      const response = await apiClient.get(
        `/services/category/${category_id}/count`
      );
      return response.data.data;
    } catch (error: unknown) {
      console.log("Get service count by category error:", error);
      throw error;
    }
  }

  /**
   * Get service count by type
   */
  static async getServiceCountByType(service_type_id: string): Promise<number> {
    try {
      const response = await apiClient.get(
        `/services/type/${service_type_id}/count`
      );
      return response.data.data;
    } catch (error: unknown) {
      console.log("Get service count by type error:", error);
      throw error;
    }
  }

  /**
   * Get service count by skill level
   */
  static async getServiceCountBySkillLevel(
    skill_level: string
  ): Promise<number> {
    try {
      const response = await apiClient.get(
        `/services/skill-level/${skill_level}/count`
      );
      return response.data.data;
    } catch (error: unknown) {
      console.log("Get service count by skill level error:", error);
      throw error;
    }
  }

  /**
   * Get service pricing details
   */
  static async getServicePricing(
    service_id: string,
    price_book_id?: string
  ): Promise<ServicePricingDto> {
    try {
      const params = price_book_id ? `?price_book_id=${price_book_id}` : "";
      const response = await apiClient.get(
        `/services/${service_id}/pricing${params}`
      );
      return response.data.data;
    } catch (error: unknown) {
      console.log("Get service pricing error:", error);
      throw error;
    }
  }

  /**
   * Get service pricing info
   */
  static async getServicePricingInfo(
    service_id: string
  ): Promise<ServicePricingInfoDto> {
    try {
      const response = await apiClient.get(
        `/services/${service_id}/pricing-info`
      );
      return response.data.data;
    } catch (error: unknown) {
      console.log("Get service pricing info error:", error);
      throw error;
    }
  }

  /**
   * Recalculate service base price
   */
  static async recalculateBasePrice(
    service_id: string,
    price_book_id?: string
  ): Promise<ServicePricingDto> {
    try {
      const params = price_book_id ? `?price_book_id=${price_book_id}` : "";
      const response = await apiClient.post(
        `/${service_id}/recalculate-base-price${params}`
      );
      return response.data.data;
    } catch (error: unknown) {
      console.log("Recalculate base price error:", error);
      throw error;
    }
  }

  /**
   * Update service labor cost
   */
  static async updateLaborCost(
    service_id: string,
    data: UpdateLaborCostRequest
  ): Promise<ServicePricingInfoDto> {
    try {
      const response = await apiClient.post(
        `/services/${service_id}/update-labor-cost`,
        data
      );
      return response.data.data;
    } catch (error: unknown) {
      console.log("Update labor cost error:", error);
      throw error;
    }
  }

  /**
   * Delete service product
   */
  static async deleteServiceProduct(serviceProductId: string): Promise<void> {
    try {
      const response = await apiClient.post(`/products/${serviceProductId}/delete`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete service product");
      }
    } catch (error: unknown) {
      console.log("Delete service product error:", error);

      if (error && typeof error === "object" && "response" in error) {
        const errorResponse = error as {
          response?: { status?: number; data?: { message?: string } };
        };
        if (errorResponse.response?.status === 404) {
          throw new Error("Không tìm thấy sản phẩm dịch vụ để xóa.");
        } else if (errorResponse.response?.status === 403) {
          throw new Error("Bạn không có quyền xóa sản phẩm dịch vụ này.");
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
          : "Không thể xóa sản phẩm dịch vụ. Vui lòng thử lại.";
      throw new Error(errorMessage);
    }
  }
}
