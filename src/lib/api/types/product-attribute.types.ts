/**
 * Product Attribute Management Types
 * Type definitions for product attribute-related API requests and responses
 */

export interface ProductAttributeInfoDto {
  id: string;
  attributeName: string;
  attributeCode: string;
  description?: string;
  dataType: AttributeDataType;
  unit?: string;
  isRequired: boolean;
  isActive: boolean;
  defaultValue?: string;
  validationRules?: Record<string, any>;
  options?: string[];
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export enum AttributeDataType {
  TEXT = "TEXT",
  NUMBER = "NUMBER",
  DECIMAL = "DECIMAL",
  BOOLEAN = "BOOLEAN",
  DATE = "DATE",
  DATETIME = "DATETIME",
  TIME = "TIME",
  SELECT = "SELECT",
  MULTI_SELECT = "MULTI_SELECT",
  TEXTAREA = "TEXTAREA",
  URL = "URL",
  EMAIL = "EMAIL",
  PHONE = "PHONE",
  COLOR = "COLOR",
  FILE = "FILE",
  IMAGE = "IMAGE"
}

export interface ProductAttributeFilterParam {
  page?: number;
  size?: number;
  attributeName?: string;
  attributeCode?: string;
  dataType?: AttributeDataType;
  isRequired?: boolean;
  isActive?: boolean;
  search?: string;
  sort?: string;
  direction?: "ASC" | "DESC";
}

export interface CreateProductAttributeRequest {
  attributeName: string;
  attributeCode: string;
  description?: string;
  dataType: AttributeDataType;
  unit?: string;
  isRequired?: boolean;
  isActive?: boolean;
  defaultValue?: string;
  validationRules?: Record<string, any>;
  options?: string[];
  sortOrder?: number;
}

export interface UpdateProductAttributeRequest {
  attributeName?: string;
  attributeCode?: string;
  description?: string;
  dataType?: AttributeDataType;
  unit?: string;
  isRequired?: boolean;
  isActive?: boolean;
  defaultValue?: string;
  validationRules?: Record<string, any>;
  options?: string[];
  sortOrder?: number;
}

export interface UpdateProductAttributeStatusRequest {
  isActive: boolean;
}

export interface ProductAttributeStatsDto {
  totalAttributes: number;
  activeAttributes: number;
  inactiveAttributes: number;
  requiredAttributes: number;
  optionalAttributes: number;
  attributesByDataType: Record<AttributeDataType, number>;
  mostUsedAttributes: {
    attributeId: string;
    attributeName: string;
    usageCount: number;
  }[];
  recentAttributes: number;
}

export interface ProductAttributeResponse {
  success: boolean;
  message: string;
  data: ProductAttributeInfoDto;
}

export interface ProductAttributeListResponse {
  success: boolean;
  message: string;
  data: ProductAttributeInfoDto[];
}

export interface ProductAttributeStatsResponse {
  success: boolean;
  message: string;
  data: ProductAttributeStatsDto;
}

export interface ProductAttributeValidationResponse {
  success: boolean;
  message: string;
  data: boolean;
}
