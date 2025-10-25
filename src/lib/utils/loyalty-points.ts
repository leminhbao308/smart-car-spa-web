/**
 * Loyalty Points Utility
 * Tỉ lệ: 10,000 VNĐ = 1 điểm
 */

export const POINTS_RATE = 1000; // 1,000 VNĐ = 1 điểm

/**
 * Tính số điểm sẽ được tích từ số tiền thanh toán
 * @param amount - Số tiền thanh toán (VNĐ)
 * @returns Số điểm được tích (làm tròn xuống)
 */
export const calculatePointsToEarn = (amount: number): number => {
  if (amount <= 0) return 0;
  return Math.floor(amount / POINTS_RATE);
};

/**
 * Tính số tiền cần chi để đạt số điểm mong muốn
 * @param points - Số điểm mong muốn
 * @returns Số tiền cần chi (VNĐ)
 */
export const calculateAmountForPoints = (points: number): number => {
  if (points <= 0) return 0;
  return points * POINTS_RATE;
};

/**
 * Format hiển thị điểm
 * @param points - Số điểm
 * @returns Chuỗi format (VD: "1,234 điểm")
 */
export const formatPoints = (points: number): string => {
  return `${points.toLocaleString()} điểm`;
};

/**
 * Kiểm tra khách hàng có đủ điều kiện tích điểm không
 * @param customerId - ID khách hàng
 * @returns true nếu đủ điều kiện
 */
export const isEligibleForPoints = (
  customerId: string | undefined | null
): boolean => {
  // Khách lẻ (không có customer_id) không được tích điểm
  return !!customerId && customerId !== "";
};
