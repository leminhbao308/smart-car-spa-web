"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CenterService } from "../services/center.service";
import {
  CenterDisplay,
  CreateCenterRequest,
  UpdateCenterRequest,
  CreateCenterFormData,
  UpdateCenterFormData,
} from "../types/center.types";
import { message } from "antd";

/**
 * Hook for managing centers data
 * Migrated to TanStack React Query for better performance and caching
 */
export const useCenters = () => {
  const {
    data: centersResponse,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["centers", "list"],
    queryFn: async () => {
      console.log("Fetching centers from API...");
      const response = await CenterService.getAllCenters();
      console.log("Centers API response:", response);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    centers: centersResponse?.centers || [],
    pagination: centersResponse?.pagination || {
      page: 0,
      size: 10,
      total_elements: 0,
      total_pages: 0,
      first: true,
      last: true,
      has_next: false,
      has_previous: false,
    },
    loading,
    error,
    refreshCenters: refetch,
  };
};

/**
 * Hook for creating a new center
 */
export const useCreateCenter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCenterRequest) => {
      return await CenterService.createCenter(data);
    },
    onSuccess: (newCenter) => {
      // Invalidate and refetch centers list
      queryClient.invalidateQueries({ queryKey: ["centers", "list"] });
      message.success("Tạo trung tâm thành công!");
    },
    onError: (error: Error) => {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi tạo trung tâm");
    },
  });
};

/**
 * Hook for creating a new center with form data
 */
export const useCreateCenterWithFormData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCenterFormData) => {
      return await CenterService.createCenterWithFormData(data);
    },
    onSuccess: (newCenter) => {
      // Invalidate and refetch centers list
      queryClient.invalidateQueries({ queryKey: ["centers", "list"] });
      message.success("Tạo trung tâm thành công!");
    },
    onError: (error: Error) => {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi tạo trung tâm");
    },
  });
};

/**
 * Hook for updating a center
 */
export const useUpdateCenter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ centerId, data }: { centerId: string; data: UpdateCenterRequest }) => {
      return await CenterService.updateCenter(centerId, data);
    },
    onSuccess: (updatedCenter, variables) => {
      // Invalidate and refetch centers list
      queryClient.invalidateQueries({ queryKey: ["centers", "list"] });
      // Invalidate specific center detail
      queryClient.invalidateQueries({ queryKey: ["centers", "detail", variables.centerId] });
      message.success("Cập nhật trung tâm thành công!");
    },
    onError: (error: Error) => {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi cập nhật trung tâm");
    },
  });
};

/**
 * Hook for updating a center with form data
 */
export const useUpdateCenterWithFormData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ centerId, data }: { centerId: string; data: UpdateCenterFormData }) => {
      return await CenterService.updateCenterWithFormData(centerId, data);
    },
    onSuccess: (updatedCenter, variables) => {
      // Invalidate and refetch centers list
      queryClient.invalidateQueries({ queryKey: ["centers", "list"] });
      // Invalidate specific center detail
      queryClient.invalidateQueries({ queryKey: ["centers", "detail", variables.centerId] });
      message.success("Cập nhật trung tâm thành công!");
    },
    onError: (error: Error) => {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi cập nhật trung tâm");
    },
  });
};

/**
 * Hook for deleting a center
 */
export const useDeleteCenter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (centerId: string) => {
      return await CenterService.deleteCenter(centerId);
    },
    onSuccess: () => {
      // Invalidate and refetch centers list
      queryClient.invalidateQueries({ queryKey: ["centers", "list"] });
      message.success("Xóa trung tâm thành công!");
    },
    onError: (error: Error) => {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi xóa trung tâm");
    },
  });
};

/**
 * Hook for a single center by ID
 * Migrated to TanStack React Query for better performance and caching
 */
export const useCenter = (centerId: string | null) => {
  const {
    data: center,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["centers", "detail", centerId],
    queryFn: async () => {
      if (!centerId) return null;
      return await CenterService.getCenterById(centerId);
    },
    enabled: !!centerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    center,
    loading,
    error,
    refetch,
  };
};