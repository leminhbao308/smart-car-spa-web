/**
 * useVehicleTypes Hook
 * React hook for vehicle type management and dropdown data
 * Migrated to TanStack React Query for better performance and caching
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { VehicleService } from "../services/vehicle.service";
import {
  VehicleTypeDropdownItem,
  GetAllVehicleTypesRequest,
  CreateVehicleTypeRequest,
  UpdateVehicleTypeRequest,
} from "../types";
import { App } from "antd";

/**
 * Hook for vehicle types dropdown data
 * Uses React Query for caching and automatic refetching
 */
export const useVehicleTypesDropdown = () => {
  const {
    data: dropdownData = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["vehicle-types", "dropdown"],
    queryFn: async () => {
      const response = await VehicleService.getVehicleTypesForDropdown();
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
 * Hook for vehicle types management
 * Uses React Query for caching and automatic refetching
 */
export const useVehicleTypes = (params?: GetAllVehicleTypesRequest) => {
  const {
    data: typesResponse,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["vehicle-types", "list", params],
    queryFn: async () => {
      const response = await VehicleService.getAllVehicleTypes(params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    types: typesResponse?.content || [],
    totalElements: typesResponse?.total_elements || 0,
    totalPages: typesResponse?.total_pages || 0,
    currentPage: typesResponse?.page || 0,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for single vehicle type
 * Uses React Query for caching and automatic refetching
 */
export const useVehicleType = (typeId: string | null) => {
  const {
    data: type,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["vehicle-types", "detail", typeId],
    queryFn: async () => {
      if (!typeId) return null;
      return await VehicleService.getVehicleTypeById(typeId);
    },
    enabled: !!typeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    type,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for creating a new vehicle type
 */
export const useCreateVehicleType = () => {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: async (data: CreateVehicleTypeRequest) => {
      return await VehicleService.createVehicleType(data);
    },
    onSuccess: () => {
      // Invalidate and refetch vehicle types list
      queryClient.invalidateQueries({ queryKey: ["vehicle-types", "list"] });
      // Invalidate dropdown data
      queryClient.invalidateQueries({ queryKey: ["vehicle-types", "dropdown"] });
      message.success("Tạo loại xe thành công!");
    },
    onError: (error: Error) => {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi tạo loại xe");
    },
  });
};

/**
 * Hook for updating a vehicle type
 */
export const useUpdateVehicleType = () => {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: async ({ typeId, data }: { typeId: string; data: UpdateVehicleTypeRequest }) => {
      return await VehicleService.updateVehicleType(typeId, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch vehicle types list
      queryClient.invalidateQueries({ queryKey: ["vehicle-types", "list"] });
      // Invalidate dropdown data
      queryClient.invalidateQueries({ queryKey: ["vehicle-types", "dropdown"] });
      // Invalidate specific type detail
      queryClient.invalidateQueries({ queryKey: ["vehicle-types", "detail", variables.typeId] });
      message.success("Cập nhật loại xe thành công!");
    },
    onError: (error: Error) => {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi cập nhật loại xe");
    },
  });
};

/**
 * Hook for deleting a vehicle type
 */
export const useDeleteVehicleType = () => {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: async (typeId: string) => {
      return await VehicleService.deleteVehicleType(typeId);
    },
    onSuccess: () => {
      // Invalidate and refetch vehicle types list
      queryClient.invalidateQueries({ queryKey: ["vehicle-types", "list"] });
      // Invalidate dropdown data
      queryClient.invalidateQueries({ queryKey: ["vehicle-types", "dropdown"] });
      message.success("Xóa loại xe thành công!");
    },
    onError: (error: Error) => {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi xóa loại xe");
    },
  });
};

/**
 * Utility function to convert dropdown data to options format
 */
export const convertToSelectOptions = (dropdownData: VehicleTypeDropdownItem[]) => {
  return dropdownData.map((item) => ({
    value: item.type_id,
    label: item.type_name,
    code: item.type_code,
  }));
};

/**
 * Utility function to find type by ID from dropdown data
 */
export const findTypeById = (
  dropdownData: VehicleTypeDropdownItem[], 
  typeId: string
): VehicleTypeDropdownItem | undefined => {
  return dropdownData.find((item) => item.type_id === typeId);
};

/**
 * Utility function to find type by code from dropdown data
 */
export const findTypeByCode = (
  dropdownData: VehicleTypeDropdownItem[], 
  typeCode: string
): VehicleTypeDropdownItem | undefined => {
  return dropdownData.find((item) => item.type_code === typeCode);
};