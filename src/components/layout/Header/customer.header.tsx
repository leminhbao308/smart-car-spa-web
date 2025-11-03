"use client";
import {
  MenuOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  Col,
  Divider,
  Drawer,
  Image,
  Menu,
  MenuProps,
  Row,
  Space,
} from "antd";
import { Header } from "antd/es/layout/layout";
import Link from "next/link";
import { useState, useEffect } from "react";
import { menuItems } from "@/components/utils/data/menu.data";
import { AccountPopup } from "@/components/ui/AccountPopup";
import { LoginRequiredModal } from "@/components/ui/Modal/LoginRequiredModal";
import { useAuth } from "@/lib/api/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";

// Định nghĩa type cho menu items
export interface MenuItem {
  key: string;
  label: string;
  children?: MenuItem[];
}

interface CustomerHeaderProps {
  isLoginPage?: boolean;
}

const CustomerHeader = ({ isLoginPage = false }: CustomerHeaderProps) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { cartSummary } = useCart();

  // Tự động đóng drawer khi màn hình từ 768px trở lên
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && drawerVisible) {
        setDrawerVisible(false);
      }
    };

    // Thêm event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [drawerVisible]);

  // Xử lý click menu item
  const handleMenuClick = (key: string) => {
    if (key === "booking") {
      if (isAuthenticated) {
        // Nếu đã đăng nhập, chuyển đến trang booking
        router.push("/member/booking");
      } else {
        // Nếu chưa đăng nhập, hiển thị modal yêu cầu đăng nhập
        setLoginModalVisible(true);
      }
    } else if (key === "aboutUs") {
      // Chuyển đến trang về chúng tôi
      router.push("/about");
    } else if (key === "shop") {
      // Chuyển đến trang sản phẩm
      router.push("/products");
    } else {
      // Các menu item khác có thể xử lý tương tự nếu cần
      console.log("Menu clicked:", key);
    }
  };

  // Chuyển đổi menu items sang format của Ant Design, giữ nguyên children cho submenu
  const antdMenuItems: MenuProps["items"] = menuItems.map((item) => ({
    key: item.key,
    label: item.label,
    children: item.children?.map((subItem) => ({
      key: subItem.key,
      label: subItem.label,
      onClick: () => handleMenuClick(subItem.key),
    })),
    onClick: () => handleMenuClick(item.key),
  }));

  return (
    <Header
      style={{
        width: "100%",
        zIndex: 1000,
        backgroundColor: "transparent",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        height: "fit-content",
        paddingRight: "0px",
        paddingLeft: "0px",
      }}
    >
      <Row
        align="middle"
        justify="space-between"
        style={{
          height: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 16px",
        }}
      >
        {/* Menu Button - Mobile - hiển thị dưới 768px */}
        <Col
          xs={4}
          md={0}
        >
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setDrawerVisible(true)}
            style={{
              fontSize: "18px",
              color: isLoginPage ? "#F4F7FE" : undefined,
            }}
          />
        </Col>

        {/* Logo - responsive cho tất cả thiết bị */}
        <Col
          xs={16}
          md={4}
          style={{ textAlign: "center", padding: "10px 0px" }}
        >
          <Link href="/">
            <Image
              src="/images/Main Logo_Light.png"
              alt="Smart Car SPA Logo"
              width={90}
              style={{
                maxWidth: "100%",
                height: "auto",
                objectFit: "contain",
              }}
              preview={false}
            />
          </Link>
        </Col>

        {/* Menu - Desktop - hiển thị từ 768px trở lên */}
        <Col
          xs={0}
          md={16}
        >
          <Menu
            mode="horizontal"
            items={antdMenuItems}
            style={{
              justifyContent: "center",
              borderBottom: "none",
              background: "transparent",
              fontSize: "1rem",
              fontWeight: 500,
            }}
            overflowedIndicator={null}
          />
        </Col>

        {/* Cart Icon - responsive cho tất cả thiết bị */}
        <Col
          xs={4}
          md={4}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Row
            gutter={8}
            style={{ width: "100%" }}
          >
            <Col
              xs={24}
              sm={24}
              md={12}
              style={{
                display: "flex",
                justifyContent: "flex-end",
                paddingRight: "8px",
              }}
            >
              <Badge
                count={cartSummary.itemCount}
                showZero
                offset={[-8, 8]}
                style={{ boxShadow: "0 0 0 1px #fff" }}
              >
                <Button
                  type="text"
                  icon={<ShoppingCartOutlined />}
                  style={{
                    fontSize: "2rem",
                  }}
                  onClick={() => router.push("/cart")}
                />
              </Badge>
            </Col>
            <Col
              xs={0}
              sm={0}
              md={12}
              style={{
                display: "flex",
                justifyContent: "flex-start",
                paddingLeft: "8px",
              }}
            >
              <AccountPopup>
                <Button
                  type="text"
                  icon={<UserOutlined />}
                  style={{
                    fontSize: "2rem",
                  }}
                />
              </AccountPopup>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Drawer - Mobile */}
      <Drawer
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={280}
        styles={{
          body: { padding: 0 },
          header: {
            display: "flex",
            justifyContent: "flex-end",
          },
        }}
        closable={true}
      >
        {/* Menu */}
        <Menu
          mode="inline"
          items={antdMenuItems}
          style={{ border: "none" }}
        />
        <Divider style={{ marginTop: "10px", marginBottom: "10px" }} />
        {/* Account */}
        <Space
          style={{
            paddingLeft: "28px",
          }}
        >
          <AccountPopup>
            <Button
              type="text"
              style={{
                fontSize: "14px",
                color: "#1B2559",
                fontWeight: 500,
                padding: "4px 8px",
                height: "auto",
              }}
            >
              Tài khoản
            </Button>
          </AccountPopup>
        </Space>
      </Drawer>

      {/* Login Required Modal */}
      <LoginRequiredModal
        open={loginModalVisible}
        onCancel={() => setLoginModalVisible(false)}
        title="Yêu cầu đăng nhập"
        message="Bạn cần đăng nhập để đặt lịch chăm sóc xe."
        redirectPath="/auth/login"
      />
    </Header>
  );
};

export default CustomerHeader;
