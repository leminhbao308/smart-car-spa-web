"use client";
import React, { useEffect, useState } from "react";
import { Card, Typography, Space } from "antd";
import Image from "next/image";
import Link from "next/link";
import { useProductImages } from "@/lib/api/hooks/useProductImages";
import { usePricing } from "@/lib/api/hooks/usePricing";

const { Title, Text } = Typography;

interface ProductCardProps {
  product: {
    product_id: string;
    product_url: string;
    product_name: string;
    brand?: string;
    price?: number;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { mainImage, loading } = useProductImages(product.product_id);
  const { preview } = usePricing();
  const [displayPrice, setDisplayPrice] = useState<number>(0);
  const [priceLoading, setPriceLoading] = useState(true);

  // Fetch price from pricing API
  useEffect(() => {
    const fetchPrice = async () => {
      if (product.product_id) {
        try {
          setPriceLoading(true);
          const priceResponse = await preview({
            product_id: product.product_id,
            qty: 1,
          });
          setDisplayPrice(priceResponse.total_price || 0);
        } catch (error) {
          console.error("Error fetching price:", error);
          setDisplayPrice(0);
        } finally {
          setPriceLoading(false);
        }
      }
    };
    fetchPrice();
  }, [product.product_id, preview]);

  const formatPrice = (price: number) => {
    if (!price) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <Link href={`/products/${product.product_url}`}>
      <Card
        hoverable
        style={{ borderRadius: "12px", height: "100%" }}
        styles={{ body: { padding: "12px" } }}
        loading={loading}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            paddingBottom: "100%",
            marginBottom: "12px",
            borderRadius: "8px",
            overflow: "hidden",
            backgroundColor: "#f0f0f0",
          }}
        >
          <Image
            src={mainImage?.media_url || "/images/placeholder.jpg"}
            alt={product.product_name}
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        </div>
        <Title
          level={5}
          style={{
            margin: "0 0 8px 0",
            fontSize: "13px",
            lineHeight: "1.4",
            minHeight: "36px",
          }}
        >
          {product.product_name}
        </Title>
        <Space
          direction="vertical"
          style={{ width: "100%" }}
          size={4}
        >
          <Text
            strong
            style={{ fontSize: "14px", color: "#6C7BEA" }}
          >
            {priceLoading ? "Đang tải..." : formatPrice(displayPrice)}
          </Text>
          <Text
            type="secondary"
            style={{ fontSize: "12px" }}
          >
            {product.brand || "N/A"}
          </Text>
        </Space>
      </Card>
    </Link>
  );
};

export default ProductCard;
