import {
  getTypeLabel,
  getTypeIcon,
  getStatusColor,
  getStatusLabel,
  isExpired,
  isActive,
  formatPromotionValue,
} from "@/components/utils/data/promotions.data";

// Re-export các helper functions từ data file
export {
  getTypeLabel,
  getTypeIcon,
  getStatusColor,
  getStatusLabel,
  isExpired,
  isActive,
  formatPromotionValue,
};

// Thêm các helper functions khác nếu cần
export const getPromotionStatus = (promotion: any) => {
  if (isExpired(promotion.endDate)) {
    return "expired";
  }
  if (isActive(promotion.startDate, promotion.endDate, promotion.status)) {
    return "running";
  }
  return promotion.status;
};

export const getUsagePercentage = (used: number, limit?: number) => {
  if (!limit) return 0;
  return Math.round((used / limit) * 100);
};

export const isPromotionAvailable = (promotion: any) => {
  return (
    promotion.status === "active" &&
    !isExpired(promotion.endDate) &&
    (promotion.usageLimit ? promotion.usedCount < promotion.usageLimit : true)
  );
};

export const getPriorityColor = (priority: number) => {
  if (priority >= 8) return "#f5222d";
  if (priority >= 6) return "#fa8c16";
  return "#52c41a";
};

export const getPriorityLabel = (priority: number) => {
  if (priority >= 8) return "Cao";
  if (priority >= 6) return "Trung bình";
  return "Thấp";
};