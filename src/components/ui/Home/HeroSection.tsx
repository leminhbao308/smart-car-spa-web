"use client";
import React from "react";
import { Typography, Button } from "antd";
import Image from "next/image";

const { Title, Text } = Typography;

const HeroSection: React.FC = () => {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "500px",
        overflow: "hidden",
      }}
    >
      {/* Background Image */}
      <Image
        src="/images/background01.jpg"
        alt="Premium Car Wash Service"
        fill
        style={{ 
          objectFit: "cover",
          filter: "brightness(0.6)"
        }}
        priority
      />
      
      {/* Overlay Content */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          color: "white",
          zIndex: 2,
          maxWidth: "800px",
          padding: "0 20px",
        }}
      >
        <Title 
          level={1} 
          style={{ 
            color: "white", 
            fontSize: "48px", 
            fontWeight: "bold",
            marginBottom: "16px",
            textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
          }}
        >
          Dịch vụ rửa xe cao cấp
        </Title>
        
        <Text 
          style={{ 
            color: "rgba(255,255,255,0.9)", 
            fontSize: "18px", 
            lineHeight: "1.6",
            display: "block",
            marginBottom: "32px",
            textShadow: "1px 1px 2px rgba(0,0,0,0.7)",
          }}
        >
          Trải nghiệm dịch vụ rửa xe chuyên nghiệp với công nghệ hiện đại và đội ngũ kỹ thuật viên giàu kinh nghiệm
        </Text>
        
        <Button
          type="primary"
          size="large"
          style={{
            backgroundColor: "#1890ff",
            borderColor: "#1890ff",
            borderRadius: "8px",
            padding: "0 32px",
            height: "48px",
            fontSize: "16px",
            fontWeight: "500",
            boxShadow: "0 4px 12px rgba(24, 144, 255, 0.3)",
          }}
        >
          Xem chi tiết
        </Button>
      </div>
      
      {/* Dark overlay for better text readability */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.3)",
          zIndex: 1,
        }}
      />
    </div>
  );
};

export default HeroSection;
