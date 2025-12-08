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
  Carousel,
  Image,
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
import NextImage from "next/image";
import { useServiceByUrl } from "@/lib/api/hooks/useServices";
import { useServiceImages } from "@/lib/api/hooks/useServiceImages";
import { PricingService } from "@/lib/api/services/pricing.service";
import { useParams } from "next/navigation";

const { Title, Text, Paragraph } = Typography;

export default function ServiceDetailPage() {
  const params = useParams();
  const serviceUrl = params.id as string;
  const { data: service, isLoading, error } = useServiceByUrl(serviceUrl);
  const { images: serviceImages, mainImage, loading: imagesLoading } = useServiceImages(service?.service_id || null);
  const [displayPrice, setDisplayPrice] = useState(0);
  const [priceLoading, setPriceLoading] = useState(true);

  // Debug: Log images để kiểm tra
  useEffect(() => {
    if (serviceImages) {
      console.log("Service Images:", serviceImages);
      console.log("Number of images:", serviceImages.length);
    }
  }, [serviceImages]);

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
    <div>
      {/* Header Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "16px",
          padding: "32px",
          marginBottom: "32px",
          color: "white",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
            }}
          >
            <SettingOutlined />
          </div>
          <div style={{ flex: 1 }}>
            <Title
              level={3}
              style={{ color: "white", margin: 0, marginBottom: "8px" }}
            >
              {service.service_process.name}
            </Title>
            <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "15px" }}>
              {service.service_process.description || "Quy trình chăm sóc chuyên nghiệp"}
            </Text>
          </div>
        </div>
        <div style={{ display: "flex", gap: "24px", marginTop: "20px" }}>
          <div
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(10px)",
              padding: "12px 20px",
              borderRadius: "10px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: "13px",
                display: "block",
                marginBottom: "4px",
              }}
            >
              Tổng số bước
            </Text>
            <Text
              strong
              style={{ color: "white", fontSize: "24px", display: "block" }}
            >
              {service.service_process.process_steps?.length || 0}
            </Text>
          </div>
          <div
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(10px)",
              padding: "12px 20px",
              borderRadius: "10px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: "13px",
                display: "block",
                marginBottom: "4px",
              }}
            >
              Thời gian dự kiến
            </Text>
            <Text
              strong
              style={{ color: "white", fontSize: "24px", display: "block" }}
            >
              {service.service_process.estimated_duration || service.estimated_duration || "N/A"} phút
            </Text>
          </div>
        </div>
      </div>

      {/* Process Steps Section */}
      {service.service_process.process_steps &&
      service.service_process.process_steps.length > 0 ? (
        <div style={{ position: "relative" }}>
          {/* Elegant Timeline line with gradient */}
          <div
            style={{
              position: "absolute",
              left: "28px",
              top: "20px",
              bottom: "20px",
              width: "3px",
              background: "linear-gradient(180deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "2px",
              zIndex: 1,
              boxShadow: "0 0 10px rgba(102, 126, 234, 0.3)",
            }}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {service.service_process.process_steps.map((step, index) => (
              <div
                key={step.id}
                style={{
                  position: "relative",
                  paddingLeft: "80px",
                  zIndex: 2,
                }}
              >
                {/* Elegant Timeline step indicator */}
                <div
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "4px",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: index === 0 
                      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    border: "4px solid #ffffff",
                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4), 0 0 0 4px rgba(102, 126, 234, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: "white",
                    zIndex: 3,
                    transition: "all 0.3s ease",
                  }}
                >
                  {step.step_order}
                </div>

                {/* Elegant Step content card */}
                <Card
                  hoverable
                  style={{
                    background: "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
                    border: "1px solid rgba(102, 126, 234, 0.15)",
                    borderRadius: "16px",
                    boxShadow: "0 4px 20px rgba(102, 126, 234, 0.08)",
                    transition: "all 0.3s ease",
                    overflow: "hidden",
                  }}
                  styles={{ body: { padding: "24px" } }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "16px",
                      marginBottom: step.description ? "12px" : "0",
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        background: index === 0
                          ? "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)"
                          : "linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(245, 87, 108, 0.1) 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                        color: index === 0 ? "#667eea" : "#f5576c",
                        flexShrink: 0,
                      }}
                    >
                      <PlayCircleOutlined />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: step.description ? "8px" : "0",
                          flexWrap: "wrap",
                        }}
                      >
                        <Title
                          level={4}
                          style={{
                            margin: 0,
                            color: "#1a1a1a",
                            fontSize: "18px",
                            fontWeight: 600,
                            flex: 1,
                            minWidth: "200px",
                          }}
                        >
                          {step.name}
                        </Title>
                        {step.is_required && (
                          <Tag
                            color="error"
                            style={{
                              margin: 0,
                              fontSize: "12px",
                              padding: "2px 10px",
                              borderRadius: "6px",
                              fontWeight: 500,
                            }}
                          >
                            Bắt buộc
                          </Tag>
                        )}
                      </div>

                      {step.description && (
                        <Text
                          style={{
                            fontSize: "14px",
                            color: "#666",
                            lineHeight: "1.7",
                            display: "block",
                            marginTop: "8px",
                          }}
                        >
                          {step.description}
                        </Text>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Empty
          description="Chưa có bước quy trình nào"
          style={{ padding: "60px 0" }}
        />
      )}
    </div>
  ) : (
    <Empty
      description="Dịch vụ này chưa được thiết lập quy trình thực hiện cụ thể"
      style={{ padding: "60px 0" }}
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

  // Specifications Section - Thông tin chi tiết (hiển thị bên phải)
  const specificationsSection = (
    <Card
      style={{
        marginTop: "24px",
        borderRadius: "16px",
        background: "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
        border: "1px solid rgba(102, 126, 234, 0.1)",
        boxShadow: "0 4px 20px rgba(102, 126, 234, 0.08)",
      }}
    >
      <Title
        level={4}
        style={{
          marginBottom: "24px",
          color: "#1a1a1a",
          fontSize: "20px",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "4px",
            height: "24px",
            borderRadius: "2px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        />
        Thông tin chi tiết
      </Title>

      {/* Simple Text Information - No labels */}
      <Space
        direction="vertical"
        size="small"
        style={{ width: "100%" }}
      >
        {service.category_name && (
          <div>
            <Text style={{ fontSize: "14px", color: "#595959" }}>
              <TagOutlined style={{ marginRight: "8px", color: "#8c8c8c" }} />
              {service.category_name}
            </Text>
          </div>
        )}
        {service.service_type_name && (
          <div>
            <Text style={{ fontSize: "14px", color: "#595959" }}>
              <SettingOutlined style={{ marginRight: "8px", color: "#8c8c8c" }} />
              {service.service_type_name}
            </Text>
          </div>
        )}
        <div>
          <Text style={{ fontSize: "14px", color: "#595959" }}>
            <ClockCircleOutlined style={{ marginRight: "8px", color: "#8c8c8c" }} />
            {service.service_process?.estimated_duration ||
              service.estimated_duration ||
              "N/A"}{" "}
            phút
          </Text>
        </div>
        {/* Service Attributes */}
        {service.attribute_values && service.attribute_values.length > 0 && (
          <>
            <Divider style={{ margin: "16px 0" }} />
            <Space
              direction="vertical"
              size="small"
              style={{ width: "100%" }}
            >
              {service.attribute_values.map((attr, index) => (
                <div key={index}>
                  <Text style={{ fontSize: "14px", color: "#595959" }}>
                    <span style={{ fontWeight: 500, color: "#8c8c8c" }}>
                      {attr.attribute_name}:
                    </span>{" "}
                    <span style={{ fontWeight: 600, color: "#1a1a1a" }}>
                      {attr.attribute_value}
                    </span>
                  </Text>
                </div>
              ))}
            </Space>
          </>
        )}
      </Space>
    </Card>
  );

  const tabItems = [
    {
      key: "description",
      label: "Mô tả",
      children: (
        <div>
          <Paragraph style={{ fontSize: "15px", lineHeight: "1.8", color: "#595959" }}>
            {service.description || "Chưa có mô tả"}
          </Paragraph>
        </div>
      ),
    },
    {
      key: "products",
      label: `Sản phẩm sử dụng (${service.service_products?.length || 0})`,
      children: productsTab,
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
          {imagesLoading ? (
            <Skeleton.Image
              active
              style={{ width: "100%", height: "500px", borderRadius: "12px" }}
            />
          ) : serviceImages && Array.isArray(serviceImages) && serviceImages.length > 0 ? (
            serviceImages.length > 1 ? (
              // Nhiều hình: Hiển thị Carousel
              <div style={{ borderRadius: "12px", overflow: "hidden" }}>
                <Image.PreviewGroup>
                  <Carousel
                    autoplay
                    dots
                    style={{
                      borderRadius: "12px",
                      overflow: "hidden",
                    }}
                  >
                    {serviceImages.map((img) => (
                      <div
                        key={img.media_id}
                        style={{
                          width: "100%",
                          height: "500px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#f0f0f0",
                        }}
                      >
                        <Image
                          src={img.media_url}
                          alt={img.alt_text || service.service_name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          preview={{
                            mask: "Xem ảnh",
                          }}
                        />
                      </div>
                    ))}
                  </Carousel>
                </Image.PreviewGroup>
              </div>
            ) : (
              // Chỉ có 1 hình: Hiển thị hình đơn
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
              <NextImage
                src={serviceImages[0]?.media_url || "/images/placeholder.jpg"}
                alt={serviceImages[0]?.alt_text || service.service_name}
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              </div>
            )
          ) : (
            // Không có hình: Hiển thị placeholder
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
              <NextImage
                src="/images/placeholder.jpg"
                alt={service.service_name}
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          )}
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
                style={{
                  margin: "0 0 16px 0",
                  fontSize: "32px",
                  fontWeight: 700,
                  color: "#1a1a1a",
                  lineHeight: "1.3",
                }}
              >
                {service.service_name}
              </Title>
            </div>
            <div
              style={{
                background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                padding: "20px 24px",
                borderRadius: "16px",
                border: "1px solid rgba(102, 126, 234, 0.2)",
              }}
            >
              <Text
                style={{
                  fontSize: "28px",
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {priceLoading ? "Đang tải..." : formatPrice(displayPrice)}
              </Text>
            </div>
            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "center",
                padding: "12px 16px",
                background: "rgba(102, 126, 234, 0.05)",
                borderRadius: "12px",
                border: "1px solid rgba(102, 126, 234, 0.1)",
              }}
            >
              <ClockCircleOutlined
                style={{ fontSize: "18px", color: "#667eea" }}
              />
              <Text style={{ fontSize: "14px", color: "#595959" }}>
                Thời gian thực hiện: <Text strong>{service.estimated_duration || "N/A"}</Text> phút
              </Text>
            </div>
          </Space>
          
          {/* Thông tin chi tiết section */}
          {specificationsSection}
        </Col>
      </Row>
      <Card
        style={{
          marginTop: "32px",
          borderRadius: "16px",
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <Tabs
          items={tabItems}
          style={{
            fontSize: "15px",
          }}
        />
      </Card>

      {/* Quy trình thực hiện - Section riêng */}
      {service.service_process && (
        <Card
          style={{
            marginTop: "32px",
            borderRadius: "16px",
            border: "1px solid rgba(102, 126, 234, 0.15)",
            background: "linear-gradient(135deg, #ffffff 0%, #fafbff 100%)",
            boxShadow: "0 4px 24px rgba(102, 126, 234, 0.1)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "32px" }}>
            {processTab}
          </div>
        </Card>
      )}
    </div>
  );
}
