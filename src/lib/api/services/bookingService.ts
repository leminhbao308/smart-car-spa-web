/**
 * Booking Service
 * API service for booking management operations
 */

import apiClient from "../axios";
import {
  BookingInfoDto,
  BookingFilterParam,
  CreateBookingRequest,
  UpdateBookingRequest,
  BookingStatisticsDto,
  BookingStatus,
  Priority,
  PaymentStatus,
} from "../types/booking.types";

export class BookingService {
  private static readonly BASE_URL = "/bookings";

  /**
   * Get all bookings with optional filtering and pagination
   */
  static async getAllBookings(filterParam?: BookingFilterParam) {
    const response = await apiClient.get(this.BASE_URL, {
      params: filterParam,
    });
    return response.data;
  }

  /**
   * Get booking by ID
   */
  static async getBookingById(bookingId: string) {
    const response = await apiClient.get(`${this.BASE_URL}/${bookingId}`);
    return response.data;
  }

  /**
   * Get booking by code
   */
  static async getBookingByCode(bookingCode: string) {
    const response = await apiClient.get(
      `${this.BASE_URL}/code/${bookingCode}`
    );
    return response.data;
  }

  /**
   * Get bookings by customer
   */
  static async getBookingsByCustomer(customerId: string) {
    const response = await apiClient.get(`/customers/${customerId}/bookings`);
    return response.data;
  }

  /**
   * Get upcoming bookings by customer
   */
  static async getUpcomingBookingsByCustomer(customerId: string) {
    const response = await apiClient.get(
      `/customers/${customerId}/bookings/upcoming`
    );
    return response.data;
  }

  /**
   * Get past bookings by customer
   */
  static async getPastBookingsByCustomer(customerId: string) {
    const response = await apiClient.get(
      `/customers/${customerId}/bookings/past`
    );
    return response.data;
  }

  /**
   * Get bookings by branch
   */
  static async getBookingsByBranch(branchId: string) {
    const response = await apiClient.get(`/branches/${branchId}/bookings`);
    return response.data;
  }

  /**
   * Get bookings by branch and date
   */
  static async getBookingsByBranchAndDate(
    branchId: string,
    bookingDate: string
  ) {
    const response = await apiClient.get(
      `/branches/${branchId}/bookings/date/${bookingDate}`
    );
    return response.data;
  }

  /**
   * Get bookings by status
   */
  static async getBookingsByStatus(status: BookingStatus) {
    const response = await apiClient.get(`${this.BASE_URL}/status/${status}`);
    return response.data;
  }

  /**
   * Search bookings by customer name
   */
  static async searchBookingsByCustomerName(customerName: string) {
    const response = await apiClient.get(
      `${this.BASE_URL}/search/customer-name`,
      {
        params: { customerName },
      }
    );
    return response.data;
  }

  /**
   * Search bookings by phone number
   */
  static async searchBookingsByPhone(phoneNumber: string) {
    const response = await apiClient.get(`${this.BASE_URL}/search/phone`, {
      params: { phoneNumber },
    });
    return response.data;
  }

  /**
   * Search bookings by license plate
   */
  static async searchBookingsByLicensePlate(licensePlate: string) {
    const response = await apiClient.get(
      `${this.BASE_URL}/search/license-plate`,
      {
        params: { licensePlate },
      }
    );
    return response.data;
  }

  /**
   * Get booking statistics
   */
  static async getBookingStatistics(branchId: string, date: string) {
    const response = await apiClient.get(
      `/branches/${branchId}/bookings/statistics/date/${date}`
    );
    return response.data;
  }

  /**
   * Create new booking
   */
  static async createBooking(request: CreateBookingRequest) {
    const response = await apiClient.post(`${this.BASE_URL}/create`, request);
    return response.data;
  }

  /**
   * Update booking
   */
  static async updateBooking(bookingId: string, request: UpdateBookingRequest) {
    const response = await apiClient.post(
      `${this.BASE_URL}/${bookingId}/update`,
      request
    );
    return response.data;
  }

  /**
   * Delete booking (soft delete)
   */
  static async deleteBooking(bookingId: string) {
    const response = await apiClient.post(
      `${this.BASE_URL}/${bookingId}/delete`
    );
    return response.data;
  }

  /**
   * Cancel booking
   */
  static async cancelBooking(
    bookingId: string,
    reason: string,
    cancelledBy: string
  ) {
    const response = await apiClient.post(
      `${this.BASE_URL}/${bookingId}/cancel`,
      {
        reason,
        cancelledBy,
      }
    );
    return response.data;
  }

  /**
   * Confirm booking
   */
  static async confirmBooking(bookingId: string) {
    const response = await apiClient.post(
      `${this.BASE_URL}/${bookingId}/confirm`
    );
    return response.data;
  }

  /**
   * Check-in booking
   */
  static async checkInBooking(bookingId: string) {
    const response = await apiClient.post(
      `${this.BASE_URL}/${bookingId}/check-in`
    );
    return response.data;
  }

  /**
   * Start service
   */
  static async startService(bookingId: string) {
    const response = await apiClient.post(
      `${this.BASE_URL}/${bookingId}/start`
    );
    return response.data;
  }

  /**
   * Complete service
   */
  static async completeService(bookingId: string) {
    const response = await apiClient.post(
      `${this.BASE_URL}/${bookingId}/complete`
    );
    return response.data;
  }

  /**
   * Check-in booking
   */
  static async checkInBooking(bookingId: string) {
    const response = await apiClient.post(
      `${this.BASE_URL}/${bookingId}/check-in`
    );
    return response.data;
  }

  /**
   * Start service
   */
  static async startService(bookingId: string) {
    const response = await apiClient.post(
      `${this.BASE_URL}/${bookingId}/start`
    );
    return response.data;
  }
}

export default BookingService;
