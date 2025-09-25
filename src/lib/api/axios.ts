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

// Response interceptor - Xử lý response và error
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // Trả về response nguyên gốc
    return response;
  },

  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Xử lý lỗi 401 - Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = TokenManager.getRefreshToken();

        if (refreshToken) {
          // Gọi API refresh token với structure mới
          const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
            refresh_token: refreshToken,
          });

          if (response.data.success && response.data.data) {
            const { access_token, refresh_token, user_info } =
              response.data.data;

            // Lưu tokens mới và user info
            TokenManager.setTokens(access_token, refresh_token, user_info);

            // Thử lại request gốc với token mới
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
            }

            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh token thất bại, redirect về login
        TokenManager.clearAll();

        // Chỉ redirect nếu đang ở client side
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }

        return Promise.reject(refreshError);
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
