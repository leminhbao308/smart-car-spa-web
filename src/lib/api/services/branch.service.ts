import apiClient from "../axios";
import {
  Branch,
  BranchListResponse,
  BranchResponse,
  CreateBranchRequest,
  UpdateBranchRequest,
  DeleteBranchResponse,
  BranchDisplay,
} from "../types/branch.types";

export class BranchService {

  /**
   * Transform branch data to display format
   */
  private static transformToDisplayFormat(branch: Branch): BranchDisplay {
    return {
      ...branch,
      // Các fields này không còn tồn tại trong backend DTO mới
      // Chỉ giữ lại các fields cần thiết cho display
      operating_hours: {
        monday: { open: "08:00", close: "20:00" },
        tuesday: { open: "08:00", close: "20:00" },
        wednesday: { open: "08:00", close: "20:00" },
        thursday: { open: "08:00", close: "20:00" },
        friday: { open: "08:00", close: "20:00" },
        saturday: { open: "08:00", close: "18:00" },
        sunday: { open: "09:00", close: "17:00" },
      },
      contact_info: {},
      facilities: [],
      services_offered: [],
    };
  }

  /**
   * Get all branches
   */
  static async getAllBranches(): Promise<{
    branches: BranchDisplay[];
    pagination: {
      page: number;
      size: number;
      total_elements: number;
      total_pages: number;
      first: boolean;
      last: boolean;
      has_next: boolean;
      has_previous: boolean;
    };
  }> {
    try {
      console.log("Fetching all branches...");

      const response = await apiClient.get<BranchListResponse>("/branches/get-all");
      console.log("Get all branches API response:", response);

      if (response.data.success && response.data.data) {
        // Handle both array and single object responses
        const dataArray = Array.isArray(response.data.data.content) 
          ? response.data.data.content 
          : [response.data.data.content];
          
        const transformedBranches = dataArray.map(branch => 
          this.transformToDisplayFormat(branch)
        );
        
        return {
          branches: transformedBranches,
          pagination: {
            page: response.data.data.page || 0,
            size: response.data.data.size || dataArray.length,
            total_elements: response.data.data.total_elements || dataArray.length,
            total_pages: response.data.data.total_pages || 1,
            first: response.data.data.first || true,
            last: response.data.data.last || true,
            has_next: response.data.data.has_next || false,
            has_previous: response.data.data.has_previous || false,
          },
        };
      } else {
        throw new Error(response.data.message || "Failed to fetch branches");
      }
    } catch (error) {
      console.log("Get all branches error:", error);
      throw error;
    }
  }

  /**
   * Get branch by ID
   */
  static async getBranchById(branchId: string): Promise<BranchDisplay> {
    try {
      console.log("Fetching branch with ID:", branchId);

      const response = await apiClient.get<BranchResponse>(`/branches/${branchId}`);
      console.log("Get branch by ID API response:", response);

      if (response.data.success && response.data.data) {
        return this.transformToDisplayFormat(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch branch");
      }
    } catch (error) {
      console.log("Get branch by ID error:", error);
      throw error;
    }
  }

  /**
   * Create new branch
   */
  static async createBranch(data: CreateBranchRequest): Promise<BranchDisplay> {
    try {
      console.log("Creating branch with data:", data);

      const response = await apiClient.post<BranchResponse>("/branches/create", data);
      console.log("Create branch API response:", response);

      if (response.data.success && response.data.data) {
        return this.transformToDisplayFormat(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to create branch");
      }
    } catch (error) {
      console.log("Create branch error:", error);
      throw error;
    }
  }

  /**
   * Update branch
   */
  static async updateBranch(branchId: string, data: UpdateBranchRequest): Promise<BranchDisplay> {
    try {
      console.log("Updating branch with ID:", branchId, "and data:", data);

      const response = await apiClient.post<BranchResponse>(
        `/branches/${branchId}/update`,
        data
      );
      console.log("Update branch API response:", response);

      if (response.data.success && response.data.data) {
        return this.transformToDisplayFormat(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to update branch");
      }
    } catch (error) {
      console.log("Update branch error:", error);
      throw error;
    }
  }

  /**
   * Delete branch
   */
  static async deleteBranch(branchId: string): Promise<void> {
    try {
      console.log("Deleting branch with ID:", branchId);

      const response = await apiClient.post<DeleteBranchResponse>(
        `/branches/${branchId}/delete`
      );
      console.log("Delete branch API response:", response);

      if (response.data.success) {
        return;
      } else {
        throw new Error(response.data.message || "Failed to delete branch");
      }
    } catch (error) {
      console.log("Delete branch error:", error);
      throw error;
    }
  }
}
