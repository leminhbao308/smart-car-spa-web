"use client";
import {useEffect, useState, useCallback} from "react";
import {Warehouse, WarehouseService} from "@/lib/api";


export const useWarehouseByBranch = (branchId: string | null) => {
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const fetchWarehouse = useCallback(async () => {
    if (!branchId) {
      setWarehouse(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setWarehouse(await WarehouseService.getWarehouseByBranchId(branchId));
    } catch (e: any) {
      setError(e?.message || "Failed to load warehouse");
    } finally {
      setLoading(false);
    }
  }, [branchId]);


  useEffect(() => {
    fetchWarehouse();
  }, [fetchWarehouse]);


  return {warehouse, loading, error, refresh: fetchWarehouse};
};
