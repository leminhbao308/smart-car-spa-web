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

export interface ServicePackage {
  packageId: string;
  packageUrl: string;
  packageName: string;
  categoryId: string;
  categoryName: string;
  description: string;
  totalDuration: number;
  packagePrice: number | null;
  serviceCost: number;
  productCost: number;
  packageType: "MAINTENANCE" | "REPAIR" | "INSPECTION" | "CLEANING" | "CUSTOM";
  imageUrls: string;
  isActive: boolean;
  is_deleted?: boolean;
  packageProducts: ServicePackageProduct[];
  packageServices: ServicePackageServiceItem[];
  audit?: any;
}

export interface ServicePackageResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: ServicePackage[];
}

// Legacy paginated response interface (for backward compatibility)
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
