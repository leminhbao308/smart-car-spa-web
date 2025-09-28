import api from "../axios";
import {
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  Category,
  UpdateCategoryStatusRequest,
} from "../types/category.types";

export const categoryService = {
  // Get all categories with pagination
  getAllCategories: async (
    page: number = 0,
    size: number = 50
  ): Promise<CategoryResponse> => {
    const response = await api.get(
      `/categories/get-all?page=${page}&size=${size}`
    );
    return response.data;
  },

  // Get category by ID
  getCategoryById: async (categoryId: string): Promise<Category> => {
    const response = await api.get(`/categories/${categoryId}`);
    return response.data.data;
  },

  // Create new category
  createCategory: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await api.post("/categories/create", data);
    return response.data.data;
  },

  // Update category
  updateCategory: async (data: UpdateCategoryRequest): Promise<Category> => {
    const { category_id, ...updateData } = data;
    const response = await api.post(
      `/categories/${category_id}/update`,
      updateData
    );
    return response.data.data;
  },

  updateCategoryStatusRequest: async (
    data: UpdateCategoryStatusRequest
  ): Promise<Category> => {
    const { category_id, ...updateData } = data;
    const response = await api.post(
      `/categories/${category_id}/status`,
      updateData
    );
    return response.data.data;
  },

  // Delete category (soft delete)
  deleteCategory: async (categoryId: string): Promise<void> => {
    await api.post(`/categories/${categoryId}/delete`);
  },

  // Toggle category status
  toggleCategoryStatus: async (
    categoryId: string,
    isActive: boolean
  ): Promise<Category> => {
    const response = await api.post(`/categories/${categoryId}/status`, {
      is_active: isActive,
    });
    return response.data.data;
  },

  // Get categories tree (flattened for tree view)
  getCategoriesTree: async (): Promise<Category[]> => {
    const response = await api.get("/categories/tree");
    return response.data.data;
  },
};
