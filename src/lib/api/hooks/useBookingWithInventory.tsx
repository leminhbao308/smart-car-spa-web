/**
 * Enhanced booking hooks with inventory management
 */

import { useCallback } from "react";
import { useConfirmBooking, useCancelBooking, useStartService } from "./useBooking";
import { useBookingInventory } from "./useBookingInventory";
import { BookingInfoDto } from "../types/booking.types";

export const useBookingWithInventory = () => {
  const confirmBookingMutation = useConfirmBooking();
  const cancelBookingMutation = useCancelBooking();
  const startServiceMutation = useStartService();
  const { reserveInventory, fulfillInventory, releaseInventory } = useBookingInventory();

  // Enhanced confirm booking (NO inventory fulfillment - backend handles it automatically when status becomes IN_PROGRESS)
  const confirmBookingWithInventory = useCallback(async (
    booking: BookingInfoDto,
    branchId: string
  ) => {
    try {
      console.log(` Confirming booking ${booking.booking_id}`);
      
      // Confirm booking - backend will automatically fulfill inventory when booking status becomes IN_PROGRESS
      await confirmBookingMutation.mutateAsync(booking.booking_id);
      
      console.log(`✅ Successfully confirmed booking ${booking.booking_id}`);
      
    } catch (error) {
      console.log(`❌ Error confirming booking ${booking.booking_id}:`, error);
      throw error;
    }
  }, [confirmBookingMutation]);

  // Enhanced cancel booking with inventory release
  const cancelBookingWithInventory = useCallback(async (
    booking: BookingInfoDto,
    branchId: string,
    reason: string,
    cancelledBy: string
  ) => {
    try {
      console.log(` Cancelling booking ${booking.booking_id} with inventory release`);
      
      // 1. Cancel booking first
      await cancelBookingMutation.mutateAsync({
        bookingId: booking.booking_id,
        reason,
        cancelledBy
      });
      
      // 2. Release inventory (reserved -> available)
      await releaseInventory({ booking, branchId });
      
      console.log(`✅ Successfully cancelled booking ${booking.booking_id} and released inventory`);
      
    } catch (error) {
      console.log(`❌ Error cancelling booking ${booking.booking_id}:`, error);
      throw error;
    }
  }, [cancelBookingMutation, releaseInventory]);

  // Enhanced start service (NO manual inventory fulfillment - backend handles it automatically when status becomes IN_PROGRESS)
  const startServiceWithInventory = useCallback(async (
    booking: BookingInfoDto,
    branchId: string
  ) => {
    try {
      console.log(` Starting service for booking ${booking.booking_id}`);
      
      // Start service - backend will automatically fulfill inventory when booking status becomes IN_PROGRESS
      await startServiceMutation.mutateAsync(booking.booking_id);
      
      console.log(`✅ Successfully started service for booking ${booking.booking_id}`);
      
    } catch (error) {
      console.log(`❌ Error starting service for booking ${booking.booking_id}:`, error);
      throw error;
    }
  }, [startServiceMutation]);

  return {
    // Enhanced mutations with inventory
    confirmBookingWithInventory,
    cancelBookingWithInventory,
    startServiceWithInventory,
    
    // Original mutations (for cases where inventory is not needed)
    confirmBooking: confirmBookingMutation.mutateAsync,
    cancelBooking: cancelBookingMutation.mutateAsync,
    startService: startServiceMutation.mutateAsync,
    
    // Loading states
    isConfirming: confirmBookingMutation.isPending,
    isCancelling: cancelBookingMutation.isPending,
    isStarting: startServiceMutation.isPending,
    isLoading: confirmBookingMutation.isPending || 
               cancelBookingMutation.isPending || 
               startServiceMutation.isPending,
  };
};
