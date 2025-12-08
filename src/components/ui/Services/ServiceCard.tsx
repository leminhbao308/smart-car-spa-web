"use client";
import React, { useEffect, useState } from "react";
import { Card, Tag, Typography, Space } from "antd";
import Image from "next/image";
import Link from "next/link";
import { useServiceMainImage } from "@/lib/api/hooks/useServiceImages";
import { PricingService } from "@/lib/api/services/pricing.service";

const { Title, Text } = Typography;

interface ServiceCardProps {
  service: {
    service_id: string;
    service_url: string;
    service_name: string;
    service_type_name?: string;
    estimated_duration?: number;
  };
  /** Price to display (if provided, skips individual API call) */
  price?: number;
  /** Image URL to display (if provided, skips individual API call) */
  imageUrl?: string;
  /** Loading state for prices (from parent) */
  pricesLoading?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  price: propPrice,
  imageUrl: propImageUrl,
  pricesLoading: propPricesLoading = false,
}) => {
  // Use prop values if provided (batch fetched), otherwise fetch individually
  const shouldFetchImage = propImageUrl === undefined;
  const shouldFetchPrice = propPrice === undefined;

  const { mainImageUrl: fetchedImageUrl, loading: imageLoading } =
    useServiceMainImage(shouldFetchImage ? service.service_id : undefined);
  const [fetchedPrice, setFetchedPrice] = useState<number>(0);
  const [fetchPriceLoading, setFetchPriceLoading] = useState(false);

  // Only fetch price individually if not provided via props
  useEffect(() => {
    if (!shouldFetchPrice) return;

    const fetchPrice = async () => {
      if (service.service_id) {
        try {
          setFetchPriceLoading(true);
          const pricesMap = await PricingService.getServicePricesBatch([
            service.service_id,
          ]);
          setFetchedPrice(pricesMap[service.service_id] || 0);
        } catch (error) {
          console.log("Error fetching service price:", error);
          setFetchedPrice(0);
        } finally {
          setFetchPriceLoading(false);
        }
      }
    };
    fetchPrice();
  }, [service.service_id, shouldFetchPrice]);

  // Use prop values if provided, otherwise use fetched values
  const displayPrice = propPrice ?? fetchedPrice;
  const mainImageUrl = propImageUrl ?? fetchedImageUrl;
  const loading = shouldFetchImage ? imageLoading : false;
  const priceLoading = shouldFetchPrice ? fetchPriceLoading : propPricesLoading;

  const formatPrice = (price: number) => {
    if (!price) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <Link href={`/services/${service.service_url}`}>
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
            src={mainImageUrl || "/images/placeholder.jpg"}
            alt={service.service_name}
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
          {service.service_name}
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
          {service.service_type_name && (
            <Tag color="blue">{service.service_type_name}</Tag>
          )}
          <Text
            type="secondary"
            style={{ fontSize: "12px" }}
          >
            Thời gian: {service.estimated_duration || "N/A"} phút
          </Text>
        </Space>
      </Card>
    </Link>
  );
};

export default ServiceCard;
