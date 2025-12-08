/**
 * Booking Hooks
 * React Query hooks for booking management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookingService } from '../services/bookingService';
import {
  BookingInfoDto,
  BookingFilterParam,
  CreateBookingWithScheduleRequest,
  UpdateBookingRequest,
  BookingStatus
} from '../types/booking.types';

// Query Keys
export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (filters: BookingFilterParam) => [...bookingKeys.lists(), filters] as const,
  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
  byCode: (code: string) => [...bookingKeys.all, 'code', code] as const,
  byCustomer: (customerId: string) => [...bookingKeys.all, 'customer', customerId] as const,
  byBranch: (branchId: string) => [...bookingKeys.all, 'branch', branchId] as const,
  byStatus: (status: BookingStatus) => [...bookingKeys.all, 'status', status] as const,
  management: () => [...bookingKeys.all, 'management'] as const,
  statistics: (branchId: string, date: string) => [...bookingKeys.all, 'statistics', branchId, date] as const,
};

// Hooks
export const useBookings = (filterParam?: BookingFilterParam) => {
  return useQuery({
    queryKey: bookingKeys.list(filterParam || {}),
    queryFn: () => BookingService.getAllBookings(filterParam),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useBooking = (bookingId: string) => {
  return useQuery({
    queryKey: bookingKeys.detail(bookingId),
    queryFn: () => BookingService.getBookingById(bookingId),
    enabled: !!bookingId,
  });
};

// export const useBookingByCode = (bookingCode: string) => {
//   return useQuery({
//     queryKey: bookingKeys.byCode(bookingCode),
//     queryFn: () => BookingService.getBookingByCode(bookingCode),
//     enabled: !!bookingCode,
//   });
// };

export const useBookingsByCustomer = (customerId: string) => {
  return useQuery({
    queryKey: bookingKeys.byCustomer(customerId),
    queryFn: () => BookingService.getBookingsByCustomer(customerId),
    enabled: !!customerId,
  });
};

export const useBookingsByBranch = (branchId: string) => {
  return useQuery({
    queryKey: bookingKeys.byBranch(branchId),
    queryFn: () => BookingService.getBookingsByBranch(branchId),
    enabled: !!branchId,
  });
};

export const useBookingsByStatus = (status: BookingStatus) => {
  return useQuery({
    queryKey: bookingKeys.byStatus(status),
    queryFn: () => BookingService.getBookingsByStatus(status),
    enabled: !!status,
  });
};

/**
 * Get bookings for management (CHECKED_IN, IN_PROGRESS, CANCELLED, COMPLETED)
 * Optimized hook to get all bookings needed for vehicle care management in one API call
 */
export const useBookingsForManagement = () => {
  return useQuery({
    queryKey: bookingKeys.management(),
    queryFn: () => BookingService.getBookingsForManagement(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useBookingStatistics = (branchId: string, date: string) => {
  return useQuery({
    queryKey: bookingKeys.statistics(branchId, date),
    queryFn: () => BookingService.getBookingStatistics(branchId, date),
    enabled: !!branchId && !!date,
  });
};

// Mutations
export const useCreateBookingWithSlot = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: CreateBookingWithScheduleRequest) => BookingService.createBookingWithSlot(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookingKeys.management() });
    },
  });
};

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ bookingId, request }: { bookingId: string; request: UpdateBookingRequest }) =>
      BookingService.updateBooking(bookingId, request),
    onSuccess: (_, { bookingId }) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(bookingId) });
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookingKeys.management() });
    },
  });
};

export const useDeleteBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (bookingId: string) => BookingService.deleteBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookingKeys.management() });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ bookingId, reason, cancelledBy }: { bookingId: string; reason: string; cancelledBy: string }) =>
      BookingService.cancelBooking(bookingId, reason, cancelledBy),
    onSuccess: (_, { bookingId }) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(bookingId) });
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookingKeys.management() });
    },
  });
};

export const useConfirmBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (bookingId: string) => BookingService.confirmBooking(bookingId),
    onSuccess: (_, bookingId) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(bookingId) });
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookingKeys.management() });
    },
  });
};

export const useCheckInBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (bookingId: string) => BookingService.checkInBooking(bookingId),
    onSuccess: (_, bookingId) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(bookingId) });
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookingKeys.management() });
    },
  });
};

export const useStartService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (bookingId: string) => BookingService.startService(bookingId),
    onSuccess: (_, bookingId) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(bookingId) });
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookingKeys.management() });
    },
  });
};

export const useCompleteService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (bookingId: string) => BookingService.completeService(bookingId),
    onSuccess: (_, bookingId) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(bookingId) });
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookingKeys.management() });
    },
  });
};
