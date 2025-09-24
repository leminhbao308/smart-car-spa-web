export interface Promotion {
  id: number;
  name: string;
  code: string;
  description: string;
  type: "percentage" | "fixed" | "gift" | "combo"; // Loại khuyến mãi
  value: number; // Giá trị khuyến mãi
  startDate: string;
  endDate: string;
  status: "active" | "inactive" | "scheduled" | "expired";
  isPublic: boolean; // Có công khai hay không
  usageLimit?: number; // Giới hạn sử dụng tổng
  usedCount: number; // Số lần đã sử dụng
  customerLimit?: number; // Giới hạn khách hàng
  customerUsedCount: number; // Số khách hàng đã sử dụng
  conditions: {
    id: number;
    description: string;
    type: "min_amount" | "min_quantity" | "specific_service" | "specific_product" | "customer_type";
    value?: number;
    target?: string[];
  }[];
  benefits: string[]; // Lợi ích
  terms: string[]; // Điều khoản
  targetAudience: {
    customerTypes: string[]; // Loại khách hàng
    branches: string[]; // Chi nhánh áp dụng
    services: string[]; // Dịch vụ áp dụng
    products: string[]; // Sản phẩm áp dụng
  };
  priority: number; // Độ ưu tiên (1-10)
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const promotionsData: Promotion[] = [
  {
    id: 1,
    name: "Giảm giá 20% cho khách hàng mới",
    code: "NEW_CUSTOMER_20",
    description: "Chương trình giảm giá đặc biệt dành cho khách hàng lần đầu sử dụng dịch vụ",
    type: "percentage",
    value: 20,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    status: "active",
    isPublic: true,
    usageLimit: 1000,
    usedCount: 245,
    customerLimit: 500,
    customerUsedCount: 245,
    conditions: [
      {
        id: 1,
        description: "Đơn hàng tối thiểu 500,000 ₫",
        type: "min_amount",
        value: 500000,
      },
      {
        id: 2,
        description: "Chỉ áp dụng cho khách hàng mới",
        type: "customer_type",
        target: ["new_customer"],
      },
    ],
    benefits: [
      "Tiết kiệm 20% chi phí dịch vụ",
      "Trải nghiệm dịch vụ chất lượng cao",
      "Hỗ trợ tư vấn miễn phí",
    ],
    terms: [
      "Không áp dụng với các chương trình khuyến mãi khác",
      "Chỉ áp dụng cho đơn hàng đầu tiên",
      "Có thể thay đổi mà không cần thông báo trước",
    ],
    targetAudience: {
      customerTypes: ["new_customer"],
      branches: ["all"],
      services: ["all"],
      products: ["all"],
    },
    priority: 8,
    notes: "Chương trình khuyến mãi đặc biệt cho khách hàng mới",
    createdAt: "2024-01-01",
    updatedAt: "2024-06-15",
  },
  {
    id: 2,
    name: "Combo rửa xe + đánh bóng giảm 15%",
    code: "COMBO_WASH_POLISH",
    description: "Gói combo rửa xe và đánh bóng với mức giảm giá hấp dẫn",
    type: "percentage",
    value: 15,
    startDate: "2024-02-01",
    endDate: "2024-11-30",
    status: "active",
    isPublic: true,
    usageLimit: 500,
    usedCount: 89,
    customerLimit: 200,
    customerUsedCount: 89,
    conditions: [
      {
        id: 3,
        description: "Phải sử dụng cả 2 dịch vụ: Rửa xe và Đánh bóng",
        type: "specific_service",
        target: ["wash", "polish"],
      },
      {
        id: 4,
        description: "Đơn hàng tối thiểu 800,000 ₫",
        type: "min_amount",
        value: 800000,
      },
    ],
    benefits: [
      "Tiết kiệm 15% khi sử dụng combo",
      "Chất lượng dịch vụ cao cấp",
      "Thời gian xử lý nhanh chóng",
    ],
    terms: [
      "Phải đặt trước ít nhất 1 ngày",
      "Không hoàn tiền nếu hủy trong ngày",
      "Áp dụng cho tất cả loại xe",
    ],
    targetAudience: {
      customerTypes: ["all"],
      branches: ["all"],
      services: ["wash", "polish"],
      products: ["all"],
    },
    priority: 7,
    notes: "Combo dịch vụ phổ biến nhất",
    createdAt: "2024-02-01",
    updatedAt: "2024-06-10",
  },
  {
    id: 3,
    name: "Tặng kèm sản phẩm chăm sóc",
    code: "FREE_CARE_PRODUCT",
    description: "Tặng kèm sản phẩm chăm sóc xe khi sử dụng dịch vụ đánh bóng",
    type: "gift",
    value: 1,
    startDate: "2024-03-01",
    endDate: "2024-10-31",
    status: "active",
    isPublic: true,
    usageLimit: 300,
    usedCount: 67,
    customerLimit: 150,
    customerUsedCount: 67,
    conditions: [
      {
        id: 5,
        description: "Sử dụng dịch vụ đánh bóng",
        type: "specific_service",
        target: ["polish"],
      },
      {
        id: 6,
        description: "Đơn hàng tối thiểu 1,000,000 ₫",
        type: "min_amount",
        value: 1000000,
      },
    ],
    benefits: [
      "Nhận sản phẩm chăm sóc xe miễn phí",
      "Hướng dẫn sử dụng sản phẩm",
      "Bảo hành sản phẩm 3 tháng",
    ],
    terms: [
      "Sản phẩm tặng kèm có thể thay đổi",
      "Không đổi trả sản phẩm tặng kèm",
      "Áp dụng trong khi còn hàng",
    ],
    targetAudience: {
      customerTypes: ["all"],
      branches: ["all"],
      services: ["polish"],
      products: ["care_products"],
    },
    priority: 6,
    notes: "Chương trình tặng kèm sản phẩm",
    createdAt: "2024-03-01",
    updatedAt: "2024-06-05",
  },
  {
    id: 4,
    name: "Giảm 100,000 ₫ cho đơn hàng lớn",
    code: "BIG_ORDER_100K",
    description: "Giảm giá cố định cho các đơn hàng có giá trị cao",
    type: "fixed",
    value: 100000,
    startDate: "2024-04-01",
    endDate: "2024-09-30",
    status: "active",
    isPublic: false,
    usageLimit: 200,
    usedCount: 34,
    customerLimit: 100,
    customerUsedCount: 34,
    conditions: [
      {
        id: 7,
        description: "Đơn hàng tối thiểu 2,000,000 ₫",
        type: "min_amount",
        value: 2000000,
      },
      {
        id: 8,
        description: "Chỉ áp dụng cho khách hàng VIP",
        type: "customer_type",
        target: ["vip"],
      },
    ],
    benefits: [
      "Tiết kiệm 100,000 ₫",
      "Ưu tiên phục vụ",
      "Tư vấn chuyên nghiệp",
    ],
    terms: [
      "Chỉ áp dụng cho khách hàng VIP",
      "Không áp dụng với khuyến mãi khác",
      "Cần đăng ký trước khi sử dụng",
    ],
    targetAudience: {
      customerTypes: ["vip"],
      branches: ["all"],
      services: ["all"],
      products: ["all"],
    },
    priority: 9,
    notes: "Chương trình dành riêng cho khách hàng VIP",
    createdAt: "2024-04-01",
    updatedAt: "2024-06-01",
  },
  {
    id: 5,
    name: "Khuyến mãi cuối tuần",
    code: "WEEKEND_SPECIAL",
    description: "Chương trình khuyến mãi đặc biệt vào cuối tuần",
    type: "percentage",
    value: 10,
    startDate: "2024-05-01",
    endDate: "2024-08-31",
    status: "scheduled",
    isPublic: true,
    usageLimit: 1000,
    usedCount: 0,
    customerLimit: 500,
    customerUsedCount: 0,
    conditions: [
      {
        id: 9,
        description: "Chỉ áp dụng vào thứ 7 và chủ nhật",
        type: "min_amount",
        value: 300000,
      },
    ],
    benefits: [
      "Giảm 10% vào cuối tuần",
      "Không cần đặt trước",
      "Áp dụng cho tất cả dịch vụ",
    ],
    terms: [
      "Chỉ áp dụng vào cuối tuần",
      "Không áp dụng với combo khác",
      "Có thể thay đổi mà không báo trước",
    ],
    targetAudience: {
      customerTypes: ["all"],
      branches: ["all"],
      services: ["all"],
      products: ["all"],
    },
    priority: 5,
    notes: "Chương trình cuối tuần",
    createdAt: "2024-05-01",
    updatedAt: "2024-05-30",
  },
];

export const promotionTypes = [
  { value: "percentage", label: "Giảm theo phần trăm", icon: "📊" },
  { value: "fixed", label: "Giảm số tiền cố định", icon: "💰" },
  { value: "gift", label: "Tặng kèm sản phẩm", icon: "🎁" },
  { value: "combo", label: "Combo dịch vụ", icon: "📦" },
];

export const promotionStatuses = [
  { value: "active", label: "Đang hoạt động", color: "green" },
  { value: "inactive", label: "Tạm dừng", color: "red" },
  { value: "scheduled", label: "Đã lên lịch", color: "blue" },
  { value: "expired", label: "Đã hết hạn", color: "gray" },
];

export const customerTypes = [
  { value: "all", label: "Tất cả khách hàng" },
  { value: "new_customer", label: "Khách hàng mới" },
  { value: "vip", label: "Khách hàng VIP" },
  { value: "regular", label: "Khách hàng thường" },
];

export const conditionTypes = [
  { value: "min_amount", label: "Số tiền tối thiểu" },
  { value: "min_quantity", label: "Số lượng tối thiểu" },
  { value: "specific_service", label: "Dịch vụ cụ thể" },
  { value: "specific_product", label: "Sản phẩm cụ thể" },
  { value: "customer_type", label: "Loại khách hàng" },
];

// Helper functions
export const getTypeLabel = (type: string) => {
  const promotionType = promotionTypes.find((t) => t.value === type);
  return promotionType ? promotionType.label : type;
};

export const getTypeIcon = (type: string) => {
  const promotionType = promotionTypes.find((t) => t.value === type);
  return promotionType ? promotionType.icon : "❓";
};

export const getStatusColor = (status: string) => {
  const statusInfo = promotionStatuses.find((s) => s.value === status);
  return statusInfo ? statusInfo.color : "default";
};

export const getStatusLabel = (status: string) => {
  const statusInfo = promotionStatuses.find((s) => s.value === status);
  return statusInfo ? statusInfo.label : status;
};

export const isExpired = (endDate: string) => {
  const now = new Date();
  const end = new Date(endDate);
  return now > end;
};

export const isActive = (startDate: string, endDate: string, status: string) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return (
    status === "active" &&
    now >= start &&
    now <= end
  );
};

export const formatPromotionValue = (type: string, value: number) => {
  switch (type) {
    case "percentage":
      return `${value}%`;
    case "fixed":
      return `${value.toLocaleString()} ₫`;
    case "gift":
      return `${value} sản phẩm`;
    case "combo":
      return `Combo ${value}`;
    default:
      return value.toString();
  }
};