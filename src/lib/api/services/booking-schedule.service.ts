import apiClient from "../axios";
import { ApiResponse } from "../types/common.types";
import { 
  AvailableTimeRangesResponse, 
  GetAvailableTimeRangesRequest 
} from "../types/booking.types";

/**
 * Booking Schedule Service
 * Updated to use time-range-based system instead of slot-based
 */
export class BookingScheduleService {
  /**
   * Lấy các available time ranges cho booking
   * Backend trả về time ranges, frontend tự xử lý để hiển thị slots
   * 
   * @param request - Request parameters
   * @returns AvailableTimeRangesResponse với time ranges và working hours
   */
  static async getAvailableTimeRanges(
    request: GetAvailableTimeRangesRequest
  ): Promise<AvailableTimeRangesResponse> {
    try {
      const params = new URLSearchParams({
        bayId: request.bay_id,
        date: request.date,
      });

      if (request.duration_minutes) {
        params.append('durationMinutes', request.duration_minutes.toString());
      }

      const response = await apiClient.get<ApiResponse<AvailableTimeRangesResponse>>(
        `/booking-schedule/available-time-ranges?${params.toString()}`
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error("Failed to get available time ranges");
      }
    } catch (error) {
      console.error("Get available time ranges error:", error);
      throw error;
    }
  }

  /**
   * Helper method: Convert time ranges to time slots for UI display
   * Frontend tự xử lý để hiển thị các mốc thời gian cố định (8:00, 8:30, 9:00, ...)
   * 
   * @param timeRanges - Available time ranges from backend
   * @param workingHours - Working hours from backend
   * @param serviceDurationMinutes - Duration of service in minutes
   * @param slotIntervalMinutes - Interval between slots (default: 30 minutes)
   * @returns Array of time slots with availability status
   */
  static convertTimeRangesToSlots(
    timeRanges: Array<{ start_time: string; end_time: string }>,
    workingHours: { start: string; end: string },
    serviceDurationMinutes: number,
    slotIntervalMinutes: number = 30
  ): Array<{ time: string; isAvailable: boolean }> {
    const slots: Array<{ time: string; isAvailable: boolean }> = [];

    // Generate slots from working hours
    const workingStart = this.parseTime(workingHours.start);
    const workingEnd = this.parseTime(workingHours.end);

    let current = workingStart;
    while (current < workingEnd) {
      const timeStr = this.formatTime(current);
      const slotEnd = current + serviceDurationMinutes;
      
      // Check if this slot fits within any available time range
      const isAvailable = timeRanges.some((range) => {
        const rangeStart = this.parseTime(range.start_time);
        const rangeEnd = this.parseTime(range.end_time);
        // Slot is available if it starts within range and ends before range ends
        return current >= rangeStart && slotEnd <= rangeEnd;
      });

      slots.push({
        time: timeStr,
        isAvailable,
      });
      current = this.addMinutes(current, slotIntervalMinutes);
    }

    return slots;
  }

  /**
   * Helper: Parse time string (HH:mm) to minutes since midnight
   */
  private static parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Helper: Format minutes since midnight to time string (HH:mm)
   */
  private static formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Helper: Add minutes to time
   */
  private static addMinutes(timeMinutes: number, minutesToAdd: number): number {
    return timeMinutes + minutesToAdd;
  }
}
