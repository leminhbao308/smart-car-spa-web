"use client";
import {useEffect, useState, useCallback} from "react";
import {CatalogData, CatalogService} from "@/lib/api";
import {UUID} from "node:crypto";


export interface UseCatalogReturn {
  catalog: CatalogData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}


export const useCatalogForSale = (branchId: string): UseCatalogReturn => {
  const [state, setState] = useState<CatalogData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const fetchData = useCallback(async () => {
    if (!branchId) {
      setState(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp: CatalogData = await CatalogService.getForSaleCatalogs(branchId);
      setState(resp);
    } catch (e: any) {
      setError(e?.message || "Failed to load catalog");
    } finally {
      setLoading(false);
    }
  }, [branchId]);


  useEffect(() => {
    fetchData();
  }, [fetchData]);


  return {catalog: state, loading, error, refresh: fetchData};
};
