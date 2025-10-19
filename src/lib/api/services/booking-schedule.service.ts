import apiClient from "../axios";
import { ApiResponse } from "../types/common.types";

export interface TimeSlotDto {
  bayId: string;
  bayName: string;
  bayCode: string;
  startTime: string;
  endTime: string;
  estimatedEndTime: string;
  status: string;
  notes?: string;
  isAvailable: boolean;
  durationMinutes: number;
}

export interface AvailableSlotsRequest {
  branchId: string;
  date: string;
  serviceDurationMinutes: number;
  bayId?: string;
  fromHour?: number;
  toHour?: number;
}

export interface BookSlotRequest {
  bayId: string;
  date: string;
  startTime: string;
  serviceDurationMinutes: number;
  bookingId: string;
}

export class BookingScheduleService {
  /**
   * Lấy các slot available cho booking
   */
  static async getAvailableSlots(request: AvailableSlotsRequest): Promise<TimeSlotDto[]> {
    const params = new URLSearchParams({
      branchId: request.branchId,
      date: request.date,
      serviceDurationMinutes: request.serviceDurationMinutes.toString(),
    });

    if (request.bayId) {
      params.append('bayId', request.bayId);
    }
    if (request.fromHour !== undefined) {
      params.append('fromHour', request.fromHour.toString());
    }
    if (request.toHour !== undefined) {
      params.append('toHour', request.toHour.toString());
    }

    const response = await apiClient.get<ApiResponse<TimeSlotDto[]>>(
      `/booking-schedule/available-slots?${params.toString()}`
    );
    return response.data.data;
  }

  /**
   * Đặt slot cho booking
   */
  static async bookSlot(request: BookSlotRequest): Promise<void> {
    await apiClient.post<ApiResponse<void>>('/booking-schedule/book-slot', request);
  }

  /**
   * Hoàn thành dịch vụ sớm và mở slot trống
   */
  static async completeEarly(request: {
    bookingId: string;
    actualCompletionTime: string;
  }): Promise<void> {
    await apiClient.post<ApiResponse<void>>('/booking-schedule/complete-early', request);
  }

  /**
   * Tạo lịch cho tất cả bay trong chi nhánh trong ngày
   */
  static async generateDailySchedule(branchId: string, date: string): Promise<void> {
    const params = new URLSearchParams({
      branchId,
      date,
    });

    await apiClient.post<ApiResponse<void>>(
      `/booking-schedule/generate-daily-schedule?${params.toString()}`
    );
  }

  /**
   * Lấy thống kê slot của bay trong ngày
   */
  static async getBaySlotStatistics(bayId: string, date: string): Promise<{
    bayId: string;
    date: string;
    totalSlots: number;
    availableSlots: number;
    bookedSlots: number;
    inProgressSlots: number;
    completedSlots: number;
    cancelledSlots: number;
    utilizationRate: number;
  }> {
    const params = new URLSearchParams({
      bayId,
      date,
    });

    const response = await apiClient.get<ApiResponse<{
      bayId: string;
      date: string;
      totalSlots: number;
      availableSlots: number;
      bookedSlots: number;
      inProgressSlots: number;
      completedSlots: number;
      cancelledSlots: number;
      utilizationRate: number;
    }>>(
      `/booking-schedule/bay-statistics?${params.toString()}`
    );
    return response.data.data;
  }

  /**
   * Lấy các slot có thể mở rộng (hoàn thành sớm)
   */
  static async getExpandableSlots(
    branchId: string, 
    date: string, 
    fromTime?: string
  ): Promise<TimeSlotDto[]> {
    const params = new URLSearchParams({
      branchId,
      date,
    });

    if (fromTime) {
      params.append('fromTime', fromTime);
    }

    const response = await apiClient.get<ApiResponse<TimeSlotDto[]>>(
      `/booking-schedule/expandable-slots?${params.toString()}`
    );
    return response.data.data;
  }
}
