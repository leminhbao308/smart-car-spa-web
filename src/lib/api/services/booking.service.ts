/**
 * Booking Management Service
 * Handles all booking-related API calls
 */

import apiClient from "../axios";
import {
  BookingInfoDto,
  BookingFilterParam,
  CreateBookingRequest,
  UpdateBookingRequest,
  BookingStatisticsDto,
} from "../types";

export class BookingService {
  /**
   * Get all bookings with pagination and filtering
   */
  static async getAllBookings(
    filterParam?: BookingFilterParam
  ): Promise<BookingInfoDto[]> {
    try {
      const queryParams = new URLSearchParams();

      if (filterParam) {
        if (filterParam.page !== undefined) {
          queryParams.append("page", filterParam.page.toString());
        }
        if (filterParam.size !== undefined) {
          queryParams.append("size", filterParam.size.toString());
        }
        if (filterParam.status) {
          queryParams.append("status", filterParam.status);
        }
        if (filterParam.branchId) {
          queryParams.append("branchId", filterParam.branchId);
        }
        if (filterParam.customerId) {
          queryParams.append("customerId", filterParam.customerId);
        }
        if (filterParam.dateFrom) {
          queryParams.append("dateFrom", filterParam.dateFrom);
        }
        if (filterParam.dateTo) {
          queryParams.append("dateTo", filterParam.dateTo);
        }
      }

      const url = `/bookings${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await apiClient.get(url);

      if (response.data.success) {
        return response.data.data || response.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch bookings");
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
      const response = await apiClient.get(`/bookings/${bookingId}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch booking");
      }
    } catch (error) {
      console.log("Get booking by ID error:", error);
      throw error;
    }
  }

  /**
   * Get booking by code
   */
  // static async getBookingByCode(bookingCode: string): Promise<BookingInfoDto> {
  //   try {
  //     const response = await apiClient.get(`/bookings/code/${bookingCode}`);

  //     if (response.data.success && response.data.data) {
  //       return response.data.data;
  //     } else {
  //       throw new Error(response.data.message || "Failed to fetch booking");
  //     }
  //   } catch (error) {
  //     console.log("Get booking by code error:", error);
  //     throw error;
  //   }
  // }

  /**
   * Get bookings by customer
   */
  static async getBookingsByCustomer(
    customerId: string
  ): Promise<BookingInfoDto[]> {
    try {
      console.log("Fetching bookings for customer ID:", customerId);
      const url = `/customers/${customerId}/bookings`;
      console.log("API URL:", url);
      const response = await apiClient.get(url);
      console.log("Bookings API response:", response);

      if (response.data.success && response.data.data) {
        console.log("Bookings data:", response.data.data);
        return response.data.data;
      } else {
        console.log("API response error:", response.data);
        throw new Error(
          response.data.message || "Failed to fetch customer bookings"
        );
      }
    } catch (error) {
      console.log("Get bookings by customer error:", error);
      
      // More detailed error logging
      if (error instanceof Error) {
        console.log("Error message:", error.message);
        console.log("Error stack:", error.stack);
        
        // Check if it's an axios error
        if ('response' in error) {
          const axiosError = error as any;
          console.log("Axios error response status:", axiosError.response?.status);
          console.log("Axios error response data:", axiosError.response?.data);
          console.log("Axios error config:", axiosError.config);
        }
        
        // Check if it's a network error
        if ('code' in error) {
          console.log("Error code:", (error as any).code);
        }
      } else {
        console.log("Non-Error object:", typeof error, error);
      }
      
      // Try alternative endpoint if the first one fails
      try {
        console.log("Trying alternative endpoint...");
        const altUrl = `/bookings?customerId=${customerId}`;
        console.log("Alternative API URL:", altUrl);
        const altResponse = await apiClient.get(altUrl);
        console.log("Alternative API response:", altResponse);
        
        if (altResponse.data.success && altResponse.data.data) {
          console.log("Alternative bookings data:", altResponse.data.data);
          return altResponse.data.data;
        }
      } catch (altError) {
        console.log("Alternative endpoint also failed:", altError);
      }
      
      throw error;
    }
  }

  /**
   * Get upcoming bookings by customer
   */
  // static async getUpcomingBookingsByCustomer(customerId: string): Promise<BookingInfoDto[]> {
  //   try {
  //     const response = await apiClient.get(`/customers/${customerId}/bookings/upcoming`);

  //     if (response.data.success && response.data.data) {
  //       return response.data.data;
  //     } else {
  //       throw new Error(response.data.message || "Failed to fetch upcoming bookings");
  //     }
  //   } catch (error) {
  //     console.log("Get upcoming bookings error:", error);
  //     throw error;
  //   }
  // }

  /**
   * Get past bookings by customer
   */
  // static async getPastBookingsByCustomer(customerId: string): Promise<BookingInfoDto[]> {
  //   try {
  //     const response = await apiClient.get(`/customers/${customerId}/bookings/past`);

  //     if (response.data.success && response.data.data) {
  //       return response.data.data;
  //     } else {
  //       throw new Error(response.data.message || "Failed to fetch past bookings");
  //     }
  //   } catch (error) {
  //     console.log("Get past bookings error:", error);
  //     throw error;
  //   }
  // }

  /**
   * Get bookings by branch
   */
  static async getBookingsByBranch(
    branchId: string
  ): Promise<BookingInfoDto[]> {
    try {
      const response = await apiClient.get(`/branches/${branchId}/bookings`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch branch bookings"
        );
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
        throw new Error(
          response.data.message || "Failed to fetch bookings by date"
        );
      }
    } catch (error) {
      console.log("Get bookings by branch and date error:", error);
      throw error;
    }
  }

  /**
   * Get bookings by status
   */
  static async getBookingsByStatus(status: string): Promise<BookingInfoDto[]> {
    try {
      const response = await apiClient.get(`/bookings/status/${status}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch bookings by status"
        );
      }
    } catch (error) {
      console.log("Get bookings by status error:", error);
      throw error;
    }
  }

  /**
   * Search bookings by customer name
   */
  // static async searchBookingsByCustomerName(
  //   customerName: string
  // ): Promise<BookingInfoDto[]> {
  //   try {
  //     const response = await apiClient.get(
  //       `/bookings/search/customer-name?customerName=${encodeURIComponent(
  //         customerName
  //       )}`
  //     );

  //     if (response.data.success && response.data.data) {
  //       return response.data.data;
  //     } else {
  //       throw new Error(
  //         response.data.message || "Failed to search bookings by customer name"
  //       );
  //     }
  //   } catch (error) {
  //     console.log("Search bookings by customer name error:", error);
  //     throw error;
  //   }
  // }

  /**
   * Search bookings by phone number
   */
  // static async searchBookingsByPhone(
  //   phoneNumber: string
  // ): Promise<BookingInfoDto[]> {
  //   try {
  //     const response = await apiClient.get(
  //       `/bookings/search/phone?phoneNumber=${encodeURIComponent(phoneNumber)}`
  //     );

  //     if (response.data.success && response.data.data) {
  //       return response.data.data;
  //     } else {
  //       throw new Error(
  //         response.data.message || "Failed to search bookings by phone"
  //       );
  //     }
  //   } catch (error) {
  //     console.log("Search bookings by phone error:", error);
  //     throw error;
  //   }
  // }

  /**
   * Search bookings by license plate
   */
  // static async searchBookingsByLicensePlate(licensePlate: string): Promise<BookingInfoDto[]> {
  //   try {
  //     const response = await apiClient.get(`/bookings/search/license-plate?licensePlate=${encodeURIComponent(licensePlate)}`);

  //     if (response.data.success && response.data.data) {
  //       return response.data.data;
  //     } else {
  //       throw new Error(response.data.message || "Failed to search bookings by license plate");
  //     }
  //   } catch (error) {
  //     console.log("Search bookings by license plate error:", error);
  //     throw error;
  //   }
  // }

  /**
   * Get booking statistics
   */
  static async getBookingStatistics(
    branchId: string,
    date: string
  ): Promise<BookingStatisticsDto> {
    try {
      const response = await apiClient.get(
        `/branches/${branchId}/bookings/statistics/date/${date}`
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch booking statistics"
        );
      }
    } catch (error) {
      console.log("Get booking statistics error:", error);
      throw error;
    }
  }

  /**
   * Create new booking
   */
  static async createBooking(
    bookingData: CreateBookingRequest
  ): Promise<BookingInfoDto> {
    try {
      console.log("Creating booking with data:", bookingData);

      const response = await apiClient.post("/bookings/create", bookingData);
      console.log("Create booking API response:", response);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to create booking");
      }
    } catch (error) {
      console.log("Create booking error:", error);
      throw error;
    }
  }

  /**
   * Update booking
   */
  static async updateBooking(
    bookingId: string,
    bookingData: UpdateBookingRequest
  ): Promise<BookingInfoDto> {
    try {
      console.log("Updating booking with data:", bookingData);

      const response = await apiClient.post(
        `/bookings/${bookingId}/update`,
        bookingData
      );
      console.log("Update booking API response:", response);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to update booking");
      }
    } catch (error) {
      console.log("Update booking error:", error);
      throw error;
    }
  }

  /**
   * Delete booking (soft delete)
   */
  static async deleteBooking(bookingId: string): Promise<void> {
    try {
      console.log("Deleting booking with ID:", bookingId);

      const response = await apiClient.post(`/bookings/${bookingId}/delete`);
      console.log("Delete booking API response:", response);

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
      console.log("Cancelling booking with ID:", bookingId);

      const response = await apiClient.post(`/bookings/${bookingId}/cancel`, {
        reason,
        cancelledBy,
      });
      console.log("Cancel booking API response:", response);

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
      console.log("Confirming booking with ID:", bookingId);

      const response = await apiClient.post(`/bookings/${bookingId}/confirm`);
      console.log("Confirm booking API response:", response);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to confirm booking");
      }
    } catch (error) {
      console.log("Confirm booking error:", error);
      throw error;
    }
  }

  /**
   * Check-in booking
   */
  static async checkInBooking(bookingId: string): Promise<void> {
    try {
      console.log("Checking in booking with ID:", bookingId);

      const response = await apiClient.post(`/bookings/${bookingId}/check-in`);
      console.log("Check-in booking API response:", response);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to check-in booking");
      }
    } catch (error) {
      console.log("Check-in booking error:", error);
      throw error;
    }
  }

  /**
   * Start service for booking
   */
  static async startService(bookingId: string): Promise<void> {
    try {
      console.log("Starting service for booking with ID:", bookingId);

      const response = await apiClient.post(`/bookings/${bookingId}/start`);
      console.log("Start service API response:", response);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to start service");
      }
    } catch (error) {
      console.log("Start service error:", error);
      throw error;
    }
  }

  /**
   * Complete service for booking
   */
  static async completeService(bookingId: string): Promise<void> {
    try {
      console.log("Completing service for booking with ID:", bookingId);

      const response = await apiClient.post(`/bookings/${bookingId}/complete`);
      console.log("Complete service API response:", response);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to complete service");
      }
    } catch (error) {
      console.log("Complete service error:", error);
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
