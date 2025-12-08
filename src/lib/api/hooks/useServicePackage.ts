/**
 * Service Package Hooks
 * React Query hooks for service package operations
 */

import { useQuery } from "@tanstack/react-query";
import { servicePackageService } from "../services/service-package.service";
import { ServicePackage } from "../types/service-package.types";

// Query keys
export const servicePackageKeys = {
  all: ["servicePackages"] as const,
  lists: () => [...servicePackageKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...servicePackageKeys.lists(), { filters }] as const,
  details: () => [...servicePackageKeys.all, "detail"] as const,
  detail: (id: string) => [...servicePackageKeys.details(), id] as const,
};

/**
 * Get service package by ID
 */
export const useServicePackage = (packageId: string) => {
  return useQuery({
    queryKey: servicePackageKeys.detail(packageId),
    queryFn: () => servicePackageService.getServicePackageById(packageId),
    enabled: !!packageId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get all service packages with pagination
 */
export const useServicePackages = (
  page: number = 0,
  size: number = 10,
  sort: string = "createdDate",
  direction: string = "DESC"
) => {
  return useQuery({
    queryKey: servicePackageKeys.list({ page, size, sort, direction }),
    queryFn: () => servicePackageService.getAllServicePackages(page, size, sort, direction),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
