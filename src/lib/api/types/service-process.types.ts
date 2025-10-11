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
  estimatedDuration?: number;
  isDefault: boolean;
  isActive: boolean;
  stepCount: number;
  processSteps: ServiceProcessStepInfoDto[];
  audit: AuditDto;
}

export interface ServiceProcessStepInfoDto {
  id: string;
  processId: string;
  processName: string;
  stepOrder: number;
  name: string;
  description?: string;
  estimatedTime?: number;
  isRequired: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  totalProductCount: number;
  stepProducts: ServiceProcessStepProductInfoDto[];
  audit: AuditDto;
}

export interface ServiceProcessStepProductInfoDto {
  id: string;
  stepId: string;
  stepName: string;
  productId: string;
  productName: string;
  productCode: string;
  productSku: string;
  quantity: number;
  unit?: string;
  productCost: number;
  audit: AuditDto;
}

export interface ServiceProcessFilterParam {
  name?: string;
  code?: string;
  isActive?: boolean;
  isDefault?: boolean;
  search?: string;
  sort?: string;
  direction?: "ASC" | "DESC";
}

export interface CreateServiceProcessRequest {
  code: string;
  name: string;
  description?: string;
  estimatedDuration?: number;
  isDefault?: boolean;
  isActive?: boolean;
  processSteps?: CreateServiceProcessStepRequest[];
}

export interface UpdateServiceProcessRequest {
  code?: string;
  name?: string;
  description?: string;
  estimated_duration?: number;
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
  stepOrder: number;
  estimatedTime?: number;
  isRequired?: boolean;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  stepProducts?: CreateServiceProcessStepProductRequest[];
}

export interface UpdateServiceProcessStepRequest {
  name?: string;
  description?: string;
  stepOrder?: number;
  estimatedTime?: number;
  isRequired?: boolean;
  isFirstStep?: boolean;
  isLastStep?: boolean;
}

export interface CreateServiceProcessStepProductRequest {
  id?: string; // For existing products
  productId: string;
  productName?: string; // For display purposes
  quantity: number;
  unit?: string;
}

export interface UpdateServiceProcessStepProductRequest {
  productId?: string;
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
