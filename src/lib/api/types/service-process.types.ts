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
  estimatedDuration?: number;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface CreateServiceProcessStepRequest {
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
  productId: string;
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
