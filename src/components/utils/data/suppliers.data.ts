export interface Supplier {
  id: number;
  name: string;
  code: string; // Mã nhà cung cấp
  type: "product" | "service" | "equipment" | "material" | "other";
  category: string; // Danh mục sản phẩm/dịch vụ
  description: string;
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
    address: string;
    city: string;
    district: string;
    ward: string;
  };
  businessInfo: {
    taxCode: string;
    businessLicense: string;
    representative: string; // Người đại diện
    position: string; // Chức vụ
    bankAccount: string;
    bankName: string;
  };
  services: {
    productCategories: string[]; // Danh mục sản phẩm cung cấp
    serviceTypes: string[]; // Loại dịch vụ
    specialties: string[]; // Chuyên môn
    certifications: string[]; // Chứng nhận
  };
  performance: {
    rating: number; // Đánh giá (1-5)
    totalOrders: number; // Tổng số đơn hàng
    completedOrders: number; // Đơn hàng hoàn thành
    onTimeDelivery: number; // % giao hàng đúng hạn
    qualityScore: number; // Điểm chất lượng (1-10)
    lastOrderDate: string; // Ngày đặt hàng cuối
    totalValue: number; // Tổng giá trị hợp đồng
  };
  contractInfo: {
    contractNumber: string;
    startDate: string;
    endDate: string;
    status: "active" | "expired" | "suspended" | "terminated";
    paymentTerms: string; // Điều khoản thanh toán
    deliveryTerms: string; // Điều khoản giao hàng
    warrantyPeriod: string; // Thời gian bảo hành
  };
  documents: {
    contracts: string[]; // Hợp đồng
    certificates: string[]; // Chứng chỉ
    invoices: string[]; // Hóa đơn
    other: string[]; // Tài liệu khác
  };
  notes: string; // Ghi chú
  status: "active" | "inactive" | "pending" | "blacklisted";
  tags: string[]; // Tags phân loại
  createdAt: string;
  updatedAt: string;
}

export interface SupplierProduct {
  id: number;
  supplierId: number;
  name: string;
  category: string;
  unit: string; // Đơn vị tính
  price: number; // Giá
  minOrder: number; // Số lượng đặt tối thiểu
  stock: number; // Tồn kho
  description: string;
  specifications: string; // Thông số kỹ thuật
  warranty: string; // Bảo hành
  status: "available" | "out_of_stock" | "discontinued";
}

export interface SupplierOrder {
  id: number;
  supplierId: number;
  orderNumber: string;
  orderDate: string;
  deliveryDate: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  totalAmount: number;
  items: {
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  notes: string;
}

export const supplierTypes = [
  { value: "product", label: "Sản phẩm", icon: "📦" },
  { value: "service", label: "Dịch vụ", icon: "🔧" },
  { value: "equipment", label: "Thiết bị", icon: "⚙️" },
  { value: "material", label: "Vật liệu", icon: "🧱" },
  { value: "other", label: "Khác", icon: "📋" },
];

export const supplierStatuses = [
  { value: "active", label: "Hoạt động", color: "green" },
  { value: "inactive", label: "Tạm dừng", color: "red" },
  { value: "pending", label: "Chờ duyệt", color: "orange" },
  { value: "blacklisted", label: "Cấm", color: "red" },
];

export const contractStatuses = [
  { value: "active", label: "Có hiệu lực", color: "green" },
  { value: "expired", label: "Hết hạn", color: "red" },
  { value: "suspended", label: "Tạm dừng", color: "orange" },
  { value: "terminated", label: "Chấm dứt", color: "gray" },
];

export const productCategories = [
  "Hóa chất tẩy rửa",
  "Dụng cụ chăm sóc xe",
  "Phụ tùng thay thế",
  "Thiết bị chuyên dụng",
  "Vật liệu bảo vệ",
  "Dụng cụ đo lường",
  "Thiết bị an toàn",
  "Vật tư tiêu hao",
];

export const serviceTypes = [
  "Bảo trì thiết bị",
  "Sửa chữa chuyên nghiệp",
  "Tư vấn kỹ thuật",
  "Đào tạo nhân viên",
  "Hỗ trợ kỹ thuật",
  "Dịch vụ logistics",
];

export const cities = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "An Giang",
  "Bà Rịa - Vũng Tàu",
  "Bắc Giang",
  "Bắc Kạn",
  "Bạc Liêu",
  "Bắc Ninh",
  "Bến Tre",
  "Bình Định",
  "Bình Dương",
  "Bình Phước",
  "Bình Thuận",
  "Cà Mau",
  "Cao Bằng",
  "Đắk Lắk",
  "Đắk Nông",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Giang",
  "Hà Nam",
  "Hà Tĩnh",
  "Hải Dương",
  "Hậu Giang",
  "Hòa Bình",
  "Hưng Yên",
  "Khánh Hòa",
  "Kiên Giang",
  "Kon Tum",
  "Lai Châu",
  "Lâm Đồng",
  "Lạng Sơn",
  "Lào Cai",
  "Long An",
  "Nam Định",
  "Nghệ An",
  "Ninh Bình",
  "Ninh Thuận",
  "Phú Thọ",
  "Phú Yên",
  "Quảng Bình",
  "Quảng Nam",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sóc Trăng",
  "Sơn La",
  "Tây Ninh",
  "Thái Bình",
  "Thái Nguyên",
  "Thanh Hóa",
  "Thừa Thiên Huế",
  "Tiền Giang",
  "Trà Vinh",
  "Tuyên Quang",
  "Vĩnh Long",
  "Vĩnh Phúc",
  "Yên Bái",
];

export const suppliersData: Supplier[] = [
  {
    id: 1,
    name: "Công ty TNHH Hóa chất AutoClean",
    code: "AUTO001",
    type: "product",
    category: "Hóa chất tẩy rửa",
    description: "Chuyên cung cấp hóa chất tẩy rửa chuyên nghiệp cho ngành chăm sóc xe",
    contactInfo: {
      phone: "024-1234-5678",
      email: "contact@autoclean.com.vn",
      website: "www.autoclean.com.vn",
      address: "Số 123, Đường Láng, Quận Đống Đa",
      city: "Hà Nội",
      district: "Đống Đa",
      ward: "Phường Láng Thượng",
    },
    businessInfo: {
      taxCode: "0123456789",
      businessLicense: "BL-2023-001",
      representative: "Nguyễn Văn A",
      position: "Giám đốc",
      bankAccount: "1234567890",
      bankName: "Vietcombank",
    },
    services: {
      productCategories: ["Hóa chất tẩy rửa", "Dụng cụ chăm sóc xe"],
      serviceTypes: ["Tư vấn kỹ thuật", "Hỗ trợ kỹ thuật"],
      specialties: ["Hóa chất chuyên dụng", "Tẩy rửa cao cấp"],
      certifications: ["ISO 9001:2015", "Chứng nhận chất lượng"],
    },
    performance: {
      rating: 4.5,
      totalOrders: 156,
      completedOrders: 150,
      onTimeDelivery: 95,
      qualityScore: 8.5,
      lastOrderDate: "2024-06-15",
      totalValue: 2500000000,
    },
    contractInfo: {
      contractNumber: "HD-2024-001",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      status: "active",
      paymentTerms: "Thanh toán 30 ngày",
      deliveryTerms: "Giao hàng trong 24h",
      warrantyPeriod: "12 tháng",
    },
    documents: {
      contracts: ["HD-2024-001.pdf"],
      certificates: ["ISO-9001.pdf", "Quality-Cert.pdf"],
      invoices: ["HD-2024-001-001.pdf"],
      other: ["Company-Profile.pdf"],
    },
    notes: "Nhà cung cấp uy tín, chất lượng tốt",
    status: "active",
    tags: ["Hóa chất", "Chất lượng cao", "Giao hàng nhanh"],
    createdAt: "2024-01-01",
    updatedAt: "2024-06-15",
  },
  {
    id: 2,
    name: "Thiết bị chăm sóc xe ProTech",
    code: "PROT002",
    type: "equipment",
    category: "Thiết bị chuyên dụng",
    description: "Cung cấp thiết bị chăm sóc xe chuyên nghiệp và hiện đại",
    contactInfo: {
      phone: "028-9876-5432",
      email: "info@protech.vn",
      website: "www.protech.vn",
      address: "Số 456, Đường Nguyễn Văn Cừ, Quận 5",
      city: "TP. Hồ Chí Minh",
      district: "Quận 5",
      ward: "Phường 1",
    },
    businessInfo: {
      taxCode: "0987654321",
      businessLicense: "BL-2023-002",
      representative: "Trần Thị B",
      position: "Tổng giám đốc",
      bankAccount: "0987654321",
      bankName: "BIDV",
    },
    services: {
      productCategories: ["Thiết bị chuyên dụng", "Dụng cụ đo lường"],
      serviceTypes: ["Bảo trì thiết bị", "Đào tạo nhân viên"],
      specialties: ["Thiết bị cao cấp", "Công nghệ hiện đại"],
      certifications: ["CE", "FCC", "Chứng nhận xuất xứ"],
    },
    performance: {
      rating: 4.8,
      totalOrders: 89,
      completedOrders: 87,
      onTimeDelivery: 98,
      qualityScore: 9.2,
      lastOrderDate: "2024-06-10",
      totalValue: 1800000000,
    },
    contractInfo: {
      contractNumber: "HD-2024-002",
      startDate: "2024-02-01",
      endDate: "2025-01-31",
      status: "active",
      paymentTerms: "Thanh toán 50% trước, 50% sau",
      deliveryTerms: "Giao hàng trong 7 ngày",
      warrantyPeriod: "24 tháng",
    },
    documents: {
      contracts: ["HD-2024-002.pdf"],
      certificates: ["CE-Cert.pdf", "FCC-Cert.pdf"],
      invoices: ["HD-2024-002-001.pdf"],
      other: ["Product-Catalog.pdf"],
    },
    notes: "Thiết bị chất lượng cao, hỗ trợ tốt",
    status: "active",
    tags: ["Thiết bị", "Công nghệ cao", "Bảo hành dài"],
    createdAt: "2024-02-01",
    updatedAt: "2024-06-10",
  },
  {
    id: 3,
    name: "Vật liệu bảo vệ AutoShield",
    code: "SHLD003",
    type: "material",
    category: "Vật liệu bảo vệ",
    description: "Chuyên cung cấp vật liệu bảo vệ và phụ kiện chăm sóc xe",
    contactInfo: {
      phone: "0236-5555-7777",
      email: "sales@autoshield.com",
      website: "www.autoshield.com",
      address: "Số 789, Đường 2/9, Quận Hải Châu",
      city: "Đà Nẵng",
      district: "Hải Châu",
      ward: "Phường Hải Châu I",
    },
    businessInfo: {
      taxCode: "0555555555",
      businessLicense: "BL-2023-003",
      representative: "Lê Văn C",
      position: "Giám đốc kinh doanh",
      bankAccount: "0555555555",
      bankName: "Agribank",
    },
    services: {
      productCategories: ["Vật liệu bảo vệ", "Phụ tùng thay thế"],
      serviceTypes: ["Tư vấn kỹ thuật", "Dịch vụ logistics"],
      specialties: ["Vật liệu cao cấp", "Bảo vệ lâu dài"],
      certifications: ["Chứng nhận chất lượng", "ISO 14001"],
    },
    performance: {
      rating: 4.2,
      totalOrders: 67,
      completedOrders: 65,
      onTimeDelivery: 92,
      qualityScore: 7.8,
      lastOrderDate: "2024-06-05",
      totalValue: 1200000000,
    },
    contractInfo: {
      contractNumber: "HD-2024-003",
      startDate: "2024-03-01",
      endDate: "2024-12-31",
      status: "active",
      paymentTerms: "Thanh toán 15 ngày",
      deliveryTerms: "Giao hàng trong 48h",
      warrantyPeriod: "6 tháng",
    },
    documents: {
      contracts: ["HD-2024-003.pdf"],
      certificates: ["Quality-Cert.pdf", "ISO-14001.pdf"],
      invoices: ["HD-2024-003-001.pdf"],
      other: ["Material-Specs.pdf"],
    },
    notes: "Vật liệu chất lượng tốt, giá cả hợp lý",
    status: "active",
    tags: ["Vật liệu", "Giá tốt", "Giao hàng nhanh"],
    createdAt: "2024-03-01",
    updatedAt: "2024-06-05",
  },
  {
    id: 4,
    name: "Dịch vụ bảo trì TechCare",
    code: "TECH004",
    type: "service",
    category: "Bảo trì thiết bị",
    description: "Cung cấp dịch vụ bảo trì và sửa chữa thiết bị chăm sóc xe",
    contactInfo: {
      phone: "024-8888-9999",
      email: "service@techcare.vn",
      website: "www.techcare.vn",
      address: "Số 321, Đường Giải Phóng, Quận Hai Bà Trưng",
      city: "Hà Nội",
      district: "Hai Bà Trưng",
      ward: "Phường Bạch Đằng",
    },
    businessInfo: {
      taxCode: "0888888888",
      businessLicense: "BL-2023-004",
      representative: "Phạm Thị D",
      position: "Giám đốc kỹ thuật",
      bankAccount: "0888888888",
      bankName: "Techcombank",
    },
    services: {
      productCategories: [],
      serviceTypes: ["Bảo trì thiết bị", "Sửa chữa chuyên nghiệp", "Đào tạo nhân viên"],
      specialties: ["Bảo trì chuyên nghiệp", "Sửa chữa nhanh chóng"],
      certifications: ["Chứng nhận kỹ thuật", "ISO 9001:2015"],
    },
    performance: {
      rating: 4.6,
      totalOrders: 45,
      completedOrders: 44,
      onTimeDelivery: 96,
      qualityScore: 8.8,
      lastOrderDate: "2024-06-12",
      totalValue: 800000000,
    },
    contractInfo: {
      contractNumber: "HD-2024-004",
      startDate: "2024-01-15",
      endDate: "2024-12-31",
      status: "active",
      paymentTerms: "Thanh toán theo tháng",
      deliveryTerms: "Hỗ trợ 24/7",
      warrantyPeriod: "12 tháng",
    },
    documents: {
      contracts: ["HD-2024-004.pdf"],
      certificates: ["Tech-Cert.pdf", "ISO-9001.pdf"],
      invoices: ["HD-2024-004-001.pdf"],
      other: ["Service-Agreement.pdf"],
    },
    notes: "Dịch vụ bảo trì chuyên nghiệp, hỗ trợ tốt",
    status: "active",
    tags: ["Dịch vụ", "Bảo trì", "Hỗ trợ 24/7"],
    createdAt: "2024-01-15",
    updatedAt: "2024-06-12",
  },
  {
    id: 5,
    name: "Phụ tùng thay thế AutoParts",
    code: "PART005",
    type: "product",
    category: "Phụ tùng thay thế",
    description: "Cung cấp phụ tùng thay thế chính hãng cho các thiết bị chăm sóc xe",
    contactInfo: {
      phone: "028-7777-8888",
      email: "parts@autoparts.vn",
      website: "www.autoparts.vn",
      address: "Số 654, Đường Cách Mạng Tháng 8, Quận 10",
      city: "TP. Hồ Chí Minh",
      district: "Quận 10",
      ward: "Phường 5",
    },
    businessInfo: {
      taxCode: "0777777777",
      businessLicense: "BL-2023-005",
      representative: "Võ Văn E",
      position: "Giám đốc",
      bankAccount: "0777777777",
      bankName: "Vietinbank",
    },
    services: {
      productCategories: ["Phụ tùng thay thế", "Dụng cụ chăm sóc xe"],
      serviceTypes: ["Tư vấn kỹ thuật", "Hỗ trợ kỹ thuật"],
      specialties: ["Phụ tùng chính hãng", "Đa dạng chủng loại"],
      certifications: ["Chứng nhận xuất xứ", "Warranty Certificate"],
    },
    performance: {
      rating: 4.3,
      totalOrders: 123,
      completedOrders: 120,
      onTimeDelivery: 94,
      qualityScore: 8.0,
      lastOrderDate: "2024-06-08",
      totalValue: 1500000000,
    },
    contractInfo: {
      contractNumber: "HD-2024-005",
      startDate: "2024-02-15",
      endDate: "2024-12-31",
      status: "active",
      paymentTerms: "Thanh toán 20 ngày",
      deliveryTerms: "Giao hàng trong 3 ngày",
      warrantyPeriod: "18 tháng",
    },
    documents: {
      contracts: ["HD-2024-005.pdf"],
      certificates: ["Origin-Cert.pdf", "Warranty-Cert.pdf"],
      invoices: ["HD-2024-005-001.pdf"],
      other: ["Parts-Catalog.pdf"],
    },
    notes: "Phụ tùng chính hãng, chất lượng đảm bảo",
    status: "active",
    tags: ["Phụ tùng", "Chính hãng", "Đa dạng"],
    createdAt: "2024-02-15",
    updatedAt: "2024-06-08",
  },
  {
    id: 6,
    name: "Dụng cụ chăm sóc xe ToolMaster",
    code: "TOOL006",
    type: "product",
    category: "Dụng cụ chăm sóc xe",
    description: "Chuyên cung cấp dụng cụ chăm sóc xe chuyên nghiệp và chất lượng cao",
    contactInfo: {
      phone: "0236-4444-5555",
      email: "tools@toolmaster.vn",
      website: "www.toolmaster.vn",
      address: "Số 987, Đường Lê Duẩn, Quận Thanh Khê",
      city: "Đà Nẵng",
      district: "Thanh Khê",
      ward: "Phường Thanh Khê Tây",
    },
    businessInfo: {
      taxCode: "0444444444",
      businessLicense: "BL-2023-006",
      representative: "Hoàng Thị F",
      position: "Giám đốc kinh doanh",
      bankAccount: "0444444444",
      bankName: "ACB",
    },
    services: {
      productCategories: ["Dụng cụ chăm sóc xe", "Thiết bị an toàn"],
      serviceTypes: ["Tư vấn kỹ thuật", "Đào tạo nhân viên"],
      specialties: ["Dụng cụ chuyên nghiệp", "Chất lượng cao"],
      certifications: ["CE", "Chứng nhận chất lượng"],
    },
    performance: {
      rating: 4.4,
      totalOrders: 78,
      completedOrders: 76,
      onTimeDelivery: 93,
      qualityScore: 8.2,
      lastOrderDate: "2024-06-03",
      totalValue: 900000000,
    },
    contractInfo: {
      contractNumber: "HD-2024-006",
      startDate: "2024-04-01",
      endDate: "2024-12-31",
      status: "active",
      paymentTerms: "Thanh toán 25 ngày",
      deliveryTerms: "Giao hàng trong 5 ngày",
      warrantyPeriod: "12 tháng",
    },
    documents: {
      contracts: ["HD-2024-006.pdf"],
      certificates: ["CE-Cert.pdf", "Quality-Cert.pdf"],
      invoices: ["HD-2024-006-001.pdf"],
      other: ["Tools-Catalog.pdf"],
    },
    notes: "Dụng cụ chất lượng tốt, giá cả cạnh tranh",
    status: "active",
    tags: ["Dụng cụ", "Chất lượng", "Giá cạnh tranh"],
    createdAt: "2024-04-01",
    updatedAt: "2024-06-03",
  },
];

export const supplierProductsData: SupplierProduct[] = [
  {
    id: 1,
    supplierId: 1,
    name: "Hóa chất tẩy rửa cao cấp AutoClean Pro",
    category: "Hóa chất tẩy rửa",
    unit: "Lít",
    price: 150000,
    minOrder: 10,
    stock: 500,
    description: "Hóa chất tẩy rửa chuyên dụng cho xe hơi",
    specifications: "pH: 7.5, Nồng độ: 15%, Thời gian tác dụng: 5 phút",
    warranty: "12 tháng",
    status: "available",
  },
  {
    id: 2,
    supplierId: 2,
    name: "Máy rửa xe áp lực cao ProTech 3000",
    category: "Thiết bị chuyên dụng",
    unit: "Cái",
    price: 15000000,
    minOrder: 1,
    stock: 25,
    description: "Máy rửa xe áp lực cao chuyên nghiệp",
    specifications: "Áp lực: 3000 PSI, Công suất: 3HP, Điện áp: 220V",
    warranty: "24 tháng",
    status: "available",
  },
  {
    id: 3,
    supplierId: 3,
    name: "Sơn bảo vệ AutoShield Premium",
    category: "Vật liệu bảo vệ",
    unit: "Thùng",
    price: 2500000,
    minOrder: 5,
    stock: 100,
    description: "Sơn bảo vệ cao cấp cho xe hơi",
    specifications: "Độ bền: 5 năm, Chống UV: 99%, Chống nước: 100%",
    warranty: "6 tháng",
    status: "available",
  },
];

export const supplierOrdersData: SupplierOrder[] = [
  {
    id: 1,
    supplierId: 1,
    orderNumber: "PO-2024-001",
    orderDate: "2024-06-15",
    deliveryDate: "2024-06-20",
    status: "delivered",
    totalAmount: 5000000,
    items: [
      {
        productId: 1,
        productName: "Hóa chất tẩy rửa cao cấp AutoClean Pro",
        quantity: 20,
        unitPrice: 150000,
        totalPrice: 3000000,
      },
      {
        productId: 2,
        productName: "Hóa chất bảo vệ AutoClean Shield",
        quantity: 10,
        unitPrice: 200000,
        totalPrice: 2000000,
      },
    ],
    notes: "Giao hàng đúng hạn, chất lượng tốt",
  },
  {
    id: 2,
    supplierId: 2,
    orderNumber: "PO-2024-002",
    orderDate: "2024-06-10",
    deliveryDate: "2024-06-17",
    status: "delivered",
    totalAmount: 30000000,
    items: [
      {
        productId: 3,
        productName: "Máy rửa xe áp lực cao ProTech 3000",
        quantity: 2,
        unitPrice: 15000000,
        totalPrice: 30000000,
      },
    ],
    notes: "Thiết bị hoạt động tốt, đúng thông số",
  },
];
