// Service Package API Types
export interface ServicePackageProduct {
  servicePackageProductId?: string;
  packageId?: string;
  packageName?: string;
  productId: string;
  productName?: string;
  productCode?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  isRequired: boolean;
  isActive: boolean;
  audit?: any;
}

export interface ServicePackageServiceItem {
  service_package_service_id?: string;
  package_id?: string;
  service_id?: string | null;
  service_name?: string;
  service_url?: string;
  service_description?: string;
  service_standard_duration?: number;
  service_base_price?: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
  is_required: boolean;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

// Service Package API Types (snake_case from backend)
export interface ServicePackage {
  package_id: string;
  package_url: string;
  package_name: string;
  category_id: string;
  category_name: string;
  description: string;
  total_duration: number;
  package_price: number;
  service_cost: number;
  product_cost?: number;
  package_type: "MAINTENANCE" | "REPAIR" | "INSPECTION" | "CLEANING" | "CUSTOM";
  service_package_type_id: string;
  service_package_type_name?: string | null;
  is_active: boolean;
  is_deleted?: boolean;
  package_services: ServicePackageServiceItem[];
  service_process_id?: string;
  service_process_name?: string;
  service_process_code?: string;
  is_default_process?: boolean;
  service_count?: number;
  // Promotion fields (temporary hardcoded values)
  promotion_id?: string;
  promotion_name?: string;
  promotion_discount?: number;
  audit?: any;
}

// Frontend camelCase interface for internal use
export interface ServicePackageCamelCase {
  packageId: string;
  packageUrl: string;
  packageName: string;
  categoryId: string;
  categoryName: string;
  description: string;
  totalDuration: number;
  packagePrice: number;
  serviceCost: number;
  productCost?: number;
  packageType: "MAINTENANCE" | "REPAIR" | "INSPECTION" | "CLEANING" | "CUSTOM";
  servicePackageTypeId: string;
  servicePackageTypeName?: string | null;
  isActive: boolean;
  isDeleted?: boolean;
  packageServices: ServicePackageServiceItemCamelCase[];
  serviceProcessId?: string;
  serviceProcessName?: string;
  serviceProcessCode?: string;
  isDefaultProcess?: boolean;
  serviceCount?: number;
  // Promotion fields (temporary hardcoded values)
  promotionId?: string;
  promotionName?: string;
  promotionDiscount?: number;
  audit?: any;
}

// Service Package Service Item camelCase interface
export interface ServicePackageServiceItemCamelCase {
  servicePackageServiceId?: string;
  packageId?: string;
  serviceId?: string | null;
  serviceName?: string;
  serviceUrl?: string;
  serviceDescription?: string;
  serviceStandardDuration?: number;
  serviceBasePrice?: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  isRequired: boolean;
  isActive: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface ServicePackageResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: ServicePackage[];
}

// Paginated response interface matching backend structure
export interface ServicePackagePaginatedResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    content: ServicePackage[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
      };
      offset: number;
      paged: boolean;
      unpaged: boolean;
    };
    last: boolean;
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    numberOfElements: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    empty: boolean;
  };
}

// Utility functions for Service Package conversion
export const convertServicePackageFromSnakeCase = (snakeCase: ServicePackage): ServicePackageCamelCase => {
  return {
    packageId: snakeCase.package_id,
    packageUrl: snakeCase.package_url,
    packageName: snakeCase.package_name,
    categoryId: snakeCase.category_id,
    categoryName: snakeCase.category_name,
    description: snakeCase.description,
    totalDuration: snakeCase.total_duration,
    packagePrice: snakeCase.package_price,
    serviceCost: snakeCase.service_cost,
    productCost: snakeCase.product_cost,
    packageType: snakeCase.package_type,
    servicePackageTypeId: snakeCase.service_package_type_id,
    servicePackageTypeName: snakeCase.service_package_type_name,
    isActive: snakeCase.is_active,
    isDeleted: snakeCase.is_deleted,
    packageServices: snakeCase.package_services.map(convertServicePackageServiceItemFromSnakeCase),
    serviceProcessId: snakeCase.service_process_id,
    serviceProcessName: snakeCase.service_process_name,
    serviceProcessCode: snakeCase.service_process_code,
    isDefaultProcess: snakeCase.is_default_process,
    serviceCount: snakeCase.service_count,
    promotionId: snakeCase.promotion_id,
    promotionName: snakeCase.promotion_name,
    promotionDiscount: snakeCase.promotion_discount,
    audit: snakeCase.audit,
  };
};

export const convertServicePackageServiceItemFromSnakeCase = (snakeCase: ServicePackageServiceItem): ServicePackageServiceItemCamelCase => {
  return {
    servicePackageServiceId: snakeCase.service_package_service_id,
    packageId: snakeCase.package_id,
    serviceId: snakeCase.service_id,
    serviceName: snakeCase.service_name,
    serviceUrl: snakeCase.service_url,
    serviceDescription: snakeCase.service_description,
    serviceStandardDuration: snakeCase.service_standard_duration,
    serviceBasePrice: snakeCase.service_base_price,
    quantity: snakeCase.quantity,
    unitPrice: snakeCase.unit_price,
    totalPrice: snakeCase.total_price,
    notes: snakeCase.notes,
    isRequired: snakeCase.is_required,
    isActive: snakeCase.is_active,
    createdAt: snakeCase.created_at,
    updatedAt: snakeCase.updated_at,
  };
};

export const convertServicePackageToSnakeCase = (camelCase: Partial<ServicePackageCamelCase>): Partial<ServicePackage> => {
  const result: Partial<ServicePackage> = {};
  
  if (camelCase.packageId !== undefined) result.package_id = camelCase.packageId;
  if (camelCase.packageUrl !== undefined) result.package_url = camelCase.packageUrl;
  if (camelCase.packageName !== undefined) result.package_name = camelCase.packageName;
  if (camelCase.categoryId !== undefined) result.category_id = camelCase.categoryId;
  if (camelCase.categoryName !== undefined) result.category_name = camelCase.categoryName;
  if (camelCase.description !== undefined) result.description = camelCase.description;
  if (camelCase.totalDuration !== undefined) result.total_duration = camelCase.totalDuration;
  if (camelCase.packagePrice !== undefined) result.package_price = camelCase.packagePrice;
  if (camelCase.serviceCost !== undefined) result.service_cost = camelCase.serviceCost;
  if (camelCase.productCost !== undefined) result.product_cost = camelCase.productCost;
  if (camelCase.packageType !== undefined) result.package_type = camelCase.packageType;
  if (camelCase.servicePackageTypeId !== undefined) result.service_package_type_id = camelCase.servicePackageTypeId;
  if (camelCase.servicePackageTypeName !== undefined) result.service_package_type_name = camelCase.servicePackageTypeName;
  if (camelCase.isActive !== undefined) result.is_active = camelCase.isActive;
  if (camelCase.isDeleted !== undefined) result.is_deleted = camelCase.isDeleted;
  if (camelCase.serviceProcessId !== undefined) result.service_process_id = camelCase.serviceProcessId;
  if (camelCase.serviceProcessName !== undefined) result.service_process_name = camelCase.serviceProcessName;
  if (camelCase.serviceProcessCode !== undefined) result.service_process_code = camelCase.serviceProcessCode;
  if (camelCase.isDefaultProcess !== undefined) result.is_default_process = camelCase.isDefaultProcess;
  if (camelCase.serviceCount !== undefined) result.service_count = camelCase.serviceCount;
  if (camelCase.promotionId !== undefined) result.promotion_id = camelCase.promotionId;
  if (camelCase.promotionName !== undefined) result.promotion_name = camelCase.promotionName;
  if (camelCase.promotionDiscount !== undefined) result.promotion_discount = camelCase.promotionDiscount;
  if (camelCase.audit !== undefined) result.audit = camelCase.audit;
  
  return result;
};

// Create Service Package Request
export interface CreateServicePackageRequest {
  package_name: string;
  package_url: string;
  category_id: string;
  description: string;
  package_type: "MAINTENANCE" | "REPAIR" | "INSPECTION" | "CLEANING" | "CUSTOM";
  image_urls: string;
  package_products: {
    productId: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
    isRequired: boolean;
  }[];
  package_services: {
    serviceId: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
    isRequired: boolean;
  }[];
}

// Update Service Package Request
export interface UpdateServicePackageRequest {
  package_name: string;
  package_url: string;
  category_id: string;
  description: string;
  package_type: "MAINTENANCE" | "REPAIR" | "INSPECTION" | "CLEANING" | "CUSTOM";
  image_urls: string;
  package_products: {
    productId: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
    isRequired: boolean;
  }[];
  package_services: {
    serviceId: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
    isRequired: boolean;
  }[];
}

// Update Service Package Status Request
export interface UpdateServicePackageStatusRequest {
  is_active: boolean;
}

// Service Package Type Options
export const SERVICE_PACKAGE_TYPE_OPTIONS = [
  { value: "MAINTENANCE", label: "Bảo dưỡng", color: "blue" },
  { value: "REPAIR", label: "Sửa chữa", color: "red" },
  { value: "INSPECTION", label: "Kiểm tra", color: "green" },
  { value: "CLEANING", label: "Vệ sinh", color: "cyan" },
  { value: "CUSTOM", label: "Tùy chỉnh", color: "purple" },
];
