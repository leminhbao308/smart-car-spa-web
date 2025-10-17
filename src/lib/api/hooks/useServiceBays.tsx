"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ServiceBayService } from "../services/service-bay.service";
import {
  ServiceBayFilterParam,
  CreateServiceBayRequest,
  UpdateServiceBayRequest,
  BayStatus
} from "../types/service-bay.types";

// Query keys for service bays
export const serviceBayKeys = {
  all: ['serviceBays'] as const,
  lists: () => [...serviceBayKeys.all, 'list'] as const,
  list: (filters: ServiceBayFilterParam) => [...serviceBayKeys.lists(), { filters }] as const,
  details: () => [...serviceBayKeys.all, 'detail'] as const,
  detail: (id: string) => [...serviceBayKeys.details(), id] as const,
  dropdown: (branchId?: string) => [...serviceBayKeys.all, 'dropdown', { branchId }] as const,
  statistics: (id: string) => [...serviceBayKeys.all, 'statistics', id] as const,
  bookings: (id: string) => [...serviceBayKeys.all, 'bookings', id] as const,
  byBranch: (branchId: string) => [...serviceBayKeys.all, 'byBranch', branchId] as const,
  active: (branchId?: string) => [...serviceBayKeys.all, 'active', { branchId }] as const,
  available: (branchId: string, startTime: string, endTime: string) => 
    [...serviceBayKeys.all, 'available', { branchId, startTime, endTime }] as const,
};

/**
 * Hook for service bays dropdown data
 */
export const useServiceBaysDropdown = (branchId?: string) => {
  return useQuery({
    queryKey: serviceBayKeys.dropdown(branchId),
    queryFn: () => ServiceBayService.getServiceBaysDropdown(branchId),
    enabled: true,
  });
};

/**
 * Hook for all service bays data with pagination and search
 */
export const useServiceBays = (params: ServiceBayFilterParam = {}) => {
  return useQuery({
    queryKey: serviceBayKeys.list(params),
    queryFn: () => ServiceBayService.getAllServiceBays(params),
    enabled: true,
  });
};

/**
 * Hook for a single service bay by ID
 */
export const useServiceBay = (bayId: string | null) => {
  return useQuery({
    queryKey: serviceBayKeys.detail(bayId || ''),
    queryFn: () => ServiceBayService.getServiceBayById(bayId!),
    enabled: !!bayId,
  });
};

/**
 * Hook for service bays by branch
 */
export const useServiceBaysByBranch = (branchId: string | null) => {
  return useQuery({
    queryKey: serviceBayKeys.byBranch(branchId || ''),
    queryFn: () => ServiceBayService.getServiceBaysByBranch(branchId!),
    enabled: !!branchId,
  });
};

// useServiceBaysByType removed as BayType is no longer used

/**
 * Hook for active service bays
 */
export const useActiveServiceBays = (branchId?: string) => {
  return useQuery({
    queryKey: serviceBayKeys.active(branchId),
    queryFn: () => ServiceBayService.getActiveServiceBays(branchId),
    enabled: true,
  });
};

/**
 * Hook for available service bays in time range
 */
export const useAvailableServiceBays = (
  branchId: string | null,
  startTime: string | null,
  endTime: string | null
) => {
  return useQuery({
    queryKey: serviceBayKeys.available(branchId || '', startTime || '', endTime || ''),
    queryFn: () => ServiceBayService.getAvailableServiceBays(branchId!, startTime!, endTime!),
    enabled: !!(branchId && startTime && endTime),
  });
};

/**
 * Hook for service bay statistics
 */
export const useServiceBayStatistics = (bayId: string | null) => {
  return useQuery({
    queryKey: serviceBayKeys.statistics(bayId || ''),
    queryFn: () => ServiceBayService.getBayStatistics(bayId!),
    enabled: !!bayId,
  });
};

/**
 * Hook for service bay bookings
 */
export const useServiceBayBookings = (bayId: string | null) => {
  return useQuery({
    queryKey: serviceBayKeys.bookings(bayId || ''),
    queryFn: () => ServiceBayService.getBayBookings(bayId!),
    enabled: !!bayId,
  });
};

/**
 * Hook for creating service bay
 */
export const useCreateServiceBay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceBayRequest) => ServiceBayService.createServiceBay(data),
    onSuccess: () => {
      // Invalidate and refetch service bays list
      queryClient.invalidateQueries({
        queryKey: serviceBayKeys.lists(),
      });
      // Invalidate dropdown data
      queryClient.invalidateQueries({
        queryKey: serviceBayKeys.all,
      });
    },
  });
};

/**
 * Hook for updating service bay
 */
export const useUpdateServiceBay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bayId, data }: { bayId: string; data: UpdateServiceBayRequest }) =>
      ServiceBayService.updateServiceBay(bayId, data),
    onSuccess: (_, { bayId }) => {
      // Invalidate and refetch service bays list
      queryClient.invalidateQueries({
        queryKey: serviceBayKeys.lists(),
      });
      // Invalidate specific service bay detail
      queryClient.invalidateQueries({
        queryKey: serviceBayKeys.detail(bayId),
      });
      // Invalidate dropdown data
      queryClient.invalidateQueries({
        queryKey: serviceBayKeys.all,
      });
    },
  });
};

/**
 * Hook for deleting service bay
 */
export const useDeleteServiceBay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bayId: string) => ServiceBayService.deleteServiceBay(bayId),
    onSuccess: () => {
      // Invalidate and refetch service bays list
      queryClient.invalidateQueries({
        queryKey: serviceBayKeys.lists(),
      });
      // Invalidate dropdown data
      queryClient.invalidateQueries({
        queryKey: serviceBayKeys.all,
      });
    },
  });
};

/**
 * Hook for updating service bay status
 */
export const useUpdateServiceBayStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bayId, status, reason }: { bayId: string; status: BayStatus; reason?: string }) =>
      ServiceBayService.updateServiceBayStatus(bayId, status, reason),
    onSuccess: (_, { bayId }) => {
      // Invalidate and refetch service bays list
      queryClient.invalidateQueries({
        queryKey: serviceBayKeys.lists(),
      });
      // Invalidate specific service bay detail
      queryClient.invalidateQueries({
        queryKey: serviceBayKeys.detail(bayId),
      });
      // Invalidate dropdown data
      queryClient.invalidateQueries({
        queryKey: serviceBayKeys.all,
      });
    },
  });
};

/**
 * Hook for activating service bay
 */
export const useActivateServiceBay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bayId: string) => ServiceBayService.activateServiceBay(bayId),
    onSuccess: (_, bayId) => {
      // Invalidate and refetch service bays list
      queryClient.invalidateQueries({
        queryKey: serviceBayKeys.lists(),
      });
      // Invalidate specific service bay detail
      queryClient.invalidateQueries({
        queryKey: serviceBayKeys.detail(bayId),
      });
      // Invalidate dropdown data
      queryClient.invalidateQueries({
        queryKey: serviceBayKeys.all,
      });
    },
  });
};

/**
 * Hook for deactivating service bay
 */
export const useDeactivateServiceBay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bayId, reason }: { bayId: string; reason: string }) =>
      ServiceBayService.deactivateServiceBay(bayId, reason),
    onSuccess: (_, { bayId }) => {
      // Invalidate and refetch service bays list
      queryClient.invalidateQueries({
        queryKey: serviceBayKeys.lists(),
      });
      // Invalidate specific service bay detail
      queryClient.invalidateQueries({
        queryKey: serviceBayKeys.detail(bayId),
      });
      // Invalidate dropdown data
      queryClient.invalidateQueries({
        queryKey: serviceBayKeys.all,
      });
    },
  });
};

/**
 * Hook for checking bay availability
 */
export const useCheckBayAvailability = () => {
  return useMutation({
    mutationFn: ({ bayId, data }: { bayId: string; data: { start_time: string; end_time: string } }) =>
      ServiceBayService.checkBayAvailability(bayId, data),
  });
};

/**
 * Hook for validating bay name
 */
export const useValidateBayName = () => {
  return useMutation({
    mutationFn: ({ branchId, bayName, bayId }: { branchId: string; bayName: string; bayId?: string }) =>
      ServiceBayService.validateBayName(branchId, bayName, bayId),
  });
};

/**
 * Hook for refreshing service bays data
 */
export const useRefreshServiceBays = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      queryKey: serviceBayKeys.lists(),
    });
  };
};