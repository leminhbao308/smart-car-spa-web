import { branchStatuses } from "../data/branches.data";

/**
 *
 * @param status - Trạng thái của chi nhánh
 * @returns Trạng thái 
 */
const getStatusColor = (status: string) => {
  const statusConfig = branchStatuses.find((s) => s.value === status);
  return statusConfig?.color || "default";
};

/**
 *
 * @param status - Trạng thái của chi nhánh
 * @returns Trạng thái
 */
const getStatusLabel = (status: string) => {
  const statusConfig = branchStatuses.find((s) => s.value === status);
  return statusConfig?.label || status;
};

export { getStatusColor, getStatusLabel };
