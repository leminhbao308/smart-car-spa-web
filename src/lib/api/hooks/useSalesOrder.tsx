"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SalesOrderService } from "../services/sales-order.service";
import { CreateSORequest } from "../types/sale-order.types";
import { message } from "antd";

/**
 * Hook for managing sales orders
 */
export const useSalesOrders = () => {
  const {
    data: orders,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["salesOrders", "list"],
    queryFn: async () => {
      return await SalesOrderService.getAllSaleOrders();
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    orders: orders || [],
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for managing paginated sales orders
 */
export const usePagedSalesOrders = (
  page: number = 0,
  size: number = 10,
  sortBy: string = "createdDate",
  sortDirection: "ASC" | "DESC" = "DESC"
) => {
  const {
    data: pagedData,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["salesOrders", "paged", page, size, sortBy, sortDirection],
    queryFn: async () => {
      return await SalesOrderService.getPagedSaleOrders(
        page,
        size,
        sortBy,
        sortDirection
      );
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    orders: pagedData?.content || [],
    page: pagedData?.page ?? 0,
    size: pagedData?.size ?? size,
    totalElements: pagedData?.totalElements ?? 0,
    totalPages: pagedData?.totalPages ?? 0,
    isLast: pagedData?.last ?? true,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for managing returned orders
 */
export const useReturnedOrders = () => {
  const {
    data: returnedOrders,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["salesOrders", "listReturned"],
    queryFn: async () => {
      return await SalesOrderService.getAllReturnedOrders();
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    returnedOrders: returnedOrders || [],
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for managing fullfilled orders
 */
export const useFullfilledOrders = () => {
  const {
    data: fullfilledOrders,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["salesOrders", "listFullfilled"],
    queryFn: async () => {
      return await SalesOrderService.getAllFullfilledOrders();
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    fullfilledOrders: fullfilledOrders || [],
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for single sales order
 */
export const useSalesOrder = (orderId: string | null) => {
  const {
    data: order,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["salesOrders", "detail", orderId],
    queryFn: async () => {
      if (!orderId) return null;
      return await SalesOrderService.getSaleOrderById(orderId);
    },
    enabled: !!orderId,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    order,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for creating and managing sales order workflow
 */
export const useCreateSalesOrder = () => {
  const queryClient = useQueryClient();

  const createDraft = useMutation({
    mutationFn: async (payload: CreateSORequest) => {
      return await SalesOrderService.createDraftOrder(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salesOrders", "list"] });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi tạo đơn hàng");
    },
  });

  const confirm = useMutation({
    mutationFn: async (orderId: string) => {
      return await SalesOrderService.confirmSaleOrder(orderId);
    },
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ["salesOrders", "list"] });
      queryClient.invalidateQueries({
        queryKey: ["salesOrders", "detail", updatedOrder.id],
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi xác nhận đơn hàng");
    },
  });

  const fulfill = useMutation({
    mutationFn: async (orderId: string) => {
      return await SalesOrderService.fullFillSaleOrder(orderId);
    },
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ["salesOrders", "list"] });
      queryClient.invalidateQueries({
        queryKey: ["salesOrders", "detail", updatedOrder.id],
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi hoàn thành đơn hàng");
    },
  });

  return {
    createDraft: createDraft.mutateAsync,
    confirm: confirm.mutateAsync,
    fulfill: fulfill.mutateAsync,
    loading: createDraft.isPending || confirm.isPending || fulfill.isPending,
  };
};

/**
 * Hook for confirming sales order
 */
export const useConfirmSalesOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      return await SalesOrderService.confirmSaleOrder(orderId);
    },
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ["salesOrders", "list"] });
      queryClient.invalidateQueries({
        queryKey: ["salesOrders", "detail", updatedOrder.id],
      });
      message.success("Xác nhận đơn hàng thành công!");
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi xác nhận đơn hàng");
    },
  });
};

/**
 * Hook for fulfilling sales order
 */
export const useFulfillSalesOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      return await SalesOrderService.fullFillSaleOrder(orderId);
    },
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ["salesOrders", "list"] });
      queryClient.invalidateQueries({
        queryKey: ["salesOrders", "detail", updatedOrder.id],
      });
      message.success("Hoàn thành đơn hàng thành công!");
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi hoàn thành đơn hàng");
    },
  });
};

/**
 * Hook for creating return
 */
export const useCreateReturn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      items,
      reason = "Hoàn trả hàng",
    }: {
      orderId: string;
      items: { product_id: string; qty: number; unit_cost: number }[];
      reason?: string;
    }) => {
      return await SalesOrderService.returnSaleOrder(orderId, items, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salesOrders", "list"] });
      queryClient.invalidateQueries({ queryKey: ["returns", "list"] });
      message.success("Tạo yêu cầu hoàn trả thành công!");
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi tạo yêu cầu hoàn trả");
    },
  });
};

/**
 * Hook for cancelling sales order
 */
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      cancellationReason,
    }: {
      orderId: string;
      cancellationReason: string;
    }) => {
      return await SalesOrderService.cancelSaleOrder(
        orderId,
        cancellationReason
      );
    },
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ["salesOrders", "list"] });
      queryClient.invalidateQueries({
        queryKey: ["salesOrders", "listFullfilled"],
      });
      queryClient.invalidateQueries({
        queryKey: ["salesOrders", "detail", updatedOrder.id],
      });
      message.success("Hủy đơn hàng thành công!");
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi hủy đơn hàng");
    },
  });
};
