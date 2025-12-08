"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SupplierService } from "../services/supplier.service";
import {
  SupplierRequest,
  CreateSupplierRequest,
  UpdateSupplierRequest,
} from "../types/supplier.types";

// Query keys
export const supplierKeys = {
  all: ["suppliers"] as const,
  lists: () => [...supplierKeys.all, "list"] as const,
  list: (params: SupplierRequest) => [...supplierKeys.lists(), params] as const,
  details: () => [...supplierKeys.all, "detail"] as const,
  detail: (id: string) => [...supplierKeys.details(), id] as const,
};

/**
 * Hook for fetching all suppliers with pagination and filtering
 */
export const useSuppliers = (params: SupplierRequest = {}) => {
  return useQuery({
    queryKey: supplierKeys.list(params),
    queryFn: () => SupplierService.getAllSuppliers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook for fetching a single supplier by ID
 */
export const useSupplier = (supplierId: string | null) => {
  return useQuery({
    queryKey: supplierKeys.detail(supplierId || ""),
    queryFn: () => SupplierService.getSupplierById(supplierId!),
    enabled: !!supplierId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Hook for creating a new supplier
 */
export const useCreateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSupplierRequest) =>
      SupplierService.createSupplier(data),
    onSuccess: () => {
      // Invalidate and refetch suppliers list
      queryClient.invalidateQueries({
        queryKey: supplierKeys.lists(),
      });
    },
    onError: (error) => {
      console.log("Failed to create supplier:", error);
    },
  });
};

/**
 * Hook for updating a supplier
 */
export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      supplierId,
      data,
    }: {
      supplierId: string;
      data: UpdateSupplierRequest;
    }) => SupplierService.updateSupplier(supplierId, data),
    onSuccess: (updatedSupplier, { supplierId }) => {
      // Update the specific supplier in cache
      queryClient.setQueryData(
        supplierKeys.detail(supplierId),
        updatedSupplier
      );
      
      // Invalidate suppliers list to refetch
      queryClient.invalidateQueries({
        queryKey: supplierKeys.lists(),
      });
    },
    onError: (error) => {
      console.log("Failed to update supplier:", error);
    },
  });
};

/**
 * Hook for deleting a supplier
 */
export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (supplierId: string) =>
      SupplierService.deleteSupplier(supplierId),
    onSuccess: (_, supplierId) => {
      // Remove the supplier from cache
      queryClient.removeQueries({
        queryKey: supplierKeys.detail(supplierId),
      });
      
      // Invalidate suppliers list to refetch
      queryClient.invalidateQueries({
        queryKey: supplierKeys.lists(),
      });
    },
    onError: (error) => {
      console.log("Failed to delete supplier:", error);
    },
  });
};

/**
 * Hook for toggling supplier status (active/inactive)
 */
export const useToggleSupplierStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      supplierId, 
      isActive 
    }: { 
      supplierId: string; 
      isActive: boolean; 
    }) => {
      return await SupplierService.updateSupplier(supplierId, {
        is_active: isActive,
      });
    },
    onSuccess: () => {
      // Invalidate and refetch suppliers list
      queryClient.invalidateQueries({
        queryKey: supplierKeys.lists(),
      });
    },
  });
};

/**
 * Hook for refreshing suppliers data
 */
export const useRefreshSuppliers = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      queryKey: supplierKeys.lists(),
    });
  };
};