/**
 * Service Process Tracking Hooks
 * React Query hooks for service process tracking
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TrackingService } from '../services/trackingService';
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
export const trackingKeys = {
  all: ['trackings'] as const,
  lists: () => [...trackingKeys.all, 'list'] as const,
  list: (filters: ServiceProcessTrackingFilterParam) => [...trackingKeys.lists(), filters] as const,
  details: () => [...trackingKeys.all, 'detail'] as const,
  detail: (id: string) => [...trackingKeys.details(), id] as const,
  byBooking: (bookingId: string) => [...trackingKeys.all, 'booking', bookingId] as const,
  byTechnician: (technicianId: string) => [...trackingKeys.all, 'technician', technicianId] as const,
  byBay: (bayId: string) => [...trackingKeys.all, 'bay', bayId] as const,
  inProgress: () => [...trackingKeys.all, 'in-progress'] as const,
};

// Hooks
export const useTrackings = (filterParam?: ServiceProcessTrackingFilterParam, pageable?: any) => {
  return useQuery({
    queryKey: trackingKeys.list(filterParam || {}),
    queryFn: () => TrackingService.getAllTrackings(filterParam, pageable),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useTracking = (trackingId: string) => {
  return useQuery({
    queryKey: trackingKeys.detail(trackingId),
    queryFn: () => TrackingService.getTrackingById(trackingId),
    enabled: !!trackingId,
  });
};

export const useTrackingsByBooking = (bookingId: string) => {
  return useQuery({
    queryKey: trackingKeys.byBooking(bookingId),
    queryFn: () => TrackingService.getTrackingsByBooking(bookingId),
    enabled: !!bookingId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useTrackingsByTechnician = (technicianId: string) => {
  return useQuery({
    queryKey: trackingKeys.byTechnician(technicianId),
    queryFn: () => TrackingService.getTrackingsByTechnician(technicianId),
    enabled: !!technicianId,
  });
};

export const useTrackingsByBay = (bayId: string) => {
  return useQuery({
    queryKey: trackingKeys.byBay(bayId),
    queryFn: () => TrackingService.getTrackingsByBay(bayId),
    enabled: !!bayId,
  });
};

export const useInProgressTrackings = () => {
  return useQuery({
    queryKey: trackingKeys.inProgress(),
    queryFn: () => TrackingService.getInProgressTrackings(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
  });
};

// Mutations
export const useCreateTracking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: CreateServiceProcessTrackingRequest) => TrackingService.createTracking(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: trackingKeys.byBooking(variables.bookingId) });
      queryClient.invalidateQueries({ queryKey: trackingKeys.lists() });
    },
  });
};

export const useUpdateTracking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ trackingId, request }: { trackingId: string; request: UpdateServiceProcessTrackingRequest }) =>
      TrackingService.updateTracking(trackingId, request),
    onSuccess: (_, { trackingId }) => {
      queryClient.invalidateQueries({ queryKey: trackingKeys.detail(trackingId) });
      queryClient.invalidateQueries({ queryKey: trackingKeys.lists() });
    },
  });
};

export const useDeleteTracking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (trackingId: string) => TrackingService.deleteTracking(trackingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trackingKeys.lists() });
    },
  });
};

export const useStartStep = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ trackingId, request }: { trackingId: string; request: StartStepRequest }) =>
      TrackingService.startStep(trackingId, request),
    onSuccess: (_, { trackingId }) => {
      queryClient.invalidateQueries({ queryKey: trackingKeys.detail(trackingId) });
      queryClient.invalidateQueries({ queryKey: trackingKeys.lists() });
    },
  });
};

export const useUpdateProgress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ trackingId, request }: { trackingId: string; request: ProgressUpdateRequest }) =>
      TrackingService.updateProgress(trackingId, request),
    onSuccess: (_, { trackingId }) => {
      queryClient.invalidateQueries({ queryKey: trackingKeys.detail(trackingId) });
      queryClient.invalidateQueries({ queryKey: trackingKeys.lists() });
    },
  });
};

export const useCompleteStep = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ trackingId, request }: { trackingId: string; request: CompleteStepRequest }) =>
      TrackingService.completeStep(trackingId, request),
    onSuccess: (_, { trackingId }) => {
      queryClient.invalidateQueries({ queryKey: trackingKeys.detail(trackingId) });
      queryClient.invalidateQueries({ queryKey: trackingKeys.lists() });
    },
  });
};

export const useCancelStep = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ trackingId, request }: { trackingId: string; request: CancelStepRequest }) =>
      TrackingService.cancelStep(trackingId, request),
    onSuccess: (_, { trackingId }) => {
      queryClient.invalidateQueries({ queryKey: trackingKeys.detail(trackingId) });
      queryClient.invalidateQueries({ queryKey: trackingKeys.lists() });
    },
  });
};

export const useAddNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ trackingId, request }: { trackingId: string; request: ProgressUpdateRequest }) =>
      TrackingService.addNote(trackingId, request),
    onSuccess: (_, { trackingId }) => {
      queryClient.invalidateQueries({ queryKey: trackingKeys.detail(trackingId) });
    },
  });
};

export const useAddEvidenceMedia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ trackingId, mediaUrl }: { trackingId: string; mediaUrl: string }) =>
      TrackingService.addEvidenceMedia(trackingId, mediaUrl),
    onSuccess: (_, { trackingId }) => {
      queryClient.invalidateQueries({ queryKey: trackingKeys.detail(trackingId) });
    },
  });
};
