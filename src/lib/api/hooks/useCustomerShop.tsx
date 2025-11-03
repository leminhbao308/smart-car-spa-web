"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import {
  CustomerOrder,
  CreateCustomerOrderRequest,
  CreateReturnRequest,
  ReturnRequest,
  OrderFilterParams,
  CatalogProduct,
} from "../types/customer-order.types";
import { SalesOrderService } from "../services/sales-order.service";
import { CatalogService } from "../services/catalog.service";
import {
  SaleOrderResponse,
  SaleReturnResponse,
} from "../types/sale-order.types";
import { PaymentService } from "../services/payment.service";
import { CatalogData } from "../types/catalog.types";

/**
 * Helper function to map backend order status to customer-friendly status
 */
const mapToCustomerStatus = (
  backendStatus: SaleOrderResponse["status"],
  paymentStatus?: string
): CustomerOrder["status"] => {
  switch (backendStatus) {
    case "CONFIRMED":
      return paymentStatus === "COMPLETED" ? "PAID" : "PENDING";
    case "FULFILLED":
      return "COMPLETED";
    case "CANCELLED":
      return "CANCELLED";
    case "RETURNED":
    case "PARTIALLY_RETURNED":
      return "RETURNED";
    default:
      return "PENDING";
  }
};

/**
 * Helper function to transform backend order to customer order
 */
const transformToCustomerOrder = (
  order: SaleOrderResponse,
  paymentData?: any
): CustomerOrder => {
  const paymentStatus = paymentData?.status;

  return {
    id: order.id,
    orderNumber: `ORD-${order.id.slice(0, 8).toUpperCase()}`,
    customer: order.customer,
    branch: order.branch,
    status: mapToCustomerStatus(order.status, paymentStatus),
    lines: order.lines.map((line) => ({
      id: line.id,
      product: line.product,
      quantity: line.quantity,
      unitPrice: line.unit_price,
      subtotal: line.quantity * line.unit_price,
      isFreeItem: line.is_free_item,
    })),
    originalAmount: order.original_amount || 0,
    discountAmount: order.total_discount_amount || 0,
    finalAmount: order.final_amount || 0,
    appliedPromotions: order.promotion_snapshot
      ? JSON.parse(order.promotion_snapshot)
      : [],
    paymentMethod: paymentData?.payment_method || "CASH",
    paymentStatus: paymentStatus,
    paymentQrCode: paymentData?.qr_code,
    orderDate: order.created_date || new Date().toISOString(),
    paidDate: paymentData?.completed_at,
    completedDate:
      order.status === "FULFILLED" ? order.modified_date : undefined,
    cancelledDate:
      order.status === "CANCELLED" ? order.modified_date : undefined,
    cancellationReason: order.cancellation_reason,
    canCancel: order.status === "CONFIRMED" && paymentStatus !== "COMPLETED",
    canReturn: order.status === "FULFILLED",
  };
};

/**
 * Hook to get all public products (for product listing page)
 * Returns all active products from the system with images
 */
export const usePublicProducts = () => {
  const {
    data: response,
    isLoading: productsLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["public", "products"],
    queryFn: async () => {
      // Import productService locally to avoid circular dependency
      const { productService } = await import("../services/product.service");
      return await productService.getAllProducts({
        page: 0,
        size: 1000, // Get all products
        sort: "createdDate",
        direction: "DESC",
        filters: {
          isActive: true, // Only active products
          isReward: false, // Exclude reward-only products
        },
      });
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  // Fetch all product images in parallel
  const { data: allProductImages, isLoading: imagesLoading } = useQuery({
    queryKey: ["public", "products", "images"],
    queryFn: async () => {
      if (!response?.data?.content) return {};

      const { productService } = await import("../services/product.service");
      const imagePromises = response.data.content.map(async (product) => {
        try {
          const images = await productService.getProductImages(
            product.product_id
          );
          const mainImage = images.find((img) => img.is_main);
          return [product.product_id, mainImage?.media_url || null];
        } catch (e) {
          return [product.product_id, null];
        }
      });

      const imageEntries = await Promise.all(imagePromises);
      return Object.fromEntries(imageEntries);
    },
    enabled: !!response?.data?.content?.length,
    staleTime: 10 * 60 * 1000,
  });

  // Transform to CatalogProduct format with images
  const products: CatalogProduct[] =
    response?.data?.content?.map((product) => ({
      ...product,
      mainImageUrl: allProductImages?.[product.product_id] || undefined,
      availableStock: 999, // Default stock for public listing
      isAvailable: product.is_active,
      pricing: {
        basePrice: 0, // Pricing will be loaded on-demand when viewing product detail
        salePrice: undefined,
        discountPercentage: undefined,
      },
    })) || [];

  return {
    products,
    loading: productsLoading || imagesLoading,
    error,
    refetch,
  };
};

/**
 * Hook to get product catalog for customer shopping
 * @param branchId - Branch ID to get catalog for (optional, defaults to first branch)
 */
export const useProductCatalog = (branchId?: string) => {
  const {
    data: catalogData,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["customer", "catalog", branchId],
    queryFn: async () => {
      if (!branchId) {
        console.warn("No branchId provided for catalog");
        return null;
      }
      return await CatalogService.getForSaleCatalogs(branchId);
    },
    enabled: !!branchId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Transform catalog data to customer-friendly format
  const products: CatalogProduct[] =
    catalogData?.items?.map((item) => {
      const stockLevel = item.inventory?.available || 0;
      const basePrice = item.price || 0;
      const salePrice = undefined; // TODO: Add sale price logic if available
      const discountPercentage = salePrice
        ? Math.round(((basePrice - salePrice) / basePrice) * 100)
        : undefined;

      return {
        ...item.product,
        availableStock: stockLevel,
        isAvailable: stockLevel > 0 && item.product.is_active,
        pricing: {
          basePrice,
          salePrice,
          discountPercentage,
        },
      };
    }) || [];

  return {
    products,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook to get single product detail
 */
export const useProductDetail = (productId: string | null) => {
  return useQuery({
    queryKey: ["customer", "product", productId],
    queryFn: async () => {
      // TODO: Implement product detail API
      // For now, return null
      return null;
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to create customer order
 */
export const useCreateCustomerOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateCustomerOrderRequest) => {
      // Create order with CONFIRMED status for customer
      const orderPayload = {
        branch_id: request.branch_id,
        warehouse_id: request.warehouse_id,
        customer_id: request.customer_id,
        lines: request.lines,
        // Map shipping_info to shipping_* fields
        shipping_full_name: request.shipping_info?.full_name || "",
        shipping_phone: request.shipping_info?.phone || "",
        shipping_address: request.shipping_info?.address || "",
        shipping_ward: request.shipping_info?.ward || "",
        shipping_district: request.shipping_info?.district || "",
        shipping_city: request.shipping_info?.city || "",
        shipping_notes: request.shipping_info?.notes || "",
      };

      // Create draft order first
      const order = await SalesOrderService.createDraftOrder(orderPayload);

      // Immediately confirm it
      const confirmedOrder = await SalesOrderService.confirmSaleOrder(order.id);

      // If CASH payment, fulfill immediately
      if (request.payment_method === "CASH") {
        const fulfilledOrder = await SalesOrderService.fullFillSaleOrder(
          confirmedOrder.id
        );
        return fulfilledOrder;
      }

      // If BANK payment, initiate payment
      if (request.payment_method === "BANK") {
        const paymentLink = await PaymentService.getPaymentLink(
          confirmedOrder.id
        );
        return { ...confirmedOrder, paymentLink };
      }

      return confirmedOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["customer", "catalog"] });
      message.success("Đặt hàng thành công!");
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi đặt hàng");
    },
  });
};

/**
 * Hook to get customer's orders with pagination and filters
 */
export const useCustomerOrders = (
  customerId: string | null,
  filters?: OrderFilterParams
) => {
  const page = filters?.page || 0;
  const size = filters?.size || 10;

  const {
    data: pagedData,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["customer", "orders", customerId, filters],
    queryFn: async () => {
      if (!customerId) return null;

      console.log("🔍 Fetching orders for userId:", customerId);

      // Get paged orders with userId filter
      const result = await SalesOrderService.getPagedSaleOrders(
        page,
        size,
        "createdDate",
        "DESC",
        customerId // Pass as userId parameter
      );

      console.log("📦 API returned orders:", result.content.length);
      console.log("📊 Total elements:", result.totalElements);

      // Filter by status (backend should already filter by customerId)
      const filteredOrders = result.content.filter((order) => {
        // Exclude DRAFT orders (admin-only)
        if (order.status === "DRAFT") return false;

        // Filter by status if provided
        if (filters?.status) {
          const customerStatus = mapToCustomerStatus(order.status);
          if (customerStatus !== filters.status) return false;
        }

        return true;
      });

      // Transform orders
      const transformedOrders: CustomerOrder[] = await Promise.all(
        filteredOrders.map(async (order) => {
          // Fetch payment data for each order
          try {
            const paymentData = await PaymentService.getPaymentBySalesOrder(
              order.id
            );
            return transformToCustomerOrder(order, paymentData);
          } catch (e) {
            return transformToCustomerOrder(order);
          }
        })
      );

      return {
        content: transformedOrders,
        page: result.page,
        size: result.size,
        totalElements: filteredOrders.length,
        totalPages: Math.ceil(filteredOrders.length / size),
        last: result.last,
      };
    },
    enabled: !!customerId,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    orders: pagedData?.content || [],
    page: pagedData?.page || 0,
    size: pagedData?.size || size,
    totalElements: pagedData?.totalElements || 0,
    totalPages: pagedData?.totalPages || 0,
    isLast: pagedData?.last || true,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook to get single order detail
 */
export const useOrderDetail = (orderId: string | null) => {
  const {
    data: order,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["customer", "order", orderId],
    queryFn: async () => {
      if (!orderId) return null;

      const orderData = await SalesOrderService.getSaleOrderById(orderId);

      // Fetch payment data
      try {
        const paymentData = await PaymentService.getPaymentBySalesOrder(
          orderId
        );
        return transformToCustomerOrder(orderData, paymentData);
      } catch (e) {
        return transformToCustomerOrder(orderData);
      }
    },
    enabled: !!orderId,
    staleTime: 3 * 60 * 1000,
  });

  return {
    order,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook to cancel an order
 */
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      reason,
    }: {
      orderId: string;
      reason: string;
    }) => {
      return await SalesOrderService.cancelSaleOrder(orderId, reason);
    },
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ["customer", "orders"] });
      queryClient.invalidateQueries({
        queryKey: ["customer", "order", updatedOrder.id],
      });
      message.success("Hủy đơn hàng thành công!");
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi hủy đơn hàng");
    },
  });
};

/**
 * Hook to request return for an order
 */
export const useRequestReturn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateReturnRequest) => {
      return await SalesOrderService.returnSaleOrder(
        request.orderId,
        request.items,
        request.reason
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["customer", "returns"] });
      message.success("Yêu cầu trả hàng đã được gửi thành công!");
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi gửi yêu cầu trả hàng");
    },
  });
};

/**
 * Hook to get customer's return requests
 */
export const useCustomerReturns = (customerId: string | null) => {
  const {
    data: returns,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["customer", "returns", customerId],
    queryFn: async () => {
      if (!customerId) return [];

      const allReturns = await SalesOrderService.getAllReturnedOrders();

      // Filter by customer
      const customerReturns = allReturns.filter(
        (returnOrder) => returnOrder.sales_order?.customer?.id === customerId
      );

      // Transform to customer-friendly format
      const transformedReturns: ReturnRequest[] = customerReturns.map(
        (returnOrder) => ({
          id: returnOrder.id,
          returnNumber: `RET-${returnOrder.id.slice(0, 8).toUpperCase()}`,
          order: transformToCustomerOrder(returnOrder.sales_order),
          status: "PENDING", // TODO: Map from actual return status when available
          items: returnOrder.lines.map((line) => ({
            productId: line.product.product_id,
            productName: line.product.product_name,
            productImage: undefined, // TODO: Fetch product image
            quantity: line.quantity,
            maxQuantity: line.quantity,
            unitPrice: 0, // TODO: Get unit price from original order
            refundAmount: 0, // TODO: Calculate refund amount
          })),
          reason: returnOrder.reason,
          refundAmount: 0, // TODO: Calculate total refund amount
          requestDate: returnOrder.created_date || new Date().toISOString(),
        })
      );

      return transformedReturns;
    },
    enabled: !!customerId,
    staleTime: 3 * 60 * 1000,
  });

  return {
    returns: returns || [],
    loading,
    error,
    refetch,
  };
};

/**
 * Hook to get single return detail
 */
export const useReturnDetail = (returnId: string | null) => {
  const {
    data: returnData,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["customer", "return", returnId],
    queryFn: async () => {
      if (!returnId) return null;

      // TODO: Implement get single return API
      // For now, get all returns and find the one
      const allReturns = await SalesOrderService.getAllReturnedOrders();
      const returnOrder = allReturns.find((r) => r.id === returnId);

      if (!returnOrder) return null;

      const transformedReturn: ReturnRequest = {
        id: returnOrder.id,
        returnNumber: `RET-${returnOrder.id.slice(0, 8).toUpperCase()}`,
        order: transformToCustomerOrder(returnOrder.sales_order),
        status: "PENDING", // TODO: Map from actual return status
        items: returnOrder.lines.map((line) => ({
          productId: line.product.product_id,
          productName: line.product.product_name,
          productImage: undefined, // TODO: Fetch product image
          quantity: line.quantity,
          maxQuantity: line.quantity,
          unitPrice: 0, // TODO: Get unit price from original order
          refundAmount: 0, // TODO: Calculate refund amount
        })),
        reason: returnOrder.reason,
        refundAmount: 0, // TODO: Calculate total refund amount
        requestDate: returnOrder.created_date || new Date().toISOString(),
      };

      return transformedReturn;
    },
    enabled: !!returnId,
    staleTime: 3 * 60 * 1000,
  });

  return {
    returnData,
    loading,
    error,
    refetch,
  };
};
