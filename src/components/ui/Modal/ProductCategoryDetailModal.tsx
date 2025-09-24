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
  Divider,
  Space,
} from "antd";
import {
  ShoppingOutlined,
  DollarOutlined,
  CalendarOutlined,
  TagOutlined,
} from "@ant-design/icons";
import formatCurrency from "@/components/utils/helper/currency.format.helper";

const { Title, Text } = Typography;

interface ProductCategory {
  id: number;
  categoryCode: string;
  categoryName: string;
  description: string;
  icon: string;
  color: string;
  parentId: null;
  status: string;
  totalProducts: number;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

interface ProductCategoryDetailModalProps {
  visible: boolean;
  onCancel: () => void;
  data?: ProductCategory | null;
}

const ProductCategoryDetailModal: React.FC<ProductCategoryDetailModalProps> = ({
  visible,
  onCancel,
  data,
}) => {
  if (!data) return null;

  return (
    <Modal
      title={
        <Space>
          <span style={{ fontSize: 24 }}>{data.icon}</span>
          <Title level={4} style={{ margin: 0 }}>
            {data.categoryName}
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
            <Descriptions.Item label="Mã danh mục">
              <Text code>{data.categoryCode}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tên danh mục" span={2}>
              <Text strong style={{ fontSize: 16 }}>
                {data.categoryName}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả" span={2}>
              <Text>{data.description}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={data.status === "active" ? "green" : "red"}>
                {data.status === "active" ? "Hoạt động" : "Không hoạt động"}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Thông tin sản phẩm */}
        <Card
          title={
            <Space>
              <ShoppingOutlined />
              Thông tin sản phẩm
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <div style={{ textAlign: "center", padding: "16px" }}>
            <div style={{ fontSize: 32, color: "#1890ff", marginBottom: 8 }}>
              {data.totalProducts}
            </div>
            <Text type="secondary">Tổng số sản phẩm</Text>
          </div>
        </Card>

        {/* Đặc điểm */}
        <Card
          title={
            <Space>
              <TagOutlined />
              Đặc điểm sản phẩm
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

export default ProductCategoryDetailModal;
