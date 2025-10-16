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
  SettingOutlined,
  UndoOutlined,
  ClockCircleOutlined,
  ImportOutlined,
  ContainerOutlined,
  HomeOutlined,
  DatabaseOutlined,
  IdcardOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";

type MenuItem = Required<MenuProps>["items"][number];

export const adminMenuItems: MenuItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: React.createElement(DashboardOutlined),
  },
  {
    key: "transactions",
    label: "Quản Lý Transactions",
    icon: React.createElement(ThunderboltOutlined),
    children: [
      {
        key: "car-service-management",
        label: "Chăm sóc xe",
        icon: React.createElement(CarOutlined),
        children: [
          {
            key: "bookings",
            label: "Quản Lý Đặt Lịch Chăm Sóc Xe",
            icon: React.createElement(ContainerOutlined),
          },
          {
            key: "vehicles-in-care",
            label: "Quản Lý Xe Đang Chăm Sóc",
            icon: React.createElement(CarOutlined),
          },
        ],
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
            key: "returns",
            label: "Hoàn trả hàng",
            icon: React.createElement(UndoOutlined),
          },
        ],
      },
      {
        key: "inventory-management",
        label: "Quản lý kho",
        icon: React.createElement(DatabaseOutlined),
        children: [
          {
            key: "import-inventory",
            label: "Nhập kho",
            icon: React.createElement(ImportOutlined),
          },
          {
            key: "stock-inventory",
            label: "Tồn kho",
            icon: React.createElement(HomeOutlined),
          },
        ],
      },
    ],
  },

  {
    key: "masterdata",
    label: "Quản Lý Masterdata",
    icon: React.createElement(SettingOutlined),
    children: [
      {
        key: "user-management",
        label: "Quản Lý Người Dùng & Quyền",
        icon: React.createElement(UserOutlined),
        children: [
          {
            key: "permissions",
            label: "Quản Lý Phân Quyền",
            icon: React.createElement(SafetyOutlined),
          },
          {
            key: "employees",
            label: "Quản Lý Nhân Viên",
            icon: React.createElement(IdcardOutlined),
          },
          {
            key: "customers",
            label: "Quản Lý Khách Hàng Và Xe",
            icon: React.createElement(CustomerServiceOutlined),
          },
        ],
      },
      {
        key: "category-management",
        label: "Quản Lý Danh Mục",
        icon: React.createElement(AppstoreOutlined),
      },
      {
        key: "pricing",
        label: "Quản Lý Bảng Giá",
        icon: React.createElement(DollarOutlined),
      },
      {
        key: "promotions",
        label: "Quản Lý Chương Trình Khuyến Mãi",
        icon: React.createElement(GiftOutlined),
        children: [
          {
            key: "promotions-list",
            label: "Danh Sách Khuyến Mãi",
            icon: React.createElement(GiftOutlined),
          },
          {
            key: "promotions-history",
            label: "Lịch Sử Sử Dụng Khuyến Mãi",
            icon: React.createElement(ClockCircleOutlined),
          },
        ],
      },
      {
        key: "product-management",
        label: "Quản lý sản phẩm",
        icon: React.createElement(BarcodeOutlined),
        children: [
          {
            key: "products",
            label: "Sản Phẩm",
            icon: React.createElement(BarcodeOutlined),
          },
          {
            key: "product-types",
            label: "Loại Sản Phẩm",
            icon: React.createElement(AppstoreOutlined),
          },
          {
            key: "product-attributes",
            label: "Thuộc Tính Sản Phẩm",
            icon: React.createElement(SettingOutlined),
          },
        ],
      },
      {
        key: "suppliers",
        label: "Quản Lý Nhà Cung Cấp",
        icon: React.createElement(ShopOutlined),
      },
      {
        key: "service-management",
        label: "Quản Lý Dịch Vụ",
        icon: React.createElement(ToolOutlined),
        children: [
          {
            key: "service-types",
            label: "Quản Lý Loại Dịch Vụ",
            icon: React.createElement(AppstoreOutlined),
          },
          {
            key: "services",
            label: "Danh Sách Dịch Vụ",
            icon: React.createElement(ToolOutlined),
          },
        ],
      },

      {
        key: "vehicle-info",
        label: "Quản Lý Thông Tin Phương Tiện",
        icon: React.createElement(CarOutlined),
        children: [
          {
            key: "models",
            label: "Quản Lý Model Xe",
            icon: React.createElement(CarOutlined),
          },
          {
            key: "brands",
            label: "Quản Lý Hãng Xe",
            icon: React.createElement(CarOutlined),
          },
          {
            key: "types",
            label: "Quản Lý Loại Xe",
            icon: React.createElement(CarOutlined),
          },
        ],
      },
      {
        key: "centers",
        label: "Quản Lý Trung Tâm",
        icon: React.createElement(BankOutlined),
        children: [
          {
            key: "general-info",
            label: "Quản Lý Thông Tin Chung Của Trung Tâm",
            icon: React.createElement(InfoCircleOutlined),
          },
          {
            key: "branches",
            label: "Quản Lý Chi Nhánh",
            icon: React.createElement(BranchesOutlined),
          },
          {
            key: "service-bays",
            label: "Quản Lý Khu Vực Dịch Vụ",
            icon: React.createElement(ToolOutlined),
          },
        ],
      },
    ],
  },
];

// Mapping từ key đến path
export const menuKeyToPath: Record<string, string> = {
  dashboard: "/dashboard",
  bookings: "/dashboard/bookings",
  "category-management": "/dashboard/category-management",
  permissions: "/dashboard/permissions",
  employees: "/dashboard/staff",
  customers: "/dashboard/members",
  brands: "/dashboard/vehicle-brands",
  types: "/dashboard/vehicle-types",
  models: "/dashboard/vehicle-models",
  "product-types": "/dashboard/product-types",
  products: "/dashboard/products",
  "product-attributes": "/dashboard/product-attributes",
  "import-inventory": "/dashboard/inventory/import",
  "stock-inventory": "/dashboard/inventory/stock",
  "service-types": "/dashboard/service-categories/service-types",
  services: "/dashboard/service-categories/services",
  promotions: "/dashboard/promotions",
  "promotions-list": "/dashboard/promotions",
  "promotions-history": "/dashboard/promotions/history",
  pricing: "/dashboard/price-table",
  suppliers: "/dashboard/supplier",
  pos: "/dashboard/pos",
  invoices: "/dashboard/sales-management/invoices",
  returns: "/dashboard/sales-management/returns",
  "general-info": "/dashboard/general-information",
  branches: "/dashboard/branches",
  "service-bays": "/dashboard/bay",
};
