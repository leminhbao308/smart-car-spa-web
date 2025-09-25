/**
 * Role Management Service
 * Handles all role-related API calls
 */

import apiClient from "../axios";
import {
  GetAllRolesResponse,
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleResponse,
  Role,
} from "../types";

export class RoleService {
  /**
   * Get all roles
   */
  static async getAllRoles(): Promise<GetAllRolesResponse> {
    try {
      
      const response = await apiClient.get("/roles/get-all");
      console.log("Get all roles API response:", response);

      if (response.data.success && response.data.data) {
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch roles");
      }
    } catch (error: any) {
      console.log("Get all roles error details:", {
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
        throw new Error("Không tìm thấy dữ liệu vai trò.");
      } else {
        throw error;
      }
    }
  }

  /**
   * Get role by ID
   */
  static async getRoleById(roleId: string): Promise<Role> {
    try {
      const response = await apiClient.get(`/roles/${roleId}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch role");
      }
    } catch (error) {
      console.log("Get role by ID error:", error);
      throw error;
    }
  }

  /**
   * Create new role
   */
  static async createRole(roleData: CreateRoleRequest): Promise<RoleResponse> {
    try {
      console.log("Creating role with data:", roleData);
      
      const response = await apiClient.post("/roles/create", roleData);
      
      console.log("Create role API response:", response);

      if (response.data.success && response.data.data) {
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to create role");
      }
    } catch (error: any) {
      console.log("Create role error details:", error);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        // Bad Request - validation errors
        const errorMessage = error.response.data?.message || "Validation failed";
        throw new Error(errorMessage);
      } else if (error.response?.status === 409) {
        // Conflict - role code already exists
        const errorMessage = error.response.data?.message || "Role code already exists";
        throw new Error(errorMessage);
      } else if (error.response?.status === 500) {
        // Server error
        throw new Error("Server error occurred. Please try again later.");
      } else {
        // Other errors
        throw new Error(error.message || "Failed to create role");
      }
    }
  }

  /**
   * Update role
   */
  static async updateRole(
    roleId: string,
    roleData: UpdateRoleRequest
  ): Promise<RoleResponse> {
    try {
      console.log("Updating role with data:", roleData);
      
      const response = await apiClient.put(`/roles/${roleId}`, roleData);
      
      console.log("Update role API response:", response);

      if (response.data.success && response.data.data) {
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to update role");
      }
    } catch (error: any) {
      console.log("Update role error details:", error);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message || "Validation failed";
        throw new Error(errorMessage);
      } else if (error.response?.status === 404) {
        throw new Error("Role not found");
      } else if (error.response?.status === 500) {
        throw new Error("Server error occurred. Please try again later.");
      } else {
        throw new Error(error.message || "Failed to update role");
      }
    }
  }

  /**
   * Delete role
   */
  static async deleteRole(roleId: string): Promise<void> {
    try {
      const response = await apiClient.delete(`/roles/${roleId}`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete role");
      }
    } catch (error: any) {
      console.log("Delete role error:", error);
      
      if (error.response?.status === 404) {
        throw new Error("Role not found");
      } else if (error.response?.status === 409) {
        throw new Error("Cannot delete role that is currently in use");
      } else if (error.response?.status === 500) {
        throw new Error("Server error occurred. Please try again later.");
      } else {
        throw error;
      }
    }
  }

  /**
   * Get users by role
   */
  static async getUsersByRole(roleId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/roles/${roleId}/users`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch users by role");
      }
    } catch (error) {
      console.log("Get users by role error:", error);
      throw error;
    }
  }
}
