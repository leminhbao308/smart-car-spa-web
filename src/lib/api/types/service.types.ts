// Service API Types
export interface ServiceProduct {
  serviceProductId?: string;
  serviceId?: string | null;
  productId?: string | null;
  productName?: string | null;
  productUrl?: string | null;
  productSku?: string | null;
  productBrand?: string | null;
  productModel?: string | null;
  unitOfMeasure?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  isRequired: boolean;
  isActive: boolean;
  audit?: any;
}

export interface Service {
  serviceId: string;
  serviceUrl: string;
  serviceName: string;
  categoryId: string;
  categoryName: string;
  description: string;
  standardDuration: number;
  requiredSkillLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  isPackage: boolean;
  basePrice: number;
  laborCost: number;
  productCost: number;
  serviceType: "MAINTENANCE" | "REPAIR" | "INSPECTION" | "CLEANING" | "CUSTOM";
  photoRequired: boolean;
  imageUrls: string;
  isFeatured: boolean;
  isActive: boolean;
  is_deleted?: boolean;
  serviceProducts: ServiceProduct[];
  audit?: any;
}

export interface ServiceResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    content: Service[];
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

// Create Service Request
export interface CreateServiceRequest {
  service_name: string;
  service_url: string;
  category_id: string;
  description: string;
  standard_duration: number;
  required_skill_level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  is_package: boolean;
  base_price: number;
  labor_cost: number;
  service_type: "MAINTENANCE" | "REPAIR" | "INSPECTION" | "CLEANING" | "CUSTOM";
  photo_required: boolean;
  image_urls: string;
  is_featured: boolean;
  service_products: {
    product_id: string;
    quantity: number;
    unit_price: number;
    notes?: string;
    is_required: boolean;
  }[];
}

// Update Service Request
export interface UpdateServiceRequest {
  service_name: string;
  service_url: string;
  category_id: string;
  description: string;
  standard_duration: number;
  required_skill_level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  is_package: boolean;
  base_price: number;
  labor_cost: number;
  service_type: "MAINTENANCE" | "REPAIR" | "INSPECTION" | "CLEANING" | "CUSTOM";
  photo_required: boolean;
  image_urls: string;
  is_featured: boolean;
  is_active: boolean;
  service_products: {
    service_product_id?: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    notes?: string;
    is_required: boolean;
    is_active: boolean;
  }[];
}

// Update Service Status Request
export interface UpdateServiceStatusRequest {
  is_active: boolean;
}

// Service Status Options
export const SERVICE_STATUS_OPTIONS = [
  { value: "BEGINNER", label: "Mới bắt đầu", color: "green" },
  { value: "INTERMEDIATE", label: "Trung bình", color: "blue" },
  { value: "ADVANCED", label: "Nâng cao", color: "orange" },
  { value: "EXPERT", label: "Chuyên gia", color: "red" },
];

export const SERVICE_TYPE_OPTIONS = [
  { value: "MAINTENANCE", label: "Bảo dưỡng", color: "blue" },
  { value: "REPAIR", label: "Sửa chữa", color: "red" },
  { value: "INSPECTION", label: "Kiểm tra", color: "green" },
  { value: "CLEANING", label: "Vệ sinh", color: "cyan" },
  { value: "CUSTOM", label: "Tùy chỉnh", color: "purple" },
];
