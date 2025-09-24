"use client";
import React from "react";
import {
  Modal,
  Card,
  Row,
  Col,
  Descriptions,
  Tag,
  Badge,
  Typography,
  Space,
} from "antd";
import {
  ToolOutlined,
  CalendarOutlined,
  TagOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

interface ServiceType {
  id: number;
  serviceTypeCode: string;
  serviceTypeName: string;
  description: string;
  icon: string;
  color: string;
  status: string;
  totalServices: number;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

interface ServiceTypeDetailModalProps {
  visible: boolean;
  onCancel: () => void;
  data?: ServiceType | null;
}

const ServiceTypeDetailModal: React.FC<ServiceTypeDetailModalProps> = ({
  visible,
  onCancel,
  data,
}) => {
  if (!data) return null;

  const getStatusConfig = (status: string) => {
    const statusMap: { [key: string]: { label: string; color: string } } = {
      active: { label: "Hoạt động", color: "green" },
      inactive: { label: "Không hoạt động", color: "red" },
      archived: { label: "Lưu trữ", color: "gray" },
    };
    return statusMap[status] || { label: status, color: "default" };
  };

  const statusConfig = getStatusConfig(data.status);

  return (
    <Modal
      title={
        <Space>
          <span style={{ fontSize: 24 }}>{data.icon}</span>
          <Title level={4} style={{ margin: 0 }}>
            {data.serviceTypeName}
          </Title>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={null}
    >
      <div style={{ padding: "16px 0" }}>
        {/* Thông tin cơ bản */}
        <Card
          title={
            <Space>
              <TagOutlined />
              Thông tin cơ bản
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Descriptions column={2} size="small">
            <Descriptions.Item label="ID">
              <Badge count={data.id} style={{ backgroundColor: "#1890ff" }} />
            </Descriptions.Item>
            <Descriptions.Item label="Mã loại dịch vụ">
              <Text code>{data.serviceTypeCode}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tên loại dịch vụ" span={2}>
              <Text strong style={{ fontSize: 16 }}>
                {data.serviceTypeName}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả" span={2}>
              <Text>{data.description}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Màu sắc">
              <Tag color={data.color}>{data.color}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={statusConfig.color}>{statusConfig.label}</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Thông tin dịch vụ */}
        <Card
          title={
            <Space>
              <ShoppingOutlined />
              Thông tin dịch vụ
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <div style={{ textAlign: "center", padding: "16px" }}>
            <div style={{ fontSize: 32, color: "#1890ff", marginBottom: 8 }}>
              {data.totalServices}
            </div>
            <Text type="secondary">Tổng số dịch vụ</Text>
          </div>
        </Card>

        {/* Đặc điểm */}
        <Card
          title={
            <Space>
              <TagOutlined />
              Đặc điểm dịch vụ
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <div>
            {data.features && data.features.length > 0 ? (
              <div>
                {data.features.map((feature, index) => (
                  <Tag
                    key={index}
                    color="purple"
                    style={{ marginBottom: 8, fontSize: 12 }}
                  >
                    {feature}
                  </Tag>
                ))}
              </div>
            ) : (
              <Text type="secondary">Chưa có đặc điểm nào</Text>
            )}
          </div>
        </Card>

        {/* Thông tin thời gian */}
        <Card
          title={
            <Space>
              <CalendarOutlined />
              Thông tin thời gian
            </Space>
          }
        >
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Ngày tạo">
              {new Date(data.createdAt).toLocaleString("vi-VN")}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày cập nhật">
              {new Date(data.updatedAt).toLocaleString("vi-VN")}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </Modal>
  );
};

export default ServiceTypeDetailModal;
