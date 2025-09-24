import {
  contractStatuses,
  supplierStatuses,
  supplierTypes,
} from "../data/suppliers.data";

/**
 *
 * @param status - Trạng thái của nhà cung cấp
 * @returns Màu sắc của trạng thái nhà cung cấp
 */
const getStatusColor = (status: string) => {
  const statusConfig = supplierStatuses.find((s) => s.value === status);
  return statusConfig?.color || "default";
};

/**
 *
 * @param status - Trạng thái của nhà cung cấp
 * @returns Label của trạng thái nhà cung cấp
 */
const getStatusLabel = (status: string) => {
  const statusConfig = supplierStatuses.find((s) => s.value === status);
  return statusConfig?.label || status;
};

/**
 *
 * @param type - Loại của nhà cung cấp
 * @returns Icon của loại nhà cung cấp
 */
const getTypeIcon = (type: string) => {
  const typeConfig = supplierTypes.find((t) => t.value === type);
  return typeConfig?.icon || "📋";
};

/**
 *
 * @param type - Loại của nhà cung cấp
 * @returns Label của loại nhà cung cấp
 */
const getTypeLabel = (type: string) => {
  const typeConfig = supplierTypes.find((t) => t.value === type);
  return typeConfig?.label || type;
};

/**
 *
 * @param status - Trạng thái của hợp đồng
 * @returns Màu sắc của trạng thái hợp đồng
 */
const getContractStatusColor = (status: string) => {
  const statusConfig = contractStatuses.find((s) => s.value === status);
  return statusConfig?.color || "default";
};

/**
 *
 * @param status - Trạng thái của hợp đồng
 * @returns Label của trạng thái hợp đồng
 */
const getContractStatusLabel = (status: string) => {
  const statusConfig = contractStatuses.find((s) => s.value === status);
  return statusConfig?.label || status;
};

/**
 *
 * @param endDate - Ngày kết thúc của hợp đồng
 * @returns true nếu hợp đồng đã hết hạn
 */
const isContractExpired = (endDate: string) => {
  return new Date(endDate) < new Date();
};

export {
  getStatusColor,
  getStatusLabel,
  getTypeIcon,
  getTypeLabel,
  getContractStatusColor,
  getContractStatusLabel,
  isContractExpired,
};
