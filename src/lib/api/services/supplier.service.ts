import apiClient from "../axios";
import {
  Supplier,
  SupplierListResponse,
  SupplierResponse,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  DeleteSupplierResponse,
} from "../types/supplier.types";

export class SupplierService {
  /**
   * Get all suppliers with pagination
   */
  static async getAllSuppliers(): Promise<{
    suppliers: Supplier[];
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
      console.log("Fetching all suppliers...");

      const response = await apiClient.get<SupplierListResponse>(
        "/suppliers/get-all"
      );
      console.log("Get all suppliers API response:", response);

      if (response.data.success && response.data.data) {
        return {
          suppliers: response.data.data.content,
          pagination: {
            page: response.data.data.page,
            size: response.data.data.size,
            total_elements: response.data.data.total_elements,
            total_pages: response.data.data.total_pages,
            first: response.data.data.first,
            last: response.data.data.last,
            has_next: response.data.data.has_next,
            has_previous: response.data.data.has_previous,
          },
        };
      } else {
        throw new Error(response.data.message || "Failed to fetch suppliers");
      }
    } catch (error) {
      console.error("Get all suppliers error:", error);
      throw error;
    }
  }

  /**
   * Get supplier by ID
   */
  static async getSupplierById(supplierId: string): Promise<Supplier> {
    try {
      console.log("Fetching supplier with ID:", supplierId);

      const response = await apiClient.get<SupplierResponse>(
        `/suppliers/${supplierId}`
      );
      console.log("Get supplier by ID API response:", response);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch supplier");
      }
    } catch (error) {
      console.error("Get supplier by ID error:", error);
      throw error;
    }
  }

  /**
   * Create new supplier
   */
  static async createSupplier(data: CreateSupplierRequest): Promise<Supplier> {
    try {
      console.log("Creating supplier with data:", data);

      const response = await apiClient.post<SupplierResponse>(
        "/suppliers/create",
        data
      );
      console.log("Create supplier API response:", response);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to create supplier");
      }
    } catch (error) {
      console.error("Create supplier error:", error);
      throw error;
    }
  }

  /**
   * Update supplier
   */
  static async updateSupplier(
    supplierId: string,
    data: UpdateSupplierRequest
  ): Promise<Supplier> {
    try {
      console.log("Updating supplier with ID:", supplierId, "and data:", data);

      const response = await apiClient.post<SupplierResponse>(
        `/suppliers/${supplierId}/update`,
        data
      );
      console.log("Update supplier API response:", response);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to update supplier");
      }
    } catch (error) {
      console.error("Update supplier error:", error);
      throw error;
    }
  }

  /**
   * Delete supplier
   */
  static async deleteSupplier(supplierId: string): Promise<void> {
    try {
      console.log("Deleting supplier with ID:", supplierId);

      const response = await apiClient.post<DeleteSupplierResponse>(
        `/suppliers/${supplierId}/delete`
      );
      console.log("Delete supplier API response:", response);

      if (response.data.success) {
        return;
      } else {
        throw new Error(response.data.message || "Failed to delete supplier");
      }
    } catch (error) {
      console.error("Delete supplier error:", error);
      throw error;
    }
  }
}
