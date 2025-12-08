"use client";
import React from "react";
import { Modal, Button, Space } from "antd";
import { LoginOutlined, UserOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

interface LoginRequiredModalProps {
  open: boolean;
  onCancel: () => void;
  title?: string;
  message?: string;
  redirectPath?: string;
}

const LoginRequiredModal: React.FC<LoginRequiredModalProps> = ({
  open,
  onCancel,
  title = "Yêu cầu đăng nhập",
  message = "Bạn cần đăng nhập để sử dụng tính năng này.",
  redirectPath = "/auth/login",
}) => {
  const router = useRouter();

  const handleLogin = () => {
    // Lưu đường dẫn hiện tại để redirect sau khi đăng nhập
    if (typeof window !== "undefined") {
      document.cookie = `redirect_after_login=${window.location.pathname}; max-age=300; path=/`;
    }
    router.push(redirectPath);
    onCancel();
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <UserOutlined style={{ color: "#1890ff" }} />
          {title}
        </div>
      }
      open={open}
      onCancel={handleCancel}
      footer={
        <Space>
          <Button onClick={handleCancel}>Hủy</Button>
          <Button type="primary" icon={<LoginOutlined />} onClick={handleLogin}>
            Đăng nhập
          </Button>
        </Space>
      }
      centered
      width={400}
    >
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <p style={{ fontSize: "16px", marginBottom: "16px" }}>{message}</p>
        <p style={{ color: "#666", fontSize: "14px" }}>
          Sau khi đăng nhập, bạn sẽ được chuyển về trang này.
        </p>
      </div>
    </Modal>
  );
};

export default LoginRequiredModal;
