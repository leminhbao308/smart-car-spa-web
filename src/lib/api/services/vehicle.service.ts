/**
 * Vehicle Management Service
 * Handles all vehicle-related API calls
 */

import apiClient from "../axios";
import {
  GetAllVehicleBrandsRequest,
  GetAllVehicleBrandsResponse,
  VehicleBrand,
  VehicleBrandDropdownResponse,
  CreateVehicleBrandRequest,
  UpdateVehicleBrandRequest,
  VehicleType,
  GetAllVehicleTypesRequest,
  GetAllVehicleTypesResponse,
  CreateVehicleTypeRequest,
  UpdateVehicleTypeRequest,
  VehicleTypeDropdownResponse,
  VehicleModel,
  GetAllVehicleModelsRequest,
  GetAllVehicleModelsResponse,
  CreateVehicleModelRequest,
  CreateVehicleModelResponse,
  UpdateVehicleModelRequest,
  UpdateVehicleModelResponse,
  DeleteVehicleModelResponse,
  VehicleModelDropdownResponse,
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
    } catch (error: unknown) {
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


  // ==================== VEHICLE TYPE METHODS ====================

  /**
   * Get all vehicle types with pagination and filtering
   */
  static async getAllVehicleTypes(
    params: GetAllVehicleTypesRequest = {}
  ): Promise<GetAllVehicleTypesResponse> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();

      if (params.page !== undefined) {
        queryParams.append("page", params.page.toString());
      }
      if (params.size !== undefined) {
        queryParams.append("size", params.size.toString());
      }
      if (params.sort) {
        queryParams.append("sort", params.sort);
      }
      if (params.direction) {
        queryParams.append("direction", params.direction);
      }
      if (params.active !== undefined) {
        queryParams.append("active", params.active.toString());
      }
      if (params.deleted !== undefined) {
        queryParams.append("deleted", params.deleted.toString());
      }
      if (params.search) {
        queryParams.append("search", params.search);
      }
      if (params.created_date_from) {
        queryParams.append("created_date_from", params.created_date_from);
      }
      if (params.created_date_to) {
        queryParams.append("created_date_to", params.created_date_to);
      }
      if (params.modified_date_from) {
        queryParams.append("modified_date_from", params.modified_date_from);
      }
      if (params.modified_date_to) {
        queryParams.append("modified_date_to", params.modified_date_to);
      }

      const url = `/vehicles/types/get-all?${queryParams.toString()}`;

      const response = await apiClient.get(url);
      console.log("Vehicle types API Response received:", response);

      if (response.data.success && response.data.data) {
        return response.data;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch vehicle types"
        );
      }
    } catch (error: unknown) {
      console.log("Get all vehicle types error details:", error);
      throw error;
    }
  }

  /**
   * Get vehicle type by ID
   */
  static async getVehicleTypeById(typeId: string): Promise<VehicleType> {
    try {
      const response = await apiClient.get(`/vehicles/types/${typeId}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch vehicle type"
        );
      }
    } catch (error) {
      console.error("Get vehicle type by ID error:", error);
      throw error;
    }
  }

  /**
   * Get vehicle types for dropdown
   */
  static async getVehicleTypesForDropdown(): Promise<VehicleTypeDropdownResponse> {
    try {
      const response = await apiClient.get("/vehicles/types/dropdown");
      console.log("Vehicle types dropdown API response:", response);

      if (response.data.success && response.data.data) {
        return response.data;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch vehicle types for dropdown"
        );
      }
    } catch (error) {
      console.error("Get vehicle types dropdown error:", error);
      throw error;
    }
  }

  /**
   * Create new vehicle type
   */
  static async createVehicleType(
    typeData: CreateVehicleTypeRequest
  ): Promise<VehicleType> {
    try {
      console.log("Creating vehicle type with data:", typeData);

      const response = await apiClient.post("/vehicles/types/create", typeData);
      console.log("Create vehicle type API response:", response);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Failed to create vehicle type"
        );
      }
    } catch (error) {
      console.error("Create vehicle type error:", error);
      throw error;
    }
  }

  /**
   * Update vehicle type
   */
  static async updateVehicleType(
    typeId: string,
    typeData: UpdateVehicleTypeRequest
  ): Promise<VehicleType> {
    try {
      console.log("Updating vehicle type with data:", typeData);

      const response = await apiClient.post(
        `/vehicles/types/${typeId}/update`,
        typeData
      );
      console.log("Update vehicle type API response:", response);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Failed to update vehicle type"
        );
      }
    } catch (error) {
      console.error("Update vehicle type error:", error);
      throw error;
    }
  }


  /**
   * Delete vehicle type
   */
  static async deleteVehicleType(typeId: string): Promise<string> {
    try {
      console.log("Deleting vehicle type with ID:", typeId);

      const response = await apiClient.post(`/vehicles/types/${typeId}/delete`);
      console.log("Delete vehicle type API response:", response);

      if (response.data.success) {
        return response.data.data || response.data.message;
      } else {
        throw new Error(
          response.data.message || "Failed to delete vehicle type"
        );
      }
    } catch (error) {
      console.error("Delete vehicle type error:", error);
      throw error;
    }
  }

  // ==================== VEHICLE MODEL METHODS ====================

  /**
   * Get all vehicle models with pagination and filtering
   */
  static async getAllVehicleModels(
    params: GetAllVehicleModelsRequest = {}
  ): Promise<GetAllVehicleModelsResponse> {
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
      if (params.search) {
        queryParams.append("search", params.search);
      }
      if (params.brand_id) {
        queryParams.append("brand_id", params.brand_id);
      }
      if (params.type_id) {
        queryParams.append("type_id", params.type_id);
      }
      if (params.year_from !== undefined) {
        queryParams.append("year_from", params.year_from.toString());
      }
      if (params.year_to !== undefined) {
        queryParams.append("year_to", params.year_to.toString());
      }
      if (params.fuel_type) {
        queryParams.append("fuel_type", params.fuel_type);
      }
      if (params.is_active !== undefined) {
        queryParams.append("is_active", params.is_active.toString());
      }
      if (params.is_deleted !== undefined) {
        queryParams.append("is_deleted", params.is_deleted.toString());
      }

      const url = `/vehicles/models/get-all?${queryParams.toString()}`;

      const response = await apiClient.get(url);
      console.log("Vehicle models API Response received:", response);

      if (response.data.success && response.data.data) {
        return response.data;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch vehicle models"
        );
      }
    } catch (error: unknown) {
      console.log("Get all vehicle models error details:", error);
      throw error;
    }
  }

  /**
   * Get vehicle model by ID
   */
  static async getVehicleModelById(modelId: string): Promise<VehicleModel> {
    try {
      const response = await apiClient.get(`/vehicles/models/${modelId}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch vehicle model"
        );
      }
    } catch (error) {
      console.error("Get vehicle model by ID error:", error);
      throw error;
    }
  }

  /**
   * Get vehicle models for dropdown
   */
  static async getVehicleModelsForDropdown(): Promise<VehicleModelDropdownResponse> {
    try {
      const response = await apiClient.get("/vehicles/models/dropdown");
      console.log("Vehicle models dropdown API response:", response);

      if (response.data.success && response.data.data) {
        return response.data;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch vehicle models for dropdown"
        );
      }
    } catch (error) {
      console.error("Get vehicle models dropdown error:", error);
      throw error;
    }
  }

  /**
   * Create new vehicle model
   */
  static async createVehicleModel(
    modelData: CreateVehicleModelRequest
  ): Promise<CreateVehicleModelResponse["data"]> {
    try {
      console.log("Creating vehicle model with data:", modelData);

      const response = await apiClient.post(
        "/vehicles/models/create",
        modelData
      );
      console.log("Create vehicle model API response:", response);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Failed to create vehicle model"
        );
      }
    } catch (error) {
      console.error("Create vehicle model error:", error);
      throw error;
    }
  }

  /**
   * Update vehicle model
   */
  static async updateVehicleModel(
    modelId: string,
    modelData: UpdateVehicleModelRequest
  ): Promise<UpdateVehicleModelResponse["data"]> {
    try {
      console.log("Updating vehicle model with data:", modelData);

      const response = await apiClient.post(
        `/vehicles/models/${modelId}/update`,
        modelData
      );
      console.log("Update vehicle model API response:", response);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Failed to update vehicle model"
        );
      }
    } catch (error) {
      console.error("Update vehicle model error:", error);
      throw error;
    }
  }


  /**
   * Delete vehicle model
   */
  static async deleteVehicleModel(
    modelId: string
  ): Promise<DeleteVehicleModelResponse["data"]> {
    try {
      console.log("Deleting vehicle model with ID:", modelId);

      const response = await apiClient.post(
        `/vehicles/models/${modelId}/delete`
      );
      console.log("Delete vehicle model API response:", response);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Failed to delete vehicle model"
        );
      }
    } catch (error) {
      console.error("Delete vehicle model error:", error);
      throw error;
    }
  }
}
