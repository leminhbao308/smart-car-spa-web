import { serviceCategoryStatuses } from "../data/service-categories.data";

/**
 *
 * @param status - Trạng thái của danh mục dịch vụ
 * @returns Trạng thái
 */
const getStatusColor = (status: string) => {
  const statusConfig = serviceCategoryStatuses.find((s) => s.value === status);
  return statusConfig?.color || "default";
};

/**
 *
 * @param status - Trạng thái của danh mục dịch vụ
 * @returns Trạng thái
 */
const getStatusLabel = (status: string) => {
  const statusConfig = serviceCategoryStatuses.find((s) => s.value === status);
  return statusConfig?.label || status;
};

export { getStatusColor, getStatusLabel };
