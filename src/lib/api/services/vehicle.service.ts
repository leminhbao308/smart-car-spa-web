/**
 * Vehicle Management Service
 * Handles all vehicle-related API calls
 */

import apiClient from "../axios";
import {
  GetAllVehicleBrandsRequest,
  GetAllVehicleBrandsResponse,
  VehicleBrand,
  VehicleBrandStatistics,
  VehicleBrandDropdownResponse,
  CreateVehicleBrandRequest,
  UpdateVehicleBrandRequest,
} from "../types";

export class VehicleService {
  /**
   * Get all vehicle brands with pagination and filtering
   */
  static async getAllVehicleBrands(
    params: GetAllVehicleBrandsRequest = {}
  ): Promise<GetAllVehicleBrandsResponse> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();

      if (params.page !== undefined) {
        queryParams.append("page", params.page.toString());
      }
      if (params.size !== undefined) {
        queryParams.append("size", params.size.toString());
      }
      if (params.direction) {
        queryParams.append("direction", params.direction);
      }
      if (params.sort) {
        queryParams.append("sort", params.sort);
      }

      const url = `/vehicles/brands/get-all?${queryParams.toString()}`;

      const response = await apiClient.get(url);
      console.log("API Response received:", response);

      if (response.data.success && response.data.data) {
        return response.data;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch vehicle brands"
        );
      }
    } catch (error: any) {
      console.log("Get all vehicle brands error details:", error);
      throw error;
    }
  }

  /**
   * Get vehicle brand by ID
   */
  static async getVehicleBrandById(brandId: string): Promise<VehicleBrand> {
    try {
      const response = await apiClient.get(`/vehicles/brands/${brandId}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch vehicle brand"
        );
      }
    } catch (error) {
      console.error("Get vehicle brand by ID error:", error);
      throw error;
    }
  }

  /**
   * Get vehicle brands for dropdown
   */
  static async getVehicleBrandsForDropdown(): Promise<VehicleBrandDropdownResponse> {
    try {
      const response = await apiClient.get("/vehicles/brands/dropdown");
      console.log("Vehicle brands dropdown API response:", response);

      if (response.data.success && response.data.data) {
        return response.data;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch vehicle brands for dropdown"
        );
      }
    } catch (error) {
      console.error("Get vehicle brands dropdown error:", error);
      throw error;
    }
  }

  /**
   * Create new vehicle brand
   */
  static async createVehicleBrand(
    brandData: CreateVehicleBrandRequest
  ): Promise<VehicleBrand> {
    try {
      console.log("Creating vehicle brand with data:", brandData);

      const response = await apiClient.post(
        "/vehicles/brands/create",
        brandData
      );
      console.log("Create vehicle brand API response:", response);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Failed to create vehicle brand"
        );
      }
    } catch (error) {
      console.error("Create vehicle brand error:", error);
      throw error;
    }
  }

  /**
   * Update vehicle brand
   */
  static async updateVehicleBrand(
    brandId: string,
    brandData: UpdateVehicleBrandRequest
  ): Promise<VehicleBrand> {
    try {
      console.log("Updating vehicle brand with data:", brandData);

      const response = await apiClient.post(
        `/vehicles/brands/${brandId}/update`,
        brandData
      );
      console.log("Update vehicle brand API response:", response);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Failed to update vehicle brand"
        );
      }
    } catch (error) {
      console.error("Update vehicle brand error:", error);
      throw error;
    }
  }

  /**
   * Update vehicle brand status (active/inactive)
   */
  static async updateVehicleBrandStatus(
    brandId: string,
    isActive: boolean
  ): Promise<void> {
    try {
      const response = await apiClient.patch(
        `/vehicles/brands/${brandId}/status`,
        {
          is_active: isActive,
        }
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to update vehicle brand status"
        );
      }
    } catch (error) {
      console.error("Update vehicle brand status error:", error);
      throw error;
    }
  }

  /**
   * Delete vehicle brand
   */
  static async deleteVehicleBrand(brandId: string): Promise<void> {
    try {
      console.log("Deleting vehicle brand with ID:", brandId);

      const response = await apiClient.post(
        `/vehicles/brands/${brandId}/delete`
      );
      console.log("Delete vehicle brand API response:", response);

      if (response.data.success) {
        return;
      } else {
        throw new Error(
          response.data.message || "Failed to delete vehicle brand"
        );
      }
    } catch (error) {
      console.error("Delete vehicle brand error:", error);
      throw error;
    }
  }

  /**
   * Get vehicle brand statistics
   */
  static async getVehicleBrandStatistics(): Promise<VehicleBrandStatistics> {
    try {
      const response = await apiClient.get("/vehicles/brands/statistics");

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch vehicle brand statistics"
        );
      }
    } catch (error) {
      console.error("Get vehicle brand statistics error:", error);
      throw error;
    }
  }

  /**
   * Search vehicle brands
   */
  static async searchVehicleBrands(
    query: string,
    params: GetAllVehicleBrandsRequest = {}
  ): Promise<GetAllVehicleBrandsResponse> {
    try {
      const queryParams = new URLSearchParams();

      queryParams.append("search", query);

      if (params.page !== undefined) {
        queryParams.append("page", params.page.toString());
      }
      if (params.size !== undefined) {
        queryParams.append("size", params.size.toString());
      }
      if (params.direction) {
        queryParams.append("direction", params.direction);
      }
      if (params.sort) {
        queryParams.append("sort", params.sort);
      }

      const response = await apiClient.get(
        `/vehicles/brands/search?${queryParams.toString()}`
      );

      if (response.data.success && response.data.data) {
        return response.data;
      } else {
        throw new Error(
          response.data.message || "Failed to search vehicle brands"
        );
      }
    } catch (error) {
      console.error("Search vehicle brands error:", error);
      throw error;
    }
  }

  /**
   * Export vehicle brands to CSV
   */
  static async exportVehicleBrands(
    params: GetAllVehicleBrandsRequest = {}
  ): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams();

      if (params.page !== undefined) {
        queryParams.append("page", params.page.toString());
      }
      if (params.size !== undefined) {
        queryParams.append("size", params.size.toString());
      }
      if (params.direction) {
        queryParams.append("direction", params.direction);
      }
      if (params.sort) {
        queryParams.append("sort", params.sort);
      }

      const response = await apiClient.get(
        `/vehicles/brands/export?${queryParams.toString()}`,
        {
          responseType: "blob",
        }
      );

      return response.data;
    } catch (error) {
      console.error("Export vehicle brands error:", error);
      throw error;
    }
  }
}
