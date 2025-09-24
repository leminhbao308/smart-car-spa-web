"use client";
import React from "react";
import { Card, Typography, Row, Col } from "antd";
import Image from "next/image";

const { Title, Text } = Typography;

interface ServiceCardProps {
  title: string;
  backgroundImage: string;
  description?: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  backgroundImage,
  description,
}) => (
  <Card
    hoverable
    style={{
      borderRadius: "12px",
      overflow: "hidden",
      marginBottom: "24px",
      border: "none",
      height: "280px",
      transition: "all 0.3s ease",
      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    }}
    bodyStyle={{ padding: 0, height: "100%" }}
  >
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Image
        src={backgroundImage}
        alt={title.replace("\n", " ")}
        fill
        style={{
          objectFit: "cover",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
          padding: "24px",
          color: "white",
        }}
      >
        <Title
          level={4}
          style={{
            color: "white",
            marginBottom: "8px",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          {title.split("\n").map((line, index) => (
            <React.Fragment key={index}>
              {line}
              {index < title.split("\n").length - 1 && <br />}
            </React.Fragment>
          ))}
        </Title>
        {description && (
          <Text
            style={{
              color: "rgba(255,255,255,0.9)",
              fontSize: "14px",
              lineHeight: "1.4",
            }}
          >
            {description}
          </Text>
        )}
      </div>
    </div>
  </Card>
);

const FeaturedServices: React.FC = () => {
  const services = [
    {
      title: "CHĂM SÓC XE HƠI\nTOÀN DIỆN",
      backgroundImage: "/images/background01.jpg",
      description: "Dịch vụ chăm sóc xe toàn diện từ trong ra ngoài",
    },
    {
      title: "PHỦ CERAMIC OTO",
      backgroundImage: "/images/background02.jpg",
      description: "Bảo vệ sơn xe với công nghệ ceramic hiện đại",
    },
    {
      title: "DÁN PHIM CÁCH\nNHIỆT OTO",
      backgroundImage: "/images/background03.jpg",
      description: "Phim cách nhiệt cao cấp cho xe của bạn",
    },
  ];

  return (
    <div style={{ padding: "0 20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Section Header */}
      <div
        style={{
          textAlign: "center",
          padding: "40px 20px",
          marginBottom: "40px",
        }}
      >
        <Title
          level={3}
          style={{
            color: "#333",
            fontSize: "18px",
            fontWeight: "bold",
            marginBottom: "8px",
            lineHeight: "1.2",
          }}
        >
          CÁC DỊCH VỤ CHĂM SÓC XE HƠI CAO CẤP TẠI
        </Title>
        <Title
          level={2}
          style={{
            color: "#6C7BEA",
            fontSize: "28px",
            fontWeight: "bold",
            margin: 0,
            lineHeight: "1.2",
          }}
        >
          SMART CAR SPA
        </Title>
      </div>

      {/* Services Grid */}
      <Row
        gutter={[24, 24]}
        justify="center"
      >
        {services.map((service, index) => (
          <Col key={index} xs={24} sm={24} md={12} lg={8} xl={8}>
            <ServiceCard
              title={service.title}
              backgroundImage={service.backgroundImage}
              description={service.description}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default FeaturedServices;
