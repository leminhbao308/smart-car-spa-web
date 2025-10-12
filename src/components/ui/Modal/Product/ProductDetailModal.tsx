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
  Statistic,
  Image,
  Tooltip,
  Avatar,
  Button,
} from "antd";
import {
  ShoppingOutlined,
  CalendarOutlined,
  TagOutlined,
  InfoCircleOutlined,
  StarOutlined,
  BarcodeOutlined,
  ClockCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Product } from "@/lib/api/types/product.types";
import { SupplierDetailModal } from "../SupplierModal";
import { useSupplier } from "@/lib/api/hooks/useSuppliers";

const { Title, Text, Paragraph } = Typography;

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
  const [supplierModalVisible, setSupplierModalVisible] = React.useState(false);

  const { data: supplier } = useSupplier(
    supplierModalVisible && data ? data.supplier_id : null
  );

  if (!data) return null;

  console.log(data);
  const image =
    "https://media.istockphoto.com/id/1287044692/vi/anh/c%C3%B4ng-nh%C3%A2n-r%E1%BB%ADa-xe-m%C3%A0u-%C4%91%E1%BB%8F-b%E1%BA%B1ng-b%E1%BB%8Dt-bi%E1%BB%83n-tr%C3%AAn-r%E1%BB%ADa-xe.jpg?s=612x612&w=0&k=20&c=OvMdaw63P3ZwE9FIRsmEGpMvWLjfvzwEBHsErH1JmIk=";

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar
            size={40}
            icon={<ShoppingOutlined />}
            style={{ backgroundColor: "#1890ff" }}
          />
          <div>
            <Title level={4} style={{ margin: 0, color: "#262626" }}>
              {data.product_name}
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {data.sku} • {data.brand}
            </Text>
          </div>
          {data.is_featured && (
            <Tooltip title="Sản phẩm nổi bật">
              <StarOutlined style={{ color: "#faad14", fontSize: 20 }} />
            </Tooltip>
          )}
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={1000}
      footer={null}
      styles={{
        body: {
          padding: "24px",
          maxHeight: "70vh",
          overflowY: "auto",
          overflowX: "hidden",
        },
      }}
    >
      <div style={{ width: "100%", overflowX: "hidden" }}>
        {/* Header với thông tin tổng quan */}
        <Card
          size="small"
          style={{
            marginBottom: 16,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <Row gutter={24} align="middle">
            <Col span={6}>
              <Statistic
                title={
                  <span style={{ color: "rgba(255,255,255,0.8)" }}>Đơn vị</span>
                }
                value={data.unit_of_measure}
                valueStyle={{ color: "#fff", fontSize: 20 }}
                prefix={<TagOutlined />}
              />
            </Col>
            <Col span={6}>
              <div style={{ textAlign: "center" }}>
                <Badge
                  status={
                    data.is_deleted
                      ? "default"
                      : data.is_active
                      ? "success"
                      : "error"
                  }
                  text={
                    <span
                      style={{
                        color: data.is_deleted ? "#999" : "white",
                        fontSize: 16,
                        fontWeight: 500,
                      }}
                    >
                      {data.is_deleted
                        ? "Đã xóa"
                        : data.is_active
                        ? "Hoạt động"
                        : "Tạm dừng"}
                    </span>
                  }
                />
              </div>
            </Col>
          </Row>
        </Card>

        <Row gutter={[16, 16]}>
          {/* Cột trái - Hình ảnh và thông tin cơ bản */}
          <Col xs={24} lg={10}>
            {/* Hình ảnh sản phẩm */}
            <Card
              title={
                <Space>
                  <EyeOutlined />
                  Hình ảnh sản phẩm
                </Space>
              }
              size="default"
              style={{ marginBottom: 16 }}
            >
              {image ? (
                <Image
                  preview={true}
                  src={image}
                  alt={data?.product_name || ""}
                  style={{ width: "100%", borderRadius: 8, maxHeight: 300 }}
                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                />
              ) : (
                <div
                  style={{
                    height: 300,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#999",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <ShoppingOutlined style={{ fontSize: 48 }} />
                  <Text type="secondary">Chưa có hình ảnh</Text>
                </div>
              )}
            </Card>

            {/* Thông tin thời gian */}
            <Card
              title={
                <Space>
                  <CalendarOutlined />
                  Thông tin thời gian
                </Space>
              }
              size="small"
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={24}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Ngày tạo">
                      <Space>
                        <ClockCircleOutlined />
                        {new Date(data.created_date).toLocaleString("vi-VN")}
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Người tạo">
                      <Text code>{data.created_by}</Text>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col xs={24} sm={24}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Ngày cập nhật">
                      <Space>
                        <ClockCircleOutlined />
                        {new Date(data.modified_date).toLocaleString("vi-VN")}
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Người cập nhật">
                      <Text code>{data.modified_by}</Text>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Cột phải - Thông tin cơ bản */}
          <Col
            xs={24}
            lg={14}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <Card
              title={
                <Space>
                  <InfoCircleOutlined />
                  Thông tin cơ bản
                </Space>
              }
              size="small"
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Product ID">
                  <Text code>{data.product_id}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="SKU">
                  <Text code>{data.sku}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Barcode">
                  <Space>
                    <BarcodeOutlined />
                    <Text code>{data.barcode}</Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="URL">
                  <Text code>{data.product_url}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Loại sản phẩm">
                  <Tag color="blue">{data.product_type_name}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Đơn vị">
                  <Tag color="green">{data.unit_of_measure}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Thương hiệu">
                  <Text strong>{data.brand}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Model">
                  <Text strong>{data.model}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Giá cao nhất">
                  <Text strong style={{ color: "#52c41a" }}>
                    {data.peak_price?.toLocaleString()}đ
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Nhà cung cấp">
                  <Button
                    type="link"
                    size="small"
                    onClick={() => setSupplierModalVisible(true)}
                    style={{ padding: 0, height: "auto" }}
                  >
                    <Text code>Xem chi tiết</Text>
                  </Button>
                </Descriptions.Item>
                <Descriptions.Item label="Mô tả">
                  <Paragraph
                    ellipsis={{ rows: 3, expandable: true, symbol: "Xem thêm" }}
                    style={{ margin: 0 }}
                  >
                    {data.description}
                  </Paragraph>
                </Descriptions.Item>
              </Descriptions>
            </Card>
            {data.attribute_values && data.attribute_values.length > 0 && (
              <Card
                title={
                  <Space>
                    <TagOutlined />
                    Thuộc tính sản phẩm
                  </Space>
                }
                size="small"
                style={{ marginBottom: 16 }}
              >
                <Descriptions column={1} size="small">
                  {data.attribute_values.map((attr) => (
                    <Descriptions.Item
                      key={attr.attribute_id}
                      label={
                        <span>
                          {attr.attribute_name}
                          {attr.unit && (
                            <Text
                              type="secondary"
                              style={{ fontSize: 12, marginLeft: 4 }}
                            >
                              ({attr.unit})
                            </Text>
                          )}
                        </span>
                      }
                    >
                      <Text strong>
                        {attr.display_value ||
                          attr.value_text ||
                          attr.value_number}
                      </Text>
                    </Descriptions.Item>
                  ))}
                </Descriptions>
              </Card>
            )}
          </Col>
        </Row>
      </div>

      {/* Supplier Detail Modal */}
      <SupplierDetailModal
        visible={supplierModalVisible}
        onCancel={() => setSupplierModalVisible(false)}
        onEdit={() => {}} // Empty function since we don't need edit functionality
        supplier={supplier || null}
        loading={false}
        showEditButton={false}
      />
    </Modal>
  );
};

export default ProductDetailModal;
