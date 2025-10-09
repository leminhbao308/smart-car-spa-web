import api from "../axios";
import {CreatePORequest, PurchaseOrder} from "@/lib/api";

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
  }
}
