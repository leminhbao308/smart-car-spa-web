"use client";

import { useState, useEffect, useCallback } from "react";
import { VehicleService } from "../services/vehicle.service";
import {
  VehicleModel,
  GetAllVehicleModelsRequest,
} from "../types";

/**
 * Hook for all vehicle models data with pagination and filtering
 */
export const useVehicleModels = (params: GetAllVehicleModelsRequest = {}) => {
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    total_elements: 0,
    total_pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = useCallback(async (currentParams: GetAllVehicleModelsRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await VehicleService.getAllVehicleModels(currentParams);
      setModels(response.data.content);
      setPagination({
        page: response.data.page,
        size: response.data.size,
        total_elements: response.data.total_elements,
        total_pages: response.data.total_pages,
      });
    } catch (err) {
      console.error("Failed to fetch vehicle models:", err);
      setError("Failed to load vehicle models.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModels(params);
  }, [fetchModels, params]);

  const refreshModels = useCallback(() => {
    fetchModels(params);
  }, [fetchModels, params]);

  return { models, pagination, loading, error, refreshModels };
};

/**
 * Hook for vehicle models dropdown data
 */
export const useVehicleModelsDropdown = () => {
  const [dropdownData, setDropdownData] = useState<{model_id: string, model_name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDropdownData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await VehicleService.getVehicleModelsForDropdown();
      setDropdownData(response.data);
    } catch (err) {
      console.error("Failed to fetch vehicle models for dropdown:", err);
      setError("Failed to load vehicle models for dropdown.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDropdownData();
  }, [fetchDropdownData]);

  return { dropdownData, loading, error, refetch: fetchDropdownData };
};

/**
 * Hook for a single vehicle model by ID
 */
export const useVehicleModel = (modelId: string | null) => {
  const [model, setModel] = useState<VehicleModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModel = useCallback(async () => {
    if (!modelId) {
      setModel(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const fetchedModel = await VehicleService.getVehicleModelById(modelId);
      setModel(fetchedModel);
    } catch (err) {
      console.error(`Failed to fetch vehicle model with ID ${modelId}:`, err);
      setError("Failed to load vehicle model details.");
    } finally {
      setLoading(false);
    }
  }, [modelId]);

  useEffect(() => {
    fetchModel();
  }, [fetchModel]);

  const refreshModel = useCallback(() => {
    fetchModel();
  }, [fetchModel]);

  return { model, loading, error, refreshModel };
};