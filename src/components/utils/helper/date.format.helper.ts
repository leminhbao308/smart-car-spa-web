/**
 *
 * @param dateString - Ngày cần định dạng
 * @returns Ngày định dạng thành dd/mm/yyyy
 */
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("vi-VN");
};

export { formatDate };
