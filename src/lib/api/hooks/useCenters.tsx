"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { CenterService } from "../services/center.service";
import {
  CenterDisplay,
  CreateCenterRequest,
  UpdateCenterRequest,
} from "../types/center.types";

export interface UseCentersParams {
  // No pagination params needed as API doesn't support them
}

export interface UseCentersReturn {
  centers: CenterDisplay[];
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
  loading: boolean;
  error: string | null;
  refreshCenters: () => void;
  createCenter: (data: CreateCenterRequest) => Promise<CenterDisplay>;
  updateCenter: (centerId: string, data: UpdateCenterRequest) => Promise<CenterDisplay>;
  deleteCenter: (centerId: string) => Promise<void>;
}

/**
 * Hook for managing centers data
 */
export const useCenters = (params: UseCentersParams): UseCentersReturn => {
  const [centers, setCenters] = useState<CenterDisplay[]>([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    total_elements: 0,
    total_pages: 0,
    first: true,
    last: true,
    has_next: false,
    has_previous: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use ref to store params to prevent unnecessary re-renders
  const paramsRef = useRef(params);

  const fetchCenters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await CenterService.getAllCenters();
      setCenters(response.centers);
      setPagination(response.pagination);
    } catch (err) {
      console.error("Failed to fetch centers:", err);
      setError("Failed to load centers data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCenters();
  }, [fetchCenters]);

  const refreshCenters = useCallback(() => {
    fetchCenters();
  }, [fetchCenters]);

  const createCenter = useCallback(async (data: CreateCenterRequest) => {
    try {
      const response = await CenterService.createCenter(data);
      // Refresh the list after successful creation
      await fetchCenters();
      return response;
    } catch (err) {
      console.error("Failed to create center:", err);
      throw err;
    }
  }, [fetchCenters]);

  const updateCenter = useCallback(async (centerId: string, data: UpdateCenterRequest) => {
    try {
      const response = await CenterService.updateCenter(centerId, data);
      // Refresh the list after successful update
      await fetchCenters();
      return response;
    } catch (err) {
      console.error("Failed to update center:", err);
      throw err;
    }
  }, [fetchCenters]);

  const deleteCenter = useCallback(async (centerId: string) => {
    try {
      await CenterService.deleteCenter(centerId);
      // Refresh the list after successful deletion
      await fetchCenters();
    } catch (err) {
      console.error("Failed to delete center:", err);
      throw err;
    }
  }, [fetchCenters]);

  return { 
    centers, 
    pagination, 
    loading, 
    error, 
    refreshCenters, 
    createCenter,
    updateCenter,
    deleteCenter
  };
};

/**
 * Hook for a single center by ID
 */
export const useCenter = (centerId: string | null) => {
  const [center, setCenter] = useState<CenterDisplay | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCenter = useCallback(async () => {
    if (!centerId) {
      setCenter(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const fetchedCenter = await CenterService.getCenterById(centerId);
      setCenter(fetchedCenter);
    } catch (err) {
      console.error(`Failed to fetch center with ID ${centerId}:`, err);
      setError("Failed to load center details.");
    } finally {
      setLoading(false);
    }
  }, [centerId]);

  useEffect(() => {
    fetchCenter();
  }, [fetchCenter]);

  const refreshCenter = useCallback(() => {
    fetchCenter();
  }, [fetchCenter]);

  return { center, loading, error, refreshCenter };
};
