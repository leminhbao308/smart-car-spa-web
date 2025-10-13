import api from "../axios";
import {CreatePORequest, PurchaseHistory, PurchaseOrder, PurchaseOrderLine} from "@/lib/api";

export const PurchaseOrderService = {
  createDraftPurchaseOrder: async (data: CreatePORequest): Promise<PurchaseOrder> => {
    const response = await api.post(`/po/create-po`, data);
    return response.data.data;
  },

  getPurchaseOrderById: async (orderId: string): Promise<PurchaseOrder> => {
    const response = await api.get(`/po/${orderId}`);
    return response.data.data;
  },

  getAllPurchaseOrders: async (): Promise<PurchaseOrder[]> => {
    const response = await api.get(`/po/get-all`);
    return response.data.data;
  },

  getProductPOHistory: async (productId: string): Promise<PurchaseHistory> => {
    const response = await api.get(`/po/purchase-history/${productId}`);
    return response.data.data;
  },

  exportPurchaseReport: async (
    fromDate: string,
    toDate: string,
    branchId?: string
  ): Promise<void> => {
    const params = new URLSearchParams({
      fromDate,
      toDate,
    });

    if (branchId) {
      params.append('branchId', branchId);
    }

    const response = await api.get(`/po/export-purchase-report?${params.toString()}`, {
      responseType: 'blob',
    });

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;

    // Generate filename
    const formattedFromDate = fromDate.replace(/-/g, '');
    const formattedToDate = toDate.replace(/-/g, '');
    link.setAttribute('download', `BangKeHangNhap_${formattedFromDate}_${formattedToDate}.xlsx`);

    // Append to html link element page
    document.body.appendChild(link);

    // Start download
    link.click();

    // Clean up and remove the link
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
