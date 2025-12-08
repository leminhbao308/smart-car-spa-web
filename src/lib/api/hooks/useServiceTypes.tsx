"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ServiceTypeService } from "../services/service-type.service";
import {
  ServiceTypeFilterParam,
  CreateServiceTypeRequest,
  UpdateServiceTypeRequest,
} from "../types/service-type.types";

// Query keys for service types
export const serviceTypeKeys = {
  all: ['serviceTypes'] as const,
  lists: () => [...serviceTypeKeys.all, 'list'] as const,
  list: (filters: ServiceTypeFilterParam) => [...serviceTypeKeys.lists(), { filters }] as const,
  details: () => [...serviceTypeKeys.all, 'detail'] as const,
  detail: (id: string) => [...serviceTypeKeys.details(), id] as const,
  byCode: (code: string) => [...serviceTypeKeys.all, 'byCode', code] as const,
  active: () => [...serviceTypeKeys.all, 'active'] as const,
  search: (keyword: string) => [...serviceTypeKeys.all, 'search', keyword] as const,
  statistics: () => [...serviceTypeKeys.all, 'statistics'] as const,
};

/**
 * Hook for all service types data with pagination and search
 */
export const useServiceTypes = (params: ServiceTypeFilterParam = {}) => {
  return useQuery({
    queryKey: serviceTypeKeys.list(params),
    queryFn: () => ServiceTypeService.getAllServiceTypes(params),
    enabled: true,
  });
};

/**
 * Hook for a single service type by ID
 */
export const useServiceType = (serviceTypeId: string | null) => {
  return useQuery({
    queryKey: serviceTypeKeys.detail(serviceTypeId || ''),
    queryFn: () => ServiceTypeService.getServiceTypeById(serviceTypeId!),
    enabled: !!serviceTypeId,
  });
};

/**
 * Hook for service type by code
 */
export const useServiceTypeByCode = (code: string | null) => {
  return useQuery({
    queryKey: serviceTypeKeys.byCode(code || ''),
    queryFn: () => ServiceTypeService.getServiceTypeByCode(code!),
    enabled: !!code,
  });
};

/**
 * Hook for active service types
 */
export const useActiveServiceTypes = () => {
  return useQuery({
    queryKey: serviceTypeKeys.active(),
    queryFn: () => ServiceTypeService.getActiveServiceTypes(),
    enabled: true,
  });
};

/**
 * Hook for searching service types
 */
export const useSearchServiceTypes = (keyword: string | null) => {
  return useQuery({
    queryKey: serviceTypeKeys.search(keyword || ''),
    queryFn: () => ServiceTypeService.searchServiceTypes(keyword!),
    enabled: !!keyword && keyword.length > 0,
  });
};

/**
 * Hook for service type statistics
 */
export const useServiceTypeStatistics = () => {
  return useQuery({
    queryKey: serviceTypeKeys.statistics(),
    queryFn: () => ServiceTypeService.getServiceTypeStatistics(),
    enabled: true,
  });
};

/**
 * Hook for creating service type
 */
export const useCreateServiceType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceTypeRequest) => ServiceTypeService.createServiceType(data),
    onSuccess: () => {
      // Invalidate and refetch service types list
      queryClient.invalidateQueries({
        queryKey: serviceTypeKeys.lists(),
      });
      // Invalidate active service types
      queryClient.invalidateQueries({
        queryKey: serviceTypeKeys.active(),
      });
      // Invalidate statistics
      queryClient.invalidateQueries({
        queryKey: serviceTypeKeys.statistics(),
      });
    },
  });
};

/**
 * Hook for updating service type
 */
export const useUpdateServiceType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceTypeId, data }: { serviceTypeId: string; data: UpdateServiceTypeRequest }) =>
      ServiceTypeService.updateServiceType(serviceTypeId, data),
    onSuccess: (_, { serviceTypeId }) => {
      // Invalidate and refetch service types list
      queryClient.invalidateQueries({
        queryKey: serviceTypeKeys.lists(),
      });
      // Invalidate specific service type detail
      queryClient.invalidateQueries({
        queryKey: serviceTypeKeys.detail(serviceTypeId),
      });
      // Invalidate active service types
      queryClient.invalidateQueries({
        queryKey: serviceTypeKeys.active(),
      });
      // Invalidate statistics
      queryClient.invalidateQueries({
        queryKey: serviceTypeKeys.statistics(),
      });
    },
  });
};

/**
 * Hook for deleting service type
 */
export const useDeleteServiceType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceTypeId: string) => ServiceTypeService.deleteServiceType(serviceTypeId),
    onSuccess: () => {
      // Invalidate and refetch service types list
      queryClient.invalidateQueries({
        queryKey: serviceTypeKeys.lists(),
      });
      // Invalidate active service types
      queryClient.invalidateQueries({
        queryKey: serviceTypeKeys.active(),
      });
      // Invalidate statistics
      queryClient.invalidateQueries({
        queryKey: serviceTypeKeys.statistics(),
      });
    },
  });
};

/**
 * Hook for restoring service type
 */
export const useRestoreServiceType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceTypeId: string) => ServiceTypeService.restoreServiceType(serviceTypeId),
    onSuccess: () => {
      // Invalidate and refetch service types list
      queryClient.invalidateQueries({
        queryKey: serviceTypeKeys.lists(),
      });
      // Invalidate active service types
      queryClient.invalidateQueries({
        queryKey: serviceTypeKeys.active(),
      });
      // Invalidate statistics
      queryClient.invalidateQueries({
        queryKey: serviceTypeKeys.statistics(),
      });
    },
  });
};

/**
 * Hook for updating service type status
 */
export const useUpdateServiceTypeStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceTypeId, isActive }: { serviceTypeId: string; isActive: boolean }) =>
      ServiceTypeService.updateServiceTypeStatus(serviceTypeId, isActive),
    onSuccess: (_, { serviceTypeId }) => {
      // Invalidate and refetch service types list
      queryClient.invalidateQueries({
        queryKey: serviceTypeKeys.lists(),
      });
      // Invalidate specific service type detail
      queryClient.invalidateQueries({
        queryKey: serviceTypeKeys.detail(serviceTypeId),
      });
      // Invalidate active service types
      queryClient.invalidateQueries({
        queryKey: serviceTypeKeys.active(),
      });
      // Invalidate statistics
      queryClient.invalidateQueries({
        queryKey: serviceTypeKeys.statistics(),
      });
    },
  });
};

/**
 * Hook for activating service type
 */
export const useActivateServiceType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceTypeId: string) => ServiceTypeService.activateServiceType(serviceTypeId),
    onSuccess: (_, serviceTypeId) => {
      // Invalidate and refetch service types list
      queryClient.invalidateQueries({
        queryKey: serviceTypeKeys.lists(),
      });
      // Invalidate specific service type detail
      queryClient.invalidateQueries({
        queryKey: serviceTypeKeys.detail(serviceTypeId),
      });
      // Invalidate active service types
      queryClient.invalidateQueries({
        queryKey: serviceTypeKeys.active(),
      });
      // Invalidate statistics
      queryClient.invalidateQueries({
        queryKey: serviceTypeKeys.statistics(),
      });
    },
  });
};

/**
 * Hook for deactivating service type
 */
export const useDeactivateServiceType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceTypeId: string) => ServiceTypeService.deactivateServiceType(serviceTypeId),
    onSuccess: (_, serviceTypeId) => {
      // Invalidate and refetch service types list
      queryClient.invalidateQueries({
        queryKey: serviceTypeKeys.lists(),
      });
      // Invalidate specific service type detail
      queryClient.invalidateQueries({
        queryKey: serviceTypeKeys.detail(serviceTypeId),
      });
      // Invalidate active service types
      queryClient.invalidateQueries({
        queryKey: serviceTypeKeys.active(),
      });
      // Invalidate statistics
      queryClient.invalidateQueries({
        queryKey: serviceTypeKeys.statistics(),
      });
    },
  });
};

/**
 * Hook for validating service type code
 */
export const useValidateServiceTypeCode = () => {
  return useMutation({
    mutationFn: (code: string) => ServiceTypeService.validateServiceTypeCode(code),
  });
};

/**
 * Hook for refreshing service types data
 */
export const useRefreshServiceTypes = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      queryKey: serviceTypeKeys.lists(),
    });
  };
};
