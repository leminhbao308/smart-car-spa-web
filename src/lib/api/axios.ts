import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { TokenManager } from "./utils/token.manager";
import { ApiResponse, ApiError } from "./types/common.types";

// Base URL configuration
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api";

// Token refresh state management
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (error?: unknown) => void;
}> = [];

// Tạo axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Thêm token vào header
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = TokenManager.getAccessToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Process failed queue
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Refresh token function
const refreshToken = async (): Promise<string | null> => {
  try {
    const refreshTokenValue = TokenManager.getRefreshToken();
    
    if (!refreshTokenValue) {
      throw new Error("No refresh token available");
    }

    console.log("Refreshing token...");
    
    const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
      refresh_token: refreshTokenValue,
    });

    if (response.data.success && response.data.data) {
      const { access_token, refresh_token, user_info } = response.data.data;
      
      // Update tokens in storage
      TokenManager.setTokens(access_token, refresh_token, user_info);
      
      console.log("Token refreshed successfully");
      return access_token;
    } else {
      throw new Error(response.data.message || "Failed to refresh token");
    }
  } catch (error) {
    console.error("Token refresh failed:", error);
    
    // Clear all tokens on refresh failure
    TokenManager.clearAll();
    
    // Redirect to login if on client side
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
    
    throw error;
  }
};

// Response interceptor - Xử lý response và error
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response;
  },

  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Xử lý lỗi 401 - Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip refresh for auth endpoints
      if (originalRequest.url?.includes('/auth/')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, add to queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers && token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshToken();
        processQueue(null, newToken);
        
        // Retry original request with new token
        if (originalRequest.headers && newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Xử lý các lỗi khác
    const apiError: ApiError = {
      success: false,
      message:
        error.response?.data?.message || error.message || "Có lỗi xảy ra",
      timestamp: error.response?.data?.timestamp || null,
      errors: error.response?.data?.errors,
      error_code: error.response?.data?.error_code,
    };

    return Promise.reject(apiError);
  }
);

export default apiClient;
