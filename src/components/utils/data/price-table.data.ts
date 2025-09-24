// ===== INTERFACES =====
export interface Branch {
  id: number;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  manager: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface PriceTable {
  id: number;
  name: string;
  code: string;
  description: string;
  branchId: number | null; // null = áp dụng toàn hệ thống
  branchName?: string;
  status: "active" | "inactive" | "draft";
  effectiveDate: string;
  expiryDate?: string;
  isDefault: boolean;
  discountPrograms: DiscountProgram[];
  services: PriceTableService[];
  products: PriceTableProduct[];
  servicePackages: PriceTableServicePackage[];
  vehicleTypes: VehicleTypePricing[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface PriceTableService {
  id: number;
  serviceId: number;
  serviceName: string;
  serviceCategory: string;
  basePrice: number;
  finalPrice: number;
  discountPercentage: number;
  priceRanges: PriceRange[];
  status: "active" | "inactive";
  notes?: string;
}

export interface PriceTableProduct {
  id: number;
  productId: number;
  productName: string;
  productCategory: string;
  basePrice: number;
  finalPrice: number;
  discountPercentage: number;
  status: "active" | "inactive";
  notes?: string;
}

export interface PriceTableServicePackage {
  id: number;
  packageId: number;
  packageName: string;
  basePrice: number;
  finalPrice: number;
  discountPercentage: number;
  status: "active" | "inactive";
  notes?: string;
}

export interface VehicleTypePricing {
  id: number;
  vehicleTypeId: number;
  vehicleTypeName: string;
  multiplier: number; // Hệ số nhân giá (1.0 = giá gốc, 1.2 = tăng 20%)
  description?: string;
}

export interface PriceRange {
  id: number;
  name: string;
  minValue: number;
  maxValue: number;
  price: number;
  description?: string;
}

export interface DiscountProgram {
  id: number;
  name: string;
  type: "percentage" | "fixed";
  value: number;
  conditions: DiscountCondition[];
  applicableTo: "all" | "services" | "products" | "packages" | "custom";
  applicableServices: number[]; // service IDs
  applicableProducts: number[]; // product IDs
  applicablePackages: number[]; // package IDs
  startDate: string;
  endDate: string;
  status: "active" | "inactive";
}

export interface DiscountCondition {
  type: "min_amount" | "min_quantity" | "customer_type" | "time_period";
  value: any;
  description: string;
}

export interface PriceHistory {
  id: number;
  priceTableId: number;
  serviceId: number;
  oldPrice: number;
  newPrice: number;
  changeType: "increase" | "decrease" | "new";
  changeReason: string;
  effectiveDate: string;
  createdBy: string;
  createdAt: string;
}

// ===== MOCK DATA =====
export const branchesData: Branch[] = [
  {
    id: 1,
    name: "Chi nhánh Quận 1",
    code: "Q1",
    address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    phone: "028 1234 5678",
    email: "q1@smartcarspa.com",
    manager: "Nguyễn Văn A",
    status: "active",
    createdAt: "2023-01-01",
    updatedAt: "2024-01-15",
  },
  {
    id: 2,
    name: "Chi nhánh Quận 7",
    code: "Q7",
    address: "456 Nguyễn Thị Thập, Quận 7, TP.HCM",
    phone: "028 2345 6789",
    email: "q7@smartcarspa.com",
    manager: "Trần Thị B",
    status: "active",
    createdAt: "2023-01-01",
    updatedAt: "2024-01-15",
  },
  {
    id: 3,
    name: "Chi nhánh Quận 2",
    code: "Q2",
    address: "789 Thủ Thiêm, Quận 2, TP.HCM",
    phone: "028 3456 7890",
    email: "q2@smartcarspa.com",
    manager: "Lê Văn C",
    status: "active",
    createdAt: "2023-01-01",
    updatedAt: "2024-01-15",
  },
  {
    id: 4,
    name: "Chi nhánh Bình Thạnh",
    code: "BT",
    address: "321 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM",
    phone: "028 4567 8901",
    email: "bt@smartcarspa.com",
    manager: "Phạm Thị D",
    status: "inactive",
    createdAt: "2023-01-01",
    updatedAt: "2024-01-15",
  },
];

export const discountProgramsData: DiscountProgram[] = [
  {
    id: 1,
    name: "Giảm giá khách hàng VIP",
    type: "percentage",
    value: 15,
    conditions: [
      {
        type: "customer_type",
        value: "vip",
        description: "Khách hàng VIP",
      },
    ],
    applicableTo: "all",
    applicableServices: [],
    applicableProducts: [],
    applicablePackages: [],
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    status: "active",
  },
  {
    id: 2,
    name: "Giảm giá combo dịch vụ",
    type: "percentage",
    value: 10,
    conditions: [
      {
        type: "min_quantity",
        value: 3,
        description: "Từ 3 dịch vụ trở lên",
      },
    ],
    applicableTo: "services",
    applicableServices: [1, 2, 3, 4, 5, 6, 7, 8],
    applicableProducts: [],
    applicablePackages: [],
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    status: "active",
  },
  {
    id: 3,
    name: "Giảm giá sản phẩm cuối tuần",
    type: "fixed",
    value: 50000,
    conditions: [
      {
        type: "time_period",
        value: "weekend",
        description: "Thứ 7, Chủ nhật",
      },
    ],
    applicableTo: "products",
    applicableServices: [],
    applicableProducts: [1, 2, 3, 4],
    applicablePackages: [],
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    status: "active",
  },
  {
    id: 4,
    name: "Giảm giá gói dịch vụ mùa hè",
    type: "percentage",
    value: 20,
    conditions: [
      {
        type: "time_period",
        value: "summer",
        description: "Mùa hè (6-8)",
      },
    ],
    applicableTo: "packages",
    applicableServices: [],
    applicableProducts: [],
    applicablePackages: [1, 2, 3],
    startDate: "2024-06-01",
    endDate: "2024-08-31",
    status: "active",
  },
];

export const priceTablesData: PriceTable[] = [
  {
    id: 1,
    name: "Bảng giá chung hệ thống",
    code: "SYS-2024",
    description: "Bảng giá áp dụng cho toàn bộ hệ thống",
    branchId: null,
    status: "active",
    effectiveDate: "2024-01-01",
    isDefault: true,
    discountPrograms: [discountProgramsData[0], discountProgramsData[1]],
    products: [
      {
        id: 1,
        productId: 1,
        productName: "Shampoo rửa xe cao cấp",
        productCategory: "Hóa chất rửa xe",
        basePrice: 250000,
        finalPrice: 250000,
        discountPercentage: 0,
        status: "active",
      },
      {
        id: 2,
        productId: 2,
        productName: "Wax bảo vệ sơn",
        productCategory: "Hóa chất bảo vệ",
        basePrice: 180000,
        finalPrice: 180000,
        discountPercentage: 0,
        status: "active",
      },
    ],
    servicePackages: [
      {
        id: 1,
        packageId: 1,
        packageName: "Gói chăm sóc toàn diện",
        basePrice: 800000,
        finalPrice: 800000,
        discountPercentage: 0,
        status: "active",
      },
    ],
    vehicleTypes: [
      {
        id: 1,
        vehicleTypeId: 1,
        vehicleTypeName: "Xe nhỏ (dưới 4.5m)",
        multiplier: 1.0,
        description: "Sedan, hatchback, coupe",
      },
      {
        id: 2,
        vehicleTypeId: 2,
        vehicleTypeName: "Xe trung bình (4.5m - 5m)",
        multiplier: 1.2,
        description: "SUV, crossover, wagon",
      },
      {
        id: 3,
        vehicleTypeId: 3,
        vehicleTypeName: "Xe lớn (trên 5m)",
        multiplier: 1.5,
        description: "Pickup, van, xe tải nhỏ",
      },
    ],
    services: [
      {
        id: 1,
        serviceId: 1,
        serviceName: "Rửa xe chuyên nghiệp",
        serviceCategory: "Chăm sóc ngoại thất",
        basePrice: 150000,
        finalPrice: 150000,
        discountPercentage: 0,
        priceRanges: [
          {
            id: 1,
            name: "Xe nhỏ (dưới 4.5m)",
            minValue: 0,
            maxValue: 4.5,
            price: 120000,
            description: "Sedan, hatchback, coupe",
          },
          {
            id: 2,
            name: "Xe trung bình (4.5m - 5m)",
            minValue: 4.5,
            maxValue: 5.0,
            price: 150000,
            description: "SUV, crossover, wagon",
          },
          {
            id: 3,
            name: "Xe lớn (trên 5m)",
            minValue: 5.0,
            maxValue: 999,
            price: 180000,
            description: "Pickup, van, xe tải nhỏ",
          },
        ],
        status: "active",
      },
      {
        id: 2,
        serviceId: 2,
        serviceName: "Đánh bóng và phủ ceramic",
        serviceCategory: "Chăm sóc ngoại thất",
        basePrice: 500000,
        finalPrice: 500000,
        discountPercentage: 0,
        priceRanges: [
          {
            id: 4,
            name: "Xe nhỏ (dưới 4.5m)",
            minValue: 0,
            maxValue: 4.5,
            price: 400000,
            description: "Sedan, hatchback, coupe",
          },
          {
            id: 5,
            name: "Xe trung bình (4.5m - 5m)",
            minValue: 4.5,
            maxValue: 5.0,
            price: 500000,
            description: "SUV, crossover, wagon",
          },
          {
            id: 6,
            name: "Xe lớn (trên 5m)",
            minValue: 5.0,
            maxValue: 999,
            price: 600000,
            description: "Pickup, van, xe tải nhỏ",
          },
        ],
        status: "active",
      },
    ],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-15",
    createdBy: "admin",
    updatedBy: "admin",
  },
  {
    id: 2,
    name: "Bảng giá Quận 1 - Cao cấp",
    code: "Q1-PREMIUM-2024",
    description: "Bảng giá cao cấp cho chi nhánh Quận 1",
    branchId: 1,
    branchName: "Chi nhánh Quận 1",
    status: "active",
    effectiveDate: "2024-01-01",
    isDefault: false,
    discountPrograms: [discountProgramsData[0], discountProgramsData[2]],
    products: [
      {
        id: 3,
        productId: 1,
        productName: "Shampoo rửa xe cao cấp",
        productCategory: "Hóa chất rửa xe",
        basePrice: 250000,
        finalPrice: 300000,
        discountPercentage: 0,
        status: "active",
        notes: "Giá cao cấp cho khu vực trung tâm",
      },
    ],
    servicePackages: [
      {
        id: 2,
        packageId: 1,
        packageName: "Gói chăm sóc toàn diện",
        basePrice: 800000,
        finalPrice: 950000,
        discountPercentage: 0,
        status: "active",
        notes: "Giá cao cấp cho khu vực trung tâm",
      },
    ],
    vehicleTypes: [
      {
        id: 4,
        vehicleTypeId: 1,
        vehicleTypeName: "Xe nhỏ (dưới 4.5m)",
        multiplier: 1.0,
        description: "Sedan, hatchback, coupe",
      },
      {
        id: 5,
        vehicleTypeId: 2,
        vehicleTypeName: "Xe trung bình (4.5m - 5m)",
        multiplier: 1.3,
        description: "SUV, crossover, wagon",
      },
      {
        id: 6,
        vehicleTypeId: 3,
        vehicleTypeName: "Xe lớn (trên 5m)",
        multiplier: 1.6,
        description: "Pickup, van, xe tải nhỏ",
      },
    ],
    services: [
      {
        id: 3,
        serviceId: 1,
        serviceName: "Rửa xe chuyên nghiệp",
        serviceCategory: "Chăm sóc ngoại thất",
        basePrice: 150000,
        finalPrice: 180000,
        discountPercentage: 0,
        priceRanges: [
          {
            id: 7,
            name: "Xe nhỏ (dưới 4.5m)",
            minValue: 0,
            maxValue: 4.5,
            price: 150000,
            description: "Sedan, hatchback, coupe",
          },
          {
            id: 8,
            name: "Xe trung bình (4.5m - 5m)",
            minValue: 4.5,
            maxValue: 5.0,
            price: 180000,
            description: "SUV, crossover, wagon",
          },
          {
            id: 9,
            name: "Xe lớn (trên 5m)",
            minValue: 5.0,
            maxValue: 999,
            price: 220000,
            description: "Pickup, van, xe tải nhỏ",
          },
        ],
        status: "active",
        notes: "Giá cao cấp cho khu vực trung tâm",
      },
    ],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-15",
    createdBy: "admin",
    updatedBy: "admin",
  },
  {
    id: 3,
    name: "Bảng giá Quận 7 - Tiết kiệm",
    code: "Q7-BUDGET-2024",
    description: "Bảng giá tiết kiệm cho chi nhánh Quận 7",
    branchId: 2,
    branchName: "Chi nhánh Quận 7",
    status: "active",
    effectiveDate: "2024-01-01",
    isDefault: false,
    discountPrograms: [discountProgramsData[1]],
    products: [
      {
        id: 4,
        productId: 1,
        productName: "Shampoo rửa xe cao cấp",
        productCategory: "Hóa chất rửa xe",
        basePrice: 250000,
        finalPrice: 200000,
        discountPercentage: 20,
        status: "active",
        notes: "Giá ưu đãi cho khu vực mới",
      },
    ],
    servicePackages: [
      {
        id: 3,
        packageId: 1,
        packageName: "Gói chăm sóc toàn diện",
        basePrice: 800000,
        finalPrice: 640000,
        discountPercentage: 20,
        status: "active",
        notes: "Giá ưu đãi cho khu vực mới",
      },
    ],
    vehicleTypes: [
      {
        id: 7,
        vehicleTypeId: 1,
        vehicleTypeName: "Xe nhỏ (dưới 4.5m)",
        multiplier: 0.8,
        description: "Sedan, hatchback, coupe",
      },
      {
        id: 8,
        vehicleTypeId: 2,
        vehicleTypeName: "Xe trung bình (4.5m - 5m)",
        multiplier: 1.0,
        description: "SUV, crossover, wagon",
      },
      {
        id: 9,
        vehicleTypeId: 3,
        vehicleTypeName: "Xe lớn (trên 5m)",
        multiplier: 1.2,
        description: "Pickup, van, xe tải nhỏ",
      },
    ],
    services: [
      {
        id: 4,
        serviceId: 1,
        serviceName: "Rửa xe chuyên nghiệp",
        serviceCategory: "Chăm sóc ngoại thất",
        basePrice: 150000,
        finalPrice: 120000,
        discountPercentage: 20,
        priceRanges: [
          {
            id: 10,
            name: "Xe nhỏ (dưới 4.5m)",
            minValue: 0,
            maxValue: 4.5,
            price: 100000,
            description: "Sedan, hatchback, coupe",
          },
          {
            id: 11,
            name: "Xe trung bình (4.5m - 5m)",
            minValue: 4.5,
            maxValue: 5.0,
            price: 120000,
            description: "SUV, crossover, wagon",
          },
          {
            id: 12,
            name: "Xe lớn (trên 5m)",
            minValue: 5.0,
            maxValue: 999,
            price: 150000,
            description: "Pickup, van, xe tải nhỏ",
          },
        ],
        status: "active",
        notes: "Giá ưu đãi cho khu vực mới",
      },
    ],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-15",
    createdBy: "admin",
    updatedBy: "admin",
  },
  {
    id: 4,
    name: "Bảng giá cũ - 2023",
    code: "SYS-2023",
    description: "Bảng giá hệ thống năm 2023",
    branchId: null,
    status: "inactive",
    effectiveDate: "2023-01-01",
    expiryDate: "2023-12-31",
    isDefault: false,
    discountPrograms: [],
    products: [],
    servicePackages: [],
    vehicleTypes: [],
    services: [
      {
        id: 5,
        serviceId: 1,
        serviceName: "Rửa xe chuyên nghiệp",
        serviceCategory: "Chăm sóc ngoại thất",
        basePrice: 120000,
        finalPrice: 120000,
        discountPercentage: 0,
        priceRanges: [
          {
            id: 13,
            name: "Xe nhỏ (dưới 4.5m)",
            minValue: 0,
            maxValue: 4.5,
            price: 100000,
            description: "Sedan, hatchback, coupe",
          },
          {
            id: 14,
            name: "Xe trung bình (4.5m - 5m)",
            minValue: 4.5,
            maxValue: 5.0,
            price: 120000,
            description: "SUV, crossover, wagon",
          },
          {
            id: 15,
            name: "Xe lớn (trên 5m)",
            minValue: 5.0,
            maxValue: 999,
            price: 150000,
            description: "Pickup, van, xe tải nhỏ",
          },
        ],
        status: "inactive",
      },
    ],
    createdAt: "2023-01-01",
    updatedAt: "2023-12-31",
    createdBy: "admin",
    updatedBy: "admin",
  },
];

export const priceHistoryData: PriceHistory[] = [
  {
    id: 1,
    priceTableId: 1,
    serviceId: 1,
    oldPrice: 120000,
    newPrice: 150000,
    changeType: "increase",
    changeReason: "Tăng giá do chi phí nguyên liệu tăng",
    effectiveDate: "2024-01-01",
    createdBy: "admin",
    createdAt: "2024-01-01",
  },
  {
    id: 2,
    priceTableId: 1,
    serviceId: 2,
    oldPrice: 0,
    newPrice: 500000,
    changeType: "new",
    changeReason: "Thêm dịch vụ mới",
    effectiveDate: "2024-01-01",
    createdBy: "admin",
    createdAt: "2024-01-01",
  },
  {
    id: 3,
    priceTableId: 2,
    serviceId: 1,
    oldPrice: 150000,
    newPrice: 180000,
    changeType: "increase",
    changeReason: "Điều chỉnh giá cho khu vực cao cấp",
    effectiveDate: "2024-01-01",
    createdBy: "admin",
    createdAt: "2024-01-01",
  },
];

// ===== HELPER FUNCTIONS =====
export const getBranchById = (id: number): Branch | undefined => {
  return branchesData.find((branch) => branch.id === id);
};

export const getPriceTableById = (id: number): PriceTable | undefined => {
  return priceTablesData.find((table) => table.id === id);
};

export const getPriceHistoryByTableId = (tableId: number): PriceHistory[] => {
  return priceHistoryData.filter((history) => history.priceTableId === tableId);
};

export const getActivePriceTables = (): PriceTable[] => {
  return priceTablesData.filter((table) => table.status === "active");
};

export const getPriceTablesByBranch = (branchId: number | null): PriceTable[] => {
  return priceTablesData.filter((table) => table.branchId === branchId);
};

export const getDefaultPriceTable = (): PriceTable | undefined => {
  return priceTablesData.find((table) => table.isDefault && table.status === "active");
};

// ===== CONSTANTS =====
export const PRICE_TABLE_STATUSES = [
  { value: "active", label: "Đang áp dụng", color: "green" },
  { value: "inactive", label: "Ngừng áp dụng", color: "red" },
  { value: "draft", label: "Bản nháp", color: "orange" },
];

export const BRANCH_STATUSES = [
  { value: "active", label: "Hoạt động", color: "green" },
  { value: "inactive", label: "Ngừng hoạt động", color: "red" },
];

export const DISCOUNT_TYPES = [
  { value: "percentage", label: "Phần trăm (%)", color: "blue" },
  { value: "fixed", label: "Số tiền cố định", color: "green" },
];

export const CHANGE_TYPES = [
  { value: "increase", label: "Tăng giá", color: "red" },
  { value: "decrease", label: "Giảm giá", color: "green" },
  { value: "new", label: "Dịch vụ mới", color: "blue" },
];

export const APPLICABLE_TO_OPTIONS = [
  { value: "all", label: "Tất cả", color: "blue" },
  { value: "services", label: "Dịch vụ", color: "green" },
  { value: "products", label: "Sản phẩm", color: "orange" },
  { value: "packages", label: "Gói dịch vụ", color: "purple" },
  { value: "custom", label: "Tùy chỉnh", color: "gray" },
];

export const VEHICLE_TYPE_MULTIPLIERS = [
  { value: 0.5, label: "0.5x (Giảm 50%)", color: "green" },
  { value: 0.8, label: "0.8x (Giảm 20%)", color: "green" },
  { value: 1.0, label: "1.0x (Giá gốc)", color: "blue" },
  { value: 1.2, label: "1.2x (Tăng 20%)", color: "orange" },
  { value: 1.5, label: "1.5x (Tăng 50%)", color: "red" },
  { value: 2.0, label: "2.0x (Tăng 100%)", color: "red" },
];
