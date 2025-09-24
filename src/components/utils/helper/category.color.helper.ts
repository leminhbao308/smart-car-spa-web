import { permissionCategories } from "../data/permissions.data";
import { categoryColors } from "../data/product-categories.data";

/**
 *
 * @param category - Mã permission
 * @returns Màu của permission
 */
const getCategoryColorPermission = (category: string) => {
  const categoryInfo = permissionCategories.find((c) => c.value === category);
  return categoryInfo?.color || "default";
};

/**
 *
 * @param color - Mã màu sắc
 * @returns Màu sắc
 */
const getCategoryColorProduct = (color: string) => {
  const colorConfig = categoryColors.find((c) => c.value === color);
  return colorConfig?.color || "default";
};

export { getCategoryColorPermission, getCategoryColorProduct };
