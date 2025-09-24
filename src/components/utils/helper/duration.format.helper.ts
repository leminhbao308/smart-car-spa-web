/**
 * Hàm định dạng thời gian thành dạng hh:mm
 * @param minutes - Thời gian cần định dạng
 * @returns Thời gian định dạng thành hh:mm
 */
const formatDurationVer01 = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

/**
 * Hàm định dạng thời gian thành dạng hh:mm và có thể là không giới hạn
 * @param minutes - Thời gian cần định dạng
 * @returns Thời gian định dạng thành hh:mm
 */
const formatDurationVer02 = (minutes: number) => {
  if (minutes === 0) return "Không giới hạn";
  if (minutes < 60) {
    return `${minutes} phút`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}p` : `${hours}h`;
};

/**
 * Hàm định dạng thời gian thành dạng hh:mm nếu nhỏ hơn 60p thì hiển thị là ** phút vd 59 phút
 * @param minutes - Thời gian cần định dạng
 * @returns Thời gian định dạng thành hh:mm
 */
const formatDurationVer03 = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes} phút`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}p` : `${hours}h`;
};

/**
 * Hàm định dạng thời gian thành dạng hh:mm
 * @param minutes - Thời gian cần định dạng
 * @returns Thời gian định dạng thành hh:mm
 */
const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

export {
  formatDurationVer01,
  formatDurationVer02,
  formatDurationVer03,
  formatTime,
};
