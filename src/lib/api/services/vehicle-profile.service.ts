/**
 * Vehicle Profile Management Service
 * Handles all vehicle profile-related API calls
 */

import apiClient from "../axios";
import {
  VehicleProfileRequest,
  VehicleProfileResponse,
  VehicleProfileDisplay,
  VehicleProfile,
  CreateVehicleProfileRequest,
  UpdateVehicleProfileRequest,
  CreateVehicleProfileResponse,
} from "../types/vehicle-profile.types";
import { VehicleService } from "./vehicle.service";
import { UserService } from "./user.service";

export class VehicleProfileService {
  /**
   * Transform raw vehicle profile data to display format with names
   */
  private static async transformToDisplayFormat(
    profiles: VehicleProfile[]
  ): Promise<VehicleProfileDisplay[]> {
    try {
      // Validate input
      if (!profiles || !Array.isArray(profiles)) {
        console.warn("Invalid profiles data:", profiles);
        return [];
      }

      if (profiles.length === 0) {
        console.log("No profiles to transform");
        return [];
      }

      console.log("Transforming profiles:", profiles.length, "items");

      // Transform profiles by fetching data for each unique ID
      const transformedProfiles = await Promise.all(
        profiles.map(async (profile) => {
          try {
            // Fetch data for each profile's IDs in parallel
            const [brandResponse, typeResponse, modelResponse, userResponse] = await Promise.all([
              VehicleService.getVehicleBrandById(profile.vehicle_brand_id),
              VehicleService.getVehicleTypeById(profile.vehicle_type_id),
              VehicleService.getVehicleModelById(profile.vehicle_model_id),
              UserService.getUserById(profile.owner_id),
            ]);

            const brand = brandResponse;
            const type = typeResponse;
            const model = modelResponse;
            const owner = userResponse;

            console.log(`Transforming profile ${profile.vehicle_id}:`, {
              brand_id: profile.vehicle_brand_id,
              brand_name: brand?.brand_name,
              type_id: profile.vehicle_type_id,
              type_name: type?.type_name,
              model_id: profile.vehicle_model_id,
              model_name: model?.model_name,
              owner_id: profile.owner_id,
              owner_name: owner?.full_name,
            });

            return {
              ...profile,
              brand_name: brand?.brand_name || "Unknown Brand",
              brand_logo: brand?.brand_logo_url,
              type_name: type?.type_name || "Unknown Type",
              type_icon: undefined,
              model_name: model?.model_name || "Unknown Model",
              model_year: undefined,
              owner_name: owner?.full_name || "Unknown Owner",
              owner_phone: owner?.phone_number,
              owner_email: owner?.email,
            } as VehicleProfileDisplay;
          } catch (error) {
            console.log(`Error transforming profile ${profile.vehicle_id}:`, error);
            // Return profile with fallback values if API calls fail
            return {
              ...profile,
              brand_name: "Error loading",
              brand_logo: undefined,
              type_name: "Error loading",
              type_icon: undefined,
              model_name: "Error loading",
              model_year: undefined,
              owner_name: "Error loading",
              owner_phone: undefined,
              owner_email: undefined,
            } as VehicleProfileDisplay;
          }
        })
      );

      return transformedProfiles;
    } catch (error) {
      console.log("Error transforming vehicle profiles:", error);
      console.log("Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        profiles: profiles,
      });
      
      // Return original data if transformation fails
      if (profiles && Array.isArray(profiles)) {
        return profiles.map(
          (profile) =>
            ({
              ...profile,
              brand_name: "Error loading",
              type_name: "Error loading",
              model_name: "Error loading",
              owner_name: "Error loading",
            } as VehicleProfileDisplay)
        );
      }
      
      return [];
    }
  }

  /**
   * Get all vehicle profiles with pagination and filtering
   */
  static async getAllVehicleProfiles(
    params: VehicleProfileRequest = {}
  ): Promise<VehicleProfileResponse> {
    try {
      // Build query parameters with defaults
      const queryParams = new URLSearchParams();

      // Set default values if not provided
      const page = params.page !== undefined ? params.page : 0;
      const size = params.size !== undefined ? params.size : 10;
      const direction = params.direction || "DESC";
      const sort = params.sort || "createdDate";

      queryParams.append("page", page.toString());
      queryParams.append("size", size.toString());
      queryParams.append("direction", direction);
      queryParams.append("sort", sort);

      const url = `/vehicles/profiles/get-all?${queryParams.toString()}`;

      const response = await apiClient.get(url);
      console.log("Vehicle profiles API Response received:", response);

      if (response.data.success && response.data.data) {
        console.log("Raw vehicle profiles data:", response.data.data.content);

        // Transform the data to include names
        const transformedContent = await this.transformToDisplayFormat(
          response.data.data.content
        );
        console.log("Transformed vehicle profiles data:", transformedContent);

        return {
          ...response.data,
          data: {
            ...response.data.data,
            content: transformedContent,
          },
        };
      } else {
        throw new Error(
          response.data.message || "Failed to fetch vehicle profiles"
        );
      }
    } catch (error: unknown) {
      console.log("Get all vehicle profiles error details:", error);
      throw error;
    }
  }

  /**
   * Get all vehicle profiles by ownerId with pagination and filtering
   */
  static async getAllVehicleProfilesByOwnerId(
    ownerId: string,
    params: VehicleProfileRequest = {}
  ): Promise<VehicleProfileResponse> {
    try {
      // Build query parameters with defaults
      const queryParams = new URLSearchParams();

      // Set default values if not provided
      const page = params.page !== undefined ? params.page : 0;
      const size = params.size !== undefined ? params.size : 10;
      const direction = params.direction || "DESC";
      const sort = params.sort || "createdDate";

      queryParams.append("page", page.toString());
      queryParams.append("size", size.toString());
      queryParams.append("direction", direction);
      queryParams.append("sort", sort);

      const url = `/vehicles/profiles/owner/${ownerId}/get-all?${queryParams.toString()}`;

      const response = await apiClient.get(url);
      console.log("Vehicle profiles API by ownerId Response received:", response);

      if (response.data.success && response.data.data) {
        console.log("Raw vehicle profiles data:", response.data.data.content);

        // Transform the data to include names
        const transformedContent = await this.transformToDisplayFormat(
          response.data.data.content
        );
        console.log("Transformed vehicle profiles data:", transformedContent);

        return {
          ...response.data,
          data: {
            ...response.data.data,
            content: transformedContent,
          },
        };
      } else {
        throw new Error(
          response.data.message || "Failed to fetch vehicle profiles"
        );
      }
    } catch (error: unknown) {
      console.log("Get all vehicle profiles error details:", error);
      throw error;
    }
  }

  /**
   * Get vehicle profile by ID
   */
  static async getVehicleProfileById(
    profileId: string
  ): Promise<VehicleProfileDisplay> {
    try {
      const response = await apiClient.get(`/vehicles/profiles/${profileId}`);

      if (response.data.success && response.data.data) {
        // Transform single profile data
        const transformedProfiles = await this.transformToDisplayFormat([
          response.data.data,
        ]);
        return transformedProfiles[0];
      } else {
        throw new Error(
          response.data.message || "Failed to fetch vehicle profile"
        );
      }
    } catch (error) {
      console.log("Get vehicle profile by ID error:", error);
      throw error;
    }
  }

  /**
   * Create new vehicle profile
   */
  static async createVehicleProfile(
    data: CreateVehicleProfileRequest
  ): Promise<CreateVehicleProfileResponse> {
    try {
      console.log("Creating vehicle profile with data:", data);

      const response = await apiClient.post("/vehicles/profiles/create", data);
      console.log("Create vehicle profile API response:", response);

      if (response.data.success && response.data.data) {
        return response.data;
      } else {
        throw new Error(
          response.data.message || "Failed to create vehicle profile"
        );
      }
    } catch (error) {
      console.log("Create vehicle profile error:", error);
      throw error;
    }
  }

  /**
   * Update vehicle profile
   */
  static async updateVehicleProfile(
    profileId: string,
    data: UpdateVehicleProfileRequest
  ): Promise<VehicleProfileDisplay> {
    try {
      console.log(
        "Updating vehicle profile with ID:",
        profileId,
        "and data:",
        data
      );

      const response = await apiClient.post(
        `/vehicles/profiles/${profileId}/update`,
        data
      );
      console.log("Update vehicle profile API response:", response);

      if (response.data.success && response.data.data) {
        // Transform the updated data to include names
        const transformedProfiles = await this.transformToDisplayFormat([
          response.data.data,
        ]);
        return transformedProfiles[0];
      } else {
        throw new Error(
          response.data.message || "Failed to update vehicle profile"
        );
      }
    } catch (error) {
      console.log("Update vehicle profile error:", error);
      throw error;
    }
  }

  /**
   * Delete vehicle profile
   */
  static async deleteVehicleProfile(profileId: string): Promise<void> {
    try {
      console.log("Deleting vehicle profile with ID:", profileId);

      const response = await apiClient.post(
        `/vehicles/profiles/${profileId}/delete`
      );
      console.log("Delete vehicle profile API response:", response);

      if (response.data.success) {
        return;
      } else {
        throw new Error(
          response.data.message || "Failed to delete vehicle profile"
        );
      }
    } catch (error) {
      console.log("Delete vehicle profile error:", error);
      throw error;
    }
  }

}

// Export for backward compatibility
export const vehicleProfileService = {
  getAll: VehicleProfileService.getAllVehicleProfiles,
  getAllByOwnerId: VehicleProfileService.getAllVehicleProfilesByOwnerId,
  getById: VehicleProfileService.getVehicleProfileById,
  create: VehicleProfileService.createVehicleProfile,
  update: VehicleProfileService.updateVehicleProfile,
  delete: VehicleProfileService.deleteVehicleProfile,
};
