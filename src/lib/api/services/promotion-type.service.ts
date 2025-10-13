import api from "../axios";
import {
  CreatePromotionTypeRequest,
  PromotionTypeFilterParam,
  PromotionTypeInfo,
  PromotionTypePageResponse,
  PromotionTypeStats,
  PromotionTypeStatusUpdateRequest,
  UpdatePromotionTypeRequest
} from "@/lib/api";

export const PromotionTypeService = {
  getAllPromotionTypes: async (params: PromotionTypeFilterParam = {}): Promise<PromotionTypePageResponse> => {
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
          value.forEach(v => queryParams.append(key, v.toString()));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    const response = await api.get(`/promotion-types/get-all?${queryParams.toString()}`);
    return response.data.data;
  },

  getPromotionTypeById: async (id: string): Promise<PromotionTypeInfo> => {
    const response = await api.get(`/promotion-types/${id}`);
    return response.data.data;
  },

  getPromotionTypeByTypeCode: async (typeCode: string): Promise<PromotionTypeInfo> => {
    const response = await api.get(`/promotion-types/code/${typeCode}`);
    return response.data.data;
  },

  getActivePromotionTypes: async (): Promise<PromotionTypeInfo[]> => {
    const response = await api.get(`/promotion-types/active`);
    return response.data.data;
  },

  searchPromotionTypes: async (keyword: string): Promise<PromotionTypeInfo[]> => {
    const response = await api.get(`/promotion-types/search`, {params: {keyword}});
    return response.data.data;
  },

  createPromotionType: async (data: CreatePromotionTypeRequest): Promise<PromotionTypeInfo> => {
    const response = await api.post(`/promotion-types/create`, data);
    return response.data.data;
  },

  updatePromotionType: async (id: string, data: Partial<UpdatePromotionTypeRequest>): Promise<PromotionTypeInfo> => {
    const response = await api.post(`/promotion-types/${id}/update`, data);
    return response.data.data;
  },

  deletePromotionType: async (id: string): Promise<void> => {
    await api.post(`/promotion-types/${id}/delete`);
  },

  activatePromotionType: async (id: string): Promise<void> => {
    await api.post(`/promotion-types/${id}/activate`);
  },

  deactivatePromotionType: async (id: string): Promise<void> => {
    await api.post(`/promotion-types/${id}/deactivate`);
  },

  updatePromotionTypeStatus: async (id: string, data: PromotionTypeStatusUpdateRequest): Promise<PromotionTypeInfo> => {
    const response = await api.post(`/promotion-types/${id}/status`, data);
    return response.data.data;
  },

  getPromotionTypeStatistics: async (): Promise<PromotionTypeStats> => {
    const response = await api.get(`/promotion-types/statistics`);
    return response.data.data;
  }
}
