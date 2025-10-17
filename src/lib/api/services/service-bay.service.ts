import apiClient from "../axios";
import {
  ServiceBay,
  ServiceBayResponse,
  CreateServiceBayRequest,
  UpdateServiceBayRequest,
  ServiceBayFilterParam,
  ServiceBayDropdownItem,
  BayAvailabilityRequest,
  ServiceBayStatistics,
  BayStatus,
  AvailableTechnician,
  BulkAssignTechnicianRequest,
  TechnicianAssignmentRequest
} from "../types/service-bay.types";

export class ServiceBayService {
  /**
   * Get all service bays with pagination and filtering
   */
  static async getAllServiceBays(
    params: ServiceBayFilterParam = {}
  ): Promise<ServiceBayResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination params
      if (params.page !== undefined) queryParams.append("page", params.page.toString());
      if (params.size !== undefined) queryParams.append("size", params.size.toString());
      if (params.sort) queryParams.append("sort", params.sort);
      if (params.direction) queryParams.append("direction", params.direction);
      
      // Add filter params - using correct parameter names from backend
      if (params.branch_id && params.branch_id.trim()) {
        queryParams.append("branchId", params.branch_id.trim());
      }
      if (params.status && params.status.trim()) {
        queryParams.append("status", params.status.trim());
      }
      if (params.search && params.search.trim()) {
        queryParams.append("keyword", params.search.trim());
      }

      const url = `/service-bays/get-all?${queryParams.toString()}`;
      console.log("ServiceBay API URL:", url);
      console.log("Filter params:", params);
      
      const response = await apiClient.get(url);

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
  }

  /**
   * Get service bay by ID
   */
  static async getServiceBayById(bayId: string): Promise<ServiceBay> {
    try {
      const response = await apiClient.get(`/service-bays/${bayId}`);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Get service bay by ID error:", error);
      throw error;
    }
  }

  /**
   * Get service bays by branch
   */
  static async getServiceBaysByBranch(branchId: string): Promise<ServiceBay[]> {
    try {
      const response = await apiClient.get(`/service-bays/branch/${branchId}`);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Get service bays by branch error:", error);
      throw error;
    }
  }

  // getServiceBaysByType removed as BayType is no longer used

  /**
   * Get active service bays
   */
  static async getActiveServiceBays(branchId?: string): Promise<ServiceBay[]> {
    try {
      const params = branchId ? `?branchId=${branchId}` : "";
      const response = await apiClient.get(`/service-bays/active${params}`);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Get active service bays error:", error);
      throw error;
    }
  }

  /**
   * Get available service bays in time range
   */
  static async getAvailableServiceBays(
    branchId: string,
    startTime: string,
    endTime: string
  ): Promise<ServiceBay[]> {
    try {
      const queryParams = new URLSearchParams({
        branchId: branchId,
        startTime: startTime,
        endTime: endTime
      });

      const response = await apiClient.get(
        `/service-bays/available?${queryParams.toString()}`
      );
      return response.data.data;
    } catch (error: unknown) {
      console.log("Get available service bays error:", error);
      throw error;
    }
  }

  /**
   * Get service bays dropdown
   */
  static async getServiceBaysDropdown(
    branchId?: string
  ): Promise<ServiceBayDropdownItem[]> {
    try {
      const queryParams = new URLSearchParams();
      if (branchId) queryParams.append("branchId", branchId);

      const response = await apiClient.get(
        `/service-bays/dropdown?${queryParams.toString()}`
      );
      return response.data.data;
    } catch (error: unknown) {
      console.log("Get service bays dropdown error:", error);
      throw error;
    }
  }

  /**
   * Search service bays
   */
  static async searchServiceBays(
    keyword: string,
    branchId?: string
  ): Promise<ServiceBay[]> {
    try {
      const queryParams = new URLSearchParams({ keyword });
      if (branchId) queryParams.append("branchId", branchId);

      const response = await apiClient.get(
        `/service-bays/search?${queryParams.toString()}`
      );
      return response.data.data;
    } catch (error: unknown) {
      console.log("Search service bays error:", error);
      throw error;
    }
  }

  /**
   * Create new service bay
   */
  static async createServiceBay(data: CreateServiceBayRequest): Promise<ServiceBay> {
    try {
      const response = await apiClient.post("/service-bays/create", data);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Create service bay error:", error);
      throw error;
    }
  }

  /**
   * Update service bay
   */
  static async updateServiceBay(
    bayId: string,
    data: UpdateServiceBayRequest
  ): Promise<ServiceBay> {
    try {
      const response = await apiClient.post(`/service-bays/${bayId}/update`, data);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Update service bay error:", error);
      throw error;
    }
  }

  /**
   * Delete service bay
   */
  static async deleteServiceBay(bayId: string): Promise<void> {
    try {
      await apiClient.post(`/service-bays/${bayId}/delete`);
    } catch (error: unknown) {
      console.log("Delete service bay error:", error);
      throw error;
    }
  }

  /**
   * Update service bay status
   */
  static async updateServiceBayStatus(
    bayId: string,
    status: BayStatus,
    reason?: string
  ): Promise<ServiceBay> {
    try {
      const queryParams = new URLSearchParams({ status });
      if (reason) queryParams.append("reason", reason);

      const response = await apiClient.post(
        `/service-bays/${bayId}/status?${queryParams.toString()}`
      );
      return response.data.data;
    } catch (error: unknown) {
      console.log("Update service bay status error:", error);
      throw error;
    }
  }

  /**
   * Activate service bay
   */
  static async activateServiceBay(bayId: string): Promise<ServiceBay> {
    try {
      const response = await apiClient.post(`/service-bays/${bayId}/activate`);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Activate service bay error:", error);
      throw error;
    }
  }

  /**
   * Deactivate service bay
   */
  static async deactivateServiceBay(
    bayId: string,
    reason: string
  ): Promise<ServiceBay> {
    try {
      const response = await apiClient.post(
        `/service-bays/${bayId}/deactivate?reason=${encodeURIComponent(reason)}`
      );
      return response.data.data;
    } catch (error: unknown) {
      console.log("Deactivate service bay error:", error);
      throw error;
    }
  }

  /**
   * Check bay availability
   */
  static async checkBayAvailability(
    bayId: string,
    data: BayAvailabilityRequest
  ): Promise<boolean> {
    try {
      const response = await apiClient.post(`/service-bays/${bayId}/availability`, data);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Check bay availability error:", error);
      throw error;
    }
  }

  /**
   * Get bay statistics
   */
  static async getBayStatistics(bayId: string): Promise<ServiceBayStatistics> {
    try {
      const response = await apiClient.get(`/service-bays/${bayId}/statistics`);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Get bay statistics error:", error);
      throw error;
    }
  }

  /**
   * Validate bay name
   */
  static async validateBayName(
    branchId: string,
    bayName: string,
    bayId?: string
  ): Promise<boolean> {
    try {
      const queryParams = new URLSearchParams({
        branchId: branchId,
        bayName: bayName
      });
      if (bayId) queryParams.append("bayId", bayId);

      const response = await apiClient.get(
        `/service-bays/validate-name?${queryParams.toString()}`
      );
      return response.data.data;
    } catch (error: unknown) {
      console.log("Validate bay name error:", error);
      throw error;
    }
  }

  /**
   * Get bay bookings
   */
  static async getBayBookings(bayId: string): Promise<unknown[]> {
    try {
      const response = await apiClient.get(`/service-bays/${bayId}/bookings`);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Get bay bookings error:", error);
      throw error;
    }
  }

  // ==================== TECHNICIAN MANAGEMENT METHODS ====================

  /**
   * Get available technicians for service bay assignment
   */
  static async getAvailableTechnicians(): Promise<AvailableTechnician[]> {
    try {
      const response = await apiClient.get("/service-bays/available-technicians");
      return response.data.data;
    } catch (error: unknown) {
      console.log("Get available technicians error:", error);
      throw error;
    }
  }

  /**
   * Bulk assign technicians to service bay
   */
  static async bulkAssignTechnicians(
    bayId: string,
    data: BulkAssignTechnicianRequest
  ): Promise<ServiceBay> {
    try {
      const response = await apiClient.post(`/service-bays/${bayId}/assign-technicians`, data);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Bulk assign technicians error:", error);
      throw error;
    }
  }

  /**
   * Assign single technician to service bay
   */
  static async assignTechnician(
    bayId: string,
    data: TechnicianAssignmentRequest
  ): Promise<ServiceBay> {
    try {
      const response = await apiClient.post(`/service-bays/${bayId}/assign-technician`, data);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Assign technician error:", error);
      throw error;
    }
  }

  /**
   * Remove technician from service bay
   */
  static async removeTechnician(
    bayId: string,
    technicianId: string
  ): Promise<ServiceBay> {
    try {
      const response = await apiClient.post(`/service-bays/${bayId}/remove-technician/${technicianId}`);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Remove technician error:", error);
      throw error;
    }
  }

  /**
   * Update technician status in service bay
   */
  static async updateTechnicianStatus(
    bayId: string,
    technicianId: string,
    status: string,
    notes?: string
  ): Promise<ServiceBay> {
    try {
      const data = { status, notes };
      const response = await apiClient.post(`/service-bays/${bayId}/technician/${technicianId}/status`, data);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Update technician status error:", error);
      throw error;
    }
  }

  /**
   * Get technicians assigned to service bay
   */
  static async getBayTechnicians(bayId: string): Promise<AvailableTechnician[]> {
    try {
      const response = await apiClient.get(`/service-bays/${bayId}/technicians`);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Get bay technicians error:", error);
      throw error;
    }
  }
}
