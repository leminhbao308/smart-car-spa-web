/**
 * Service Process Tracking Hooks
 * React Query hooks for service process tracking using ServiceProcessTrackingService
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ServiceProcessTrackingService } from '../services/service-process-tracking.service';
import {
  ServiceProcessTrackingInfoDto,
  ServiceProcessTrackingFilterParam,
  CreateServiceProcessTrackingRequest,
  UpdateServiceProcessTrackingRequest,
  StartStepRequest,
  ProgressUpdateRequest,
  CompleteStepRequest,
  CancelStepRequest
} from '../types/service-process-tracking.types';

// Query Keys
export const serviceProcessTrackingKeys = {
  all: ['serviceProcessTrackings'] as const,
  lists: () => [...serviceProcessTrackingKeys.all, 'list'] as const,
  list: (filters: ServiceProcessTrackingFilterParam) => [...serviceProcessTrackingKeys.lists(), filters] as const,
  details: () => [...serviceProcessTrackingKeys.all, 'detail'] as const,
  detail: (id: string) => [...serviceProcessTrackingKeys.details(), id] as const,
  byBooking: (bookingId: string) => [...serviceProcessTrackingKeys.all, 'booking', bookingId] as const,
  byTechnician: (technicianId: string) => [...serviceProcessTrackingKeys.all, 'technician', technicianId] as const,
  byBay: (bayId: string) => [...serviceProcessTrackingKeys.all, 'bay', bayId] as const,
  inProgress: () => [...serviceProcessTrackingKeys.all, 'in-progress'] as const,
};

// Hooks
export const useServiceProcessTrackings = (filterParam?: ServiceProcessTrackingFilterParam, pageable?: any) => {
  return useQuery({
    queryKey: serviceProcessTrackingKeys.list(filterParam || {}),
    queryFn: () => ServiceProcessTrackingService.getAllTrackings(filterParam, pageable),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useServiceProcessTracking = (trackingId: string) => {
  return useQuery({
    queryKey: serviceProcessTrackingKeys.detail(trackingId),
    queryFn: () => ServiceProcessTrackingService.getTrackingById(trackingId),
    enabled: !!trackingId,
  });
};

export const useServiceProcessTrackingsByBooking = (bookingId: string) => {
  return useQuery({
    queryKey: serviceProcessTrackingKeys.byBooking(bookingId),
    queryFn: () => ServiceProcessTrackingService.getTrackingsByBooking(bookingId),
    enabled: !!bookingId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useServiceProcessTrackingsByTechnician = (technicianId: string) => {
  return useQuery({
    queryKey: serviceProcessTrackingKeys.byTechnician(technicianId),
    queryFn: () => ServiceProcessTrackingService.getTrackingsByTechnician(technicianId),
    enabled: !!technicianId,
  });
};

export const useServiceProcessTrackingsByBay = (bayId: string) => {
  return useQuery({
    queryKey: serviceProcessTrackingKeys.byBay(bayId),
    queryFn: () => ServiceProcessTrackingService.getTrackingsByBay(bayId),
    enabled: !!bayId,
  });
};

export const useInProgressServiceProcessTrackings = () => {
  return useQuery({
    queryKey: serviceProcessTrackingKeys.inProgress(),
    queryFn: () => ServiceProcessTrackingService.getInProgressTrackings(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
  });
};

// Mutations
export const useCreateServiceProcessTracking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: CreateServiceProcessTrackingRequest) => ServiceProcessTrackingService.createTracking(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: serviceProcessTrackingKeys.byBooking(variables.booking_id) });
      queryClient.invalidateQueries({ queryKey: serviceProcessTrackingKeys.lists() });
    },
  });
};

export const useUpdateServiceProcessTracking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ trackingId, request }: { trackingId: string; request: UpdateServiceProcessTrackingRequest }) =>
      ServiceProcessTrackingService.updateTracking(trackingId, request),
    onSuccess: (_, { trackingId }) => {
      queryClient.invalidateQueries({ queryKey: serviceProcessTrackingKeys.detail(trackingId) });
      queryClient.invalidateQueries({ queryKey: serviceProcessTrackingKeys.lists() });
    },
  });
};

export const useDeleteServiceProcessTracking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (trackingId: string) => ServiceProcessTrackingService.deleteTracking(trackingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceProcessTrackingKeys.lists() });
    },
  });
};

export const useStartServiceProcessTrackingStep = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ trackingId, request }: { trackingId: string; request: StartStepRequest }) =>
      ServiceProcessTrackingService.startStep(trackingId, request),
    onSuccess: (_, { trackingId }) => {
      queryClient.invalidateQueries({ queryKey: serviceProcessTrackingKeys.detail(trackingId) });
      queryClient.invalidateQueries({ queryKey: serviceProcessTrackingKeys.lists() });
    },
  });
};

export const useUpdateServiceProcessTrackingProgress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ trackingId, request }: { trackingId: string; request: ProgressUpdateRequest }) =>
      ServiceProcessTrackingService.updateProgress(trackingId, request),
    onSuccess: (_, { trackingId }) => {
      queryClient.invalidateQueries({ queryKey: serviceProcessTrackingKeys.detail(trackingId) });
      queryClient.invalidateQueries({ queryKey: serviceProcessTrackingKeys.lists() });
    },
  });
};

export const useCompleteServiceProcessTrackingStep = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ trackingId, request }: { trackingId: string; request: CompleteStepRequest }) =>
      ServiceProcessTrackingService.completeStep(trackingId, request),
    onSuccess: (_, { trackingId }) => {
      queryClient.invalidateQueries({ queryKey: serviceProcessTrackingKeys.detail(trackingId) });
      queryClient.invalidateQueries({ queryKey: serviceProcessTrackingKeys.lists() });
    },
  });
};

export const useCancelServiceProcessTrackingStep = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ trackingId, request }: { trackingId: string; request: CancelStepRequest }) =>
      ServiceProcessTrackingService.cancelStep(trackingId, request),
    onSuccess: (_, { trackingId }) => {
      queryClient.invalidateQueries({ queryKey: serviceProcessTrackingKeys.detail(trackingId) });
      queryClient.invalidateQueries({ queryKey: serviceProcessTrackingKeys.lists() });
    },
  });
};

export const useAddServiceProcessTrackingNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ trackingId, request }: { trackingId: string; request: ProgressUpdateRequest }) =>
      ServiceProcessTrackingService.addNote(trackingId, request),
    onSuccess: (_, { trackingId }) => {
      queryClient.invalidateQueries({ queryKey: serviceProcessTrackingKeys.detail(trackingId) });
    },
  });
};

export const useAddServiceProcessTrackingEvidence = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ trackingId, mediaUrl }: { trackingId: string; mediaUrl: string }) =>
      ServiceProcessTrackingService.addEvidenceMedia(trackingId, mediaUrl),
    onSuccess: (_, { trackingId }) => {
      queryClient.invalidateQueries({ queryKey: serviceProcessTrackingKeys.detail(trackingId) });
    },
  });
};
