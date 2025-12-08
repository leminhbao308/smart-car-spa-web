/**
 * API Helper Functions
 */

import { ApiError, RequestConfig } from "../types";

/**
 * Create error object from axios error
 */
export function createApiError(error: unknown): ApiError {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as any;
    // Server responded with error status
    const { data, status, statusText } = axiosError.response;

    return {
      success: false,
      message: data?.message || statusText || "Server error",
      timestamp: data?.timestamp || new Date().toISOString(),
      errors: data?.errors,
      error_code: data?.error_code || `HTTP_${status}`,
    };
  } else if (error && typeof error === "object" && "request" in error) {
    // Request was made but no response received
    return {
      success: false,
      message: "Network error - no response from server",
      timestamp: new Date().toISOString(),
      error_code: "NETWORK_ERROR",
    };
  } else {
    // Something else happened
    const errorMessage =
      error && typeof error === "object" && "message" in error
        ? (error as any).message
        : "Unknown error occurred";
    return {
      success: false,
      message: errorMessage,
      timestamp: new Date().toISOString(),
      error_code: "UNKNOWN_ERROR",
    };
  }
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown): never {
  const apiError = createApiError(error);

  // Log error for debugging
  console.log("API Error:", apiError);

  // You can add additional error handling here
  // e.g., show toast notification, redirect to error page, etc.

  throw apiError;
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Don't retry on certain error types
      if (error.response?.status === 401 || error.response?.status === 403) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Build query string from object
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, String(item)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  return searchParams.toString();
}

/**
 * Format API URL
 */
export function formatApiUrl(baseUrl: string, endpoint: string): string {
  const cleanBaseUrl = baseUrl.replace(/\/$/, "");
  const cleanEndpoint = endpoint.replace(/^\//, "");
  return `${cleanBaseUrl}/${cleanEndpoint}`;
}

/**
 * Get default request config
 */
export function getDefaultConfig(): RequestConfig {
  return {
    timeout: 30000, // 30 seconds
    retries: 3,
    skipAuth: false,
  };
}

/**
 * Merge request configs
 */
export function mergeConfig(
  defaultConfig: RequestConfig,
  userConfig?: RequestConfig
): RequestConfig {
  return {
    ...defaultConfig,
    ...userConfig,
  };
}

/**
 * Check if error is network error
 */
export function isNetworkError(error: any): boolean {
  return !error.response && error.request;
}

/**
 * Check if error is timeout error
 */
export function isTimeoutError(error: any): boolean {
  return error.code === "ECONNABORTED" || error.message?.includes("timeout");
}

/**
 * Check if error is authentication error
 */
export function isAuthError(error: any): boolean {
  return error.response?.status === 401 || error.response?.status === 403;
}

/**
 * Check if error is server error
 */
export function isServerError(error: any): boolean {
  const status = error.response?.status;
  return status >= 500 && status < 600;
}

/**
 * Check if error is client error
 */
export function isClientError(error: any): boolean {
  const status = error.response?.status;
  return status >= 400 && status < 500;
}
