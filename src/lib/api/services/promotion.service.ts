import api from "../axios";
import {
  Promotion,
  CreatePromotionRequest,
  UpdatePromotionRequest,
  PromotionAnalytics,
  PromotionFilterParam,
} from "../types/promotion.types";

export const promotionService = {
  // Get all promotions with pagination and filters
  getAllPromotions: async (
    params: PromotionFilterParam = {}
  ): Promise<{
    content: Promotion[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  }> => {
    const {
      page = 0,
      size = 10,
      sort = "createdDate",
      direction = "DESC",
      ...filters
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort: sort,
      direction: direction,
    });

    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (Array.isArray(value)) {
          value.forEach((v) => queryParams.append(key, v.toString()));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    const response = await api.get(
      `/promotions/get-all?${queryParams.toString()}`
    );
    return response.data.data;
  },

  // Get promotion by ID
  getPromotionById: async (promotionId: string): Promise<Promotion> => {
    const response = await api.get(`/promotions/${promotionId}`);
    return response.data.data;
  },

  // Get promotion by code
  getPromotionByCode: async (promotionCode: string): Promise<Promotion> => {
    const response = await api.get(`/promotions/code/${promotionCode}`);
    return response.data.data;
  },

  // Create new promotion
  createPromotion: async (data: CreatePromotionRequest): Promise<Promotion> => {
    const response = await api.post("/promotions/create", data);
    return response.data.data;
  },

  // Update promotion
  updatePromotion: async (
    promotionId: string,
    data: UpdatePromotionRequest
  ): Promise<Promotion> => {
    const response = await api.post(`/promotions/${promotionId}/update`, data);
    return response.data.data;
  },

  // Update promotion status (activate/deactivate)
  updatePromotionStatus: async (
    promotionId: string,
    isActive: boolean
  ): Promise<void> => {
    await api.post(`/promotions/${promotionId}/status`, {
      isActive: isActive,
    });
  },

  // Delete promotion (soft delete)
  deletePromotion: async (promotionId: string): Promise<void> => {
    await api.post(`/promotions/${promotionId}/delete`);
  },

  // Restore promotion (undo soft delete)
  restorePromotion: async (promotionId: string): Promise<void> => {
    await api.post(`/promotions/${promotionId}/restore`);
  },

  // Make promotion visible to customers
  makePromotionVisible: async (promotionId: string): Promise<void> => {
    await api.post(`/promotions/${promotionId}/make-visible`);
  },

  // Make promotion invisible to customers
  makePromotionInvisible: async (promotionId: string): Promise<void> => {
    await api.post(`/promotions/${promotionId}/make-invisible`);
  },

  // Get active promotions
  getActivePromotions: async (
    params: PromotionFilterParam = {}
  ): Promise<{
    content: Promotion[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  }> => {
    const {
      page = 0,
      size = 10,
      sort = "createdDate",
      direction = "DESC",
      ...filters
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort: sort,
      direction: direction,
    });

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (Array.isArray(value)) {
          value.forEach((v) => queryParams.append(key, v.toString()));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    const response = await api.get(
      `/promotions/active?${queryParams.toString()}`
    );
    return response.data.data;
  },

  // Get visible promotions
  getVisiblePromotions: async (
    params: PromotionFilterParam = {}
  ): Promise<{
    content: Promotion[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  }> => {
    const {
      page = 0,
      size = 10,
      sort = "createdDate",
      direction = "DESC",
      ...filters
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort: sort,
      direction: direction,
    });

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (Array.isArray(value)) {
          value.forEach((v) => queryParams.append(key, v.toString()));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    const response = await api.get(
      `/promotions/visible?${queryParams.toString()}`
    );
    return response.data.data;
  },

  // Get expired promotions
  getExpiredPromotions: async (
    params: PromotionFilterParam = {}
  ): Promise<{
    content: Promotion[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  }> => {
    const {
      page = 0,
      size = 10,
      sort = "createdDate",
      direction = "DESC",
      ...filters
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort: sort,
      direction: direction,
    });

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (Array.isArray(value)) {
          value.forEach((v) => queryParams.append(key, v.toString()));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    const response = await api.get(
      `/promotions/expired?${queryParams.toString()}`
    );
    return response.data.data;
  },

  // Get promotions starting soon
  getPromotionsStartingSoon: async (
    params: PromotionFilterParam = {}
  ): Promise<{
    content: Promotion[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  }> => {
    const {
      page = 0,
      size = 10,
      sort = "createdDate",
      direction = "DESC",
      ...filters
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort: sort,
      direction: direction,
    });

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (Array.isArray(value)) {
          value.forEach((v) => queryParams.append(key, v.toString()));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    const response = await api.get(
      `/promotions/starting-soon?${queryParams.toString()}`
    );
    return response.data.data;
  },

  // Get promotions ending soon
  getPromotionsEndingSoon: async (
    params: PromotionFilterParam = {}
  ): Promise<{
    content: Promotion[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  }> => {
    const {
      page = 0,
      size = 10,
      sort = "createdDate",
      direction = "DESC",
      ...filters
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort: sort,
      direction: direction,
    });

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (Array.isArray(value)) {
          value.forEach((v) => queryParams.append(key, v.toString()));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    const response = await api.get(
      `/promotions/ending-soon?${queryParams.toString()}`
    );
    return response.data.data;
  },

  // Get promotion statistics
  getPromotionStatistics: async (): Promise<{
    totalPromotions: number;
    activePromotions: number;
    expiredPromotions: number;
    upcomingPromotions: number;
    totalUsage: number;
    totalDiscountGiven: number;
  }> => {
    const response = await api.get("/promotions/statistics");
    return response.data.data;
  },

  // Get promotions by type
  getPromotionsByType: async (type: string): Promise<Promotion[]> => {
    const response = await api.get(`/promotions/type/${type}`);
    return response.data.data;
  },

  // Get promotions by status
  getPromotionsByStatus: async (status: string): Promise<Promotion[]> => {
    const response = await api.get(`/promotions/status/${status}`);
    return response.data.data;
  },

  // Check promotion availability
  checkPromotionAvailability: async (
    promotionId: string,
    customerId?: string
  ): Promise<{ available: boolean; message?: string }> => {
    const response = await api.post(
      `/promotions/${promotionId}/check-availability`,
      {
        customerId,
      }
    );
    return response.data.data;
  },

  // Apply promotion to order
  applyPromotion: async (
    promotionId: string,
    orderData: {
      customerId: string;
      items: Array<{
        serviceId?: string;
        productId?: string;
        quantity: number;
        price: number;
      }>;
      totalAmount: number;
    }
  ): Promise<{
    discountAmount: number;
    finalAmount: number;
    appliedConditions: string[];
  }> => {
    const response = await api.post(
      `/promotions/${promotionId}/apply`,
      orderData
    );
    return response.data.data;
  },

  // Get promotion usage history
  getPromotionUsage: async (
    promotionId: string,
    page: number = 0,
    size: number = 20
  ): Promise<{
    content: Array<{
      usageId: string;
      customerId: string;
      orderId: string;
      discountAmount: number;
      usedAt: string;
    }>;
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  }> => {
    const response = await api.get(
      `/promotions/${promotionId}/usage?page=${page}&size=${size}`
    );
    return response.data.data;
  },

  // Get promotion analytics
  getPromotionAnalytics: async (
    promotionId: string,
    fromDate?: string,
    toDate?: string
  ): Promise<PromotionAnalytics> => {
    const params = new URLSearchParams();
    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);

    const response = await api.get(
      `/promotions/${promotionId}/analytics?${params.toString()}`
    );
    return response.data.data;
  },

  // Get all promotion analytics (dashboard)
  getAllPromotionAnalytics: async (
    fromDate?: string,
    toDate?: string
  ): Promise<PromotionAnalytics> => {
    const params = new URLSearchParams();
    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);

    const response = await api.get(
      `/promotions/analytics?${params.toString()}`
    );
    return response.data.data;
  },

  // Duplicate promotion
  duplicatePromotion: async (
    promotionId: string,
    newName: string,
    newCode: string
  ): Promise<Promotion> => {
    const response = await api.post(`/promotions/${promotionId}/duplicate`, {
      name: newName,
      code: newCode,
    });
    return response.data.data;
  },

  // Bulk update promotion status
  bulkUpdatePromotionStatus: async (
    promotionIds: string[],
    status: string
  ): Promise<{ success: number; failed: number }> => {
    const response = await api.post("/promotions/bulk-update-status", {
      promotionIds,
      status,
    });
    return response.data.data;
  },

  // Export promotions
  exportPromotions: async (
    filters?: Record<string, unknown>
  ): Promise<Blob> => {
    const response = await api.post("/promotions/export", filters, {
      responseType: "blob",
    });
    return response.data;
  },

  // Import promotions
  importPromotions: async (
    file: File
  ): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/promotions/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  },

  // Validate promotion code
  validatePromotionCode: async (
    code: string
  ): Promise<{
    valid: boolean;
    promotion?: Promotion;
    message?: string;
  }> => {
    const response = await api.post("/promotions/validate-code", { code });
    return response.data.data;
  },

  // Get promotion usage history
  getPromotionUsageHistory: async (
    params: PromotionFilterParam = {}
  ): Promise<{
    content: Array<{
      promotion_name: string;
      promotion_code: string;
      customer_name: string;
      customer_phone: string;
      order_id: string;
      order_amount: number;
      discount_amount: number;
      final_amount: number;
      used_date: string;
      branch_name: string;
      status: string;
      notes?: string;
    }>;
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  }> => {
    const {
      page = 0,
      size = 10,
      sort = "usedDate",
      direction = "DESC",
      ...filters
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort: sort,
      direction: direction,
    });

    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (Array.isArray(value)) {
          value.forEach((v) => queryParams.append(key, v.toString()));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    const response = await api.get(
      `/promotions/usage-history?${queryParams.toString()}`
    );
    return response.data.data;
  },
};
