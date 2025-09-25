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
      console.log("Making API call to:", url);
      console.log("Base URL:", process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081");
      
      const response = await apiClient.get(url);
      console.log("API Response received:", response);

      if (response.data.success && response.data.data) {
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch users");
      }
    } catch (error: any) {
      console.error("Get all users error details:");
      console.error("- Error type:", typeof error);
      console.error("- Error message:", error?.message);
      console.error("- Error response:", error?.response);
      console.error("- Error status:", error?.response?.status);
      console.error("- Error data:", error?.response?.data);
      console.error("- Full error:", error);
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
      console.error("Get user by ID error:", error);
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
      console.error("Update user status error:", error);
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
      console.error("Delete user error:", error);
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
      console.error("Get user statistics error:", error);
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
      console.error("Search users error:", error);
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
      console.error("Export users error:", error);
      throw error;
    }
  }
}
