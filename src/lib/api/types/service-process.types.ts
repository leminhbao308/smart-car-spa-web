/**
 * Service Process Types
 * Type definitions for service process management
 */

export interface ServiceProcessInfoDto {
  id: string;
  name: string;
  description?: string;
  code: string;
  isDefault: boolean;
  estimatedDuration: number;
  branchId?: string;
  branchName?: string;
  processSteps: ServiceProcessStepInfoDto[];
  createdDate: string;
  modifiedDate: string;
  createdBy: string;
  modifiedBy: string;
  isActive: boolean;
  isDeleted: boolean;
}

export interface ServiceProcessStepInfoDto {
  id: string;
  processId: string;
  stepOrder: number;
  name: string;
  description?: string;
  estimatedTime: number;
  isRequired: boolean;
  stepProducts: ServiceProcessStepProductInfoDto[];
  createdDate: string;
  modifiedDate: string;
  createdBy: string;
  modifiedBy: string;
  isActive: boolean;
  isDeleted: boolean;
}

export interface ServiceProcessStepProductInfoDto {
  id: string;
  serviceProcessStepId: string;
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitOfMeasure: string;
  notes?: string;
  createdDate: string;
  modifiedDate: string;
  createdBy: string;
  modifiedBy: string;
  isActive: boolean;
  isDeleted: boolean;
}

export interface ServiceProcessFilterParam {
  page?: number;
  size?: number;
  search?: string;
  branchId?: string;
  isActive?: boolean;
  isDefault?: boolean;
}

export interface CreateServiceProcessRequest {
  name: string;
  description?: string;
  code: string;
  isDefault?: boolean;
  estimatedDuration: number;
  branchId?: string;
  processSteps: CreateServiceProcessStepRequest[];
}

export interface CreateServiceProcessStepRequest {
  stepOrder: number;
  name: string;
  description?: string;
  estimatedTime: number;
  isRequired?: boolean;
  stepProducts?: CreateServiceProcessStepProductRequest[];
}

export interface CreateServiceProcessStepProductRequest {
  productId: string;
  quantity: number;
  notes?: string;
}

export interface UpdateServiceProcessRequest {
  name?: string;
  description?: string;
  code?: string;
  isDefault?: boolean;
  estimatedDuration?: number;
  branchId?: string;
  processSteps?: UpdateServiceProcessStepRequest[];
}

export interface UpdateServiceProcessStepRequest {
  id?: string;
  stepOrder?: number;
  name?: string;
  description?: string;
  estimatedTime?: number;
  isRequired?: boolean;
  stepProducts?: UpdateServiceProcessStepProductRequest[];
}

export interface UpdateServiceProcessStepProductRequest {
  id?: string;
  productId?: string;
  quantity?: number;
  notes?: string;
}