"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { SupplierService } from "../services/supplier.service";
import {
  Supplier,
  CreateSupplierRequest,
  UpdateSupplierRequest,
} from "../types/supplier.types";

export interface UseSuppliersParams {
  // No pagination params needed as API doesn't support them
}

export interface UseSuppliersReturn {
  suppliers: Supplier[];
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
  refreshSuppliers: () => void;
  createSupplier: (data: CreateSupplierRequest) => Promise<Supplier>;
  updateSupplier: (supplierId: string, data: UpdateSupplierRequest) => Promise<Supplier>;
  deleteSupplier: (supplierId: string) => Promise<void>;
}

/**
 * Hook for managing suppliers data
 */
export const useSuppliers = (params: UseSuppliersParams): UseSuppliersReturn => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
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

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await SupplierService.getAllSuppliers();
      setSuppliers(response.suppliers);
      setPagination(response.pagination);
    } catch (err) {
      console.error("Failed to fetch suppliers:", err);
      setError("Failed to load suppliers data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const refreshSuppliers = useCallback(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const createSupplier = useCallback(async (data: CreateSupplierRequest) => {
    try {
      const response = await SupplierService.createSupplier(data);
      // Refresh the list after successful creation
      await fetchSuppliers();
      return response;
    } catch (err) {
      console.error("Failed to create supplier:", err);
      throw err;
    }
  }, [fetchSuppliers]);

  const updateSupplier = useCallback(async (supplierId: string, data: UpdateSupplierRequest) => {
    try {
      const response = await SupplierService.updateSupplier(supplierId, data);
      // Refresh the list after successful update
      await fetchSuppliers();
      return response;
    } catch (err) {
      console.error("Failed to update supplier:", err);
      throw err;
    }
  }, [fetchSuppliers]);

  const deleteSupplier = useCallback(async (supplierId: string) => {
    try {
      await SupplierService.deleteSupplier(supplierId);
      // Refresh the list after successful deletion
      await fetchSuppliers();
    } catch (err) {
      console.error("Failed to delete supplier:", err);
      throw err;
    }
  }, [fetchSuppliers]);

  return { 
    suppliers, 
    pagination, 
    loading, 
    error, 
    refreshSuppliers, 
    createSupplier,
    updateSupplier,
    deleteSupplier
  };
};

/**
 * Hook for a single supplier by ID
 */
export const useSupplier = (supplierId: string | null) => {
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSupplier = useCallback(async () => {
    if (!supplierId) {
      setSupplier(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const fetchedSupplier = await SupplierService.getSupplierById(supplierId);
      setSupplier(fetchedSupplier);
    } catch (err) {
      console.error(`Failed to fetch supplier with ID ${supplierId}:`, err);
      setError("Failed to load supplier details.");
    } finally {
      setLoading(false);
    }
  }, [supplierId]);

  useEffect(() => {
    fetchSupplier();
  }, [fetchSupplier]);

  const refreshSupplier = useCallback(() => {
    fetchSupplier();
  }, [fetchSupplier]);

  return { supplier, loading, error, refreshSupplier };
};
