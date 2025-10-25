import api from "../axios";
import {
  CreatePORequest,
  PurchaseHistory,
  PurchaseOrder,
  PurchaseOrderLine,
  ExcelImportPreviewResponse,
  ConfirmImportRequest,
} from "@/lib/api";

export const PurchaseOrderService = {
  createDraftPurchaseOrder: async (
    data: CreatePORequest
  ): Promise<PurchaseOrder> => {
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
      params.append("branchId", branchId);
    }

    const response = await api.get(
      `/po/export-purchase-report?${params.toString()}`,
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
      `BangKeHangNhap_${formattedFromDate}_${formattedToDate}.xlsx`
    );

    // Append to html link element page
    document.body.appendChild(link);

    // Start download
    link.click();

    // Clean up and remove the link
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Excel Import Methods
  downloadTemplate: async (
    productIds?: string[],
    supplierId?: string
  ): Promise<void> => {
    const params = new URLSearchParams();

    if (productIds && productIds.length > 0) {
      productIds.forEach((id) => params.append("productIds[]", id));
    }

    if (supplierId) {
      params.append("supplierId", supplierId);
    }

    const response = await api.get(
      `/po/template/download${
        params.toString() ? `?${params.toString()}` : ""
      }`,
      { responseType: "blob" }
    );

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `PurchaseOrder_Template_${Date.now()}.xlsx`);

    document.body.appendChild(link);
    link.click();

    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  uploadAndPreview: async (
    file: File,
    branchId: string
  ): Promise<ExcelImportPreviewResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("branchId", branchId);

    const response = await api.post("/po/excel/preview", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data;
  },

  confirmImport: async (data: ConfirmImportRequest): Promise<PurchaseOrder> => {
    const response = await api.post("/po/excel/import", data);
    return response.data.data;
  },
};
