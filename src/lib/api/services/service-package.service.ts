/**
 * Service Package Management Service
 * Handles all service package-related API calls
 */

import apiClient from "../axios";
import {
  ServicePackage,
  ServicePackageCamelCase,
  ServicePackageResponse,
  ServicePackagePaginatedResponse,
  CreateServicePackageRequest,
  UpdateServicePackageRequest,
  UpdateServicePackageStatusRequest,
  convertServicePackageFromSnakeCase,
  convertServicePackageToSnakeCase,
} from "../types/service-package.types";

export const servicePackageService = {
  /**
   * Get all service packages (new API structure - returns array directly)
   */
  getAllServicePackages: async (
    page: number = 0,
    size: number = 10,
    sort: string = "createdDate",
    direction: string = "DESC"
  ): Promise<ServicePackagePaginatedResponse> => {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sort: sort,
        direction: direction,
      });

      const response = await apiClient.get(
        `/service-packages/get-all?${queryParams.toString()}`
      );

      console.log("Raw API response:", response.data);
      
      if (response.data.success && response.data.data) {
        console.log("API response data:", response.data.data);
        console.log("API response data type:", Array.isArray(response.data.data) ? "array" : typeof response.data.data);
        
        // Handle both array and paginated object responses
        if (Array.isArray(response.data.data)) {
          // Direct array response - convert snake_case to camelCase
          const convertedContent = response.data.data.map(convertServicePackageFromSnakeCase);
          return {
            ...response.data,
            data: {
              content: convertedContent,
              totalElements: response.data.data.length,
              totalPages: 1,
              first: true,
              last: true,
              size: response.data.data.length,
              number: 0,
              numberOfElements: response.data.data.length,
              empty: response.data.data.length === 0,
              pageable: {
                pageNumber: 0,
                pageSize: response.data.data.length,
                sort: { empty: true, sorted: false, unsorted: true },
                offset: 0,
                paged: false,
                unpaged: true
              },
              sort: { empty: true, sorted: false, unsorted: true }
            }
          };
        } else {
          // Paginated object response - convert content array
          const convertedData = {
            ...response.data,
            data: {
              ...response.data.data,
              content: response.data.data.content.map(convertServicePackageFromSnakeCase)
            }
          };
          return convertedData;
        }
      } else {
        console.error("API response error:", response.data);
        throw new Error(
          response.data.message || "Failed to fetch service packages"
        );
      }
    } catch (error: unknown) {
      console.log("Get all service packages error:", error);

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
   * Get all service packages with pagination (legacy method for backward compatibility)
   */
  getAllServicePackagesPaginated: async (
    page: number = 0,
    size: number = 10,
    sort: string = "createdDate",
    direction: string = "DESC"
  ): Promise<ServicePackagePaginatedResponse> => {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sort: sort,
        direction: direction,
      });

      const response = await apiClient.get(
        `/service-packages/get-all-paginated?${queryParams.toString()}`
      );

      if (response.data.success && response.data.data) {
        return response.data;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch service packages"
        );
      }
    } catch (error: unknown) {
      console.log("Get all service packages paginated error:", error);

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
   * Get service package by ID
   */
  getServicePackageById: async (packageId: string): Promise<ServicePackage> => {
    try {
      const response = await apiClient.get(`/service-packages/${packageId}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch service package"
        );
      }
    } catch (error: unknown) {
      console.log("Get service package by ID error:", error);

      if (error && typeof error === "object" && "response" in error) {
        const errorResponse = error as { response?: { status?: number } };
        if (errorResponse.response?.status === 404) {
          throw new Error("Không tìm thấy gói dịch vụ.");
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
   * Create new service package
   */
  createServicePackage: async (
    data: CreateServicePackageRequest
  ): Promise<ServicePackage> => {
    try {
      const response = await apiClient.post("/service-packages/create", data);

      console.log("Create service package API response:", response);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Failed to create service package"
        );
      }
    } catch (error: unknown) {
      console.log("Create service package error:", error);

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
            "Gói dịch vụ đã tồn tại trong hệ thống.";
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
          : "Không thể tạo gói dịch vụ. Vui lòng thử lại.";
      throw new Error(errorMessage);
    }
  },

  /**
   * Update service package
   */
  updateServicePackage: async (
    packageId: string,
    data: UpdateServicePackageRequest
  ): Promise<ServicePackage> => {
    try {
      console.log("Updating service package with data:", data);

      const response = await apiClient.post(
        `/service-packages/${packageId}/update`,
        data
      );

      console.log("Update service package API response:", response);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Failed to update service package"
        );
      }
    } catch (error: unknown) {
      console.error("Update service package error:", error);

      // Handle network errors or other issues
      const errorMessage =
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : "Không thể cập nhật gói dịch vụ. Vui lòng thử lại.";
      throw new Error(errorMessage);
    }
  },

  /**
   * Update service package status
   */
  updateServicePackageStatus: async (
    packageId: string,
    data: UpdateServicePackageStatusRequest
  ): Promise<ServicePackage> => {
    try {
      const response = await apiClient.post(
        `/service-packages/${packageId}/status`,
        data
      );

      console.log("Update service package status response:", response.data);

      // Handle different response structures
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else if (response.data) {
        // If response.data exists but no success field, assume it's the service package data
        return response.data;
      } else {
        throw new Error(
          response.data?.message || "Failed to update service package status"
        );
      }
    } catch (error: unknown) {
      console.log("Update service package status error:", error);

      if (error && typeof error === "object" && "response" in error) {
        const errorResponse = error as { response?: { status?: number } };
        if (errorResponse.response?.status === 404) {
          throw new Error("Không tìm thấy gói dịch vụ.");
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
   * Delete service package (soft delete)
   */
  deleteServicePackage: async (packageId: string): Promise<void> => {
    try {
      const response = await apiClient.post(
        `/service-packages/${packageId}/delete`
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to delete service package"
        );
      }
    } catch (error: unknown) {
      console.log("Delete service package error:", error);

      // Handle specific error cases
      if (error && typeof error === "object" && "response" in error) {
        const errorResponse = error as {
          response?: { status?: number; data?: { message?: string } };
        };
        if (errorResponse.response?.status === 404) {
          throw new Error("Không tìm thấy gói dịch vụ để xóa.");
        } else if (errorResponse.response?.status === 403) {
          throw new Error("Bạn không có quyền xóa gói dịch vụ này.");
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
          : "Không thể xóa gói dịch vụ. Vui lòng thử lại.";
      throw new Error(errorMessage);
    }
  },

  /**
   * Search service packages
   */
  searchServicePackages: async (
    query: string,
    page: number = 0,
    size: number = 10
  ): Promise<ServicePackageResponse> => {
    try {
      const queryParams = new URLSearchParams({
        search: query,
        page: page.toString(),
        size: size.toString(),
      });

      const response = await apiClient.get(
        `/service-packages/search?${queryParams.toString()}`
      );

      if (response.data.success && response.data.data) {
        return response.data;
      } else {
        throw new Error(
          response.data.message || "Failed to search service packages"
        );
      }
    } catch (error: unknown) {
      console.log("Search service packages error:", error);
      throw error;
    }
  },

  /**
   * Get service packages by category
   */
  getServicePackagesByCategory: async (
    categoryId: string,
    page: number = 0,
    size: number = 10
  ): Promise<ServicePackageResponse> => {
    try {
      const queryParams = new URLSearchParams({
        categoryId: categoryId,
        page: page.toString(),
        size: size.toString(),
      });

      const response = await apiClient.get(
        `/service-packages/category?${queryParams.toString()}`
      );

      if (response.data.success && response.data.data) {
        return response.data;
      } else {
        throw new Error(
          response.data.message ||
            "Failed to fetch service packages by category"
        );
      }
    } catch (error: unknown) {
      console.log("Get service packages by category error:", error);
      throw error;
    }
  },
};

