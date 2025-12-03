import { useQuery } from "@tanstack/react-query";
import { ShippingService } from "../services/shipping.service";

/**
 * Hook to fetch provinces
 */
export const useProvinces = () => {
  return useQuery({
    queryKey: ["provinces"],
    queryFn: () => ShippingService.getProvinces(),
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
};

/**
 * Hook to fetch communes by province
 */
export const useCommunes = (provinceCode: string | null) => {
  return useQuery({
    queryKey: ["communes", provinceCode],
    queryFn: () => ShippingService.getCommunesByProvince(provinceCode!),
    enabled: !!provinceCode, // Only fetch when provinceCode is available
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
};
