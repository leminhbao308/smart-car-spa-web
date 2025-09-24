/**
 *
 * @param level - Mức độ
 * @param levels - Mảng mức độ
 * @returns Màu của mức độ
 */
const getLevelColor = (level: string, levels: any[]) => {
  const levelConfig = levels.find(
    (l) => l.value === level.toLowerCase().replace(" ", "_")
  );
  return levelConfig?.color || "default";
};

/**
 *
 * @param level - Mức độ
 * @param levels - Mảng mức độ
 * @returns Icon của mức độ
 */
const getLevelIcon = (level: string, levels: any[]) => {
  const levelConfig = levels.find(
    (l) => l.value === level.toLowerCase().replace(" ", "_")
  );
  return levelConfig?.icon || "⚪";
};

export { getLevelColor, getLevelIcon };
