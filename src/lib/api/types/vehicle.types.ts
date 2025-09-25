/**
 * Vehicle related types
 */

import { BaseEntity } from "./common.types";

// Vehicle Brand
export interface VehicleBrand extends BaseEntity {
  brand_id: string;
  brand_name: string;
  brand_code: string;
  description: string;
  brand_logo_url: string | null;
  is_active: boolean;
  is_deleted: boolean;
  created_by: string;
  modified_by: string;
}

// Pagination Info for Vehicle Brands
export interface VehicleBrandPaginationInfo {
  page: number;
  size: number;
  total_elements: number;
  total_pages: number;
  first: boolean;
  last: boolean;
  has_next: boolean;
  has_previous: boolean;
}

// Get All Vehicle Brands Request
export interface GetAllVehicleBrandsRequest {
  page?: number;
  size?: number;
  direction?: "ASC" | "DESC";
  sort?: string;
}

// Get All Vehicle Brands Response
export interface GetAllVehicleBrandsResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    content: VehicleBrand[];
  } & VehicleBrandPaginationInfo;
}

// Vehicle Brand Filter Options
export interface VehicleBrandFilterOptions {
  search?: string;
  isActive?: boolean;
  brandCode?: string;
}

// Vehicle Brand Sort Options
export interface VehicleBrandSortOptions {
  field: string;
  direction: "ASC" | "DESC";
}

// Vehicle Brand Management State
export interface VehicleBrandManagementState {
  brands: VehicleBrand[];
  pagination: VehicleBrandPaginationInfo | null;
  isLoading: boolean;
  error: string | null;
  filters: VehicleBrandFilterOptions;
  sort: VehicleBrandSortOptions;
}

// Vehicle Brand Statistics
export interface VehicleBrandStatistics {
  totalBrands: number;
  activeBrands: number;
  inactiveBrands: number;
  brandsWithLogo: number;
  brandsWithoutLogo: number;
}

// Vehicle Brand Dropdown Item
export interface VehicleBrandDropdownItem {
  brand_id: string;
  brand_name: string;
  brand_code: string;
}

// Vehicle Brand Dropdown Response
export interface VehicleBrandDropdownResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: VehicleBrandDropdownItem[];
}

// Single Vehicle Brand Response
export interface VehicleBrandResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: VehicleBrand;
}

// Create Vehicle Brand Request
export interface CreateVehicleBrandRequest {
  brand_name: string;
  brand_code: string;
  description: string;
  brand_logo_url?: string;
}

// Create Vehicle Brand Response
export interface CreateVehicleBrandResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: VehicleBrand;
}

// Update Vehicle Brand Request
export interface UpdateVehicleBrandRequest {
  brand_name: string;
  brand_code: string;
  description: string;
  brand_logo_url?: string;
}

// Update Vehicle Brand Response
export interface UpdateVehicleBrandResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: VehicleBrand;
}

// Delete Vehicle Brand Response
export interface DeleteVehicleBrandResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: null;
}