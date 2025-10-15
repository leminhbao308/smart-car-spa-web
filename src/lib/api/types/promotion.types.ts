// Promotion Management Types - Aligned with Backend

// === ENUMS ===
import {BaseAuditEntity, PromotionTypeInfo} from "@/lib/api";

export enum LineType {
  ALL = "ALL",
  CATEGORY = "CATEGORY",
  PRODUCT = "PRODUCT",
  SERVICE = "SERVICE"
}

export enum DiscountType {
  PERCENT = "PERCENT",
  AMOUNT = "AMOUNT",
  FREE_PRODUCT = "FREE_PRODUCT",
  BUY_X_GET_Y = "BUY_X_GET_Y"
}

// === MAIN ENTITIES ===
export interface Promotion extends BaseAuditEntity {
  promotion_id: string;
  promotion_code?: string;
  name: string;
  description?: string;
  promotion_type?: PromotionTypeInfo;
  start_at?: string;
  end_at?: string;
  usage_limit?: number;
  per_customer_limit?: number;
  priority: number;
  is_stackable: boolean;
  coupon_redeem_once: boolean;
  branch?: BranchFlat;
  promotion_lines: PromotionLine[];
  total_usage_count?: number;
  is_expired?: boolean;
  is_available?: boolean;
}

export interface PromotionLine {
  promotion_line_id?: string;
  line_type: LineType;
  target_id?: string;
  branch?: BranchFlat;
  discount_type: DiscountType;
  discount_value?: number;
  max_discount_amount?: number;
  min_order_value?: number;
  min_quantity?: number;
  buy_qty?: number;
  get_qty?: number;
  free_product?: ProductFlat;
  free_quantity?: number;
  start_at?: string;
  end_at?: string;
  line_priority: number;
  is_active: boolean;
  created_at: string;
}

// === NESTED ENTITIES ===
export interface BranchFlat {
  branchId: string;
  branchName: string;
  branchUrl?: string;
}

export interface ProductFlat {
  productId: string;
  productName: string;
  productUrl?: string;
}

export interface CategoryFlat {
  categoryId: string;
  categoryName: string;
  categoryUrl?: string;
}

export interface ServiceFlat {
  serviceId: string;
  serviceName: string;
  serviceUrl?: string;
}

// === REQUEST TYPES ===
export interface CreatePromotionRequest {
  promotionCode?: string;
  name: string;
  description?: string;
  promotionTypeId?: string;
  startAt?: string;
  endAt?: string;
  usageLimit?: number;
  perCustomerLimit?: number;
  priority?: number;
  isStackable?: boolean;
  couponRedeemOnce?: boolean;
  branchId?: string;
  promotionLines?: CreatePromotionLineRequest[];
}

export interface CreatePromotionLineRequest {
  lineType: LineType;
  targetId?: string;
  branchId?: string;
  discountType: DiscountType;
  discountValue?: number;
  maxDiscountAmount?: number;
  minOrderValue?: number;
  minQuantity?: number;
  buyQty?: number;
  getQty?: number;
  freeProductId?: string;
  freeQuantity?: number;
  startAt?: string;
  endAt?: string;
  linePriority?: number;
  isActive?: boolean;
}

export interface UpdatePromotionRequest {
  promotionCode?: string;
  name?: string;
  description?: string;
  promotionTypeId?: string;
  startAt?: string;
  endAt?: string;
  usageLimit?: number;
  perCustomerLimit?: number;
  priority?: number;
  isStackable?: boolean;
  couponRedeemOnce?: boolean;
  branchId?: string;
  promotionLines?: UpdatePromotionLineRequest[];
  isActive?: boolean;
}

export interface UpdatePromotionLineRequest {
  lineType?: LineType;
  targetId?: string;
  branchId?: string;
  discountType?: DiscountType;
  discountValue?: number;
  maxDiscountAmount?: number;
  minOrderValue?: number;
  minQuantity?: number;
  buyQty?: number;
  getQty?: number;
  freeProductId?: string;
  freeQuantity?: number;
  startAt?: string;
  endAt?: string;
  linePriority?: number;
  isActive?: boolean;
}

export interface UpdatePromotionStatusRequest {
  isActive: boolean;
}

// === FILTER PARAMS ===
export interface PromotionFilterParam {
  // Pagination
  page?: number;
  size?: number;
  sort?: string;
  direction?: "ASC" | "DESC";

  // Basic filters
  promotion_code?: string;
  name?: string;
  promotion_type_id?: string;
  branch_id?: string;
  is_stackable?: boolean;
  coupon_redeem_once?: boolean;
  is_active?: boolean;

  // Discount value range
  min_discount_value?: number;
  max_discount_value?: number;

  // Order amount range
  min_order_amount?: number;
  max_order_amount?: number;

  // Usage limits
  has_usage_limit?: boolean;
  usage_limit_exceeded?: boolean;
  min_usage_count?: number;
  max_usage_count?: number;

  // Date ranges
  start_at_from?: string;
  start_at_to?: string;
  end_at_from?: string;
  end_at_to?: string;

  // Status filters
  is_expired?: boolean;
  is_available?: boolean;
  is_starting_soon?: boolean;
  is_ending_soon?: boolean;

  // Target filters
  target_customer_rank?: string;
  target_vehicle_type?: string;
  target_service_id?: string;
  target_product_id?: string;
  target_branch_id?: string;

  // Free item filters
  has_free_item?: boolean;
  free_product_id?: string;
  free_service_id?: string;

  // Buy X Get Y filters
  has_buy_x_get_y?: boolean;
  buy_product_id?: string;
  get_product_id?: string;

  // Priority filters
  min_priority?: number;
  max_priority?: number;

  // Search filters
  search?: string;
  description?: string;

  // Statistical filters
  most_used?: boolean;
  least_used?: boolean;
  never_used?: boolean;
}

// === ANALYTICS ===
export interface PromotionAnalytics {
  totalUsage: number;
  totalCustomers: number;
  totalDiscountGiven: number;
  averageDiscountPerOrder: number;
  conversionRate: number;
  topUsedPromotions: Array<{
    promotionId: string;
    promotionName: string;
    usageCount: number;
  }>;
  usageByDay: Array<{
    date: string;
    usageCount: number;
    discountAmount: number;
  }>;
}

// === OPTIONS FOR UI ===
export const LINE_TYPE_OPTIONS = [
  {value: LineType.ALL, label: "Tất cả", description: "Áp dụng cho tất cả sản phẩm/dịch vụ"},
  {value: LineType.CATEGORY, label: "Danh mục", description: "Áp dụng cho danh mục cụ thể"},
  {value: LineType.PRODUCT, label: "Sản phẩm", description: "Áp dụng cho sản phẩm cụ thể"},
  {value: LineType.SERVICE, label: "Dịch vụ", description: "Áp dụng cho dịch vụ cụ thể"},
];

export const DISCOUNT_TYPE_OPTIONS = [
  {value: DiscountType.PERCENT, label: "Giảm theo phần trăm", icon: "📊", description: "Giảm giá theo tỷ lệ phần trăm"},
  {value: DiscountType.AMOUNT, label: "Giảm số tiền cố định", icon: "💰", description: "Giảm một số tiền cố định"},
  {value: DiscountType.FREE_PRODUCT, label: "Tặng kèm sản phẩm", icon: "🎁", description: "Tặng kèm sản phẩm khi mua hàng"},
  {value: DiscountType.BUY_X_GET_Y, label: "Mua X tặng Y", icon: "🎯", description: "Mua một số lượng nhất định được tặng sản phẩm"},
];

export const CUSTOMER_TYPE_OPTIONS = [
  {value: "all", label: "Tất cả khách hàng"},
  {value: "new_customer", label: "Khách hàng mới"},
  {value: "vip", label: "Khách hàng VIP"},
  {value: "regular", label: "Khách hàng thường"},
  {value: "premium", label: "Khách hàng Premium"},
  {value: "enterprise", label: "Khách hàng doanh nghiệp"},
];

export const CUSTOMER_TIER_OPTIONS = [
  {value: "bronze", label: "Đồng", color: "#cd7f32"},
  {value: "silver", label: "Bạc", color: "#c0c0c0"},
  {value: "gold", label: "Vàng", color: "#ffd700"},
  {value: "platinum", label: "Bạch kim", color: "#e5e4e2"},
  {value: "diamond", label: "Kim cương", color: "#b9f2ff"},
];

// === HELPER FUNCTIONS ===
export const getLineTypeLabel = (type: LineType): string => {
  const option = LINE_TYPE_OPTIONS.find(opt => opt.value === type);
  return option ? option.label : type;
};

export const getDiscountTypeLabel = (type: DiscountType): string => {
  const option = DISCOUNT_TYPE_OPTIONS.find(opt => opt.value === type);
  return option ? option.label : type;
};

export const getDiscountTypeIcon = (type: DiscountType): string => {
  const option = DISCOUNT_TYPE_OPTIONS.find(opt => opt.value === type);
  return option ? option.icon : "❓";
};

export const isPromotionExpired = (endDate?: string): boolean => {
  if (!endDate) return false;
  const now = new Date();
  const end = new Date(endDate);
  return now > end;
};

export const isPromotionActive = (promotion: Promotion): boolean => {
  if (!promotion.start_at || !promotion.end_at) return false;
  const now = new Date();
  const start = new Date(promotion.start_at);
  const end = new Date(promotion.end_at);

  return (promotion.is_active && now >= start && now <= end);
};

export const formatDiscountValue = (type: DiscountType, value?: number): string => {
  if (value === undefined) return "-";

  switch (type) {
    case DiscountType.PERCENT:
      return `${value}%`;
    case DiscountType.AMOUNT:
      return `${value.toLocaleString()} ₫`;
    case DiscountType.FREE_PRODUCT:
      return `${value} sản phẩm`;
    case DiscountType.BUY_X_GET_Y:
      return `Mua ${value} tặng 1`;
    default:
      return value?.toString();
  }
};

export const getUsagePercentage = (used?: number, limit?: number): number => {
  if (!limit || !used) return 0;
  return Math.round((used / limit) * 100);
};

export const isPromotionAvailable = (promotion: Promotion): boolean => {
  return (
    promotion.is_active &&
    !isPromotionExpired(promotion.end_at) &&
    (promotion.usage_limit ?
      (promotion.total_usage_count || 0) < promotion.usage_limit : true));
};
