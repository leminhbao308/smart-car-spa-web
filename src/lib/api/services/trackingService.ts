/**
 * Service Process Tracking Service
 * API service for service process tracking operations
 */

import apiClient from '../axios';
import {
  ServiceProcessTrackingInfoDto,
  ServiceProcessTrackingFilterParam,
  CreateServiceProcessTrackingRequest,
  UpdateServiceProcessTrackingRequest,
  StartStepRequest,
  ProgressUpdateRequest,
  CompleteStepRequest,
  CancelStepRequest,
  TrackingStatus
} from '../types/service-process-tracking.types';

export class TrackingService {
  private static readonly BASE_URL = '/service-process-tracking';

  /**
   * Create new tracking
   */
  static async createTracking(request: CreateServiceProcessTrackingRequest) {
    const response = await apiClient.post(`${this.BASE_URL}/create`, request);
    return response.data;
  }

  /**
   * Get all trackings with pagination
   */
  static async getAllTrackings(filterParam?: ServiceProcessTrackingFilterParam, pageable?: any) {
    const response = await apiClient.get(this.BASE_URL, {
      params: { ...filterParam, ...pageable }
    });
    return response.data;
  }

  /**
   * Get tracking by ID
   */
  static async getTrackingById(trackingId: string) {
    const response = await apiClient.get(`${this.BASE_URL}/${trackingId}`);
    return response.data;
  }

  /**
   * Update tracking
   */
  static async updateTracking(trackingId: string, request: UpdateServiceProcessTrackingRequest) {
    const response = await apiClient.post(`${this.BASE_URL}/${trackingId}/update`, request);
    return response.data;
  }

  /**
   * Delete tracking
   */
  static async deleteTracking(trackingId: string) {
    const response = await apiClient.post(`${this.BASE_URL}/${trackingId}/delete`);
    return response.data;
  }

  /**
   * Get trackings by booking
   */
  static async getTrackingsByBooking(bookingId: string) {
    const response = await apiClient.get(`${this.BASE_URL}/booking/${bookingId}`);
    return response.data;
  }

  /**
   * Get trackings by technician
   */
  static async getTrackingsByTechnician(technicianId: string) {
    const response = await apiClient.get(`${this.BASE_URL}/technician/${technicianId}`);
    return response.data;
  }

  /**
   * Get trackings by bay
   */
  static async getTrackingsByBay(bayId: string) {
    const response = await apiClient.get(`${this.BASE_URL}/bay/${bayId}`);
    return response.data;
  }

  /**
   * Get in-progress trackings
   */
  static async getInProgressTrackings() {
    const response = await apiClient.get(`${this.BASE_URL}/in-progress`);
    return response.data;
  }

  /**
   * Start step
   */
  static async startStep(trackingId: string, request: StartStepRequest) {
    const response = await apiClient.post(`${this.BASE_URL}/${trackingId}/start-step`, request);
    return response.data;
  }

  /**
   * Update progress
   */
  static async updateProgress(trackingId: string, request: ProgressUpdateRequest) {
    const response = await apiClient.post(`${this.BASE_URL}/${trackingId}/update-progress`, request);
    return response.data;
  }

  /**
   * Complete step
   */
  static async completeStep(trackingId: string, request: CompleteStepRequest) {
    const response = await apiClient.post(`${this.BASE_URL}/${trackingId}/complete-step`, request);
    return response.data;
  }

  /**
   * Cancel step
   */
  static async cancelStep(trackingId: string, request: CancelStepRequest) {
    const response = await apiClient.post(`${this.BASE_URL}/${trackingId}/cancel-step`, request);
    return response.data;
  }

  /**
   * Add note
   */
  static async addNote(trackingId: string, request: ProgressUpdateRequest) {
    const response = await apiClient.post(`${this.BASE_URL}/${trackingId}/add-note`, request);
    return response.data;
  }

  /**
   * Add evidence media
   */
  static async addEvidenceMedia(trackingId: string, mediaUrl: string) {
    const response = await apiClient.post(`${this.BASE_URL}/${trackingId}/add-evidence`, null, {
      params: { mediaUrl }
    });
    return response.data;
  }
}

export default TrackingService;
