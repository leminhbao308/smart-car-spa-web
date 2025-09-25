"use client";

import { useState, useEffect, useCallback } from "react";
import { VehicleService } from "../services/vehicle.service";
import {
  VehicleType,
  VehicleTypeDropdownItem,
  GetAllVehicleTypesRequest,
} from "../types";

/**
 * Hook for vehicle types dropdown data
 */
export const useVehicleTypesDropdown = () => {
  const [dropdownData, setDropdownData] = useState<VehicleTypeDropdownItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDropdownData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await VehicleService.getVehicleTypesForDropdown();
      setDropdownData(response.data);
    } catch (err) {
      console.error("Failed to fetch vehicle types for dropdown:", err);
      setError("Failed to load vehicle types for dropdown.");
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
 * Hook for all vehicle types data with pagination and search
 */
export const useVehicleTypes = (params: GetAllVehicleTypesRequest = {}) => {
  const [types, setTypes] = useState<VehicleType[]>([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    total_elements: 0,
    total_pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTypes = useCallback(async (currentParams: GetAllVehicleTypesRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await VehicleService.getAllVehicleTypes(currentParams);
      setTypes(response.data.content);
      setPagination({
        page: response.data.page,
        size: response.data.size,
        total_elements: response.data.total_elements,
        total_pages: response.data.total_pages,
      });
    } catch (err) {
      console.error("Failed to fetch vehicle types:", err);
      setError("Failed to load vehicle types.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTypes(params);
  }, [fetchTypes, params]);

  const refreshTypes = useCallback(() => {
    fetchTypes(params);
  }, [fetchTypes, params]);

  return { types, pagination, loading, error, refreshTypes };
};

/**
 * Hook for a single vehicle type by ID
 */
export const useVehicleType = (typeId: string | null) => {
  const [type, setType] = useState<VehicleType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchType = useCallback(async () => {
    if (!typeId) {
      setType(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const fetchedType = await VehicleService.getVehicleTypeById(typeId);
      setType(fetchedType);
    } catch (err) {
      console.error(`Failed to fetch vehicle type with ID ${typeId}:`, err);
      setError("Failed to load vehicle type details.");
    } finally {
      setLoading(false);
    }
  }, [typeId]);

  useEffect(() => {
    fetchType();
  }, [fetchType]);

  const refreshType = useCallback(() => {
    fetchType();
  }, [fetchType]);

  return { type, loading, error, refreshType };
};

/**
 * Convert vehicle type dropdown data to select options
 */
export const convertToSelectOptions = (
  data: VehicleTypeDropdownItem[]
): Array<{ label: string; value: string; code?: string }> => {
  return data.map((item) => ({
    label: `${item.type_name} (${item.type_code})`,
    value: item.type_id,
    code: item.type_code,
  }));
};
