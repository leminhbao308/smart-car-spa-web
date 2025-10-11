import {BaseAuditEntity, Product, ProductRef, ServiceInfoDto, ServicePackageInfoDto} from "@/lib/api";

export interface PriceBook extends BaseAuditEntity{
  id: string;
  code: string;
  name: string;
  currency: "VND" | string;
  active: boolean;
  valid_from: string;
  valid_to: string | null;
  items: PriceBookItem[];
}

export interface PriceBookItem extends BaseAuditEntity {
  id: string;
  product?: ProductRef;
  service?: ServiceInfoDto;
  servicePackage?: ServicePackageInfoDto;
  item_type: "PRODUCT" | "SERVICE" | "SERVICE_PACKAGE";
  item_id: string;
  item_name: string;
  policy_type: "FIXED" | "MARKUP_ON_PEAK";
  fixed_price: number | null;
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
  product_id: string;
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
