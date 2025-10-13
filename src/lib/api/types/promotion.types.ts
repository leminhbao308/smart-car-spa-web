// Promotion Management Types
export interface Promotion {
  id: string;
  name: string;
  code: string;
  description: string;
  type: PromotionType;
  value: number;
  startDate: string;
  endDate: string;
  status: PromotionStatus;
  isPublic: boolean;
  usageLimit?: number;
  usedCount: number;
  customerLimit?: number;
  customerUsedCount: number;
  conditions: PromotionCondition[];
  benefits: string[];
  terms: string[];
  targetAudience: PromotionTargetAudience;
  priority: number;
  notes?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export type PromotionType = "percentage" | "fixed" | "gift" | "combo" | "free_shipping" | "buy_x_get_y";
export type PromotionStatus = "draft" | "active" | "inactive" | "scheduled" | "expired" | "cancelled";

export interface PromotionCondition {
  id: string;
  type: ConditionType;
  description: string;
  value?: number;
  target?: string[];
  operator?: "equals" | "greater_than" | "less_than" | "greater_equal" | "less_equal" | "in" | "not_in";
  isRequired: boolean;
}

export type ConditionType =
  | "min_amount"
  | "min_quantity"
  | "specific_service"
  | "specific_product"
  | "customer_type"
  | "customer_tier"
  | "time_period"
  | "day_of_week"
  | "branch_location"
  | "payment_method";

export interface PromotionTargetAudience {
  customerTypes: string[];
  customerTiers: string[];
  branches: string[];
  services: string[];
  products: string[];
  servicePackages: string[];
  excludeCustomerTypes?: string[];
  excludeServices?: string[];
  excludeProducts?: string[];
}

export interface PromotionUsage {
  id: string;
  promotionId: string;
  customerId: string;
  orderId: string;
  usedAt: string;
  discountAmount: number;
  originalAmount: number;
  finalAmount: number;
}

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

// API Request/Response Types
export interface CreatePromotionRequest {
  name: string;
  code: string;
  description: string;
  type: PromotionType;
  value: number;
  startDate: string;
  endDate: string;
  status: PromotionStatus;
  isPublic: boolean;
  usageLimit?: number;
  customerLimit?: number;
  conditions: Omit<PromotionCondition, 'id'>[];
  benefits: string[];
  terms: string[];
  targetAudience: PromotionTargetAudience;
  priority: number;
  notes?: string;
}

export interface UpdatePromotionRequest {
  name?: string;
  code?: string;
  description?: string;
  type?: PromotionType;
  value?: number;
  startDate?: string;
  endDate?: string;
  status?: PromotionStatus;
  isPublic?: boolean;
  usageLimit?: number;
  customerLimit?: number;
  conditions?: Omit<PromotionCondition, 'id'>[];
  benefits?: string[];
  terms?: string[];
  targetAudience?: PromotionTargetAudience;
  priority?: number;
  notes?: string;
}

export interface PromotionResponse {
  data: Promotion;
  message: string;
  success: boolean;
}

export interface PromotionListResponse {
  data: {
    content: Promotion[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
  message: string;
  success: boolean;
}

export interface PromotionSearchParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: "ASC" | "DESC";
  filters?: {
    status?: PromotionStatus[];
    type?: PromotionType[];
    isPublic?: boolean;
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
    search?: string;
  };
}

// Promotion Type Options
export const PROMOTION_TYPE_OPTIONS = [
  { value: "percentage", label: "Giảm theo phần trăm", icon: "📊", description: "Giảm giá theo tỷ lệ phần trăm" },
  { value: "fixed", label: "Giảm số tiền cố định", icon: "💰", description: "Giảm một số tiền cố định" },
  { value: "gift", label: "Tặng kèm sản phẩm", icon: "🎁", description: "Tặng kèm sản phẩm khi mua hàng" },
  { value: "combo", label: "Combo dịch vụ", icon: "📦", description: "Gói combo nhiều dịch vụ với giá ưu đãi" },
  { value: "free_shipping", label: "Miễn phí vận chuyển", icon: "🚚", description: "Miễn phí phí vận chuyển" },
  { value: "buy_x_get_y", label: "Mua X tặng Y", icon: "🎯", description: "Mua một số lượng nhất định được tặng sản phẩm" },
];

export const PROMOTION_STATUS_OPTIONS = [
  { value: "draft", label: "Bản nháp", color: "default", description: "Chương trình đang được soạn thảo" },
  { value: "active", label: "Đang hoạt động", color: "green", description: "Chương trình đang chạy" },
  { value: "inactive", label: "Tạm dừng", color: "red", description: "Chương trình tạm dừng" },
  { value: "scheduled", label: "Đã lên lịch", color: "blue", description: "Chương trình đã lên lịch" },
  { value: "expired", label: "Đã hết hạn", color: "gray", description: "Chương trình đã hết hạn" },
  { value: "cancelled", label: "Đã hủy", color: "red", description: "Chương trình đã bị hủy" },
];

export const CONDITION_TYPE_OPTIONS = [
  { value: "min_amount", label: "Số tiền tối thiểu", description: "Đơn hàng phải đạt số tiền tối thiểu" },
  { value: "min_quantity", label: "Số lượng tối thiểu", description: "Phải mua số lượng tối thiểu" },
  { value: "specific_service", label: "Dịch vụ cụ thể", description: "Áp dụng cho dịch vụ cụ thể" },
  { value: "specific_product", label: "Sản phẩm cụ thể", description: "Áp dụng cho sản phẩm cụ thể" },
  { value: "customer_type", label: "Loại khách hàng", description: "Áp dụng cho loại khách hàng cụ thể" },
  { value: "customer_tier", label: "Cấp độ khách hàng", description: "Áp dụng cho cấp độ khách hàng" },
  { value: "time_period", label: "Khung giờ", description: "Áp dụng trong khung giờ cụ thể" },
  { value: "day_of_week", label: "Ngày trong tuần", description: "Áp dụng cho ngày cụ thể trong tuần" },
  { value: "branch_location", label: "Chi nhánh", description: "Áp dụng cho chi nhánh cụ thể" },
  { value: "payment_method", label: "Phương thức thanh toán", description: "Áp dụng cho phương thức thanh toán" },
];

export const CUSTOMER_TYPE_OPTIONS = [
  { value: "all", label: "Tất cả khách hàng" },
  { value: "new_customer", label: "Khách hàng mới" },
  { value: "vip", label: "Khách hàng VIP" },
  { value: "regular", label: "Khách hàng thường" },
  { value: "premium", label: "Khách hàng Premium" },
  { value: "enterprise", label: "Khách hàng doanh nghiệp" },
];

export const CUSTOMER_TIER_OPTIONS = [
  { value: "bronze", label: "Đồng", color: "#cd7f32" },
  { value: "silver", label: "Bạc", color: "#c0c0c0" },
  { value: "gold", label: "Vàng", color: "#ffd700" },
  { value: "platinum", label: "Bạch kim", color: "#e5e4e2" },
  { value: "diamond", label: "Kim cương", color: "#b9f2ff" },
];

// Helper functions
export const getPromotionTypeLabel = (type: PromotionType): string => {
  const option = PROMOTION_TYPE_OPTIONS.find(opt => opt.value === type);
  return option ? option.label : type;
};

export const getPromotionTypeIcon = (type: PromotionType): string => {
  const option = PROMOTION_TYPE_OPTIONS.find(opt => opt.value === type);
  return option ? option.icon : "❓";
};

export const getPromotionStatusLabel = (status: PromotionStatus): string => {
  const option = PROMOTION_STATUS_OPTIONS.find(opt => opt.value === status);
  return option ? option.label : status;
};

export const getPromotionStatusColor = (status: PromotionStatus): string => {
  const option = PROMOTION_STATUS_OPTIONS.find(opt => opt.value === status);
  return option ? option.color : "default";
};

export const getConditionTypeLabel = (type: ConditionType): string => {
  const option = CONDITION_TYPE_OPTIONS.find(opt => opt.value === type);
  return option ? option.label : type;
};

export const isPromotionExpired = (endDate: string): boolean => {
  const now = new Date();
  const end = new Date(endDate);
  return now > end;
};

export const isPromotionActive = (startDate: string, endDate: string, status: PromotionStatus): boolean => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  return (
    status === "active" &&
    now >= start &&
    now <= end
  );
};

export const formatPromotionValue = (type: PromotionType, value: number): string => {
  switch (type) {
    case "percentage":
      return `${value}%`;
    case "fixed":
      return `${value.toLocaleString()} ₫`;
    case "gift":
      return `${value} sản phẩm`;
    case "combo":
      return `Combo ${value}`;
    case "free_shipping":
      return "Miễn phí vận chuyển";
    case "buy_x_get_y":
      return `Mua ${value} tặng 1`;
    default:
      return value?.toString();
  }
};

export const getUsagePercentage = (used: number, limit?: number): number => {
  if (!limit) return 0;
  return Math.round((used / limit) * 100);
};

export const isPromotionAvailable = (promotion: Promotion): boolean => {
  return (
    promotion.status === "active" &&
    !isPromotionExpired(promotion.endDate) &&
    (promotion.usageLimit ? promotion.usedCount < promotion.usageLimit : true) &&
    (promotion.customerLimit ? promotion.customerUsedCount < promotion.customerLimit : true)
  );
};

export interface PromotionValidationResponse {
  valid: boolean;
  message?: string;
}
