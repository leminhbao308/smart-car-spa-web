import api from '../axios';
import {
  CreatePriceBookItemRequest,
  CreatePriceBookRequest, PriceBook, PriceBookItem,
  PricingPreviewBatchRequest,
  PricingPreviewBatchResponse,
  PricingPreviewItemRequest,
  PricingPreviewItemResponse
} from "@/lib/api/types/price-book.types";
import { ServicePricingDto } from "@/lib/api/types/service.types";

export const PricingService = {
  getPreviewPrice: async (data: PricingPreviewItemRequest): Promise<PricingPreviewItemResponse> => {
    const response = await api.post(`/pricing/preview`, data);
    return response.data.data;
  },

  getPreviewPriceBatch: async (data: PricingPreviewBatchRequest): Promise<PricingPreviewBatchResponse> => {
    const response = await api.post(`/pricing/preview-batch`, data);
    return response.data.data;
  },

  createPriceBook: async (data: CreatePriceBookRequest): Promise<PriceBook> => {
    const response = await api.post(`/pricing/books/create`, data);
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
  },

  // Service Pricing APIs
  getServicePricing: async (serviceId: string, priceBookId?: string): Promise<ServicePricingDto> => {
    const params = priceBookId ? `?priceBookId=${priceBookId}` : "";
    const response = await api.get(`/pricing/services/${serviceId}${params}`);
    return response.data.data;
  },

  recalculateServicePricing: async (serviceId: string, priceBookId?: string): Promise<ServicePricingDto> => {
    const params = priceBookId ? `?priceBookId=${priceBookId}` : "";
    const response = await api.post(`/pricing/services/${serviceId}/recalculate${params}`);
    return response.data.data;
  },

  // Price Book Item Management APIs
  createPriceBookItem: async (priceBookId: string, data: CreatePriceBookItemRequest): Promise<PriceBookItem> => {
    const response = await api.post(`/pricing/books/${priceBookId}/create-item`, data);
    return response.data.data;
  },

  createServicePriceBookItem: async (priceBookId: string, data: any): Promise<PriceBookItem> => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const response = await api.post(`/pricing/books/${priceBookId}/create-service-item`, data);
    return response.data.data;
  },

  createServicePackagePriceBookItem: async (priceBookId: string, data: any): Promise<PriceBookItem> => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const response = await api.post(`/pricing/books/${priceBookId}/create-service-package-item`, data);
    return response.data.data;
  },

  updatePriceBook: async (priceBookId: string, data: CreatePriceBookRequest): Promise<PriceBook> => {
    const response = await api.post(`/pricing/books/update/${priceBookId}`, data);
    return response.data.data;
  },

  updatePriceBookItem: async (bookId: string, itemId: string, data: CreatePriceBookItemRequest): Promise<PriceBookItem> => {
    const response = await api.post(`/pricing/books/${bookId}/update-item/${itemId}`, data);
    return response.data.data;
  }
}
