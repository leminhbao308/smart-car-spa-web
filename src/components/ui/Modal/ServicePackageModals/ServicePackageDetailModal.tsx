"use client";
import React from "react";
import {
  Modal,
  Card,
  Row,
  Col,
  Typography,
  Tag,
  List,
  Space,
  Badge,
  Divider,
} from "antd";
import {
  ShoppingCartOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  GiftOutlined,
  StarOutlined,
  FireOutlined,
  CheckCircleOutlined,
  ToolOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import formatCurrency from "@/components/utils/helper/currency.format.helper";
import { ServicePackage, SERVICE_PACKAGE_TYPE_OPTIONS } from "@/lib/api/types/service-package.types";

const { Title, Text, Paragraph } = Typography;

interface ServicePackageDetailModalProps {
  open: boolean;
  onCancel: () => void;
  data: ServicePackage | null;
}

const ServicePackageDetailModal: React.FC<ServicePackageDetailModalProps> = ({
  open,
  onCancel,
  data,
}) => {
  if (!data) return null;

  const packageTypeConfig = SERVICE_PACKAGE_TYPE_OPTIONS.find(
    (type) => type.value === data.packageType
  );

  return (
    <Modal
      title={
        <Space>
          <ShoppingCartOutlined />
          Chi tiết gói dịch vụ
        </Space>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={1200}
      style={{ top: 20 }}
    >
      <div style={{ maxHeight: "80vh", overflowY: "auto" }}>
        {/* Header Information */}
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col span={16}>
              <div style={{ marginBottom: 8 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  ID: {data.packageId}
                </Text>
              </div>
              <Title level={3} style={{ margin: 0, marginBottom: 8 }}>
                {data.packageName}
              </Title>
              <Paragraph style={{ margin: 0, color: "#666" }}>
                {data.description}
              </Paragraph>
              <div style={{ marginTop: 8 }}>
                <Space>
                  <Tag color="blue">{data.categoryName}</Tag>
                  <Tag color={packageTypeConfig?.color}>
                    {packageTypeConfig?.label}
                  </Tag>
                </Space>
              </div>
            </Col>
            <Col span={8} style={{ textAlign: "right" }}>
              <Tag 
                color={data.isActive ? "green" : "red"} 
                style={{ fontSize: 14, padding: "4px 12px" }}
              >
                {data.isActive ? "Hoạt động" : "Không hoạt động"}
              </Tag>
            </Col>
          </Row>
        </Card>

        {/* Price Information */}
        <div
          style={{
            padding: 20,
            backgroundColor: "#f6ffed",
            borderRadius: 12,
            marginBottom: 16,
            border: "2px solid #b7eb8f",
            textAlign: "center",
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <Text strong style={{ fontSize: 16, color: "#52c41a" }}>
              Tổng giá gói dịch vụ
            </Text>
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#52c41a",
              fontWeight: "bold",
              marginBottom: 8,
            }}
          >
            {data.packagePrice ? formatCurrency(data.packagePrice) : "Chưa định giá"}
          </div>
          <Row gutter={16} justify="center">
            <Col>
              <Space>
                <ToolOutlined style={{ color: "#1890ff" }} />
                <Text type="secondary" style={{ fontSize: 14 }}>
                  DV: {formatCurrency(data.serviceCost)}
                </Text>
              </Space>
            </Col>
            <Col>
              <Space>
                <InboxOutlined style={{ color: "#fa8c16" }} />
                <Text type="secondary" style={{ fontSize: 14 }}>
                  SP: {formatCurrency(data.productCost)}
                </Text>
              </Space>
            </Col>
            <Col>
              <Space>
                <ClockCircleOutlined style={{ color: "#52c41a" }} />
                <Text type="secondary" style={{ fontSize: 14 }}>
                  {data.totalDuration} phút
                </Text>
              </Space>
            </Col>
          </Row>
        </div>

        <Row gutter={[16, 16]}>
          {/* Services Information */}
          <Col span={12}>
            <Card 
              title={
                <Space>
                  <ToolOutlined />
                  Dịch vụ trong gói ({data.packageServices.length} dịch vụ)
                </Space>
              } 
              style={{ marginBottom: 16 }}
            >
              {data.packageServices.length > 0 ? (
                <List
                  dataSource={data.packageServices}
                  renderItem={(service, index) => (
                    <List.Item key={service.servicePackageServiceId || index}>
                      <List.Item.Meta
                        avatar={
                          <Badge count={index + 1} style={{ backgroundColor: "#1890ff" }}>
                            <div style={{ 
                              width: 40, 
                              height: 40, 
                              backgroundColor: "#f0f0f0", 
                              borderRadius: 8, 
                              display: "flex", 
                              alignItems: "center", 
                              justifyContent: "center" 
                            }}>
                              <CheckCircleOutlined style={{ color: "#52c41a" }} />
                            </div>
                          </Badge>
                        }
                        title={
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Text strong style={{ fontSize: 14 }}>
                              {service.serviceName || "Dịch vụ không tên"}
                            </Text>
                            <Tag color="blue">
                              x{service.quantity}
                            </Tag>
                          </div>
                        }
                        description={
                          <div>
                            <Text style={{ color: "#52c41a", fontSize: 16, fontWeight: "bold" }}>
                              {formatCurrency(service.unitPrice)}
                            </Text>
                            <Text type="secondary" style={{ marginLeft: 8 }}>
                              / lần
                            </Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Tổng: {formatCurrency(service.totalPrice)}
                            </Text>
                            {service.notes && (
                              <div style={{ marginTop: 4 }}>
                                <Text type="secondary" style={{ fontSize: 11 }}>
                                  {service.notes}
                                </Text>
                              </div>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div style={{ textAlign: "center", padding: 20, color: "#999" }}>
                  <ToolOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                  <div>Chưa có dịch vụ nào</div>
                </div>
              )}
            </Card>
          </Col>

          {/* Products Information */}
          <Col span={12}>
            <Card 
              title={
                <Space>
                  <InboxOutlined />
                  Sản phẩm trong gói ({data.packageProducts.length} sản phẩm)
                </Space>
              } 
              style={{ marginBottom: 16 }}
            >
              {data.packageProducts.length > 0 ? (
                <List
                  dataSource={data.packageProducts}
                  renderItem={(product, index) => (
                    <List.Item key={product.servicePackageProductId || index}>
                      <List.Item.Meta
                        avatar={
                          <Badge count={index + 1} style={{ backgroundColor: "#fa8c16" }}>
                            <div style={{ 
                              width: 40, 
                              height: 40, 
                              backgroundColor: "#f0f0f0", 
                              borderRadius: 8, 
                              display: "flex", 
                              alignItems: "center", 
                              justifyContent: "center" 
                            }}>
                              <InboxOutlined style={{ color: "#fa8c16" }} />
                            </div>
                          </Badge>
                        }
                        title={
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Text strong style={{ fontSize: 14 }}>
                              {product.productName || "Sản phẩm không tên"}
                            </Text>
                            <Tag color="orange">
                              x{product.quantity}
                            </Tag>
                          </div>
                        }
                        description={
                          <div>
                            <Text style={{ color: "#fa8c16", fontSize: 16, fontWeight: "bold" }}>
                              {formatCurrency(product.unitPrice)}
                            </Text>
                            <Text type="secondary" style={{ marginLeft: 8 }}>
                              / đơn vị
                            </Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Tổng: {formatCurrency(product.totalPrice)}
                            </Text>
                            {product.productCode && (
                              <div style={{ marginTop: 4 }}>
                                <Text type="secondary" style={{ fontSize: 11 }}>
                                  Mã: {product.productCode}
                                </Text>
                              </div>
                            )}
                            {product.notes && (
                              <div style={{ marginTop: 4 }}>
                                <Text type="secondary" style={{ fontSize: 11 }}>
                                  {product.notes}
                                </Text>
                              </div>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div style={{ textAlign: "center", padding: 20, color: "#999" }}>
                  <InboxOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                  <div>Chưa có sản phẩm nào</div>
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Package URL */}
        {data.packageUrl && (
          <Card title="Thông tin URL" style={{ marginBottom: 16 }}>
            <Text type="secondary">URL gói dịch vụ:</Text>
            <br />
            <Text code>{data.packageUrl}</Text>
          </Card>
        )}

        {/* Images */}
        {data.imageUrls && data.imageUrls !== "[]" && (
          <Card title="Hình ảnh" style={{ marginBottom: 16 }}>
            <div>
              <Text type="secondary">URL hình ảnh:</Text>
              <br />
              <Text code style={{ fontSize: 12 }}>
                {data.imageUrls}
              </Text>
            </div>
          </Card>
        )}
      </div>
    </Modal>
  );
};

export default ServicePackageDetailModal;
