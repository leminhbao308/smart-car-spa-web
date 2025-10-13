/**
 * Booking Management Types
 * Type definitions for booking-related API requests and responses
 * Updated to match backend BookingInfoDto
 */

export interface BookingInfoDto {
  // Core booking info
  bookingId: string;
  bookingCode: string;
  
  // Customer information
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  
  // Vehicle information
  vehicleId?: string;
  vehicleLicensePlate: string;
  vehicleBrandName?: string;
  vehicleModelName?: string;
  vehicleTypeName?: string;
  vehicleYear?: number;
  vehicleColor?: string;
  
  // Branch and bay information
  branchId: string;
  branchName?: string;
  branchCode?: string;
  bayId?: string;
  bayName?: string;
  bayType?: string;
  
  // Scheduling information
  preferredStartAt?: string;
  scheduledStartAt?: string;
  scheduledEndAt?: string;
  actualCheckInAt?: string;
  actualStartAt?: string;
  actualEndAt?: string;
  
  // Duration information
  estimatedDurationMinutes?: number;
  bufferMinutes?: number;
  actualDurationMinutes?: number;
  
  // Pricing information
  totalPrice?: number;
  currency?: string;
  depositAmount?: number;
  
  // Status information
  paymentStatus?: PaymentStatus;
  status: BookingStatus;
  priority?: Priority;
  
  // Additional information
  couponCode?: string;
  notes?: string;
  specialRequests?: string[];
  
  // Cancellation information
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  
  // Audit information
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  modifiedBy?: string;
  
  // Related data
  bookingItems?: BookingItemInfoDto[];
  assignments?: BookingAssignmentInfoDto[];
  payments?: BookingPaymentInfoDto[];
  
  // Computed fields
  isActive?: boolean;
  isCancelled?: boolean;
  isCompleted?: boolean;
  needsPayment?: boolean;
  isFullyPaid?: boolean;
  totalEstimatedDuration?: number;
}

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED", 
  CHECKED_IN = "CHECKED_IN",
  IN_PROGRESS = "IN_PROGRESS",
  PAUSED = "PAUSED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  NO_SHOW = "NO_SHOW"
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  PARTIAL = "PARTIAL",
  REFUNDED = "REFUNDED"
}

export enum Priority {
  NORMAL = "NORMAL",
  HIGH = "HIGH", 
  URGENT = "URGENT"
}

export interface BookingFilterParam {
  page?: number;
  size?: number;
  status?: BookingStatus;
  branchId?: string;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sort?: string;
  direction?: "ASC" | "DESC";
}

// Related DTOs
export interface BookingItemInfoDto {
  bookingItemId: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  quantity: number;
  totalPrice: number;
  notes?: string;
}

export interface BookingAssignmentInfoDto {
  assignmentId: string;
  technicianId: string;
  technicianName: string;
  technicianCode: string;
  role: string;
  assignedAt: string;
}

export interface BookingPaymentInfoDto {
  paymentId: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  paidAt?: string;
  notes?: string;
}

export interface CreateBookingRequest {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  vehicleLicensePlate: string;
  vehicleBrandName?: string;
  vehicleModelName?: string;
  vehicleTypeName?: string;
  vehicleYear?: number;
  vehicleColor?: string;
  branchId: string;
  bayId?: string;
  preferredStartAt: string;
  scheduledStartAt?: string;
  scheduledEndAt?: string;
  estimatedDurationMinutes?: number;
  bufferMinutes?: number;
  totalPrice?: number;
  currency?: string;
  depositAmount?: number;
  priority?: Priority;
  couponCode?: string;
  notes?: string;
  specialRequests?: string[];
  bookingItems: {
    serviceId: string;
    quantity: number;
    notes?: string;
  }[];
  assignments: {
    technicianId: string;
    role: string;
  }[];
}

export interface UpdateBookingRequest {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  vehicleLicensePlate?: string;
  vehicleBrandName?: string;
  vehicleModelName?: string;
  vehicleTypeName?: string;
  vehicleYear?: number;
  vehicleColor?: string;
  branchId?: string;
  bayId?: string;
  preferredStartAt?: string;
  scheduledStartAt?: string;
  scheduledEndAt?: string;
  estimatedDurationMinutes?: number;
  bufferMinutes?: number;
  totalPrice?: number;
  currency?: string;
  depositAmount?: number;
  priority?: Priority;
  couponCode?: string;
  notes?: string;
  specialRequests?: string[];
  status?: BookingStatus;
  bookingItems?: {
    serviceId: string;
    quantity: number;
    notes?: string;
  }[];
  assignments?: {
    technicianId: string;
    role: string;
  }[];
}

export interface BookingStatisticsDto {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  inProgressBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  noShowBookings: number;
  totalRevenue: number;
  averageServiceTime: number;
  customerSatisfactionScore?: number;
}

export interface BookingResponse {
  success: boolean;
  message: string;
  data: BookingInfoDto;
}

export interface BookingListResponse {
  success: boolean;
  message: string;
  data: BookingInfoDto[];
}

export interface BookingStatisticsResponse {
  success: boolean;
  message: string;
  data: BookingStatisticsDto;
}
