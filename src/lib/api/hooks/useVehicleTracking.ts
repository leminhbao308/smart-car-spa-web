/**
 * Vehicle Tracking Hook
 * Hook để lấy danh sách tracking theo booking ID
 */

import { useQuery } from '@tanstack/react-query';
import { ServiceProcessTrackingService } from '../services/service-process-tracking.service';
import { ServiceProcessTrackingInfoDto } from '../types/service-process-tracking.types';

// Query Keys
export const vehicleTrackingKeys = {
  all: ['vehicleTracking'] as const,
  byBooking: (bookingId: string) => [...vehicleTrackingKeys.all, 'booking', bookingId] as const,
};

// Hook để lấy tracking theo booking ID
export const useVehicleTracking = (bookingId: string) => {
  return useQuery({
    queryKey: vehicleTrackingKeys.byBooking(bookingId),
    queryFn: () => ServiceProcessTrackingService.getTrackingsByBooking(bookingId),
    enabled: !!bookingId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
  });
};
