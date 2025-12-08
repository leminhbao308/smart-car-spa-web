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
  products: (processId: string) => [...serviceProcessKeys.all, 'products', processId] as const,
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

export const useServiceProcessProducts = (processId: string) => {
  return useQuery({
    queryKey: serviceProcessKeys.products(processId),
    queryFn: () => ServiceProcessService.getServiceProcessProducts(processId),
    enabled: !!processId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Composite hook để lấy products từ serviceId
 * Flow: serviceId -> serviceProcess -> products
 */
export const useServiceProductsByServiceId = (serviceId: string) => {
  // Bước 1: Lấy service process từ serviceId
  const serviceProcessQuery = useServiceProcessByServiceId(serviceId);
  
  // Bước 2: Lấy products từ processId (nếu có)
  const productsQuery = useServiceProcessProducts(
    serviceProcessQuery.data?.processId || ""
  );

  return {
    // Data
    serviceProcess: serviceProcessQuery.data,
    products: productsQuery.data || [],
    
    // Loading states
    isLoadingServiceProcess: serviceProcessQuery.isLoading,
    isLoadingProducts: productsQuery.isLoading,
    isLoading: serviceProcessQuery.isLoading || productsQuery.isLoading,
    
    // Error states
    serviceProcessError: serviceProcessQuery.error,
    productsError: productsQuery.error,
    error: serviceProcessQuery.error || productsQuery.error,
    
    // Refetch functions
    refetchServiceProcess: serviceProcessQuery.refetch,
    refetchProducts: productsQuery.refetch,
    refetch: () => {
      serviceProcessQuery.refetch();
      productsQuery.refetch();
    },
    
    // Success states
    isSuccess: serviceProcessQuery.isSuccess && productsQuery.isSuccess,
  };
};
