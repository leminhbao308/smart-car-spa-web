/**
 * Hook to get services with inventory check and filtering
 */

import { useQuery } from "@tanstack/react-query";
import { Service } from "../types/service.types";
import { enrichServicesWithInventory, ServiceWithInventory } from "../services/service-inventory.service";

interface UseServicesWithInventoryParams {
  services: Service[];
  branchId: string | null;
  enabled?: boolean;
}

export const useServicesWithInventory = ({
  services,
  branchId,
  enabled = true,
}: UseServicesWithInventoryParams) => {
  return useQuery<ServiceWithInventory[]>({
    queryKey: ["services-with-inventory", branchId, services.map((s) => s.service_id).join(",")],
    queryFn: async () => {
      if (!branchId || !services || services.length === 0) {
        return [];
      }
      return await enrichServicesWithInventory(services, branchId);
    },
    enabled: enabled && !!branchId && services.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

