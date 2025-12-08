"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ServiceProcessService } from "../services/service-process.service";
import {
  ServiceProcessFilterParam,
  CreateServiceProcessRequest,
  UpdateServiceProcessRequest,
} from "../types/service-process.types";

// Query keys for service processes
export const serviceProcessKeys = {
  all: ['serviceProcesses'] as const,
  lists: () => [...serviceProcessKeys.all, 'list'] as const,
  list: (filters: ServiceProcessFilterParam) => [...serviceProcessKeys.lists(), { filters }] as const,
  details: () => [...serviceProcessKeys.all, 'detail'] as const,
  detail: (id: string) => [...serviceProcessKeys.details(), id] as const,
  active: () => [...serviceProcessKeys.all, 'active'] as const,
  default: () => [...serviceProcessKeys.all, 'default'] as const,
};

/**
 * Hook for all service processes data with pagination and search
 */
export const useServiceProcesses = (params: ServiceProcessFilterParam = {}) => {
  return useQuery({
    queryKey: serviceProcessKeys.list(params),
    queryFn: () => ServiceProcessService.getAllServiceProcesses(params, { page: 0, size: 1000 }),
    enabled: true,
  });
};

/**
 * Hook for a single service process by ID
 */
export const useServiceProcess = (serviceProcessId: string | null) => {
  return useQuery({
    queryKey: serviceProcessKeys.detail(serviceProcessId || ''),
    queryFn: () => ServiceProcessService.getServiceProcessById(serviceProcessId!),
    enabled: !!serviceProcessId,
  });
};

/**
 * Hook for active service processes
 */
export const useActiveServiceProcesses = () => {
  return useQuery({
    queryKey: serviceProcessKeys.active(),
    queryFn: () => ServiceProcessService.getAllActiveServiceProcesses(),
    enabled: true,
  });
};

/**
 * Hook for default service processes
 */
export const useDefaultServiceProcesses = () => {
  return useQuery({
    queryKey: serviceProcessKeys.default(),
    queryFn: () => ServiceProcessService.getAllServiceProcesses({ isDefault: true }, { page: 0, size: 1000 }),
    enabled: true,
  });
};

/**
 * Hook for creating a new service process
 */
export const useCreateServiceProcess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceProcessRequest) => ServiceProcessService.createServiceProcess(data),
    onSuccess: () => {
      // Invalidate and refetch service processes list
      queryClient.invalidateQueries({
        queryKey: serviceProcessKeys.lists(),
      });
    },
  });
};

/**
 * Hook for updating a service process
 */
export const useUpdateServiceProcess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceProcessId, data }: { serviceProcessId: string; data: UpdateServiceProcessRequest }) =>
      ServiceProcessService.updateServiceProcess(serviceProcessId, data),
    onSuccess: (_, { serviceProcessId }) => {
      // Invalidate and refetch service processes list and detail
      queryClient.invalidateQueries({
        queryKey: serviceProcessKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: serviceProcessKeys.detail(serviceProcessId),
      });
    },
  });
};

/**
 * Hook for deleting a service process
 */
export const useDeleteServiceProcess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceProcessId: string) => ServiceProcessService.deleteServiceProcess(serviceProcessId),
    onSuccess: () => {
      // Invalidate and refetch service processes list
      queryClient.invalidateQueries({
        queryKey: serviceProcessKeys.lists(),
      });
    },
  });
};

