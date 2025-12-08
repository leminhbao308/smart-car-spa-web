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
 */
export const useVerifyPayment = (
  orderCode: number | null,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) => {
  return useQuery({
    queryKey: ["payment", "verify", orderCode],
    queryFn: async () => {
      if (!orderCode) {
        console.log("🚫 useVerifyPayment: No orderCode provided");
        return null;
      }
      console.log(`🔍 useVerifyPayment: Verifying payment for orderCode: ${orderCode}`);
      try {
        const result = await PaymentService.verifyPayment(orderCode);
        console.log(`📊 useVerifyPayment: Payment status result:`, result);
        return result;
      } catch (error) {
        console.log(`❌ useVerifyPayment: Error verifying payment:`, error);
        throw error;
      }
    },
    enabled: options?.enabled !== false && !!orderCode,
    retry: 3,
    retryDelay: 1000,
    // Polling configuration
    refetchInterval: (query) => {
      const data = query.state.data;
      console.log(` useVerifyPayment: Refetch interval check - Status: ${data?.status}, TransactionId: ${data?.transaction_id}`);
      
      // Stop polling if payment is completed, cancelled, or has transaction_id (indicates successful payment)
      const isPaymentCompleted = data?.status === "COMPLETED" || 
        data?.status === "CANCELED" ||
        (data?.status === "PENDING" && data?.transaction_id);
        
      if (isPaymentCompleted) {
        console.log("🛑 useVerifyPayment: Stopping polling - payment completed/cancelled or has transaction_id");
        return false; // Dừng polling
      }
      
      // Continue polling
      const interval = options?.refetchInterval || 3000;
      console.log(` useVerifyPayment: Continuing polling - next check in ${interval}ms`);
      return interval;
    },
    refetchIntervalInBackground: true,
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

/**
 * Hook for getting payment link by sales order ID
 */
export const useGetPaymentLink = (saleOrderId: string | null) => {
  return useQuery({
    queryKey: ["payment", "paymentLink", saleOrderId],
    queryFn: async () => {
      if (!saleOrderId) return null;
      return await PaymentService.getPaymentLink(saleOrderId);
    },
    enabled: !!saleOrderId,
    retry: 2,
    retryDelay: 1000,
  });
};
