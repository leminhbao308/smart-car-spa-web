export interface PricingItem {
  id: number;
  serviceName: string;
  category: string;
  description: string;
  basePrice: number;
  priceRanges: PriceRange[];
  status: "active" | "inactive";
  unit: string;
  duration: number; // in minutes
  requirements: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PriceRange {
  id: number;
  name: string;
  minValue: number;
  maxValue: number;
  price: number;
  description?: string;
}

export interface PricingCategory {
  id: number;
  name: string;
  icon: string;
  color: string;
  items: PricingItem[];
}

export const pricingCategories = [
  { id: 1, name: "Chăm sóc ngoại thất", icon: "✨", color: "#1890ff" },
  { id: 2, name: "Bảo dưỡng động cơ", icon: "🔧", color: "#52c41a" },
  { id: 3, name: "Chăm sóc nội thất", icon: "🎨", color: "#722ed1" },
  { id: 4, name: "Sửa chữa điện", icon: "⚡", color: "#fa8c16" },
  { id: 5, name: "Bảo dưỡng lốp", icon: "🛡️", color: "#f5222d" },
  { id: 6, name: "Dịch vụ cao cấp", icon: "💎", color: "#13c2c2" },
];

export const pricingData: PricingItem[] = [
  {
    id: 1,
    serviceName: "Rửa xe chuyên nghiệp",
    category: "Chăm sóc ngoại thất",
    description: "Rửa xe toàn diện với công nghệ cao",
    basePrice: 150000,
    unit: "lần",
    duration: 60,
    status: "active",
    requirements: ["Xe sạch bụi", "Không có vết bẩn cứng đầu"],
    notes: "Bao gồm rửa ngoài và lau khô",
    createdAt: "2023-01-15",
    updatedAt: "2024-01-15",
    priceRanges: [
      {
        id: 1,
        name: "Xe nhỏ (dưới 4.5m)",
        minValue: 0,
        maxValue: 4.5,
        price: 120000,
        description: "Sedan, hatchback, coupe"
      },
      {
        id: 2,
        name: "Xe trung bình (4.5m - 5m)",
        minValue: 4.5,
        maxValue: 5.0,
        price: 150000,
        description: "SUV, crossover, wagon"
      },
      {
        id: 3,
        name: "Xe lớn (trên 5m)",
        minValue: 5.0,
        maxValue: 999,
        price: 180000,
        description: "Pickup, van, xe tải nhỏ"
      }
    ]
  },
  {
    id: 2,
    serviceName: "Đánh bóng và phủ ceramic",
    category: "Chăm sóc ngoại thất",
    description: "Đánh bóng và phủ lớp bảo vệ ceramic cao cấp",
    basePrice: 500000,
    unit: "lần",
    duration: 180,
    status: "active",
    requirements: ["Xe đã rửa sạch", "Bề mặt khô ráo"],
    notes: "Bảo hành 6 tháng",
    createdAt: "2023-01-15",
    updatedAt: "2024-01-15",
    priceRanges: [
      {
        id: 4,
        name: "Xe nhỏ (dưới 4.5m)",
        minValue: 0,
        maxValue: 4.5,
        price: 400000,
        description: "Sedan, hatchback, coupe"
      },
      {
        id: 5,
        name: "Xe trung bình (4.5m - 5m)",
        minValue: 4.5,
        maxValue: 5.0,
        price: 500000,
        description: "SUV, crossover, wagon"
      },
      {
        id: 6,
        name: "Xe lớn (trên 5m)",
        minValue: 5.0,
        maxValue: 999,
        price: 600000,
        description: "Pickup, van, xe tải nhỏ"
      }
    ]
  },
  {
    id: 3,
    serviceName: "Thay dầu động cơ",
    category: "Bảo dưỡng động cơ",
    description: "Thay dầu động cơ và lọc dầu định kỳ",
    basePrice: 300000,
    unit: "lần",
    duration: 45,
    status: "active",
    requirements: ["Xe đã nguội", "Dầu cũ đã sử dụng"],
    notes: "Bao gồm dầu và lọc",
    createdAt: "2023-01-15",
    updatedAt: "2024-01-15",
    priceRanges: [
      {
        id: 7,
        name: "Dầu thường (5W-30)",
        minValue: 0,
        maxValue: 0,
        price: 250000,
        description: "Dầu động cơ thông thường"
      },
      {
        id: 8,
        name: "Dầu cao cấp (0W-20)",
        minValue: 0,
        maxValue: 0,
        price: 350000,
        description: "Dầu động cơ cao cấp"
      },
      {
        id: 9,
        name: "Dầu tổng hợp (5W-40)",
        minValue: 0,
        maxValue: 0,
        price: 400000,
        description: "Dầu tổng hợp cao cấp"
      }
    ]
  },
  {
    id: 4,
    serviceName: "Vệ sinh nội thất",
    category: "Chăm sóc nội thất",
    description: "Làm sạch toàn bộ nội thất xe",
    basePrice: 200000,
    unit: "lần",
    duration: 90,
    status: "active",
    requirements: ["Nội thất sạch", "Không có đồ vật"],
    notes: "Bao gồm ghế, sàn, trần",
    createdAt: "2023-01-15",
    updatedAt: "2024-01-15",
    priceRanges: [
      {
        id: 10,
        name: "Vệ sinh cơ bản",
        minValue: 0,
        maxValue: 0,
        price: 150000,
        description: "Hút bụi và lau sạch"
      },
      {
        id: 11,
        name: "Vệ sinh chuyên sâu",
        minValue: 0,
        maxValue: 0,
        price: 200000,
        description: "Vệ sinh toàn diện"
      },
      {
        id: 12,
        name: "Vệ sinh cao cấp",
        minValue: 0,
        maxValue: 0,
        price: 300000,
        description: "Vệ sinh + bảo dưỡng da"
      }
    ]
  },
  {
    id: 5,
    serviceName: "Kiểm tra hệ thống điện",
    category: "Sửa chữa điện",
    description: "Kiểm tra toàn bộ hệ thống điện xe",
    basePrice: 250000,
    unit: "lần",
    duration: 60,
    status: "active",
    requirements: ["Xe tắt máy", "Hệ thống khô ráo"],
    notes: "Báo cáo chi tiết tình trạng",
    createdAt: "2023-01-15",
    updatedAt: "2024-01-15",
    priceRanges: [
      {
        id: 13,
        name: "Kiểm tra cơ bản",
        minValue: 0,
        maxValue: 0,
        price: 200000,
        description: "Kiểm tra ắc quy, đèn, còi"
      },
      {
        id: 14,
        name: "Kiểm tra toàn diện",
        minValue: 0,
        maxValue: 0,
        price: 250000,
        description: "Kiểm tra toàn bộ hệ thống"
      },
      {
        id: 15,
        name: "Kiểm tra chuyên sâu",
        minValue: 0,
        maxValue: 0,
        price: 350000,
        description: "Kiểm tra + sửa chữa nhỏ"
      }
    ]
  },
  {
    id: 6,
    serviceName: "Cân bằng lốp",
    category: "Bảo dưỡng lốp",
    description: "Cân bằng lốp xe để chạy êm",
    basePrice: 100000,
    unit: "bộ 4 lốp",
    duration: 30,
    status: "active",
    requirements: ["Lốp sạch", "Không có đinh"],
    notes: "Bao gồm cân bằng và kiểm tra áp suất",
    createdAt: "2023-01-15",
    updatedAt: "2024-01-15",
    priceRanges: [
      {
        id: 16,
        name: "Lốp 15 inch",
        minValue: 0,
        maxValue: 15,
        price: 80000,
        description: "Lốp xe nhỏ"
      },
      {
        id: 17,
        name: "Lốp 16-17 inch",
        minValue: 16,
        maxValue: 17,
        price: 100000,
        description: "Lốp xe trung bình"
      },
      {
        id: 18,
        name: "Lốp 18 inch trở lên",
        minValue: 18,
        maxValue: 999,
        price: 120000,
        description: "Lốp xe lớn"
      }
    ]
  },
  {
    id: 7,
    serviceName: "Sửa chữa điều hòa",
    category: "Sửa chữa điện",
    description: "Sửa chữa và bảo dưỡng hệ thống điều hòa",
    basePrice: 400000,
    unit: "lần",
    duration: 120,
    status: "active",
    requirements: ["Điều hòa không lạnh", "Hệ thống sạch"],
    notes: "Bảo hành 3 tháng",
    createdAt: "2023-01-15",
    updatedAt: "2024-01-15",
    priceRanges: [
      {
        id: 19,
        name: "Bảo dưỡng cơ bản",
        minValue: 0,
        maxValue: 0,
        price: 300000,
        description: "Làm sạch, thay gas"
      },
      {
        id: 20,
        name: "Sửa chữa vừa",
        minValue: 0,
        maxValue: 0,
        price: 500000,
        description: "Thay linh kiện nhỏ"
      },
      {
        id: 21,
        name: "Sửa chữa lớn",
        minValue: 0,
        maxValue: 0,
        price: 800000,
        description: "Thay máy nén, dàn lạnh"
      }
    ]
  },
  {
    id: 8,
    serviceName: "Thay lốp mới",
    category: "Bảo dưỡng lốp",
    description: "Thay thế lốp xe mới",
    basePrice: 800000,
    unit: "bộ 4 lốp",
    duration: 45,
    status: "active",
    requirements: ["Lốp cũ", "Kích thước phù hợp"],
    notes: "Bao gồm lắp đặt và cân bằng",
    createdAt: "2023-01-15",
    updatedAt: "2024-01-15",
    priceRanges: [
      {
        id: 22,
        name: "Lốp thường (15-16 inch)",
        minValue: 15,
        maxValue: 16,
        price: 600000,
        description: "Lốp thương hiệu thường"
      },
      {
        id: 23,
        name: "Lốp cao cấp (17-18 inch)",
        minValue: 17,
        maxValue: 18,
        price: 1000000,
        description: "Lốp thương hiệu cao cấp"
      },
      {
        id: 24,
        name: "Lốp premium (19 inch trở lên)",
        minValue: 19,
        maxValue: 999,
        price: 1500000,
        description: "Lốp premium cao cấp"
      }
    ]
  },
  {
    id: 9,
    serviceName: "Phủ PPF bảo vệ",
    category: "Dịch vụ cao cấp",
    description: "Phủ PPF bảo vệ toàn thân xe",
    basePrice: 15000000,
    unit: "lần",
    duration: 720,
    status: "active",
    requirements: ["Xe mới", "Bề mặt hoàn hảo"],
    notes: "Bảo hành 5 năm",
    createdAt: "2023-01-15",
    updatedAt: "2024-01-15",
    priceRanges: [
      {
        id: 25,
        name: "Phủ một phần",
        minValue: 0,
        maxValue: 0,
        price: 8000000,
        description: "Phủ cản trước, gương"
      },
      {
        id: 26,
        name: "Phủ toàn thân",
        minValue: 0,
        maxValue: 0,
        price: 15000000,
        description: "Phủ toàn bộ xe"
      },
      {
        id: 27,
        name: "Phủ cao cấp",
        minValue: 0,
        maxValue: 0,
        price: 25000000,
        description: "PPF cao cấp + ceramic"
      }
    ]
  },
  {
    id: 10,
    serviceName: "Gói chăm sóc VIP",
    category: "Dịch vụ cao cấp",
    description: "Gói chăm sóc toàn diện cho xe cao cấp",
    basePrice: 2000000,
    unit: "gói",
    duration: 480,
    status: "active",
    requirements: ["Xe cao cấp", "Thời gian đủ"],
    notes: "Dịch vụ độc quyền",
    createdAt: "2023-01-15",
    updatedAt: "2024-01-15",
    priceRanges: [
      {
        id: 28,
        name: "Gói VIP cơ bản",
        minValue: 0,
        maxValue: 0,
        price: 1500000,
        description: "Chăm sóc cơ bản VIP"
      },
      {
        id: 29,
        name: "Gói VIP cao cấp",
        minValue: 0,
        maxValue: 0,
        price: 2000000,
        description: "Chăm sóc toàn diện VIP"
      },
      {
        id: 30,
        name: "Gói VIP premium",
        minValue: 0,
        maxValue: 0,
        price: 3000000,
        description: "Chăm sóc premium + tư vấn"
      }
    ]
  }
];

export const pricingUnits = [
  "lần", "gói", "bộ 4 lốp", "bộ 2 lốp", "tháng", "quý", "năm", "m²", "kg", "chiếc"
];

export const pricingStatuses = [
  { value: "active", label: "Hoạt động", color: "green" },
  { value: "inactive", label: "Ngừng hoạt động", color: "red" },
];
