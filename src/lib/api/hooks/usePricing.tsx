"use client";
import {useState, useCallback} from "react";
import { useQuery } from "@tanstack/react-query";
import {PricingPreviewBatchRequest, PricingPreviewItemRequest, PricingService} from "@/lib/api";


export const usePricing = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const preview = useCallback(async (data: PricingPreviewItemRequest) => {
    setLoading(true);
    setError(null);
    try {
      return await PricingService.getPreviewPrice(data);
    } catch (e: unknown) {
      setError((e as Error)?.message || "Failed to preview price");
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
    } catch (e: unknown) {
      setError((e as Error)?.message || "Failed to preview batch prices");
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
    queryFn: async () => {
      console.log("=== CALLING getActivePriceBooks API ===");
      try {
        const result = await PricingService.getActivePriceBooks();
        console.log("=== getActivePriceBooks API SUCCESS ===");
        console.log("API Response:", result);
        console.log("Response type:", typeof result);
        console.log("Response is array:", Array.isArray(result));
        return result;
      } catch (error) {
        console.log("=== getActivePriceBooks API ERROR ===");
        console.error("API Error:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to get all price books for booking (including inactive ones)
 */
export const useAllPriceBooks = () => {
  return useQuery({
    queryKey: ["pricing", "all-books"],
    queryFn: async () => {
      console.log("=== CALLING getAllPriceBooks API ===");
      try {
        const result = await PricingService.getAllPriceBooks();
        console.log("=== getAllPriceBooks API SUCCESS ===");
        console.log("API Response:", result);
        console.log("Response type:", typeof result);
        console.log("Response is array:", Array.isArray(result));
        return result;
      } catch (error) {
        console.log("=== getAllPriceBooks API ERROR ===");
        console.error("API Error:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
