import React, { useState } from "react";
import {
  Modal,
  Card,
  Row,
  Col,
  Tag,
  Typography,
  Descriptions,
  Statistic,
  Space,
  Button,
  Table,
} from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CarOutlined,
  FileTextOutlined,
  StarOutlined,
  ShoppingCartOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { ServiceProcessInfoDto, ServiceProcessStepInfoDto } from "@/lib/api/types/service-process.types";

const { Text, Title } = Typography;

interface CareProcessDetailModalProps {
  open: boolean;
  onCancel: () => void;
  process: ServiceProcessInfoDto;
}

const CareProcessDetailModal: React.FC<CareProcessDetailModalProps> = ({
  open,
  onCancel,
  process,
}) => {
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [selectedStepProducts, setSelectedStepProducts] = useState<any[]>([]);
  const [selectedStepName, setSelectedStepName] = useState("");

  const handleViewProducts = (
    stepProducts: any[],
    stepName: string
  ) => {
    setSelectedStepProducts(stepProducts);
    setSelectedStepName(stepName);
    setProductModalOpen(true);
  };

  if (!process) return null;

  // Product columns for the table
  const productColumns = [
    {
      title: "Tên sản phẩm",
      dataIndex: "product_name",
      key: "product_name",
    },
    {
      title: "SKU",
      dataIndex: "product_sku",
      key: "product_sku",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity: number, record: any) => `${quantity} ${record.unit || 'cái'}`,
    },
    {
      title: "Giá",
      dataIndex: "product_cost",
      key: "product_cost",
      render: (cost: number) => cost ? `${cost.toLocaleString('vi-VN')} VNĐ` : 'N/A',
    },
  ];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            backgroundColor: '#f0f2f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CarOutlined style={{ color: '#666', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#333' }}>
              {process.name}
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Mã: {process.code}
            </Text>
          </div>
        </div>
      }
      open={open}
      onCancel={onCancel}
      width={1000}
      footer={[
        <Button key="close" onClick={onCancel}>
          Đóng
        </Button>
      ]}
      destroyOnHidden
    >
      <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {/* Header Stats */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <Statistic
                title="Số bước"
                value={process.step_count}
                valueStyle={{ color: "#1890ff", fontSize: 20 }}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <Statistic
                title="Thời gian ước tính"
                value={process.estimated_duration}
                suffix="phút"
                valueStyle={{ color: "#52c41a", fontSize: 20 }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <Statistic
                title="Trạng thái"
                value={process.is_active ? "Hoạt động" : "Không hoạt động"}
                valueStyle={{ color: process.is_active ? "#52c41a" : "#ff4d4f", fontSize: 16 }}
                prefix={process.is_active ? <CheckCircleOutlined /> : <CheckCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Process Info */}
        <Card title="Thông tin quy trình" size="small" style={{ marginBottom: 16 }}>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Tên quy trình">
              <Text strong>{process.name}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Mã quy trình">
              <Text code>{process.code}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              <Text>{process.description || "Không có mô tả"}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Quy trình mặc định">
              <Tag color={process.is_default ? "green" : "default"}>
                {process.is_default ? "Có" : "Không"}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Process Steps */}
        <Card title="Các bước thực hiện" size="small">
          {process.process_steps && process.process_steps.length > 0 ? (
            <div style={{ position: "relative", paddingLeft: 40 }}>
              {process.process_steps.map((step: ServiceProcessStepInfoDto, index: number) => (
                <div
                  key={step.id}
                  style={{ position: "relative", marginBottom: 24 }}
                >
                  {/* Timeline Line */}
                  {index < process.process_steps!.length - 1 && (
                    <div
                      style={{
                        position: "absolute",
                        left: 20,
                        top: 40,
                        width: 2,
                        height: "calc(100% + 24px)",
                        backgroundColor: "#d9d9d9",
                        zIndex: 1,
                      }}
                    />
                  )}

                  {/* Step Number */}
                  <div
                    style={{
                      position: "absolute",
                      left: -40,
                      top: 0,
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: "#1890ff",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      fontSize: 16,
                      border: "4px solid white",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                      zIndex: 2,
                    }}
                  >
                    {step.step_order || index + 1}
                  </div>

                  {/* Step Card */}
                  <Card
                    size="small"
                    style={{
                      marginLeft: 20,
                      border: "1px solid #e8e8e8",
                      borderRadius: 8,
                    }}
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Text strong style={{ fontSize: 16 }}>{step.name}</Text>
                          <div style={{ fontSize: 12, color: '#666' }}>
                            Thời gian: {step.estimated_time || "N/A"} phút
                          </div>
                        </div>
                        <div>
                          <Tag color={step.is_required ? "green" : "default"}>
                            {step.is_required ? "Bắt buộc" : "Tùy chọn"}
                          </Tag>
                        </div>
                      </div>
                    }
                    extra={
                      step.step_products && step.step_products.length > 0 && (
                        <Button
                          type="link"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => handleViewProducts(step.step_products, step.name)}
                        >
                          Xem sản phẩm ({step.step_products.length})
                        </Button>
                      )
                    }
                  >
                    <div style={{ marginBottom: 12 }}>
                      <Text>{step.description || "Không có mô tả"}</Text>
                    </div>

                    {/* Products Summary */}
                    {step.step_products && step.step_products.length > 0 && (
                      <div>
                        <Text strong style={{ color: "#52c41a" }}>
                          <ShoppingCartOutlined style={{ marginRight: 4 }} />
                          Sản phẩm sử dụng ({step.step_products.length}):
                        </Text>
                        <div style={{ marginTop: 8, maxHeight: 120, overflowY: 'auto' }}>
                          {step.step_products.map((product, productIndex) => (
                            <div
                              key={productIndex}
                              style={{
                                padding: 6,
                                backgroundColor: "#f6ffed",
                                borderRadius: 4,
                                marginBottom: 4,
                                fontSize: 12,
                                borderLeft: "3px solid #52c41a",
                              }}
                            >
                              <div style={{ fontWeight: 'bold' }}>{product.product_name}</div>
                              <div style={{ color: '#666' }}>
                                {product.quantity} {product.unit || 'cái'} - {product.product_cost?.toLocaleString('vi-VN')} VNĐ
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
              <FileTextOutlined style={{ fontSize: 48, marginBottom: 16 }} />
              <div>Chưa có bước nào được định nghĩa</div>
            </div>
          )}
        </Card>
      </div>

      {/* Product Detail Modal */}
      <Modal
        title={`Sản phẩm - ${selectedStepName}`}
        open={productModalOpen}
        onCancel={() => setProductModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setProductModalOpen(false)}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        <Table
          columns={productColumns}
          dataSource={selectedStepProducts}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Modal>
    </Modal>
  );
};

export default CareProcessDetailModal;