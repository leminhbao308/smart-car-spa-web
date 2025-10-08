import api from '../axios';
import {
  CreatePriceBookItemRequest,
  CreatePriceBookRequest, PriceBook, PriceBookItem,
  PricingPreviewBatchRequest,
  PricingPreviewBatchResponse,
  PricingPreviewItemRequest,
  PricingPreviewItemResponse
} from "@/lib/api/types/price-book.types";

export const PricingService = {
  getPreviewPrice: async (data: PricingPreviewItemRequest): Promise<PricingPreviewItemResponse> => {
    const response = await api.post(`/pricing/preview`, data);
    return response.data.data;
  },

  getPreviewPriceBatch: async (data: PricingPreviewBatchRequest): Promise<PricingPreviewBatchResponse> => {
    const response = await api.post(`/pricing/preview/batch`, data);
    return response.data.data;
  },

  createPriceBook: async (data: CreatePriceBookRequest): Promise<PriceBook> => {
    const response = await api.post(`/pricing/books/create`, data);
    return response.data.data;
  },

  createPriceBookItem: async (priceBookId: string, data: CreatePriceBookItemRequest): Promise<PriceBookItem> => {
    const response = await api.post(`/pricing/books/${priceBookId}/items/create`, data);
    return response.data.data;
  },

  getPriceBookById: async (priceBookId: string): Promise<PriceBook> => {
    const response = await api.get(`/pricing/books/${priceBookId}`);
    return response.data.data;
  },

  getActiveBooksFromTo: async (fromDate: string, toDate: string): Promise<PriceBook[]> => {
    const response = await api.get(`/pricing/books/active`, {
      params: {
        from: fromDate,
        to: toDate
      }
    });
    return response.data.data;
  },

  getAllPriceBooks: async (): Promise<PriceBook[]> => {
    const response = await api.get(`/pricing/books/get-all`);
    return response.data.data;
  }
}
