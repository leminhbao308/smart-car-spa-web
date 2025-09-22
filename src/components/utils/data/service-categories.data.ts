export interface ServiceCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  status: "active" | "inactive";
  services: Service[];
  createdAt: string;
  updatedAt: string;
  sortOrder: number;
  parentId?: number;
  isParent: boolean;
  children?: ServiceCategory[];
}

export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  status: "active" | "inactive";
  categoryId: number;
  requirements: string[];
  benefits: string[];
  image?: string;
}

export const serviceCategoryStatuses = [
  { value: "active", label: "Hoạt động", color: "green" },
  { value: "inactive", label: "Ngừng hoạt động", color: "red" },
];

export const serviceCategoryIcons = [
  "🚗", "✨", "🔧", "⚙️", "⚡", "🛡️", "🎨", "💎", "🌟", "🔥",
  "💧", "🌿", "🔍", "📱", "🎯", "⚡", "🛠️", "🎪", "🏆", "💫"
];

export const serviceCategoryColors = [
  "#1890ff", "#52c41a", "#722ed1", "#fa8c16", "#f5222d",
  "#13c2c2", "#eb2f96", "#faad14", "#2f54eb", "#52c41a"
];

export const serviceCategoriesData: ServiceCategory[] = [
  {
    id: 1,
    name: "Chăm sóc ngoại thất",
    description: "Các dịch vụ chăm sóc và bảo vệ bề mặt ngoài xe",
    icon: "✨",
    color: "#1890ff",
    status: "active",
    isParent: true,
    sortOrder: 1,
    createdAt: "2023-01-15",
    updatedAt: "2024-01-15",
    services: [
      {
        id: 101,
        name: "Rửa xe chuyên nghiệp",
        description: "Rửa xe toàn diện với công nghệ cao",
        price: 150000,
        duration: 60,
        status: "active",
        categoryId: 1,
        requirements: ["Xe sạch bụi", "Không có vết bẩn cứng đầu"],
        benefits: ["Xe sạch bóng", "Bảo vệ sơn", "Tăng tuổi thọ xe"],
      },
      {
        id: 102,
        name: "Đánh bóng và phủ ceramic",
        description: "Đánh bóng và phủ lớp bảo vệ ceramic cao cấp",
        price: 500000,
        duration: 180,
        status: "active",
        categoryId: 1,
        requirements: ["Xe đã rửa sạch", "Bề mặt khô ráo"],
        benefits: ["Bóng đẹp lâu dài", "Chống nước", "Dễ vệ sinh"],
      },
      {
        id: 103,
        name: "Phủ nano bảo vệ",
        description: "Phủ lớp nano bảo vệ bề mặt xe",
        price: 800000,
        duration: 240,
        status: "active",
        categoryId: 1,
        requirements: ["Xe mới hoặc đã đánh bóng", "Bề mặt hoàn hảo"],
        benefits: ["Bảo vệ tối đa", "Chống UV", "Chống nước"],
      },
    ],
  },
  {
    id: 2,
    name: "Bảo dưỡng động cơ",
    description: "Các dịch vụ bảo dưỡng và sửa chữa động cơ",
    icon: "🔧",
    color: "#52c41a",
    status: "active",
    isParent: true,
    sortOrder: 2,
    createdAt: "2023-01-15",
    updatedAt: "2024-01-15",
    services: [
      {
        id: 201,
        name: "Thay dầu động cơ",
        description: "Thay dầu động cơ và lọc dầu định kỳ",
        price: 300000,
        duration: 45,
        status: "active",
        categoryId: 2,
        requirements: ["Xe đã nguội", "Dầu cũ đã sử dụng"],
        benefits: ["Động cơ mượt mà", "Tiết kiệm nhiên liệu", "Tăng tuổi thọ"],
      },
      {
        id: 202,
        name: "Kiểm tra hệ thống làm mát",
        description: "Kiểm tra và bảo dưỡng hệ thống làm mát",
        price: 200000,
        duration: 30,
        status: "active",
        categoryId: 2,
        requirements: ["Động cơ nguội", "Hệ thống sạch"],
        benefits: ["Tránh quá nhiệt", "Động cơ ổn định", "An toàn"],
      },
      {
        id: 203,
        name: "Thay lọc gió động cơ",
        description: "Thay thế lọc gió động cơ mới",
        price: 150000,
        duration: 20,
        status: "active",
        categoryId: 2,
        requirements: ["Lọc cũ đã bẩn", "Động cơ sạch"],
        benefits: ["Động cơ thở tốt", "Tiết kiệm nhiên liệu", "Giảm khí thải"],
      },
    ],
  },
  {
    id: 3,
    name: "Chăm sóc nội thất",
    description: "Các dịch vụ làm sạch và bảo vệ nội thất xe",
    icon: "🎨",
    color: "#722ed1",
    status: "active",
    isParent: true,
    sortOrder: 3,
    createdAt: "2023-01-15",
    updatedAt: "2024-01-15",
    services: [
      {
        id: 301,
        name: "Vệ sinh nội thất",
        description: "Làm sạch toàn bộ nội thất xe",
        price: 200000,
        duration: 90,
        status: "active",
        categoryId: 3,
        requirements: ["Nội thất sạch", "Không có đồ vật"],
        benefits: ["Nội thất sạch sẽ", "Mùi thơm dễ chịu", "Bảo vệ da"],
      },
      {
        id: 302,
        name: "Bảo dưỡng da ghế",
        description: "Bảo dưỡng và bảo vệ da ghế xe",
        price: 350000,
        duration: 120,
        status: "active",
        categoryId: 3,
        requirements: ["Ghế da sạch", "Không có vết bẩn"],
        benefits: ["Da mềm mại", "Chống nứt", "Tăng tuổi thọ"],
      },
      {
        id: 303,
        name: "Khử mùi nội thất",
        description: "Khử mùi và tạo hương thơm cho nội thất",
        price: 150000,
        duration: 60,
        status: "active",
        categoryId: 3,
        requirements: ["Nội thất sạch", "Thông thoáng"],
        benefits: ["Mùi thơm dễ chịu", "Không độc hại", "Lâu dài"],
      },
    ],
  },
  {
    id: 4,
    name: "Sửa chữa điện",
    description: "Các dịch vụ sửa chữa và bảo dưỡng hệ thống điện",
    icon: "⚡",
    color: "#fa8c16",
    status: "active",
    isParent: true,
    sortOrder: 4,
    createdAt: "2023-01-15",
    updatedAt: "2024-01-15",
    services: [
      {
        id: 401,
        name: "Kiểm tra hệ thống điện",
        description: "Kiểm tra toàn bộ hệ thống điện xe",
        price: 250000,
        duration: 60,
        status: "active",
        categoryId: 4,
        requirements: ["Xe tắt máy", "Hệ thống khô ráo"],
        benefits: ["An toàn điện", "Tránh chập cháy", "Tiết kiệm"],
      },
      {
        id: 402,
        name: "Sửa chữa điều hòa",
        description: "Sửa chữa và bảo dưỡng hệ thống điều hòa",
        price: 400000,
        duration: 120,
        status: "active",
        categoryId: 4,
        requirements: ["Điều hòa không lạnh", "Hệ thống sạch"],
        benefits: ["Mát lạnh", "Tiết kiệm điện", "Bền bỉ"],
      },
      {
        id: 403,
        name: "Thay ắc quy",
        description: "Thay thế ắc quy xe mới",
        price: 600000,
        duration: 30,
        status: "active",
        categoryId: 4,
        requirements: ["Ắc quy cũ", "Hệ thống sạch"],
        benefits: ["Khởi động tốt", "Bền lâu", "An toàn"],
      },
    ],
  },
  {
    id: 5,
    name: "Bảo dưỡng lốp",
    description: "Các dịch vụ bảo dưỡng và sửa chữa lốp xe",
    icon: "🛡️",
    color: "#f5222d",
    status: "active",
    isParent: true,
    sortOrder: 5,
    createdAt: "2023-01-15",
    updatedAt: "2024-01-15",
    services: [
      {
        id: 501,
        name: "Cân bằng lốp",
        description: "Cân bằng lốp xe để chạy êm",
        price: 100000,
        duration: 30,
        status: "active",
        categoryId: 5,
        requirements: ["Lốp sạch", "Không có đinh"],
        benefits: ["Chạy êm", "Tiết kiệm lốp", "An toàn"],
      },
      {
        id: 502,
        name: "Thay lốp mới",
        description: "Thay thế lốp xe mới",
        price: 800000,
        duration: 45,
        status: "active",
        categoryId: 5,
        requirements: ["Lốp cũ", "Kích thước phù hợp"],
        benefits: ["An toàn", "Tiết kiệm nhiên liệu", "Bền bỉ"],
      },
      {
        id: 503,
        name: "Sửa lốp bị thủng",
        description: "Sửa chữa lốp bị thủng",
        price: 50000,
        duration: 20,
        status: "active",
        categoryId: 5,
        requirements: ["Lốp thủng", "Vết thủng nhỏ"],
        benefits: ["Tiết kiệm", "Nhanh chóng", "An toàn"],
      },
    ],
  },
  {
    id: 6,
    name: "Dịch vụ cao cấp",
    description: "Các dịch vụ chăm sóc xe cao cấp và đặc biệt",
    icon: "💎",
    color: "#13c2c2",
    status: "active",
    isParent: true,
    sortOrder: 6,
    createdAt: "2023-01-15",
    updatedAt: "2024-01-15",
    services: [
      {
        id: 601,
        name: "Gói chăm sóc VIP",
        description: "Gói chăm sóc toàn diện cho xe cao cấp",
        price: 2000000,
        duration: 480,
        status: "active",
        categoryId: 6,
        requirements: ["Xe cao cấp", "Thời gian đủ"],
        benefits: ["Chăm sóc toàn diện", "Chất lượng cao", "Độc quyền"],
      },
      {
        id: 602,
        name: "Phủ PPF bảo vệ",
        description: "Phủ PPF bảo vệ toàn thân xe",
        price: 15000000,
        duration: 720,
        status: "active",
        categoryId: 6,
        requirements: ["Xe mới", "Bề mặt hoàn hảo"],
        benefits: ["Bảo vệ tối đa", "Chống trầy xước", "Giữ nguyên giá trị"],
      },
      {
        id: 603,
        name: "Tùy chỉnh nội thất",
        description: "Tùy chỉnh và nâng cấp nội thất xe",
        price: 5000000,
        duration: 1440,
        status: "active",
        categoryId: 6,
        requirements: ["Xe đủ điều kiện", "Thiết kế phù hợp"],
        benefits: ["Độc đáo", "Cá nhân hóa", "Chất lượng cao"],
      },
    ],
  },
];
