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
  }

}
