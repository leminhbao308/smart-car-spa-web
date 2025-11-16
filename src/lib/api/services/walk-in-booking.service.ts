import apiClient from "../axios";

// Types for Walk-in Booking
export interface BayRecommendationRequest {
  branch_id: string;
  service_type?: string;
  service_duration_minutes: number;
  booking_date?: string;
}

export interface BayRecommendationResponse {
  recommended_bay: {
    bay_id: string;
    bay_name: string;
    bay_code: string;
    status: string;
    allow_booking: boolean;
  };
  queue: BookingQueueItem[];
  estimated_wait_time: number;
  reason: string;
  alternative_bays: {
    bay_id: string;
    bay_name: string;
    bay_code: string;
    status: string;
    allow_booking: boolean;
  }[];
}

export interface BookingQueueItem {
  booking_id: string;
  booking_code: string;
  customer_name: string;
  customer_phone: string;
  vehicle_license_plate: string;
  service_type: string;
  queue_position: number;
  estimated_start_time: string;
  estimated_completion_time: string;
  status: string;
}

export interface WalkInBookingRequest {
  booking_type: 'WALK_IN'; // REQUIRED - must be WALK_IN
  customer_type: 'EXISTING' | 'NEW';
  // For existing customer
  customer_id?: string;
  vehicle_id?: string;
  // For new customer
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  vehicle_license_plate?: string;
  vehicle_brand?: string;
  vehicle_model?: string;
  vehicle_type?: string;
  vehicle_color?: string;
  vehicle_year?: number;
  // Common fields
  assigned_bay_id: string;
  branch_id: string;
  services: ServiceRequest[];
  total_price: number;
  currency: string;
  estimated_duration_minutes?: number;
  scheduled_start_at?: string;
  scheduled_end_at?: string;
  notes?: string;
  booking_date?: string;
}

export interface ServiceRequest {
  service_id: string;
  service_name: string;
  duration_minutes: number;
  price: number;
}

export interface WalkInBookingResponse {
  booking_id: string;
  booking_code: string;
  assigned_bay_id: string;
  queue_position: number;
  estimated_start_time: string;
  estimated_wait_time: number;
  status: string;
  message: string;
}

export interface TransferBookingRequest {
  booking_id: string;
  from_bay_id: string;
  to_bay_id: string;
  reason?: string;
}

export interface TransferBookingResponse {
  booking_id: string;
  from_bay_id: string;
  to_bay_id: string;
  success: boolean;
  message: string;
}

export interface BayQueueStatsResponse {
  bay_id: string;
  bay_name: string;
  queue_length: number;
  estimated_wait_time: number;
  status: string;
}

/**
 * Walk-in Booking API Service
 * Cung cấp các method để gọi API walk-in booking
 */
export class WalkInBookingService {
  constructor() {
    // No initialization needed for apiClient
  }

  /**
   * Đề xuất bay tốt nhất cho walk-in booking
   * Endpoint: /walk-in/recommend-bay
   */
  async recommendBay(request: BayRecommendationRequest, queueDate?: string): Promise<BayRecommendationResponse> {
    try {
      const params = queueDate ? { queueDate: queueDate } : {};
      const response = await apiClient.post<BayRecommendationResponse>(
        '/walk-in/recommend-bay',
        request,
        { params }
      );
      
      // Walk-in APIs return direct DTO, not wrapped in ApiResponse
      return response.data;
    } catch (error) {
      console.log('Error recommending bay:', error);
      throw error;
    }
  }

  /**
   * Tạo walk-in booking
   * Endpoint: /walk-in/create-booking
   * Note: booking_type must be WALK_IN (REQUIRED)
   */
  async createWalkInBooking(request: WalkInBookingRequest): Promise<WalkInBookingResponse> {
    try {
      // Ensure booking_type is set
      const requestWithType = {
        ...request,
        booking_type: 'WALK_IN' as const,
      };
      
      const response = await apiClient.post<WalkInBookingResponse>(
        '/walk-in/create-booking',
        requestWithType
      );
      
      // Walk-in APIs return direct DTO, not wrapped in ApiResponse
      return response.data;
    } catch (error) {
      console.log('Error creating walk-in booking:', error);
      throw error;
    }
  }

  /**
   * Lấy thông tin hàng chờ của một bay
   * Endpoint: /walk-in/bay-queue/{bayId}
   * Trả về các WALK_IN bookings, không còn BayQueue entity riêng
   * Returns direct array, not wrapped in ApiResponse
   */
  async getBayQueue(bayId: string, queueDate?: string): Promise<BookingQueueItem[]> {
    try {
      const params = queueDate ? { queueDate: queueDate } : {};
      console.log('🔍 DEBUG: getBayQueue called with:', { bayId, queueDate, params });
      
      const response = await apiClient.get(
        `/walk-in/bay-queue/${bayId}`,
        { params }
      );
      
      // Walk-in APIs return direct DTO/array, not wrapped in ApiResponse
      const data = response.data;
      
      console.log('🔍 DEBUG: getBayQueue response:', {
        status: response.status,
        data: data,
        dataType: typeof data,
        isArray: Array.isArray(data),
        length: data?.length
      });
      
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.log('Error getting bay queue:', error);
      throw error;
    }
  }

  /**
   * Chuyển booking từ bay này sang bay khác
   */
  async transferBooking(request: TransferBookingRequest): Promise<TransferBookingResponse> {
    try {
      const response = await apiClient.post<TransferBookingResponse>(
        '/walk-in/transfer-booking',
        request
      );
      return response.data;
    } catch (error) {
      console.log('Error transferring booking:', error);
      throw error;
    }
  }

  /**
   * Lấy thông tin chi tiết của một booking trong hàng chờ
   */
  async getBookingQueueInfo(bookingId: string): Promise<BookingQueueItem> {
    try {
      const response = await apiClient.get<BookingQueueItem>(
        `/walk-in/booking-queue/${bookingId}`
      );
      return response.data;
    } catch (error) {
      console.log('Error getting booking queue info:', error);
      throw error;
    }
  }

  /**
   * Lấy thống kê hàng chờ của tất cả bay trong chi nhánh
   */
  async getBranchQueueStats(branchId: string): Promise<BayQueueStatsResponse[]> {
    try {
      const response = await apiClient.get<BayQueueStatsResponse[]>(
        `/walk-in/branch-queue-stats/${branchId}`
      );
      return response.data;
    } catch (error) {
      console.log('Error getting branch queue stats:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const walkInBookingService = new WalkInBookingService();
