"use client";

import {useState, useCallback} from "react";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {message} from "antd";
import {promotionService} from "../services/promotion.service";
import {
  Promotion,
  CreatePromotionRequest,
  UpdatePromotionRequest,
  PromotionFilterParam,
} from "../types/promotion.types";

// Query keys
export const promotionKeys = {
  all: ["promotions"] as const,
  lists: () => [...promotionKeys.all, "list"] as const,
  list: (params: PromotionFilterParam) => [...promotionKeys.lists(), params] as const,
  details: () => [...promotionKeys.all, "detail"] as const,
  detail: (id: string) => [...promotionKeys.details(), id] as const,
  byCode: (code: string) => [...promotionKeys.all, "code", code] as const,
  active: (params?: PromotionFilterParam) => [...promotionKeys.all, "active", params] as const,
  visible: (params?: PromotionFilterParam) => [...promotionKeys.all, "visible", params] as const,
  expired: (params?: PromotionFilterParam) => [...promotionKeys.all, "expired", params] as const,
  startingSoon: (params?: PromotionFilterParam) => [...promotionKeys.all, "starting-soon", params] as const,
  endingSoon: (params?: PromotionFilterParam) => [...promotionKeys.all, "ending-soon", params] as const,
  byType: (type: string) => [...promotionKeys.all, "type", type] as const,
  byStatus: (status: string) => [...promotionKeys.all, "status", status] as const,
  statistics: () => [...promotionKeys.all, "statistics"] as const,
  analytics: (id?: string, fromDate?: string, toDate?: string) =>
    [...promotionKeys.all, "analytics", id, fromDate, toDate] as const,
  usage: (id: string, page: number, size: number) =>
    [...promotionKeys.detail(id), "usage", page, size] as const,
};

// Hook for getting all promotions with pagination and filters
export const usePromotions = (params: PromotionFilterParam = {}) => {
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

// Hook for getting promotion by code
export const usePromotionByCode = (promotionCode: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: promotionKeys.byCode(promotionCode),
    queryFn: () => promotionService.getPromotionByCode(promotionCode),
    enabled: enabled && !!promotionCode,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook for getting active promotions
export const useActivePromotions = (params: PromotionFilterParam = {}) => {
  return useQuery({
    queryKey: promotionKeys.active(params),
    queryFn: () => promotionService.getActivePromotions(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for getting visible promotions
export const useVisiblePromotions = (params: PromotionFilterParam = {}) => {
  return useQuery({
    queryKey: promotionKeys.visible(params),
    queryFn: () => promotionService.getVisiblePromotions(params),
    staleTime: 2 * 60 * 1000,
  });
};

// Hook for getting expired promotions
export const useExpiredPromotions = (params: PromotionFilterParam = {}) => {
  return useQuery({
    queryKey: promotionKeys.expired(params),
    queryFn: () => promotionService.getExpiredPromotions(params),
    staleTime: 5 * 60 * 1000,
  });
};

// Hook for getting promotions starting soon
export const usePromotionsStartingSoon = (params: PromotionFilterParam = {}) => {
  return useQuery({
    queryKey: promotionKeys.startingSoon(params),
    queryFn: () => promotionService.getPromotionsStartingSoon(params),
    staleTime: 2 * 60 * 1000,
  });
};

// Hook for getting promotions ending soon
export const usePromotionsEndingSoon = (params: PromotionFilterParam = {}) => {
  return useQuery({
    queryKey: promotionKeys.endingSoon(params),
    queryFn: () => promotionService.getPromotionsEndingSoon(params),
    staleTime: 2 * 60 * 1000,
  });
};

// Hook for getting promotions by type
export const usePromotionsByType = (type: string) => {
  return useQuery({
    queryKey: promotionKeys.byType(type),
    queryFn: () => promotionService.getPromotionsByType(type),
    enabled: !!type,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook for getting promotions by status
export const usePromotionsByStatus = (status: string) => {
  return useQuery({
    queryKey: promotionKeys.byStatus(status),
    queryFn: () => promotionService.getPromotionsByStatus(status),
    enabled: !!status,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook for promotion statistics
export const usePromotionStatistics = () => {
  return useQuery({
    queryKey: promotionKeys.statistics(),
    queryFn: () => promotionService.getPromotionStatistics(),
    staleTime: 2 * 60 * 1000,
  });
};

// Hook for promotion analytics
export const usePromotionAnalytics = (
  promotionId?: string,
  fromDate?: string,
  toDate?: string
) => {
  return useQuery({
    queryKey: promotionKeys.analytics(promotionId, fromDate, toDate),
    queryFn: () =>
      promotionId
        ? promotionService.getPromotionAnalytics(promotionId, fromDate, toDate)
        : promotionService.getAllPromotionAnalytics(fromDate, toDate),
    staleTime: 2 * 60 * 1000,
  });
};

// Hook for promotion usage history
export const usePromotionUsage = (
  promotionId: string,
  page: number = 0,
  size: number = 20
) => {
  return useQuery({
    queryKey: promotionKeys.usage(promotionId, page, size),
    queryFn: () => promotionService.getPromotionUsage(promotionId, page, size),
    enabled: !!promotionId,
    staleTime: 2 * 60 * 1000,
  });
};

// Hook for promotion management (CRUD operations)
export const usePromotionManagement = () => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Create promotion mutation
  const createPromotionMutation = useMutation({
    mutationFn: (data: CreatePromotionRequest) =>
      promotionService.createPromotion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: promotionKeys.lists()});
      queryClient.invalidateQueries({queryKey: promotionKeys.all});
      message.success("Tạo chương trình khuyến mãi thành công!");
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error
        ? error.message
        : "Có lỗi xảy ra khi tạo chương trình khuyến mãi";
      message.error(errorMessage);
    },
  });

  // Update promotion mutation
  const updatePromotionMutation = useMutation({
    mutationFn: ({id, data}: { id: string; data: UpdatePromotionRequest }) =>
      promotionService.updatePromotion(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({queryKey: promotionKeys.lists()});
      queryClient.invalidateQueries({queryKey: promotionKeys.detail(variables.id)});
      queryClient.invalidateQueries({queryKey: promotionKeys.all});
      message.success("Cập nhật chương trình khuyến mãi thành công!");
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error
        ? error.message
        : "Có lỗi xảy ra khi cập nhật chương trình khuyến mãi";
      message.error(errorMessage);
    },
  });

  // Delete promotion mutation
  const deletePromotionMutation = useMutation({
    mutationFn: (promotionId: string) =>
      promotionService.deletePromotion(promotionId),
    onSuccess: (_, promotionId) => {
      queryClient.invalidateQueries({queryKey: promotionKeys.lists()});
      queryClient.invalidateQueries({queryKey: promotionKeys.detail(promotionId)});
      queryClient.invalidateQueries({queryKey: promotionKeys.all});
      message.success("Xóa chương trình khuyến mãi thành công!");
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error
        ? error.message
        : "Có lỗi xảy ra khi xóa chương trình khuyến mãi";
      message.error(errorMessage);
    },
  });

  // Restore promotion mutation
  const restorePromotionMutation = useMutation({
    mutationFn: (promotionId: string) =>
      promotionService.restorePromotion(promotionId),
    onSuccess: (_, promotionId) => {
      queryClient.invalidateQueries({queryKey: promotionKeys.lists()});
      queryClient.invalidateQueries({queryKey: promotionKeys.detail(promotionId)});
      queryClient.invalidateQueries({queryKey: promotionKeys.all});
      message.success("Khôi phục chương trình khuyến mãi thành công!");
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error
        ? error.message
        : "Có lỗi xảy ra khi khôi phục chương trình khuyến mãi";
      message.error(errorMessage);
    },
  });

  // Update promotion status mutation
  const updatePromotionStatusMutation = useMutation({
    mutationFn: ({id, isActive}: { id: string; isActive: boolean }) =>
      promotionService.updatePromotionStatus(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({queryKey: promotionKeys.lists()});
      queryClient.invalidateQueries({queryKey: promotionKeys.detail(variables.id)});
      queryClient.invalidateQueries({queryKey: promotionKeys.all});
      message.success("Cập nhật trạng thái chương trình khuyến mãi thành công!");
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error
        ? error.message
        : "Có lỗi xảy ra khi cập nhật trạng thái";
      message.error(errorMessage);
    },
  });

  // Make promotion visible mutation
  const makePromotionVisibleMutation = useMutation({
    mutationFn: (promotionId: string) =>
      promotionService.makePromotionVisible(promotionId),
    onSuccess: (_, promotionId) => {
      queryClient.invalidateQueries({queryKey: promotionKeys.lists()});
      queryClient.invalidateQueries({queryKey: promotionKeys.detail(promotionId)});
      queryClient.invalidateQueries({queryKey: promotionKeys.all});
      message.success("Hiển thị chương trình khuyến mãi thành công!");
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error
        ? error.message
        : "Có lỗi xảy ra khi hiển thị chương trình khuyến mãi";
      message.error(errorMessage);
    },
  });

  // Make promotion invisible mutation
  const makePromotionInvisibleMutation = useMutation({
    mutationFn: (promotionId: string) =>
      promotionService.makePromotionInvisible(promotionId),
    onSuccess: (_, promotionId) => {
      queryClient.invalidateQueries({queryKey: promotionKeys.lists()});
      queryClient.invalidateQueries({queryKey: promotionKeys.detail(promotionId)});
      queryClient.invalidateQueries({queryKey: promotionKeys.all});
      message.success("Ẩn chương trình khuyến mãi thành công!");
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error
        ? error.message
        : "Có lỗi xảy ra khi ẩn chương trình khuyến mãi";
      message.error(errorMessage);
    },
  });

  // Duplicate promotion mutation
  const duplicatePromotionMutation = useMutation({
    mutationFn: ({id, newName, newCode}: {
      id: string;
      newName: string;
      newCode: string
    }) =>
      promotionService.duplicatePromotion(id, newName, newCode),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: promotionKeys.lists()});
      queryClient.invalidateQueries({queryKey: promotionKeys.all});
      message.success("Sao chép chương trình khuyến mãi thành công!");
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error
        ? error.message
        : "Có lỗi xảy ra khi sao chép chương trình khuyến mãi";
      message.error(errorMessage);
    },
  });

  // Bulk update promotion status mutation
  const bulkUpdatePromotionStatusMutation = useMutation({
    mutationFn: ({promotionIds, status}: {
      promotionIds: string[];
      status: string
    }) =>
      promotionService.bulkUpdatePromotionStatus(promotionIds, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({queryKey: promotionKeys.lists()});
      queryClient.invalidateQueries({queryKey: promotionKeys.all});
      message.success(
        `Cập nhật thành công ${data.success} chương trình khuyến mãi${
          data.failed > 0 ? `, thất bại ${data.failed}` : ""
        }`
      );
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error
        ? error.message
        : "Có lỗi xảy ra khi cập nhật hàng loạt";
      message.error(errorMessage);
    },
  });

  // Import promotions mutation
  const importPromotionsMutation = useMutation({
    mutationFn: (file: File) => promotionService.importPromotions(file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({queryKey: promotionKeys.lists()});
      queryClient.invalidateQueries({queryKey: promotionKeys.all});
      message.success(
        `Import thành công ${data.success} chương trình khuyến mãi${
          data.failed > 0 ? `, thất bại ${data.failed}` : ""
        }`
      );
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error
        ? error.message
        : "Có lỗi xảy ra khi import";
      message.error(errorMessage);
    },
  });

  // Export promotions function
  const exportPromotions = useCallback(async (filters?: Record<string, unknown>) => {
    try {
      setLoading(true);
      const blob = await promotionService.exportPromotions(filters);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `promotions_${new Date().getTime()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success("Xuất dữ liệu thành công!");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error
        ? error.message
        : "Có lỗi xảy ra khi xuất dữ liệu";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Validation functions
  const validatePromotionCode = useCallback(async (code: string): Promise<boolean> => {
    try {
      const result = await promotionService.validatePromotionCode(code);
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
      return {available: false, message: "Không thể kiểm tra tính khả dụng"};
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
      const errorMessage = error instanceof Error
        ? error.message
        : "Không thể áp dụng chương trình khuyến mãi";
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
    restorePromotion: restorePromotionMutation.mutateAsync,
    updatePromotionStatus: updatePromotionStatusMutation.mutateAsync,
    makePromotionVisible: makePromotionVisibleMutation.mutateAsync,
    makePromotionInvisible: makePromotionInvisibleMutation.mutateAsync,
    duplicatePromotion: duplicatePromotionMutation.mutateAsync,
    bulkUpdatePromotionStatus: bulkUpdatePromotionStatusMutation.mutateAsync,
    importPromotions: importPromotionsMutation.mutateAsync,
    exportPromotions,

    // Mutation states
    isCreating: createPromotionMutation.isPending,
    isUpdating: updatePromotionMutation.isPending,
    isDeleting: deletePromotionMutation.isPending,
    isRestoring: restorePromotionMutation.isPending,
    isUpdatingStatus: updatePromotionStatusMutation.isPending,
    isMakingVisible: makePromotionVisibleMutation.isPending,
    isMakingInvisible: makePromotionInvisibleMutation.isPending,
    isDuplicating: duplicatePromotionMutation.isPending,
    isBulkUpdating: bulkUpdatePromotionStatusMutation.isPending,
    isImporting: importPromotionsMutation.isPending,

    // Validation functions
    validatePromotionCode,
    checkPromotionAvailability,
    applyPromotion,
  };
};

// Hook for promotions dropdown (for forms)
export const usePromotionsDropdown = () => {
  const {data, isLoading} = useActivePromotions();

  const options = data?.content?.map((promotion: Promotion) => ({
    value: promotion.promotion_id,
    label: `${promotion.name} (${promotion.promotion_code || 'N/A'})`,
    promotion: promotion,
  })) || [];

  return {
    options,
    isLoading,
    promotions: data?.content || [],
  };
};

// Hook for visible promotions dropdown
export const useVisiblePromotionsDropdown = () => {
  const {data, isLoading} = useVisiblePromotions();

  const options = data?.content?.map((promotion: Promotion) => ({
    value: promotion.promotion_id,
    label: `${promotion.name} (${promotion.promotion_code || 'N/A'})`,
    promotion: promotion,
  })) || [];

  return {
    options,
    isLoading,
    promotions: data?.content || [],
  };
};
