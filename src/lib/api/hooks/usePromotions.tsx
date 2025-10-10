"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { promotionService } from "../services/promotion.service";
import {
  CreatePromotionRequest,
  UpdatePromotionRequest,
  PromotionSearchParams,
  PromotionValidationResponse,
} from "../types/promotion.types";

// Query keys
export const promotionKeys = {
  all: ["promotions"] as const,
  lists: () => [...promotionKeys.all, "list"] as const,
  list: (params: PromotionSearchParams) => [...promotionKeys.lists(), params] as const,
  details: () => [...promotionKeys.all, "detail"] as const,
  detail: (id: string) => [...promotionKeys.details(), id] as const,
  active: () => [...promotionKeys.all, "active"] as const,
  analytics: (id?: string) => [...promotionKeys.all, "analytics", id] as const,
};

// Hook for getting all promotions with pagination and filters
export const usePromotions = (params: PromotionSearchParams = {}) => {
  return useQuery({
    queryKey: promotionKeys.list(params),
    queryFn: () => promotionService.getAllPromotions(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for getting a single promotion by ID
export const usePromotion = (promotionId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: promotionKeys.detail(promotionId),
    queryFn: () => promotionService.getPromotionById(promotionId),
    enabled: enabled && !!promotionId,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook for getting active promotions
export const useActivePromotions = () => {
  return useQuery({
    queryKey: promotionKeys.active(),
    queryFn: () => promotionService.getActivePromotions(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for getting promotions by type
export const usePromotionsByType = (type: string) => {
  return useQuery({
    queryKey: [...promotionKeys.all, "byType", type],
    queryFn: () => promotionService.getPromotionsByType(type),
    enabled: !!type,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook for getting promotions by status
export const usePromotionsByStatus = (status: string) => {
  return useQuery({
    queryKey: [...promotionKeys.all, "byStatus", status],
    queryFn: () => promotionService.getPromotionsByStatus(status),
    enabled: !!status,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook for promotion analytics
export const usePromotionAnalytics = (promotionId?: string, fromDate?: string, toDate?: string) => {
  return useQuery({
    queryKey: [...promotionKeys.analytics(promotionId), fromDate, toDate],
    queryFn: () => 
      promotionId 
        ? promotionService.getPromotionAnalytics(promotionId, fromDate, toDate)
        : promotionService.getAllPromotionAnalytics(fromDate, toDate),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for promotion management (CRUD operations)
export const usePromotionManagement = () => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Create promotion mutation
  const createPromotionMutation = useMutation({
    mutationFn: (data: CreatePromotionRequest) => promotionService.createPromotion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: promotionKeys.active() });
      message.success("Tạo chương trình khuyến mãi thành công!");
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi tạo chương trình khuyến mãi";
      message.error(errorMessage);
    },
  });

  // Update promotion mutation
  const updatePromotionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePromotionRequest }) =>
      promotionService.updatePromotion(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: promotionKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: promotionKeys.active() });
      message.success("Cập nhật chương trình khuyến mãi thành công!");
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi cập nhật chương trình khuyến mãi";
      message.error(errorMessage);
    },
  });

  // Delete promotion mutation
  const deletePromotionMutation = useMutation({
    mutationFn: (promotionId: string) => promotionService.deletePromotion(promotionId),
    onSuccess: (_, promotionId) => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: promotionKeys.detail(promotionId) });
      queryClient.invalidateQueries({ queryKey: promotionKeys.active() });
      message.success("Xóa chương trình khuyến mãi thành công!");
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi xóa chương trình khuyến mãi";
      message.error(errorMessage);
    },
  });

  // Update promotion status mutation
  const updatePromotionStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      promotionService.updatePromotionStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: promotionKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: promotionKeys.active() });
      message.success("Cập nhật trạng thái chương trình khuyến mãi thành công!");
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi cập nhật trạng thái";
      message.error(errorMessage);
    },
  });

  // Toggle promotion status mutation
  const togglePromotionStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      promotionService.togglePromotionStatus(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: promotionKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: promotionKeys.active() });
      message.success("Thay đổi trạng thái chương trình khuyến mãi thành công!");
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi thay đổi trạng thái";
      message.error(errorMessage);
    },
  });

  // Duplicate promotion mutation
  const duplicatePromotionMutation = useMutation({
    mutationFn: ({ id, newName, newCode }: { id: string; newName: string; newCode: string }) =>
      promotionService.duplicatePromotion(id, newName, newCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
      message.success("Sao chép chương trình khuyến mãi thành công!");
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi sao chép chương trình khuyến mãi";
      message.error(errorMessage);
    },
  });

  // Bulk update promotion status mutation
  const bulkUpdatePromotionStatusMutation = useMutation({
    mutationFn: ({ promotionIds, status }: { promotionIds: string[]; status: string }) =>
      promotionService.bulkUpdatePromotionStatus(promotionIds, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: promotionKeys.active() });
      message.success(`Cập nhật thành công ${data.success} chương trình khuyến mãi`);
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi cập nhật hàng loạt";
      message.error(errorMessage);
    },
  });

  // Validation functions
  const validatePromotionCode = useCallback(async (code: string): Promise<boolean> => {
    try {
      const result: PromotionValidationResponse = await promotionService.validatePromotionCode(code);
      return result.valid;
    } catch {
      return false;
    }
  }, []);

  const checkPromotionAvailability = useCallback(async (
    promotionId: string,
    customerId?: string
  ): Promise<{ available: boolean; message?: string }> => {
    try {
      return await promotionService.checkPromotionAvailability(promotionId, customerId);
        } catch {
          return { available: false, message: "Không thể kiểm tra tính khả dụng" };
        }
  }, []);

  // Apply promotion to order
  const applyPromotion = useCallback(async (
    promotionId: string,
    orderData: {
      customerId: string;
      items: Array<{
        serviceId?: string;
        productId?: string;
        quantity: number;
        price: number;
      }>;
      totalAmount: number;
    }
  ) => {
    try {
      return await promotionService.applyPromotion(promotionId, orderData);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Không thể áp dụng chương trình khuyến mãi";
      throw new Error(errorMessage);
    }
  }, []);

  return {
    // State
    loading,
    setLoading,

    // Mutations
    createPromotion: createPromotionMutation.mutateAsync,
    updatePromotion: updatePromotionMutation.mutateAsync,
    deletePromotion: deletePromotionMutation.mutateAsync,
    updatePromotionStatus: updatePromotionStatusMutation.mutateAsync,
    togglePromotionStatus: togglePromotionStatusMutation.mutateAsync,
    duplicatePromotion: duplicatePromotionMutation.mutateAsync,
    bulkUpdatePromotionStatus: bulkUpdatePromotionStatusMutation.mutateAsync,

    // Mutation states
    isCreating: createPromotionMutation.isPending,
    isUpdating: updatePromotionMutation.isPending,
    isDeleting: deletePromotionMutation.isPending,
    isUpdatingStatus: updatePromotionStatusMutation.isPending,
    isTogglingStatus: togglePromotionStatusMutation.isPending,
    isDuplicating: duplicatePromotionMutation.isPending,
    isBulkUpdating: bulkUpdatePromotionStatusMutation.isPending,

    // Validation functions
    validatePromotionCode,
    checkPromotionAvailability,
    applyPromotion,
  };
};

// Hook for promotion usage history
export const usePromotionUsage = (promotionId: string, page: number = 0, size: number = 20) => {
  return useQuery({
    queryKey: [...promotionKeys.detail(promotionId), "usage", page, size],
    queryFn: () => promotionService.getPromotionUsage(promotionId, page, size),
    enabled: !!promotionId,
    staleTime: 2 * 60 * 1000,
  });
};

// Hook for promotion dropdown (for forms)
export const usePromotionsDropdown = () => {
  const { data: promotions, isLoading } = useActivePromotions();

  const options = promotions?.map((promotion) => ({
    value: promotion.id,
    label: `${promotion.name} (${promotion.code})`,
    promotion: promotion,
  })) || [];

  return {
    options,
    isLoading,
    promotions: promotions || [],
  };
};
