// Mock data cho danh mục sản phẩm
export const productCategoriesData = [
  {
    id: 1,
    categoryCode: "CLEANING",
    categoryName: "Sản phẩm làm sạch",
    description: "Các sản phẩm chuyên dụng để làm sạch và vệ sinh xe",
    icon: "🧽",
    color: "blue",
    parentId: null,
    status: "active",
    totalProducts: 45,
    features: [
      "An toàn cho sơn xe",
      "Hiệu quả cao",
      "Dễ sử dụng",
      "Thân thiện môi trường"
    ],
    createdAt: "2020-01-01 00:00:00",
    updatedAt: "2024-01-15 10:30:00",
  },
  {
    id: 2,
    categoryCode: "CARE",
    categoryName: "Chăm sóc nội thất",
    description: "Sản phẩm chăm sóc và bảo vệ nội thất xe",
    icon: "🛋️",
    color: "green",
    parentId: null,
    status: "active",
    totalProducts: 32,
    features: [
      "Bảo vệ da và vải",
      "Không độc hại",
      "Mùi hương dễ chịu",
      "Hiệu quả lâu dài"
    ],
    createdAt: "2020-01-01 00:00:00",
    updatedAt: "2024-01-15 10:30:00",
  },
  {
    id: 3,
    categoryCode: "MAINTENANCE",
    categoryName: "Bảo dưỡng",
    description: "Sản phẩm bảo dưỡng và bảo vệ động cơ xe",
    icon: "🔧",
    color: "orange",
    parentId: null,
    status: "active",
    totalProducts: 28,
    features: [
      "Tăng hiệu suất động cơ",
      "Bảo vệ lâu dài",
      "Tiết kiệm nhiên liệu",
      "Giảm hao mòn"
    ],
    createdAt: "2020-01-01 00:00:00",
    updatedAt: "2024-01-15 10:30:00",
  },
  {
    id: 4,
    categoryCode: "ACCESSORIES",
    categoryName: "Phụ kiện",
    description: "Các phụ kiện trang trí và tiện ích cho xe",
    icon: "🎨",
    color: "purple",
    parentId: null,
    status: "active",
    totalProducts: 67,
    features: [
      "Đa dạng mẫu mã",
      "Dễ lắp đặt",
      "Chất lượng tốt",
      "Giá cả hợp lý"
    ],
    createdAt: "2020-01-01 00:00:00",
    updatedAt: "2024-01-15 10:30:00",
  },
  {
    id: 5,
    categoryCode: "TOOLS",
    categoryName: "Dụng cụ",
    description: "Dụng cụ chuyên dụng để chăm sóc và sửa chữa xe",
    icon: "🛠️",
    color: "red",
    parentId: null,
    status: "active",
    totalProducts: 23,
    features: [
      "Chất lượng cao",
      "Bền bỉ",
      "Dễ sử dụng",
      "An toàn"
    ],
    subcategories: [
      { id: 51, name: "Dụng cụ rửa xe", code: "WASHING", productCount: 8 },
      { id: 52, name: "Dụng cụ sửa chữa", code: "REPAIR", productCount: 10 },
      { id: 53, name: "Dụng cụ đo lường", code: "MEASURING", productCount: 5 },
    ],
    createdAt: "2020-01-01 00:00:00",
    updatedAt: "2024-01-15 10:30:00",
  },
  {
    id: 6,
    categoryCode: "SAFETY",
    categoryName: "An toàn",
    description: "Sản phẩm đảm bảo an toàn cho xe và người sử dụng",
    icon: "🛡️",
    color: "cyan",
    parentId: null,
    status: "active",
    totalProducts: 19,
    features: [
      "Đạt tiêu chuẩn an toàn",
      "Chất lượng cao",
      "Dễ sử dụng",
      "Hiệu quả"
    ],
    createdAt: "2020-01-01 00:00:00",
    updatedAt: "2024-01-15 10:30:00",
  },
  {
    id: 7,
    categoryCode: "PREMIUM",
    categoryName: "Cao cấp",
    description: "Sản phẩm cao cấp dành cho xe sang trọng",
    icon: "💎",
    color: "gold",
    parentId: null,
    status: "active",
    totalProducts: 15,
    features: [
      "Chất lượng cao nhất",
      "Thiết kế sang trọng",
      "Hiệu quả vượt trội",
      "Độc quyền"
    ],
    createdAt: "2020-01-01 00:00:00",
    updatedAt: "2024-01-15 10:30:00",
  },
  {
    id: 8,
    categoryCode: "ECO",
    categoryName: "Thân thiện môi trường",
    description: "Sản phẩm thân thiện với môi trường",
    icon: "🌱",
    color: "lime",
    parentId: null,
    status: "active",
    totalProducts: 12,
    features: [
      "Thân thiện môi trường",
      "Không độc hại",
      "Có thể tái chế",
      "Hiệu quả cao"
    ],
    createdAt: "2020-01-01 00:00:00",
    updatedAt: "2024-01-15 10:30:00",
  },
];

// Định nghĩa trạng thái danh mục
export const categoryStatuses = [
  { value: "active", label: "Hoạt động", color: "green" },
  { value: "inactive", label: "Không hoạt động", color: "red" },
  { value: "archived", label: "Lưu trữ", color: "gray" },
];

// Định nghĩa màu sắc cho danh mục
export const categoryColors = [
  { value: "blue", label: "Xanh dương", color: "blue" },
  { value: "green", label: "Xanh lá", color: "green" },
  { value: "orange", label: "Cam", color: "orange" },
  { value: "purple", label: "Tím", color: "purple" },
  { value: "red", label: "Đỏ", color: "red" },
  { value: "cyan", label: "Xanh cyan", color: "cyan" },
  { value: "gold", label: "Vàng", color: "gold" },
  { value: "lime", label: "Xanh lime", color: "lime" },
  { value: "pink", label: "Hồng", color: "pink" },
  { value: "gray", label: "Xám", color: "gray" },
];

