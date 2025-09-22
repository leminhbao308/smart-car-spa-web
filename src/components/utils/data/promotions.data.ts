export interface Promotion {
  id: number;
  name: string;
  description: string;
  type: "percentage" | "fixed" | "buy_x_get_y" | "package" | "seasonal";
  value: number; // Phần trăm giảm giá hoặc số tiền giảm
  minOrderValue?: number; // Giá trị đơn hàng tối thiểu
  maxDiscountAmount?: number; // Số tiền giảm tối đa
  applicableServices: number[]; // ID các dịch vụ áp dụng
  applicablePackages: number[]; // ID các gói áp dụng
  applicableCategories: string[]; // Danh mục áp dụng
  startDate: string;
  endDate: string;
  status: "active" | "inactive" | "scheduled" | "expired";
  usageLimit?: number; // Giới hạn số lần sử dụng
  usedCount: number; // Số lần đã sử dụng
  customerLimit?: number; // Giới hạn số khách hàng
  customerUsedCount: number; // Số khách hàng đã sử dụng
  conditions: PromotionCondition[];
  benefits: string[];
  terms: string[];
  image?: string;
  priority: number; // Độ ưu tiên (1-10)
  isPublic: boolean; // Hiển thị công khai
  createdAt: string;
  updatedAt: string;
}

export interface PromotionCondition {
  id: number;
  type: "min_order" | "min_services" | "customer_type" | "time_range" | "day_of_week" | "vehicle_type";
  value: any;
  description: string;
}

export interface PromotionUsage {
  id: number;
  promotionId: number;
  customerId: number;
  customerName: string;
  orderId: number;
  discountAmount: number;
  usedAt: string;
  status: "used" | "cancelled";
}

export const promotionTypes = [
  { value: "percentage", label: "Giảm giá theo %", icon: "📊" },
  { value: "fixed", label: "Giảm giá cố định", icon: "💰" },
  { value: "buy_x_get_y", label: "Mua X tặng Y", icon: "🎁" },
  { value: "package", label: "Gói combo", icon: "📦" },
  { value: "seasonal", label: "Khuyến mãi theo mùa", icon: "🌸" },
];

export const promotionStatuses = [
  { value: "active", label: "Đang hoạt động", color: "green" },
  { value: "inactive", label: "Tạm dừng", color: "red" },
  { value: "scheduled", label: "Đã lên lịch", color: "blue" },
  { value: "expired", label: "Đã hết hạn", color: "gray" },
];

export const conditionTypes = [
  { value: "min_order", label: "Đơn hàng tối thiểu", icon: "🛒" },
  { value: "min_services", label: "Số dịch vụ tối thiểu", icon: "🔧" },
  { value: "customer_type", label: "Loại khách hàng", icon: "👤" },
  { value: "time_range", label: "Khung giờ", icon: "⏰" },
  { value: "day_of_week", label: "Ngày trong tuần", icon: "📅" },
  { value: "vehicle_type", label: "Loại xe", icon: "🚗" },
];

export const customerTypes = [
  "Khách hàng mới",
  "Khách hàng VIP",
  "Khách hàng thường",
  "Khách hàng doanh nghiệp",
];

export const vehicleTypes = [
  "Sedan",
  "SUV",
  "Hatchback",
  "Coupe",
  "Pickup",
  "Van",
  "Tất cả loại xe",
];

export const daysOfWeek = [
  "Thứ 2",
  "Thứ 3", 
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ nhật",
];

export const promotionsData: Promotion[] = [
  {
    id: 1,
    name: "Khuyến mãi mùa hè 2024",
    description: "Giảm giá 20% cho tất cả dịch vụ chăm sóc xe trong mùa hè",
    type: "percentage",
    value: 20,
    minOrderValue: 500000,
    maxDiscountAmount: 1000000,
    applicableServices: [1, 2, 3, 4],
    applicablePackages: [101, 102],
    applicableCategories: ["Chăm sóc ngoại thất", "Chăm sóc nội thất"],
    startDate: "2024-06-01",
    endDate: "2024-08-31",
    status: "active",
    usageLimit: 1000,
    usedCount: 245,
    customerLimit: 500,
    customerUsedCount: 180,
    priority: 8,
    isPublic: true,
    createdAt: "2024-05-15",
    updatedAt: "2024-06-01",
    conditions: [
      {
        id: 1,
        type: "min_order",
        value: 500000,
        description: "Đơn hàng tối thiểu 500,000 VNĐ"
      },
      {
        id: 2,
        type: "time_range",
        value: { start: "08:00", end: "17:00" },
        description: "Áp dụng từ 8:00 - 17:00"
      }
    ],
    benefits: [
      "Tiết kiệm tối đa 1,000,000 VNĐ",
      "Áp dụng cho nhiều dịch vụ",
      "Không giới hạn số lần sử dụng"
    ],
    terms: [
      "Không áp dụng với các khuyến mãi khác",
      "Áp dụng cho khách hàng mới và cũ",
      "Có thể thay đổi mà không báo trước"
    ]
  },
  {
    id: 2,
    name: "Combo rửa xe + nội thất",
    description: "Gói combo rửa xe và vệ sinh nội thất với giá ưu đãi",
    type: "package",
    value: 300000,
    applicableServices: [1, 4],
    applicablePackages: [],
    applicableCategories: ["Chăm sóc ngoại thất", "Chăm sóc nội thất"],
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    status: "active",
    usageLimit: 500,
    usedCount: 89,
    customerLimit: 300,
    customerUsedCount: 67,
    priority: 6,
    isPublic: true,
    createdAt: "2023-12-20",
    updatedAt: "2024-01-01",
    conditions: [
      {
        id: 3,
        type: "min_services",
        value: 2,
        description: "Tối thiểu 2 dịch vụ"
      }
    ],
    benefits: [
      "Tiết kiệm 50,000 VNĐ",
      "Dịch vụ toàn diện",
      "Chất lượng đảm bảo"
    ],
    terms: [
      "Chỉ áp dụng khi đặt cả 2 dịch vụ",
      "Không hoàn tiền khi hủy"
    ]
  },
  {
    id: 3,
    name: "Khách hàng VIP - Giảm 15%",
    description: "Ưu đãi đặc biệt dành cho khách hàng VIP",
    type: "percentage",
    value: 15,
    applicableServices: [],
    applicablePackages: [201, 202],
    applicableCategories: ["Dịch vụ cao cấp"],
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    status: "active",
    usageLimit: 200,
    usedCount: 45,
    customerLimit: 100,
    customerUsedCount: 38,
    priority: 9,
    isPublic: false,
    createdAt: "2023-12-15",
    updatedAt: "2024-01-01",
    conditions: [
      {
        id: 4,
        type: "customer_type",
        value: "Khách hàng VIP",
        description: "Chỉ dành cho khách hàng VIP"
      }
    ],
    benefits: [
      "Ưu đãi độc quyền",
      "Dịch vụ cao cấp",
      "Hỗ trợ ưu tiên"
    ],
    terms: [
      "Cần xác minh tư cách VIP",
      "Không chuyển nhượng"
    ]
  },
  {
    id: 4,
    name: "Mua 2 tặng 1 - Dịch vụ bảo dưỡng",
    description: "Mua 2 dịch vụ bảo dưỡng, tặng 1 dịch vụ rửa xe",
    type: "buy_x_get_y",
    value: 1,
    applicableServices: [3, 5, 6],
    applicablePackages: [],
    applicableCategories: ["Bảo dưỡng động cơ", "Bảo dưỡng lốp"],
    startDate: "2024-07-01",
    endDate: "2024-07-31",
    status: "scheduled",
    usageLimit: 300,
    usedCount: 0,
    customerLimit: 200,
    customerUsedCount: 0,
    priority: 7,
    isPublic: true,
    createdAt: "2024-06-20",
    updatedAt: "2024-06-20",
    conditions: [
      {
        id: 5,
        type: "min_services",
        value: 2,
        description: "Mua tối thiểu 2 dịch vụ bảo dưỡng"
      }
    ],
    benefits: [
      "Nhận miễn phí 1 dịch vụ rửa xe",
      "Tiết kiệm 150,000 VNĐ",
      "Chăm sóc toàn diện"
    ],
    terms: [
      "Dịch vụ tặng có giá trị thấp nhất",
      "Không hoàn tiền"
    ]
  },
  {
    id: 5,
    name: "Giảm 100,000 VNĐ - Đơn hàng đầu tiên",
    description: "Giảm 100,000 VNĐ cho đơn hàng đầu tiên của khách hàng mới",
    type: "fixed",
    value: 100000,
    minOrderValue: 300000,
    applicableServices: [],
    applicablePackages: [],
    applicableCategories: [],
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    status: "active",
    usageLimit: 1000,
    usedCount: 156,
    customerLimit: 1000,
    customerUsedCount: 156,
    priority: 5,
    isPublic: true,
    createdAt: "2023-12-01",
    updatedAt: "2024-01-01",
    conditions: [
      {
        id: 6,
        type: "customer_type",
        value: "Khách hàng mới",
        description: "Chỉ dành cho khách hàng mới"
      },
      {
        id: 7,
        type: "min_order",
        value: 300000,
        description: "Đơn hàng tối thiểu 300,000 VNĐ"
      }
    ],
    benefits: [
      "Tiết kiệm 100,000 VNĐ",
      "Dễ dàng sử dụng",
      "Không điều kiện phức tạp"
    ],
    terms: [
      "Chỉ áp dụng 1 lần/khách hàng",
      "Không áp dụng với khuyến mãi khác"
    ]
  },
  {
    id: 6,
    name: "Cuối tuần vui vẻ - Giảm 25%",
    description: "Giảm giá 25% cho tất cả dịch vụ vào cuối tuần",
    type: "percentage",
    value: 25,
    applicableServices: [1, 2, 3, 4, 5, 6],
    applicablePackages: [101, 102, 201, 202],
    applicableCategories: [],
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    status: "active",
    usageLimit: 2000,
    usedCount: 567,
    customerLimit: 1000,
    customerUsedCount: 423,
    priority: 4,
    isPublic: true,
    createdAt: "2023-12-01",
    updatedAt: "2024-01-01",
    conditions: [
      {
        id: 8,
        type: "day_of_week",
        value: ["Thứ 7", "Chủ nhật"],
        description: "Chỉ áp dụng thứ 7 và chủ nhật"
      }
    ],
    benefits: [
      "Giảm giá cao nhất",
      "Áp dụng mọi dịch vụ",
      "Cuối tuần thư giãn"
    ],
    terms: [
      "Chỉ áp dụng cuối tuần",
      "Có thể thay đổi lịch"
    ]
  }
];

export const promotionUsageData: PromotionUsage[] = [
  {
    id: 1,
    promotionId: 1,
    customerId: 101,
    customerName: "Nguyễn Văn A",
    orderId: 1001,
    discountAmount: 200000,
    usedAt: "2024-06-15T10:30:00",
    status: "used"
  },
  {
    id: 2,
    promotionId: 1,
    customerId: 102,
    customerName: "Trần Thị B",
    orderId: 1002,
    discountAmount: 150000,
    usedAt: "2024-06-16T14:20:00",
    status: "used"
  },
  {
    id: 3,
    promotionId: 2,
    customerId: 103,
    customerName: "Lê Văn C",
    orderId: 1003,
    discountAmount: 50000,
    usedAt: "2024-06-17T09:15:00",
    status: "used"
  },
  {
    id: 4,
    promotionId: 3,
    customerId: 104,
    customerName: "Phạm Thị D",
    orderId: 1004,
    discountAmount: 300000,
    usedAt: "2024-06-18T16:45:00",
    status: "used"
  },
  {
    id: 5,
    promotionId: 5,
    customerId: 105,
    customerName: "Võ Văn E",
    orderId: 1005,
    discountAmount: 100000,
    usedAt: "2024-06-19T11:30:00",
    status: "used"
  }
];
