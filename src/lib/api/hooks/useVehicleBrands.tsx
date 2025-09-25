/**
 * useVehicleBrands Hook
 * React hook for vehicle brand management and dropdown data
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { VehicleService } from "../services/vehicle.service";
import {
  VehicleBrand,
  VehicleBrandDropdownItem,
  GetAllVehicleBrandsRequest,
} from "../types";

/**
 * Hook for vehicle brands dropdown data
 */
export const useVehicleBrandsDropdown = () => {
  const [dropdownData, setDropdownData] = useState<VehicleBrandDropdownItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDropdownData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await VehicleService.getVehicleBrandsForDropdown();
      setDropdownData(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch vehicle brands";
      setError(errorMessage);
      console.error("Error fetching vehicle brands dropdown:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDropdownData();
  }, [fetchDropdownData]);

  return {
    dropdownData,
    loading,
    error,
    refetch: fetchDropdownData,
  };
};

/**
 * Hook for vehicle brands management
 */
export const useVehicleBrands = (params?: GetAllVehicleBrandsRequest) => {
  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = useCallback(async (requestParams?: GetAllVehicleBrandsRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await VehicleService.getAllVehicleBrands(requestParams || params);
      setBrands(response.data.content);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch vehicle brands";
      setError(errorMessage);
      console.error("Error fetching vehicle brands:", err);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  return {
    brands,
    loading,
    error,
    refetch: fetchBrands,
  };
};

/**
 * Hook for single vehicle brand
 */
export const useVehicleBrand = (brandId: string | null) => {
  const [brand, setBrand] = useState<VehicleBrand | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBrand = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const brandData = await VehicleService.getVehicleBrandById(id);
      setBrand(brandData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch vehicle brand";
      setError(errorMessage);
      console.error("Error fetching vehicle brand:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (brandId) {
      fetchBrand(brandId);
    } else {
      setBrand(null);
    }
  }, [brandId, fetchBrand]);

  return {
    brand,
    loading,
    error,
    refetch: () => brandId && fetchBrand(brandId),
  };
};

/**
 * Utility function to convert dropdown data to options format
 */
export const convertToSelectOptions = (dropdownData: VehicleBrandDropdownItem[]) => {
  return dropdownData.map((item) => ({
    value: item.brand_id,
    label: item.brand_name,
    code: item.brand_code,
  }));
};

/**
 * Utility function to find brand by ID from dropdown data
 */
export const findBrandById = (
  dropdownData: VehicleBrandDropdownItem[], 
  brandId: string
): VehicleBrandDropdownItem | undefined => {
  return dropdownData.find((item) => item.brand_id === brandId);
};

/**
 * Utility function to find brand by code from dropdown data
 */
export const findBrandByCode = (
  dropdownData: VehicleBrandDropdownItem[], 
  brandCode: string
): VehicleBrandDropdownItem | undefined => {
  return dropdownData.find((item) => item.brand_code === brandCode);
};
