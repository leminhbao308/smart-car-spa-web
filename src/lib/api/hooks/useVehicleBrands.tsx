/**
 * useVehicleBrands Hook
 * React hook for vehicle brand management and dropdown data
 * Migrated to TanStack React Query for better performance and caching
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { VehicleService } from "../services/vehicle.service";
import {
  VehicleBrandDropdownItem,
  GetAllVehicleBrandsRequest,
  CreateVehicleBrandRequest,
  UpdateVehicleBrandRequest,
} from "../types";
import { App } from "antd";

/**
 * Hook for vehicle brands dropdown data
 * Uses React Query for caching and automatic refetching
 */
export const useVehicleBrandsDropdown = () => {
  const {
    data: dropdownData = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["vehicle-brands", "dropdown"],
    queryFn: async () => {
      const response = await VehicleService.getVehicleBrandsForDropdown();
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - dropdown data changes rarely
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  return {
    dropdownData,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for vehicle brands management
 * Uses React Query for caching and automatic refetching
 */
export const useVehicleBrands = (params?: GetAllVehicleBrandsRequest) => {
  const {
    data: brandsResponse,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["vehicle-brands", "list", params],
    queryFn: async () => {
      const response = await VehicleService.getAllVehicleBrands(params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    brands: brandsResponse?.content || [],
    totalElements: brandsResponse?.total_elements || 0,
    totalPages: brandsResponse?.total_pages || 0,
    currentPage: brandsResponse?.page || 0,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for single vehicle brand
 * Uses React Query for caching and automatic refetching
 */
export const useVehicleBrand = (brandId: string | null) => {
  const {
    data: brand,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["vehicle-brands", "detail", brandId],
    queryFn: async () => {
      if (!brandId) return null;
      return await VehicleService.getVehicleBrandById(brandId);
    },
    enabled: !!brandId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    brand,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for creating a new vehicle brand
 */
export const useCreateVehicleBrand = () => {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: async (data: CreateVehicleBrandRequest) => {
      return await VehicleService.createVehicleBrand(data);
    },
    onSuccess: () => {
      // Invalidate and refetch vehicle brands list
      queryClient.invalidateQueries({ queryKey: ["vehicle-brands", "list"] });
      // Invalidate dropdown data
      queryClient.invalidateQueries({ queryKey: ["vehicle-brands", "dropdown"] });
      message.success("Tạo hãng xe thành công!");
    },
    onError: (error: Error) => {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi tạo hãng xe");
    },
  });
};

/**
 * Hook for updating a vehicle brand
 */
export const useUpdateVehicleBrand = () => {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: async ({ brandId, data }: { brandId: string; data: UpdateVehicleBrandRequest }) => {
      return await VehicleService.updateVehicleBrand(brandId, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch vehicle brands list
      queryClient.invalidateQueries({ queryKey: ["vehicle-brands", "list"] });
      // Invalidate dropdown data
      queryClient.invalidateQueries({ queryKey: ["vehicle-brands", "dropdown"] });
      // Invalidate specific brand detail
      queryClient.invalidateQueries({ queryKey: ["vehicle-brands", "detail", variables.brandId] });
      message.success("Cập nhật hãng xe thành công!");
    },
    onError: (error: Error) => {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi cập nhật hãng xe");
    },
  });
};

/**
 * Hook for deleting a vehicle brand
 */
export const useDeleteVehicleBrand = () => {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: async (brandId: string) => {
      return await VehicleService.deleteVehicleBrand(brandId);
    },
    onSuccess: () => {
      // Invalidate and refetch vehicle brands list
      queryClient.invalidateQueries({ queryKey: ["vehicle-brands", "list"] });
      // Invalidate dropdown data
      queryClient.invalidateQueries({ queryKey: ["vehicle-brands", "dropdown"] });
      message.success("Xóa hãng xe thành công!");
    },
    onError: (error: Error) => {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi xóa hãng xe");
    },
  });
};

/**
 * Utility function to convert dropdown data to options format
 */
export const convertToSelectOptions = (dropdownData: VehicleBrandDropdownItem[]) => {
  return dropdownData.map((item) => ({
    value: item.brand_id,
    label: item.brand_name,
    code: item.brand_code,
  }));
};

/**
 * Utility function to find brand by ID from dropdown data
 */
export const findBrandById = (
  dropdownData: VehicleBrandDropdownItem[], 
  brandId: string
): VehicleBrandDropdownItem | undefined => {
  return dropdownData.find((item) => item.brand_id === brandId);
};

/**
 * Utility function to find brand by code from dropdown data
 */
export const findBrandByCode = (
  dropdownData: VehicleBrandDropdownItem[], 
  brandCode: string
): VehicleBrandDropdownItem | undefined => {
  return dropdownData.find((item) => item.brand_code === brandCode);
};
