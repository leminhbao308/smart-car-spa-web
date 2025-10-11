import { BaseAuditEntity } from "./common.types";

// Service Bay Types
export interface ServiceBay extends BaseAuditEntity {
  bay_id: string;
  bay_name: string;
  bay_code: string;
  bay_type: BayType;
  description: string;
  capacity: number;
  status: BayStatus;
  display_order: number;
  notes?: string;
  
  // Branch information
  branch_id: string;
  branch_name: string;
  branch_code: string;
  
  // Statistics
  total_bookings: number;
  active_bookings: number;
  is_available: boolean;
  is_maintenance: boolean;
  is_closed: boolean;
  is_wash_bay: boolean;
  is_repair_bay: boolean;
  is_lift_bay: boolean;
}

// Enums
export enum BayType {
  WASH_BAY = "WASH_BAY",
  REPAIR_BAY = "REPAIR_BAY", 
  LIFT_BAY = "LIFT_BAY",
  INSPECTION_BAY = "INSPECTION_BAY",
  PAINT_BAY = "PAINT_BAY",
  DETAILING_BAY = "DETAILING_BAY",
  TIRE_BAY = "TIRE_BAY",
  GENERAL_BAY = "GENERAL_BAY"
}

export enum BayStatus {
  ACTIVE = "ACTIVE",
  MAINTENANCE = "MAINTENANCE",
  CLOSED = "CLOSED",
  INACTIVE = "INACTIVE"
}

// API Request/Response Types
export interface ServiceBayResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    content: ServiceBay[];
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

export interface CreateServiceBayRequest {
  branch_id: string;
  bay_name: string;
  bay_code?: string;
  bay_type: BayType;
  description?: string;
  capacity?: number;
  display_order?: number;
  notes?: string;
}

export interface UpdateServiceBayRequest {
  bay_name: string;
  bay_code?: string;
  bay_type: BayType;
  description?: string;
  capacity: number;
  display_order?: number;
  notes?: string;
}

export interface ServiceBayFilterParam {
  page?: number;
  size?: number;
  sort?: string;
  direction?: "ASC" | "DESC";
  branch_id?: string;
  bay_type?: BayType;
  status?: BayStatus;
  search?: string;
  isActive?: boolean;
}

export interface BayAvailabilityRequest {
  start_time: string;
  end_time: string;
}

// UI Helper Types
export interface ServiceBayDropdownItem {
  bay_id: string;
  bay_name: string;
  bay_code: string;
  bay_type: BayType;
  branch_id: string;
  branch_name: string;
  is_available: boolean;
}

// Constants for UI
export const BAY_TYPE_OPTIONS = [
  { value: BayType.WASH_BAY, label: "Khu vực rửa xe", color: "#1890ff", icon: "🚿" },
  { value: BayType.REPAIR_BAY, label: "Khu vực sửa chữa", color: "#52c41a", icon: "🔧" },
  { value: BayType.LIFT_BAY, label: "Khu vực nâng xe", color: "#722ed1", icon: "⬆️" },
  { value: BayType.INSPECTION_BAY, label: "Khu vực kiểm tra", color: "#fa8c16", icon: "🔍" },
  { value: BayType.PAINT_BAY, label: "Khu vực sơn xe", color: "#eb2f96", icon: "🎨" },
  { value: BayType.DETAILING_BAY, label: "Khu vực chăm sóc chi tiết", color: "#13c2c2", icon: "✨" },
  { value: BayType.TIRE_BAY, label: "Khu vực thay lốp", color: "#faad14", icon: "🛞" },
  { value: BayType.GENERAL_BAY, label: "Khu vực tổng hợp", color: "#8c8c8c", icon: "🔧" }
];

export const BAY_STATUS_OPTIONS = [
  { value: BayStatus.ACTIVE, label: "Hoạt động", color: "success" },
  { value: BayStatus.MAINTENANCE, label: "Bảo trì", color: "warning" },
  { value: BayStatus.CLOSED, label: "Tạm đóng", color: "error" },
  { value: BayStatus.INACTIVE, label: "Không hoạt động", color: "default" }
];

// Statistics Types
export interface ServiceBayStatistics {
  bay_id: string;
  bay_name: string;
  total_bookings: number;
  completed_bookings: number;
  active_bookings: number;
  utilization_rate: number;
  average_duration: number;
  revenue: number;
  last_booking_date?: string;
  next_booking_date?: string;
}
