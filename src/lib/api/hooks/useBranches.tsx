"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { BranchService } from "../services/branch.service";
import {
  BranchDisplay,
  CreateBranchRequest,
  UpdateBranchRequest,
} from "../types/branch.types";

export interface UseBranchesParams {
  // No pagination params needed as API doesn't support them
}

export interface UseBranchesReturn {
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
  loading: boolean;
  error: string | null;
  refreshBranches: () => void;
  createBranch: (data: CreateBranchRequest) => Promise<BranchDisplay>;
  updateBranch: (branchId: string, data: UpdateBranchRequest) => Promise<BranchDisplay>;
  deleteBranch: (branchId: string) => Promise<void>;
}

/**
 * Hook for managing branches data
 */
export const useBranches = (params: UseBranchesParams): UseBranchesReturn => {
  const [branches, setBranches] = useState<BranchDisplay[]>([]);
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

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await BranchService.getAllBranches();
      setBranches(response.branches);
      setPagination(response.pagination);
    } catch (err) {
      console.error("Failed to fetch branches:", err);
      setError("Failed to load branches data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const refreshBranches = useCallback(() => {
    fetchBranches();
  }, [fetchBranches]);

  const createBranch = useCallback(async (data: CreateBranchRequest) => {
    try {
      const response = await BranchService.createBranch(data);
      // Refresh the list after successful creation
      await fetchBranches();
      return response;
    } catch (err) {
      console.error("Failed to create branch:", err);
      throw err;
    }
  }, [fetchBranches]);

  const updateBranch = useCallback(async (branchId: string, data: UpdateBranchRequest) => {
    try {
      const response = await BranchService.updateBranch(branchId, data);
      // Refresh the list after successful update
      await fetchBranches();
      return response;
    } catch (err) {
      console.error("Failed to update branch:", err);
      throw err;
    }
  }, [fetchBranches]);

  const deleteBranch = useCallback(async (branchId: string) => {
    try {
      await BranchService.deleteBranch(branchId);
      // Refresh the list after successful deletion
      await fetchBranches();
    } catch (err) {
      console.error("Failed to delete branch:", err);
      throw err;
    }
  }, [fetchBranches]);

  return { 
    branches, 
    pagination, 
    loading, 
    error, 
    refreshBranches, 
    createBranch,
    updateBranch,
    deleteBranch
  };
};

/**
 * Hook for a single branch by ID
 */
export const useBranch = (branchId: string | null) => {
  const [branch, setBranch] = useState<BranchDisplay | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBranch = useCallback(async () => {
    if (!branchId) {
      setBranch(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const fetchedBranch = await BranchService.getBranchById(branchId);
      setBranch(fetchedBranch);
    } catch (err) {
      console.error(`Failed to fetch branch with ID ${branchId}:`, err);
      setError("Failed to load branch details.");
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    fetchBranch();
  }, [fetchBranch]);

  const refreshBranch = useCallback(() => {
    fetchBranch();
  }, [fetchBranch]);

  return { branch, loading, error, refreshBranch };
};
