// Audit DTO interface to match backend AuditDto
export interface AuditDto {
  created_date: string;
  modified_date: string;
  created_by: string;
  modified_by: string;
  is_active: boolean;
  is_deleted: boolean;
}

// Service API Types - Updated to match backend ServiceInfoDto with audit object
export interface Service {
  service_id: string;
  service_url: string;
  service_name: string;
  category_id: string;
  category_name: string;
  description: string;
  standard_duration: number;
  required_skill_level: SkillLevel;
  is_package: boolean;
  base_price: number; // Base price for the service
  labor_cost: number; // Tiền công lao động
  service_type_id: string;
  service_type_name: string;
  is_featured: boolean;
  is_active: boolean;
  service_process_id: string;
  service_process_name: string;
  service_process_code: string;
  is_default_process: boolean;
  estimated_duration: number;
  branch_id: string;
  branch_name: string;
  audit: AuditDto; // Audit fields are now in a separate object
}

// Enums
export enum SkillLevel {
  BEGINNER = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE", 
  ADVANCED = "ADVANCED",
  EXPERT = "EXPERT"
}

// API Request/Response Types - Updated to match backend response structure
export interface ServiceResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: Service[] | ServicePageResponse;
}

// For paginated responses
export interface ServicePageResponse {
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
}

// Create Service Request
export interface CreateServiceRequest {
  service_name: string;
  service_url: string;
  category_id?: string;
  description?: string;
  standard_duration?: number;
  required_skill_level?: SkillLevel;
  is_package?: boolean;
  base_price?: number;
  labor_cost?: number;
  service_type_id?: string;
  is_featured?: boolean;
  service_process_id?: string;
  is_default_process?: boolean;
  branch_id?: string;
}

// Update Service Request
export interface UpdateServiceRequest {
  service_name?: string;
  service_url?: string;
  category_id?: string;
  description?: string;
  standard_duration?: number;
  required_skill_level?: SkillLevel;
  is_package?: boolean;
  base_price?: number;
  labor_cost?: number;
  service_type_id?: string;
  is_featured?: boolean;
  is_active?: boolean;
  service_process_id?: string;
  is_default_process?: boolean;
  branch_id?: string;
}

// Update Service Status Request
export interface UpdateServiceStatusRequest {
  is_active: boolean;
}

// Service Filter Parameters
export interface ServiceFilterParam {
  page?: number;
  size?: number;
  sort?: string;
  direction?: "ASC" | "DESC";
  category_id?: string;
  service_type_id?: string;
  skill_level?: SkillLevel;
  is_package?: boolean;
  is_featured?: boolean;
  is_active?: boolean;
  search?: string;
}

// Service Status Options
export const SERVICE_STATUS_OPTIONS = [
  { value: SkillLevel.BEGINNER, label: "Mới bắt đầu", color: "green" },
  { value: SkillLevel.INTERMEDIATE, label: "Trung bình", color: "blue" },
  { value: SkillLevel.ADVANCED, label: "Nâng cao", color: "orange" },
  { value: SkillLevel.EXPERT, label: "Chuyên gia", color: "red" },
];

// Service Type Options (for backward compatibility)
export const SERVICE_TYPE_OPTIONS = [
  { value: "MAINTENANCE", label: "Bảo dưỡng", color: "blue" },
  { value: "REPAIR", label: "Sửa chữa", color: "red" },
  { value: "INSPECTION", label: "Kiểm tra", color: "green" },
  { value: "CLEANING", label: "Vệ sinh", color: "cyan" },
  { value: "CUSTOM", label: "Tùy chỉnh", color: "purple" },
];

// Service Pricing Types - Updated to match backend DTOs
export interface ProcessStepPricingDto {
  step_id: string;
  step_name: string;
  step_order: number;
  estimated_time: number;
  product_cost: number;
  products: ProductPricingDto[];
}

export interface ProductPricingDto {
  product_id: string;
  product_name: string;
  sku: string;
  product_type: string;
  brand: string;
  model: string;
  quantity: number;
  unit: string;
  unit_price: number; // Giá đơn vị từ PriceBook
  total_price: number; // unitPrice * quantity
  policy_type: "FIXED" | "MARKUP_ON_PEAK";
  price_source: "PRICE_BOOK" | "DEFAULT" | "OVERRIDE";
  price_book_id?: string;
  price_book_item_id?: string;
  price_book_name?: string;
  price_calculated_at: string;
}

export interface ServicePricingDto {
  service_id: string;
  service_name: string;
  base_price: number;
  labor_cost: number;
  product_cost: number;
  total_cost: number;
  markup: number;
  final_price: number;
  price_book_id?: string;
  price_book_name?: string;
  process_steps: ProcessStepPricingDto[];
}

export interface ServicePricingInfoDto {
  service_id: string;
  service_name: string;
  base_price: number;
  labor_cost: number;
  product_cost: number;
  total_cost: number;
  markup: number;
  final_price: number;
  last_updated: string;
}

export interface UpdateLaborCostRequest {
  labor_cost: number;
}