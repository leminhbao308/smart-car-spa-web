import api from "../axios";
import {
  ProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
  Product,
  ProductSearchParams,
} from "../types/product.types";

export const productService = {
  // Get all products with pagination and filters
  getAllProducts: async (
    params: ProductSearchParams = {}
  ): Promise<ProductResponse> => {
    const {
      page = 1,
      size = 10,
      sort = "createdDate",
      direction = "DESC",
      filters = {},
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
        if (key === "is_active" && value === "deleted") {
          // Xử lý filter "deleted" đặc biệt
          queryParams.append("is_deleted", "true");
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    const response = await api.get(
      `/products/get-all?${queryParams.toString()}`
    );
    return response.data;
  },

  // Get product by ID
  getProductById: async (productId: string): Promise<Product> => {
    const response = await api.get(`/products/${productId}`);
    return response.data.data;
  },

  // Create new product
  createProduct: async (data: CreateProductRequest): Promise<Product> => {
    const response = await api.post("/products/create", data);
    return response.data.data;
  },

  // Update product
  updateProduct: async (
    productId: string,
    data: UpdateProductRequest
  ): Promise<Product> => {
    const response = await api.post(`/products/${productId}/update`, data);
    return response.data.data;
  },

  // Update product status
  updateProductStatus: async (
    productId: string,
    data: { is_active: boolean }
  ): Promise<Product> => {
    const response = await api.post(`/products/${productId}/status`, data);
    return response.data.data;
  },

  // Delete product (soft delete)
  deleteProduct: async (productId: string): Promise<void> => {
    await api.post(`/products/${productId}/delete`);
  },
};

export { productService as ProductService };
