"use client";
import { useState, useCallback } from "react";
import { CreatePORequest, PurchaseOrder, PurchaseOrderService } from "@/lib/api";

export interface UsePurchaseOrderReturn {
  order: PurchaseOrder | null;
  loading: boolean;
  error: string | null;
  createDraft: (payload: CreatePORequest) => Promise<PurchaseOrder>;
  submit: (poId?: string) => Promise<PurchaseOrder>;
  receive: (poId?: string) => Promise<PurchaseOrder>;
  cancel: (poId?: string) => Promise<PurchaseOrder>;
  refresh: (poId?: string) => Promise<PurchaseOrder>;
  // Convenience: submit then receive (when goods arrive immediately)
  completeAfterReceived: (poId?: string) => Promise<PurchaseOrder>;
}

export const usePurchaseOrder = (): UsePurchaseOrderReturn => {
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDraft = useCallback(async (payload: CreatePORequest) => {
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

  const submit = useCallback(async (poId?: string) => {
    const id = poId || order?.id;
    if (!id) throw new Error("Missing poId");
    setLoading(true);
    setError(null);
    try {
      const po = await PurchaseOrderService.submitPurchaseOrder(id);
      setOrder(po);
      return po;
    } catch (e: any) {
      setError(e?.message || "Failed to submit purchase order");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [order?.id]);

  const receive = useCallback(async (poId?: string) => {
    const id = poId || order?.id;
    if (!id) throw new Error("Missing poId");
    setLoading(true);
    setError(null);
    try {
      const po = await PurchaseOrderService.receivePurchaseOrder(id);
      setOrder(po);
      return po;
    } catch (e: any) {
      setError(e?.message || "Failed to receive purchase order");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [order?.id]);

  const cancel = useCallback(async (poId?: string) => {
    const id = poId || order?.id;
    if (!id) throw new Error("Missing poId");
    setLoading(true);
    setError(null);
    try {
      const po = await PurchaseOrderService.cancelPurchaseOrder(id);
      setOrder(po);
      return po;
    } catch (e: any) {
      setError(e?.message || "Failed to cancel purchase order");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [order?.id]);

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

  const completeAfterReceived = useCallback(async (poId?: string) => {
    const id = poId || order?.id;
    if (!id) throw new Error("Missing poId");
    await submit(id); // submit order to supplier
    return receive(id); // receive goods
  }, [order?.id, submit, receive]);

  return {
    order,
    loading,
    error,
    createDraft,
    submit,
    receive,
    cancel,
    refresh,
    completeAfterReceived
  };
};
