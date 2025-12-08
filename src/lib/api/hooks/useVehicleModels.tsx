"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { VehicleService } from "../services/vehicle.service";
import {
  VehicleModel,
  GetAllVehicleModelsRequest,
  GetAllVehicleModelsResponse,
  CreateVehicleModelRequest,
  UpdateVehicleModelRequest,
} from "../types";
import { App } from "antd";

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
 * @param brandId Optional brand ID to filter models
 * @param typeId Optional type ID to filter models
 */
export const useVehicleModelsDropdown = (brandId?: string, typeId?: string) => {
  const isEnabled = !!(brandId && typeId);
  
  const {
    data: dropdownData = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["vehicle-models", "dropdown", brandId, typeId],
    queryFn: async () => {
      console.log("🔄 Loading vehicle models with filters:", { brandId, typeId, isEnabled });
      if (!brandId || !typeId) {
        console.warn("⚠️ Missing brandId or typeId, returning empty array");
        return [];
      }
      const response = await VehicleService.getVehicleModelsForDropdown(
        brandId,
        typeId
      );
      console.log("✅ Vehicle models response:", {
        count: response.data?.length || 0,
        models: response.data?.map(m => m.model_name) || [],
      });
      return response.data;
    },
    enabled: isEnabled, // Only fetch when both brandId and typeId are provided
    staleTime: 0, // Always refetch when filters change
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  // Debug log when enabled state changes
  React.useEffect(() => {
    console.log("🔍 useVehicleModelsDropdown state:", {
      brandId,
      typeId,
      isEnabled,
      modelsCount: dropdownData.length,
      loading,
      hasError: !!error,
    });
  }, [brandId, typeId, isEnabled, dropdownData.length, loading, error]);

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
  const { message } = App.useApp();

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
  const { message } = App.useApp();

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
  const { message } = App.useApp();

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