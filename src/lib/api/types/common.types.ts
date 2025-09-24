/**
 * Common API types
 */

// Base API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  timestamp: string | null;
  data: T;
}

// Error Response
export interface ApiError {
  success: false;
  message: string;
  timestamp: string | null;
  errors?: Record<string, string[]>;
  error_code?: string;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// Common Entity
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Request Config
export interface RequestConfig {
  timeout?: number;
  retries?: number;
  skipAuth?: boolean;
}
