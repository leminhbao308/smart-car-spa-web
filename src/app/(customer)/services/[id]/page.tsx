"use client";
import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Tabs,
  Breadcrumb,
  Typography,
  Space,
  Rate,
  Tag,
  Empty,
  Skeleton,
  Statistic,
  Descriptions,
} from "antd";
import {
  HeartOutlined,
  ShareAltOutlined,
  ClockCircleOutlined,
  ShoppingCartOutlined,
  PlayCircleOutlined,
  TagOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import Image from "next/image";
import { useServiceByUrl } from "@/lib/api/hooks/useServices";
import { useServiceMainImage } from "@/lib/api/hooks/useServiceImages";
import { PricingService } from "@/lib/api/services/pricing.service";
import { useParams } from "next/navigation";

const { Title, Text, Paragraph } = Typography;

export default function ServiceDetailPage() {
  const params = useParams();
  const serviceUrl = params.id as string;
  const { data: service, isLoading, error } = useServiceByUrl(serviceUrl);
  const { mainImageUrl } = useServiceMainImage(service?.service_id || "");
  const [displayPrice, setDisplayPrice] = useState(0);
  const [priceLoading, setPriceLoading] = useState(true);

  useEffect(() => {
    const fetchPrice = async () => {
      if (service?.service_id) {
        try {
          setPriceLoading(true);
          // Use batch API to get service price (prevents N+1 query pattern)
          const pricesMap = await PricingService.getServicePricesBatch([
            service.service_id,
          ]);
          setDisplayPrice(pricesMap[service.service_id] || 0);
        } catch (error) {
          console.log("Error fetching service price:", error);
          setDisplayPrice(0);
        } finally {
          setPriceLoading(false);
        }
      }
    };
    fetchPrice();
  }, [service?.service_id]);

  const formatPrice = (price: number) => {
    if (!price) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (isLoading)
    return (
      <div
        style={{
          padding: "20px",
          maxWidth: "1200px",
          margin: "0 auto",
          minHeight: "100vh",
        }}
      >
        <Skeleton
          active
          paragraph={{ rows: 8 }}
        />
      </div>
    );
  if (error || !service)
    return (
      <div
        style={{
          padding: "20px",
          maxWidth: "1200px",
          margin: "0 auto",
          minHeight: "100vh",
        }}
      >
        <Empty description="Không tìm thấy dịch vụ này" />
      </div>
    );

  // Process Tab - Quy trình dịch vụ
  const processTab = service.service_process ? (
    <Row gutter={[24, 24]}>
      {/* Process Info Section */}
      <Col
        xs={24}
        md={8}
      >
        <Card
          title="Thông tin quy trình"
          style={{
            backgroundColor: "#f8f9fa",
            height: "100%",
          }}
        >
          <Space
            direction="vertical"
            style={{ width: "100%" }}
            size="middle"
          >
            <div>
              <Text
                type="secondary"
                style={{
                  fontSize: "13px",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Tên quy trình
              </Text>
              <Text
                strong
                style={{ fontSize: "15px" }}
              >
                {service.service_process.name}
              </Text>
            </div>

            <div>
              <Text
                type="secondary"
                style={{
                  fontSize: "13px",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Số bước thực hiện
              </Text>
              <Tag
                color="cyan"
                style={{ fontSize: "13px" }}
              >
                {service.service_process.process_steps?.length || 0} bước
              </Tag>
            </div>

            {service.service_process.description && (
              <div>
                <Text
                  type="secondary"
                  style={{
                    fontSize: "13px",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Mô tả
                </Text>
                <Text style={{ fontSize: "14px", color: "#595959" }}>
                  {service.service_process.description}
                </Text>
              </div>
            )}
          </Space>
        </Card>
      </Col>

      {/* Process Steps Section */}
      <Col
        xs={24}
        md={16}
      >
        <Card
          title={`Các bước thực hiện (${
            service.service_process.process_steps?.length || 0
          })`}
        >
          {service.service_process.process_steps &&
          service.service_process.process_steps.length > 0 ? (
            <div style={{ position: "relative" }}>
              {/* Timeline line */}
              <div
                style={{
                  position: "absolute",
                  left: 20,
                  top: 12,
                  bottom: 12,
                  width: 2,
                  backgroundColor: "#e8e8e8",
                  zIndex: 1,
                }}
              />

              {service.service_process.process_steps.map((step, index) => (
                <div
                  key={step.id}
                  style={{
                    position: "relative",
                    paddingLeft: 70,
                    paddingBottom:
                      index ===
                      (service.service_process?.process_steps?.length || 0) - 1
                        ? 0
                        : 24,
                    zIndex: 2,
                  }}
                >
                  {/* Timeline step number */}
                  <div
                    style={{
                      position: "absolute",
                      left: 6,
                      top: 2,
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      backgroundColor: "#6C7BEA",
                      border: "3px solid #ffffff",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      fontWeight: "bold",
                      color: "white",
                      zIndex: 3,
                    }}
                  >
                    {step.step_order}
                  </div>

                  {/* Step content */}
                  <div
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e8e8e8",
                      borderRadius: 8,
                      padding: 16,
                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 8,
                      }}
                    >
                      <Text
                        strong
                        style={{ fontSize: 15, color: "#262626", flex: 1 }}
                      >
                        {step.name}
                      </Text>
                      {step.is_required && (
                        <Tag
                          color="red"
                          style={{ margin: 0, fontSize: 12 }}
                        >
                          Bắt buộc
                        </Tag>
                      )}
                    </div>

                    {step.description && (
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#666",
                          display: "block",
                          marginTop: 8,
                        }}
                      >
                        {step.description}
                      </Text>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty description="Chưa có bước quy trình nào" />
          )}
        </Card>
      </Col>
    </Row>
  ) : (
    <Empty
      description="Dịch vụ này chưa được thiết lập quy trình thực hiện cụ thể"
      style={{ padding: "40px 0" }}
    />
  );

  // Products Tab - Sản phẩm sử dụng
  const productsTab =
    service.service_products && service.service_products.length > 0 ? (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {service.service_products.map((product, index) => (
          <Card
            key={product.id}
            style={{
              border: "1px solid #e8e8e8",
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <Row gutter={[24, 16]}>
              <Col
                xs={24}
                md={16}
              >
                <div
                  style={{ display: "flex", alignItems: "flex-start", gap: 16 }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: "#52c41a",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      fontWeight: "bold",
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: 12 }}>
                      <Text
                        strong
                        style={{
                          fontSize: 16,
                          display: "block",
                          marginBottom: 4,
                        }}
                      >
                        {product.product_info.product_name}
                      </Text>
                      {product.is_required && (
                        <Tag
                          color="red"
                          style={{ fontSize: 12 }}
                        >
                          Bắt buộc
                        </Tag>
                      )}
                    </div>

                    <Space
                      direction="vertical"
                      style={{ width: "100%" }}
                      size="small"
                    >
                      {product.product_info.brand && (
                        <div>
                          <Text
                            type="secondary"
                            style={{ fontSize: 13 }}
                          >
                            Thương hiệu:{" "}
                          </Text>
                          <Text
                            strong
                            style={{ fontSize: 14 }}
                          >
                            {product.product_info.brand}
                          </Text>
                        </div>
                      )}
                      {product.product_info.model && (
                        <div>
                          <Text
                            type="secondary"
                            style={{ fontSize: 13 }}
                          >
                            Model:{" "}
                          </Text>
                          <Text style={{ fontSize: 14 }}>
                            {product.product_info.model}
                          </Text>
                        </div>
                      )}
                      {product.notes && (
                        <div>
                          <Text
                            type="secondary"
                            style={{ fontSize: 13 }}
                          >
                            Ghi chú:{" "}
                          </Text>
                          <Text style={{ fontSize: 14, fontStyle: "italic" }}>
                            {product.notes}
                          </Text>
                        </div>
                      )}
                    </Space>
                  </div>
                </div>
              </Col>
              <Col
                xs={24}
                md={8}
              >
                <div
                  style={{
                    backgroundColor: "#f5f5f5",
                    padding: 16,
                    borderRadius: 8,
                    textAlign: "center",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    type="secondary"
                    style={{ fontSize: 13, display: "block", marginBottom: 8 }}
                  >
                    Số lượng sử dụng
                  </Text>
                  <Text
                    strong
                    style={{ fontSize: 24, color: "#6C7BEA", display: "block" }}
                  >
                    {product.quantity} {product.unit}
                  </Text>
                </div>
              </Col>
            </Row>
          </Card>
        ))}
      </div>
    ) : (
      <Empty description="Dịch vụ này không sử dụng sản phẩm cụ thể" />
    );

  // Specifications Tab - Thông tin chi tiết
  const specificationsTab = (
    <div>
      <Row gutter={[16, 24]}>
        {/* Statistics Cards */}
        <Col
          xs={12}
          sm={8}
        >
          <Card style={{ textAlign: "center", borderRadius: 12 }}>
            <Statistic
              title="Thời gian dự kiến"
              value={
                service.service_process?.estimated_duration ||
                service.estimated_duration ||
                0
              }
              suffix="phút"
              valueStyle={{ color: "#1890ff", fontSize: 28 }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col
          xs={12}
          sm={8}
        >
          <Card style={{ textAlign: "center", borderRadius: 12 }}>
            <Statistic
              title="Số sản phẩm"
              value={service.service_products?.length || 0}
              valueStyle={{ color: "#52c41a", fontSize: 28 }}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col
          xs={12}
          sm={8}
        >
          <Card style={{ textAlign: "center", borderRadius: 12 }}>
            <Statistic
              title="Số bước quy trình"
              value={service.service_process?.process_steps?.length || 0}
              valueStyle={{ color: "#722ed1", fontSize: 28 }}
              prefix={<PlayCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Detailed Information */}
      <Card
        title="Thông tin chi tiết"
        style={{ marginTop: 24, borderRadius: 12 }}
      >
        <Descriptions
          column={1}
          size="middle"
        >
          <Descriptions.Item
            label={
              <Space>
                <TagOutlined style={{ color: "#1890ff" }} />
                <Text strong>Danh mục</Text>
              </Space>
            }
          >
            <Tag
              color="blue"
              style={{ fontSize: 14 }}
            >
              {service.category_name || "Chưa phân loại"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <Space>
                <SettingOutlined style={{ color: "#1890ff" }} />
                <Text strong>Loại dịch vụ</Text>
              </Space>
            }
          >
            <Tag
              color="purple"
              style={{ fontSize: 14 }}
            >
              {service.service_type_name || "N/A"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <Space>
                <ClockCircleOutlined style={{ color: "#1890ff" }} />
                <Text strong>Thời gian thực hiện</Text>
              </Space>
            }
          >
            <Text style={{ fontSize: 14 }}>
              {service.service_process?.estimated_duration ||
                service.estimated_duration ||
                "N/A"}{" "}
              phút
            </Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );

  const tabItems = [
    {
      key: "description",
      label: "Mô tả",
      children: (
        <div>
          <Paragraph style={{ fontSize: "15px", lineHeight: "1.8" }}>
            {service.description || "Chưa có mô tả"}
          </Paragraph>
        </div>
      ),
    },
    {
      key: "specifications",
      label: "Thông tin chi tiết",
      children: specificationsTab,
    },
    {
      key: "products",
      label: `Sản phẩm sử dụng (${service.service_products?.length || 0})`,
      children: productsTab,
    },
    {
      key: "process",
      label: `Quy trình thực hiện (${
        service.service_process?.process_steps?.length || 0
      })`,
      children: processTab,
    },
  ];

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
          { title: <Link href="/services">Dịch vụ</Link> },
          { title: service.service_name },
        ]}
      />
      <Row gutter={[32, 32]}>
        <Col
          xs={24}
          md={12}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              paddingBottom: "100%",
              borderRadius: "12px",
              overflow: "hidden",
              backgroundColor: "#f0f0f0",
            }}
          >
            <Image
              src={mainImageUrl || "/images/placeholder.jpg"}
              alt={service.service_name}
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </Col>
        <Col
          xs={24}
          md={12}
        >
          <Space
            direction="vertical"
            style={{ width: "100%" }}
            size="large"
          >
            <div>
              <Title
                level={2}
                style={{ margin: "0 0 12px 0" }}
              >
                {service.service_name}
              </Title>
            </div>
            <div
              style={{
                backgroundColor: "#f5f5f5",
                padding: "12px",
                borderRadius: "8px",
              }}
            >
              <Text
                strong
                style={{ fontSize: "24px", color: "#6C7BEA" }}
              >
                {priceLoading ? "Đang tải..." : formatPrice(displayPrice)}
              </Text>
            </div>
            <Space wrap>
              {service.service_type_name && (
                <Tag color="blue">{service.service_type_name}</Tag>
              )}
              {service.is_active && <Tag color="green">Có sẵn</Tag>}
            </Space>
            <Space
              direction="vertical"
              style={{ width: "100%", paddingTop: "16px" }}
            >
              <div
                style={{ display: "flex", gap: "12px", alignItems: "center" }}
              >
                <ClockCircleOutlined
                  style={{ fontSize: "16px", color: "#6C7BEA" }}
                />
                <Text>
                  Thời gian thực hiện: {service.estimated_duration || "N/A"} phút
                </Text>
              </div>
            </Space>
            <Space style={{ width: "100%", paddingTop: "16px" }}>
              <Button
                type="primary"
                size="large"
                style={{
                  backgroundColor: "#6C7BEA",
                  border: "none",
                  height: "40px",
                  borderRadius: "8px",
                  flex: 1,
                }}
              >
                Đặt dịch vụ
              </Button>
              {/* <Button
                type="default"
                size="large"
                icon={<HeartOutlined />}
                style={{ height: "40px", borderRadius: "8px" }}
              />
              <Button
                type="default"
                size="large"
                icon={<ShareAltOutlined />}
                style={{ height: "40px", borderRadius: "8px" }}
              /> */}
            </Space>
          </Space>
        </Col>
      </Row>
      <Card style={{ marginTop: "32px", borderRadius: "12px" }}>
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
}
