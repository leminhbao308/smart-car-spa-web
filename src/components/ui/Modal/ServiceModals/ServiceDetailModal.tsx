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
} from "antd";
import {
  ToolOutlined,
  CalendarOutlined,
  TagOutlined,
  DollarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import formatCurrency from "@/components/utils/helper/currency.format.helper";

const { Title, Text } = Typography;

interface ServiceProduct {
  productId: number;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Service {
  id: number;
  serviceCode: string;
  serviceName: string;
  serviceTypeId: number;
  serviceTypeName: string;
  description: string;
  products: ServiceProduct[];
  laborCost: number;
  totalPrice: number;
  duration: number;
  status: string;
  features: string[];
  requirements: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

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

  const getStatusConfig = (status: string) => {
    const statusMap: { [key: string]: { label: string; color: string } } = {
      active: { label: "Hoạt động", color: "green" },
      inactive: { label: "Không hoạt động", color: "red" },
      suspended: { label: "Tạm ngừng", color: "volcano" },
      archived: { label: "Lưu trữ", color: "gray" },
    };
    return statusMap[status] || { label: status, color: "default" };
  };

  const statusConfig = getStatusConfig(data.status);

  return (
    <Modal
      title={
        <Space>
          <ToolOutlined />
          <Title level={4} style={{ margin: 0 }}>
            {data.serviceName}
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
            <Descriptions.Item label="Mã dịch vụ">
              <Text code>{data.serviceCode}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tên dịch vụ" span={2}>
              <Text strong style={{ fontSize: 16 }}>
                {data.serviceName}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Loại dịch vụ">
              <Tag color="blue">{data.serviceTypeName}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={statusConfig.color}>{statusConfig.label}</Tag>
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
            <Col span={8}>
              <Statistic
                title="Tổng giá dịch vụ"
                value={data.totalPrice}
                formatter={(value) => formatCurrency(Number(value))}
                valueStyle={{ color: "#52c41a", fontSize: 20 }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Chi phí sản phẩm"
                value={data.products?.reduce((sum, p) => sum + p.totalPrice, 0) || 0}
                formatter={(value) => formatCurrency(Number(value))}
                valueStyle={{ color: "#1890ff" }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Chi phí lao động"
                value={data.laborCost || 0}
                formatter={(value) => formatCurrency(Number(value))}
                valueStyle={{ color: "#fa8c16" }}
              />
            </Col>
          </Row>
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={12}>
              <Statistic
                title="Thời gian thực hiện"
                value={data.duration}
                suffix="phút"
                valueStyle={{ color: "#722ed1" }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Số sản phẩm sử dụng"
                value={data.products?.length || 0}
                suffix="sản phẩm"
                valueStyle={{ color: "#13c2c2" }}
              />
            </Col>
          </Row>
        </Card>

        {/* Chi tiết sản phẩm sử dụng */}
        {data.products && data.products.length > 0 && (
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
              dataSource={data.products}
              pagination={false}
              size="small"
              columns={[
                {
                  title: "Mã SP",
                  dataIndex: "productCode",
                  key: "productCode",
                  width: 100,
                },
                {
                  title: "Tên sản phẩm",
                  dataIndex: "productName",
                  key: "productName",
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
              ]}
            />
          </Card>
        )}

        {/* Đặc điểm dịch vụ */}
        {data.features && data.features.length > 0 && (
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
          </Card>
        )}

        {/* Yêu cầu */}
        {data.requirements && data.requirements.length > 0 && (
          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                Yêu cầu
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <div>
              {data.requirements.map((requirement, index) => (
                <Tag
                  key={index}
                  color="orange"
                  style={{ marginBottom: 8, fontSize: 12 }}
                >
                  {requirement}
                </Tag>
              ))}
            </div>
          </Card>
        )}

        {/* Ghi chú */}
        {data.notes && (
          <Card
            title={
              <Space>
                <TagOutlined />
                Ghi chú
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Text>{data.notes}</Text>
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

export default ServiceDetailModal;
