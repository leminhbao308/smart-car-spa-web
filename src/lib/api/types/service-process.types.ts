/**
 * Service Process Management Types
 * Type definitions for service process-related API requests and responses
 */

export interface ServiceProcessInfoDto {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  isDefault: boolean;
  estimatedDuration?: number;
  steps?: ServiceProcessStepInfoDto[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ServiceProcessStepInfoDto {
  id: string;
  processId: string;
  stepName: string;
  stepCode: string;
  description?: string;
  stepOrder: number;
  estimatedDuration?: number;
  isRequired: boolean;
  isActive: boolean;
  products?: ServiceProcessStepProductInfoDto[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ServiceProcessStepProductInfoDto {
  id: string;
  stepId: string;
  productId: string;
  productName?: string;
  productCode?: string;
  quantity: number;
  unit?: string;
  isRequired: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
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
  name: string;
  code: string;
  description?: string;
  isActive?: boolean;
  estimatedDuration?: number;
  steps?: CreateServiceProcessStepRequest[];
}

export interface UpdateServiceProcessRequest {
  name?: string;
  code?: string;
  description?: string;
  isActive?: boolean;
  estimatedDuration?: number;
}

export interface CreateServiceProcessStepRequest {
  stepName: string;
  stepCode: string;
  description?: string;
  stepOrder: number;
  estimatedDuration?: number;
  isRequired?: boolean;
  isActive?: boolean;
  products?: CreateServiceProcessStepProductRequest[];
}

export interface UpdateServiceProcessStepRequest {
  stepName?: string;
  stepCode?: string;
  description?: string;
  stepOrder?: number;
  estimatedDuration?: number;
  isRequired?: boolean;
  isActive?: boolean;
}

export interface CreateServiceProcessStepProductRequest {
  productId: string;
  quantity: number;
  unit?: string;
  isRequired?: boolean;
  notes?: string;
}

export interface UpdateServiceProcessStepProductRequest {
  productId?: string;
  quantity?: number;
  unit?: string;
  isRequired?: boolean;
  notes?: string;
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
