/**
 *
 * @param dimension - Kích thước của model
 * @returns Kích thước đã định dạng
 */
const formatDimension = (dimension: string) => {
  return dimension.replace("mm", "");
};

/**
 *
 * @param launchDate - Ngày ra mắt của model
 * @returns Tuổi của model
 */
const calculateModelAge = (launchDate: string) => {
  const launch = new Date(launchDate);
  const now = new Date();
  const diffTime = now.getTime() - launch.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffYears = Math.floor(diffDays / 365);
  const diffMonths = Math.floor((diffDays % 365) / 30);

  if (diffYears > 0) {
    return `${diffYears} năm ${diffMonths} tháng`;
  } else {
    return `${diffMonths} tháng`;
  }
};

export { formatDimension, calculateModelAge };
