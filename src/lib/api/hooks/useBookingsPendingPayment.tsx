"use client";
import { useQuery } from "@tanstack/react-query";
import { BookingService } from "../services/booking.service";
import { BookingInfoDto } from "../types/booking.types";

export const useBookingsPendingPayment = () => {
  return useQuery({
    queryKey: ["bookings", "pending-payment"],
    queryFn: async () => {
      console.log("=== CALLING /bookings/pending-payment API ===");
      try {
        const result = await BookingService.getBookingsPendingPayment();
        console.log("=== /bookings/pending-payment API SUCCESS ===");
        console.log("API Response:", result);
        return result;
      } catch (error) {
        console.log("=== /bookings/pending-payment API ERROR ===");
        console.error("API Error:", error);
        throw error;
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
