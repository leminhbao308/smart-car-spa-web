/**
 * User Management Service
 * Handles all user-related API calls
 */

import apiClient from "../axios";
import {
  GetAllUsersRequest,
  GetAllUsersResponse,
  UserManagementInfo,
  UserStatistics,
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  UpdateUserResponse,
} from "../types";

export class UserService {
  /**
   * Get all users with pagination and filtering
   */
  static async getAllUsers(
    params: GetAllUsersRequest = {}
  ): Promise<GetAllUsersResponse> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();

      if (params.page !== undefined) {
        queryParams.append("page", params.page.toString());
      }
      if (params.size !== undefined) {
        queryParams.append("size", params.size.toString());
      }
      if (params.direction) {
        queryParams.append("direction", params.direction);
      }
      if (params.sort) {
        queryParams.append("sort", params.sort);
      }
      if (params.userType) {
        queryParams.append("userType", params.userType);
      }

      const url = `/users/get-all?${queryParams.toString()}`;

      const response = await apiClient.get(url);
      console.log("API Response received:", response);

      if (response.data.success && response.data.data) {
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch users");
      }
    } catch (error: unknown) {
      console.log("Get all users error details:", {
        message:
          error && typeof error === "object" && "message" in error
            ? (error as { message: string }).message
            : "Unknown error",
        status:
          error && typeof error === "object" && "response" in error
            ? (error as { response?: { status?: number } }).response?.status
            : undefined,
        statusText:
          error && typeof error === "object" && "response" in error
            ? (error as { response?: { statusText?: string } }).response
                ?.statusText
            : undefined,
        data:
          error && typeof error === "object" && "response" in error
            ? (error as { response?: { data?: unknown } }).response?.data
            : undefined,
        url:
          error && typeof error === "object" && "config" in error
            ? (error as { config?: { url?: string } }).config?.url
            : undefined,
      });

      // Provide more specific error messages
      if (error && typeof error === "object" && "response" in error) {
        const errorResponse = error as { response?: { status?: number } };
        if (errorResponse.response?.status === 500) {
          throw new Error("Lỗi máy chủ. Vui lòng thử lại sau.");
        } else if (errorResponse.response?.status === 401) {
          throw new Error(
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
          );
        } else if (errorResponse.response?.status === 403) {
          throw new Error("Bạn không có quyền truy cập tài nguyên này.");
        } else if (errorResponse.response?.status === 404) {
          throw new Error("Không tìm thấy dữ liệu người dùng.");
        }
      }
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<UserManagementInfo> {
    try {
      const response = await apiClient.get(`/users/${userId}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch user");
      }
    } catch (error) {
      console.log("Get user by ID error:", error);
      throw error;
    }
  }

  /**
   * Update user status (active/inactive)
   */
  static async updateUserStatus(
    userId: string,
    isActive: boolean
  ): Promise<void> {
    try {
      const response = await apiClient.post(`/users/${userId}/status`, {
        is_active: isActive,
      });

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to update user status"
        );
      }
    } catch (error) {
      console.log("Update user status error:", error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(userId: string): Promise<void> {
    try {
      const response = await apiClient.post(`/users/${userId}/delete`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete user");
      }
    } catch (error: unknown) {
      console.log("Delete user error:", error);

      // Handle specific error cases
      if (error && typeof error === "object" && "response" in error) {
        const errorResponse = error as {
          response?: { status?: number; data?: { message?: string } };
        };
        if (errorResponse.response?.status === 404) {
          throw new Error("Không tìm thấy người dùng để xóa.");
        } else if (errorResponse.response?.status === 403) {
          throw new Error("Bạn không có quyền xóa người dùng này.");
        } else if (errorResponse.response?.status === 500) {
          throw new Error("Lỗi máy chủ. Vui lòng thử lại sau.");
        } else if (errorResponse.response?.status === 401) {
          throw new Error(
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
          );
        }
      }
      const errorMessage =
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : "Không thể xóa người dùng. Vui lòng thử lại.";
      throw new Error(errorMessage);
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStatistics(): Promise<UserStatistics> {
    try {
      const response = await apiClient.get("/users/statistics");

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch user statistics"
        );
      }
    } catch (error) {
      console.log("Get user statistics error:", error);
      throw error;
    }
  }

  /**
   * Search users
   */
  static async searchUsers(
    query: string,
    params: GetAllUsersRequest = {}
  ): Promise<GetAllUsersResponse> {
    try {
      const queryParams = new URLSearchParams();

      queryParams.append("search", query);

      if (params.page !== undefined) {
        queryParams.append("page", params.page.toString());
      }
      if (params.size !== undefined) {
        queryParams.append("size", params.size.toString());
      }
      if (params.direction) {
        queryParams.append("direction", params.direction);
      }
      if (params.sort) {
        queryParams.append("sort", params.sort);
      }
      if (params.userType) {
        queryParams.append("userType", params.userType);
      }

      const response = await apiClient.get(
        `/users/get-all?${queryParams.toString()}`
      );

      if (response.data.success && response.data.data) {
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to search users");
      }
    } catch (error) {
      console.log("Search users error:", error);
      throw error;
    }
  }

  /**
   * Export users to CSV
   */
  static async exportUsers(params: GetAllUsersRequest = {}): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams();

      if (params.userType) {
        queryParams.append("userType", params.userType);
      }

      const response = await apiClient.get(
        `/users/export?${queryParams.toString()}`,
        {
          responseType: "blob",
        }
      );

      return response.data;
    } catch (error) {
      console.log("Export users error:", error);
      throw error;
    }
  }

  /**
   * Create new user (Customer or Staff)
   */
  static async createUser(
    userData: CreateUserRequest
  ): Promise<CreateUserResponse> {
    try {
      console.log("Creating user with data:", userData);

      const response = await apiClient.post("/users/create", userData);

      console.log("Create user API response:", response);

      if (response.data.success && response.data.data) {
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to create user");
      }
    } catch (error: unknown) {
      console.log("Create user error details:", error);

      // Handle specific error cases
      if (error && typeof error === "object" && "response" in error) {
        const errorResponse = error as {
          response?: { status?: number; data?: { message?: string } };
        };
        if (errorResponse.response?.status === 400) {
          // Bad Request - validation errors
          const errorMessage =
            errorResponse.response.data?.message ||
            "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.";
          throw new Error(errorMessage);
        } else if (errorResponse.response?.status === 409) {
          // Conflict - email already exists
          const errorMessage =
            errorResponse.response.data?.message ||
            "Email đã tồn tại trong hệ thống.";
          throw new Error(errorMessage);
        } else if (errorResponse.response?.status === 500) {
          // Server error
          throw new Error("Lỗi máy chủ. Vui lòng thử lại sau.");
        } else if (errorResponse.response?.status === 401) {
          // Unauthorized
          throw new Error(
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
          );
        } else if (errorResponse.response?.status === 403) {
          // Forbidden
          throw new Error("Bạn không có quyền thực hiện thao tác này.");
        }
      }
      // Other errors
      const errorMessage =
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : "Không thể tạo người dùng. Vui lòng thử lại.";
      throw new Error(errorMessage);
    }
  }

  /**
   * Update user by ID
   */
  static async updateUser(
    userId: string,
    userData: UpdateUserRequest
  ): Promise<UpdateUserResponse> {
    try {
      console.log("Updating user with data:", userData);
      console.log("User ID:", userId);
      console.log("API endpoint:", `/users/${userId}/update`);

      const response = await apiClient.post(
        `/users/${userId}/update`,
        userData
      );

      console.log("Update user API response:", response);
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);

      if (response.data.success && response.data.data) {
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to update user");
      }
    } catch (error: unknown) {
      console.log("Update user error details:", error);
      console.log("Error type:", typeof error);
      console.log("Error message:", error instanceof Error ? error.message : "Unknown error");

      // Handle specific error cases
      if (error && typeof error === "object" && "response" in error) {
        const errorResponse = error as {
          response?: { 
            status?: number; 
            data?: { message?: string; success?: boolean };
            statusText?: string;
          };
        };

        console.log("Error response details:", {
          status: errorResponse.response?.status,
          statusText: errorResponse.response?.statusText,
          data: errorResponse.response?.data,
        });
        if (errorResponse.response?.status === 400) {
          // Bad Request - validation errors
          const errorMessage =
            errorResponse.response.data?.message ||
            "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.";
          throw new Error(errorMessage);
        } else if (errorResponse.response?.status === 404) {
          // Not Found - user not found
          throw new Error("Không tìm thấy người dùng.");
        } else if (errorResponse.response?.status === 409) {
          // Conflict - email already exists
          const errorMessage =
            errorResponse.response.data?.message ||
            "Email đã tồn tại trong hệ thống.";
          throw new Error(errorMessage);
        } else if (errorResponse.response?.status === 500) {
          // Server error
          throw new Error("Lỗi máy chủ. Vui lòng thử lại sau.");
        } else if (errorResponse.response?.status === 401) {
          // Unauthorized
          throw new Error(
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
          );
        } else if (errorResponse.response?.status === 403) {
          // Forbidden
          throw new Error("Bạn không có quyền thực hiện thao tác này.");
        }
      }
      // Other errors
      const errorMessage =
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : "Không thể cập nhật người dùng. Vui lòng thử lại.";
      throw new Error(errorMessage);
    }
  }
}
