/**
 * Media Management Types
 * Type definitions for media-related API requests and responses
 */

export interface MediaInfoDto {
  media_id: string;
  entity_type: string;
  entity_id: string;
  media_type: MediaType;
  media_url: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  is_main: boolean;
  is_active?: boolean;
  sort_order?: number;
  metadata?: Record<string, any>;
  alt_text?: string;
  caption?: string;
  created_date: string;
  updated_date?: string;
  created_by?: string;
  updated_by?: string;
  is_deleted?: boolean;
}

export enum MediaType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  DOCUMENT = "DOCUMENT",
  AUDIO = "AUDIO",
  OTHER = "OTHER",
}

export interface MediaFilterParam {
  page?: number;
  size?: number;
  entityType?: string;
  entityId?: string;
  mediaType?: MediaType;
  isMain?: boolean;
  isActive?: boolean;
  search?: string;
  sort?: string;
  direction?: "ASC" | "DESC";
}

export interface CreateMediaRequest {
  entityType: string;
  entityId: string;
  mediaType: MediaType;
  mediaUrl: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  isMain?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  metadata?: Record<string, any>;
  altText?: string;
  caption?: string;
}

export interface UpdateMediaRequest {
  mediaType?: MediaType;
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  isActive?: boolean;
  sortOrder?: number;
  metadata?: Record<string, any>;
  altText?: string;
  caption?: string;
}

export interface UpdateMediaMainStatusRequest {
  isMain: boolean;
}

export interface BulkUpdateMediaOrderRequest {
  entityType: string;
  entityId: string;
  mediaOrders: {
    mediaId: string;
    sortOrder: number;
  }[];
}

export interface MediaStatsDto {
  totalMedia: number;
  totalImages: number;
  totalVideos: number;
  totalDocuments: number;
  totalAudio: number;
  totalOther: number;
  totalSize: number;
  averageFileSize: number;
  mediaByEntityType: Record<string, number>;
  recentUploads: number;
}

export interface MediaResponse {
  success: boolean;
  message: string;
  data: MediaInfoDto;
}

export interface MediaListResponse {
  success: boolean;
  message: string;
  data: MediaInfoDto[];
}

export interface MediaStatsResponse {
  success: boolean;
  message: string;
  data: MediaStatsDto;
}

export interface MediaValidationResponse {
  success: boolean;
  message: string;
  data: boolean;
}
