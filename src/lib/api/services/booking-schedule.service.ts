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
      let isAvailable = false;
      let matchedRange = null;
      
      for (const range of timeRanges) {
        const rangeStart = this.parseTime(range.start_time);
        const rangeEnd = this.parseTime(range.end_time);
        // Slot is available if it starts within range and ends before or at range ends
        // Note: slotEnd can equal rangeEnd (e.g., slot 8:00-8:30 fits in range 8:00-8:30)
        // Also handle edge case where range ends at 08:59:59 but slot needs to go to 09:00:00
        // We allow a small tolerance (1 minute) for rounding differences
        const TOLERANCE_MINUTES = 1;
        const fitsInRange = current >= rangeStart && slotEnd <= (rangeEnd + TOLERANCE_MINUTES);
        
        // Debug logging for slot 8:00, 8:30, 9:00, and 17:30 with 30min duration
        if ((timeStr === "08:00" || timeStr === "08:30" || timeStr === "09:00" || timeStr === "17:30") && serviceDurationMinutes === 30) {
          const condition1Result = current >= rangeStart;
          const condition2Result = slotEnd <= rangeEnd;
          console.log(`🔍 Checking slot ${timeStr} (30min) against range:`, {
            slotStart: timeStr,
            slotEnd: this.formatTime(slotEnd),
            slotStartMinutes: current,
            slotEndMinutes: slotEnd,
            serviceDurationMinutes,
            range: {
              start_time: range.start_time,
              end_time: range.end_time,
              rangeStartMinutes: rangeStart,
              rangeEndMinutes: rangeEnd,
            },
            fitsInRange,
            condition1: `current (${current}) >= rangeStart (${rangeStart})`,
            condition1Result,
            condition2: `slotEnd (${slotEnd}) <= rangeEnd (${rangeEnd})`,
            condition2Result,
            explanation: fitsInRange 
              ? "✅ Slot fits in this range" 
              : `❌ Slot does NOT fit: ${condition1Result ? "start OK" : `start too early (${current} < ${rangeStart})`}, ${condition2Result ? "end OK" : `end too late (${slotEnd} > ${rangeEnd})`}`,
          });
        }
        
        if (fitsInRange) {
          isAvailable = true;
          matchedRange = range;
          break; // Found a matching range, no need to check others
        }
      }
      
      // Final debug for slot 8:00, 8:30, 9:00, and 17:30
      if ((timeStr === "08:00" || timeStr === "08:30" || timeStr === "09:00" || timeStr === "17:30") && serviceDurationMinutes === 30) {
        console.log(`🔍 Final result for slot ${timeStr}:`, {
          isAvailable,
          matchedRange: matchedRange ? {
            start_time: matchedRange.start_time,
            end_time: matchedRange.end_time,
          } : null,
          allRangesChecked: timeRanges.length,
          slotEnd: this.formatTime(slotEnd),
          serviceDurationMinutes,
        });
      }

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
