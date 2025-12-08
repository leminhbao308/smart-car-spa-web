/**
 * Hook for managing booking inventory operations
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookingInventoryService } from "../services/booking-inventory.service";
import { BookingInfoDto } from "../types/booking.types";

export const useBookingInventory = () => {
  const queryClient = useQueryClient();

  // Reserve inventory when booking becomes PENDING
  const reserveInventoryMutation = useMutation({
    mutationFn: async ({ 
      booking, 
      branchId 
    }: { 
      booking: BookingInfoDto; 
      branchId: string; 
    }) => {
      return await BookingInventoryService.reserveInventoryForBooking(booking, branchId);
    },
    onSuccess: (_, { booking }) => {
      console.log(`✅ Successfully reserved inventory for booking: ${booking.booking_id}`);
      // Note: Notification should be handled by the component using App.useApp()
      
      // Refresh inventory and booking data
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error: any, { booking }) => {
      console.log(`❌ Failed to reserve inventory for booking ${booking.booking_id}:`, error);
      // Note: Error notification should be handled by the component using App.useApp()
    },
  });

  // Fulfill inventory when booking becomes CONFIRMED
  const fulfillInventoryMutation = useMutation({
    mutationFn: async ({ 
      booking, 
      branchId 
    }: { 
      booking: BookingInfoDto; 
      branchId: string; 
    }) => {
      return await BookingInventoryService.fulfillInventoryForBooking(booking, branchId);
    },
    onSuccess: (_, { booking }) => {
      console.log(`✅ Successfully fulfilled inventory for booking: ${booking.booking_id}`);
      // Note: Notification should be handled by the component using App.useApp()
      
      // Refresh inventory and booking data
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error: any, { booking }) => {
      console.log(`❌ Failed to fulfill inventory for booking ${booking.booking_id}:`, error);
      // Note: Error notification should be handled by the component using App.useApp()
    },
  });

  // Release inventory when booking becomes CANCELLED
  const releaseInventoryMutation = useMutation({
    mutationFn: async ({ 
      booking, 
      branchId 
    }: { 
      booking: BookingInfoDto; 
      branchId: string; 
    }) => {
      return await BookingInventoryService.releaseInventoryForBooking(booking, branchId);
    },
    onSuccess: (_, { booking }) => {
      console.log(`✅ Successfully released inventory for booking: ${booking.booking_id}`);
      // Note: Notification should be handled by the component using App.useApp()
      
      // Refresh inventory and booking data
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error: any, { booking }) => {
      console.log(`❌ Failed to release inventory for booking ${booking.booking_id}:`, error);
      // Note: Error notification should be handled by the component using App.useApp()
    },
  });

  return {
    // Mutations
    reserveInventory: reserveInventoryMutation.mutateAsync,
    fulfillInventory: fulfillInventoryMutation.mutateAsync,
    releaseInventory: releaseInventoryMutation.mutateAsync,
    
    // Loading states
    isReserving: reserveInventoryMutation.isPending,
    isFulfilling: fulfillInventoryMutation.isPending,
    isReleasing: releaseInventoryMutation.isPending,
    
    // Any loading state
    isLoading: reserveInventoryMutation.isPending || 
               fulfillInventoryMutation.isPending || 
               releaseInventoryMutation.isPending,
  };
};
