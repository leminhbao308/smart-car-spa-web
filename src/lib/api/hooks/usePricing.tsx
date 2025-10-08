"use client";
import {useState, useCallback} from "react";
import {PricingPreviewBatchRequest, PricingPreviewItemRequest, PricingService} from "@/lib/api";


export const usePricing = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const preview = useCallback(async (data: PricingPreviewItemRequest) => {
    setLoading(true);
    setError(null);
    try {
      return await PricingService.getPreviewPrice(data);
    } catch (e: any) {
      setError(e?.message || "Failed to preview price");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);


  const previewBatch = useCallback(async (data: PricingPreviewBatchRequest) => {
    setLoading(true);
    setError(null);
    try {
      return await PricingService.getPreviewPriceBatch(data);
    } catch (e: any) {
      setError(e?.message || "Failed to preview batch prices");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);


  return {loading, error, preview, previewBatch};
};
