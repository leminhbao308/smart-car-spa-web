import api from "../axios";
import {
  ProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
  Product,
  ProductSearchParams,
  ProductTypeResponse,
  ProductType,
  CreateProductTypeRequest,
  UpdateProductTypeRequest,
  UpdateProductTypeStatusRequest,
  ProductTypeSearchParams,
  ProductAttributeResponse,
  ProductAttribute,
  CreateProductAttributeRequest,
  UpdateProductAttributeRequest,
  UpdateProductAttributeStatusRequest,
  ProductAttributeSearchParams,
  ProductMedia,
  AddProductImageRequest,
  UpdateProductImageRequest,
  ReorderProductImagesRequest,
} from "../types/product.types";

export const productService = {
  // Get all products with pagination and filters
  getAllProducts: async (
    params: ProductSearchParams = {}
  ): Promise<ProductResponse> => {
    const {
      page = 0,
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

    // Flatten filters into query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value.toString());
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

  // Get product by URL (for customer-facing pages)
  getProductByUrl: async (productUrl: string): Promise<Product> => {
    const response = await api.get(
      `/products/url/${encodeURIComponent(productUrl)}`
    );
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

  // ProductType Management
  // Get all product types with pagination and filters
  getAllProductTypes: async (
    params: ProductTypeSearchParams = {}
  ): Promise<ProductTypeResponse> => {
    const {
      page = 0,
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
          queryParams.append("is_deleted", "true");
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    const response = await api.get(
      `/product-types/get-all?${queryParams.toString()}`
    );
    return response.data;
  },

  // Get product type by ID
  getProductTypeById: async (productTypeId: string): Promise<ProductType> => {
    const response = await api.get(`/product-types/${productTypeId}`);
    return response.data.data;
  },

  // Create new product type
  createProductType: async (
    data: CreateProductTypeRequest
  ): Promise<ProductType> => {
    const response = await api.post("/product-types/create", data);
    return response.data.data;
  },

  // Update product type
  updateProductType: async (
    productTypeId: string,
    data: UpdateProductTypeRequest
  ): Promise<ProductType> => {
    const response = await api.post(
      `/product-types/${productTypeId}/update`,
      data
    );
    return response.data.data;
  },

  // Update product type status
  updateProductTypeStatus: async (
    productTypeId: string,
    data: UpdateProductTypeStatusRequest
  ): Promise<ProductType> => {
    const response = await api.post(
      `/product-types/${productTypeId}/status`,
      data
    );
    return response.data.data;
  },

  // Delete product type (soft delete)
  deleteProductType: async (productTypeId: string): Promise<void> => {
    await api.post(`/product-types/${productTypeId}/delete`);
  },

  // Get active product types
  getActiveProductTypes: async (): Promise<ProductType[]> => {
    const response = await api.get("/product-types/active");
    return response.data.data;
  },

  // ProductAttribute Management
  // Get all product attributes with pagination and filters
  getAllProductAttributes: async (
    params: ProductAttributeSearchParams = {}
  ): Promise<ProductAttributeResponse> => {
    const {
      page = 0,
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
          queryParams.append("is_deleted", "true");
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    const response = await api.get(
      `/product-attributes/get-all?${queryParams.toString()}`
    );
    return response.data;
  },

  // Get product attribute by ID
  getProductAttributeById: async (
    attributeId: string
  ): Promise<ProductAttribute> => {
    const response = await api.get(`/product-attributes/${attributeId}`);
    return response.data.data;
  },

  // Create new product attribute
  createProductAttribute: async (
    data: CreateProductAttributeRequest
  ): Promise<ProductAttribute> => {
    const response = await api.post("/product-attributes/create", data);
    return response.data.data;
  },

  // Update product attribute
  updateProductAttribute: async (
    attributeId: string,
    data: UpdateProductAttributeRequest
  ): Promise<ProductAttribute> => {
    const response = await api.post(
      `/product-attributes/${attributeId}/update`,
      data
    );
    return response.data.data;
  },

  // Update product attribute status
  updateProductAttributeStatus: async (
    attributeId: string,
    data: UpdateProductAttributeStatusRequest
  ): Promise<ProductAttribute> => {
    const response = await api.post(
      `/product-attributes/${attributeId}/status`,
      data
    );
    return response.data.data;
  },

  // Delete product attribute (soft delete)
  deleteProductAttribute: async (attributeId: string): Promise<void> => {
    await api.post(`/product-attributes/${attributeId}/delete`);
  },

  // Get active product attributes
  getActiveProductAttributes: async (): Promise<ProductAttribute[]> => {
    const response = await api.get("/product-attributes/active");
    return response.data.data;
  },

  // Get product attributes by data type
  getProductAttributesByDataType: async (
    dataType: string
  ): Promise<ProductAttribute[]> => {
    const response = await api.get(`/product-attributes/data-type/${dataType}`);
    return response.data.data;
  },

  // Get required product attributes
  getRequiredProductAttributes: async (): Promise<ProductAttribute[]> => {
    const response = await api.get("/product-attributes/required");
    return response.data.data;
  },

  // ==================== Product Image Management ====================

  // Get all images for a product
  getProductImages: async (productId: string): Promise<ProductMedia[]> => {
    const response = await api.get(`/products/${productId}/images`);
    return response.data.data;
  },

  // Upload product image file
  uploadProductImage: async (
    productId: string,
    file: File,
    altText?: string,
    isMain?: boolean
  ): Promise<ProductMedia> => {
    const formData = new FormData();
    formData.append("file", file);
    if (altText) {
      formData.append("alt_text", altText);
    }
    if (isMain !== undefined) {
      formData.append("is_main", isMain.toString());
    }

    const response = await api.post(
      `/products/${productId}/images/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data;
  },

  // Add new image to product (via URL)
  addProductImage: async (
    productId: string,
    data: AddProductImageRequest
  ): Promise<ProductMedia> => {
    const response = await api.post(`/products/${productId}/images/add`, data);
    return response.data.data;
  },

  // Update product image
  updateProductImage: async (
    productId: string,
    mediaId: string,
    data: UpdateProductImageRequest
  ): Promise<ProductMedia> => {
    const response = await api.post(
      `/products/${productId}/images/${mediaId}/update`,
      data
    );
    return response.data.data;
  },

  // Delete product image
  deleteProductImage: async (
    productId: string,
    mediaId: string
  ): Promise<void> => {
    await api.post(`/products/${productId}/images/${mediaId}/delete`);
  },

  // Set main product image
  setMainProductImage: async (
    productId: string,
    mediaId: string
  ): Promise<ProductMedia> => {
    const response = await api.post(
      `/products/${productId}/images/${mediaId}/set-main`
    );
    return response.data.data;
  },

  // Reorder product images
  reorderProductImages: async (
    productId: string,
    data: ReorderProductImagesRequest
  ): Promise<void> => {
    await api.post(`/products/${productId}/images/reorder`, data);
  },
};

export { productService as ProductService };
