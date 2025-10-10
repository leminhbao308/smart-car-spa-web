"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SupplierService } from "../services/supplier.service";
import {
  CreateSupplierRequest,
  UpdateSupplierRequest,
} from "../types/supplier.types";
import { message } from "antd";

export interface UseSuppliersParams {
  // No pagination params needed as API doesn't support them
  [key: string]: unknown;
}

/**
 * Hook for managing suppliers data
 * Migrated to TanStack React Query for better performance and caching
 */
export const useSuppliers = (params?: UseSuppliersParams) => {
  const {
    data: suppliersResponse,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["suppliers", "list", params],
    queryFn: async () => {
      console.log("Fetching suppliers from API...");
      const response = await SupplierService.getAllSuppliers();
      console.log("Suppliers API response:", response);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    suppliers: suppliersResponse?.suppliers || [],
    pagination: suppliersResponse?.pagination || {
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
    refreshSuppliers: refetch,
  };
};

/**
 * Hook for creating a new supplier
 */
export const useCreateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSupplierRequest) => {
      return await SupplierService.createSupplier(data);
    },
    onSuccess: () => {
      // Invalidate and refetch suppliers list
      queryClient.invalidateQueries({ queryKey: ["suppliers", "list"] });
      message.success("Tạo nhà cung cấp thành công!");
    },
    onError: (error: Error) => {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi tạo nhà cung cấp");
    },
  });
};

/**
 * Hook for updating a supplier
 */
export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ supplierId, data }: { supplierId: string; data: UpdateSupplierRequest }) => {
      return await SupplierService.updateSupplier(supplierId, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch suppliers list
      queryClient.invalidateQueries({ queryKey: ["suppliers", "list"] });
      // Invalidate specific supplier detail
      queryClient.invalidateQueries({ queryKey: ["suppliers", "detail", variables.supplierId] });
      message.success("Cập nhật nhà cung cấp thành công!");
    },
    onError: (error: Error) => {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi cập nhật nhà cung cấp");
    },
  });
};

/**
 * Hook for deleting a supplier
 */
export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (supplierId: string) => {
      return await SupplierService.deleteSupplier(supplierId);
    },
    onSuccess: () => {
      // Invalidate and refetch suppliers list
      queryClient.invalidateQueries({ queryKey: ["suppliers", "list"] });
      message.success("Xóa nhà cung cấp thành công!");
    },
    onError: (error: Error) => {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi xóa nhà cung cấp");
    },
  });
};

/**
 * Hook for a single supplier by ID
 * Migrated to TanStack React Query for better performance and caching
 */
export const useSupplier = (supplierId: string | null) => {
  const {
    data: supplier,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["suppliers", "detail", supplierId],
    queryFn: async () => {
      if (!supplierId) return null;
      return await SupplierService.getSupplierById(supplierId);
    },
    enabled: !!supplierId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    supplier,
    loading,
    error,
    refetch,
  };
};