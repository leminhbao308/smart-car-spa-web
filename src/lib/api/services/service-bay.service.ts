import api from "../axios";
import {
  ServiceBay,
  ServiceBayResponse,
  CreateServiceBayRequest,
  UpdateServiceBayRequest,
  ServiceBayFilterParam,
  ServiceBayDropdownItem,
  BayAvailabilityRequest,
  ServiceBayStatistics,
  BayType,
  BayStatus
} from "../types/service-bay.types";

export const serviceBayService = {
  /**
   * Get all service bays with pagination and filtering
   */
  getAllServiceBays: async (
    params: ServiceBayFilterParam = {}
  ): Promise<ServiceBayResponse> => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination params
      if (params.page !== undefined) queryParams.append("page", params.page.toString());
      if (params.size !== undefined) queryParams.append("size", params.size.toString());
      if (params.sort) queryParams.append("sort", params.sort);
      if (params.direction) queryParams.append("direction", params.direction);
      
      // Add filter params
      if (params.branch_id) queryParams.append("branch_id", params.branch_id);
      if (params.bay_type) queryParams.append("bay_type", params.bay_type);
      if (params.status) queryParams.append("status", params.status);
      if (params.search) queryParams.append("search", params.search);

      const response = await api.get(
        `/service-bays/get-all?${queryParams.toString()}`
      );

      if (response.data.success && response.data.data) {
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch service bays");
      }
    } catch (error: unknown) {
      console.log("Get all service bays error:", error);
      
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
  },

  /**
   * Get service bay by ID
   */
  getServiceBayById: async (bayId: string): Promise<ServiceBay> => {
    try {
      const response = await api.get(`/service-bays/${bayId}`);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Get service bay by ID error:", error);
      throw error;
    }
  },

  /**
   * Get service bays by branch
   */
  getServiceBaysByBranch: async (branchId: string): Promise<ServiceBay[]> => {
    try {
      const response = await api.get(`/service-bays/branch/${branchId}`);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Get service bays by branch error:", error);
      throw error;
    }
  },

  /**
   * Get service bays by type
   */
  getServiceBaysByType: async (bayType: BayType): Promise<ServiceBay[]> => {
    try {
      const response = await api.get(`/service-bays/type/${bayType}`);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Get service bays by type error:", error);
      throw error;
    }
  },

  /**
   * Get active service bays
   */
  getActiveServiceBays: async (branchId?: string): Promise<ServiceBay[]> => {
    try {
      const params = branchId ? `?branch_id=${branchId}` : "";
      const response = await api.get(`/service-bays/active${params}`);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Get active service bays error:", error);
      throw error;
    }
  },

  /**
   * Get available service bays in time range
   */
  getAvailableServiceBays: async (
    branchId: string,
    startTime: string,
    endTime: string,
    bayType?: BayType
  ): Promise<ServiceBay[]> => {
    try {
      const queryParams = new URLSearchParams({
        branch_id: branchId,
        start_time: startTime,
        end_time: endTime
      });
      
      if (bayType) {
        queryParams.append("bay_type", bayType);
      }

      const response = await api.get(
        `/service-bays/available?${queryParams.toString()}`
      );
      return response.data.data;
    } catch (error: unknown) {
      console.log("Get available service bays error:", error);
      throw error;
    }
  },

  /**
   * Get service bays dropdown
   */
  getServiceBaysDropdown: async (
    branchId?: string,
    bayType?: BayType
  ): Promise<ServiceBayDropdownItem[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (branchId) queryParams.append("branch_id", branchId);
      if (bayType) queryParams.append("bay_type", bayType);

      const response = await api.get(
        `/service-bays/dropdown?${queryParams.toString()}`
      );
      return response.data.data;
    } catch (error: unknown) {
      console.log("Get service bays dropdown error:", error);
      throw error;
    }
  },

  /**
   * Search service bays
   */
  searchServiceBays: async (
    keyword: string,
    branchId?: string
  ): Promise<ServiceBay[]> => {
    try {
      const queryParams = new URLSearchParams({ keyword });
      if (branchId) queryParams.append("branch_id", branchId);

      const response = await api.get(
        `/service-bays/search?${queryParams.toString()}`
      );
      return response.data.data;
    } catch (error: unknown) {
      console.log("Search service bays error:", error);
      throw error;
    }
  },

  /**
   * Create new service bay
   */
  createServiceBay: async (data: CreateServiceBayRequest): Promise<ServiceBay> => {
    try {
      const response = await api.post("/service-bays/create", data);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Create service bay error:", error);
      throw error;
    }
  },

  /**
   * Update service bay
   */
  updateServiceBay: async (
    bayId: string,
    data: UpdateServiceBayRequest
  ): Promise<ServiceBay> => {
    try {
      const response = await api.post(`/service-bays/${bayId}/update`, data);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Update service bay error:", error);
      throw error;
    }
  },

  /**
   * Delete service bay
   */
  deleteServiceBay: async (bayId: string): Promise<void> => {
    try {
      await api.post(`/service-bays/${bayId}/delete`);
    } catch (error: unknown) {
      console.log("Delete service bay error:", error);
      throw error;
    }
  },

  /**
   * Update service bay status
   */
  updateServiceBayStatus: async (
    bayId: string,
    status: BayStatus,
    reason?: string
  ): Promise<ServiceBay> => {
    try {
      const queryParams = new URLSearchParams({ status });
      if (reason) queryParams.append("reason", reason);

      const response = await api.post(
        `/service-bays/${bayId}/status?${queryParams.toString()}`
      );
      return response.data.data;
    } catch (error: unknown) {
      console.log("Update service bay status error:", error);
      throw error;
    }
  },

  /**
   * Activate service bay
   */
  activateServiceBay: async (bayId: string): Promise<ServiceBay> => {
    try {
      const response = await api.post(`/service-bays/${bayId}/activate`);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Activate service bay error:", error);
      throw error;
    }
  },

  /**
   * Deactivate service bay
   */
  deactivateServiceBay: async (
    bayId: string,
    reason: string
  ): Promise<ServiceBay> => {
    try {
      const response = await api.post(
        `/service-bays/${bayId}/deactivate?reason=${encodeURIComponent(reason)}`
      );
      return response.data.data;
    } catch (error: unknown) {
      console.log("Deactivate service bay error:", error);
      throw error;
    }
  },

  /**
   * Check bay availability
   */
  checkBayAvailability: async (
    bayId: string,
    data: BayAvailabilityRequest
  ): Promise<boolean> => {
    try {
      const response = await api.post(`/service-bays/${bayId}/availability`, data);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Check bay availability error:", error);
      throw error;
    }
  },

  /**
   * Get bay statistics
   */
  getBayStatistics: async (bayId: string): Promise<ServiceBayStatistics> => {
    try {
      const response = await api.get(`/service-bays/${bayId}/statistics`);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Get bay statistics error:", error);
      throw error;
    }
  },

  /**
   * Validate bay name
   */
  validateBayName: async (
    branchId: string,
    bayName: string,
    bayId?: string
  ): Promise<boolean> => {
    try {
      const queryParams = new URLSearchParams({
        branch_id: branchId,
        bay_name: bayName
      });
      if (bayId) queryParams.append("bay_id", bayId);

      const response = await api.get(
        `/service-bays/validate-name?${queryParams.toString()}`
      );
      return response.data.data;
    } catch (error: unknown) {
      console.log("Validate bay name error:", error);
      throw error;
    }
  }
};
