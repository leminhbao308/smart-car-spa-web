"use client";
import {useState, useCallback} from "react";
import {InventoryLevelsBatchRequest, InventoryService} from "@/lib/api";


export const useInventoryLevels = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const level = useCallback(async (warehouseId: string, productId: string) => {
    setLoading(true);
    setError(null);
    try {
      return await InventoryService.getInvLevel(warehouseId, productId);
    } catch (e: any) {
      setError(e?.message || "Failed to get inventory level");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);


  const levelsBatch = useCallback(async (data: InventoryLevelsBatchRequest) => {
    setLoading(true);
    setError(null);
    try {
      return await InventoryService.getInvLevelBatch(data);
    } catch (e: any) {
      setError(e?.message || "Failed to get batch inventory levels");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);


  return {loading, error, level, levelsBatch};
};
