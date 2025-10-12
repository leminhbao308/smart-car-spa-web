/**
 * Service Process Management Types
 * Type definitions for service process-related API requests and responses
 * Updated to match backend DTOs
 */

import { AuditDto } from "./common.types";

export interface ServiceProcessInfoDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  estimated_duration?: number;
  is_default: boolean;
  is_active: boolean;
  step_count: number;
  process_steps: ServiceProcessStepInfoDto[];
  audit: AuditDto;
}

export interface ServiceProcessStepInfoDto {
  id: string;
  process_id: string;
  process_name: string;
  step_order: number;
  name: string;
  description?: string;
  estimated_time?: number;
  is_required: boolean;
  is_first_step: boolean | null;
  is_last_step: boolean | null;
  total_product_count: number;
  step_products: ServiceProcessStepProductInfoDto[];
  audit: AuditDto;
}

export interface ServiceProcessStepProductInfoDto {
  id: string;
  step_id: string;
  step_name: string;
  product_id: string;
  product_name: string;
  product_code: string;
  product_sku: string;
  quantity: number;
  unit?: string;
  product_cost: number;
  audit: AuditDto;
}

export interface ServiceProcessFilterParam {
  name?: string;
  code?: string;
  is_active?: boolean;
  is_default?: boolean;
  search?: string;
  sort?: string;
  direction?: "ASC" | "DESC";
}

export interface CreateServiceProcessRequest {
  code: string;
  name: string;
  description?: string;
  estimated_duration?: number; // Backend now uses snake_case
  is_default?: boolean;
  is_active?: boolean;
  process_steps?: CreateServiceProcessStepRequest[];
}

export interface UpdateServiceProcessRequest {
  code?: string;
  name?: string;
  description?: string;
  estimated_duration?: number; // Backend now uses snake_case
  is_default?: boolean;
  is_active?: boolean;
  process_steps?: UpdateServiceProcessStepRequest[];
}

export interface UpdateServiceProcessStepRequest {
  id?: string; // For existing steps
  step_order?: number;
  name?: string;
  description?: string;
  estimated_time?: number;
  is_required?: boolean;
  is_active?: boolean; // Add is_active field for AuditEntity
  step_products?: UpdateServiceProcessStepProductRequest[];
}

export interface UpdateServiceProcessStepProductRequest {
  id?: string; // For existing products
  product_id?: string; // Backend expects product_id field name
  quantity?: number;
  unit?: string;
}

export interface CreateServiceProcessStepRequest {
  id?: string; // For existing steps
  name: string;
  description?: string;
  step_order: number;
  estimated_time?: number;
  is_required?: boolean;
  is_first_step?: boolean;
  is_last_step?: boolean;
  step_products?: CreateServiceProcessStepProductRequest[];
}

export interface UpdateServiceProcessStepRequest {
  name?: string;
  description?: string;
  step_order?: number;
  estimated_time?: number;
  is_required?: boolean;
  is_first_step?: boolean;
  is_last_step?: boolean;
}

export interface CreateServiceProcessStepProductRequest {
  id?: string; // For existing products
  product_id: string; // Backend expects product_id (snake_case)
  product_name?: string; // For display purposes
  quantity: number; // Backend expects BigDecimal
  unit?: string;
}

export interface UpdateServiceProcessStepProductRequest {
  product_id?: string;
  quantity?: number;
  unit?: string;
}

export interface ServiceProcessResponse {
  success: boolean;
  message: string;
  data: ServiceProcessInfoDto;
}

export interface ServiceProcessListResponse {
  success: boolean;
  message: string;
  data: ServiceProcessInfoDto[];
}

export interface ServiceProcessStepResponse {
  success: boolean;
  message: string;
  data: ServiceProcessStepInfoDto;
}

export interface ServiceProcessStepListResponse {
  success: boolean;
  message: string;
  data: ServiceProcessStepInfoDto[];
}

export interface ServiceProcessStepProductResponse {
  success: boolean;
  message: string;
  data: ServiceProcessStepProductInfoDto;
}

export interface ServiceProcessStepProductListResponse {
  success: boolean;
  message: string;
  data: ServiceProcessStepProductInfoDto[];
}
