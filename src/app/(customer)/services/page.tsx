"use client";
import React from "react";
import { Typography, Card, Row, Col, Button } from "antd";
import { CarOutlined, ToolOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

export default function ServicesPage() {
  const services = [
    {
      id: 1,
      title: "Rửa xe cơ bản",
      description: "Dịch vụ rửa xe cơ bản với chất lượng cao",
      icon: <CarOutlined style={{ fontSize: "24px", color: "#1890ff" }} />,
      price: "50,000 VNĐ",
    },
    {
      id: 2,
      title: "Rửa xe cao cấp",
      description: "Dịch vụ rửa xe cao cấp với wax và đánh bóng",
      icon: <ToolOutlined style={{ fontSize: "24px", color: "#52c41a" }} />,
      price: "100,000 VNĐ",
    },
    {
      id: 3,
      title: "Bảo dưỡng định kỳ",
      description: "Dịch vụ bảo dưỡng định kỳ cho xe của bạn",
      icon: <ToolOutlined style={{ fontSize: "24px", color: "#52c41a" }} />,
      price: "200,000 VNĐ",
    },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <Title level={1} style={{ color: "#1B2559", marginBottom: "16px" }}>
          Dịch vụ của chúng tôi
        </Title>
        <Paragraph
          style={{
            fontSize: "16px",
            color: "#8B92A5",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          Chúng tôi cung cấp các dịch vụ chăm sóc xe hơi chuyên nghiệp với chất
          lượng cao và giá cả hợp lý
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        {services.map((service) => (
          <Col xs={24} sm={12} lg={8} key={service.id}>
            <Card
              hoverable
              style={{
                height: "100%",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                border: "1px solid #E5E7EB",
              }}
              styles={{ body: { padding: "24px" } }}
            >
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                {service.icon}
              </div>

              <Title
                level={3}
                style={{
                  textAlign: "center",
                  marginBottom: "12px",
                  color: "#1B2559",
                }}
              >
                {service.title}
              </Title>

              <Paragraph
                style={{
                  textAlign: "center",
                  color: "#8B92A5",
                  marginBottom: "20px",
                }}
              >
                {service.description}
              </Paragraph>

              <div style={{ textAlign: "center" }}>
                <Title
                  level={4}
                  style={{ color: "#6C7BEA", marginBottom: "16px" }}
                >
                  {service.price}
                </Title>

                <Button
                  type="primary"
                  size="large"
                  style={{
                    backgroundColor: "#6C7BEA",
                    border: "none",
                    borderRadius: "8px",
                    height: "40px",
                    padding: "0 24px",
                  }}
                >
                  Đặt dịch vụ
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{ textAlign: "center", marginTop: "48px" }}>
        <Title level={2} style={{ color: "#1B2559", marginBottom: "16px" }}>
          Tại sao chọn chúng tôi?
        </Title>

        <Row gutter={[24, 24]} style={{ marginTop: "32px" }}>
          <Col xs={24} md={8}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  backgroundColor: "#E6F7FF",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <CarOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
              </div>
              <Title level={4} style={{ color: "#1B2559" }}>
                Chất lượng cao
              </Title>
              <Paragraph style={{ color: "#8B92A5" }}>
                Sử dụng các sản phẩm và thiết bị chuyên nghiệp
              </Paragraph>
            </div>
          </Col>

          <Col xs={24} md={8}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  backgroundColor: "#F6FFED",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <ToolOutlined style={{ fontSize: "24px", color: "#52c41a" }} />
              </div>
              <Title level={4} style={{ color: "#1B2559" }}>
                Đội ngũ chuyên nghiệp
              </Title>
              <Paragraph style={{ color: "#8B92A5" }}>
                Nhân viên được đào tạo bài bản và có kinh nghiệm
              </Paragraph>
            </div>
          </Col>

          <Col xs={24} md={8}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  backgroundColor: "#FFF7E6",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <ToolOutlined style={{ fontSize: "24px", color: "#fa8c16" }} />
              </div>
              <Title level={4} style={{ color: "#1B2559" }}>
                Giá cả hợp lý
              </Title>
              <Paragraph style={{ color: "#8B92A5" }}>
                Cung cấp dịch vụ với mức giá cạnh tranh và minh bạch
              </Paragraph>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
