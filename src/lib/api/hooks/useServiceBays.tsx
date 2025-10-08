"use client";

import { useState, useEffect, useCallback } from "react";
import { serviceBayService } from "../services/service-bay.service";
import {
  ServiceBay,
  ServiceBayFilterParam,
  ServiceBayDropdownItem,
  CreateServiceBayRequest,
  UpdateServiceBayRequest,
  BayType,
  BayStatus,
  ServiceBayStatistics
} from "../types/service-bay.types";

/**
 * Hook for service bays dropdown data
 */
export const useServiceBaysDropdown = (branchId?: string, bayType?: BayType) => {
  const [dropdownData, setDropdownData] = useState<ServiceBayDropdownItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDropdownData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await serviceBayService.getServiceBaysDropdown(branchId, bayType);
      setDropdownData(response);
    } catch (err) {
      console.error("Failed to fetch service bays for dropdown:", err);
      setError("Failed to load service bays for dropdown.");
    } finally {
      setLoading(false);
    }
  }, [branchId, bayType]);

  useEffect(() => {
    fetchDropdownData();
  }, [fetchDropdownData]);

  return { dropdownData, loading, error, refetch: fetchDropdownData };
};

/**
 * Hook for all service bays data with pagination and search
 */
export const useServiceBays = (params: ServiceBayFilterParam = {}) => {
  const [bays, setBays] = useState<ServiceBay[]>([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    total_elements: 0,
    total_pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBays = useCallback(async (currentParams: ServiceBayFilterParam) => {
    setLoading(true);
    setError(null);
    try {
      const response = await serviceBayService.getAllServiceBays(currentParams);
      setBays(response.data.content);
      setPagination({
        page: response.data.number,
        size: response.data.size,
        total_elements: response.data.totalElements,
        total_pages: response.data.totalPages,
      });
    } catch (err) {
      console.error("Failed to fetch service bays:", err);
      setError("Failed to load service bays.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBays(params);
  }, [fetchBays, params]);

  const refreshBays = useCallback(() => {
    fetchBays(params);
  }, [fetchBays, params]);

  return { bays, pagination, loading, error, refreshBays };
};

/**
 * Hook for a single service bay by ID
 */
export const useServiceBay = (bayId: string | null) => {
  const [bay, setBay] = useState<ServiceBay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBay = useCallback(async () => {
    if (!bayId) {
      setBay(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const fetchedBay = await serviceBayService.getServiceBayById(bayId);
      setBay(fetchedBay);
    } catch (err) {
      console.error(`Failed to fetch service bay with ID ${bayId}:`, err);
      setError("Failed to load service bay details.");
    } finally {
      setLoading(false);
    }
  }, [bayId]);

  useEffect(() => {
    fetchBay();
  }, [fetchBay]);

  const refreshBay = useCallback(() => {
    fetchBay();
  }, [fetchBay]);

  return { bay, loading, error, refreshBay };
};

/**
 * Hook for service bays by branch
 */
export const useServiceBaysByBranch = (branchId: string | null) => {
  const [bays, setBays] = useState<ServiceBay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBaysByBranch = useCallback(async () => {
    if (!branchId) {
      setBays([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await serviceBayService.getServiceBaysByBranch(branchId);
      setBays(response);
    } catch (err) {
      console.error(`Failed to fetch service bays for branch ${branchId}:`, err);
      setError("Failed to load service bays for branch.");
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    fetchBaysByBranch();
  }, [fetchBaysByBranch]);

  const refreshBaysByBranch = useCallback(() => {
    fetchBaysByBranch();
  }, [fetchBaysByBranch]);

  return { bays, loading, error, refreshBaysByBranch };
};

/**
 * Hook for active service bays
 */
export const useActiveServiceBays = (branchId?: string) => {
  const [bays, setBays] = useState<ServiceBay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveBays = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await serviceBayService.getActiveServiceBays(branchId);
      setBays(response);
    } catch (err) {
      console.error("Failed to fetch active service bays:", err);
      setError("Failed to load active service bays.");
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    fetchActiveBays();
  }, [fetchActiveBays]);

  const refreshActiveBays = useCallback(() => {
    fetchActiveBays();
  }, [fetchActiveBays]);

  return { bays, loading, error, refreshActiveBays };
};

/**
 * Hook for available service bays
 */
export const useAvailableServiceBays = (
  branchId: string | null,
  startTime: string | null,
  endTime: string | null,
  bayType?: BayType
) => {
  const [bays, setBays] = useState<ServiceBay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailableBays = useCallback(async () => {
    if (!branchId || !startTime || !endTime) {
      setBays([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await serviceBayService.getAvailableServiceBays(
        branchId,
        startTime,
        endTime,
        bayType
      );
      setBays(response);
    } catch (err) {
      console.error("Failed to fetch available service bays:", err);
      setError("Failed to load available service bays.");
    } finally {
      setLoading(false);
    }
  }, [branchId, startTime, endTime, bayType]);

  useEffect(() => {
    fetchAvailableBays();
  }, [fetchAvailableBays]);

  const refreshAvailableBays = useCallback(() => {
    fetchAvailableBays();
  }, [fetchAvailableBays]);

  return { bays, loading, error, refreshAvailableBays };
};

/**
 * Hook for service bay statistics
 */
export const useServiceBayStatistics = (bayId: string | null) => {
  const [statistics, setStatistics] = useState<ServiceBayStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    if (!bayId) {
      setStatistics(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await serviceBayService.getBayStatistics(bayId);
      setStatistics(response);
    } catch (err) {
      console.error(`Failed to fetch statistics for bay ${bayId}:`, err);
      setError("Failed to load bay statistics.");
    } finally {
      setLoading(false);
    }
  }, [bayId]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const refreshStatistics = useCallback(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return { statistics, loading, error, refreshStatistics };
};

/**
 * Hook for service bay management operations
 */
export const useServiceBayManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createServiceBay = useCallback(async (data: CreateServiceBayRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await serviceBayService.createServiceBay(data);
      return response;
    } catch (err) {
      console.error("Failed to create service bay:", err);
      setError("Failed to create service bay.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateServiceBay = useCallback(async (
    bayId: string,
    data: UpdateServiceBayRequest
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await serviceBayService.updateServiceBay(bayId, data);
      return response;
    } catch (err) {
      console.error("Failed to update service bay:", err);
      setError("Failed to update service bay.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteServiceBay = useCallback(async (bayId: string) => {
    setLoading(true);
    setError(null);
    try {
      await serviceBayService.deleteServiceBay(bayId);
    } catch (err) {
      console.error("Failed to delete service bay:", err);
      setError("Failed to delete service bay.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateServiceBayStatus = useCallback(async (
    bayId: string,
    status: BayStatus,
    reason?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await serviceBayService.updateServiceBayStatus(bayId, status, reason);
      return response;
    } catch (err) {
      console.error("Failed to update service bay status:", err);
      setError("Failed to update service bay status.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const validateBayName = useCallback(async (
    branchId: string,
    bayName: string,
    bayId?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await serviceBayService.validateBayName(branchId, bayName, bayId);
      return response;
    } catch (err) {
      console.error("Failed to validate bay name:", err);
      setError("Failed to validate bay name.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createServiceBay,
    updateServiceBay,
    deleteServiceBay,
    updateServiceBayStatus,
    validateBayName
  };
};

/**
 * Convert service bay dropdown data to select options
 */
export const convertToSelectOptions = (
  data: ServiceBayDropdownItem[]
): Array<{ label: string; value: string; disabled?: boolean }> => {
  return data.map((item) => ({
    label: `${item.bay_name} (${item.bay_code}) - ${item.branch_name}`,
    value: item.bay_id,
    disabled: !item.is_available,
  }));
};
