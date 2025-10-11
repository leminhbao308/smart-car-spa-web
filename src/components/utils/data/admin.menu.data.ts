import React from "react";
import { MenuProps } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  CustomerServiceOutlined,
  CarOutlined,
  ToolOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  ShopOutlined,
  BankOutlined,
  SafetyOutlined,
  FileTextOutlined,
  BranchesOutlined,
  InfoCircleOutlined,
  DashboardOutlined,
  GiftOutlined,
  BarcodeOutlined,
  UndoOutlined,
  ClockCircleOutlined,
  InboxOutlined,
  ExportOutlined,
  ImportOutlined,
} from "@ant-design/icons";

type MenuItem = Required<MenuProps>["items"][number];

export const adminMenuItems: MenuItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: React.createElement(DashboardOutlined),
  },
  {
    key: "pos",
    label: "Bán hàng (POS)",
    icon: React.createElement(BarcodeOutlined),
  },
  {
    key: "user-management",
    label: "Người dùng & quyền",
    icon: React.createElement(UserOutlined),
    children: [
      {
        key: "permissions",
        label: "Phân quyền",
        icon: React.createElement(SafetyOutlined),
      },
      {
        key: "employees",
        label: "Nhân viên",
        icon: React.createElement(TeamOutlined),
      },
      {
        key: "customers",
        label: "Khách hàng",
        icon: React.createElement(CustomerServiceOutlined),
      },
    ],
  },
  {
    key: "bookings",
    label: "Đặt lịch",
    icon: React.createElement(TeamOutlined),
  },
  {
    key: "category-management",
    label: "Quản lý danh mục",
    icon: React.createElement(AppstoreOutlined),
  },
  {
    key: "customer-service",
    label: "Dịch vụ khách hàng",
    icon: React.createElement(CustomerServiceOutlined),
  },
  {
    key: "care-processes",
    label: "Quy trình chăm sóc",
    icon: React.createElement(CarOutlined),
  },
  {
    key: "vehicles-in-care",
    label: "Xe đang chăm sóc",
    icon: React.createElement(CarOutlined),
  },
  {
    key: "vehicle-records",
    label: "Hồ sơ xe",
    icon: React.createElement(FileTextOutlined),
  },
  {
    key: "vehicle-info",
    label: "Thông tin phương tiện",
    icon: React.createElement(CarOutlined),
    children: [
      {
        key: "brands",
        label: "Hãng xe",
        icon: React.createElement(CarOutlined),
      },
      {
        key: "types",
        label: "Loại xe",
        icon: React.createElement(CarOutlined),
      },
      {
        key: "models",
        label: "Model xe",
        icon: React.createElement(CarOutlined),
      },
    ],
  },
  {
    key: "products",
    label: "Sản phẩm",
    icon: React.createElement(BarcodeOutlined),
  },

  {
    key: "services",
    label: "Dịch vụ",
    icon: React.createElement(ToolOutlined),
  },
  {
    key: "service-packages",
    label: "Gói dịch vụ",
    icon: React.createElement(ShoppingCartOutlined),
  },
  {
    key: "promotions",
    label: "Quản lý chương trình khuyến mãi",
    icon: React.createElement(GiftOutlined),
    children: [
      {
        key: "promotions-list",
        label: "Danh sách khuyến mãi",
        icon: React.createElement(GiftOutlined),
      },
      {
        key: "promotion-types",
        label: "Loại khuyến mãi",
        icon: React.createElement(BarcodeOutlined),
      },
      {
        key: "promotions-history",
        label: "Lịch sử sử dụng khuyến mãi",
        icon: React.createElement(ClockCircleOutlined),
      },
    ],
  },
  {
    key: "pricing",
    label: "Bảng giá",
    icon: React.createElement(DollarOutlined),
  },
  {
    key: "suppliers",
    label: "Nhà cung cấp",
    icon: React.createElement(ShopOutlined),
  },
  {
    key: "sales-management",
    label: "Quản lý bán hàng",
    icon: React.createElement(ShoppingCartOutlined),
    children: [
      {
        key: "invoices",
        label: "Hóa đơn",
        icon: React.createElement(FileTextOutlined),
      },
      {
        key: "draft-invoices",
        label: "Hóa đơn tạm",
        icon: React.createElement(ClockCircleOutlined),
      },
      {
        key: "returns",
        label: "Hoàn trả hàng",
        icon: React.createElement(UndoOutlined),
      },
    ],
  },
  {
    key: "inventory-management",
    label: "Quản lý kho",
    icon: React.createElement(InboxOutlined),
    children: [
      {
        key: "import-inventory",
        label: "Nhập kho",
        icon: React.createElement(ImportOutlined),
      },
      // {
      //     key: "export-inventory",
      //     label: "Xuất kho",
      //     icon: React.createElement(ExportOutlined),
      // },
      {
        key: "stock-inventory",
        label: "Tồn kho",
        icon: React.createElement(InboxOutlined),
      },
    ],
  },
  {
    key: "centers",
    label: "Trung tâm",
    icon: React.createElement(BankOutlined),
    children: [
      {
        key: "general-info",
        label: "Thông tin chung",
        icon: React.createElement(InfoCircleOutlined),
      },
      {
        key: "branches",
        label: "Các chi nhánh",
        icon: React.createElement(BranchesOutlined),
      },
      {
        key: "service-bays",
        label: "Khu vực dịch vụ",
        icon: React.createElement(ToolOutlined),
      },
    ],
  },
];

// Mapping từ key đến path
export const menuKeyToPath: Record<string, string> = {
  dashboard: "/dashboard",
  bookings: "/dashboard/bookings",
  "customer-service": "/dashboard/customer-service",
  "category-management": "/dashboard/category-management",
  "care-processes": "/dashboard/care-processes",
  "vehicles-in-care": "/dashboard/vehicles-in-care",
  permissions: "/dashboard/permissions",
  employees: "/dashboard/staff",
  customers: "/dashboard/members",
  "vehicle-records": "/dashboard/car-profiles",
  brands: "/dashboard/vehicle-brands",
  types: "/dashboard/vehicle-types",
  models: "/dashboard/vehicle-models",
  products: "/dashboard/products",
  "import-inventory": "/dashboard/inventory/import",
  "export-inventory": "/dashboard/inventory/export",
  "stock-inventory": "/dashboard/inventory/stock",
  services: "/dashboard/service-categories/services",
  "service-packages": "/dashboard/package-categories",
  promotions: "/dashboard/promotions",
  "promotions-list": "/dashboard/promotions",
  "promotion-types": "/dashboard/promotions/promotion-types",
  "promotions-history": "/dashboard/promotions/history",
  pricing: "/dashboard/price-table",
  suppliers: "/dashboard/supplier",
  pos: "/dashboard/pos",
  invoices: "/dashboard/sales-management/invoices",
  "draft-invoices": "/dashboard/sales-management/draft-invoices",
  returns: "/dashboard/sales-management/returns",
  "general-info": "/dashboard/general-information",
  branches: "/dashboard/branches",
  "service-bays": "/dashboard/bay",
};
