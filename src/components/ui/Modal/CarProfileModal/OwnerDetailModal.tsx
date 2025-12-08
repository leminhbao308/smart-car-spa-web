"use client";
import React from "react";
import {
  Modal,
  Card,
  Row,
  Col,
  Descriptions,
  Tag,
  Space,
  Typography,
  Button,
  Avatar,
  Statistic,
  Timeline,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CarOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import formatCurrency from "@/components/utils/helper/currency.format.helper";

const { Title, Text, Paragraph } = Typography;

interface Customer {
  id: number;
  customerCode: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  customerType: string;
  totalOrders: number;
  totalSpent: number;
  lastVisit: string;
  joinDate: string;
  status: string;
  notes: string;
  vehicles?: Array<{
    id: number;
    brand: string;
    model: string;
    year: number;
    licensePlate: string;
    status: string;
  }>;
  preferredServices?: string[];
}

interface OwnerDetailModalProps {
  visible: boolean;
  onCancel: () => void;
  data: Customer | null;
}

const OwnerDetailModal: React.FC<OwnerDetailModalProps> = ({
  visible,
  onCancel,
  data,
}) => {
  if (!data) return null;

  // Customer type configuration
  const getCustomerTypeConfig = (type: string) => {
    const configs = {
      vip: { color: "gold", label: "VIP" },
      premium: { color: "purple", label: "Premium" },
      regular: { color: "blue", label: "Thường" },
      new: { color: "green", label: "Mới" },
    };
    return (
      configs[type as keyof typeof configs] || { color: "default", label: type }
    );
  };

  // Calculate customer statistics
  const customerAge =
    new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear();
  const membershipDuration = Math.floor(
    (new Date().getTime() - new Date(data.joinDate).getTime()) /
      (1000 * 60 * 60 * 24 * 30)
  );
  const averageOrderValue =
    data.totalOrders > 0 ? data.totalSpent / data.totalOrders : 0;

  return (
    <Modal
      title={
        <Space>
          <UserOutlined />
          Thông tin chủ xe
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={900}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Đóng
        </Button>,
      ]}
    >
      <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
        {/* Customer Overview */}
        <Card
          title={
            <Space>
              <UserOutlined />
              Thông tin tổng quan
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={6}>
              <div style={{ textAlign: "center" }}>
                <Avatar
                  size={80}
                  style={{ backgroundColor: "#1890ff", marginBottom: 8 }}
                >
                  {data.fullName?.charAt(0)}
                </Avatar>
                <div>
                  <Title level={4} style={{ margin: 0 }}>
                    {data.fullName}
                  </Title>
                  <Tag color={getCustomerTypeConfig(data.customerType).color}>
                    {getCustomerTypeConfig(data.customerType).label}
                  </Tag>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={18}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Statistic
                    title="Tổng đơn hàng"
                    value={data.totalOrders}
                    suffix="đơn"
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Statistic
                    title="Tổng chi tiêu"
                    value={data.totalSpent}
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Statistic
                    title="Giá trị TB/đơn"
                    value={averageOrderValue}
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Statistic
                    title="Thành viên"
                    value={membershipDuration}
                    suffix="tháng"
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>

        {/* Personal Information */}
        <Card
          title={
            <Space>
              <UserOutlined />
              Thông tin cá nhân
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Mã khách hàng">
              <Text code>{data.customerCode}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Họ tên">
              <Text strong>{data.fullName}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              <Space>
                <PhoneOutlined />
                <Text copyable>{data.phone}</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              <Space>
                <MailOutlined />
                <Text copyable>{data.email}</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">
              <Space>
                <CalendarOutlined />
                <Text>
                  {new Date(data.dateOfBirth).toLocaleDateString("vi-VN")}
                </Text>
                <Text type="secondary">({customerAge} tuổi)</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Giới tính">
              <Tag color={data.gender === "male" ? "blue" : "pink"}>
                {data.gender === "male" ? "Nam" : "Nữ"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ" span={2}>
              <Space>
                <EnvironmentOutlined />
                <Text>{data.address}</Text>
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Customer Timeline */}
        <Card
          title={
            <Space>
              <CalendarOutlined />
              Lịch sử hoạt động
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Timeline
            items={[
              {
                children: (
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>
                      Tham gia hệ thống
                    </div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      {new Date(data.joinDate).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                ),
                color: "green",
              },
              {
                children: (
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>
                      Lần ghé thăm cuối
                    </div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      {new Date(data.lastVisit).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                ),
                color: "blue",
              },
              {
                children: (
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>
                      Trạng thái hiện tại
                    </div>
                    <Tag color={data.status === "active" ? "green" : "red"}>
                      {data.status === "active"
                        ? "Hoạt động"
                        : "Không hoạt động"}
                    </Tag>
                  </div>
                ),
                color: data.status === "active" ? "green" : "red",
              },
            ]}
          />
        </Card>

        {/* Vehicle Information */}
        <Card
          title={
            <Space>
              <CarOutlined />
              Danh sách xe ({data.vehicles?.length || 0})
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          {data.vehicles && data.vehicles.length > 0 ? (
            <Row gutter={[16, 16]}>
              {data.vehicles.map((vehicle) => (
                <Col xs={24} sm={12} md={8} key={vehicle.id}>
                  <Card size="small" hoverable>
                    <div style={{ textAlign: "center" }}>
                      <CarOutlined
                        style={{
                          fontSize: 24,
                          color: "#1890ff",
                          marginBottom: 8,
                        }}
                      />
                      <div style={{ fontWeight: 500, marginBottom: 4 }}>
                        {vehicle.brand} {vehicle.model}
                      </div>
                      <div
                        style={{ fontSize: 12, color: "#666", marginBottom: 4 }}
                      >
                        {vehicle.year} • {vehicle.licensePlate}
                      </div>
                      <Tag
                        color={vehicle.status === "active" ? "green" : "orange"}
                      >
                        {vehicle.status === "active"
                          ? "Hoạt động"
                          : "Bảo dưỡng"}
                      </Tag>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <CarOutlined
                style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
              />
              <div>
                <Text type="secondary">Chưa có xe nào được đăng ký</Text>
              </div>
            </div>
          )}
        </Card>

        {/* Preferred Services */}
        {data.preferredServices && data.preferredServices.length > 0 && (
          <Card
            title="Dịch vụ ưa thích"
            style={{ marginBottom: 16 }}
            size="small"
          >
            <Space wrap>
              {data.preferredServices.map((service, index) => (
                <Tag key={index} color="blue">
                  {service}
                </Tag>
              ))}
            </Space>
          </Card>
        )}

        {/* Notes */}
        {data.notes && (
          <Card title="Ghi chú" size="small">
            <Paragraph>{data.notes}</Paragraph>
          </Card>
        )}
      </div>
    </Modal>
  );
};

export default OwnerDetailModal;
