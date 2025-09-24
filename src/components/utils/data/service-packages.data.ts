// Mock data cho gói dịch vụ
export const servicePackagesData = [
  {
    id: 1,
    packageCode: "PKG001",
    packageName: "Gói chăm sóc xe cơ bản",
    description: "Gói dịch vụ chăm sóc xe cơ bản bao gồm rửa xe và kiểm tra tổng quát",
    services: [
      { 
        id: 1, 
        serviceName: "Rửa xe ngoài cơ bản", 
        totalPrice: 50000, // Sử dụng totalPrice thay vì price
        quantity: 1 
      },
      { 
        id: 3, 
        serviceName: "Làm sạch nội thất", 
        totalPrice: 80000, 
        quantity: 1 
      },
    ],
    totalPrice: 130000, // Chỉ có totalPrice = tổng giá các dịch vụ
    status: "active",
    targetCustomers: ["Khách hàng thường xuyên", "Xe gia đình"],
    validityPeriod: 30, // ngày
    maxUsage: 1, // số lần sử dụng
    features: [
      "Gói dịch vụ tiện lợi",
      "Áp dụng cho xe dưới 7 chỗ",
      "Có hiệu lực trong 30 ngày"
    ],
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
  },
  {
    id: 2,
    packageCode: "PKG002", 
    packageName: "Gói bảo dưỡng định kỳ",
    description: "Gói bảo dưỡng định kỳ toàn diện cho xe",
    services: [
      { id: 4, serviceName: "Thay dầu nhớt", totalPrice: 200000, quantity: 1 },
      { id: 5, serviceName: "Bảo dưỡng định kỳ", totalPrice: 500000, quantity: 1 },
      { id: 7, serviceName: "Kiểm định an toàn", totalPrice: 300000, quantity: 1 },
    ],
    totalPrice: 1000000,
    status: "active",
    targetCustomers: ["Xe công ty", "Xe taxi", "Xe tải nhỏ"],
    validityPeriod: 90,
    maxUsage: 1,
    features: [
      "Bảo dưỡng toàn diện",
      "Bảo hành 3 tháng",
      "Tặng kèm kiểm tra miễn phí"
    ],
    createdAt: "2024-01-16",
    updatedAt: "2024-01-21",
  },
  {
    id: 3,
    packageCode: "PKG003",
    packageName: "Gói làm đẹp cao cấp",
    description: "Gói làm đẹp cao cấp cho xe sang trọng",
    services: [
      { id: 2, serviceName: "Rửa xe ngoài cao cấp", totalPrice: 100000, quantity: 1 },
      { id: 6, serviceName: "Dán phim cách nhiệt", totalPrice: 800000, quantity: 1 },
      { id: 9, serviceName: "Dịch vụ VIP", totalPrice: 1000000, quantity: 1 },
    ],
    totalPrice: 1900000,
    status: "active",
    targetCustomers: ["Xe sang trọng", "Khách hàng VIP"],
    validityPeriod: 60,
    maxUsage: 1,
    features: [
      "Dịch vụ cao cấp",
      "Dịch vụ tại nhà",
      "Bảo hành 2 năm cho phim cách nhiệt"
    ],
    createdAt: "2024-01-17",
    updatedAt: "2024-01-22",
  },
  {
    id: 4,
    packageCode: "PKG004",
    packageName: "Gói cứu hộ khẩn cấp",
    description: "Gói cứu hộ khẩn cấp 24/7",
    services: [
      { id: 8, serviceName: "Cứu hộ 24/7", totalPrice: 200000, quantity: 1 },
      { id: 10, serviceName: "Tư vấn kỹ thuật", totalPrice: 100000, quantity: 2 },
    ],
    totalPrice: 400000,
    status: "active",
    targetCustomers: ["Xe công ty", "Xe taxi", "Tất cả khách hàng"],
    validityPeriod: 365,
    maxUsage: 5,
    features: [
      "Cứu hộ khẩn cấp",
      "Cứu hộ 24/7 trong 1 năm",
      "Tư vấn kỹ thuật miễn phí"
    ],
    createdAt: "2024-01-18",
    updatedAt: "2024-01-23",
  },
  {
    id: 5,
    packageCode: "PKG005",
    packageName: "Gói gia đình",
    description: "Gói dịch vụ dành cho gia đình có nhiều xe",
    services: [
      { id: 1, serviceName: "Rửa xe ngoài cơ bản", totalPrice: 50000, quantity: 4 },
      { id: 3, serviceName: "Làm sạch nội thất", totalPrice: 80000, quantity: 2 },
      { id: 4, serviceName: "Thay dầu nhớt", totalPrice: 200000, quantity: 2 },
    ],
    totalPrice: 520000,
    status: "active",
    targetCustomers: ["Gia đình", "Khách hàng thân thiết"],
    validityPeriod: 60,
    maxUsage: 1,
    features: [
      "Gói gia đình tiện lợi",
      "Áp dụng cho tối đa 4 xe",
      "Có hiệu lực trong 60 ngày"
    ],
    createdAt: "2024-01-19",
    updatedAt: "2024-01-24",
  },
  {
    id: 6,
    packageCode: "PKG006",
    packageName: "Gói doanh nghiệp",
    description: "Gói dịch vụ dành cho doanh nghiệp có đội xe",
    services: [
      { id: 5, serviceName: "Bảo dưỡng định kỳ", totalPrice: 500000, quantity: 10 },
      { id: 7, serviceName: "Kiểm định an toàn", totalPrice: 300000, quantity: 10 },
      { id: 8, serviceName: "Cứu hộ 24/7", totalPrice: 200000, quantity: 1 },
    ],
    totalPrice: 8200000,
    status: "inactive",
    targetCustomers: ["Doanh nghiệp", "Công ty vận tải"],
    validityPeriod: 180,
    maxUsage: 1,
    features: [
      "Gói doanh nghiệp",
      "Áp dụng cho tối đa 10 xe",
      "Bảo hành 6 tháng",
      "Hỗ trợ kỹ thuật 24/7"
    ],
    createdAt: "2024-01-20",
    updatedAt: "2024-01-25",
  },
];

// Định nghĩa trạng thái gói dịch vụ
export const packageStatuses = [
  { value: "active", label: "Hoạt động", color: "green" },
  { value: "inactive", label: "Không hoạt động", color: "red" },
  { value: "draft", label: "Bản nháp", color: "orange" },
  { value: "archived", label: "Lưu trữ", color: "gray" },
];

// Định nghĩa nhóm khách hàng mục tiêu
export const targetCustomerGroups = [
  { value: "Khách hàng thường xuyên", label: "Khách hàng thường xuyên" },
  { value: "Xe gia đình", label: "Xe gia đình" },
  { value: "Xe công ty", label: "Xe công ty" },
  { value: "Xe taxi", label: "Xe taxi" },
  { value: "Xe tải nhỏ", label: "Xe tải nhỏ" },
  { value: "Xe sang trọng", label: "Xe sang trọng" },
  { value: "Khách hàng VIP", label: "Khách hàng VIP" },
  { value: "Gia đình", label: "Gia đình" },
  { value: "Khách hàng thân thiết", label: "Khách hàng thân thiết" },
  { value: "Doanh nghiệp", label: "Doanh nghiệp" },
  { value: "Công ty vận tải", label: "Công ty vận tải" },
  { value: "Tất cả khách hàng", label: "Tất cả khách hàng" },
];

// Định nghĩa thời gian hiệu lực
export const validityPeriods = [
  { value: 7, label: "7 ngày" },
  { value: 15, label: "15 ngày" },
  { value: 30, label: "30 ngày" },
  { value: 60, label: "60 ngày" },
  { value: 90, label: "90 ngày" },
  { value: 180, label: "180 ngày" },
  { value: 365, label: "1 năm" },
];

// Định nghĩa số lần sử dụng tối đa
export const maxUsageOptions = [
  { value: 1, label: "1 lần" },
  { value: 2, label: "2 lần" },
  { value: 3, label: "3 lần" },
  { value: 5, label: "5 lần" },
  { value: 10, label: "10 lần" },
  { value: -1, label: "Không giới hạn" },
];
