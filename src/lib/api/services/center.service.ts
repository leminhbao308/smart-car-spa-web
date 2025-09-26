import apiClient from "../axios";
import {
  Center,
  CenterListResponse,
  CenterResponse,
  CreateCenterRequest,
  UpdateCenterRequest,
  DeleteCenterResponse,
  CenterDisplay,
  BusinessHours,
  ContactInfo,
  SocialMedia,
} from "../types/center.types";

export class CenterService {
  /**
   * Parse JSON string safely
   */
  private static parseJsonSafely<T>(jsonString: string, defaultValue: T): T {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn("Failed to parse JSON:", jsonString, error);
      return defaultValue;
    }
  }

  /**
   * Transform center data to display format
   */
  private static transformToDisplayFormat(center: Center): CenterDisplay {
    return {
      ...center,
      business_hours: this.parseJsonSafely<BusinessHours>(
        center.business_hours,
        {
          monday: { open: "08:00", close: "20:00" },
          tuesday: { open: "08:00", close: "20:00" },
          wednesday: { open: "08:00", close: "20:00" },
          thursday: { open: "08:00", close: "20:00" },
          friday: { open: "08:00", close: "20:00" },
          saturday: { open: "08:00", close: "18:00" },
          sunday: { open: "09:00", close: "17:00" },
        }
      ),
      contact_info: this.parseJsonSafely<ContactInfo>(center.contact_info, {}),
      social_media: this.parseJsonSafely<SocialMedia>(center.social_media, {}),
      service_areas: this.parseJsonSafely<string[]>(center.service_areas, []),
    };
  }

  /**
   * Get all centers
   */
  static async getAllCenters(): Promise<{
    centers: CenterDisplay[];
    pagination: {
      page: number;
      size: number;
      total_elements: number;
      total_pages: number;
      first: boolean;
      last: boolean;
      has_next: boolean;
      has_previous: boolean;
    };
  }> {
    try {
      console.log("Fetching all centers...");

      const response = await apiClient.get<CenterListResponse>(
        "/centers/get-all"
      );
      console.log("Get all centers API response:", response);

      if (response.data.success && response.data.data) {
        // Handle both array and single object responses
        const dataArray = Array.isArray(response.data.data.content)
          ? response.data.data.content
          : [response.data.data.content];

        const transformedCenters = dataArray.map((center) =>
          this.transformToDisplayFormat(center)
        );

        return {
          centers: transformedCenters,
          pagination: {
            page: response.data.data.page || 0,
            size: response.data.data.size || dataArray.length,
            total_elements:
              response.data.data.total_elements || dataArray.length,
            total_pages: response.data.data.total_pages || 1,
            first: response.data.data.first || true,
            last: response.data.data.last || true,
            has_next: response.data.data.has_next || false,
            has_previous: response.data.data.has_previous || false,
          },
        };
      } else {
        throw new Error(response.data.message || "Failed to fetch centers");
      }
    } catch (error) {
      console.error("Get all centers error:", error);
      throw error;
    }
  }

  /**
   * Get center by ID
   */
  static async getCenterById(centerId: string): Promise<CenterDisplay> {
    try {
      console.log("Fetching center with ID:", centerId);

      const response = await apiClient.get<CenterResponse>(
        `/centers/${centerId}`
      );
      console.log("Get center by ID API response:", response);

      if (response.data.success && response.data.data) {
        return this.transformToDisplayFormat(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch center");
      }
    } catch (error) {
      console.error("Get center by ID error:", error);
      throw error;
    }
  }

  /**
   * Create new center
   */
  static async createCenter(data: CreateCenterRequest): Promise<CenterDisplay> {
    try {
      console.log("Creating center with data:", data);

      const response = await apiClient.post<CenterResponse>(
        "/centers/create",
        data
      );
      console.log("Create center API response:", response);

      if (response.data.success && response.data.data) {
        return this.transformToDisplayFormat(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to create center");
      }
    } catch (error) {
      console.error("Create center error:", error);
      throw error;
    }
  }

  /**
   * Update center
   */
  static async updateCenter(
    centerId: string,
    data: UpdateCenterRequest
  ): Promise<CenterDisplay> {
    try {
      console.log("Updating center with ID:", centerId, "and data:", data);

      const response = await apiClient.post<CenterResponse>(
        `/centers/${centerId}/update`,
        data
      );
      console.log("Update center API response:", response);

      if (response.data.success && response.data.data) {
        return this.transformToDisplayFormat(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to update center");
      }
    } catch (error) {
      console.error("Update center error:", error);
      throw error;
    }
  }

  /**
   * Delete center
   */
  static async deleteCenter(centerId: string): Promise<void> {
    try {
      console.log("Deleting center with ID:", centerId);

      const response = await apiClient.post<DeleteCenterResponse>(
        `/centers/${centerId}/delete`
      );
      console.log("Delete center API response:", response);

      if (response.data.success) {
        return;
      } else {
        throw new Error(response.data.message || "Failed to delete center");
      }
    } catch (error) {
      console.error("Delete center error:", error);
      throw error;
    }
  }

  /**
   * Get branches by center ID
   */
  static async getBranchesByCenterId(
    centerId: string
  ): Promise<CenterDisplay[]> {
    try {
      console.log("Fetching branches for center ID:", centerId);

      const response = await apiClient.get<CenterListResponse>(
        `/centers/${centerId}/branches`
      );
      console.log("Get branches by center ID API response:", response);

      if (response.data.success && response.data.data) {
        return response.data.data.content.map((center: Center) =>
          this.transformToDisplayFormat(center)
        );
      } else {
        throw new Error(response.data.message || "Failed to fetch branches");
      }
    } catch (error) {
      console.error("Get branches by center ID error:", error);
      throw error;
    }
  }
}
