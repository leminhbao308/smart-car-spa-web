"use client";
import React from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Tag,
  Space,
  Skeleton,
  Empty,
  Typography,
} from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";
import { useProducts } from "@/lib/api/hooks/useProducts";
import { useProductMainImage } from "@/lib/api/hooks/useProductMainImage";
import { usePricing } from "@/lib/api/hooks/usePricing";
import { useEffect, useState } from "react";

const { Title, Text } = Typography;

const ProductCard: React.FC<{ product: any }> = ({ product }) => {
  const { mainImageUrl, loading: imageLoading } = useProductMainImage(
    product.product_id
  );
  const { preview: getPrice, loading: priceLoading } = usePricing();
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const priceData = await getPrice({
          product_id: product.product_id,
          qty: 1,
        });
        setPrice(priceData?.total_price ?? null);
      } catch (error) {
        console.log("Error fetching price:", error);
        setPrice(null);
      }
    };
    fetchPrice();
  }, [product.product_id, getPrice]);

  const formatPrice = (value: number | null) => {
    if (value === null || value === undefined) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <Link href={`/products/${product.product_url}`}>
      <Card
        hoverable
        style={{ borderRadius: "12px", height: "100%" }}
        styles={{ body: { padding: "16px" } }}
      >
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
          {imageLoading ? (
            <Skeleton.Avatar
              active
              size={100}
              shape="square"
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                top: 0,
                left: 0,
              }}
            />
          ) : (
            <Image
              src={mainImageUrl || "/images/placeholder.jpg"}
              alt={product.product_name}
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          )}
        </div>
        <Title
          level={5}
          style={{ margin: "0 0 8px 0", fontSize: "14px" }}
        >
          {product.product_name}
        </Title>
        <Space
          size={4}
          wrap
          style={{ marginBottom: "12px" }}
        >
          {product.brand && <Tag color="blue">{product.brand}</Tag>}
          {product.is_featured && <Tag color="gold">Nổi Bật</Tag>}
        </Space>
        <Text
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            color: "#333",
            display: "block",
            marginBottom: "12px",
          }}
        >
          {priceLoading ? (
            <Skeleton.Button
              active
              size="small"
            />
          ) : (
            formatPrice(price)
          )}
        </Text>
        <Button
          type="primary"
          block
          icon={<ShoppingCartOutlined />}
          style={{
            backgroundColor: "#6C7BEA",
            borderColor: "#6C7BEA",
            height: "40px",
            fontWeight: "bold",
          }}
        >
          Thêm Vào Giỏ
        </Button>
      </Card>
    </Link>
  );
};

const FeaturedProductsSection: React.FC = () => {
  const { products = [], isLoading } = useProducts({
    page: 0,
    size: 6,
    filters: {
      isFeatured: true,
      isReward: false
    }
  });

  return (
    <div style={{ padding: "0 20px", maxWidth: "1200px", margin: "0 auto" }}>
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
          }}
        >
          CÁC SẢN PHẨM NỔI BẬT
        </Title>
        <Title
          level={2}
          style={{
            color: "#6C7BEA",
            fontSize: "28px",
            fontWeight: "bold",
            margin: 0,
          }}
        >
          SMART CAR SPA
        </Title>
      </div>

      <Row
        gutter={[24, 24]}
        justify="center"
      >
        {isLoading ? (
          <>
            {new Array(6).fill(null).map((_, idx) => (
              <Col
                key={`skeleton-placeholder-${idx}`}
                xs={24}
                sm={24}
                md={12}
                lg={8}
              >
                <Card style={{ borderRadius: "12px" }}>
                  <Skeleton
                    active
                    paragraph={{ rows: 4 }}
                  />
                </Card>
              </Col>
            ))}
          </>
        ) : products.length > 0 ? (
          products.map((product) => (
            <Col
              key={product.product_id}
              xs={24}
              sm={24}
              md={12}
              lg={8}
            >
              <ProductCard product={product} />
            </Col>
          ))
        ) : (
          <Empty description="Không có sản phẩm nào" />
        )}
      </Row>

      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <Link href="/products">
          <Button
            type="default"
            size="large"
            style={{
              minWidth: "200px",
              height: "50px",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            Xem Tất Cả Sản Phẩm
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default FeaturedProductsSection;
