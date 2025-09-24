export interface PromotionType {
  id: number;
  name: string;
  code: string;
  description: string;
  discountType: "percentage" | "amount"; // Loại giảm giá: phần trăm hoặc số tiền
  discountValue: number; // Giá trị giảm
  conditions: {
    minAmount?: number; // Số tiền tối thiểu để áp dụng
    maxAmount?: number; // Số tiền tối đa được giảm
    minQuantity?: number; // Số lượng tối thiểu
    maxQuantity?: number; // Số lượng tối đa
    applicableServices?: string[]; // Dịch vụ áp dụng
    applicableProducts?: string[]; // Sản phẩm áp dụng
    applicablePackages?: string[]; // Gói dịch vụ áp dụng
  };
  usageLimit?: {
    perCustomer?: number; // Số lần sử dụng tối đa mỗi khách hàng
    totalUsage?: number; // Tổng số lần sử dụng
    dailyLimit?: number; // Giới hạn sử dụng mỗi ngày
  };
  validityPeriod: {
    startDate: string;
    endDate: string;
    isActive: boolean;
  };
  status: "active" | "inactive";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const promotionTypesData: PromotionType[] = [
  {
    id: 1,
    name: "Giảm giá theo phần trăm",
    code: "PERCENT_DISCOUNT",
    description: "Áp dụng giảm giá theo phần trăm cho đơn hàng",
    discountType: "percentage",
    discountValue: 10,
    conditions: {
      minAmount: 500000,
      maxAmount: 1000000,
      minQuantity: 1,
      applicableServices: ["Rửa xe", "Đánh bóng"],
      applicableProducts: ["Shampoo", "Wax"],
    },
    usageLimit: {
      perCustomer: 3,
      totalUsage: 1000,
      dailyLimit: 50,
    },
    validityPeriod: {
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      isActive: true,
    },
    status: "active",
    notes: "Áp dụng cho khách hàng VIP",
    createdAt: "2024-01-01",
    updatedAt: "2024-06-15",
  },
  {
    id: 2,
    name: "Giảm giá cố định",
    code: "FIXED_DISCOUNT",
    description: "Giảm giá cố định cho đơn hàng",
    discountType: "amount",
    discountValue: 100000,
    conditions: {
      minAmount: 1000000,
      maxAmount: 200000,
      minQuantity: 2,
      applicableServices: ["Gói chăm sóc toàn diện"],
      applicableProducts: ["Tất cả sản phẩm"],
    },
    usageLimit: {
      perCustomer: 1,
      totalUsage: 500,
      dailyLimit: 20,
    },
    validityPeriod: {
      startDate: "2024-02-01",
      endDate: "2024-11-30",
      isActive: true,
    },
    status: "active",
    notes: "Chương trình khuyến mãi đặc biệt",
    createdAt: "2024-02-01",
    updatedAt: "2024-06-10",
  },
  {
    id: 3,
    name: "Giảm giá combo",
    code: "COMBO_DISCOUNT",
    description: "Giảm giá khi mua combo dịch vụ",
    discountType: "percentage",
    discountValue: 15,
    conditions: {
      minAmount: 800000,
      maxAmount: 500000,
      minQuantity: 3,
      applicableServices: ["Rửa xe", "Đánh bóng", "Phủ ceramic"],
      applicablePackages: ["Gói chăm sóc cao cấp"],
    },
    usageLimit: {
      perCustomer: 2,
      totalUsage: 300,
      dailyLimit: 15,
    },
    validityPeriod: {
      startDate: "2024-03-01",
      endDate: "2024-10-31",
      isActive: true,
    },
    status: "active",
    notes: "Áp dụng cho combo từ 3 dịch vụ trở lên",
    createdAt: "2024-03-01",
    updatedAt: "2024-06-05",
  },
  {
    id: 4,
    name: "Giảm giá khách hàng mới",
    code: "NEW_CUSTOMER",
    description: "Giảm giá đặc biệt cho khách hàng mới",
    discountType: "percentage",
    discountValue: 20,
    conditions: {
      minAmount: 300000,
      maxAmount: 300000,
      minQuantity: 1,
      applicableServices: ["Tất cả dịch vụ"],
      applicableProducts: ["Tất cả sản phẩm"],
    },
    usageLimit: {
      perCustomer: 1,
      totalUsage: 200,
      dailyLimit: 10,
    },
    validityPeriod: {
      startDate: "2024-04-01",
      endDate: "2024-09-30",
      isActive: true,
    },
    status: "active",
    notes: "Chỉ áp dụng cho khách hàng lần đầu sử dụng dịch vụ",
    createdAt: "2024-04-01",
    updatedAt: "2024-06-01",
  },
  {
    id: 5,
    name: "Giảm giá cuối tuần",
    code: "WEEKEND_DISCOUNT",
    description: "Giảm giá đặc biệt vào cuối tuần",
    discountType: "amount",
    discountValue: 50000,
    conditions: {
      minAmount: 500000,
      maxAmount: 100000,
      minQuantity: 1,
      applicableServices: ["Rửa xe", "Đánh bóng"],
    },
    usageLimit: {
      perCustomer: 2,
      totalUsage: 1000,
      dailyLimit: 100,
    },
    validityPeriod: {
      startDate: "2024-05-01",
      endDate: "2024-08-31",
      isActive: false,
    },
    status: "inactive",
    notes: "Áp dụng vào thứ 7 và chủ nhật",
    createdAt: "2024-05-01",
    updatedAt: "2024-05-30",
  },
];

export const discountTypes = [
  { value: "percentage", label: "Phần trăm (%)", icon: "📊" },
  { value: "amount", label: "Số tiền (₫)", icon: "💰" },
];

export const promotionTypeStatuses = [
  { value: "active", label: "Hoạt động", color: "green" },
  { value: "inactive", label: "Tạm dừng", color: "red" },
];

// Helper functions
export const getDiscountTypeLabel = (type: string) => {
  const discountType = discountTypes.find((t) => t.value === type);
  return discountType ? discountType.label : type;
};

export const getDiscountTypeIcon = (type: string) => {
  const discountType = discountTypes.find((t) => t.value === type);
  return discountType ? discountType.icon : "❓";
};

export const getStatusColor = (status: string) => {
  const statusInfo = promotionTypeStatuses.find((s) => s.value === status);
  return statusInfo ? statusInfo.color : "default";
};

export const getStatusLabel = (status: string) => {
  const statusInfo = promotionTypeStatuses.find((s) => s.value === status);
  return statusInfo ? statusInfo.label : status;
};

export const formatDiscountValue = (type: string, value: number) => {
  return type === "percentage" ? `${value}%` : `${value.toLocaleString()} ₫`;
};

export const isPromotionTypeActive = (promotionType: PromotionType) => {
  const now = new Date();
  const startDate = new Date(promotionType.validityPeriod.startDate);
  const endDate = new Date(promotionType.validityPeriod.endDate);
  
  return (
    promotionType.status === "active" &&
    promotionType.validityPeriod.isActive &&
    now >= startDate &&
    now <= endDate
  );
};
