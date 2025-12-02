import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { TokenManager } from "./utils/token.manager";
import { ApiResponse, ApiError } from "./types/common.types";

// Base URL configuration
const BASE_URL = "http://localhost:8081/api";

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
      console.log("No refresh token available for refresh");
      throw new Error("No refresh token available");
    }

    console.log("Refreshing token...");

    const response = await axios.post(
      `${BASE_URL}/auth/refresh-token`,
      {
        refreshToken: refreshTokenValue, // FIXED: Changed from refresh_token to refreshToken to match backend DTO
      },
      {
        timeout: 10000, // 10 second timeout
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Refresh token response:", {
      status: response.status,
      success: response.data?.success,
      hasData: !!response.data?.data,
    });

    if (response.data.success && response.data.data) {
      const { access_token, refresh_token, user_info } = response.data.data;

      // Update tokens in storage
      TokenManager.setTokens(access_token, refresh_token, user_info);

      console.log("Token refreshed successfully");
      return access_token;
    } else {
      const errorMessage = response.data.message || "Failed to refresh token";
      console.log("Refresh token response indicates failure:", errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error: any) {
    console.log("Token refresh failed with details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
    });

    // Check if it's a 401 error (refresh token expired/invalid)
    if (error.response?.status === 401) {
      console.log("Refresh token is invalid or expired, clearing all tokens");
      TokenManager.clearAll();

      // Redirect to login if on client side
      if (typeof window !== "undefined") {
        console.log("Redirecting to login due to invalid refresh token");
        window.location.href = "/auth/login";
      }
    } else {
      // For other errors, don't clear tokens immediately
      console.log(
        "Non-401 error during token refresh, keeping tokens for retry"
      );
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

    // Log error details for debugging
    console.log("API Error Details:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: originalRequest?.url,
      method: originalRequest?.method,
      data: error.response?.data,
      message: error.message,
    });

    // Xử lý lỗi 401 - Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip refresh for auth endpoints
      if (originalRequest.url?.includes("/auth/")) {
        return Promise.reject(error);
      }

      // Check if we have refresh token before attempting refresh
      const refreshTokenValue = TokenManager.getRefreshToken();
      if (!refreshTokenValue) {
        console.log("No refresh token available, redirecting to login");
        TokenManager.clearAll();
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, add to queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
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
        console.log("Token refresh failed:", refreshError);
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Xử lý lỗi 500 - Internal Server Error
    if (error.response?.status === 500) {
      console.log("Server Error (500):", {
        url: originalRequest?.url,
        data: error.response?.data,
        message: error.response?.data?.message || "Internal server error",
      });

      // If this is a refresh token request that failed, clear tokens and redirect
      if (originalRequest?.url?.includes("/auth/refresh-token")) {
        console.log("Refresh token endpoint returned 500, clearing tokens");
        TokenManager.clearAll();

        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
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
