/**
 * Booking Management Types
 * Type definitions for booking-related API requests and responses
 */

export interface BookingInfoDto {
  id: string;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  vehicleLicensePlate: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleType?: string;
  branchId: string;
  branchName?: string;
  serviceId: string;
  serviceName?: string;
  servicePackageId?: string;
  servicePackageName?: string;
  bookingDate: string;
  bookingTime: string;
  estimatedDuration?: number;
  actualDuration?: number;
  status: BookingStatus;
  notes?: string;
  totalAmount?: number;
  paidAmount?: number;
  remainingAmount?: number;
  paymentStatus?: PaymentStatus;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  serviceBayId?: string;
  serviceBayName?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CHECKED_IN = "CHECKED_IN",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  NO_SHOW = "NO_SHOW"
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PARTIAL = "PARTIAL",
  PAID = "PAID",
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

export interface CreateBookingRequest {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  vehicleLicensePlate: string;
  vehicleBrandId?: string;
  vehicleModelId?: string;
  vehicleTypeId?: string;
  branchId: string;
  serviceId: string;
  servicePackageId?: string;
  bookingDate: string;
  bookingTime: string;
  notes?: string;
  estimatedDuration?: number;
}

export interface UpdateBookingRequest {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  vehicleLicensePlate?: string;
  vehicleBrandId?: string;
  vehicleModelId?: string;
  vehicleTypeId?: string;
  branchId?: string;
  serviceId?: string;
  servicePackageId?: string;
  bookingDate?: string;
  bookingTime?: string;
  notes?: string;
  estimatedDuration?: number;
  status?: BookingStatus;
  assignedTechnicianId?: string;
  serviceBayId?: string;
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
