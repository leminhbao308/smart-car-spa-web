// Mock data cho phân quyền
export const perData = [
  {
    id: 1,
    name: "Quản trị viên",
    code: "admin",
    description: "Có tất cả quyền trong hệ thống",
    permissions: [
      "user_management",
      "staff_management", 
      "customer_management",
      "vehicle_management",
      "service_management",
      "product_management",
      "pricing_management",
      "supplier_management",
      "center_management",
      "report_management",
      "system_settings"
    ],
    userCount: 2,
    status: "active",
    createdAt: "2023-01-01 08:00:00",
    updatedAt: "2024-01-15 10:30:00",
  },
  {
    id: 2,
    name: "Quản lý",
    code: "manager",
    description: "Quản lý nhân viên và khách hàng",
    permissions: [
      "staff_management",
      "customer_management",
      "vehicle_management",
      "service_management",
      "product_management",
      "report_management"
    ],
    userCount: 3,
    status: "active",
    createdAt: "2023-02-15 10:30:00",
    updatedAt: "2024-01-10 14:20:00",
  },
  {
    id: 3,
    name: "Nhân viên kỹ thuật",
    code: "tech_staff",
    description: "Quản lý xe và dịch vụ kỹ thuật",
    permissions: [
      "vehicle_management",
      "service_management",
      "customer_management"
    ],
    userCount: 5,
    status: "active",
    createdAt: "2023-03-20 14:20:00",
    updatedAt: "2024-01-12 09:15:00",
  },
  {
    id: 4,
    name: "Nhân viên kinh doanh",
    code: "sales_staff",
    description: "Quản lý khách hàng và bán hàng",
    permissions: [
      "customer_management",
      "product_management",
      "pricing_management"
    ],
    userCount: 4,
    status: "active",
    createdAt: "2023-04-10 09:15:00",
    updatedAt: "2024-01-08 16:45:00",
  },
  {
    id: 5,
    name: "Nhân viên kho",
    code: "warehouse_staff",
    description: "Quản lý sản phẩm và nhà cung cấp",
    permissions: [
      "product_management",
      "supplier_management"
    ],
    userCount: 2,
    status: "active",
    createdAt: "2023-05-05 16:45:00",
    updatedAt: "2024-01-05 11:30:00",
  },
  {
    id: 6,
    name: "Kế toán",
    code: "accountant",
    description: "Quản lý tài chính và báo cáo",
    permissions: [
      "pricing_management",
      "report_management",
      "customer_management"
    ],
    userCount: 2,
    status: "active",
    createdAt: "2023-06-12 11:00:00",
    updatedAt: "2024-01-14 13:20:00",
  },
  {
    id: 7,
    name: "Người xem",
    code: "viewer",
    description: "Chỉ có quyền xem dữ liệu",
    permissions: [
      "customer_management",
      "vehicle_management",
      "service_management",
      "product_management"
    ],
    userCount: 1,
    status: "active",
    createdAt: "2023-07-18 13:30:00",
    updatedAt: "2024-01-03 08:45:00",
  },
  {
    id: 8,
    name: "Quản lý cũ",
    code: "old_manager",
    description: "Vai trò quản lý cũ - đã ngừng sử dụng",
    permissions: [
      "staff_management",
      "customer_management"
    ],
    userCount: 0,
    status: "inactive",
    createdAt: "2022-12-01 08:00:00",
    updatedAt: "2023-12-31 17:00:00",
  },
];

// Định nghĩa tất cả permissions có thể có
export const allPermissions = [
  {
    code: "user_management",
    name: "Quản lý người dùng",
    category: "Hệ thống",
    description: "Tạo, sửa, xóa tài khoản người dùng"
  },
  {
    code: "staff_management",
    name: "Quản lý nhân viên",
    category: "Nhân sự",
    description: "Quản lý thông tin nhân viên"
  },
  {
    code: "customer_management",
    name: "Quản lý khách hàng",
    category: "Khách hàng",
    description: "Quản lý thông tin khách hàng"
  },
  {
    code: "vehicle_management",
    name: "Quản lý xe",
    category: "Xe",
    description: "Quản lý hồ sơ và thông tin xe"
  },
  {
    code: "service_management",
    name: "Quản lý dịch vụ",
    category: "Dịch vụ",
    description: "Quản lý dịch vụ và gói dịch vụ"
  },
  {
    code: "product_management",
    name: "Quản lý sản phẩm",
    category: "Sản phẩm",
    description: "Quản lý danh mục sản phẩm"
  },
  {
    code: "pricing_management",
    name: "Quản lý giá",
    category: "Tài chính",
    description: "Quản lý bảng giá và chi phí"
  },
  {
    code: "supplier_management",
    name: "Quản lý nhà cung cấp",
    category: "Nhà cung cấp",
    description: "Quản lý thông tin nhà cung cấp"
  },
  {
    code: "center_management",
    name: "Quản lý trung tâm",
    category: "Trung tâm",
    description: "Quản lý thông tin trung tâm và chi nhánh"
  },
  {
    code: "report_management",
    name: "Quản lý báo cáo",
    category: "Báo cáo",
    description: "Xem và tạo báo cáo"
  },
  {
    code: "system_settings",
    name: "Cài đặt hệ thống",
    category: "Hệ thống",
    description: "Cấu hình hệ thống"
  }
];

// Định nghĩa categories
export const permissionCategories = [
  { value: "Hệ thống", label: "Hệ thống", color: "red" },
  { value: "Nhân sự", label: "Nhân sự", color: "blue" },
  { value: "Khách hàng", label: "Khách hàng", color: "green" },
  { value: "Xe", label: "Xe", color: "orange" },
  { value: "Dịch vụ", label: "Dịch vụ", color: "purple" },
  { value: "Sản phẩm", label: "Sản phẩm", color: "cyan" },
  { value: "Tài chính", label: "Tài chính", color: "gold" },
  { value: "Nhà cung cấp", label: "Nhà cung cấp", color: "lime" },
  { value: "Trung tâm", label: "Trung tâm", color: "magenta" },
  { value: "Báo cáo", label: "Báo cáo", color: "volcano" },
];
