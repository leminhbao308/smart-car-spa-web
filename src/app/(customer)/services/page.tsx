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
import { useActiveServiceTypes } from "@/lib/api/hooks/useServiceTypes";
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
  const [searchTerm, setSearchTerm] = useState<string>("");
  // Track client-side filter by service type (not sent to backend)
  const [selectedServiceType, setSelectedServiceType] = useState<string | undefined>(undefined);
  // Track client-side sort by price separately (not sent to backend)
  // Default to null (no price sorting)
  const [sortByPrice, setSortByPrice] = useState<"ASC" | "DESC" | null>(null);
  const [params, setParams] = useState<ServiceFilterParam>({
    page: 0, // Backend uses 0-based, but we'll load all for client-side filtering
    size: 1000, // Load more services to filter/sort client-side
    sort: "serviceName", // Use valid backend sort field
    direction: "ASC",
  });
  
  // Client-side pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 12;

  const { data: servicesResponse, isLoading } = useServices(params);
  const { data: serviceTypesResponse } = useActiveServiceTypes();
  const [servicePrices, setServicePrices] = useState<Record<string, number>>(
    {}
  );
  const [serviceImages, setServiceImages] = useState<Record<string, string>>(
    {}
  );
  const [pricesLoading, setPricesLoading] = useState(false);

  // Memoize service types for dropdown
  const serviceTypeOptions = useMemo(() => {
    // Handle different response formats
    let types: any[] = [];
    
    // useActiveServiceTypes returns ServiceType[] directly (not wrapped in response.data)
    if (Array.isArray(serviceTypesResponse)) {
      types = serviceTypesResponse;
    } else if (serviceTypesResponse?.data) {
      const data = serviceTypesResponse.data;
      // Check if data is array
      if (Array.isArray(data)) {
        types = data;
      }
      // Check if data has content (pagination)
      else if (data && typeof data === 'object' && 'content' in data) {
        types = Array.isArray(data.content) ? data.content : [];
      }
    }

    console.log("[ServicesPage] Service types response:", serviceTypesResponse);
    console.log("[ServicesPage] Service types loaded:", types.length, types);

    const options = [
      { label: "Tất cả", value: undefined },
      ...types.map((type: any) => ({
        label: type.service_type_name || type.name || type.service_type_code || "Loại dịch vụ",
        value: type.service_type_id || type.id,
      })),
    ];

    console.log("[ServicesPage] Service type options:", options);
    return options;
  }, [serviceTypesResponse]);

  // Memoize all services with client-side filtering and sorting
  const allFilteredServices = useMemo(() => {
    let servicesList = Array.isArray(servicesResponse?.data)
      ? servicesResponse?.data
      : servicesResponse?.data?.content || [];

    // Filter by service type (client-side)
    if (selectedServiceType) {
      servicesList = servicesList.filter((service: Service) => {
        return service.service_type_id === selectedServiceType;
      });
    }

    // Sort by price (client-side) after filtering
    if (sortByPrice && Object.keys(servicePrices).length > 0) {
      servicesList = [...servicesList].sort((a: Service, b: Service) => {
        const priceA = servicePrices[a.service_id] || 0;
        const priceB = servicePrices[b.service_id] || 0;
        return sortByPrice === "ASC" ? priceA - priceB : priceB - priceA;
      });
    }

    return servicesList;
  }, [servicesResponse, servicePrices, sortByPrice, selectedServiceType]);

  // Paginate filtered services client-side
  const services = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return allFilteredServices.slice(startIndex, endIndex);
  }, [allFilteredServices, currentPage, pageSize]);

  // Calculate total elements after client-side filtering
  const totalElements = useMemo(() => {
    return allFilteredServices.length;
  }, [allFilteredServices]);

  // Get raw services list (before client-side sorting) for fetching prices/images
  const rawServices = useMemo(() => {
    return Array.isArray(servicesResponse?.data)
      ? servicesResponse?.data
      : servicesResponse?.data?.content || [];
  }, [servicesResponse]);

  // Batch fetch prices and images for all services
  useEffect(() => {
    const fetchBatchData = async () => {
      if (rawServices.length > 0) {
        try {
          setPricesLoading(true);
          const serviceIds = rawServices.map((s: Service) => s.service_id);

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
  }, [rawServices]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setParams({
      ...params,
      search: value || undefined,
      page: 0, // Backend uses 0-based
    });
    setCurrentPage(1); // Reset client-side pagination
  };

  const handleServiceTypeChange = (value: string | undefined) => {
    // Filter by service type is done client-side, no need to send to backend
    setSelectedServiceType(value);
    // Reset to first page when filter changes
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    // Client-side pagination
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (value: string) => {
    // Handle "none" or empty value for "Bất kỳ"
    if (!value || value === "none" || value === "") {
      setSortByPrice(null);
      setCurrentPage(1); // Reset to first page
      return;
    }

    const [sort, direction] = value.split("-");
    
    // Always sort by price client-side (don't send to backend)
    if (sort === "base_price" || sort === "price") {
      setSortByPrice(direction as "ASC" | "DESC");
      setCurrentPage(1); // Reset to first page
    } else {
      // For other sorts (if any in future), use backend sorting
      setSortByPrice(null); // Clear price sort
      setCurrentPage(1); // Reset to first page
    }
  };

  const handleResetFilters = () => {
    // Reset all filters and search
    setSearchTerm("");
    setSelectedServiceType(undefined);
    setSortByPrice(null);
    setCurrentPage(1);
    setParams({
      page: 0,
      size: 1000,
      sort: "serviceName",
      direction: "ASC",
      search: undefined,
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onSearch={handleSearch}
              allowClear
            />
          </Col>
          <Col
            xs={24}
            sm={24}
            md={12}
            lg={6}
          >
            <Select
              defaultValue="none"
              value={sortByPrice ? `base_price-${sortByPrice}` : "none"}
              onChange={handleSortChange}
              style={{ width: "100%" }}
              options={[
                { label: "Bất kỳ", value: "none" },
                { label: "Giá tăng dần", value: "base_price-ASC" },
                { label: "Giá giảm dần", value: "base_price-DESC" },
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
              value={selectedServiceType}
              onChange={handleServiceTypeChange}
              options={serviceTypeOptions}
              loading={!serviceTypesResponse}
            />
          </Col>
          <Col
            xs={24}
            sm={24}
            md={12}
            lg={6}
          >
            <Button
              type="default"
              block
              style={{ height: "40px" }}
              onClick={handleResetFilters}
            >
              Reset bộ lọc và tìm kiếm
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
      {allFilteredServices.length > 0 && (
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <Pagination
            current={currentPage}
            total={totalElements}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
}
