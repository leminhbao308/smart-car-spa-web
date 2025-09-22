"use client";
import React from "react";
import { Layout, Typography, Row, Col, Space, Divider } from "antd";
import { FacebookOutlined, InstagramOutlined } from "@ant-design/icons";
import Image from "next/image";

const { Footer } = Layout;
const { Text, Title } = Typography;

const CustomerFooter: React.FC = () => {
  return (
    <Footer
      style={{
        backgroundColor: "#2D3038",
        color: "#FFFFFF",
        padding: "40px 20px 20px",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Logo và Tagline */}
        <div style={{ marginBottom: "32px" }}>
          {/* Logo */}
          <div
            style={{
              width: "100%",
              height: "80px",
              margin: "0 auto 16px",
              position: "relative",
              display: "flex",
              alignItems: " center",
              gap: "2rem",
            }}
          >
            <Image
              src="/images/Main Logo - Design.png"
              alt="Smart Car Spa Logo"
              width={100}
              height={100}
              style={{ objectFit: "contain" }}
            />
            <Title
              level={4}
              style={{
                color: "#FFFFFF",
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "16px",
                textAlign: "left",
              }}
            >
              SMART CAR SPA - CHUỖI TRUNG TÂM CHĂM SÓC XE CHUYÊN NGHIỆP
            </Title>
          </div>
        </div>

        {/* Social Media Section */}
        <div style={{ marginBottom: "32px", textAlign: "left" }}>
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: "500",
              display: "block",
              marginBottom: "16px",
            }}
          >
            MẠNG XÃ HỘI
          </Text>

          <Space size="large">
            {/* Facebook Icon */}
            <div
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: "#1877F2",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <FacebookOutlined
                style={{ color: "#FFFFFF", fontSize: "20px" }}
              />
            </div>

            {/* Instagram Icon */}
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "2px solid #FFFFFF",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <InstagramOutlined
                style={{ color: "#FFFFFF", fontSize: "20px" }}
              />
            </div>
          </Space>
        </div>
        <Divider />
        {/* Copyright */}
        <div style={{ textAlign: "center" }}>
          <Text
            style={{
              color: "#A0A3BD",
              fontSize: "1rem",
              lineHeight: "1.5",
            }}
          >
            © 2025 Smart Car Spa. All Rights Reserved. Made with love by{" "}
            <Text
              style={{
                color: "#A0A3BD",
                fontWeight: "bold",
              }}
            >
              Hoang Nam & Minh Bao
            </Text>
          </Text>
        </div>
      </div>
    </Footer>
  );
};

export default CustomerFooter;
