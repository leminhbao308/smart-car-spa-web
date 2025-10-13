"use client";
import {useState, useCallback} from "react";
import { useQuery } from "@tanstack/react-query";
import {PricingPreviewBatchRequest, PricingPreviewItemRequest, PricingService} from "@/lib/api";
import { PriceBook } from "@/lib/api/types/price-book.types";


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

/**
 * Hook to get active price books for booking
 */
export const useActivePriceBooks = () => {
  return useQuery({
    queryKey: ["pricing", "active-books"],
    queryFn: () => PricingService.getActivePriceBooks(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
