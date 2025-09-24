"use client";
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  DashboardOutlined,
  LoginOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Dropdown, Space, Typography, Divider } from "antd";
import type { MenuProps } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/api/hooks/useAuth";
import { UserInfo } from "@/lib/api/types";
import { ROUTES } from "@/components/utils/constant/path.route";

const { Text } = Typography;

interface AccountPopupProps {
  children: React.ReactNode;
}

const AccountPopup = ({ children }: AccountPopupProps) => {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Menu items for authenticated users
  const authenticatedMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: (
        <div style={{ padding: "8px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Avatar
              size={40}
              icon={<UserOutlined />}
              src={user?.avatar}
              style={{ backgroundColor: "#1890ff" }}
            />
            <div>
              <div style={{ fontWeight: 500, fontSize: "14px" }}>
                {user?.full_name}
              </div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {user?.email}
              </Text>
            </div>
          </div>
        </div>
      ),
      disabled: true,
    },
    {
      type: "divider",
    },
    {
      key: "profile-settings",
      icon: <SettingOutlined />,
      label: "Thông tin cá nhân",
      onClick: () => {
        // Navigate to profile page
        router.push(ROUTES.MEMBER_PROFILE);
      },
    },
    ...(user?.role?.role_code === "admin"
      ? [
          {
            type: "divider" as const,
          },
          {
            key: "admin-dashboard",
            icon: <DashboardOutlined />,
            label: "Truy cập Admin",
            onClick: () => {
              router.push(ROUTES.DASHBOARD);
            },
          },
        ]
      : []),
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
      onClick: handleLogout,
    },
  ];

  // Menu items for non-authenticated users
  const nonAuthenticatedMenuItems: MenuProps["items"] = [
    {
      key: "login",
      icon: <LoginOutlined />,
      label: "Đăng nhập",
      onClick: () => {
        router.push(ROUTES.LOGIN);
      },
    },
    {
      key: "signup",
      icon: <UserAddOutlined />,
      label: "Đăng ký",
      onClick: () => {
        router.push(ROUTES.SIGNUP);
      },
    },
  ];

  const menuItems = isAuthenticated
    ? authenticatedMenuItems
    : nonAuthenticatedMenuItems;

  return (
    <Dropdown
      menu={{ items: menuItems }}
      placement="bottomRight"
      trigger={["click", "hover"]}
      overlayStyle={{ minWidth: "200px" }}
    >
      {children}
    </Dropdown>
  );
};

export default AccountPopup;
