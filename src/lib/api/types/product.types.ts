/**
 * Product API Types
 */

import { BaseAuditEntity, BasePaginationResponse, ApiResponse } from './common.types';

export interface ProductSpecifications {
  [key: string]: string;
}

export interface ProductDimensions {
  width?: string;
  height?: string;
  length?: string;
  weight?: string;
  diameter?: string;
  rim_size?: string;
  [key: string]: string | undefined;
}

export interface ProductImageUrls {
  main?: string;
  thumbnail?: string;
  detail?: string;
  label?: string;
  package?: string;
  tread?: string;
  sidewall?: string;
  installation?: string;
  [key: string]: string | undefined;
}

export interface ProductTags {
  [key: string]: string;
}

export interface Product extends BaseAuditEntity {
  productId: string;
  productUrl: string;
  productName: string;
  categoryId: string;
  categoryName: string;
  description: string;
  unitOfMeasure: string;
  brand: string;
  model: string;
  specifications: ProductSpecifications;
  sku: string;
  barcode: string;
  costPrice: number;
  sellingPrice: number;
  minStockLevel: number;
  maxStockLevel: number;
  weight: number;
  dimensions: ProductDimensions;
  warrantyPeriodMonths: number;
  imageUrls: ProductImageUrls;
  tags: ProductTags;
  supplierId: string;
  isFeatured: boolean;
}

export interface ProductPaginationData extends BasePaginationResponse {
  content: Product[];
}

export type ProductResponse = ApiResponse<ProductPaginationData>;

// Base product data for API requests (snake_case)
export interface BaseProductData {
  product_name: string;
  product_url: string;
  category_id: string;
  description: string;
  unit_of_measure: string;
  brand: string;
  model: string;
  specifications: { [key: string]: string };
  sku: string;
  barcode: string;
  cost_price: number;
  selling_price: number;
  min_stock_level: number;
  max_stock_level: number;
  weight: number;
  dimensions: { [key: string]: string };
  warranty_period_months: number;
  image_urls: { [key: string]: string };
  tags: { [key: string]: string };
  supplier_id: string;
  is_featured: boolean;
}

export interface CreateProductRequest extends BaseProductData {
  is_active?: boolean;
}

export interface UpdateProductRequest {
  product_name: string;
  product_url: string;
  category_id: string;
  description: string;
  unit_of_measure: string;
  brand: string;
  model: string;
  specifications: { [key: string]: string };
  sku: string;
  barcode: string;
  cost_price: number;
  selling_price: number;
  min_stock_level: number;
  max_stock_level: number;
  weight: number;
  dimensions: { [key: string]: string };
  warranty_period_months: number;
  image_urls: { [key: string]: string };
  tags: { [key: string]: string };
  supplier_id: string;
  is_featured: boolean;
  is_active: boolean;
}


// Form data interface for UI (camelCase)
export interface ProductFormData {
  productName: string;
  productUrl: string;
  categoryId: string;
  description: string;
  unitOfMeasure: string;
  brand: string;
  model: string;
  specifications: { [key: string]: string };
  sku: string;
  barcode: string;
  costPrice: number;
  sellingPrice: number;
  minStockLevel: number;
  maxStockLevel: number;
  weight: number;
  dimensions: { [key: string]: string };
  warrantyPeriodMonths: number;
  imageUrls: { [key: string]: string };
  tags: { [key: string]: string };
  supplierId: string;
  isFeatured: boolean;
  is_active: boolean;
}

// For UI components
export interface ProductTableItem extends Product {
  key: string;
}

// Filter and search types
export interface ProductFilters {
  categoryId?: string;
  brand?: string;
  isTrackable?: boolean;
  isConsumable?: boolean;
  isFeatured?: boolean;
  is_active?: boolean | "deleted";
  searchText?: string;
}

export interface ProductSearchParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
  filters?: ProductFilters;
}
