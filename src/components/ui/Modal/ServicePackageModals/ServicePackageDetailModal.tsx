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
} from "antd";
import {
  ShoppingCartOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  GiftOutlined,
  StarOutlined,
  FireOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import formatCurrency from "@/components/utils/helper/currency.format.helper";
import { getStatusColor, getStatusLabel } from "@/components/utils/helper/center.helper";

const { Title, Text, Paragraph } = Typography;

interface ServicePackage {
  id: number;
  packageCode: string;
  packageName: string;
  description: string;
  services: Array<{
    id: number;
    serviceName: string;
    totalPrice: number;
    quantity: number;
  }>;
  totalPrice: number; // Chỉ có totalPrice = tổng giá các dịch vụ
  status: string;
  targetCustomers: string[];
  validityPeriod: number;
  maxUsage: number;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

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
      width={1000}
      style={{ top: 20 }}
    >
      <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
        {/* Header Information */}
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col span={16}>
              <div style={{ marginBottom: 8 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Mã gói: {data.packageCode}
                </Text>
              </div>
              <Title level={3} style={{ margin: 0, marginBottom: 8 }}>
                {data.packageName}
              </Title>
              <Paragraph style={{ margin: 0, color: "#666" }}>
                {data.description}
              </Paragraph>
            </Col>
            <Col span={8} style={{ textAlign: "right" }}>
              <Tag color={getStatusColor(data.status)} style={{ fontSize: 14, padding: "4px 12px" }}>
                {getStatusLabel(data.status)}
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
            {formatCurrency(data.totalPrice)}
          </div>
          <Row gutter={16} justify="center">
            <Col>
              <Space>
                <GiftOutlined style={{ color: "#1890ff" }} />
                <Text type="secondary" style={{ fontSize: 14 }}>
                  {data.services.length} dịch vụ
                </Text>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Services Information */}
        <Card title={
          <Space>
            <GiftOutlined />
            Dịch vụ trong gói ({data.services.length} dịch vụ)
          </Space>
        } style={{ marginBottom: 16 }}>
          <List
            dataSource={data.services}
            renderItem={(service, index) => (
              <List.Item key={service.id}>
                <List.Item.Meta
                  avatar={
                    <Badge count={index + 1} style={{ backgroundColor: "#1890ff" }}>
                      <div style={{ width: 40, height: 40, backgroundColor: "#f0f0f0", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <CheckCircleOutlined style={{ color: "#52c41a" }} />
                      </div>
                    </Badge>
                  }
                  title={
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Text strong style={{ fontSize: 14 }}>
                        {service.serviceName}
                      </Text>
                      <Tag color="blue">
                        x{service.quantity}
                      </Tag>
                    </div>
                  }
                  description={
                    <div>
                      <Text style={{ color: "#52c41a", fontSize: 16, fontWeight: "bold" }}>
                        {formatCurrency(service.totalPrice)}
                      </Text>
                      <Text type="secondary" style={{ marginLeft: 8 }}>
                        / lần
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>

        {/* Package Information */}
        <Card title={
          <Space>
            <ClockCircleOutlined />
            Thông tin gói
          </Space>
        } style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <div style={{ textAlign: "center", padding: 16, backgroundColor: "#e6f7ff", borderRadius: 8 }}>
                <ClockCircleOutlined style={{ fontSize: 24, color: "#1890ff", marginBottom: 8 }} />
                <div style={{ fontSize: 16, fontWeight: "bold", color: "#1890ff" }}>
                  {data.validityPeriod} ngày
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Thời gian hiệu lực
                </Text>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: "center", padding: 16, backgroundColor: "#f6ffed", borderRadius: 8 }}>
                <GiftOutlined style={{ fontSize: 24, color: "#52c41a", marginBottom: 8 }} />
                <div style={{ fontSize: 16, fontWeight: "bold", color: "#52c41a" }}>
                  {data.maxUsage} lần
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Sử dụng tối đa
                </Text>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: "center", padding: 16, backgroundColor: "#fff2e8", borderRadius: 8 }}>
                <StarOutlined style={{ fontSize: 24, color: "#fa8c16", marginBottom: 8 }} />
                <div style={{ fontSize: 16, fontWeight: "bold", color: "#fa8c16" }}>
                  {data.targetCustomers.length}
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Nhóm khách hàng
                </Text>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Target Customers */}
        {data.targetCustomers.length > 0 && (
          <Card title="Nhóm khách hàng mục tiêu" style={{ marginBottom: 16 }}>
            <div>
              {data.targetCustomers.map((customer, index) => (
                <Tag key={index} color="blue" style={{ marginBottom: 8 }}>
                  {customer}
                </Tag>
              ))}
            </div>
          </Card>
        )}

        {/* Features */}
        {data.features.length > 0 && (
          <Card title="Tính năng nổi bật" style={{ marginBottom: 16 }}>
            <List
              dataSource={data.features}
              renderItem={(feature, index) => (
                <List.Item key={index}>
                  <List.Item.Meta
                    avatar={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                    description={feature}
                  />
                </List.Item>
              )}
            />
          </Card>
        )}

        {/* Timestamps */}
        <Card title="Thông tin hệ thống">
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <Text type="secondary">Ngày tạo:</Text>
              <br />
              <Text strong>{data.createdAt}</Text>
            </Col>
            <Col span={12}>
              <Text type="secondary">Cập nhật lần cuối:</Text>
              <br />
              <Text strong>{data.updatedAt}</Text>
            </Col>
          </Row>
        </Card>
      </div>
    </Modal>
  );
};

export default ServicePackageDetailModal;
