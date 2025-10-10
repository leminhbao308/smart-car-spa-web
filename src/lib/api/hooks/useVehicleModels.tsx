"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { VehicleService } from "../services/vehicle.service";
import {
  VehicleModel,
  GetAllVehicleModelsRequest,
  GetAllVehicleModelsResponse,
  CreateVehicleModelRequest,
  UpdateVehicleModelRequest,
} from "../types";
import { message } from "antd";

/**
 * Hook for vehicle models management
 * Uses React Query for caching and automatic refetching
 */
export const useVehicleModels = (params?: GetAllVehicleModelsRequest) => {
  const {
    data: modelsResponse,
    isLoading: loading,
    error,
    refetch,
  } = useQuery<GetAllVehicleModelsResponse>({
    queryKey: ["vehicle-models", "list", params],
    queryFn: async () => {
      const response = await VehicleService.getAllVehicleModels(params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    models: modelsResponse?.content || [],
    totalElements: modelsResponse?.total_elements || 0,
    totalPages: modelsResponse?.total_pages || 0,
    currentPage: modelsResponse?.page || 0,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for vehicle models dropdown data
 * Uses React Query for caching and automatic refetching
 */
export const useVehicleModelsDropdown = () => {
  const {
    data: dropdownData = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["vehicle-models", "dropdown"],
    queryFn: async () => {
      const response = await VehicleService.getVehicleModelsForDropdown();
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
 * Hook for single vehicle model
 * Uses React Query for caching and automatic refetching
 */
export const useVehicleModel = (modelId: string | null) => {
  const {
    data: model,
    isLoading: loading,
    error,
    refetch,
  } = useQuery<VehicleModel | null>({
    queryKey: ["vehicle-models", "detail", modelId],
    queryFn: async () => {
      if (!modelId) return null;
      return await VehicleService.getVehicleModelById(modelId);
    },
    enabled: !!modelId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    model,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for creating a new vehicle model
 */
export const useCreateVehicleModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateVehicleModelRequest) => {
      return await VehicleService.createVehicleModel(data);
    },
    onSuccess: () => {
      // Invalidate and refetch vehicle models list
      queryClient.invalidateQueries({ queryKey: ["vehicle-models", "list"] });
      // Invalidate dropdown data
      queryClient.invalidateQueries({ queryKey: ["vehicle-models", "dropdown"] });
      message.success("Tạo model xe thành công!");
    },
    onError: (error: Error) => {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi tạo model xe");
    },
  });
};

/**
 * Hook for updating a vehicle model
 */
export const useUpdateVehicleModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ modelId, data }: { modelId: string; data: UpdateVehicleModelRequest }) => {
      return await VehicleService.updateVehicleModel(modelId, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch vehicle models list
      queryClient.invalidateQueries({ queryKey: ["vehicle-models", "list"] });
      // Invalidate dropdown data
      queryClient.invalidateQueries({ queryKey: ["vehicle-models", "dropdown"] });
      // Invalidate specific model detail
      queryClient.invalidateQueries({ queryKey: ["vehicle-models", "detail", variables.modelId] });
      message.success("Cập nhật model xe thành công!");
    },
    onError: (error: Error) => {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi cập nhật model xe");
    },
  });
};

/**
 * Hook for deleting a vehicle model
 */
export const useDeleteVehicleModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (modelId: string) => {
      return await VehicleService.deleteVehicleModel(modelId);
    },
    onSuccess: () => {
      // Invalidate and refetch vehicle models list
      queryClient.invalidateQueries({ queryKey: ["vehicle-models", "list"] });
      // Invalidate dropdown data
      queryClient.invalidateQueries({ queryKey: ["vehicle-models", "dropdown"] });
      message.success("Xóa model xe thành công!");
    },
    onError: (error: Error) => {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi xóa model xe");
    },
  });
};