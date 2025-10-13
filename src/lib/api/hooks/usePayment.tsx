"use client";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {message} from "antd";
import {CreateAndPayRequest, InitiatePaymentRequest, PaymentService} from "@/lib/api";

/**
 * Hook for initiating payment
 */
export const useInitiatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: InitiatePaymentRequest) => {
      return await PaymentService.initiatePayment(request);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({queryKey: ["payments"]});
      message.success("Khởi tạo thanh toán thành công!");
      return data;
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi khởi tạo thanh toán");
    },
  });
};

/**
 * Hook for verifying payment with polling support
 * @param orderCode - Order code to verify
 * @param options - Configuration options
 * @param options.enabled - Whether to enable the query
 * @param options.refetchInterval - Interval in ms to refetch (default: 3000ms)
 * @param options.onSuccess - Callback when payment is successful
 * @param options.onCancelled - Callback when payment is cancelled
 */
export const useVerifyPayment = (
  orderCode: number | null,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
    onSuccess?: (data: any) => void;
    onCancelled?: (data: any) => void;
  }
) => {
  return useQuery({
    queryKey: ["payment", "verify", orderCode],
    queryFn: async () => {
      if (!orderCode) return null;
      return await PaymentService.verifyPayment(orderCode);
    },
    enabled: options?.enabled !== false && !!orderCode,
    retry: 3,
    retryDelay: 1000,
    // Polling configuration
    refetchInterval: (query) => {
      const data = query.state.data;
      // Stop polling if payment is completed or cancelled
      if (data?.status === "COMPLETED" || data?.status === "CANCELED") {
        if (data?.status === "COMPLETED" && options?.onSuccess) {
          options.onSuccess(data);
        }
        if (data?.status === "CANCELED" && options?.onCancelled) {
          options.onCancelled(data);
        }
        return false;
      }
      // Continue polling with specified interval (default 3 seconds)
      return options?.refetchInterval || 3000;
    },
    refetchIntervalInBackground: true, // Continue polling even when tab is not focused
  });
};

/**
 * Hook for completing direct payment
 */
export const useCompletePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({paymentId, transactionId}: { paymentId: string; transactionId?: string }) => {
      return await PaymentService.completePayment(paymentId, transactionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["payments"]});
      message.success("Hoàn thành thanh toán thành công!");
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi hoàn thành thanh toán");
    },
  });
};

/**
 * Hook for cancelling payment
 */
export const useCancelPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentId: string) => {
      return await PaymentService.cancelPayment(paymentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["payments"]});
      message.success("Hủy thanh toán thành công!");
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi hủy thanh toán");
    },
  });
};

/**
 * Hook for getting payment by sales order
 */
export const usePaymentBySalesOrder = (salesOrderId: string | null) => {
  return useQuery({
    queryKey: ["payment", "salesOrder", salesOrderId],
    queryFn: async () => {
      if (!salesOrderId) return null;
      return await PaymentService.getPaymentBySalesOrder(salesOrderId);
    },
    enabled: !!salesOrderId,
  });
};

/**
 * Hook for creating order and initiating payment (Combined)
 */
export const useCreateAndPay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateAndPayRequest) => {
      return await PaymentService.createAndPay(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["salesOrders"]});
      queryClient.invalidateQueries({queryKey: ["payments"]});
      queryClient.invalidateQueries({queryKey: ["catalog"]});
      queryClient.invalidateQueries({queryKey: ["inventory"]});
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi tạo đơn hàng và thanh toán");
    },
  });
};
