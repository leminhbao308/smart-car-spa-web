"use client";

import { useQuery } from "@tanstack/react-query";
import { ServiceService } from "../services/service.service";
import { Service } from "../types/service.types";

export const serviceKeys = {
  all: ["services"] as const,
  forSale: (branchId: string) => [...serviceKeys.all, "for-sale", branchId] as const,
};

export const useServicesForSale = (branchId: string) => {
  return useQuery<Service[], Error>({
    queryKey: serviceKeys.forSale(branchId),
    queryFn: async () => {
      const response = await ServiceService.getAllServices({
        branch_id: branchId,
        is_active: true,
        page: 0,
        size: 1000, // Get all services for the branch
      });
      // Handle both Service[] and ServicePageResponse
      return Array.isArray(response.data) ? response.data : response.data.content;
    },
    enabled: !!branchId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
