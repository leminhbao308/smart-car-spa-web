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
    key: "product-management",
    label: "Danh mục sản phẩm",
    icon: React.createElement(AppstoreOutlined),
    children: [
      {
        key: "product-categories",
        label: "Loại sản phẩm",
        icon: React.createElement(AppstoreOutlined),
      },
      {
        key: "products",
        label: "Sản phẩm",
        icon: React.createElement(BarcodeOutlined),
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
      {
        key: "export-inventory",
        label: "Xuất kho",
        icon: React.createElement(ExportOutlined),
      },
    ],
  },
  {
    key: "service-management",
    label: "Danh mục dịch vụ & gói dịch vụ",
    icon: React.createElement(ToolOutlined),
    children: [
      {
        key: "service-categories",
        label: "Danh mục dịch vụ",
        icon: React.createElement(ToolOutlined),
        children: [
          {
            key: "service-types",
            label: "Loại dịch vụ",
            icon: React.createElement(ToolOutlined),
          },
          {
            key: "services",
            label: "Dịch vụ",
            icon: React.createElement(ToolOutlined),
          },
        ],
      },
      {
        key: "service-packages",
        label: "Gói dịch vụ",
        icon: React.createElement(ShoppingCartOutlined),
      },
    ],
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
        key: "pos",
        label: "Bán hàng (POS)",
        icon: React.createElement(BarcodeOutlined),
      },
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
    ],
  },
];

// Mapping từ key đến path
export const menuKeyToPath: Record<string, string> = {
  dashboard: "/dashboard",
  bookings: "/dashboard/bookings",
  "customer-service": "/dashboard/customer-service",
  "care-processes": "/dashboard/care-processes",
  "vehicles-in-care": "/dashboard/vehicles-in-care",
  permissions: "/dashboard/permissions",
  employees: "/dashboard/staff",
  customers: "/dashboard/members",
  "vehicle-records": "/dashboard/car-profiles",
  brands: "/dashboard/vehicle-brands",
  types: "/dashboard/vehicle-types",
  models: "/dashboard/vehicle-models",
  "product-categories": "/dashboard/product-categories",
  products: "/dashboard/products",
  "import-inventory": "/dashboard/inventory/import",
  "export-inventory": "/dashboard/inventory/export",
  "service-types": "/dashboard/service-categories/service-types",
  services: "/dashboard/service-categories/services",
  "service-packages": "/dashboard/package-categories",
  promotions: "/dashboard/promotions",
  "promotions-list": "/dashboard/promotions",
  "promotion-types": "/dashboard/promotions/promotion-types",
  "promotions-history": "/dashboard/promotions/history",
  pricing: "/dashboard/price-table",
  suppliers: "/dashboard/supplier",
  pos: "/dashboard/sales-management/pos",
  invoices: "/dashboard/sales-management/invoices",
  "draft-invoices": "/dashboard/sales-management/draft-invoices",
  returns: "/dashboard/sales-management/returns",
  "general-info": "/dashboard/general-information",
  branches: "/dashboard/branches",
};
