"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Row,
  Col,
  Card,
  Select,
  Input,
  Button,
  Pagination,
  Skeleton,
  Empty,
  Typography,
  Breadcrumb,
} from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useServices } from "@/lib/api/hooks/useServices";
import ServiceCard from "@/components/ui/Services/ServiceCard";
import type { ServiceFilterParam } from "@/lib/api/types/service.types";
import { PricingService } from "@/lib/api/services/pricing.service";
import { MediaService } from "@/lib/api/services/media.service";

const { Title, Text } = Typography;

interface Service {
  service_id: string;
  service_url: string;
  service_name: string;
  service_type_name?: string;
  estimated_duration?: number;
}

export default function ServicesListingPage() {
  const [params, setParams] = useState<ServiceFilterParam>({
    page: 0,
    size: 12,
    sort: "createdDate",
    direction: "DESC",
  });

  const { data: servicesResponse, isLoading } = useServices(params);
  const [servicePrices, setServicePrices] = useState<Record<string, number>>(
    {}
  );
  const [serviceImages, setServiceImages] = useState<Record<string, string>>(
    {}
  );
  const [pricesLoading, setPricesLoading] = useState(false);

  // Memoize services array to prevent unnecessary re-renders
  const services = useMemo(() => {
    return Array.isArray(servicesResponse?.data)
      ? servicesResponse?.data
      : servicesResponse?.data?.content || [];
  }, [servicesResponse]);

  const totalElements =
    !Array.isArray(servicesResponse?.data) && servicesResponse?.data
      ? servicesResponse?.data?.totalElements || 0
      : 0;

  // Batch fetch prices and images for all services
  useEffect(() => {
    const fetchBatchData = async () => {
      if (services.length > 0) {
        try {
          setPricesLoading(true);
          const serviceIds = services.map((s: Service) => s.service_id);

          // Fetch all prices in one batch call
          const pricesMap = await PricingService.getServicePricesBatch(
            serviceIds
          );
          setServicePrices(pricesMap);

          // Fetch all main images in one batch call
          const imagesMap = await MediaService.getMainImagesBatch(
            serviceIds,
            "SERVICE"
          );
          setServiceImages(imagesMap);
        } catch (error) {
          console.log("Error fetching batch data:", error);
        } finally {
          setPricesLoading(false);
        }
      }
    };
    fetchBatchData();
  }, [services]);

  const handleSearch = () => {
    setParams({ ...params, page: 0 });
  };

  const handlePageChange = (page: number) => {
    setParams({ ...params, page: page - 1 });
  };

  const handleSortChange = (value: string) => {
    const [sort, direction] = value.split("-");
    setParams({
      ...params,
      sort,
      direction: direction as "ASC" | "DESC",
      page: 0,
    });
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "1200px",
        margin: "0 auto",
        minHeight: "100vh",
      }}
    >
      <Breadcrumb
        style={{ marginBottom: "20px" }}
        items={[
          { title: <Link href="/">Trang chủ</Link> },
          { title: "Dịch vụ" },
        ]}
      />
      <div style={{ marginBottom: "30px" }}>
        <Title level={1}>Danh Sách Dịch Vụ</Title>
        <Text type="secondary">
          Khám phá các dịch vụ chuyên nghiệp của Smart Car Spa
        </Text>
      </div>
      <Card style={{ marginBottom: "30px" }}>
        <Row gutter={[16, 16]}>
          <Col
            xs={24}
            sm={24}
            md={12}
            lg={6}
          >
            <Input.Search
              placeholder="Tìm kiếm dịch vụ..."
              prefix={<SearchOutlined />}
              onSearch={handleSearch}
            />
          </Col>
          <Col
            xs={24}
            sm={24}
            md={12}
            lg={6}
          >
            <Select
              defaultValue="createdDate-DESC"
              onChange={handleSortChange}
              style={{ width: "100%" }}
              options={[
                { label: "Mới nhất", value: "createdDate-DESC" },
                { label: "Cũ nhất", value: "createdDate-ASC" },
                { label: "Tên (A-Z)", value: "service_name-ASC" },
                { label: "Tên (Z-A)", value: "service_name-DESC" },
              ]}
            />
          </Col>
          <Col
            xs={24}
            sm={24}
            md={12}
            lg={6}
          >
            <Select
              placeholder="Loại dịch vụ"
              style={{ width: "100%" }}
              allowClear
              options={[{ label: "Tất cả", value: "" }]}
            />
          </Col>
          <Col
            xs={24}
            sm={24}
            md={12}
            lg={6}
          >
            <Button
              type="primary"
              block
              style={{ height: "40px", backgroundColor: "#6C7BEA" }}
              icon={<FilterOutlined />}
            >
              Lọc
            </Button>
          </Col>
        </Row>
      </Card>
      <Row
        gutter={[24, 24]}
        style={{ marginBottom: "30px" }}
      >
        {isLoading && (
          <>
            {new Array(12).fill(0).map((_, i) => (
              <Col
                key={"skeleton-" + i}
                xs={24}
                sm={12}
                md={8}
                lg={6}
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
        )}

        {!isLoading && services.length > 0 && (
          <>
            {services.map((service: Service) => (
              <Col
                key={service.service_id}
                xs={24}
                sm={12}
                md={8}
                lg={6}
              >
                <ServiceCard
                  service={service}
                  price={servicePrices[service.service_id]}
                  imageUrl={serviceImages[service.service_id]}
                  pricesLoading={pricesLoading}
                />
              </Col>
            ))}
          </>
        )}

        {!isLoading && services.length === 0 && (
          <Col xs={24}>
            <Empty description="Không tìm thấy dịch vụ nào" />
          </Col>
        )}
      </Row>
      {services.length > 0 && totalElements > 0 && (
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <Pagination
            current={(params.page || 0) + 1}
            total={totalElements}
            pageSize={params.size || 12}
            onChange={handlePageChange}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
}
