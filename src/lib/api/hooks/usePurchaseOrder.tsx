"use client";
import {useState, useCallback} from "react";
import {CreatePORequest, PurchaseOrder, PurchaseOrderService} from "@/lib/api";

export interface UsePurchaseOrderReturn {
  order: PurchaseOrder | null;
  loading: boolean;
  error: string | null;
  createPO: (payload: CreatePORequest) => Promise<PurchaseOrder>;
  refresh: (poId?: string) => Promise<PurchaseOrder>;
}

export const usePurchaseOrder = (): UsePurchaseOrderReturn => {
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPO = useCallback(async (payload: CreatePORequest) => {
    setLoading(true);
    setError(null);
    try {
      const po = await PurchaseOrderService.createDraftPurchaseOrder(payload);
      setOrder(po);
      return po;
    } catch (e: any) {
      setError(e?.message || "Failed to create purchase order");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async (poId?: string) => {
    const id = poId || order?.id;
    if (!id) throw new Error("Missing poId");
    try {
      const po = await PurchaseOrderService.getPurchaseOrderById(id);
      setOrder(po);
      return po;
    } catch (e) {
      throw e;
    }
  }, [order?.id]);

  return {
    order,
    loading,
    error,
    createPO,
    refresh
  };
};
