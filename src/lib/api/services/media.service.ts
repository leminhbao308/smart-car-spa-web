/**
 * Media Management Service
 * Handles all media-related API calls
 */

import apiClient from "../axios";
import {
  MediaInfoDto,
  MediaFilterParam,
  CreateMediaRequest,
  UpdateMediaRequest,
  UpdateMediaMainStatusRequest,
  BulkUpdateMediaOrderRequest,
  MediaStatsDto,
} from "../types";

export class MediaService {
  /**
   * Get all media with pagination and filtering
   */
  static async getAllMedia(
    filterParam?: MediaFilterParam
  ): Promise<MediaInfoDto[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filterParam) {
        if (filterParam.page !== undefined) {
          queryParams.append("page", filterParam.page.toString());
        }
        if (filterParam.size !== undefined) {
          queryParams.append("size", filterParam.size.toString());
        }
        if (filterParam.entityType) {
          queryParams.append("entityType", filterParam.entityType);
        }
        if (filterParam.entityId) {
          queryParams.append("entityId", filterParam.entityId);
        }
        if (filterParam.mediaType) {
          queryParams.append("mediaType", filterParam.mediaType);
        }
        if (filterParam.isMain !== undefined) {
          queryParams.append("isMain", filterParam.isMain.toString());
        }
        if (filterParam.isActive !== undefined) {
          queryParams.append("isActive", filterParam.isActive.toString());
        }
        if (filterParam.search) {
          queryParams.append("search", filterParam.search);
        }
      }

      const url = `/media/get-all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(url);

      if (response.data.success) {
        return response.data.data || response.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch media");
      }
    } catch (error) {
      console.log("Get all media error:", error);
      throw error;
    }
  }

  /**
   * Get media by ID
   */
  static async getMediaById(mediaId: string): Promise<MediaInfoDto> {
    try {
      const response = await apiClient.get(`/media/${mediaId}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch media");
      }
    } catch (error) {
      console.log("Get media by ID error:", error);
      throw error;
    }
  }

  /**
   * Get media by entity type and entity ID
   */
  static async getMediaByEntity(
    entityType: string,
    entityId: string
  ): Promise<MediaInfoDto[]> {
    try {
      const response = await apiClient.get(`/media/entity/${entityType}/${entityId}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch media by entity");
      }
    } catch (error) {
      console.log("Get media by entity error:", error);
      throw error;
    }
  }

  /**
   * Get main media for an entity
   */
  static async getMainMediaByEntity(
    entityType: string,
    entityId: string
  ): Promise<MediaInfoDto> {
    try {
      const response = await apiClient.get(`/media/entity/${entityType}/${entityId}/main`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch main media");
      }
    } catch (error) {
      console.log("Get main media by entity error:", error);
      throw error;
    }
  }

  /**
   * Get media by media type
   */
  static async getMediaByType(mediaType: string): Promise<MediaInfoDto[]> {
    try {
      const response = await apiClient.get(`/media/type/${mediaType}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch media by type");
      }
    } catch (error) {
      console.log("Get media by type error:", error);
      throw error;
    }
  }

  /**
   * Create new media
   */
  static async createMedia(mediaData: CreateMediaRequest): Promise<MediaInfoDto> {
    try {
      console.log("Creating media with data:", mediaData);

      const response = await apiClient.post("/media/create", mediaData);
      console.log("Create media API response:", response);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to create media");
      }
    } catch (error) {
      console.log("Create media error:", error);
      throw error;
    }
  }

  /**
   * Update existing media
   */
  static async updateMedia(
    mediaId: string,
    mediaData: UpdateMediaRequest
  ): Promise<MediaInfoDto> {
    try {
      console.log("Updating media with data:", mediaData);

      const response = await apiClient.post(`/media/${mediaId}/update`, mediaData);
      console.log("Update media API response:", response);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to update media");
      }
    } catch (error) {
      console.log("Update media error:", error);
      throw error;
    }
  }

  /**
   * Delete media (soft delete)
   */
  static async deleteMedia(mediaId: string): Promise<void> {
    try {
      console.log("Deleting media with ID:", mediaId);

      const response = await apiClient.post(`/media/${mediaId}/delete`);
      console.log("Delete media API response:", response);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete media");
      }
    } catch (error) {
      console.log("Delete media error:", error);
      throw error;
    }
  }

  /**
   * Update media main status
   */
  static async updateMediaMainStatus(
    mediaId: string,
    statusData: UpdateMediaMainStatusRequest
  ): Promise<MediaInfoDto> {
    try {
      console.log("Updating media main status with data:", statusData);

      const response = await apiClient.post(`/media/${mediaId}/main-status`, statusData);
      console.log("Update media main status API response:", response);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to update media main status");
      }
    } catch (error) {
      console.log("Update media main status error:", error);
      throw error;
    }
  }

  /**
   * Bulk update media sort orders
   */
  static async bulkUpdateMediaOrder(
    bulkData: BulkUpdateMediaOrderRequest
  ): Promise<void> {
    try {
      console.log("Bulk updating media order with data:", bulkData);

      const response = await apiClient.post("/media/bulk-update-order", bulkData);
      console.log("Bulk update media order API response:", response);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to bulk update media order");
      }
    } catch (error) {
      console.log("Bulk update media order error:", error);
      throw error;
    }
  }

  /**
   * Validate media URL
   */
  static async validateMediaUrl(mediaUrl: string): Promise<boolean> {
    try {
      const response = await apiClient.get(`/media/validate-url?url=${encodeURIComponent(mediaUrl)}`);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to validate media URL");
      }
    } catch (error) {
      console.log("Validate media URL error:", error);
      throw error;
    }
  }

  /**
   * Get media statistics
   */
  static async getMediaStatistics(): Promise<MediaStatsDto> {
    try {
      const response = await apiClient.get("/media/statistics");

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch media statistics");
      }
    } catch (error) {
      console.log("Get media statistics error:", error);
      throw error;
    }
  }
}
