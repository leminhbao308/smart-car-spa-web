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
  Statistic,
  Progress,
} from "antd";
import {
  ShoppingOutlined,
  DollarOutlined,
  CalendarOutlined,
  TagOutlined,
  InboxOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import formatCurrency from "@/components/utils/helper/currency.format.helper";

const { Title, Text } = Typography;

interface Product {
  id: number;
  productCode: string;
  name: string;
  categoryId: number;
  categoryName: string;
  brand: string;
  unit: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  maxStock: number;
  description: string;
  specifications: {
    [key: string]: string;
  };
  supplierId: number;
  supplierName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductDetailModalProps {
  visible: boolean;
  onCancel: () => void;
  data?: Product | null;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  visible,
  onCancel,
  data,
}) => {
  if (!data) return null;

  const profit = data.price - data.cost;
  const profitMargin = ((profit / data.cost) * 100).toFixed(1);
  const stockPercentage = (data.stock / data.maxStock) * 100;
  
  const getStatusConfig = (status: string) => {
    const statusMap: { [key: string]: { label: string; color: string } } = {
      active: { label: "Hoạt động", color: "green" },
      inactive: { label: "Không hoạt động", color: "red" },
      discontinued: { label: "Ngừng sản xuất", color: "orange" },
      suspended: { label: "Tạm ngừng cung cấp", color: "volcano" },
    };
    return statusMap[status] || { label: status, color: "default" };
  };

  const statusConfig = getStatusConfig(data.status);

  return (
    <Modal
      title={
        <Space>
          <ShoppingOutlined />
          <Title level={4} style={{ margin: 0 }}>
            {data.name}
          </Title>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={900}
      footer={null}
    >
      <div style={{ padding: "16px 0" }}>
        {/* Thông tin cơ bản */}
        <Card
          title={
            <Space>
              <InfoCircleOutlined />
              Thông tin cơ bản
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Descriptions column={2} size="small">
            <Descriptions.Item label="ID">
              <Badge count={data.id} style={{ backgroundColor: "#1890ff" }} />
            </Descriptions.Item>
            <Descriptions.Item label="Mã sản phẩm">
              <Text code>{data.productCode}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tên sản phẩm" span={2}>
              <Text strong style={{ fontSize: 16 }}>
                {data.name}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Thương hiệu">
              <Tag color="blue">{data.brand}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Loại sản phẩm">
              <Tag color="green">{data.categoryName}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Đơn vị">
              <Tag color="purple">{data.unit}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={statusConfig.color}>{statusConfig.label}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả" span={2}>
              <Text>{data.description}</Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Thông tin giá cả - Bảo mật */}
        <Card
          title={
            <Space>
              <DollarOutlined />
              Thông tin giá cả (Bảo mật)
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Statistic
                title="Giá bán"
                value={data.price}
                formatter={(value) => formatCurrency(Number(value))}
                valueStyle={{ color: "#52c41a" }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Giá nhập"
                value={data.cost}
                formatter={(value) => formatCurrency(Number(value))}
                valueStyle={{ color: "#1890ff" }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Lợi nhuận"
                value={profit}
                formatter={(value) => formatCurrency(Number(value))}
                valueStyle={{ color: profit > 0 ? "#52c41a" : "#f5222d" }}
                suffix={`(${profitMargin}%)`}
              />
            </Col>
          </Row>
          <div style={{ marginTop: 16, padding: 12, backgroundColor: "#fff7e6", borderRadius: 6, border: "1px solid #ffd591" }}>
            <Text type="warning" style={{ fontSize: 12 }}>
              ⚠️ Thông tin giá nhập và lợi nhuận chỉ hiển thị trong modal chi tiết để bảo mật
            </Text>
          </div>
        </Card>

        {/* Thông tin tồn kho */}
        <Card
          title={
            <Space>
              <InboxOutlined />
              Thông tin tồn kho
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <div style={{ textAlign: "center", padding: "16px" }}>
                <div style={{ fontSize: 32, color: "#1890ff", marginBottom: 8 }}>
                  {data.stock}
                </div>
                <Text type="secondary">Tồn kho hiện tại</Text>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ padding: "16px" }}>
                <div style={{ marginBottom: 8 }}>
                  <Text strong>Mức tồn kho: </Text>
                  <Progress
                    percent={stockPercentage}
                    status={
                      data.stock <= data.minStock
                        ? "exception"
                        : data.stock >= data.maxStock
                        ? "active"
                        : "normal"
                    }
                    size="small"
                  />
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  <div>Min: {data.minStock} {data.unit}</div>
                  <div>Max: {data.maxStock} {data.unit}</div>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Thông số kỹ thuật */}
        {data.specifications && Object.keys(data.specifications).length > 0 && (
          <Card
            title={
              <Space>
                <TagOutlined />
                Thông số kỹ thuật
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Row gutter={[16, 8]}>
              {Object.entries(data.specifications).map(([key, value]) => (
                <Col span={12} key={key}>
                  <div style={{ padding: "8px 0" }}>
                    <Text strong style={{ textTransform: "capitalize" }}>
                      {key}:{" "}
                    </Text>
                    <Text>{value}</Text>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        )}

        {/* Thông tin nhà cung cấp */}
        <Card
          title={
            <Space>
              <ShoppingOutlined />
              Thông tin nhà cung cấp
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Descriptions column={1} size="small">
            <Descriptions.Item label="ID nhà cung cấp">
              <Badge count={data.supplierId} style={{ backgroundColor: "#722ed1" }} />
            </Descriptions.Item>
            <Descriptions.Item label="Tên nhà cung cấp">
              <Text strong>{data.supplierName}</Text>
            </Descriptions.Item>
          </Descriptions>
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

export default ProductDetailModal;
