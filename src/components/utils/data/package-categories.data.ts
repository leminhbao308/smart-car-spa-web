export interface ServicePackage {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  duration: number; // in minutes
  status: "active" | "inactive";
  categoryId: number;
  services: PackageService[];
  benefits: string[];
  features: string[];
  image?: string;
  isPopular?: boolean;
  discount?: number;
  validityDays?: number; // Số ngày hiệu lực
  maxUsage?: number; // Số lần sử dụng tối đa
}

export interface PackageService {
  id: number;
  serviceId: number;
  serviceName: string;
  quantity: number;
  price: number;
  duration: number;
}

export interface PackageCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  status: "active" | "inactive";
  packages: ServicePackage[];
  createdAt: string;
  updatedAt: string;
  sortOrder: number;
  isParent: boolean;
  children?: PackageCategory[];
}

export const packageCategoryStatuses = [
  { value: "active", label: "Hoạt động", color: "green" },
  { value: "inactive", label: "Ngừng hoạt động", color: "red" },
];

export const packageCategoryIcons = [
  "🎁", "💎", "⭐", "🔥", "🌟", "💫", "🎯", "🏆", "👑", "💝",
  "🎪", "🎨", "🎭", "🎪", "🎊", "🎉", "🎈", "🎁", "💌", "💖"
];

export const packageCategoryColors = [
  "#1890ff", "#52c41a", "#722ed1", "#fa8c16", "#f5222d",
  "#13c2c2", "#eb2f96", "#faad14", "#2f54eb", "#52c41a"
];

export const packageCategoriesData: PackageCategory[] = [
  {
    id: 1,
    name: "Gói chăm sóc cơ bản",
    description: "Các gói dịch vụ chăm sóc xe cơ bản với giá cả hợp lý",
    icon: "🎁",
    color: "#1890ff",
    status: "active",
    isParent: true,
    sortOrder: 1,
    createdAt: "2023-01-15",
    updatedAt: "2024-01-15",
    packages: [
      {
        id: 101,
        name: "Gói rửa xe cơ bản",
        description: "Gói rửa xe cơ bản với 3 dịch vụ chính",
        price: 200000,
        originalPrice: 250000,
        duration: 90,
        status: "active",
        categoryId: 1,
        discount: 20,
        validityDays: 30,
        maxUsage: 1,
        services: [
          {
            id: 1,
            serviceId: 101,
            serviceName: "Rửa xe chuyên nghiệp",
            quantity: 1,
            price: 150000,
            duration: 60,
          },
          {
            id: 2,
            serviceId: 301,
            serviceName: "Vệ sinh nội thất",
            quantity: 1,
            price: 200000,
            duration: 90,
          },
        ],
        benefits: [
          "Tiết kiệm 50,000 VNĐ so với đặt riêng lẻ",
          "Thời gian phục vụ nhanh chóng",
          "Chất lượng dịch vụ đảm bảo",
        ],
        features: [
          "Rửa xe toàn diện",
          "Vệ sinh nội thất cơ bản",
          "Kiểm tra miễn phí",
        ],
      },
      {
        id: 102,
        name: "Gói bảo dưỡng định kỳ",
        description: "Gói bảo dưỡng định kỳ cho xe",
        price: 500000,
        originalPrice: 600000,
        duration: 180,
        status: "active",
        categoryId: 1,
        discount: 17,
        validityDays: 90,
        maxUsage: 1,
        services: [
          {
            id: 3,
            serviceId: 201,
            serviceName: "Thay dầu động cơ",
            quantity: 1,
            price: 300000,
            duration: 45,
          },
          {
            id: 4,
            serviceId: 202,
            serviceName: "Kiểm tra hệ thống làm mát",
            quantity: 1,
            price: 200000,
            duration: 30,
          },
          {
            id: 5,
            serviceId: 501,
            serviceName: "Cân bằng lốp",
            quantity: 1,
            price: 100000,
            duration: 30,
          },
        ],
        benefits: [
          "Tiết kiệm 100,000 VNĐ",
          "Bảo dưỡng toàn diện",
          "Tăng tuổi thọ xe",
        ],
        features: [
          "Thay dầu và lọc",
          "Kiểm tra hệ thống",
          "Cân bằng lốp",
          "Báo cáo tình trạng xe",
        ],
      },
    ],
  },
  {
    id: 2,
    name: "Gói chăm sóc cao cấp",
    description: "Các gói dịch vụ chăm sóc xe cao cấp với nhiều tiện ích",
    icon: "💎",
    color: "#722ed1",
    status: "active",
    isParent: true,
    sortOrder: 2,
    createdAt: "2023-01-15",
    updatedAt: "2024-01-15",
    packages: [
      {
        id: 201,
        name: "Gói chăm sóc toàn diện",
        description: "Gói chăm sóc toàn diện cho xe với đầy đủ dịch vụ",
        price: 1200000,
        originalPrice: 1500000,
        duration: 300,
        status: "active",
        categoryId: 2,
        discount: 20,
        validityDays: 60,
        maxUsage: 1,
        isPopular: true,
        services: [
          {
            id: 6,
            serviceId: 102,
            serviceName: "Đánh bóng và phủ ceramic",
            quantity: 1,
            price: 500000,
            duration: 180,
          },
          {
            id: 7,
            serviceId: 302,
            serviceName: "Bảo dưỡng da ghế",
            quantity: 1,
            price: 350000,
            duration: 120,
          },
          {
            id: 8,
            serviceId: 103,
            serviceName: "Phủ nano bảo vệ",
            quantity: 1,
            price: 800000,
            duration: 240,
          },
        ],
        benefits: [
          "Tiết kiệm 300,000 VNĐ",
          "Chăm sóc toàn diện",
          "Bảo vệ lâu dài",
          "Tăng giá trị xe",
        ],
        features: [
          "Đánh bóng và phủ ceramic",
          "Bảo dưỡng da ghế",
          "Phủ nano bảo vệ",
          "Kiểm tra toàn diện",
          "Bảo hành 6 tháng",
        ],
      },
      {
        id: 202,
        name: "Gói VIP Premium",
        description: "Gói dịch vụ VIP cao cấp nhất",
        price: 2500000,
        originalPrice: 3000000,
        duration: 480,
        status: "active",
        categoryId: 2,
        discount: 17,
        validityDays: 90,
        maxUsage: 2,
        services: [
          {
            id: 9,
            serviceId: 601,
            serviceName: "Gói chăm sóc VIP",
            quantity: 1,
            price: 2000000,
            duration: 480,
          },
          {
            id: 10,
            serviceId: 602,
            serviceName: "Phủ PPF bảo vệ",
            quantity: 1,
            price: 15000000,
            duration: 720,
          },
        ],
        benefits: [
          "Tiết kiệm 500,000 VNĐ",
          "Dịch vụ VIP độc quyền",
          "Bảo vệ tối đa",
          "Chăm sóc cá nhân hóa",
        ],
        features: [
          "Chăm sóc VIP toàn diện",
          "Phủ PPF bảo vệ",
          "Tư vấn chuyên gia",
          "Bảo hành 12 tháng",
          "Hỗ trợ 24/7",
        ],
      },
    ],
  },
  {
    id: 3,
    name: "Gói theo tháng",
    description: "Các gói dịch vụ theo tháng với giá ưu đãi",
    icon: "📅",
    color: "#52c41a",
    status: "active",
    isParent: true,
    sortOrder: 3,
    createdAt: "2023-01-15",
    updatedAt: "2024-01-15",
    packages: [
      {
        id: 301,
        name: "Gói tháng cơ bản",
        description: "Gói dịch vụ cơ bản trong 1 tháng",
        price: 800000,
        originalPrice: 1000000,
        duration: 0,
        status: "active",
        categoryId: 3,
        discount: 20,
        validityDays: 30,
        maxUsage: 4,
        services: [
          {
            id: 11,
            serviceId: 101,
            serviceName: "Rửa xe chuyên nghiệp",
            quantity: 4,
            price: 150000,
            duration: 60,
          },
          {
            id: 12,
            serviceId: 301,
            serviceName: "Vệ sinh nội thất",
            quantity: 2,
            price: 200000,
            duration: 90,
          },
        ],
        benefits: [
          "Tiết kiệm 200,000 VNĐ/tháng",
          "Sử dụng linh hoạt",
          "Không giới hạn thời gian",
        ],
        features: [
          "4 lần rửa xe",
          "2 lần vệ sinh nội thất",
          "Ưu tiên đặt lịch",
          "Hỗ trợ tư vấn",
        ],
      },
      {
        id: 302,
        name: "Gói tháng cao cấp",
        description: "Gói dịch vụ cao cấp trong 1 tháng",
        price: 1500000,
        originalPrice: 2000000,
        duration: 0,
        status: "active",
        categoryId: 3,
        discount: 25,
        validityDays: 30,
        maxUsage: 6,
        services: [
          {
            id: 13,
            serviceId: 101,
            serviceName: "Rửa xe chuyên nghiệp",
            quantity: 6,
            price: 150000,
            duration: 60,
          },
          {
            id: 14,
            serviceId: 102,
            serviceName: "Đánh bóng và phủ ceramic",
            quantity: 1,
            price: 500000,
            duration: 180,
          },
          {
            id: 15,
            serviceId: 301,
            serviceName: "Vệ sinh nội thất",
            quantity: 3,
            price: 200000,
            duration: 90,
          },
        ],
        benefits: [
          "Tiết kiệm 500,000 VNĐ/tháng",
          "Dịch vụ cao cấp",
          "Sử dụng không giới hạn",
        ],
        features: [
          "6 lần rửa xe",
          "1 lần đánh bóng",
          "3 lần vệ sinh nội thất",
          "Ưu tiên VIP",
          "Tư vấn chuyên gia",
        ],
      },
    ],
  },
  {
    id: 4,
    name: "Gói theo quý",
    description: "Các gói dịch vụ theo quý với ưu đãi lớn",
    icon: "🏆",
    color: "#fa8c16",
    status: "active",
    isParent: true,
    sortOrder: 4,
    createdAt: "2023-01-15",
    updatedAt: "2024-01-15",
    packages: [
      {
        id: 401,
        name: "Gói quý cơ bản",
        description: "Gói dịch vụ cơ bản trong 3 tháng",
        price: 2000000,
        originalPrice: 3000000,
        duration: 0,
        status: "active",
        categoryId: 4,
        discount: 33,
        validityDays: 90,
        maxUsage: 12,
        services: [
          {
            id: 16,
            serviceId: 101,
            serviceName: "Rửa xe chuyên nghiệp",
            quantity: 12,
            price: 150000,
            duration: 60,
          },
          {
            id: 17,
            serviceId: 201,
            serviceName: "Thay dầu động cơ",
            quantity: 1,
            price: 300000,
            duration: 45,
          },
          {
            id: 18,
            serviceId: 301,
            serviceName: "Vệ sinh nội thất",
            quantity: 6,
            price: 200000,
            duration: 90,
          },
        ],
        benefits: [
          "Tiết kiệm 1,000,000 VNĐ/quý",
          "Bảo dưỡng định kỳ",
          "Ưu đãi đặc biệt",
        ],
        features: [
          "12 lần rửa xe",
          "1 lần thay dầu",
          "6 lần vệ sinh nội thất",
          "Kiểm tra miễn phí",
          "Bảo hành dịch vụ",
        ],
      },
      {
        id: 402,
        name: "Gói quý VIP",
        description: "Gói dịch vụ VIP trong 3 tháng",
        price: 5000000,
        originalPrice: 7500000,
        duration: 0,
        status: "active",
        categoryId: 4,
        discount: 33,
        validityDays: 90,
        maxUsage: 20,
        isPopular: true,
        services: [
          {
            id: 19,
            serviceId: 101,
            serviceName: "Rửa xe chuyên nghiệp",
            quantity: 20,
            price: 150000,
            duration: 60,
          },
          {
            id: 20,
            serviceId: 102,
            serviceName: "Đánh bóng và phủ ceramic",
            quantity: 2,
            price: 500000,
            duration: 180,
          },
          {
            id: 21,
            serviceId: 201,
            serviceName: "Thay dầu động cơ",
            quantity: 2,
            price: 300000,
            duration: 45,
          },
          {
            id: 22,
            serviceId: 301,
            serviceName: "Vệ sinh nội thất",
            quantity: 10,
            price: 200000,
            duration: 90,
          },
        ],
        benefits: [
          "Tiết kiệm 2,500,000 VNĐ/quý",
          "Dịch vụ VIP toàn diện",
          "Ưu đãi lớn nhất",
        ],
        features: [
          "20 lần rửa xe",
          "2 lần đánh bóng",
          "2 lần thay dầu",
          "10 lần vệ sinh nội thất",
          "Tư vấn chuyên gia",
          "Bảo hành 12 tháng",
        ],
      },
    ],
  },
  {
    id: 5,
    name: "Gói đặc biệt",
    description: "Các gói dịch vụ đặc biệt và khuyến mãi",
    icon: "🎯",
    color: "#f5222d",
    status: "active",
    isParent: true,
    sortOrder: 5,
    createdAt: "2023-01-15",
    updatedAt: "2024-01-15",
    packages: [
      {
        id: 501,
        name: "Gói khuyến mãi mùa hè",
        description: "Gói dịch vụ khuyến mãi đặc biệt mùa hè",
        price: 300000,
        originalPrice: 500000,
        duration: 120,
        status: "active",
        categoryId: 5,
        discount: 40,
        validityDays: 15,
        maxUsage: 1,
        services: [
          {
            id: 23,
            serviceId: 101,
            serviceName: "Rửa xe chuyên nghiệp",
            quantity: 1,
            price: 150000,
            duration: 60,
          },
          {
            id: 24,
            serviceId: 303,
            serviceName: "Khử mùi nội thất",
            quantity: 1,
            price: 150000,
            duration: 60,
          },
          {
            id: 25,
            serviceId: 401,
            serviceName: "Kiểm tra hệ thống điện",
            quantity: 1,
            price: 250000,
            duration: 60,
          },
        ],
        benefits: [
          "Tiết kiệm 200,000 VNĐ",
          "Khuyến mãi có thời hạn",
          "Dịch vụ đa dạng",
        ],
        features: [
          "Rửa xe chuyên nghiệp",
          "Khử mùi nội thất",
          "Kiểm tra hệ thống điện",
          "Báo cáo chi tiết",
        ],
      },
      {
        id: 502,
        name: "Gói combo gia đình",
        description: "Gói dịch vụ dành cho gia đình có nhiều xe",
        price: 800000,
        originalPrice: 1200000,
        duration: 0,
        status: "active",
        categoryId: 5,
        discount: 33,
        validityDays: 60,
        maxUsage: 3,
        services: [
          {
            id: 26,
            serviceId: 101,
            serviceName: "Rửa xe chuyên nghiệp",
            quantity: 3,
            price: 150000,
            duration: 60,
          },
          {
            id: 27,
            serviceId: 301,
            serviceName: "Vệ sinh nội thất",
            quantity: 3,
            price: 200000,
            duration: 90,
          },
        ],
        benefits: [
          "Tiết kiệm 400,000 VNĐ",
          "Phù hợp gia đình",
          "Sử dụng linh hoạt",
        ],
        features: [
          "3 lần rửa xe",
          "3 lần vệ sinh nội thất",
          "Áp dụng cho 3 xe",
          "Thời gian linh hoạt",
        ],
      },
    ],
  },
];
