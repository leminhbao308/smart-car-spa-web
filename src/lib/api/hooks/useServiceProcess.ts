/**
 * Service Process Hooks
 * React Query hooks for service process management
 */

import { useQuery } from '@tanstack/react-query';
import { ServiceProcessService } from '../services/service-process.service';

// Query Keys
export const serviceProcessKeys = {
  all: ['serviceProcesses'] as const,
  lists: () => [...serviceProcessKeys.all, 'list'] as const,
  list: (filters: any) => [...serviceProcessKeys.lists(), filters] as const,
  details: () => [...serviceProcessKeys.all, 'detail'] as const,
  detail: (id: string) => [...serviceProcessKeys.details(), id] as const,
  byService: (serviceId: string) => [...serviceProcessKeys.all, 'service', serviceId] as const,
  steps: (processId: string) => [...serviceProcessKeys.all, 'steps', processId] as const,
};

// Hooks
export const useServiceProcesses = (filters?: any) => {
  return useQuery({
    queryKey: serviceProcessKeys.list(filters || {}),
    queryFn: () => ServiceProcessService.getAllServiceProcesses(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useServiceProcess = (processId: string) => {
  return useQuery({
    queryKey: serviceProcessKeys.detail(processId),
    queryFn: () => ServiceProcessService.getServiceProcessById(processId),
    enabled: !!processId,
  });
};

export const useServiceProcessByServiceId = (serviceId: string) => {
  return useQuery({
    queryKey: serviceProcessKeys.byService(serviceId),
    queryFn: () => ServiceProcessService.getServiceProcessByServiceId(serviceId),
    enabled: !!serviceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useServiceProcessSteps = (processId: string) => {
  return useQuery({
    queryKey: serviceProcessKeys.steps(processId),
    queryFn: () => ServiceProcessService.getServiceProcessSteps(processId),
    enabled: !!processId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
