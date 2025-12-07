/**
 * Dashboard Service
 * Handles API calls for dashboard statistics and analytics
 */

import apiClient from "../axios";
import { ApiResponse } from "../types/common.types";

/**
 * Dashboard statistics DTO
 */
export interface DashboardStats {
  totalCustomers: number;
  totalVehicles: number;
  totalBookings: number;
  totalRevenue: number;
  monthlyGrowth: {
    customers: number;
    vehicles: number;
    bookings: number;
    revenue: number;
  };
}

/**
 * Booking status statistics DTO
 */
export interface BookingStatusStats {
  pending: number;
  confirmed: number;
  checkedIn: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  noShow: number;
}

/**
 * Recent activity DTO
 */
export interface RecentActivity {
  type: string;
  description: string;
  status: string;
  timestamp: string;
}

/**
 * Upcoming booking DTO
 */
export interface UpcomingBooking {
  bookingId: string;
  bookingCode: string;
  customerName: string;
  vehicleInfo: string;
  service: string;
  scheduledTime: string;
  status: string;
}

/**
 * Monthly revenue data point
 */
export interface MonthlyRevenue {
  month: string;
  revenue: number;
  orderCount: number;
}

/**
 * Revenue statistics DTO
 */
export interface RevenueStats {
  totalRevenue: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  dailyRevenue: number;
  monthlyRevenueData: MonthlyRevenue[];
}

/**
 * Dashboard Service class
 */
class DashboardService {
  private readonly BASE_URL = "/dashboard";

  /**
   * Get overall dashboard statistics
   */
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const response = await apiClient.get<ApiResponse<DashboardStats>>(
      `${this.BASE_URL}/stats`
    );
    return response.data;
  }

  /**
   * Get booking status statistics
   */
  async getBookingStatusStats(): Promise<ApiResponse<BookingStatusStats>> {
    const response = await apiClient.get<ApiResponse<BookingStatusStats>>(
      `${this.BASE_URL}/booking-status`
    );
    return response.data;
  }

  /**
   * Get recent activities
   */
  async getRecentActivities(
    limit: number = 10
  ): Promise<ApiResponse<RecentActivity[]>> {
    const response = await apiClient.get<ApiResponse<RecentActivity[]>>(
      `${this.BASE_URL}/recent-activities`,
      {
        params: { limit },
      }
    );
    return response.data;
  }

  /**
   * Get upcoming bookings
   */
  async getUpcomingBookings(
    limit: number = 10
  ): Promise<ApiResponse<UpcomingBooking[]>> {
    const response = await apiClient.get<ApiResponse<UpcomingBooking[]>>(
      `${this.BASE_URL}/upcoming-bookings`,
      {
        params: { limit },
      }
    );
    return response.data;
  }

  /**
   * Get revenue statistics
   */
  async getRevenueStats(): Promise<ApiResponse<RevenueStats>> {
    const response = await apiClient.get<ApiResponse<RevenueStats>>(
      `${this.BASE_URL}/revenue`
    );
    return response.data;
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();
export default dashboardService;
