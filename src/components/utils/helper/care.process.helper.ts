import { processCategories, stepCategories } from "../data/care-processes.data";

/**
 *
 * @param category - Loại quy trình
 * @returns Icon của loại quy trình
 */
const getCategoryIcon = (category: string) => {
  const categoryConfig = processCategories.find((c) => c.value === category);
  return categoryConfig?.icon || "⭐";
};

/**
 *
 * @param category - Loại quy trình
 * @returns Label của loại quy trình
 */
const getCategoryLabel = (category: string) => {
  const categoryConfig = processCategories.find((c) => c.value === category);
  return categoryConfig?.label || category;
};

/**
 *
 * @param category - Loại quy trình
 * @returns Color của loại quy trình
 */
const getCategoryColor = (category: string) => {
  const categoryConfig = processCategories.find((c) => c.value === category);
  return categoryConfig?.color || "default";
};

/**
 *
 * @param category - Loại quy trình
 * @returns Icon của bước quy trình
 */
const getStepCategoryIcon = (category: string) => {
  const categoryConfig = stepCategories.find((c) => c.value === category);
  return categoryConfig?.icon || "📋";
};

/**
 *
 * @param category - Loại quy trình
 * @returns Label của bước quy trình
 */
const getStepCategoryLabel = (category: string) => {
  const categoryConfig = stepCategories.find((c) => c.value === category);
  return categoryConfig?.label || category;
};

/**
 *
 * @param category - Loại quy trình
 * @returns Color của bước quy trình
 */
const getStepCategoryColor = (category: string) => {
  const categoryConfig = stepCategories.find((c) => c.value === category);
  return categoryConfig?.color || "default";
};

export {
  getCategoryIcon,
  getCategoryLabel,
  getCategoryColor,
  getStepCategoryIcon,
  getStepCategoryLabel,
  getStepCategoryColor,
};
