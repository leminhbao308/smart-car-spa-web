/**
 * Axios Configuration with Interceptors
 * Handles automatic token injection, refresh, and error handling
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { TokenManager } from './utils/token.manager';
import { createApiError, handleApiError, isAuthError, isNetworkError } from './utils/api.helpers';
import { ApiResponse } from './types';

// API Configuration
const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
} as const;

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

/**
 * Process failed requests queue
 */
function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
}

/**
 * Request Interceptor
 * Automatically adds authorization header
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Skip auth for certain endpoints
    const skipAuthEndpoints = ['/auth/login', '/auth/refresh-token', '/auth/forgot-password'];
    const shouldSkipAuth = skipAuthEndpoints.some(endpoint => 
      config.url?.includes(endpoint)
    );

    if (!shouldSkipAuth && !config.headers.Authorization) {
      const token = TokenManager.getAuthHeader();
      if (token) {
        config.headers.Authorization = token;
      }
    }

    // Add request timestamp for debugging
    (config as any).metadata = { startTime: Date.now() };

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles token refresh and error processing
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // Log request duration for debugging
    if ((response.config as any).metadata?.startTime) {
      const duration = Date.now() - (response.config as any).metadata.startTime;
      console.log(`API Request: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (isNetworkError(error)) {
      console.error('Network error:', error.message);
      return Promise.reject(createApiError(error));
    }

    // Handle authentication errors
    if (isAuthError(error) && !originalRequest._retry) {
      // Skip refresh for login/refresh endpoints to prevent infinite loops
      const skipRefreshEndpoints = ['/auth/login', '/auth/refresh-token'];
      const shouldSkipRefresh = skipRefreshEndpoints.some(endpoint => 
        originalRequest.url?.includes(endpoint)
      );

      if (shouldSkipRefresh) {
        return Promise.reject(createApiError(error));
      }

      // Mark request as retried
      originalRequest._retry = true;

      // If already refreshing, queue the request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return apiClient(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      // Start refresh process
      isRefreshing = true;

      try {
        const refreshToken = TokenManager.getRefreshToken();
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call refresh token endpoint
        const response = await axios.post(
          `${API_CONFIG.BASE_URL}/auth/refresh-token`,
          { refresh_token: refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const { access_token, refresh_token, user_info } = response.data.data;

        // Update tokens
        TokenManager.setTokens(access_token, refresh_token, user_info);

        // Process queued requests
        processQueue(null, access_token);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);

      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        console.error('Token refresh failed:', refreshError);
        
        TokenManager.clearAll();
        processQueue(refreshError, null);

        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }

        return Promise.reject(createApiError(refreshError));
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    return Promise.reject(createApiError(error));
  }
);

/**
 * Enhanced API client with additional methods
 */
export const enhancedApiClient = {
  ...apiClient,
  
  /**
   * GET request with error handling
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.get<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * POST request with error handling
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.post<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * PUT request with error handling
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.put<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * PATCH request with error handling
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.patch<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * DELETE request with error handling
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.delete<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
};

// Export both the raw client and enhanced client
export { apiClient };
export default enhancedApiClient;
