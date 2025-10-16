"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Image, Layout, MenuProps, Tooltip } from "antd";
import {
  adminMenuItems,
  menuKeyToPath,
} from "@/components/utils/data/admin.menu.data";
import { useRouter, usePathname } from "next/navigation";
import { useSiderContext } from "@/components/providers/SiderContext";
import ClientOnlyMenu from "./ClientOnlyMenu";

type MenuItem = Required<MenuProps>["items"][number];
const { Sider } = Layout;

const AdminSider = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { collapsed } = useSiderContext();

  // Tính toán selectedKeys và openKeys dựa trên pathname hiện tại
  const { selectedKeys, openKeys } = useMemo(() => {
    const currentKey = Object.keys(menuKeyToPath).find(
      (key) => menuKeyToPath[key] === pathname
    );

    // Tìm parent keys cho menu 3 cấp
    const parentKeys: string[] = [];

    if (currentKey) {
      // Tìm parent key cấp 1
      const parentKey = adminMenuItems.find(
        (item) =>
          item &&
          "children" in item &&
          item.children?.some((child: MenuItem) => {
            if (child && "children" in child) {
              // Kiểm tra cấp 3
              return child.children?.some(
                (grandChild: MenuItem) => grandChild?.key === currentKey
              );
            }
            return child?.key === currentKey;
          })
      )?.key as string;

      if (parentKey) {
        parentKeys.push(parentKey);

        // Tìm parent key cấp 2 nếu có
        const parentItem = adminMenuItems.find(
          (item) => item?.key === parentKey
        );
        if (parentItem && "children" in parentItem) {
          const secondLevelParent = parentItem.children?.find(
            (child: MenuItem) =>
              child &&
              "children" in child &&
              child.children?.some(
                (grandChild: MenuItem) => grandChild?.key === currentKey
              )
          )?.key as string;

          if (secondLevelParent) {
            parentKeys.push(secondLevelParent);
          }
        }
      }
    }

    return {
      selectedKeys: currentKey ? [currentKey] : [],
      openKeys: parentKeys,
    };
  }, [pathname]);

  // State để quản lý menu selection (chỉ dùng cho tương tác)
  const [interactiveSelectedKeys, setInteractiveSelectedKeys] =
    useState<string[]>(selectedKeys);
  const [interactiveOpenKeys, setInteractiveOpenKeys] =
    useState<string[]>(openKeys);

  // Sync selectedKeys với pathname changes, nhưng giữ nguyên openKeys
  useEffect(() => {
    setInteractiveSelectedKeys(selectedKeys);
    // Chỉ cập nhật openKeys nếu chưa có hoặc cần mở submenu cho item hiện tại
    if (openKeys.length > 0) {
      setInteractiveOpenKeys(prevOpenKeys => {
        // Merge openKeys mới với các keys đã mở trước đó
        const newOpenKeys = [...new Set([...prevOpenKeys, ...openKeys])];
        return newOpenKeys;
      });
    }
  }, [selectedKeys, openKeys]);

  // Khởi tạo trạng thái ban đầu khi component mount
  useEffect(() => {
    if (openKeys.length > 0 && interactiveOpenKeys.length === 0) {
      setInteractiveOpenKeys(openKeys);
    }
  }, []);

  // Xử lý khi click vào menu item
  const handleMenuClick = ({ key }: { key: string }) => {
    const path = menuKeyToPath[key];
    if (path) {
      router.push(path);
      setInteractiveSelectedKeys([key]);
    }
  };

  // Xử lý khi mở/đóng submenu
  const handleOpenChange = (keys: string[]) => {
    // Chỉ cập nhật khi user thực sự tương tác với menu
    setInteractiveOpenKeys(keys);
  };

  return (
    <Sider
      breakpoint="xl"
      collapsedWidth="80"
      width="22rem"
      collapsed={collapsed}
      style={{
        height: "100vh",
        zIndex: 1000,
        position: "sticky",
        top: 0,
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
        borderRight: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      {/* Logo Section - Fixed */}
      <div
        style={{
          padding: collapsed ? "1rem 0.5rem" : "1rem",
          borderBottom: "1px solid #f0f0f0",
          flexShrink: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {collapsed ? (
          <Tooltip title="Smart Car SPA" placement="right">
            <Image
              src="/images/logo-sider.png"
              alt="Smart Car SPA Logo"
              width={40}
              height={40}
              preview={false}
              style={{
                borderRadius: "8px",
                objectFit: "contain",
                transition: "all 0.2s ease",
              }}
            />
          </Tooltip>
        ) : (
          <Image
            src="/images/logo-sider.png"
            alt="Smart Car SPA Logo"
            width={"8rem"}
            height={"auto"}
            preview={false}
            style={{
              margin: "0 auto",
              width: "8rem",
              height: "auto",
              transition: "all 0.2s ease",
            }}
          />
        )}
      </div>

      {/* Menu Section - Scrollable */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: collapsed ? "0.5rem" : "1rem",
          height: "calc(100vh - 120px)",
          maxHeight: "calc(100vh - 120px)",
        }}
        className="custom-scrollbar"
      >
        <ClientOnlyMenu
          mode="inline"
          selectedKeys={interactiveSelectedKeys}
          openKeys={collapsed ? [] : interactiveOpenKeys}
          items={adminMenuItems}
          onClick={handleMenuClick}
          onOpenChange={handleOpenChange}
          style={{
            fontSize: collapsed ? "1rem" : "0.9rem",
            border: "none",
            backgroundColor: "transparent",
            height: "auto",
            minHeight: "100%",
          }}
          theme="light"
          suppressHydrationWarning={true}
          inlineCollapsed={collapsed}
        />
      </div>
    </Sider>
  );
};

export default AdminSider;
