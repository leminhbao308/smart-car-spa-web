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
  bookingId?: string;
  itemType?: string;
  itemId: string;
  itemName: string;
  itemUrl?: string;
  itemDescription?: string;
  unitPrice: number;
  quantity: number;
  subtotalAmount: number;
  discountAmount?: number;
  taxAmount?: number;
  totalAmount: number;
  durationMinutes?: number;
  actualDurationMinutes?: number;
  itemStatus?: string;
  actualStartAt?: string;
  actualEndAt?: string;
  notes?: string;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  modifiedBy?: string;
  isCompleted?: boolean;
  isInProgress?: boolean;
  // Legacy fields for backward compatibility
  serviceId?: string;
  serviceName?: string;
  servicePrice?: number;
  totalPrice?: number;
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
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  vehicle_id: string;
  vehicle_license_plate: string;
  vehicle_brand_id: string;
  vehicle_brand_name?: string;
  vehicle_model_name?: string;
  vehicle_type_name?: string;
  vehicle_year?: number;
  vehicle_color?: string;
  branch_id: string;
  bay_id?: string;
  preferred_start_at: string;
  scheduled_start_at?: string;
  scheduled_end_at?: string;
  estimated_duration_minutes?: number;
  buffer_minutes?: number;
  total_price?: number;
  currency?: string;
  deposit_amount?: number;
  priority?: Priority;
  coupon_code?: string;
  notes?: string;
  special_requests?: string[];
  booking_items: {
    item_type: string;
    item_id: string;
    item_name: string;
    item_url?: string;
    item_description?: string;
    unit_price: number;
    quantity: number;
    duration_minutes?: number;
    discount_amount?: number;
    tax_amount?: number;
    notes?: string;
    display_order?: number;
  }[];
  assignments: {
    technician_id: string;
    role: string;
  }[];
  payments?: unknown[];
}

// New integrated booking request type based on BookingInfoDto
export interface CreateBookingWithSlotRequest {
  // Customer information
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  
  // Vehicle information
  vehicle_id?: string;
  vehicle_license_plate: string;
  vehicle_brand_name?: string;
  vehicle_model_name?: string;
  vehicle_type_name?: string;
  vehicle_year?: number;
  vehicle_color?: string;
  
  // Branch and slot information
  branch_id: string;
  
  // Selected slot information
  selected_slot: {
    bay_id: string;
    date: string; // YYYY-MM-DD format
    start_time: string; // HH:mm format
    service_duration_minutes: number;
  };
  
  // Booking items
  booking_items: {
    service_id: string;
    item_name?: string;
    item_description?: string;
    discount_amount?: number;
    tax_amount?: number;
  }[];
  
  // Pricing information
  total_price: number;
  currency?: string;
  deposit_amount?: number;
  
  // Additional information
  coupon_code?: string;
  notes?: string;
  special_requests?: string[];
}

export interface UpdateBookingRequest {
  customer_id?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  vehicle_id?: string;
  vehicle_license_plate?: string;
  vehicle_brand_id?: string;
  vehicle_brand_name?: string;
  vehicle_model_name?: string;
  vehicle_type_name?: string;
  vehicle_year?: number;
  vehicle_color?: string;
  branch_id?: string;
  bay_id?: string;
  preferred_start_at?: string;
  scheduled_start_at?: string;
  scheduled_end_at?: string;
  estimated_duration_minutes?: number;
  buffer_minutes?: number;
  total_price?: number;
  currency?: string;
  deposit_amount?: number;
  priority?: Priority;
  coupon_code?: string;
  notes?: string;
  special_requests?: string[];
  status?: BookingStatus;
  booking_items?: {
    item_type: string;
    item_id: string;
    item_name: string;
    item_url?: string;
    item_description?: string;
    unit_price: number;
    quantity: number;
    duration_minutes?: number;
    discount_amount?: number;
    tax_amount?: number;
    notes?: string;
    display_order?: number;
  }[];
  assignments?: {
    technician_id: string;
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
