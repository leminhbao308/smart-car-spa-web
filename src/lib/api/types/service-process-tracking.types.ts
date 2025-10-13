/**
 * Service Process Tracking Management Types
 * Type definitions for service process tracking-related API requests and responses
 * Updated to match backend ServiceProcessTrackingInfoDto
 */

export interface ServiceProcessTrackingInfoDto {
  // Core tracking info
  trackingId: string;
  
  // Booking information
  bookingId: string;
  bookingCode?: string;
  customerName?: string;
  customerPhone?: string;
  vehicleLicensePlate?: string;
  
  // Service step information
  serviceStepId: string;
  serviceStepName?: string;
  serviceStepDescription?: string;
  serviceStepOrder?: number;
  estimatedTime?: number;
  isRequired?: boolean;
  
  // Technician information
  technicianId: string;
  technicianName?: string;
  technicianCode?: string;
  
  // Bay information
  bayId: string;
  bayName?: string;
  bayCode?: string;
  
  // Timing information
  startTime?: string;
  endTime?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  
  // Status and progress
  status: TrackingStatus;
  progressPercent?: number;
  
  // Additional information
  notes?: string;
  evidenceMediaUrls?: string;
  
  // Last update information
  lastUpdatedBy?: string;
  lastUpdatedByName?: string;
  lastUpdatedAt?: string;
  
  // Audit information
  createdAt: string;
  modifiedAt: string;
  createdBy?: string;
  modifiedBy?: string;
  
  // Calculated fields
  efficiency?: number;
  statusDisplay?: string;
  durationDisplay?: string;
  progressDisplay?: string;
}

export interface TrackingStepInfo {
  stepId: string;
  stepName: string;
  stepOrder: number;
  status: StepStatus;
  startTime?: string;
  endTime?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  progress: number; // 0-100
  notes?: string;
  evidenceMedia?: string[];
  products?: TrackingStepProductInfo[];
}

export interface TrackingStepProductInfo {
  productId: string;
  productName: string;
  quantity: number;
  unit?: string;
  usedQuantity?: number;
  notes?: string;
}

export enum TrackingStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS", 
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

export enum StepStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  SKIPPED = "SKIPPED"
}

export interface ServiceProcessTrackingFilterParam {
  bookingId?: string;
  technicianId?: string;
  bayId?: string;
  status?: TrackingStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sort?: string;
  direction?: "ASC" | "DESC";
}

export interface CreateServiceProcessTrackingRequest {
  bookingId: string;
  serviceStepId: string;
  technicianId: string;
  bayId: string;
  notes?: string;
}

export interface UpdateServiceProcessTrackingRequest {
  technicianId?: string;
  bayId?: string;
  status?: TrackingStatus;
  notes?: string;
}

export interface StartStepRequest {
  stepId: string;
  notes?: string;
}

export interface ProgressUpdateRequest {
  progress?: number;
  notes?: string;
  evidenceMedia?: string[];
}

export interface CompleteStepRequest {
  stepId: string;
  notes?: string;
  evidenceMedia?: string[];
  products?: {
    productId: string;
    usedQuantity: number;
    notes?: string;
  }[];
}

export interface CancelStepRequest {
  stepId: string;
  reason: string;
  notes?: string;
}

export interface ServiceProcessTrackingResponse {
  success: boolean;
  message: string;
  data: ServiceProcessTrackingInfoDto;
}

export interface ServiceProcessTrackingListResponse {
  success: boolean;
  message: string;
  data: ServiceProcessTrackingInfoDto[];
}
