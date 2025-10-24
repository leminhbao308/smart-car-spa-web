/**
 * Service Process Management Service
 * Handles all service process-related API calls
 * Updated to match backend ServiceProcessManagementController
 */

import apiClient from "../axios";
import {
  ServiceProcessInfoDto,
  ServiceProcessStepInfoDto,
  ServiceProcessStepProductInfoDto,
  ServiceProcessFilterParam,
  CreateServiceProcessRequest,
  UpdateServiceProcessRequest,
  CreateServiceProcessStepRequest,
  UpdateServiceProcessStepRequest,
  CreateServiceProcessStepProductRequest,
  UpdateServiceProcessStepProductRequest,
} from "../types";

export class ServiceProcessService {
  /**
   * Get all service processes with pagination and filtering
   */
  // static async getAllServiceProcesses(
  //   filterParam?: ServiceProcessFilterParam,
  //   pageable?: { page: number; size: number; sort?: string; direction?: string }
  // ): Promise<ServiceProcessInfoDto[]> {
  //   try {
  //     const queryParams = new URLSearchParams();

  //     if (filterParam) {
  //       if (filterParam.search) {
  //         queryParams.append("search", filterParam.search);
  //       }
  //       if (filterParam.branchId) {
  //         queryParams.append("branchId", filterParam.branchId);
  //       }
  //       if (filterParam.isActive !== undefined) {
  //         queryParams.append("isActive", filterParam.isActive.toString());
  //       }
  //       if (filterParam.isDefault !== undefined) {
  //         queryParams.append("isDefault", filterParam.isDefault.toString());
  //       }
  //     }

  //     if (pageable) {
  //       queryParams.append("page", pageable.page.toString());
  //       queryParams.append("size", pageable.size.toString());
  //       if (pageable.sort) {
  //         queryParams.append("sort", pageable.sort);
  //       }
  //       if (pageable.direction) {
  //         queryParams.append("direction", pageable.direction);
  //       }
  //     }

  //     const url = `/service-processes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  //     const response = await apiClient.get(url);

  //     // Backend returns Page<ServiceProcessInfoDto> directly
  //     if (response.data && Array.isArray(response.data)) {
  //       return response.data;
  //     } else if (response.data && response.data.content) {
  //       return response.data.content;
  //     } else {
  //       throw new Error("Invalid response format");
  //     }
  //   } catch (error) {
  //     console.error("Get all service processes error:", error);
  //     throw error;
  //   }
  // }

  /**
   * Get service process by ID
   */
  static async getServiceProcessById(
    processId: string
  ): Promise<ServiceProcessInfoDto> {
    try {
      const response = await apiClient.get(`/service-processes/${processId}`);

      // Backend returns ServiceProcessInfoDto directly
      if (response.data) {
        return response.data;
      } else {
        throw new Error("Failed to fetch service process");
      }
    } catch (error) {
      console.error("Get service process by ID error:", error);
      throw error;
    }
  }

  /**
   * Get service process by code
   */
  static async getServiceProcessByCode(
    code: string
  ): Promise<ServiceProcessInfoDto> {
    try {
      const response = await apiClient.get(`/service-processes/code/${code}`);

      // Backend returns ServiceProcessInfoDto directly
      if (response.data) {
        return response.data;
      } else {
        throw new Error("Failed to fetch service process");
      }
    } catch (error) {
      console.error("Get service process by code error:", error);
      throw error;
    }
  }

  /**
   * Get service process by service ID
   */
  static async getServiceProcessByServiceId(
    serviceId: string
  ): Promise<ServiceProcessInfoDto> {
    try {
      const response = await apiClient.get(
        `/service-processes/service/${serviceId}`
      );

      // Backend returns ServiceProcessInfoDto directly
      if (response.data) {
        return response.data;
      } else {
        throw new Error("Failed to fetch service process by service ID");
      }
    } catch (error) {
      console.error("Get service process by service ID error:", error);
      throw error;
    }
  }

  /**
   * Get default service process
   */
  static async getDefaultServiceProcess(): Promise<ServiceProcessInfoDto> {
    try {
      const response = await apiClient.get("/service-processes/default");

      // Backend returns ServiceProcessInfoDto directly
      if (response.data) {
        return response.data;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch default service process"
        );
      }
    } catch (error) {
      console.error("Get default service process error:", error);
      throw error;
    }
  }

  /**
   * Get all active service processes
   */
  // static async getAllActiveServiceProcesses(): Promise<ServiceProcessInfoDto[]> {
  //   try {
  //     // Use the main endpoint and filter for active processes
  //     const response = await apiClient.get("/service-processes");

  //     // Backend returns Page<ServiceProcessInfoDto> directly
  //     if (response.data && Array.isArray(response.data)) {
  //       // Filter for active processes
  //       const activeProcesses = response.data.filter((process: ServiceProcessInfoDto) => process.isActive);
  //       return activeProcesses;
  //     } else if (response.data && response.data.content) {
  //       // If response is paginated, filter for active processes
  //       const activeProcesses = response.data.content.filter((process: ServiceProcessInfoDto) => process.isActive);
  //       return activeProcesses;
  //     } else {
  //       console.warn("Unexpected response format for service processes:", response.data);
  //       return []; // Return empty array instead of throwing error
  //     }
  //   } catch (error) {
  //     console.error("Get active service processes error:", error);
  //     // Return empty array instead of throwing error to prevent UI crashes
  //     return [];
  //   }
  // }

  /**
   * Create new service process
   */
  static async createServiceProcess(
    processData: CreateServiceProcessRequest
  ): Promise<ServiceProcessInfoDto> {
    try {
      const response = await apiClient.post("/service-processes", processData);

      if (response.data) {
        return response.data;
      } else {
        throw new Error("Failed to create service process");
      }
    } catch (error) {
      console.error("Create service process error:", error);
      throw error;
    }
  }

  /**
   * Update service process
   */
  static async updateServiceProcess(
    processId: string,
    processData: UpdateServiceProcessRequest
  ): Promise<ServiceProcessInfoDto> {
    try {
      const response = await apiClient.post(
        `/service-processes/${processId}/update`,
        processData
      );

      // Backend returns ServiceProcessInfoDto directly
      if (response.data) {
        return response.data;
      } else {
        throw new Error("Failed to update service process");
      }
    } catch (error) {
      console.error("Update service process error:", error);
      throw error;
    }
  }

  /**
   * Delete service process
   */
  static async deleteServiceProcess(processId: string): Promise<void> {
    try {
      console.log("Deleting service process with ID:", processId);

      const response = await apiClient.post(
        `/service-processes/${processId}/delete`
      );
      console.log("Delete service process API response:", response);

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to delete service process"
        );
      }
    } catch (error) {
      console.error("Delete service process error:", error);
      throw error;
    }
  }

  /**
   * Set default service process
   */
  static async setDefaultServiceProcess(
    processId: string
  ): Promise<ServiceProcessInfoDto> {
    try {
      console.log("Setting default service process with ID:", processId);

      const response = await apiClient.post(
        `/service-processes/${processId}/set-default`
      );
      console.log("Set default service process API response:", response);

      // Backend returns ServiceProcessInfoDto directly
      if (response.data) {
        return response.data;
      } else {
        throw new Error("Failed to set default service process");
      }
    } catch (error) {
      console.error("Set default service process error:", error);
      throw error;
    }
  }

  // ========== SERVICE PROCESS STEP MANAGEMENT ==========

  /**
   * Get service process steps
   */
  static async getServiceProcessSteps(
    processId: string
  ): Promise<ServiceProcessStepInfoDto[]> {
    try {
      const response = await apiClient.get(
        `/service-processes/${processId}/steps`
      );

      // Backend returns List<ServiceProcessStepInfoDto> directly
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else {
        throw new Error("Failed to fetch service process steps");
      }
    } catch (error) {
      console.error("Get service process steps error:", error);
      throw error;
    }
  }

  /**
   * Get service process step by ID
   */
  static async getServiceProcessStepById(
    stepId: string
  ): Promise<ServiceProcessStepInfoDto> {
    try {
      const response = await apiClient.get(
        `/service-processes/steps/${stepId}`
      );

      // Backend returns ServiceProcessStepInfoDto directly
      if (response.data) {
        return response.data;
      } else {
        throw new Error("Failed to fetch service process step");
      }
    } catch (error) {
      console.error("Get service process step by ID error:", error);
      throw error;
    }
  }

  /**
   * Add step to service process
   */
  static async addStepToServiceProcess(
    processId: string,
    stepData: CreateServiceProcessStepRequest
  ): Promise<ServiceProcessStepInfoDto> {
    try {
      console.log("Adding step to service process with data:", stepData);

      const response = await apiClient.post(
        `/service-processes/${processId}/steps`,
        stepData
      );
      console.log("Add step to service process API response:", response);

      // Backend returns ServiceProcessStepInfoDto directly
      if (response.data) {
        return response.data;
      } else {
        throw new Error("Failed to add step to service process");
      }
    } catch (error) {
      console.error("Add step to service process error:", error);
      throw error;
    }
  }

  /**
   * Update service process step
   */
  static async updateServiceProcessStep(
    stepId: string,
    stepData: UpdateServiceProcessStepRequest
  ): Promise<ServiceProcessStepInfoDto> {
    try {
      console.log("Updating service process step with data:", stepData);

      const response = await apiClient.post(
        `/service-processes/steps/${stepId}/update`,
        stepData
      );
      console.log("Update service process step API response:", response);

      // Backend returns ServiceProcessStepInfoDto directly
      if (response.data) {
        return response.data;
      } else {
        throw new Error("Failed to update service process step");
      }
    } catch (error) {
      console.error("Update service process step error:", error);
      throw error;
    }
  }

  /**
   * Delete service process step
   */
  static async deleteServiceProcessStep(stepId: string): Promise<void> {
    try {
      console.log("Deleting service process step with ID:", stepId);

      const response = await apiClient.post(
        `/service-processes/steps/${stepId}/delete`
      );
      console.log("Delete service process step API response:", response);

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to delete service process step"
        );
      }
    } catch (error) {
      console.error("Delete service process step error:", error);
      throw error;
    }
  }

  // ========== SERVICE PROCESS STEP PRODUCT MANAGEMENT ==========

  /**
   * Get service process step products
   */
  static async getServiceProcessStepProducts(
    stepId: string
  ): Promise<ServiceProcessStepProductInfoDto[]> {
    try {
      const response = await apiClient.get(
        `/service-processes/steps/${stepId}/products`
      );

      // Backend returns List<ServiceProcessStepProductInfoDto> directly
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else {
        throw new Error("Failed to fetch service process step products");
      }
    } catch (error) {
      console.error("Get service process step products error:", error);
      throw error;
    }
  }

  /**
   * Get all products for service process
   */
  static async getServiceProcessProducts(
    processId: string
  ): Promise<ServiceProcessStepProductInfoDto[]> {
    try {
      const response = await apiClient.get(
        `/service-processes/${processId}/products`
      );

      // Backend returns List<ServiceProcessStepProductInfoDto> directly
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else {
        throw new Error("Failed to fetch service process products");
      }
    } catch (error) {
      console.error("Get service process products error:", error);
      throw error;
    }
  }

  /**
   * Get service process step product by ID
   */
  static async getServiceProcessStepProductById(
    productId: string
  ): Promise<ServiceProcessStepProductInfoDto> {
    try {
      const response = await apiClient.get(
        `/service-processes/step-products/${productId}`
      );

      // Backend returns ServiceProcessStepProductInfoDto directly
      if (response.data) {
        return response.data;
      } else {
        throw new Error("Failed to fetch service process step product");
      }
    } catch (error) {
      console.error("Get service process step product by ID error:", error);
      throw error;
    }
  }

  /**
   * Add product to step
   */
  static async addProductToStep(
    stepId: string,
    productData: CreateServiceProcessStepProductRequest
  ): Promise<ServiceProcessStepProductInfoDto> {
    try {
      console.log("Adding product to step with data:", productData);

      const response = await apiClient.post(
        `/service-processes/steps/${stepId}/products`,
        productData
      );
      console.log("Add product to step API response:", response);

      // Backend returns ServiceProcessStepProductInfoDto directly
      if (response.data) {
        return response.data;
      } else {
        throw new Error("Failed to add product to step");
      }
    } catch (error) {
      console.error("Add product to step error:", error);
      throw error;
    }
  }

  /**
   * Update service process step product
   */
  static async updateServiceProcessStepProduct(
    productId: string,
    productData: UpdateServiceProcessStepProductRequest
  ): Promise<ServiceProcessStepProductInfoDto> {
    try {
      console.log(
        "Updating service process step product with data:",
        productData
      );

      const response = await apiClient.post(
        `/service-processes/step-products/${productId}/update`,
        productData
      );
      console.log(
        "Update service process step product API response:",
        response
      );

      // Backend returns ServiceProcessStepProductInfoDto directly
      if (response.data) {
        return response.data;
      } else {
        throw new Error("Failed to update service process step product");
      }
    } catch (error) {
      console.error("Update service process step product error:", error);
      throw error;
    }
  }

  /**
   * Delete service process step product
   */
  static async deleteServiceProcessStepProduct(
    productId: string
  ): Promise<void> {
    try {
      console.log("Deleting service process step product with ID:", productId);

      const response = await apiClient.post(
        `/service-processes/step-products/${productId}/delete`
      );
      console.log(
        "Delete service process step product API response:",
        response
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message ||
            "Failed to delete service process step product"
        );
      }
    } catch (error) {
      console.error("Delete service process step product error:", error);
      throw error;
    }
  }
}
