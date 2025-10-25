import api from "../axios";
import {
  CreateSORequest,
  SaleOrderResponse,
  SaleReturnResponse,
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

  getSaleOrderById: async (orderId: string): Promise<SaleOrderResponse> => {
    const response = await api.get(`/so/${orderId}`);
    return response.data.data;
  },

  getAllSaleOrders: async (): Promise<SaleOrderResponse[]> => {
    const response = await api.get(`/so/get-all`);
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
};
