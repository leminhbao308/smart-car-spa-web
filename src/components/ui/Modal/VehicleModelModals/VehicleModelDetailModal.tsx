"use client";
import React from "react";
import {
  Modal,
  Descriptions,
  Tag,
  Card,
  Typography,
  Space,
  Button,
  Divider,
  Row,
  Col,
  Rate,
  Badge,
} from "antd";
import {
  CarOutlined,
  StarOutlined,
  CalendarOutlined,
  SettingOutlined,
  DollarOutlined,
  FireOutlined,
  ThunderboltOutlined,
  TeamOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { vehicleModelsData, modelStatuses, fuelTypes, transmissionTypes, drivetrainTypes } from "@/components/utils/data/vehicle-models.data";
import { calculateModelAge, formatDimension } from "@/components/utils/helper/vehice.model.helper";

const { Title, Text, Paragraph } = Typography;

interface VehicleModelDetailModalProps {
  visible: boolean;
  onClose: () => void;
  modelId: number | null;
}

const VehicleModelDetailModal: React.FC<VehicleModelDetailModalProps> = ({
  visible,
  onClose,
  modelId,
}) => {
  const model = vehicleModelsData.find((m) => m.id === modelId);
  
  if (!model) return null;

  const statusConfig = modelStatuses.find((s) => s.value === model.status);

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              fontSize: 32,
              textAlign: "center",
              padding: "8px",
              backgroundColor: "#f0f0f0",
              borderRadius: "8px",
            }}
          >
            🚗
          </div>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {model.modelName}
            </Title>
            <Text type="secondary">{model.brandName} • {model.typeName}</Text>
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
      ]}
      width={1000}
      styles={{
        body: { maxHeight: "70vh", overflowY: "auto" },
      }}
    >
      <Row gutter={[24, 24]}>
        {/* Thông tin cơ bản */}
        <Col span={24}>
          <Card title="Thông tin cơ bản" size="small">
            <Descriptions column={3} size="small">
              <Descriptions.Item label="Tên model">
                <Text strong>{model.modelName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Mã model">
                <Tag color="blue">{model.modelCode}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Hãng xe">
                <Text>{model.brandName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Loại xe">
                <Tag color="green">{model.typeName}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Năm">
                <Text>{model.year}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Thế hệ">
                <Text>{model.generation}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={statusConfig?.color}>{statusConfig?.label}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày ra mắt">
                <Text>{new Date(model.launchDate).toLocaleDateString("vi-VN")}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Số xe">
                <Badge count={model.totalVehicles} style={{ backgroundColor: "#52c41a" }} />
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            <div>
              <Text strong>Mô tả:</Text>
              <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                {model.description}
              </Paragraph>
            </div>
          </Card>
        </Col>

        {/* Thông tin động cơ */}
        <Col span={12}>
          <Card title="Tùy chọn động cơ" size="small">
            {model.engineOptions.map((engine, index) => (
              <div key={index} style={{ marginBottom: 12, padding: 12, backgroundColor: "#f9f9f9", borderRadius: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <Text strong style={{ fontSize: 14 }}>{engine.engine}</Text>
                  <Tag color="blue">{engine.fuelType}</Tag>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <ThunderboltOutlined style={{ color: "#fa8c16" }} />
                  <Text style={{ fontSize: 12 }}>{engine.power}</Text>
                </div>
              </div>
            ))}
          </Card>
        </Col>

        {/* Hộp số và dẫn động */}
        <Col span={12}>
          <Card title="Hộp số & Dẫn động" size="small">
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ marginBottom: 8, display: "block" }}>Hộp số:</Text>
              <Space wrap>
                {model.transmissionOptions.map((transmission, index) => (
                  <Tag key={index} color="purple">{transmission}</Tag>
                ))}
              </Space>
            </div>
            <div>
              <Text strong style={{ marginBottom: 8, display: "block" }}>Dẫn động:</Text>
              <Space wrap>
                {model.drivetrainOptions.map((drivetrain, index) => (
                  <Tag key={index} color="green">{drivetrain}</Tag>
                ))}
              </Space>
            </div>
          </Card>
        </Col>

        {/* Thông tin giá và tiêu thụ */}
        <Col span={8}>
          <Card title="Phân khúc giá" size="small">
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <DollarOutlined style={{ fontSize: 32, color: "#52c41a", marginBottom: 8 }} />
              <div>
                <Text strong style={{ fontSize: 16 }}>
                  {model.priceRange}
                </Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Tiêu thụ nhiên liệu" size="small">
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <FireOutlined style={{ fontSize: 32, color: "#fa8c16", marginBottom: 8 }} />
              <div>
                <Text strong style={{ fontSize: 16, color: "#fa8c16" }}>
                  {model.fuelEfficiency}
                </Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Đánh giá" size="small">
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <Rate disabled value={model.averageRating} />
              <div style={{ marginTop: 8 }}>
                <Text strong>({model.averageRating}/5)</Text>
              </div>
            </div>
          </Card>
        </Col>

        {/* Kích thước */}
        <Col span={12}>
          <Card title="Kích thước" size="small">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: "bold", color: "#1890ff" }}>
                    {model.dimensions.length}
                  </div>
                  <Text type="secondary">Chiều dài</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: "bold", color: "#1890ff" }}>
                    {model.dimensions.width}
                  </div>
                  <Text type="secondary">Chiều rộng</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: "bold", color: "#1890ff" }}>
                    {model.dimensions.height}
                  </div>
                  <Text type="secondary">Chiều cao</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: "bold", color: "#1890ff" }}>
                    {model.dimensions.wheelbase}
                  </div>
                  <Text type="secondary">Chiều dài cơ sở</Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Tính năng */}
        <Col span={12}>
          <Card title="Tính năng nổi bật" size="small">
            <Row gutter={[8, 8]}>
              {model.features.map((feature, index) => (
                <Col key={index}>
                  <Tag color="blue" style={{ fontSize: 12, padding: "4px 8px" }}>
                    <SettingOutlined style={{ marginRight: 4 }} />
                    {feature}
                  </Tag>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* Màu sắc */}
        <Col span={12}>
          <Card title="Màu sắc có sẵn" size="small">
            <Row gutter={[8, 8]}>
              {model.colors.map((color, index) => (
                <Col key={index}>
                  <Tag color="default" style={{ fontSize: 12, padding: "4px 8px" }}>
                    {color}
                  </Tag>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* Đối thủ cạnh tranh */}
        <Col span={12}>
          <Card title="Đối thủ cạnh tranh" size="small">
            <Row gutter={[8, 8]}>
              {model.competitors.map((competitor, index) => (
                <Col key={index}>
                  <Tag color="orange" style={{ fontSize: 12, padding: "4px 8px" }}>
                    <TrophyOutlined style={{ marginRight: 4 }} />
                    {competitor}
                  </Tag>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* Thị trường mục tiêu */}
        <Col span={24}>
          <Card title="Thị trường mục tiêu" size="small">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <TeamOutlined style={{ color: "#1890ff" }} />
              <Text>{model.targetMarket}</Text>
            </div>
          </Card>
        </Col>

        {/* Thông tin hệ thống */}
        <Col span={24}>
          <Card title="Thông tin hệ thống" size="small">
            <Descriptions column={3} size="small">
              <Descriptions.Item label="Ngày tạo">
                <Text>{new Date(model.createdAt).toLocaleDateString("vi-VN")}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Cập nhật cuối">
                <Text>{new Date(model.updatedAt).toLocaleDateString("vi-VN")}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Tuổi model">
                <Text>{calculateModelAge(model.launchDate)} năm</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </Modal>
  );
};

export default VehicleModelDetailModal;
