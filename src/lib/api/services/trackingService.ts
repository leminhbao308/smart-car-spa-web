/**
 * Service Process Tracking Service
 * API service for service process tracking operations
 */

import apiClient from "../axios";
import {
  ServiceProcessTrackingFilterParam,
  CreateServiceProcessTrackingRequest,
  UpdateServiceProcessTrackingRequest,
  StartStepRequest,
  ProgressUpdateRequest,
  CompleteStepRequest,
  CancelStepRequest,
} from "../types/service-process-tracking.types";

export class TrackingService {
  private static readonly BASE_URL = "/service-process-trackings";

  /**
   * Create new tracking
   */
  static async createTracking(request: CreateServiceProcessTrackingRequest) {
    const response = await apiClient.post(`${this.BASE_URL}/create`, request);
    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to create tracking");
    }
  }

  /**
   * Get all trackings with pagination
   */
  static async getAllTrackings(
    filterParam?: ServiceProcessTrackingFilterParam,
    pageable?: any
  ) {
    const response = await apiClient.get(`${this.BASE_URL}/get-all`, {
      params: { ...filterParam, ...pageable },
    });
    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch trackings");
    }
  }

  /**
   * Get tracking by ID
   */
  static async getTrackingById(trackingId: string) {
    const response = await apiClient.get(`${this.BASE_URL}/${trackingId}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch tracking");
    }
  }

  /**
   * Update tracking
   */
  static async updateTracking(
    trackingId: string,
    request: UpdateServiceProcessTrackingRequest
  ) {
    const response = await apiClient.post(
      `${this.BASE_URL}/${trackingId}/update`,
      request
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to update tracking");
    }
  }

  /**
   * Delete tracking
   */
  static async deleteTracking(trackingId: string) {
    const response = await apiClient.post(
      `${this.BASE_URL}/${trackingId}/delete`
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete tracking");
    }
  }

  /**
   * Get trackings by booking
   */
  static async getTrackingsByBooking(bookingId: string) {
    const response = await apiClient.get(
      `${this.BASE_URL}/booking/${bookingId}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(
        response.data.message || "Failed to fetch trackings by booking"
      );
    }
  }

  /**
   * Get trackings by technician
   */
  static async getTrackingsByTechnician(technicianId: string) {
    const response = await apiClient.get(
      `${this.BASE_URL}/technician/${technicianId}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(
        response.data.message || "Failed to fetch trackings by technician"
      );
    }
  }

  /**
   * Get trackings by bay
   */
  static async getTrackingsByBay(bayId: string) {
    const response = await apiClient.get(`${this.BASE_URL}/bay/${bayId}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(
        response.data.message || "Failed to fetch trackings by bay"
      );
    }
  }

  /**
   * Get in-progress trackings
   */
  static async getInProgressTrackings() {
    const response = await apiClient.get(`${this.BASE_URL}/in-progress`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(
        response.data.message || "Failed to fetch in-progress trackings"
      );
    }
  }

  /**
   * Start step
   */
  static async startStep(trackingId: string, request: StartStepRequest) {
    const response = await apiClient.post(
      `${this.BASE_URL}/${trackingId}/start`,
      request
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to start step");
    }
  }

  /**
   * Update progress
   */
  static async updateProgress(
    trackingId: string,
    request: ProgressUpdateRequest
  ) {
    const response = await apiClient.post(
      `${this.BASE_URL}/${trackingId}/progress/update`,
      request
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to update progress");
    }
  }

  /**
   * Complete step
   */
  static async completeStep(trackingId: string, request: CompleteStepRequest) {
    const response = await apiClient.post(
      `${this.BASE_URL}/${trackingId}/complete`,
      request
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to complete step");
    }
  }

  /**
   * Cancel step
   */
  static async cancelStep(trackingId: string, request: CancelStepRequest) {
    const response = await apiClient.post(
      `${this.BASE_URL}/${trackingId}/cancel`,
      request
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to cancel step");
    }
  }

  /**
   * Add note
   */
  static async addNote(trackingId: string, request: ProgressUpdateRequest) {
    const response = await apiClient.post(
      `${this.BASE_URL}/${trackingId}/notes`,
      request
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to add note");
    }
  }

  /**
   * Add evidence media
   */
  static async addEvidenceMedia(trackingId: string, mediaUrl: string) {
    const response = await apiClient.post(
      `${this.BASE_URL}/${trackingId}/evidence`,
      null,
      {
        params: { mediaUrl },
      }
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to add evidence media");
    }
  }
}

export default TrackingService;
