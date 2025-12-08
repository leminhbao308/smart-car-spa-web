import apiClient from "../axios";
import {
  Supplier,
  SupplierListResponse,
  SupplierResponse,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  SupplierRequest,
} from "../types/supplier.types";

export class SupplierService {
  /**
   * Get all suppliers with pagination and filtering
   */
  static async getAllSuppliers(
    params: SupplierRequest = {}
  ): Promise<SupplierListResponse> {
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
      if (params.supplier_name) {
        queryParams.append("supplier_name", params.supplier_name);
      }
      if (params.contact_person) {
        queryParams.append("contact_person", params.contact_person);
      }
      if (params.phone) {
        queryParams.append("phone", params.phone);
      }
      if (params.email) {
        queryParams.append("email", params.email);
      }
      if (params.address) {
        queryParams.append("address", params.address);
      }
      if (params.bank_name) {
        queryParams.append("bank_name", params.bank_name);
      }
      if (params.has_contact_person !== undefined) {
        queryParams.append("has_contact_person", params.has_contact_person.toString());
      }
      if (params.has_phone !== undefined) {
        queryParams.append("has_phone", params.has_phone.toString());
      }
      if (params.has_email !== undefined) {
        queryParams.append("has_email", params.has_email.toString());
      }
      if (params.has_address !== undefined) {
        queryParams.append("has_address", params.has_address.toString());
      }
      if (params.has_bank_info !== undefined) {
        queryParams.append("has_bank_info", params.has_bank_info.toString());
      }

      const url = `/suppliers/get-all?${queryParams.toString()}`;

      const response = await apiClient.get<SupplierListResponse>(url);
      console.log("Get all suppliers API response:", response);

      if (response.data.success && response.data.data) {
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch suppliers");
      }
    } catch (error) {
      console.log("Get all suppliers error:", error);
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
      console.log("Get supplier by ID error:", error);
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
      console.log("Create supplier error:", error);
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
      console.log("Update supplier error:", error);
      throw error;
    }
  }

  /**
   * Delete supplier
   */
  static async deleteSupplier(supplierId: string): Promise<void> {
    try {
      console.log("Deleting supplier with ID:", supplierId);

      const response = await apiClient.post(
        `/suppliers/${supplierId}/delete`
      );
      console.log("Delete supplier API response:", response);

      if (response.data.success) {
        return;
      } else {
        throw new Error(response.data.message || "Failed to delete supplier");
      }
    } catch (error) {
      console.log("Delete supplier error:", error);
      throw error;
    }
  }
}
