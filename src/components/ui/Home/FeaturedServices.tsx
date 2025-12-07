"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  Typography,
  Row,
  Col,
  Skeleton,
  Empty,
  Button,
} from "antd";
import Image from "next/image";
import Link from "next/link";
import { useServices } from "@/lib/api/hooks/useServices";
import { MediaService } from "@/lib/api/services/media.service";
import { PricingService } from "@/lib/api/services/pricing.service";
import type { Service } from "@/lib/api/types/service.types";

const { Title, Text } = Typography;

interface ServiceCardProps {
  service: Service;
  imageUrl?: string;
  price?: number;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  imageUrl,
  price,
}) => {
  const formatPrice = (value: number | null | undefined) => {
    if (value === null || value === undefined || value === 0) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <Link href={`/services/${service.service_url || service.service_id}`}>
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
    styles={{
      body: {
        padding: 0,
        height: "100%",
      },
    }}
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
            src={imageUrl || "/images/background01.jpg"}
            alt={service.service_name}
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
              {service.service_name}
        </Title>
            {service.description && (
          <Text
            style={{
              color: "rgba(255,255,255,0.9)",
              fontSize: "14px",
              lineHeight: "1.4",
                  display: "block",
                  marginBottom: "8px",
            }}
          >
                {service.description.length > 100
                  ? `${service.description.substring(0, 100)}...`
                  : service.description}
          </Text>
        )}
            <Text
              style={{
                color: "#6C7BEA",
                fontSize: "16px",
                fontWeight: "bold",
                display: "block",
              }}
            >
              {formatPrice(price)}
            </Text>
      </div>
    </div>
  </Card>
    </Link>
);
};

const FeaturedServices: React.FC = () => {
  const { data: servicesResponse, isLoading } = useServices({
    page: 0,
    size: 6,
    is_featured: true,
    is_active: true,
  });

  const [servicesWithData, setServicesWithData] = useState<
    Array<Service & { imageUrl?: string; price?: number }>
  >([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Extract services from response
  const services = useMemo(() => {
    if (!servicesResponse?.data) return [];
    // Handle both array and paginated response
    if (Array.isArray(servicesResponse.data)) {
      return servicesResponse.data;
    }
    return servicesResponse.data.content || [];
  }, [servicesResponse]);

  // Load images and prices for services
  useEffect(() => {
    const loadServiceData = async () => {
      if (!services || services.length === 0) {
        setServicesWithData([]);
        return;
      }

      setDataLoading(true);
      try {
        // Load images and prices in parallel
        const serviceIds = services.map((s) => s.service_id).filter(Boolean);
        const [imageMap, pricesMap] = await Promise.all([
          MediaService.getMainImagesBatch(serviceIds, "SERVICE"),
          PricingService.getServicePricesBatch(serviceIds),
        ]);

        // Map services with images and prices
        const servicesWithData = services.map((service) => ({
          ...service,
          imageUrl: imageMap[service.service_id] || "/images/background01.jpg",
          price: pricesMap[service.service_id] || 0,
        }));

        setServicesWithData(servicesWithData);
      } catch (error) {
        console.log("Error loading service data:", error);
        // Fallback: use services without images/prices
        const servicesWithData = services.map((service) => ({
          ...service,
          imageUrl: "/images/background01.jpg",
          price: 0,
        }));
        setServicesWithData(servicesWithData);
      } finally {
        setDataLoading(false);
      }
    };

    if (!isLoading) {
      loadServiceData();
    }
  }, [services, isLoading]);

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
      <Row gutter={[24, 24]} justify="center">
        {isLoading || dataLoading ? (
          <>
            {new Array(6).fill(null).map((_, idx) => (
              <Col key={`skeleton-${idx}`} xs={24} sm={24} md={12} lg={8} xl={8}>
                <Card style={{ borderRadius: "12px", height: "280px" }}>
                  <Skeleton active paragraph={{ rows: 4 }} />
                </Card>
              </Col>
            ))}
          </>
        ) : servicesWithData.length > 0 ? (
          servicesWithData.map((service) => (
            <Col
              key={service.service_id}
              xs={24}
              sm={24}
              md={12}
              lg={8}
              xl={8}
            >
            <ServiceCard
                service={service}
                imageUrl={service.imageUrl}
                price={service.price}
            />
          </Col>
          ))
        ) : (
          <Col span={24}>
            <Empty description="Không có dịch vụ nào" />
          </Col>
        )}
      </Row>

      {/* View All Button */}
      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <Link href="/services">
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
            Xem Tất Cả Dịch Vụ
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default FeaturedServices;
