// Mock data cho loại dịch vụ
export const serviceTypesData = [
  {
    id: 1,
    serviceTypeCode: "CLEANING",
    serviceTypeName: "Làm sạch",
    description: "Các dịch vụ làm sạch và vệ sinh xe",
    icon: "🧽",
    color: "blue",
    status: "active",
    totalServices: 8,
    features: [
      "Rửa xe ngoài",
      "Làm sạch nội thất",
      "Đánh bóng",
      "Vệ sinh động cơ"
    ],
    createdAt: "2020-01-01 00:00:00",
    updatedAt: "2024-01-15 10:30:00",
  },
  {
    id: 2,
    serviceTypeCode: "MAINTENANCE",
    serviceTypeName: "Bảo dưỡng",
    description: "Các dịch vụ bảo dưỡng và sửa chữa xe",
    icon: "🔧",
    color: "green",
    status: "active",
    totalServices: 12,
    features: [
      "Thay dầu nhớt",
      "Kiểm tra hệ thống",
      "Bảo dưỡng định kỳ",
      "Sửa chữa cơ bản"
    ],
    createdAt: "2020-01-02 00:00:00",
    updatedAt: "2024-01-16 14:20:00",
  },
  {
    id: 3,
    serviceTypeCode: "BEAUTY",
    serviceTypeName: "Làm đẹp",
    description: "Các dịch vụ làm đẹp và trang trí xe",
    icon: "✨",
    color: "purple",
    status: "active",
    totalServices: 6,
    features: [
      "Dán phim cách nhiệt",
      "Trang trí nội thất",
      "Làm đẹp ngoại thất",
      "Nâng cấp phụ kiện"
    ],
    createdAt: "2020-01-03 00:00:00",
    updatedAt: "2024-01-17 09:15:00",
  },
  {
    id: 4,
    serviceTypeCode: "INSPECTION",
    serviceTypeName: "Kiểm định",
    description: "Các dịch vụ kiểm định và đăng kiểm",
    icon: "🔍",
    color: "orange",
    status: "active",
    totalServices: 4,
    features: [
      "Kiểm định an toàn",
      "Đăng kiểm xe",
      "Kiểm tra khí thải",
      "Bảo hiểm xe"
    ],
    createdAt: "2020-01-04 00:00:00",
    updatedAt: "2024-01-18 16:45:00",
  },
  {
    id: 5,
    serviceTypeCode: "EMERGENCY",
    serviceTypeName: "Cứu hộ",
    description: "Các dịch vụ cứu hộ và hỗ trợ khẩn cấp",
    icon: "🚨",
    color: "red",
    status: "active",
    totalServices: 3,
    features: [
      "Cứu hộ 24/7",
      "Thay lốp dự phòng",
      "Sạc ắc quy",
      "Kéo xe"
    ],
    createdAt: "2020-01-05 00:00:00",
    updatedAt: "2024-01-19 11:30:00",
  },
  {
    id: 6,
    serviceTypeCode: "PREMIUM",
    serviceTypeName: "Cao cấp",
    description: "Các dịch vụ cao cấp và chuyên nghiệp",
    icon: "💎",
    color: "gold",
    status: "active",
    totalServices: 5,
    features: [
      "Dịch vụ VIP",
      "Chăm sóc cá nhân",
      "Bảo dưỡng chuyên sâu",
      "Tư vấn chuyên nghiệp"
    ],
    createdAt: "2020-01-06 00:00:00",
    updatedAt: "2024-01-20 13:20:00",
  },
  {
    id: 7,
    serviceTypeCode: "CONSULTATION",
    serviceTypeName: "Tư vấn",
    description: "Các dịch vụ tư vấn và hỗ trợ khách hàng",
    icon: "💬",
    color: "cyan",
    status: "active",
    totalServices: 2,
    features: [
      "Tư vấn kỹ thuật",
      "Hỗ trợ khách hàng",
      "Tư vấn bảo hiểm",
      "Hướng dẫn sử dụng"
    ],
    createdAt: "2020-01-07 00:00:00",
    updatedAt: "2024-01-21 08:45:00",
  },
  {
    id: 8,
    serviceTypeCode: "PACKAGE",
    serviceTypeName: "Gói dịch vụ",
    description: "Các gói dịch vụ tổng hợp và tiết kiệm",
    icon: "📦",
    color: "lime",
    status: "inactive",
    totalServices: 0,
    features: [
      "Gói cơ bản",
      "Gói tiết kiệm",
      "Gói VIP",
      "Gói gia đình"
    ],
    createdAt: "2020-01-08 00:00:00",
    updatedAt: "2024-01-22 15:10:00",
  },
];

// Định nghĩa trạng thái loại dịch vụ
export const serviceTypeStatuses = [
  { value: "active", label: "Hoạt động", color: "green" },
  { value: "inactive", label: "Không hoạt động", color: "red" },
  { value: "archived", label: "Lưu trữ", color: "gray" },
];

// Định nghĩa màu sắc cho loại dịch vụ
export const serviceTypeColors = [
  { value: "blue", label: "Xanh dương", color: "blue" },
  { value: "green", label: "Xanh lá", color: "green" },
  { value: "purple", label: "Tím", color: "purple" },
  { value: "orange", label: "Cam", color: "orange" },
  { value: "red", label: "Đỏ", color: "red" },
  { value: "gold", label: "Vàng", color: "gold" },
  { value: "cyan", label: "Xanh lam", color: "cyan" },
  { value: "lime", label: "Xanh chanh", color: "lime" },
];
