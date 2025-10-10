/**
 * Service Process Tracking Management Service
 * Handles all service process tracking-related API calls
 */

import apiClient from "../axios";
import {
  ServiceProcessTrackingInfoDto,
  ServiceProcessTrackingFilterParam,
  CreateServiceProcessTrackingRequest,
  UpdateServiceProcessTrackingRequest,
  StartStepRequest,
  ProgressUpdateRequest,
  CompleteStepRequest,
  CancelStepRequest,
} from "../types";

export class ServiceProcessTrackingService {
  /**
   * Create new tracking
   */
  static async createTracking(
    trackingData: CreateServiceProcessTrackingRequest
  ): Promise<ServiceProcessTrackingInfoDto> {
    try {
      console.log("Creating service process tracking with data:", trackingData);

      const response = await apiClient.post("/service-process-tracking/create", trackingData);
      console.log("Create service process tracking API response:", response);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to create service process tracking");
      }
    } catch (error) {
      console.error("Create service process tracking error:", error);
      throw error;
    }
  }

  /**
   * Get all trackings with pagination and filtering
   */
  static async getAllTrackings(
    filterParam?: ServiceProcessTrackingFilterParam,
    pageable?: { page: number; size: number; sort?: string; direction?: string }
  ): Promise<ServiceProcessTrackingInfoDto[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filterParam) {
        if (filterParam.bookingId) {
          queryParams.append("bookingId", filterParam.bookingId);
        }
        if (filterParam.technicianId) {
          queryParams.append("technicianId", filterParam.technicianId);
        }
        if (filterParam.bayId) {
          queryParams.append("bayId", filterParam.bayId);
        }
        if (filterParam.status) {
          queryParams.append("status", filterParam.status);
        }
        if (filterParam.dateFrom) {
          queryParams.append("dateFrom", filterParam.dateFrom);
        }
        if (filterParam.dateTo) {
          queryParams.append("dateTo", filterParam.dateTo);
        }
      }

      if (pageable) {
        queryParams.append("page", pageable.page.toString());
        queryParams.append("size", pageable.size.toString());
        if (pageable.sort) {
          queryParams.append("sort", pageable.sort);
        }
        if (pageable.direction) {
          queryParams.append("direction", pageable.direction);
        }
      }

      const url = `/service-process-tracking/get-all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(url);

      if (response.data.success) {
        return response.data.data || response.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch service process trackings");
      }
    } catch (error) {
      console.error("Get all service process trackings error:", error);
      throw error;
    }
  }

  /**
   * Get tracking by ID
   */
  static async getTrackingById(trackingId: string): Promise<ServiceProcessTrackingInfoDto> {
    try {
      const response = await apiClient.get(`/service-process-tracking/${trackingId}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch service process tracking");
      }
    } catch (error) {
      console.error("Get service process tracking by ID error:", error);
      throw error;
    }
  }

  /**
   * Update tracking
   */
  static async updateTracking(
    trackingId: string,
    trackingData: UpdateServiceProcessTrackingRequest
  ): Promise<ServiceProcessTrackingInfoDto> {
    try {
      console.log("Updating service process tracking with data:", trackingData);

      const response = await apiClient.post(`/service-process-tracking/${trackingId}/update`, trackingData);
      console.log("Update service process tracking API response:", response);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to update service process tracking");
      }
    } catch (error) {
      console.error("Update service process tracking error:", error);
      throw error;
    }
  }

  /**
   * Delete tracking
   */
  static async deleteTracking(trackingId: string): Promise<void> {
    try {
      console.log("Deleting service process tracking with ID:", trackingId);

      const response = await apiClient.post(`/service-process-tracking/${trackingId}/delete`);
      console.log("Delete service process tracking API response:", response);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete service process tracking");
      }
    } catch (error) {
      console.error("Delete service process tracking error:", error);
      throw error;
    }
  }

  /**
   * Get trackings by booking
   */
  static async getTrackingsByBooking(bookingId: string): Promise<ServiceProcessTrackingInfoDto[]> {
    try {
      const response = await apiClient.get(`/service-process-tracking/booking/${bookingId}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch trackings by booking");
      }
    } catch (error) {
      console.error("Get trackings by booking error:", error);
      throw error;
    }
  }

  /**
   * Get trackings by technician
   */
  static async getTrackingsByTechnician(technicianId: string): Promise<ServiceProcessTrackingInfoDto[]> {
    try {
      const response = await apiClient.get(`/service-process-tracking/technician/${technicianId}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch trackings by technician");
      }
    } catch (error) {
      console.error("Get trackings by technician error:", error);
      throw error;
    }
  }

  /**
   * Get trackings by bay
   */
  static async getTrackingsByBay(bayId: string): Promise<ServiceProcessTrackingInfoDto[]> {
    try {
      const response = await apiClient.get(`/service-process-tracking/bay/${bayId}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch trackings by bay");
      }
    } catch (error) {
      console.error("Get trackings by bay error:", error);
      throw error;
    }
  }

  /**
   * Get in-progress trackings
   */
  static async getInProgressTrackings(): Promise<ServiceProcessTrackingInfoDto[]> {
    try {
      const response = await apiClient.get("/service-process-tracking/in-progress");

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch in-progress trackings");
      }
    } catch (error) {
      console.error("Get in-progress trackings error:", error);
      throw error;
    }
  }

  /**
   * Start step
   */
  static async startStep(
    trackingId: string,
    stepData: StartStepRequest
  ): Promise<ServiceProcessTrackingInfoDto> {
    try {
      console.log("Starting step for tracking with data:", stepData);

      const response = await apiClient.post(`/service-process-tracking/${trackingId}/start-step`, stepData);
      console.log("Start step API response:", response);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to start step");
      }
    } catch (error) {
      console.error("Start step error:", error);
      throw error;
    }
  }

  /**
   * Update progress
   */
  static async updateProgress(
    trackingId: string,
    progressData: ProgressUpdateRequest
  ): Promise<ServiceProcessTrackingInfoDto> {
    try {
      console.log("Updating progress for tracking with data:", progressData);

      const response = await apiClient.post(`/service-process-tracking/${trackingId}/update-progress`, progressData);
      console.log("Update progress API response:", response);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to update progress");
      }
    } catch (error) {
      console.error("Update progress error:", error);
      throw error;
    }
  }

  /**
   * Complete step
   */
  static async completeStep(
    trackingId: string,
    stepData: CompleteStepRequest
  ): Promise<ServiceProcessTrackingInfoDto> {
    try {
      console.log("Completing step for tracking with data:", stepData);

      const response = await apiClient.post(`/service-process-tracking/${trackingId}/complete-step`, stepData);
      console.log("Complete step API response:", response);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to complete step");
      }
    } catch (error) {
      console.error("Complete step error:", error);
      throw error;
    }
  }

  /**
   * Cancel step
   */
  static async cancelStep(
    trackingId: string,
    stepData: CancelStepRequest
  ): Promise<ServiceProcessTrackingInfoDto> {
    try {
      console.log("Cancelling step for tracking with data:", stepData);

      const response = await apiClient.post(`/service-process-tracking/${trackingId}/cancel-step`, stepData);
      console.log("Cancel step API response:", response);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to cancel step");
      }
    } catch (error) {
      console.error("Cancel step error:", error);
      throw error;
    }
  }

  /**
   * Add note
   */
  static async addNote(
    trackingId: string,
    noteData: ProgressUpdateRequest
  ): Promise<ServiceProcessTrackingInfoDto> {
    try {
      console.log("Adding note for tracking with data:", noteData);

      const response = await apiClient.post(`/service-process-tracking/${trackingId}/add-note`, noteData);
      console.log("Add note API response:", response);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to add note");
      }
    } catch (error) {
      console.error("Add note error:", error);
      throw error;
    }
  }

  /**
   * Add evidence media
   */
  static async addEvidenceMedia(
    trackingId: string,
    mediaUrl: string
  ): Promise<ServiceProcessTrackingInfoDto> {
    try {
      console.log("Adding evidence media for tracking:", trackingId);

      const response = await apiClient.post(`/service-process-tracking/${trackingId}/add-evidence`, {
        mediaUrl
      });
      console.log("Add evidence media API response:", response);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to add evidence media");
      }
    } catch (error) {
      console.error("Add evidence media error:", error);
      throw error;
    }
  }
}
