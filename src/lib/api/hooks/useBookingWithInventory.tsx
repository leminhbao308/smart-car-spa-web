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

  // Enhanced confirm booking with inventory fulfillment
  const confirmBookingWithInventory = useCallback(async (
    booking: BookingInfoDto,
    branchId: string
  ) => {
    try {
      console.log(`🔄 Confirming booking ${booking.booking_id} with inventory fulfillment`);
      
      // 1. Confirm booking first
      await confirmBookingMutation.mutateAsync(booking.booking_id);
      
      // 2. Fulfill inventory (reserved -> fulfilled)
      await fulfillInventory({ booking, branchId });
      
      console.log(`✅ Successfully confirmed booking ${booking.booking_id} and fulfilled inventory`);
      
    } catch (error) {
      console.log(`❌ Error confirming booking ${booking.booking_id}:`, error);
      throw error;
    }
  }, [confirmBookingMutation, fulfillInventory]);

  // Enhanced cancel booking with inventory release
  const cancelBookingWithInventory = useCallback(async (
    booking: BookingInfoDto,
    branchId: string,
    reason: string,
    cancelledBy: string
  ) => {
    try {
      console.log(`🔄 Cancelling booking ${booking.booking_id} with inventory release`);
      
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

  // Enhanced start service with inventory fulfillment (if not already fulfilled)
  const startServiceWithInventory = useCallback(async (
    booking: BookingInfoDto,
    branchId: string
  ) => {
    try {
      console.log(`🔄 Starting service for booking ${booking.booking_id} with inventory check`);
      
      // 1. Start service
      await startServiceMutation.mutateAsync(booking.booking_id);
      
      // 2. Ensure inventory is fulfilled (in case it wasn't done during confirm)
      // This is a safety check - if inventory was already fulfilled, this will be a no-op
      try {
        await fulfillInventory({ booking, branchId });
        console.log(`✅ Inventory already fulfilled or successfully fulfilled for booking ${booking.booking_id}`);
      } catch (inventoryError) {
        console.warn(`⚠️ Inventory fulfillment failed for booking ${booking.booking_id}, but service started:`, inventoryError);
        // Don't fail the entire operation if inventory fulfillment fails
        // Note: Warning notification should be handled by the component using App.useApp()
      }
      
      console.log(`✅ Successfully started service for booking ${booking.booking_id}`);
      
    } catch (error) {
      console.log(`❌ Error starting service for booking ${booking.booking_id}:`, error);
      throw error;
    }
  }, [startServiceMutation, fulfillInventory]);

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
