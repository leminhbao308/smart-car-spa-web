"use client";
import {
  Breadcrumb,
  Input,
  Space,
  Avatar,
  Button,
  Typography,
  Dropdown,
} from "antd";
import { Header } from "antd/es/layout/layout";
import {
  SearchOutlined,
  BellOutlined,
  MoonOutlined,
  InfoCircleOutlined,
  UserOutlined,
  HomeOutlined,
  DownOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { usePathname } from "next/navigation";
import { useSiderContext } from "@/components/providers/SiderContext";

const { Title, Text } = Typography;

const AdminHeader = () => {
  const pathname = usePathname();
  const { collapsed, toggleCollapsed } = useSiderContext();

  // Function to generate breadcrumb items based on pathname
  const generateBreadcrumbItems = () => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const items: Array<{ title: string | React.ReactNode; href?: string }> = [
      {
        title: (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              color: "rgba(0, 0, 0, 0.6)",
            }}
          >
            <HomeOutlined
              style={{ fontSize: "14px", color: "rgba(0, 0, 0, 0.6)" }}
            />
            <span style={{ color: "rgba(0, 0, 0, 0.6)" }}>Trang chủ</span>
          </div>
        ),
        href: "/dashboard",
      },
    ];

    // Map path segments to readable titles
    const pathMap: { [key: string]: string } = {
      dashboard: "Dashboard",
      "customer-service": "Chăm sóc khách hàng",
      bookings: "Đặt lịch",
      members: "Thành viên",
      staff: "Nhân viên",
      branches: "Chi nhánh",
      "general-information": "Thông tin chung",
      permissions: "Phân quyền",
      "package-categories": "Danh mục gói",
      "service-categories": "Danh mục dịch vụ",
      "service-types": "Loại dịch vụ",
      "services": "Dịch vụ",
      "service-packages": "Gói dịch vụ",
      "car-profiles": "Hồ sơ xe",
      "care-processes": "Quy trình chăm sóc",
      "price-table": "Bảng giá",
      "product-categories": "Danh mục sản phẩm",
      promotions: "Khuyến mãi",
      supplier: "Nhà cung cấp",
      "vehicle-brands": "Thương hiệu xe",
      "vehicle-models": "Mẫu xe",
      "vehicle-types": "Loại xe",
      "vehicles-in-care": "Xe đang chăm sóc",
      "sales-management": "Quản lý bán hàng",
      pos: "Bán hàng (POS)",
      invoices: "Hóa đơn",
      "invoice-details": "Chi tiết hóa đơn",
      "draft-invoices": "Hóa đơn tạm",
      "draft-details": "Chi tiết hóa đơn tạm",
      returns: "Hoàn trả hàng",
      refunds: "Xử lý hoàn tiền",
    };

    pathSegments.forEach((segment, index) => {
      if (segment !== "admin") {
        const title =
          pathMap[segment] ||
          segment.charAt(0).toUpperCase() + segment.slice(1);
        const isLast = index === pathSegments.length - 1;

        if (isLast) {
          items.push({
            title: title,
          });
        } else {
          items.push({
            title: title,
            href: `/${pathSegments.slice(0, index + 1).join("/")}`,
          });
        }
      }
    });

    return items;
  };

  // Function to get page title based on current path
  const getPageTitle = () => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];

    const titleMap: { [key: string]: string } = {
      dashboard: "Dashboard",
      "customer-service": "Chăm sóc khách hàng",
      bookings: "Quản lý đặt lịch",
      members: "Quản lý thành viên",
      staff: "Quản lý nhân viên",
      branches: "Quản lý chi nhánh",
      "general-information": "Thông tin chung",
      permissions: "Phân quyền",
      "package-categories": "Danh mục gói dịch vụ",
      "service-categories": "Danh mục dịch vụ",
      "car-profiles": "Hồ sơ xe",
      "care-processes": "Quy trình chăm sóc",
      "price-table": "Bảng giá dịch vụ",
      "product-categories": "Danh mục sản phẩm",
      promotions: "Quản lý khuyến mãi",
      supplier: "Nhà cung cấp",
      "vehicle-brands": "Thương hiệu xe",
      "vehicle-models": "Mẫu xe",
      "vehicle-types": "Loại xe",
      "vehicles-in-care": "Xe đang chăm sóc",
      "sales-management": "Quản lý bán hàng",
      pos: "Bán hàng (Point of Sale)",
      invoices: "Quản lý hóa đơn",
      "invoice-details": "Chi tiết hóa đơn",
      "draft-invoices": "Quản lý hóa đơn tạm",
      "draft-details": "Chi tiết hóa đơn tạm",
      returns: "Quản lý hoàn trả hàng",
      refunds: "Xử lý hoàn tiền",
    };

    return titleMap[lastSegment] || "Dashboard";
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
    },
    {
      key: "settings",
      icon: <InfoCircleOutlined />,
      label: "Cài đặt",
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      label: "Đăng xuất",
      danger: true,
    },
  ];

  return (
    <Header
      style={{
        width: "100%",
        padding: "16px 24px",
        margin: "16px 0",
        position: "sticky",
        top: 0,
        zIndex: 900,
        background:
          "linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(248, 250, 252, 0.9) 100%)",
        height: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        borderBottom: "1px solid rgba(0,0,0,0.05)",
        backdropFilter: "blur(10px)",
        borderRadius: "16px",
        border: "1px solid rgba(0,0,0,0.05)",
      }}
    >
      {/* Phần bên trái - Toggle Button, Breadcrumb và Title */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
        {/* Toggle Button */}
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleCollapsed}
          style={{
            fontSize: "18px",
            color: "rgba(0, 0, 0, 0.6)",
            borderRadius: "8px",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
            marginTop: "8px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.05)";
            e.currentTarget.style.color = "rgba(0, 0, 0, 0.8)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "rgba(0, 0, 0, 0.6)";
          }}
        />

        {/* Breadcrumb và Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* Breadcrumb */}
          <Breadcrumb
            style={{
              fontSize: "13px",
              color: "rgba(0, 0, 0, 0.6)",
            }}
            separator=">"
            items={generateBreadcrumbItems()}
          />

          {/* Title chính */}
          <Title
            level={2}
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: 700,
              color: "rgba(0, 0, 0, 0.85)",
              textShadow: "0 2px 8px rgba(0,0,0,0.1)",
              background:
                "linear-gradient(45deg, rgba(0,0,0,0.9), rgba(30,41,59,0.8))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {getPageTitle()}
          </Title>
        </div>
      </div>

      {/* Phần bên phải - Search, Icons, Avatar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          backgroundColor: "rgba(255, 255, 255, 0.6)",
          padding: "10px 20px",
          borderRadius: "30px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          backdropFilter: "blur(25px)",
          border: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        {/* Search Bar */}
        <Input
          placeholder="Tìm kiếm..."
          prefix={<SearchOutlined style={{ color: "rgba(0, 0, 0, 0.5)" }} />}
          style={{
            fontSize: "14px",
            width: "280px",
            border: "none",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            borderRadius: "25px",
            padding: "10px 16px",
            boxShadow: "none",
            color: "rgba(0, 0, 0, 0.8)",
          }}
        />

        {/* Divider */}
        <div
          style={{
            width: "1px",
            height: "28px",
            backgroundColor: "rgba(0,0,0,0.1)",
          }}
        />

        {/* Icons */}
        <Space size="small">
          <Button
            type="text"
            icon={<BellOutlined />}
            style={{
              fontSize: "18px",
              color: "rgba(0, 0, 0, 0.6)",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.05)";
              e.currentTarget.style.color = "rgba(0, 0, 0, 0.8)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "rgba(0, 0, 0, 0.6)";
            }}
          />
          <Button
            type="text"
            icon={<MoonOutlined />}
            style={{
              fontSize: "18px",
              color: "rgba(0, 0, 0, 0.6)",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.05)";
              e.currentTarget.style.color = "rgba(0, 0, 0, 0.8)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "rgba(0, 0, 0, 0.6)";
            }}
          />
        </Space>

        {/* Divider */}
        <div
          style={{
            width: "1px",
            height: "28px",
            backgroundColor: "rgba(0,0,0,0.1)",
          }}
        />

        {/* User Profile */}
        <Dropdown
          menu={{ items: userMenuItems }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: "20px",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <Avatar
              size={40}
              icon={<UserOutlined />}
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                color: "#ffffff",
                border: "2px solid rgba(0,0,0,0.1)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <Text
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "rgba(0, 0, 0, 0.85)",
                  lineHeight: 1.2,
                }}
              >
                Admin User
              </Text>
              <Text
                style={{
                  fontSize: "12px",
                  color: "rgba(0, 0, 0, 0.6)",
                  lineHeight: 1.2,
                }}
              >
                Quản trị viên
              </Text>
            </div>
            <DownOutlined
              style={{
                fontSize: "12px",
                color: "rgba(0, 0, 0, 0.6)",
                marginLeft: "4px",
              }}
            />
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default AdminHeader;
