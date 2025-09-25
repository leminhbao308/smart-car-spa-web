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
    } catch (error: any) {
      console.log("Get all users error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
      });

      // Provide more specific error messages
      if (error.response?.status === 500) {
        throw new Error("Lỗi máy chủ. Vui lòng thử lại sau.");
      } else if (error.response?.status === 401) {
        throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else if (error.response?.status === 403) {
        throw new Error("Bạn không có quyền truy cập tài nguyên này.");
      } else if (error.response?.status === 404) {
        throw new Error("Không tìm thấy dữ liệu người dùng.");
      } else {
        throw error;
      }
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
      const response = await apiClient.patch(`/users/${userId}/status`, {
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
      const response = await apiClient.delete(`/users/${userId}`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete user");
      }
    } catch (error) {
      console.log("Delete user error:", error);
      throw error;
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
        `/users/search?${queryParams.toString()}`
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
    } catch (error: any) {
      console.log("Create user error details:", error);

      // Handle specific error cases
      if (error.response?.status === 400) {
        // Bad Request - validation errors
        const errorMessage =
          error.response.data?.message || "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.";
        throw new Error(errorMessage);
      } else if (error.response?.status === 409) {
        // Conflict - email already exists
        const errorMessage =
          error.response.data?.message || "Email đã tồn tại trong hệ thống.";
        throw new Error(errorMessage);
      } else if (error.response?.status === 500) {
        // Server error
        throw new Error("Lỗi máy chủ. Vui lòng thử lại sau.");
      } else if (error.response?.status === 401) {
        // Unauthorized
        throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else if (error.response?.status === 403) {
        // Forbidden
        throw new Error("Bạn không có quyền thực hiện thao tác này.");
      } else {
        // Other errors
        const errorMessage = error.message || error.response?.data?.message || "Không thể tạo người dùng. Vui lòng thử lại.";
        throw new Error(errorMessage);
      }
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

      const response = await apiClient.post(
        `/users/${userId}/update`,
        userData
      );

      console.log("Update user API response:", response);

      if (response.data.success && response.data.data) {
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to update user");
      }
    } catch (error: any) {
      console.log("Update user error details:", error);

      // Handle specific error cases
      if (error.response?.status === 400) {
        // Bad Request - validation errors
        const errorMessage =
          error.response.data?.message || "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.";
        throw new Error(errorMessage);
      } else if (error.response?.status === 404) {
        // Not Found - user not found
        throw new Error("Không tìm thấy người dùng.");
      } else if (error.response?.status === 409) {
        // Conflict - email already exists
        const errorMessage =
          error.response.data?.message || "Email đã tồn tại trong hệ thống.";
        throw new Error(errorMessage);
      } else if (error.response?.status === 500) {
        // Server error
        throw new Error("Lỗi máy chủ. Vui lòng thử lại sau.");
      } else if (error.response?.status === 401) {
        // Unauthorized
        throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else if (error.response?.status === 403) {
        // Forbidden
        throw new Error("Bạn không có quyền thực hiện thao tác này.");
      } else {
        // Other errors
        const errorMessage = error.message || error.response?.data?.message || "Không thể cập nhật người dùng. Vui lòng thử lại.";
        throw new Error(errorMessage);
      }
    }
  }
}
