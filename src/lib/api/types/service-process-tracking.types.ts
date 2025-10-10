/**
 * Service Process Tracking Management Types
 * Type definitions for service process tracking-related API requests and responses
 */

export interface ServiceProcessTrackingInfoDto {
  id: string;
  bookingId: string;
  bookingCode?: string;
  customerName?: string;
  vehicleLicensePlate?: string;
  serviceProcessId: string;
  serviceProcessName?: string;
  technicianId: string;
  technicianName?: string;
  bayId?: string;
  bayName?: string;
  status: TrackingStatus;
  currentStepId?: string;
  currentStepName?: string;
  progress: number; // 0-100
  startTime?: string;
  endTime?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  notes?: string;
  evidenceMedia?: string[];
  steps: TrackingStepInfo[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
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
  CANCELLED = "CANCELLED",
  PAUSED = "PAUSED"
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
  serviceProcessId: string;
  technicianId: string;
  bayId?: string;
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
