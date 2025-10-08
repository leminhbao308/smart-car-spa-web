import {BaseAuditEntity, ProductRef} from "@/lib/api";

export interface PriceBook extends BaseAuditEntity{
  id: string;
  code: string;
  name: string;
  currency: "VND" | string;
  active: boolean;
  valid_from: string;
  valid_fo: string | null;
  items: PriceBookItem[];
}

export interface PriceBookItem extends BaseAuditEntity {
  product: ProductRef;
  policy_type: "FIXED" | "MARKUP_ON_PEAK";
  price: number | null;
  markup_percent: number | null;
}

export interface PricingPreviewItemRequest {
  product_id: string;
  qty: number;
}

export interface PricingPreviewBatchRequest {
  items: PricingPreviewItemRequest[];
}

export interface PricingPreviewItemResponse {
  product: ProductRef;
  qty: number;
  total_price: number;
}

export interface PricingPreviewBatchResponse {
  items: PricingPreviewItemResponse[];
  grand_total: number;
}

export interface CreatePriceBookRequest {
  code: string;
  name: string;
  currency: "VND" | string;
  valid_from: string;
  valid_to: string | null;
  items: CreatePriceBookItemRequest[];
}

export interface CreatePriceBookItemRequest {
  product_id: string;
  policy_type: "FIXED" | "MARKUP_ON_PEAK";
  price: number | null;
  markup_percent: number | null;
}
