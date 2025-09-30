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
  Table,
  Image,
  Divider,
} from "antd";
import {
  ToolOutlined,
  CalendarOutlined,
  TagOutlined,
  DollarOutlined,
  StarOutlined,
  CameraOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { Service, SERVICE_STATUS_OPTIONS, SERVICE_TYPE_OPTIONS } from "@/lib/api/types/service.types";
import formatCurrency from "@/components/utils/helper/currency.format.helper";

const { Title, Text } = Typography;

interface ServiceDetailModalProps {
  visible: boolean;
  onCancel: () => void;
  data?: Service | null;
}

const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  visible,
  onCancel,
  data,
}) => {
  if (!data) return null;

  // Parse image URLs
  const imageUrls = data.imageUrls ? JSON.parse(data.imageUrls) : [];
  
  // Get skill level config
  const skillConfig = SERVICE_STATUS_OPTIONS.find(s => s.value === data.requiredSkillLevel);
  
  // Get service type config
  const typeConfig = SERVICE_TYPE_OPTIONS.find(t => t.value === data.serviceType);

  return (
    <Modal
      title={
        <Space>
          <ToolOutlined />
          <Title level={4} style={{ margin: 0 }}>
            {data.serviceName}
          </Title>
          {data.isFeatured && <Tag color="gold" icon={<StarOutlined />}>Nổi bật</Tag>}
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={1000}
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
              <Badge count={data.serviceId.slice(-8)} style={{ backgroundColor: "#1890ff" }} />
            </Descriptions.Item>
            <Descriptions.Item label="URL dịch vụ">
              <Space>
                <LinkOutlined />
                <Text code>{data.serviceUrl}</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Tên dịch vụ" span={2}>
              <Text strong style={{ fontSize: 16 }}>
                {data.serviceName}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Danh mục">
              <Tag color="blue">{data.categoryName}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Loại dịch vụ">
              <Tag color={typeConfig?.color}>{typeConfig?.label}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={data.isActive ? "green" : "red"}>
                {data.isActive ? "Hoạt động" : "Không hoạt động"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Gói dịch vụ">
              <Tag color={data.isPackage ? "green" : "default"}>
                {data.isPackage ? "Có" : "Không"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả" span={2}>
              <Text>{data.description}</Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Thông tin giá cả và thời gian */}
        <Card
          title={
            <Space>
              <DollarOutlined />
              Thông tin dịch vụ
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="Giá cơ bản"
                value={data.basePrice}
                formatter={(value) => formatCurrency(Number(value))}
                valueStyle={{ color: "#52c41a", fontSize: 18 }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Chi phí sản phẩm"
                value={data.productCost}
                formatter={(value) => formatCurrency(Number(value))}
                valueStyle={{ color: "#1890ff" }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Chi phí lao động"
                value={data.laborCost}
                formatter={(value) => formatCurrency(Number(value))}
                valueStyle={{ color: "#fa8c16" }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Thời gian thực hiện"
                value={data.standardDuration}
                suffix="phút"
                valueStyle={{ color: "#722ed1" }}
              />
            </Col>
          </Row>
          <Divider />
          <Row gutter={16}>
            <Col span={8}>
              <Statistic
                title="Kỹ năng yêu cầu"
                value={skillConfig?.label || data.requiredSkillLevel}
                valueStyle={{ color: skillConfig?.color || "#13c2c2" }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Số sản phẩm sử dụng"
                value={data.serviceProducts?.length || 0}
                suffix="sản phẩm"
                valueStyle={{ color: "#13c2c2" }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Yêu cầu ảnh"
                value={data.photoRequired ? "Có" : "Không"}
                valueStyle={{ color: data.photoRequired ? "#52c41a" : "#999" }}
              />
            </Col>
          </Row>
        </Card>

        {/* Chi tiết sản phẩm sử dụng */}
        {data.serviceProducts && data.serviceProducts.length > 0 && (
          <Card
            title={
              <Space>
                <ToolOutlined />
                Sản phẩm sử dụng
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Table
              dataSource={data.serviceProducts}
              pagination={false}
              size="small"
              rowKey={(record) => record.serviceProductId || record.productId || Math.random().toString()}
              columns={[
                {
                  title: "Tên sản phẩm",
                  dataIndex: "productName",
                  key: "productName",
                  render: (name: string) => name || "N/A",
                },
                {
                  title: "SKU",
                  dataIndex: "productSku",
                  key: "productSku",
                  width: 120,
                  render: (sku: string) => sku || "N/A",
                },
                {
                  title: "Thương hiệu",
                  dataIndex: "productBrand",
                  key: "productBrand",
                  width: 120,
                  render: (brand: string) => brand || "N/A",
                },
                {
                  title: "Số lượng",
                  dataIndex: "quantity",
                  key: "quantity",
                  width: 100,
                  render: (quantity: number) => (
                    <span style={{ fontWeight: 500 }}>{quantity}</span>
                  ),
                },
                {
                  title: "Đơn giá",
                  dataIndex: "unitPrice",
                  key: "unitPrice",
                  width: 120,
                  render: (price: number) => formatCurrency(price),
                },
                {
                  title: "Thành tiền",
                  dataIndex: "totalPrice",
                  key: "totalPrice",
                  width: 120,
                  render: (price: number) => (
                    <span style={{ fontWeight: 500, color: "#52c41a" }}>
                      {formatCurrency(price)}
                    </span>
                  ),
                },
                {
                  title: "Bắt buộc",
                  dataIndex: "isRequired",
                  key: "isRequired",
                  width: 100,
                  render: (isRequired: boolean) => (
                    <Tag color={isRequired ? "red" : "default"}>
                      {isRequired ? "Bắt buộc" : "Tùy chọn"}
                    </Tag>
                  ),
                },
                {
                  title: "Trạng thái",
                  dataIndex: "isActive",
                  key: "isActive",
                  width: 100,
                  render: (isActive: boolean) => (
                    <Tag color={isActive ? "green" : "red"}>
                      {isActive ? "Hoạt động" : "Không hoạt động"}
                    </Tag>
                  ),
                },
              ]}
            />
          </Card>
        )}

        {/* Hình ảnh dịch vụ */}
        {imageUrls && imageUrls.length > 0 && (
          <Card
            title={
              <Space>
                <CameraOutlined />
                Hình ảnh dịch vụ
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Row gutter={[16, 16]}>
              {imageUrls.map((url: string, index: number) => (
                <Col key={index} span={8}>
                  <Image
                    src={url}
                    alt={`Service image ${index + 1}`}
                    style={{ width: "100%", borderRadius: 8 }}
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                  />
                </Col>
              ))}
            </Row>
          </Card>
        )}

        {/* Ghi chú sản phẩm */}
        {data.serviceProducts && data.serviceProducts.some(sp => sp.notes) && (
          <Card
            title={
              <Space>
                <TagOutlined />
                Ghi chú sản phẩm
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <div>
              {data.serviceProducts
                .filter(sp => sp.notes)
                .map((sp, index) => (
                  <div key={index} style={{ marginBottom: 8 }}>
                    <Text strong>{sp.productName || `Sản phẩm ${index + 1}`}:</Text>
                    <Text style={{ marginLeft: 8 }}>{sp.notes}</Text>
                  </div>
                ))}
            </div>
          </Card>
        )}

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
            <Descriptions.Item label="Thời gian tạo">
              {data.audit?.createdAt ? new Date(data.audit.createdAt).toLocaleString("vi-VN") : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian cập nhật">
              {data.audit?.updatedAt ? new Date(data.audit.updatedAt).toLocaleString("vi-VN") : "N/A"}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </Modal>
  );
};

export default ServiceDetailModal;
