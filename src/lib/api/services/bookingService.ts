import apiClient from "../axios";
import {
  BookingInfoDto,
  BookingFilterParam,
  CreateBookingWithScheduleRequest,
  UpdateBookingRequest,
  ChangeScheduleRequest,
  BookingStatisticsDto,
  BookingStatus,
  BookingType,
  PaymentStatus,
  AvailableTimeRangesResponse,
  GetAvailableTimeRangesRequest,
} from "../types/booking.types";

export class BookingService {
  private static readonly BASE_URL = "/bookings";

  /**
   * Get all bookings with optional filtering and pagination
   */
  static async getAllBookings(filterParam?: BookingFilterParam): Promise<BookingInfoDto[]> {
    try {
      const response = await apiClient.get(this.BASE_URL, {
        params: filterParam,
      });
      
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        // Handle paginated response (Page object with content field)
        if (data && typeof data === 'object' && 'content' in data && Array.isArray(data.content)) {
          return data.content;
        }
        // Handle direct array response
        if (Array.isArray(data)) {
          return data;
        }
        // Fallback: return empty array
        return [];
      } else {
        return response.data || [];
      }
    } catch (error) {
      console.log("Get all bookings error:", error);
      throw error;
    }
  }

  /**
   * Get booking by ID
   */
  static async getBookingById(bookingId: string): Promise<BookingInfoDto> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/${bookingId}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        return response.data;
      }
    } catch (error) {
      console.log("Get booking by ID error:", error);
      throw error;
    }
  }

  /**
   * Get bookings by customer
   */
  static async getBookingsByCustomer(customerId: string): Promise<BookingInfoDto[]> {
    try {
      const response = await apiClient.get(`/customers/${customerId}/bookings`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        return response.data || [];
      }
    } catch (error) {
      console.log("Get bookings by customer error:", error);
      throw error;
    }
  }

  /**
   * Get bookings by branch
   */
  static async getBookingsByBranch(branchId: string): Promise<BookingInfoDto[]> {
    try {
      const response = await apiClient.get(`/branches/${branchId}/bookings`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        return response.data || [];
      }
    } catch (error) {
      console.log("Get bookings by branch error:", error);
      throw error;
    }
  }

  /**
   * Get bookings by branch and date
   */
  static async getBookingsByBranchAndDate(
    branchId: string,
    bookingDate: string
  ): Promise<BookingInfoDto[]> {
    try {
      const response = await apiClient.get(
        `/branches/${branchId}/bookings/date/${bookingDate}`
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        return response.data || [];
      }
    } catch (error) {
      console.log("Get bookings by branch and date error:", error);
      throw error;
    }
  }

  /**
   * Get bookings by status
   */
  static async getBookingsByStatus(status: BookingStatus): Promise<BookingInfoDto[]> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/status/${status}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        return response.data || [];
      }
    } catch (error) {
      console.log("Get bookings by status error:", error);
      throw error;
    }
  }

  /**
   * Get booking statistics
   */
  static async getBookingStatistics(branchId: string, date: string): Promise<BookingStatisticsDto> {
    try {
      const response = await apiClient.get(
        `/branches/${branchId}/bookings/statistics/date/${date}`
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        return response.data;
      }
    } catch (error) {
      console.log("Get booking statistics error:", error);
      throw error;
    }
  }

  /**
   * Create new booking with slot assignment (Integrated API)
   * Backend automatically sets bookingType = SCHEDULED
   */
  static async createBookingWithSlot(request: CreateBookingWithScheduleRequest): Promise<BookingInfoDto> {
    try {
      const response = await apiClient.post(
        "/bookings/create-with-schedule",
        request
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        return response.data;
      }
    } catch (error) {
      console.log("Create booking with slot error:", error);
      throw error;
    }
  }

  /**
   * Get available time ranges for a bay on a specific date
   */
  static async getAvailableTimeRanges(
    request: GetAvailableTimeRangesRequest
  ): Promise<AvailableTimeRangesResponse> {
    try {
      const response = await apiClient.get("/booking-schedule/available-time-ranges", {
        params: {
          bayId: request.bay_id,
          date: request.date,
          ...(request.duration_minutes && { durationMinutes: request.duration_minutes }),
        },
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error("Failed to get available time ranges");
      }
    } catch (error) {
      console.log("Get available time ranges error:", error);
      throw error;
    }
  }

  /**
   * Update booking
   */
  static async updateBooking(bookingId: string, request: UpdateBookingRequest): Promise<BookingInfoDto> {
    try {
      const response = await apiClient.post(
        `${this.BASE_URL}/${bookingId}/update`,
        request
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        return response.data;
      }
    } catch (error) {
      console.log("Update booking error:", error);
      throw error;
    }
  }

  /**
   * Change booking schedule
   * Endpoint: POST /bookings/{bookingId}/change-slot
   * Note: Endpoint name is still "change-slot" but DTO is ChangeScheduleRequest
   */
  static async changeSchedule(bookingId: string, request: ChangeScheduleRequest): Promise<BookingInfoDto> {
    try {
      const response = await apiClient.post(
        `${this.BASE_URL}/${bookingId}/change-slot`,
        request
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        return response.data;
      }
    } catch (error) {
      console.log("Change schedule error:", error);
      throw error;
    }
  }

  /**
   * Delete booking (soft delete)
   */
  static async deleteBooking(bookingId: string): Promise<void> {
    try {
      const response = await apiClient.post(
        `${this.BASE_URL}/${bookingId}/delete`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete booking");
      }
    } catch (error) {
      console.log("Delete booking error:", error);
      throw error;
    }
  }

  /**
   * Cancel booking
   */
  static async cancelBooking(
    bookingId: string,
    reason: string,
    cancelledBy: string
  ): Promise<void> {
    try {
      const response = await apiClient.post(
        `${this.BASE_URL}/${bookingId}/cancel`,
        {
          reason,
          cancelledBy,
        }
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to cancel booking");
      }
    } catch (error) {
      console.log("Cancel booking error:", error);
      throw error;
    }
  }

  /**
   * Confirm booking
   */
  static async confirmBooking(bookingId: string): Promise<void> {
    try {
      const response = await apiClient.post(
        `${this.BASE_URL}/${bookingId}/confirm`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to confirm booking");
      }
    } catch (error) {
      console.log("Confirm booking error:", error);
      throw error;
    }
  }

  /**
   * Complete service
   */
  static async completeService(bookingId: string): Promise<void> {
    try {
      const response = await apiClient.post(
        `${this.BASE_URL}/${bookingId}/complete`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to complete service");
      }
    } catch (error) {
      console.log("Complete service error:", error);
      throw error;
    }
  }

  /**
   * Check-in booking
   */
  static async checkInBooking(bookingId: string): Promise<void> {
    try {
      const response = await apiClient.post(
        `${this.BASE_URL}/${bookingId}/check-in`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to check-in booking");
      }
    } catch (error) {
      console.log("Check-in booking error:", error);
      throw error;
    }
  }

  /**
   * Start service
   */
  static async startService(bookingId: string): Promise<void> {
    try {
      const response = await apiClient.post(
        `${this.BASE_URL}/${bookingId}/start`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to start service");
      }
    } catch (error) {
      console.log("Start service error:", error);
      throw error;
    }
  }

  /**
   * Get bookings pending payment
   */
  static async getBookingsPendingPayment(): Promise<BookingInfoDto[]> {
    try {
      console.log("Getting bookings pending payment");
      const response = await apiClient.get("/bookings/pending-payment");
      console.log("Get bookings pending payment API response:", response);
      return response.data.data;
    } catch (error: unknown) {
      console.log("Get bookings pending payment error:", error);
      throw error;
    }
  }

  /**
   * Mark booking as paid
   */
  static async markBookingAsPaid(bookingId: string): Promise<void> {
    try {
      console.log(`Marking booking as paid - BookingId: ${bookingId}`);
      const response = await apiClient.post(`/bookings/${bookingId}/mark-paid`);
      console.log("Mark booking as paid API response:", response);

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to mark booking as paid"
        );
      }
    } catch (error: unknown) {
      console.log("Mark booking as paid error:", error);
      throw error;
    }
  }
}

export default BookingService;
