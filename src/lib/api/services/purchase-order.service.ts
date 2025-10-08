import api from "../axios";
import {CreatePORequest, PurchaseOrder} from "@/lib/api";

export const PurchaseOrderService = {
  createDraftPurchaseOrder: async (data: CreatePORequest): Promise<PurchaseOrder> => {
    const response = await api.post(`/po/create-draft`, data);
    return response.data.data;
  },

  submitPurchaseOrder: async (orderId: string): Promise<PurchaseOrder> => {
    const response = await api.post(`/po/submit/${orderId}`);
    return response.data.data;
  },

  receivePurchaseOrder: async (orderId: string): Promise<PurchaseOrder> => {
    const response = await api.post(`/po/receive/${orderId}`);
    return response.data.data;
  },

  cancelPurchaseOrder: async (orderId: string): Promise<PurchaseOrder> => {
    const response = await api.post(`/po/cancel/${orderId}`);
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
