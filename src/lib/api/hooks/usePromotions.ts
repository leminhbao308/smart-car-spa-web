import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { promotionService } from "@/lib/api/services/promotion.service";
import type {
  PromotionFilterParam,
  CreatePromotionRequest,
  UpdatePromotionRequest,
} from "@/lib/api/types/promotion.types";

export const usePromotions = (params: PromotionFilterParam = {}) => {
  return useQuery({
    queryKey: ["promotions", params],
    queryFn: () => promotionService.getAllPromotions(params),
  });
};

export const useActivePromotions = (params: PromotionFilterParam = {}) => {
  return useQuery({
    queryKey: ["promotions", "active", params],
    queryFn: () => promotionService.getActivePromotions(params),
  });
};

export const useVisiblePromotions = (params: PromotionFilterParam = {}) => {
  return useQuery({
    queryKey: ["promotions", "visible", params],
    queryFn: () => promotionService.getVisiblePromotions(params),
  });
};

export const usePromotionById = (promotionId: string, enabled = true) => {
  return useQuery({
    queryKey: ["promotion", promotionId],
    queryFn: () => promotionService.getPromotionById(promotionId),
    enabled: enabled && !!promotionId,
  });
};

export const usePromotionByCode = (promotionCode: string, enabled = true) => {
  return useQuery({
    queryKey: ["promotion", "code", promotionCode],
    queryFn: () => promotionService.getPromotionByCode(promotionCode),
    enabled: enabled && !!promotionCode,
  });
};

export const useCreatePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePromotionRequest) =>
      promotionService.createPromotion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
  });
};

export const useUpdatePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      promotionId,
      data,
    }: {
      promotionId: string;
      data: UpdatePromotionRequest;
    }) => promotionService.updatePromotion(promotionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      queryClient.invalidateQueries({
        queryKey: ["promotion", variables.promotionId],
      });
    },
  });
};

export const useDeletePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (promotionId: string) =>
      promotionService.deletePromotion(promotionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
  });
};

export const useUpdatePromotionStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      promotionId,
      isActive,
    }: {
      promotionId: string;
      isActive: boolean;
    }) => promotionService.updatePromotionStatus(promotionId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
  });
};

export const useValidatePromotionCode = () => {
  return useMutation({
    mutationFn: (code: string) => promotionService.validatePromotionCode(code),
  });
};

export const usePromotionStatistics = () => {
  return useQuery({
    queryKey: ["promotions", "statistics"],
    queryFn: () => promotionService.getPromotionStatistics(),
  });
};

// Hook for checking promotion availability
export const useCheckPromotionAvailability = () => {
  return useMutation({
    mutationFn: ({
      promotionId,
      customerId,
    }: {
      promotionId: string;
      customerId?: string;
    }) => promotionService.checkPromotionAvailability(promotionId, customerId),
  });
};
