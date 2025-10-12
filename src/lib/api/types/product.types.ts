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

export interface ProductAttributeValue {
  productId: string;
  attributeId: string;
  attributeName: string;
  attributeCode: string;
  unit?: string;
  dataType: string;
  valueText?: string;
  valueNumber?: number;
  displayValue?: string;
}

export interface Product extends BaseAuditEntity {
  productId: string;
  productUrl: string;
  productName: string;
  productTypeId: string;
  productTypeName: string;
  description: string;
  unitOfMeasure: string;
  brand: string;
  model: string;
  sku: string;
  barcode: string;
  peakPrice: number;
  supplierId: string;
  isFeatured: boolean;
  isActive: boolean;
  attributeValues?: ProductAttributeValue[];
}

export interface ProductPaginationData extends BasePaginationResponse {
  content: Product[];
}

export type ProductResponse = ApiResponse<ProductPaginationData>;

// Base product data for API requests (snake_case)
export interface BaseProductData {
  product_name: string;
  product_url: string;
  product_type_id?: string;
  description?: string;
  unit_of_measure: string;
  brand?: string;
  model?: string;
  sku?: string;
  barcode?: string;
  supplier_id?: string;
  is_featured?: boolean;
  attribute_values?: ProductAttributeValueRequest[];
}

export interface ProductAttributeValueRequest {
  attribute_id: string;
  value_text?: string;
  value_number?: number;
}

export interface CreateProductRequest extends BaseProductData {
  is_active?: boolean;
}

export interface UpdateProductRequest extends BaseProductData {
  is_active?: boolean;
}


// Form data interface for UI (camelCase)
export interface ProductFormData {
  productName: string;
  productUrl: string;
  productTypeId?: string;
  description?: string;
  unitOfMeasure: string;
  brand?: string;
  model?: string;
  sku?: string;
  barcode?: string;
  supplierId?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  attributeValues?: ProductAttributeValue[];
}

// For UI components
export interface ProductTableItem extends Product {
  key: string;
}

// Filter and search types
export interface ProductFilters {
  productTypeId?: string;
  brand?: string;
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

// ProductType Types
export interface ProductType {
  product_type_id: string;
  product_type_name: string;
  product_type_code: string;
  description?: string;
  category_id: string;
  category_name: string;
  is_active: boolean;
  created_date: string;
  modified_date: string;
  created_by: string;
  modified_by: string;
  is_deleted?: boolean;
  version?: number;
}

export interface ProductTypePaginationData extends BasePaginationResponse {
  content: ProductType[];
}

export type ProductTypeResponse = ApiResponse<ProductTypePaginationData>;

export interface CreateProductTypeRequest {
  product_type_name: string;
  product_type_code: string;
  description?: string;
  category_id: string;
}

export interface UpdateProductTypeRequest {
  product_type_name?: string;
  product_type_code?: string;
  description?: string;
  category_id?: string;
}

export interface UpdateProductTypeStatusRequest {
  is_active: boolean;
}

export interface ProductTypeFilters {
  categoryId?: string;
  is_active?: boolean | "deleted";
  searchText?: string;
}

export interface ProductTypeSearchParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
  filters?: ProductTypeFilters;
}

// ProductAttribute Types
export interface ProductAttribute {
  attribute_id: string;
  attribute_name: string;
  attribute_code: string;
  unit?: string | null;
  is_required: boolean;
  data_type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'DECIMAL' | 'INTEGER' | 'TEXT';
  display_name?: string;
  is_active: boolean;
  created_date: string;
  modified_date: string;
  created_by: string;
  modified_by: string;
  is_deleted?: boolean;
  version?: number;
}

export interface ProductAttributePaginationData extends BasePaginationResponse {
  content: ProductAttribute[];
}

export type ProductAttributeResponse = ApiResponse<ProductAttributePaginationData>;

export interface CreateProductAttributeRequest {
  attribute_name: string;
  attribute_code: string;
  unit?: string;
  is_required?: boolean;
  data_type?: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'DECIMAL' | 'INTEGER' | 'TEXT';
}

export interface UpdateProductAttributeRequest {
  attribute_name?: string;
  attribute_code?: string;
  unit?: string;
  is_required?: boolean;
  data_type?: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'DECIMAL' | 'INTEGER' | 'TEXT';
}

export interface UpdateProductAttributeStatusRequest {
  is_active: boolean;
}

export interface ProductAttributeFilters {
  dataType?: string;
  isRequired?: boolean;
  is_active?: boolean | "deleted";
  searchText?: string;
}

export interface ProductAttributeSearchParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
  filters?: ProductAttributeFilters;
}
