"use client";
import React, { useState } from "react";
import { Card, Typography, Row, Col, Button, Tag, Space } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import Image from "next/image";

const { Title, Text } = Typography;

interface ProductCardProps {
  name: string;
  image: string;
  currentPrice: number;
  originalPrice: number;
  discount: number;
}

const ProductCard: React.FC<ProductCardProps> = ({
  name,
  image,
  currentPrice,
  originalPrice,
  discount,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <Card
      hoverable
      style={{
        borderRadius: "12px",
        overflow: "hidden",
        height: "100%",
        border: "1px solid #E0E0E0",
        transition: "all 0.3s ease",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
      bodyStyle={{ padding: "16px" }}
    >
      {/* Product Image */}
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingBottom: "75%",
          marginBottom: "12px",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <Image
          src={image}
          alt={name}
          fill
          style={{ objectFit: "cover" }}
        />
      </div>

      {/* Product Info */}
      <div>
        <Title level={5} style={{ margin: "0 0 8px 0", fontSize: "14px" }}>
          {name}
        </Title>

        {/* Price Section */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <div>
            <Text
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                color: "#333",
                display: "block",
              }}
            >
              {formatPrice(currentPrice)}
            </Text>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Text
                style={{
                  fontSize: "12px",
                  color: "#999",
                  textDecoration: "line-through",
                }}
              >
                {formatPrice(originalPrice)}
              </Text>
              <Tag color="red" style={{ fontSize: "10px", padding: "2px 6px" }}>
                -{discount}%
              </Tag>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            type="primary"
            shape="circle"
            icon={<ShoppingCartOutlined />}
            style={{
              backgroundColor: "#8B80F8",
              borderColor: "#8B80F8",
              width: "36px",
              height: "36px",
            }}
            size="small"
          />
        </div>
      </div>
    </Card>
  );
};

const ProductCategories: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("glass-care");

  const categories = [
    { key: "glass-care", label: "Chăm Sóc Kính Xe" },
    { key: "interior", label: "Nội Thất" },
    { key: "exterior", label: "Ngoại Thất" },
    { key: "engine", label: "Động Cơ" },
  ];

  const products = {
    "glass-care": [
      {
        name: "Nước rửa kính",
        image: "/images/background01.jpg",
        currentPrice: 774000,
        originalPrice: 860000,
        discount: 10,
      },
      {
        name: "Nước rửa kính",
        image: "/images/background02.jpg",
        currentPrice: 774000,
        originalPrice: 860000,
        discount: 10,
      },
      {
        name: "Nước rửa kính",
        image: "/images/background03.jpg",
        currentPrice: 774000,
        originalPrice: 860000,
        discount: 10,
      },
      {
        name: "Nước rửa kính",
        image: "/images/background04.png",
        currentPrice: 774000,
        originalPrice: 860000,
        discount: 10,
      },
    ],
    "interior": [
      {
        name: "Nước rửa nội thất",
        image: "/images/background01.jpg",
        currentPrice: 450000,
        originalPrice: 500000,
        discount: 10,
      },
      {
        name: "Nước rửa nội thất",
        image: "/images/background02.jpg",
        currentPrice: 450000,
        originalPrice: 500000,
        discount: 10,
      },
      {
        name: "Nước rửa nội thất",
        image: "/images/background03.jpg",
        currentPrice: 450000,
        originalPrice: 500000,
        discount: 10,
      },
      {
        name: "Nước rửa nội thất",
        image: "/images/background04.png",
        currentPrice: 450000,
        originalPrice: 500000,
        discount: 10,
      },
    ],
    "exterior": [
      {
        name: "Sáp bảo vệ sơn",
        image: "/images/background01.jpg",
        currentPrice: 320000,
        originalPrice: 400000,
        discount: 20,
      },
      {
        name: "Sáp bảo vệ sơn",
        image: "/images/background02.jpg",
        currentPrice: 320000,
        originalPrice: 400000,
        discount: 20,
      },
      {
        name: "Sáp bảo vệ sơn",
        image: "/images/background03.jpg",
        currentPrice: 320000,
        originalPrice: 400000,
        discount: 20,
      },
      {
        name: "Sáp bảo vệ sơn",
        image: "/images/background04.png",
        currentPrice: 320000,
        originalPrice: 400000,
        discount: 20,
      },
    ],
    "engine": [
      {
        name: "Nước làm mát",
        image: "/images/background01.jpg",
        currentPrice: 180000,
        originalPrice: 200000,
        discount: 10,
      },
      {
        name: "Nước làm mát",
        image: "/images/background02.jpg",
        currentPrice: 180000,
        originalPrice: 200000,
        discount: 10,
      },
      {
        name: "Nước làm mát",
        image: "/images/background03.jpg",
        currentPrice: 180000,
        originalPrice: 200000,
        discount: 10,
      },
      {
        name: "Nước làm mát",
        image: "/images/background04.png",
        currentPrice: 180000,
        originalPrice: 200000,
        discount: 10,
      },
    ],
  };

  return (
    <div style={{ padding: "0 20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Section Header */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <Title level={2} style={{ color: "#333", marginBottom: "8px" }}>
          SẢN PHẨM & DỊCH VỤ
        </Title>
        <Text style={{ color: "#666", fontSize: "16px" }}>
          Khám phá các sản phẩm và dịch vụ chăm sóc xe chuyên nghiệp
        </Text>
      </div>

      {/* Category Tabs */}
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <Space wrap size="large">
          {categories.map((category) => (
            <Button
              key={category.key}
              type={activeCategory === category.key ? "primary" : "default"}
              onClick={() => setActiveCategory(category.key)}
              size="large"
              style={{
                backgroundColor: activeCategory === category.key ? "#8B80F8" : "#F5F5F5",
                borderColor: activeCategory === category.key ? "#8B80F8" : "#D9D9D9",
                color: activeCategory === category.key ? "#FFFFFF" : "#333333",
                fontWeight: "500",
                borderRadius: "8px",
                height: "40px",
                padding: "0 24px",
              }}
            >
              {category.label}
            </Button>
          ))}
        </Space>
      </div>

      {/* Products Grid */}
      <Row gutter={[16, 16]}>
        {products[activeCategory as keyof typeof products]?.map((product, index) => (
          <Col 
            key={index}
            xs={12} 
            sm={8} 
            md={6} 
            lg={6} 
            xl={6}
          >
            <ProductCard
              name={product.name}
              image={product.image}
              currentPrice={product.currentPrice}
              originalPrice={product.originalPrice}
              discount={product.discount}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ProductCategories;
