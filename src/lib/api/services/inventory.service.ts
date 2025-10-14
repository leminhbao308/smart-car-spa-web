import api from "../axios";
import {InventoryLevel, InventoryLevelsBatchRequest, InventoryLevelsBatchResponse, StockRequest} from "@/lib/api/types/inventory.types";

export const InventoryService = {
  getInvLevel: async (productId: string, warehouseId: string): Promise<InventoryLevel> => {
    const response = await api.get(`/inv/level`, {
      params: {
        productId,
        warehouseId
      }
    });
    return response.data.data;
  },

  addStock: async (data: StockRequest): Promise<void> => {
    await api.post(`/inv/add-stock`, data);
  },

  reserveStock: async (data: StockRequest): Promise<void> => {
    await api.post(`/inv/reserve`, data);
  },

  releaseStock: async (data: StockRequest): Promise<void> => {
    await api.post(`/inv/release`, data);
  },

  fullFillStock: async (data: StockRequest): Promise<void> => {
    await api.post(`/inv/fulfill`, data);
  },

  returnStock: async (data: StockRequest): Promise<void> => {
    await api.post(`/inv/return`, data);
  },

  getInvLevelBatch: async (data: InventoryLevelsBatchRequest): Promise<InventoryLevelsBatchResponse> => {
    const response = await api.post(`/inv/levels-batch`, data);
    return response.data.data;
  },

  exportStockReport: async (
    date: string,
    branchId: string
  ): Promise<void> => {
    const params = new URLSearchParams({
      reportDate: date,
      branchId,
    });

    const response = await api.get(`/inv/export-inventory-report?${params.toString()}`, {
      responseType: 'blob',
    });

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;

    // Generate filename
    const formattedDate = date.replace(/-/g, '');
    const exportDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    link.setAttribute('download', `BangKeHangTonKho_${formattedDate}_${exportDate}.xlsx`);

    // Append to html link element page
    document.body.appendChild(link);

    // Start download
    link.click();

    // Clean up and remove the link
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

}
