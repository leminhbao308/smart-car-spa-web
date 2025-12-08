import api from "../axios";
import {
  InventoryLotDTO,
  InventoryLotSummary,
  StockTransactionDTO,
} from "@/lib/api";

export const InventoryLotService = {
  /**
   * Get all inventory lots for a specific product in a branch
   */
  getProductLots: async (
    branchId: string,
    productId: string
  ): Promise<InventoryLotDTO[]> => {
    const response = await api.get(`/inventory/lots/product`, {
      params: { branchId, productId },
    });
    return response.data.data;
  },

  /**
   * Get all inventory lots for a branch
   */
  getBranchLots: async (branchId: string): Promise<InventoryLotDTO[]> => {
    const response = await api.get(`/inventory/lots/branch/${branchId}`);
    return response.data.data;
  },

  /**
   * Get inventory lot summary for a product
   * Includes statistics and detailed lot information
   */
  getProductLotSummary: async (
    branchId: string,
    productId: string
  ): Promise<InventoryLotSummary> => {
    const response = await api.get(`/inventory/lots/product/summary`, {
      params: { branchId, productId },
    });
    return response.data.data;
  },

  /**
   * Get stock transaction history for a product
   * Returns all stock transactions (inbound/outbound) with details
   */
  getProductTransactionHistory: async (
    branchId: string,
    productId: string
  ): Promise<StockTransactionDTO[]> => {
    const response = await api.get(`/inventory/lots/product/transactions`, {
      params: { branchId, productId },
    });
    return response.data.data;
  },
};
