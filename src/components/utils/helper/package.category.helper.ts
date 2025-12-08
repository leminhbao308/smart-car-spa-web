import { packageCategoryStatuses } from "../data/package-categories.data";

/**
 *
 * @param status - Trạng thái của danh mục dịch vụ
 * @returns Trạng thái
 */
const getStatusColor = (status: string) => {
  const statusConfig = packageCategoryStatuses.find((s) => s.value === status);
  return statusConfig?.color || "default";
};

/**
 *
 * @param status - Trạng thái của danh mục dịch vụ
 * @returns Trạng thái
 */
const getStatusLabel = (status: string) => {
  const statusConfig = packageCategoryStatuses.find((s) => s.value === status);
  return statusConfig?.label || status;
};

/**
 *
 * @param originalPrice - Giá gốc
 * @param currentPrice - Giá hiện tại
 * @returns Phần trăm giảm giá
 */
const calculateDiscount = (originalPrice: number, currentPrice: number) => {
  if (!originalPrice || originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

export { getStatusColor, getStatusLabel, calculateDiscount };
