"use client";

import { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreatePromotionTypeRequest,
  PromotionTypeFilterParam,
  PromotionTypeInfo, PromotionTypeService,
  PromotionTypeStatusUpdateRequest,
  UpdatePromotionTypeRequest,
} from "@/lib/api";
import {message} from "antd";

export const usePromotionType = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<PromotionTypeFilterParam>({
    page: 0,
    size: 10,
    sort: "createdDate",
    direction: "DESC",
  });

  // Query: Get all promotion types with pagination
  const {
    data: promotionTypesData,
    isLoading: isLoadingList,
    error: listError,
    refetch: refetchList,
  } = useQuery({
    queryKey: ["promotion-types", filters],
    queryFn: () => PromotionTypeService.getAllPromotionTypes(filters),
  });

  // Query: Get active promotion types
  const {
    data: activePromotionTypes,
    isLoading: isLoadingActive,
    refetch: refetchActive,
  } = useQuery({
    queryKey: ["promotion-types", "active"],
    queryFn: () => PromotionTypeService.getActivePromotionTypes(),
  });

  // Query: Get promotion type statistics
  const {
    data: statistics,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["promotion-types", "statistics"],
    queryFn: () => PromotionTypeService.getPromotionTypeStatistics(),
  });

  // Query: Get promotion type by ID
  const usePromotionTypeById = (id: string | null) => {
    return useQuery({
      queryKey: ["promotion-type", id],
      queryFn: () => PromotionTypeService.getPromotionTypeById(id!),
      enabled: !!id,
    });
  };

  // Query: Get promotion type by type code
  const usePromotionTypeByCode = (typeCode: string | null) => {
    return useQuery({
      queryKey: ["promotion-type", "code", typeCode],
      queryFn: () => PromotionTypeService.getPromotionTypeByTypeCode(typeCode!),
      enabled: !!typeCode,
    });
  };

  // Query: Search promotion types
  const useSearchPromotionTypes = (keyword: string) => {
    return useQuery({
      queryKey: ["promotion-types", "search", keyword],
      queryFn: () => PromotionTypeService.searchPromotionTypes(keyword),
      enabled: keyword.length > 0,
    });
  };

  // Mutation: Create promotion type
  const createMutation = useMutation({
    mutationFn: (data: CreatePromotionTypeRequest) =>
      PromotionTypeService.createPromotionType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotion-types"] });
      message.success("Tạo loại khuyến mãi thành công");
    },
    onError: (error: any) => {
      message.error(
        error?.response?.data?.message || "Tạo loại khuyến mãi thất bại"
      );
    },
  });

  // Mutation: Update promotion type
  const updateMutation = useMutation({
    mutationFn: ({
                   id,
                   data,
                 }: {
      id: string;
      data: Partial<UpdatePromotionTypeRequest>;
    }) => PromotionTypeService.updatePromotionType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotion-types"] });
      queryClient.invalidateQueries({ queryKey: ["promotion-type"] });
      message.success("Cập nhật loại khuyến mãi thành công");
    },
    onError: (error: any) => {
      message.error(
        error?.response?.data?.message || "Cập nhật loại khuyến mãi thất bại"
      );
    },
  });

  // Mutation: Delete promotion type
  const deleteMutation = useMutation({
    mutationFn: (id: string) => PromotionTypeService.deletePromotionType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotion-types"] });
      message.success("Xóa loại khuyến mãi thành công");
    },
    onError: (error: any) => {
      message.error(
        error?.response?.data?.message || "Xóa loại khuyến mãi thất bại"
      );
    },
  });

  // Mutation: Activate promotion type
  const activateMutation = useMutation({
    mutationFn: (id: string) => PromotionTypeService.activatePromotionType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotion-types"] });
      queryClient.invalidateQueries({ queryKey: ["promotion-type"] });
      message.success("Kích hoạt loại khuyến mãi thành công");
    },
    onError: (error: any) => {
      message.error(
        error?.response?.data?.message || "Kích hoạt loại khuyến mãi thất bại"
      );
    },
  });

  // Mutation: Deactivate promotion type
  const deactivateMutation = useMutation({
    mutationFn: (id: string) =>
      PromotionTypeService.deactivatePromotionType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotion-types"] });
      queryClient.invalidateQueries({ queryKey: ["promotion-type"] });
      message.success("Vô hiệu hóa loại khuyến mãi thành công");
    },
    onError: (error: any) => {
      message.error(
        error?.response?.data?.message ||
        "Vô hiệu hóa loại khuyến mãi thất bại"
      );
    },
  });

  // Mutation: Update promotion type status
  const updateStatusMutation = useMutation({
    mutationFn: ({
                   id,
                   data,
                 }: {
      id: string;
      data: PromotionTypeStatusUpdateRequest;
    }) => PromotionTypeService.updatePromotionTypeStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotion-types"] });
      queryClient.invalidateQueries({ queryKey: ["promotion-type"] });
      message.success("Cập nhật trạng thái thành công");
    },
    onError: (error: any) => {
      message.error(
        error?.response?.data?.message || "Cập nhật trạng thái thất bại"
      );
    },
  });

  // Helper functions
  const updateFilters = useCallback(
    (newFilters: Partial<PromotionTypeFilterParam>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters({
      page: 0,
      size: 10,
      sort: "createdAt",
      direction: "DESC",
    });
  }, []);

  const changePage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const changePageSize = useCallback((size: number) => {
    setFilters((prev) => ({ ...prev, size, page: 0 }));
  }, []);

  const changeSort = useCallback(
    (sort: string, direction: "ASC" | "DESC" = "DESC") => {
      setFilters((prev) => ({ ...prev, sort, direction }));
    },
    []
  );

  const searchByKeyword = useCallback((keyword: string) => {
    setFilters((prev) => ({ ...prev, keyword, page: 0 }));
  }, []);

  const filterByStatus = useCallback((isActive: boolean | undefined) => {
    setFilters((prev) => ({ ...prev, isActive, page: 0 }));
  }, []);

  // CRUD operations
  const createPromotionType = useCallback(
    async (data: CreatePromotionTypeRequest) => {
      return createMutation.mutateAsync(data);
    },
    [createMutation]
  );

  const updatePromotionType = useCallback(
    async (id: string, data: Partial<UpdatePromotionTypeRequest>) => {
      return updateMutation.mutateAsync({ id, data });
    },
    [updateMutation]
  );

  const deletePromotionType = useCallback(
    async (id: string) => {
      return deleteMutation.mutateAsync(id);
    },
    [deleteMutation]
  );

  const activatePromotionType = useCallback(
    async (id: string) => {
      return activateMutation.mutateAsync(id);
    },
    [activateMutation]
  );

  const deactivatePromotionType = useCallback(
    async (id: string) => {
      return deactivateMutation.mutateAsync(id);
    },
    [deactivateMutation]
  );

  const updatePromotionTypeStatus = useCallback(
    async (id: string, data: PromotionTypeStatusUpdateRequest) => {
      return updateStatusMutation.mutateAsync({ id, data });
    },
    [updateStatusMutation]
  );

  const togglePromotionTypeStatus = useCallback(
    async (id: string, currentStatus: boolean) => {
      return updateStatusMutation.mutateAsync({
        id,
        data: { isActive: !currentStatus },
      });
    },
    [updateStatusMutation]
  );

  return {
    // Data
    promotionTypes: promotionTypesData?.content || [],
    totalElements: promotionTypesData?.totalElements || 0,
    totalPages: promotionTypesData?.totalPages || 0,
    currentPage: promotionTypesData?.number || 0,
    pageSize: promotionTypesData?.size || 10,
    activePromotionTypes: activePromotionTypes || [],
    statistics,

    // Loading states
    isLoadingList,
    isLoadingActive,
    isLoadingStats,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isActivating: activateMutation.isPending,
    isDeactivating: deactivateMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,

    // Error states
    listError,
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,

    // Filters
    filters,
    updateFilters,
    resetFilters,
    changePage,
    changePageSize,
    changeSort,
    searchByKeyword,
    filterByStatus,

    // CRUD operations
    createPromotionType,
    updatePromotionType,
    deletePromotionType,
    activatePromotionType,
    deactivatePromotionType,
    updatePromotionTypeStatus,
    togglePromotionTypeStatus,

    // Refetch functions
    refetchList,
    refetchActive,
    refetchStats,

    // Additional hooks
    usePromotionTypeById,
    usePromotionTypeByCode,
    useSearchPromotionTypes,
  };
};
