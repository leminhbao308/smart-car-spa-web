"use client";
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  DashboardOutlined,
  LoginOutlined,
  UserAddOutlined,
  CarOutlined,
  CalendarOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { Avatar, Dropdown, Typography } from "antd";
import type { MenuProps } from "antd";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/api/hooks/useAuth";
import { ROUTES } from "@/components/utils/constant/path.route";
import { useEffect, useState } from "react";
import { AuthService } from "@/lib/api/services/auth.service";

const { Text } = Typography;

interface AccountPopupProps {
  children: React.ReactNode;
}

const AccountPopup = ({ children }: AccountPopupProps) => {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  // Initialize avatar URL from storage first (might be more up-to-date than context)
  const getInitialAvatarUrl = () => {
    try {
      const userFromStorage = AuthService.getCurrentUserFromStorage();
      return userFromStorage?.avatar_url || user?.avatar_url || null;
    } catch {
      return user?.avatar_url || null;
    }
  };
  
  const [avatarUrl, setAvatarUrl] = useState<string | null | undefined>(getInitialAvatarUrl());

  // Listen for avatar updates
  useEffect(() => {
    const handleAvatarUpdate = (event: CustomEvent) => {
      console.log("AccountPopup: Received userAvatarUpdated event", event.detail);
      const updatedUser = event.detail;
      if (updatedUser?.avatar_url && updatedUser.avatar_url.trim() !== "") {
        console.log("AccountPopup: Updating avatar URL from event to:", updatedUser.avatar_url);
        setAvatarUrl(updatedUser.avatar_url);
      }
      
      // Also try to refresh from storage to ensure consistency
      try {
        const userFromStorage = AuthService.getCurrentUserFromStorage();
        console.log("AccountPopup: User from storage after event:", userFromStorage);
        if (userFromStorage?.avatar_url && userFromStorage.avatar_url.trim() !== "") {
          console.log("AccountPopup: Got avatar from storage:", userFromStorage.avatar_url);
          setAvatarUrl(userFromStorage.avatar_url);
        }
      } catch (error) {
        console.log("AccountPopup: Error getting user from storage:", error);
      }
    };
    
    const handleAvatarUrlUpdate = (event: CustomEvent) => {
      console.log("AccountPopup: Received avatarUrlUpdated event", event.detail);
      const { avatar_url } = event.detail;
      if (avatar_url && avatar_url.trim() !== "") {
        console.log("AccountPopup: Updating avatar URL from simple event to:", avatar_url);
        setAvatarUrl(avatar_url);
      }
    };

    window.addEventListener("userAvatarUpdated", handleAvatarUpdate as EventListener);
    window.addEventListener("avatarUrlUpdated", handleAvatarUrlUpdate as EventListener);
    
    return () => {
      window.removeEventListener("userAvatarUpdated", handleAvatarUpdate as EventListener);
      window.removeEventListener("avatarUrlUpdated", handleAvatarUrlUpdate as EventListener);
    };
  }, []);

  // Update avatar when user changes or component mounts
  useEffect(() => {
    console.log("AccountPopup: User changed, avatar_url from context:", user?.avatar_url);
    
    // Priority 1: Try to get from user context
    if (user?.avatar_url && user.avatar_url.trim() !== "") {
      console.log("AccountPopup: Setting avatar from context:", user.avatar_url);
      setAvatarUrl(user.avatar_url);
      return;
    }
    
    // Priority 2: Fallback to storage (which might be more up-to-date)
    try {
      const userFromStorage = AuthService.getCurrentUserFromStorage();
      console.log("AccountPopup: User from storage:", userFromStorage);
      console.log("AccountPopup: Avatar URL from storage:", userFromStorage?.avatar_url);
      console.log("AccountPopup: Avatar URL type:", typeof userFromStorage?.avatar_url);
      console.log("AccountPopup: Avatar URL truthy check:", !!userFromStorage?.avatar_url);
      
      if (userFromStorage?.avatar_url && userFromStorage.avatar_url.trim() !== "") {
        console.log("AccountPopup: Setting avatar from storage:", userFromStorage.avatar_url);
        setAvatarUrl(userFromStorage.avatar_url);
        return;
      } else {
        console.log("AccountPopup: Avatar URL from storage is empty or invalid:", userFromStorage?.avatar_url);
      }
    } catch (error) {
      console.log("AccountPopup: Error getting user from storage:", error);
    }
    
    // If still no avatar, set to undefined/null
    console.log("AccountPopup: No avatar found, setting to null");
    setAvatarUrl(null);
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.warn("Logout completed with warnings:", error);
      // Still redirect even if there are warnings
      router.push("/");
    }
  };


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

  // Create menu items with avatar URL - this ensures it updates when avatarUrl changes
  const menuItems = isAuthenticated
    ? [
        {
          key: "profile",
          label: (
            <div style={{ padding: "8px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Avatar
                  size={40}
                  icon={<UserOutlined />}
                  src={avatarUrl && avatarUrl.trim() !== "" ? avatarUrl : undefined}
                  style={{ backgroundColor: "#1890ff" }}
                  onError={() => {
                    console.log("AccountPopup: Avatar image failed to load:", avatarUrl);
                    setAvatarUrl(null);
                    return false;
                  }}
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
          type: "divider" as const,
        },
        {
          key: "profile-settings",
          icon: <SettingOutlined />,
          label: "Thông tin cá nhân",
          onClick: () => {
            router.push(ROUTES.MEMBER_PROFILE);
          },
        },
        {
          key: "vehicle-management",
          icon: <CarOutlined />,
          label: "Quản lý xe",
          onClick: () => {
            router.push("/member/vehicle");
          },
        },
        {
          key: "booking",
          icon: <CalendarOutlined />,
          label: "Đặt lịch",
          onClick: () => {
            router.push("/member/booking");
          },
        },
        {
          key: "booking-history",
          icon: <HistoryOutlined />,
          label: "Lịch sử đặt lịch",
          onClick: () => {
            router.push("/member/booking-list");
          },
        },
        ...(user?.role?.role_code === "ADMIN"
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
          type: "divider" as const,
        },
        {
          key: "logout",
          icon: <LogoutOutlined />,
          label: "Đăng xuất",
          danger: true,
          onClick: handleLogout,
        },
      ]
    : nonAuthenticatedMenuItems;

  return (
    <Dropdown
      menu={{ items: menuItems }}
      placement="bottomRight"
      trigger={["click", "hover"]}
      overlayStyle={{ minWidth: "200px" }}
      key={avatarUrl || "no-avatar"} // Force re-render when avatar changes
    >
      {children}
    </Dropdown>
  );
};

export default AccountPopup;
