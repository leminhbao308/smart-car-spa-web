"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ServiceService } from "../services/service.service";
import {
  ServiceFilterParam,
  CreateServiceRequest,
  UpdateServiceRequest,
  UpdateServiceStatusRequest,
  SkillLevel
} from "../types/service.types";

// Query keys for services
export const serviceKeys = {
  all: ['services'] as const,
  lists: () => [...serviceKeys.all, 'list'] as const,
  list: (filters: ServiceFilterParam) => [...serviceKeys.lists(), { filters }] as const,
  details: () => [...serviceKeys.all, 'detail'] as const,
  detail: (id: string) => [...serviceKeys.details(), id] as const,
  byCategory: (categoryId: string) => [...serviceKeys.all, 'byCategory', categoryId] as const,
  byType: (serviceTypeId: string) => [...serviceKeys.all, 'byType', serviceTypeId] as const,
  bySkillLevel: (skillLevel: SkillLevel) => [...serviceKeys.all, 'bySkillLevel', skillLevel] as const,
  featured: () => [...serviceKeys.all, 'featured'] as const,
  package: () => [...serviceKeys.all, 'package'] as const,
  nonPackage: () => [...serviceKeys.all, 'nonPackage'] as const,
  search: (keyword: string) => [...serviceKeys.all, 'search', keyword] as const,
  pricing: (id: string, priceBookId?: string) => [...serviceKeys.all, 'pricing', id, { priceBookId }] as const,
  pricingInfo: (id: string) => [...serviceKeys.all, 'pricingInfo', id] as const,
  countByCategory: (categoryId: string) => [...serviceKeys.all, 'countByCategory', categoryId] as const,
  countByType: (serviceTypeId: string) => [...serviceKeys.all, 'countByType', serviceTypeId] as const,
  countBySkillLevel: (skillLevel: SkillLevel) => [...serviceKeys.all, 'countBySkillLevel', skillLevel] as const,
};

/**
 * Hook for all services data with pagination and search
 */
export const useServices = (params: ServiceFilterParam = {}) => {
  return useQuery({
    queryKey: serviceKeys.list(params),
    queryFn: () => ServiceService.getAllServices(params),
    enabled: true,
  });
};

/**
 * Hook for a single service by ID
 */
export const useService = (serviceId: string | null) => {
  return useQuery({
    queryKey: serviceKeys.detail(serviceId || ''),
    queryFn: () => ServiceService.getServiceById(serviceId!),
    enabled: !!serviceId,
  });
};

/**
 * Hook for service by URL
 */
export const useServiceByUrl = (serviceUrl: string | null) => {
  return useQuery({
    queryKey: [...serviceKeys.all, 'byUrl', serviceUrl || ''],
    queryFn: () => ServiceService.getServiceByUrl(serviceUrl!),
    enabled: !!serviceUrl,
  });
};

/**
 * Hook for services by category
 */
export const useServicesByCategory = (categoryId: string | null) => {
  return useQuery({
    queryKey: serviceKeys.byCategory(categoryId || ''),
    queryFn: () => ServiceService.getServicesByCategory(categoryId!),
    enabled: !!categoryId,
  });
};

/**
 * Hook for services by type
 */
export const useServicesByType = (serviceTypeId: string | null) => {
  return useQuery({
    queryKey: serviceKeys.byType(serviceTypeId || ''),
    queryFn: () => ServiceService.getServicesByType(serviceTypeId!),
    enabled: !!serviceTypeId,
  });
};

/**
 * Hook for services by skill level
 */
export const useServicesBySkillLevel = (skillLevel: SkillLevel | null) => {
  return useQuery({
    queryKey: serviceKeys.bySkillLevel(skillLevel || SkillLevel.BEGINNER),
    queryFn: () => ServiceService.getServicesBySkillLevel(skillLevel!),
    enabled: !!skillLevel,
  });
};

/**
 * Hook for featured services
 */
export const useFeaturedServices = () => {
  return useQuery({
    queryKey: serviceKeys.featured(),
    queryFn: () => ServiceService.getFeaturedServices(),
    enabled: true,
  });
};

/**
 * Hook for package services
 */
export const usePackageServices = () => {
  return useQuery({
    queryKey: serviceKeys.package(),
    queryFn: () => ServiceService.getPackageServices(),
    enabled: true,
  });
};

/**
 * Hook for non-package services
 */
export const useNonPackageServices = () => {
  return useQuery({
    queryKey: serviceKeys.nonPackage(),
    queryFn: () => ServiceService.getNonPackageServices(),
    enabled: true,
  });
};

/**
 * Hook for searching services
 */
export const useSearchServices = (keyword: string | null) => {
  return useQuery({
    queryKey: serviceKeys.search(keyword || ''),
    queryFn: () => ServiceService.searchServices(keyword!),
    enabled: !!keyword && keyword.length > 0,
  });
};

/**
 * Hook for service pricing
 */
export const useServicePricing = (serviceId: string | null, priceBookId?: string) => {
  return useQuery({
    queryKey: serviceKeys.pricing(serviceId || '', priceBookId),
    queryFn: () => ServiceService.getServicePricing(serviceId!, priceBookId),
    enabled: !!serviceId,
  });
};

/**
 * Hook for service pricing info
 */
export const useServicePricingInfo = (serviceId: string | null) => {
  return useQuery({
    queryKey: serviceKeys.pricingInfo(serviceId || ''),
    queryFn: () => ServiceService.getServicePricingInfo(serviceId!),
    enabled: !!serviceId,
  });
};

/**
 * Hook for service count by category
 */
export const useServiceCountByCategory = (categoryId: string | null) => {
  return useQuery({
    queryKey: serviceKeys.countByCategory(categoryId || ''),
    queryFn: () => ServiceService.getServiceCountByCategory(categoryId!),
    enabled: !!categoryId,
  });
};

/**
 * Hook for service count by type
 */
export const useServiceCountByType = (serviceTypeId: string | null) => {
  return useQuery({
    queryKey: serviceKeys.countByType(serviceTypeId || ''),
    queryFn: () => ServiceService.getServiceCountByType(serviceTypeId!),
    enabled: !!serviceTypeId,
  });
};

/**
 * Hook for service count by skill level
 */
export const useServiceCountBySkillLevel = (skillLevel: SkillLevel | null) => {
  return useQuery({
    queryKey: serviceKeys.countBySkillLevel(skillLevel || SkillLevel.BEGINNER),
    queryFn: () => ServiceService.getServiceCountBySkillLevel(skillLevel!),
    enabled: !!skillLevel,
  });
};

/**
 * Hook for creating service
 */
export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceRequest) => ServiceService.createService(data),
    onSuccess: () => {
      // Invalidate and refetch services list
      queryClient.invalidateQueries({
        queryKey: serviceKeys.lists(),
      });
      // Invalidate featured, package, non-package services
      queryClient.invalidateQueries({
        queryKey: serviceKeys.featured(),
      });
      queryClient.invalidateQueries({
        queryKey: serviceKeys.package(),
      });
      queryClient.invalidateQueries({
        queryKey: serviceKeys.nonPackage(),
      });
    },
  });
};

/**
 * Hook for updating service
 */
export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, data }: { serviceId: string; data: UpdateServiceRequest }) =>
      ServiceService.updateService(serviceId, data),
    onSuccess: (_, { serviceId }) => {
      // Invalidate and refetch services list
      queryClient.invalidateQueries({
        queryKey: serviceKeys.lists(),
      });
      // Invalidate specific service detail
      queryClient.invalidateQueries({
        queryKey: serviceKeys.detail(serviceId),
      });
      // Invalidate featured, package, non-package services
      queryClient.invalidateQueries({
        queryKey: serviceKeys.featured(),
      });
      queryClient.invalidateQueries({
        queryKey: serviceKeys.package(),
      });
      queryClient.invalidateQueries({
        queryKey: serviceKeys.nonPackage(),
      });
    },
  });
};

/**
 * Hook for updating service status
 */
export const useUpdateServiceStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, data }: { serviceId: string; data: UpdateServiceStatusRequest }) =>
      ServiceService.updateServiceStatus(serviceId, data),
    onSuccess: (_, { serviceId }) => {
      // Invalidate and refetch services list
      queryClient.invalidateQueries({
        queryKey: serviceKeys.lists(),
      });
      // Invalidate specific service detail
      queryClient.invalidateQueries({
        queryKey: serviceKeys.detail(serviceId),
      });
    },
  });
};

/**
 * Hook for deleting service
 */
export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceId: string) => ServiceService.deleteService(serviceId),
    onSuccess: () => {
      // Invalidate and refetch services list
      queryClient.invalidateQueries({
        queryKey: serviceKeys.lists(),
      });
      // Invalidate featured, package, non-package services
      queryClient.invalidateQueries({
        queryKey: serviceKeys.featured(),
      });
      queryClient.invalidateQueries({
        queryKey: serviceKeys.package(),
      });
      queryClient.invalidateQueries({
        queryKey: serviceKeys.nonPackage(),
      });
    },
  });
};

/**
 * Hook for recalculating service base price
 */
export const useRecalculateBasePrice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, priceBookId }: { serviceId: string; priceBookId?: string }) =>
      ServiceService.recalculateBasePrice(serviceId, priceBookId),
    onSuccess: (_, { serviceId }) => {
      // Invalidate service pricing
      queryClient.invalidateQueries({
        queryKey: serviceKeys.pricing(serviceId),
      });
      queryClient.invalidateQueries({
        queryKey: serviceKeys.pricingInfo(serviceId),
      });
    },
  });
};

/**
 * Hook for updating service labor cost
 */
export const useUpdateLaborCost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, data }: { serviceId: string; data: { labor_cost: number } }) =>
      ServiceService.updateLaborCost(serviceId, data),
    onSuccess: (_, { serviceId }) => {
      // Invalidate service pricing
      queryClient.invalidateQueries({
        queryKey: serviceKeys.pricing(serviceId),
      });
      queryClient.invalidateQueries({
        queryKey: serviceKeys.pricingInfo(serviceId),
      });
    },
  });
};

/**
 * Hook for refreshing services data
 */
export const useRefreshServices = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      queryKey: serviceKeys.lists(),
    });
  };
};
