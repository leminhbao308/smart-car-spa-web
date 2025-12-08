import dayjs from "dayjs";

/**
 *
 * @param bookingDate - Ngày đặt lịch
 * @param bookingTime - Giờ đặt lịch
 * @returns Thời gian còn lại từ lúc đặt lịch đến lúc hiện tại
 */
const getTimeRemaining = (bookingDate: string, bookingTime: string) => {
  const bookingDateTime = dayjs(`${bookingDate} ${bookingTime}`);
  const now = dayjs();
  const diffMinutes = bookingDateTime.diff(now, "minute");

  if (diffMinutes < 0) return "";
  if (diffMinutes < 60) return `${diffMinutes} phút`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} giờ`;
  return `${Math.floor(diffMinutes / 1440)} ngày`;
};

export { getTimeRemaining };
