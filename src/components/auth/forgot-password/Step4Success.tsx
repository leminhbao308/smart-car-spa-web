"use client";
import React from "react";
import { Button, Typography } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import Link from "next/link";

const { Title, Text } = Typography;

const Step4Success: React.FC = () => {
  return (
    <div style={{ textAlign: "center" }}>
      {/* Success Icon */}
      <div
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          backgroundColor: "#52c41a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
        }}
      >
        <CheckCircleOutlined style={{ fontSize: "32px", color: "white" }} />
      </div>

      <Title level={2} style={{ color: "#1B2559", marginBottom: "16px" }}>
        Đặt lại mật khẩu thành công!
      </Title>

      <Text
        style={{
          color: "#8B92A5",
          fontSize: "16px",
          lineHeight: "24px",
          display: "block",
          marginBottom: "32px",
        }}
      >
        Mật khẩu của bạn đã được đặt lại thành công. Bây giờ bạn có thể đăng
        nhập với mật khẩu mới.
      </Text>

      <Link href="/auth/login">
        <Button
          type="primary"
          block
          style={{
            height: "48px",
            borderRadius: "8px",
            backgroundColor: "#3B82F6",
            borderColor: "#3B82F6",
            fontSize: "16px",
            fontWeight: "500",
          }}
        >
          Đăng nhập ngay
        </Button>
      </Link>
    </div>
  );
};

export default Step4Success;

