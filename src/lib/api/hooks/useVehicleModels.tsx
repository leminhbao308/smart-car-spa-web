"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { message } from "antd";
import { VehicleService } from "../services/vehicle.service";
import {
  VehicleModel,
  GetAllVehicleModelsRequest,
  GetAllVehicleModelsResponse,
  CreateVehicleModelRequest,
  CreateVehicleModelResponse,
  UpdateVehicleModelRequest,
  UpdateVehicleModelResponse,
  DeleteVehicleModelResponse,
} from "../types";

interface UseVehicleModelsState {
  models: VehicleModel[];
  pagination: {
    page: number;
    size: number;
    total_elements: number;
    total_pages: number;
    first: boolean;
    last: boolean;
    has_next: boolean;
    has_previous: boolean;
  } | null;
  isLoading: boolean;
  error: string | null;
}

interface UseVehicleModelsReturn extends UseVehicleModelsState {
  // Fetch methods
  fetchModels: (params?: GetAllVehicleModelsRequest) => Promise<void>;
  refreshModels: () => Promise<void>;
  
  // CRUD methods
  createModel: (modelData: CreateVehicleModelRequest) => Promise<CreateVehicleModelResponse['data'] | null>;
  updateModel: (modelId: string, modelData: UpdateVehicleModelRequest) => Promise<UpdateVehicleModelResponse['data'] | null>;
  deleteModel: (modelId: string) => Promise<DeleteVehicleModelResponse['data'] | null>;
  toggleModelStatus: (modelId: string, isActive: boolean) => Promise<boolean>;
  
  // Utility methods
  getModelById: (modelId: string) => Promise<VehicleModel | null>;
  clearError: () => void;
}

export const useVehicleModels = (initialParams?: GetAllVehicleModelsRequest): UseVehicleModelsReturn => {
  const initialParamsRef = useRef(initialParams);
  const fetchModelsRef = useRef<((params?: GetAllVehicleModelsRequest) => Promise<void>) | null>(null);
  
  const [state, setState] = useState<UseVehicleModelsState>({
    models: [],
    pagination: null,
    isLoading: false,
    error: null,
  });

  // Fetch models with pagination and filtering
  const fetchModels = useCallback(async (params?: GetAllVehicleModelsRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const requestParams = { ...initialParamsRef.current, ...params };
      const response: GetAllVehicleModelsResponse = await VehicleService.getAllVehicleModels(requestParams);
      
      setState(prev => ({
        ...prev,
        models: response.data.content,
        pagination: {
          page: response.data.page,
          size: response.data.size,
          total_elements: response.data.total_elements,
          total_pages: response.data.total_pages,
          first: response.data.first,
          last: response.data.last,
          has_next: response.data.has_next,
          has_previous: response.data.has_previous,
        },
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error fetching vehicle models:", error);
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi tải danh sách model xe";
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      message.error(errorMessage);
    }
  }, []);

  // Store fetchModels in ref
  fetchModelsRef.current = fetchModels;

  // Refresh models with current parameters
  const refreshModels = useCallback(async () => {
    if (fetchModelsRef.current) {
      await fetchModelsRef.current();
    }
  }, []);

  // Create new model
  const createModel = useCallback(async (modelData: CreateVehicleModelRequest): Promise<CreateVehicleModelResponse['data'] | null> => {
    try {
      const newModel = await VehicleService.createVehicleModel(modelData);
      message.success("Tạo model xe thành công!");
      
      // Refresh the list to include the new model
      await refreshModels();
      
      return newModel;
    } catch (error) {
      console.error("Error creating vehicle model:", error);
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi tạo model xe";
      message.error(errorMessage);
      return null;
    }
  }, [refreshModels]);

  // Update existing model
  const updateModel = useCallback(async (modelId: string, modelData: UpdateVehicleModelRequest): Promise<UpdateVehicleModelResponse['data'] | null> => {
    try {
      const updatedModel = await VehicleService.updateVehicleModel(modelId, modelData);
      message.success("Cập nhật model xe thành công!");
      
      // Refresh the list to include the updated model
      await refreshModels();
      
      return updatedModel;
    } catch (error) {
      console.error("Error updating vehicle model:", error);
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi cập nhật model xe";
      message.error(errorMessage);
      return null;
    }
  }, [refreshModels]);

  // Delete model
  const deleteModel = useCallback(async (modelId: string): Promise<DeleteVehicleModelResponse['data'] | null> => {
    try {
      const result = await VehicleService.deleteVehicleModel(modelId);
      message.success("Xóa model xe thành công!");
      
      // Refresh the list to reflect the deletion
      await refreshModels();
      
      return result;
    } catch (error) {
      console.error("Error deleting vehicle model:", error);
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi xóa model xe";
      message.error(errorMessage);
      return null;
    }
  }, [refreshModels]);

  // Toggle model status (active/inactive)
  const toggleModelStatus = useCallback(async (modelId: string, isActive: boolean): Promise<boolean> => {
    try {
      await VehicleService.updateVehicleModelStatus(modelId, isActive);
      const action = isActive ? "kích hoạt" : "vô hiệu hóa";
      message.success(`${action} model xe thành công!`);
      
      // Update the model status in the current list
      setState(prev => ({
        ...prev,
        models: prev.models.map(model => 
          model.model_id === modelId ? { ...model, is_active: isActive } : model
        ),
      }));
      
      return true;
    } catch (error) {
      console.error("Error toggling vehicle model status:", error);
      const action = isActive ? "kích hoạt" : "vô hiệu hóa";
      const errorMessage = error instanceof Error ? error.message : `Có lỗi xảy ra khi ${action} model xe`;
      message.error(errorMessage);
      return false;
    }
  }, []);

  // Get model by ID
  const getModelById = useCallback(async (modelId: string): Promise<VehicleModel | null> => {
    try {
      const model = await VehicleService.getVehicleModelById(modelId);
      return model;
    } catch (error) {
      console.error("Error fetching vehicle model by ID:", error);
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi tải thông tin model xe";
      message.error(errorMessage);
      return null;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Initial fetch
  useEffect(() => {
    if (fetchModelsRef.current) {
      fetchModelsRef.current();
    }
  }, []);

  return {
    ...state,
    fetchModels,
    refreshModels,
    createModel,
    updateModel,
    deleteModel,
    toggleModelStatus,
    getModelById,
    clearError,
  };
};
