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

  getActivePriceBooks: async (): Promise<PriceBook[]> => {
    console.log("=== PricingService.getActivePriceBooks ===");
    console.log("Making request to: /pricing/books/active");
    try {
      const response = await api.get(`/pricing/books/active`);
      console.log("Raw API Response:", response);
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);
      console.log("Response data.data:", response.data.data);
      console.log("Response data.data length:", response.data.data?.length);
      
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log("Price books found:", response.data.data.length);
        response.data.data.forEach((book: unknown, index: number) => {
          const bookData = book as { name?: string; items?: unknown[] };
          console.log(`Price book ${index + 1}:`, book);
          console.log(`  - Book name: ${bookData.name || 'Unknown'}`);
          console.log(`  - Items count: ${bookData.items?.length || 0}`);
          if (bookData.items && Array.isArray(bookData.items)) {
            bookData.items.forEach((item: unknown, itemIndex: number) => {
              const itemData = item as { item_name?: string; item_type?: string };
              console.log(`    Item ${itemIndex + 1}: ${itemData.item_name || 'Unknown'} (${itemData.item_type || 'Unknown'})`);
            });
          }
        });
      }
      
      return response.data.data;
    } catch (error) {
      console.error("PricingService.getActivePriceBooks error:", error);
      throw error;
    }
  },

  getAllPriceBooks: async (): Promise<PriceBook[]> => {
    console.log("=== PricingService.getAllPriceBooks ===");
    console.log("Making request to: /pricing/books/get-all");
    try {
      const response = await api.get(`/pricing/books/get-all`);
      console.log("Raw API Response:", response);
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);
      console.log("Response data.data:", response.data.data);
      console.log("Response data.data length:", response.data.data?.length);
      
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log("All price books found:", response.data.data.length);
        response.data.data.forEach((book: unknown, index: number) => {
          const bookData = book as { name?: string; items?: unknown[] };
          console.log(`Price book ${index + 1}:`, book);
          console.log(`  - Book name: ${bookData.name || 'Unknown'}`);
          console.log(`  - Items count: ${bookData.items?.length || 0}`);
          if (bookData.items && Array.isArray(bookData.items)) {
            bookData.items.forEach((item: unknown, itemIndex: number) => {
              const itemData = item as { item_name?: string; item_type?: string; service?: unknown; servicePackage?: unknown };
              console.log(`    Item ${itemIndex + 1}: ${itemData.item_name || 'Unknown'} (${itemData.item_type || 'Unknown'}) - Service: ${itemData.service ? 'exists' : 'null'}, ServicePackage: ${itemData.servicePackage ? 'exists' : 'null'}`);
            });
          }
        });
      }
      
      return response.data.data;
    } catch (error) {
      console.error("PricingService.getAllPriceBooks error:", error);
      throw error;
    }
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
