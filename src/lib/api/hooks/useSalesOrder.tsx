"use client";
import {useState, useCallback} from "react";
import {CreateSORequest, SaleOrderResponse, SalesOrderService} from "@/lib/api";
import {UUID} from "node:crypto";


export interface UseSalesOrderReturn {
  order: SaleOrderResponse | null;
  loading: boolean;
  error: string | null;
  createDraft: (payload: CreateSORequest) => Promise<SaleOrderResponse>;
  confirm: (soId?: UUID) => Promise<SaleOrderResponse>;
  fulfill: (soId?: UUID) => Promise<SaleOrderResponse>;
  refresh: (soId?: UUID) => Promise<SaleOrderResponse>;
// Convenience: confirm then fulfill (when payment already done)
  completeAfterPaid: (soId?: UUID) => Promise<SaleOrderResponse>;
}


export const useSalesOrder = (): UseSalesOrderReturn => {
  const [order, setOrder] = useState<SaleOrderResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const createDraft = useCallback(async (payload: CreateSORequest) => {
    setLoading(true);
    setError(null);
    try {
      const so = await SalesOrderService.createDraftOrder(payload);
      setOrder(so);
      return so;
    } catch (e: any) {
      setError(e?.message || "Failed to create order");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);


  const confirm = useCallback(async (soId?: UUID) => {
    const id = soId || order?.id;
    if (!id) throw new Error("Missing soId");
    setLoading(true);
    setError(null);
    try {
      const so = await SalesOrderService.confirmSaleOrder(id);
      setOrder(so);
      return so;
    } catch (e: any) {
      setError(e?.message || "Failed to confirm order");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [order?.id]);


  const fulfill = useCallback(async (soId?: UUID) => {
    const id = soId || order?.id;
    if (!id) throw new Error("Missing soId");
    setLoading(true);
    setError(null);
    try {
      const so = await SalesOrderService.fullFillSaleOrder(id);
      setOrder(so);
      return so;
    } catch (e: any) {
      setError(e?.message || "Failed to fulfill order");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [order?.id]);


  const refresh = useCallback(async (soId?: UUID) => {
    const id = soId || order?.id;
    if (!id) throw new Error("Missing soId");
    try {
      const so = await SalesOrderService.getSaleOrderById(id);
      setOrder(so);
      return so;
    } catch (e) {
      throw e;
    }
  }, [order?.id]);


  const completeAfterPaid = useCallback(async (soId?: UUID) => {
    const id = soId || order?.id;
    if (!id) throw new Error("Missing soId");
    await confirm(); // reserve + price
    return fulfill(id); // ship/complete
  }, [order?.id, confirm, fulfill]);


  return {order, loading, error, createDraft, confirm, fulfill, refresh, completeAfterPaid};
};
