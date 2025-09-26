export interface Branch {
  created_date: string;
  modified_date: string;
  created_by: string;
  modified_by: string;
  is_active: boolean;
  is_deleted: boolean;
  branch_id: string;
  branch_name: string;
  branch_code: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  operating_hours: string; // JSON string
  service_capacity: number;
  current_workload: number;
  latitude: number;
  longitude: number;
  area_sqm: number;
  parking_spaces: number;
  established_date: string;
  total_employees: number;
  total_customers: number;
  monthly_revenue: number;
  operating_status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
  branch_type: "STANDARD" | "PREMIUM" | "VIP";
  contact_info: string; // JSON string
  facilities: string; // JSON string
  services_offered: string; // JSON string
  center_id: string;
  center_name: string;
  center_code: string;
  manager_id: string;
  manager_name: string;
  manager_email: string;
  manager_assigned_at: string;
  manager_assigned_by: string;
  utilization_rate: number;
  is_at_capacity: boolean;
}

export interface BranchListResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    content: Branch[];
    page: number;
    size: number;
    total_elements: number;
    total_pages: number;
    first: boolean;
    last: boolean;
    has_next: boolean | null;
    has_previous: boolean | null;
  };
}

export interface BranchResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: Branch;
}

export interface CreateBranchRequest {
  branch_name: string;
  branch_code: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  operating_hours: string;
  service_capacity: number;
  latitude: number;
  longitude: number;
  area_sqm: number;
  parking_spaces: number;
  established_date: string;
  center_id: string;
  manager_id: string;
  operating_status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
  branch_type: "STANDARD" | "PREMIUM" | "VIP";
  contact_info: string;
  facilities: string;
  services_offered: string;
}

export interface UpdateBranchRequest {
  branch_name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  operating_hours: string;
  service_capacity: number;
  current_workload: number;
  latitude: number;
  longitude: number;
  area_sqm: number;
  parking_spaces: number;
  operating_status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
  branch_type: "STANDARD" | "PREMIUM" | "VIP";
  contact_info: string;
  facilities: string;
  services_offered: string;
  is_active: boolean;
}

export interface DeleteBranchResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: null;
}

// Parsed JSON types for better type safety
export interface OperatingHours {
  monday: { open: string; close: string };
  tuesday: { open: string; close: string };
  wednesday: { open: string; close: string };
  thursday: { open: string; close: string };
  friday: { open: string; close: string };
  saturday: { open: string; close: string };
  sunday: { open: string; close: string };
}

export interface BranchContactInfo {
  emergency_phone?: string;
  support_email?: string;
  manager_phone?: string;
  vip_line?: string;
}

export interface BranchDisplay extends Omit<Branch, 'operating_hours' | 'contact_info' | 'facilities' | 'services_offered'> {
  operating_hours: OperatingHours;
  contact_info: BranchContactInfo;
  facilities: string[];
  services_offered: string[];
}
