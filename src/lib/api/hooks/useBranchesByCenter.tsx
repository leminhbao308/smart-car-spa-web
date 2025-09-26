"use client";
import { useState, useEffect, useCallback } from "react";
import { BranchService } from "../services/branch.service";
import { BranchDisplay } from "../types/branch.types";

export interface UseBranchesByCenterReturn {
  branches: BranchDisplay[];
  loading: boolean;
  error: string | null;
  refreshBranches: () => void;
}

/**
 * Hook for managing branches by center ID
 */
export const useBranchesByCenter = (centerId: string | null): UseBranchesByCenterReturn => {
  const [branches, setBranches] = useState<BranchDisplay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await BranchService.getAllBranches();
      setBranches(response.branches);
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

  return { 
    branches, 
    loading, 
    error, 
    refreshBranches
  };
};
