/**
 * Booking Management Types
 * Type definitions for booking-related API requests and responses
 * Updated to match backend BookingInfoDto
 */

export interface BookingInfoDto {
  // Core booking info
  booking_id: string;
  booking_code: string;
  booking_type: BookingType; // SCHEDULED or WALK_IN - REQUIRED
  
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
  
  // Branch and bay information
  branch_id: string;
  branch_name?: string;
  branch_code?: string;
  bay_id?: string;
  bay_name?: string;
  bay_type?: string;
  
  // Scheduling information
  preferred_start_at?: string;
  scheduled_start_at?: string;
  scheduled_end_at?: string;
  actual_check_in_at?: string;
  actual_start_at?: string;
  actual_end_at?: string;
  
  // Duration information
  estimated_duration_minutes?: number;
  actual_duration_minutes?: number;
  
  // Pricing information
  total_price?: number;
  currency?: string;
  
  // Status information
  payment_status?: PaymentStatus;
  status: BookingStatus;
  
  // Additional information
  notes?: string;
  
  // Cancellation information
  cancellation_reason?: string;
  cancelled_at?: string;
  cancelled_by?: string;
  
  // Audit information
  created_at: string;
  updated_at: string;
  created_by?: string;
  modified_by?: string;
  
  // Related data
  booking_items?: BookingItemInfoDto[];
  
  // Computed fields
  is_active?: boolean;
  is_cancelled?: boolean;
  is_completed?: boolean;
  needs_payment?: boolean;
  is_fully_paid?: boolean;
  total_estimated_duration?: number;
}

export enum BookingType {
  SCHEDULED = "SCHEDULED",
  WALK_IN = "WALK_IN"
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
  booking_item_id?: string; // ID của booking item (cần để xóa item)
  service_id?: string;
  service_name?: string;
  service_description?: string;
  unit_price?: number;
  duration_minutes?: number;
  item_status?: string;
  notes?: string;
  display_order?: number;
  is_completed?: boolean;
  is_in_progress?: boolean;
}

// New integrated booking request type based on BookingInfoDto
export interface CreateBookingWithScheduleRequest {
  // Customer information
  customer_id?: string; // nullable nếu là guest
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  
  // Vehicle information
  vehicle_id?: string; // nullable nếu chưa có profile
  vehicle_license_plate: string;
  vehicle_brand_name?: string;
  vehicle_model_name?: string;
  vehicle_type_name?: string;
  vehicle_year?: number;
  vehicle_color?: string;
  
  // Branch information
  branch_id: string;
  
  // Scheduling information - REQUIRED for this integrated API
  selected_schedule: {
    bay_id: string;
    date: string; // YYYY-MM-DD format
    start_time: string; // HH:mm format
    service_duration_minutes: number;
  };
  
  // Booking items
  booking_items: CreateBookingItemRequest[];
  
  // Pricing information
  total_price: number;
  currency?: string; // Default: "VND"
  
  // Scheduling information
  estimated_duration_minutes?: number;
  preferred_start_at?: string; // ISO string format
  scheduled_start_at?: string; // ISO string format
  scheduled_end_at?: string; // ISO string format
  
  // Additional information
  notes?: string;
  
  // Note: bookingType is automatically set to SCHEDULED by backend for this API
}

// CreateBookingItemRequest - Dùng trong booking_items array
export interface CreateBookingItemRequest {
  service_id?: string; // UUID, optional - ID của service
  service_name: string; // String, REQUIRED - Tên service
  service_description?: string; // String, optional - Mô tả service
  operation?: "DELETE"; // String enum, optional - Operation type - chỉ có giá trị "DELETE"
  booking_item_id?: string; // UUID, optional - ID của booking item - chỉ cần khi operation = "DELETE"
}

export interface UpdateBookingRequest {
  // Customer information
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  
  // Vehicle information
  vehicle_license_plate?: string;
  vehicle_brand_name?: string;
  vehicle_model_name?: string;
  vehicle_type_name?: string;
  vehicle_year?: number;
  vehicle_color?: string;
  
  // Branch and Service Bay information
  branch_id?: string;
  service_bay_id?: string;
  
  // Scheduling information
  preferred_start_at?: string;
  scheduled_start_at?: string;
  scheduled_end_at?: string;
  
  // Scheduling information (for calculating scheduled times)
  schedule_date?: string; // YYYY-MM-DD format
  schedule_start_time?: string; // HH:mm format
  
  // Duration information
  estimated_duration_minutes?: number;
  
  // Pricing information
  total_price?: number;
  currency?: string;
  
  // Status information
  payment_status?: PaymentStatus;
  status?: BookingStatus;
  
  // Additional information
  notes?: string;
  
  // Booking items - Array of items to add/update/delete
  booking_items?: CreateBookingItemRequest[];
}

/**
 * Request to change booking schedule
 * Renamed from ChangeSlotRequest
 */
export interface ChangeScheduleRequest {
  new_bay_id: string;
  new_schedule_date: string; // YYYY-MM-DD format
  new_schedule_start_time: string; // HH:mm format
  service_duration_minutes: number;
  reason?: string;
  changed_by?: string;
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

// ==================== TIME RANGE TYPES ====================

/**
 * Time range DTO - represents an available time range
 * Backend uses snake_case in JSON response
 */
export interface TimeRangeDto {
  start_time: string; // HH:mm format
  end_time: string; // HH:mm format
}

/**
 * Working hours DTO
 * Backend uses snake_case: "start" and "end" (not "start_time" and "end_time")
 */
export interface WorkingHoursDto {
  start: string; // HH:mm format
  end: string; // HH:mm format
}

/**
 * Available time ranges response
 * Backend uses snake_case in JSON response
 */
export interface AvailableTimeRangesResponse {
  date: string; // YYYY-MM-DD format
  bay_id: string;
  bay_name: string;
  working_hours: WorkingHoursDto;
  available_time_ranges: TimeRangeDto[];
}

/**
 * Request to get available time ranges
 */
export interface GetAvailableTimeRangesRequest {
  bay_id: string;
  date: string; // YYYY-MM-DD format
  duration_minutes?: number; // Optional - for future filtering
}
