import { pricingCategories, pricingStatuses } from "../data/pricing.data";

/**
 *
 * @param status - Trạng thái của dịch vụ
 * @returns Màu sắc của trạng thái
 */
const getStatusColor = (status: string) => {
  const statusConfig = pricingStatuses.find((s) => s.value === status);
  return statusConfig?.color || "default";
};

/**
 *
 * @param status - Trạng thái của dịch vụ
 * @returns Label của trạng thái
 */
const getStatusLabel = (status: string) => {
  const statusConfig = pricingStatuses.find((s) => s.value === status);
  return statusConfig?.label || status;
};

/**
 *
 * @param categoryName - Tên danh mục dịch vụ
 * @returns Icon của danh mục dịch vụ
 */
const getCategoryIcon = (categoryName: string) => {
  const category = pricingCategories.find((c) => c.name === categoryName);
  return category?.icon || "🔧";
};

/**
 *
 * @param categoryName - Tên danh mục dịch vụ
 * @returns Color của danh mục dịch vụ
 */
const getCategoryColor = (categoryName: string) => {
  const category = pricingCategories.find((c) => c.name === categoryName);
  return category?.color || "#1890ff";
};

export { getStatusColor, getStatusLabel, getCategoryIcon, getCategoryColor };
