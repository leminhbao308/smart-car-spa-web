/**
 *
 * @param year - Năm sản xuất của xe
 * @returns Tuổi của xe
 */
const calculateVehicleAge = (year: number) => {
  const currentYear = new Date().getFullYear();
  return currentYear - year;
};

/**
 *
 * @param nextServiceDate - Ngày đến hạn bảo dưỡng
 * @returns Số ngày đến hạn bảo dưỡng
 */
const getDaysUntilService = (nextServiceDate: string | undefined | null) => {
  if (!nextServiceDate) {
    return 0;
  }
  const today = new Date();
  const serviceDate = new Date(nextServiceDate);
  const diffTime = serviceDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

interface ServiceRecord {
  cost: number;
  [key: string]: unknown;
}

/**
 *
 * @param serviceHistory - Lịch sử bảo dưỡng
 * @returns Tổng chi phí bảo dưỡng
 */
const getTotalServiceCost = (serviceHistory: ServiceRecord[] | undefined | null) => {
  if (!serviceHistory || !Array.isArray(serviceHistory)) {
    return 0;
  }
  return serviceHistory.reduce((total, service) => total + (service.cost || 0), 0);
};

export { calculateVehicleAge, getDaysUntilService, getTotalServiceCost };
