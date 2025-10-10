"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BranchService } from "../services/branch.service";
import {
  BranchDisplay,
  CreateBranchRequest,
  UpdateBranchRequest,
} from "../types/branch.types";
import { message } from "antd";

export interface UseBranchesParams {
  // No pagination params needed as API doesn't support them
}

/**
 * Hook for managing branches data
 * Migrated to TanStack React Query for better performance and caching
 */
export const useBranches = (params?: UseBranchesParams) => {
  const {
    data: branchesResponse,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["branches", "list", params],
    queryFn: async () => {
      console.log("Fetching branches from API...");
      const response = await BranchService.getAllBranches();
      console.log("Branches API response:", response);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    branches: branchesResponse?.branches || [],
    pagination: branchesResponse?.pagination || {
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
    refreshBranches: refetch,
  };
};

/**
 * Hook for creating a new branch
 */
export const useCreateBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBranchRequest) => {
      return await BranchService.createBranch(data);
    },
    onSuccess: (newBranch) => {
      // Invalidate and refetch branches list
      queryClient.invalidateQueries({ queryKey: ["branches", "list"] });
      message.success("Tạo chi nhánh thành công!");
    },
    onError: (error: Error) => {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi tạo chi nhánh");
    },
  });
};

/**
 * Hook for updating a branch
 */
export const useUpdateBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ branchId, data }: { branchId: string; data: UpdateBranchRequest }) => {
      return await BranchService.updateBranch(branchId, data);
    },
    onSuccess: (updatedBranch, variables) => {
      // Invalidate and refetch branches list
      queryClient.invalidateQueries({ queryKey: ["branches", "list"] });
      // Invalidate specific branch detail
      queryClient.invalidateQueries({ queryKey: ["branches", "detail", variables.branchId] });
      message.success("Cập nhật chi nhánh thành công!");
    },
    onError: (error: Error) => {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi cập nhật chi nhánh");
    },
  });
};

/**
 * Hook for deleting a branch
 */
export const useDeleteBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (branchId: string) => {
      return await BranchService.deleteBranch(branchId);
    },
    onSuccess: () => {
      // Invalidate and refetch branches list
      queryClient.invalidateQueries({ queryKey: ["branches", "list"] });
      message.success("Xóa chi nhánh thành công!");
    },
    onError: (error: Error) => {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi xóa chi nhánh");
    },
  });
};

/**
 * Hook for a single branch by ID
 * Migrated to TanStack React Query for better performance and caching
 */
export const useBranch = (branchId: string | null) => {
  const {
    data: branch,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["branches", "detail", branchId],
    queryFn: async () => {
      if (!branchId) return null;
      return await BranchService.getBranchById(branchId);
    },
    enabled: !!branchId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    branch,
    loading,
    error,
    refetch,
  };
};