/**
 * Hàm định dạng số tiền thành dạng VND
 * @param amount - Số tiền cần định dạng
 * @returns Số tiền định dạng thành VND
 */
const formatCurrency = (amount: number | unknown) => {
  const numAmount = typeof amount === "number" ? amount : Number(amount);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(numAmount);
};

export default formatCurrency;
