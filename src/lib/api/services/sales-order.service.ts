import api from "../axios";
import {
  CreateSORequest,
  SaleOrderResponse,
  SaleReturnResponse,
  PagedSaleOrderResponse,
} from "@/lib/api/types/sale-order.types";

export const SalesOrderService = {
  createDraftOrder: async (
    data: CreateSORequest
  ): Promise<SaleOrderResponse> => {
    const response = await api.post(`/so/create-draft`, data);
    return response.data.data;
  },

  confirmSaleOrder: async (orderId: string): Promise<SaleOrderResponse> => {
    const response = await api.post(`/so/confirm/${orderId}`);
    return response.data.data;
  },

  fullFillSaleOrder: async (orderId: string): Promise<SaleOrderResponse> => {
    const response = await api.post(`/so/fulfill/${orderId}`);
    return response.data.data;
  },

  returnSaleOrder: async (
    orderId: string,
    items: { product_id: string; qty: number; unit_cost: number }[],
    reason: string = "Hoàn trả hàng"
  ): Promise<SaleReturnResponse> => {
    const response = await api.post(`/so/return/${orderId}`, { items, reason });
    return response.data.data;
  },

  cancelSaleOrder: async (
    orderId: string,
    cancellationReason: string
  ): Promise<SaleOrderResponse> => {
    const response = await api.post(`/so/cancel/${orderId}`, {
      cancellation_reason: cancellationReason,
    });
    return response.data.data;
  },

  getSaleOrderById: async (orderId: string): Promise<SaleOrderResponse> => {
    const response = await api.get(`/so/${orderId}`);
    return response.data.data;
  },

  getAllSaleOrders: async (): Promise<SaleOrderResponse[]> => {
    const response = await api.get(`/so/get-all`);
    return response.data.data;
  },

  getPagedSaleOrders: async (
    page: number = 0,
    size: number = 10,
    sortBy: string = "createdDate",
    sortDirection: "ASC" | "DESC" = "DESC",
    userId?: string
  ): Promise<PagedSaleOrderResponse> => {
    const response = await api.get(`/so/paged`, {
      params: {
        page,
        size,
        sortBy,
        sortDirection,
        ...(userId && { userId }),
      },
    });
    return response.data.data;
  },

  getAllReturnedOrders: async (): Promise<SaleReturnResponse[]> => {
    const response = await api.get(`/so/get-all-return`);
    return response.data.data;
  },

  getAllFullfilledOrders: async (): Promise<SaleOrderResponse[]> => {
    const response = await api.get(`/so/get-all-fullfilled`);
    return response.data.data;
  },

  exportSalesReport: async (
    fromDate: string,
    toDate: string,
    branchId?: string
  ): Promise<void> => {
    const params = new URLSearchParams({
      fromDate,
      toDate,
    });

    if (branchId) {
      params.append("branchId", branchId);
    }

    const response = await api.get(
      `/so/export-sales-report?${params.toString()}`,
      {
        responseType: "blob",
      }
    );

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;

    // Generate filename
    const formattedFromDate = fromDate.replace(/-/g, "");
    const formattedToDate = toDate.replace(/-/g, "");
    link.setAttribute(
      "download",
      `BangKeHangBan_${formattedFromDate}_${formattedToDate}.xlsx`
    );

    // Append to html link element page
    document.body.appendChild(link);

    // Start download
    link.click();

    // Clean up and remove the link
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  exportReturnsReport: async (
    fromDate: string,
    toDate: string
  ): Promise<void> => {
    const params = new URLSearchParams({
      fromDate,
      toDate,
    });

    const response = await api.get(
      `/so/export-returns-report?${params.toString()}`,
      {
        responseType: "blob",
      }
    );

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;

    // Generate filename
    const formattedFromDate = fromDate.replace(/-/g, "");
    const formattedToDate = toDate.replace(/-/g, "");
    link.setAttribute(
      "download",
      `BaoCaoHoanTra_${formattedFromDate}_${formattedToDate}.xlsx`
    );

    // Append to html link element page
    document.body.appendChild(link);

    // Start download
    link.click();

    // Clean up and remove the link
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
