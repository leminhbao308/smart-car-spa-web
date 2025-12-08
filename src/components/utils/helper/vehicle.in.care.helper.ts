import {
  priorityLevels,
  stepCategories,
  stepProgressData,
} from "../data/care-processes.data";

/**
 *
 * @param priority - Mức độ ưu tiên
 * @returns Color của mức độ ưu tiên
 */
const getPriorityColor = (priority: string) => {
  const priorityConfig = priorityLevels.find((p) => p.value === priority);
  return priorityConfig?.color || "default";
};

/**
 *
 * @param priority - Mức độ ưu tiên
 * @returns Label của mức độ ưu tiên
 */
const getPriorityLabel = (priority: string) => {
  const priorityConfig = priorityLevels.find((p) => p.value === priority);
  return priorityConfig?.label || priority;
};

/**
 *
 * @param status - Trạng thái chăm sóc xe
 * @returns Color của trạng thái chăm sóc xe
 */
const getStatusColor = (status: string) => {
  switch (status) {
    case "in_progress":
      return "blue";
    case "completed":
      return "green";
    case "paused":
      return "orange";
    case "cancelled":
      return "red";
    default:
      return "default";
  }
};

/**
 *
 * @param status - Trạng thái chăm sóc xe
 * @returns Label của trạng thái chăm sóc xe
 */
const getStatusLabel = (status: string) => {
  switch (status) {
    case "in_progress":
      return "Đang thực hiện";
    case "completed":
      return "Hoàn thành";
    case "paused":
      return "Tạm dừng";
    case "cancelled":
      return "Đã hủy";
    default:
      return status;
  }
};

/**
 *
 * @param vehicleId - ID của xe
 * @returns Bước quy trình chăm sóc xe
 */
const getStepProgress = (vehicleId: number) => {
  return stepProgressData
    .filter((step) => step.vehicleInCareId === vehicleId)
    .sort((a, b) => a.stepId - b.stepId); // Sắp xếp theo stepId
};

/**
 *
 * @param category - Loại bước quy trình chăm sóc xe
 * @returns Icon của loại bước quy trình chăm sóc xe
 */
const getStepCategoryIcon = (category: string) => {
  const categoryConfig = stepCategories.find((c) => c.value === category);
  return categoryConfig?.icon || "📋";
};

/**
 *
 * @param category - Loại bước quy trình chăm sóc xe
 * @returns Color của loại bước quy trình chăm sóc xe
 */
const getStepCategoryColor = (category: string) => {
  const categoryConfig = stepCategories.find((c) => c.value === category);
  return categoryConfig?.color || "default";
};

/**
 *
 * @param status - Trạng thái bước quy trình chăm sóc xe
 * @returns Color của trạng thái bước quy trình chăm sóc xe
 */
const getStepStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "green";
    case "in_progress":
      return "blue";
    case "pending":
      return "default";
    case "skipped":
      return "red";
    default:
      return "default";
  }
};

/**
 *
 * @param status - Trạng thái bước quy trình chăm sóc xe
 * @returns Label của trạng thái bước quy trình chăm sóc xe
 */
const getStepStatusLabel = (status: string) => {
  switch (status) {
    case "completed":
      return "Hoàn thành";
    case "in_progress":
      return "Đang thực hiện";
    case "pending":
      return "Chờ thực hiện";
    case "skipped":
      return "Bỏ qua";
    default:
      return status;
  }
};

export {
  getStepCategoryIcon,
  getStepCategoryColor,
  getStepStatusColor,
  getStepStatusLabel,
  getPriorityColor,
  getPriorityLabel,
  getStatusColor,
  getStatusLabel,
  getStepProgress,
};
