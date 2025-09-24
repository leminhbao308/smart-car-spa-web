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
  Progress,
} from "antd";
import {
  CarOutlined,
  StarOutlined,
  CalendarOutlined,
  TeamOutlined,
  TrophyOutlined,
  FireOutlined,
  HeartOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { vehicleTypesData, fuelEfficiencyLevels, comfortLevels, performanceLevels, typeStatuses } from "@/components/utils/data/vehicle-types.data";
import { getLevelColor, getLevelIcon } from "@/components/utils/helper/vehicle.type.helpe";

const { Title, Text, Paragraph } = Typography;

interface VehicleTypeDetailModalProps {
  visible: boolean;
  onClose: () => void;
  typeId: number | null;
}

const VehicleTypeDetailModal: React.FC<VehicleTypeDetailModalProps> = ({
  visible,
  onClose,
  typeId,
}) => {
  const vehicleType = vehicleTypesData.find((t) => t.id === typeId);
  
  if (!vehicleType) return null;

  const statusConfig = typeStatuses.find((s) => s.value === vehicleType.status);
  const fuelEfficiencyConfig = fuelEfficiencyLevels.find((f) => f.value === vehicleType.fuelEfficiency);
  const comfortConfig = comfortLevels.find((c) => c.value === vehicleType.comfort);
  const performanceConfig = performanceLevels.find((p) => p.value === vehicleType.performance);

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
            {vehicleType.icon}
          </div>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {vehicleType.typeName}
            </Title>
            <Text type="secondary">{vehicleType.typeCode}</Text>
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
      width={900}
      styles={{
        body: { maxHeight: "70vh", overflowY: "auto" },
      }}
    >
      <Row gutter={[24, 24]}>
        {/* Thông tin cơ bản */}
        <Col span={24}>
          <Card title="Thông tin cơ bản" size="small">
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Tên loại xe">
                <Text strong>{vehicleType.typeName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Mã loại xe">
                <Tag color="blue">{vehicleType.typeCode}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={statusConfig?.color}>{statusConfig?.label}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Phân khúc giá">
                <Text>{vehicleType.priceRange}</Text>
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            <div>
              <Text strong>Mô tả:</Text>
              <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                {vehicleType.description}
              </Paragraph>
            </div>
          </Card>
        </Col>

        {/* Đánh giá hiệu suất */}
        <Col span={8}>
          <Card title="Tiết kiệm nhiên liệu" size="small">
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>
                {fuelEfficiencyConfig?.icon}
              </div>
              <div>
                <Text strong style={{ fontSize: 16, color: fuelEfficiencyConfig?.color }}>
                  {fuelEfficiencyConfig?.label}
                </Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Mức độ thoải mái" size="small">
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>
                {comfortConfig?.icon}
              </div>
              <div>
                <Text strong style={{ fontSize: 16, color: comfortConfig?.color }}>
                  {comfortConfig?.label}
                </Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Hiệu suất" size="small">
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>
                {performanceConfig?.icon}
              </div>
              <div>
                <Text strong style={{ fontSize: 16, color: performanceConfig?.color }}>
                  {performanceConfig?.label}
                </Text>
              </div>
            </div>
          </Card>
        </Col>

        {/* Thống kê */}
        <Col span={12}>
          <Card title="Thống kê" size="small">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: "bold", color: "#1890ff" }}>
                    {vehicleType.totalModels}
                  </div>
                  <Text type="secondary">Model</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: "bold", color: "#52c41a" }}>
                    {vehicleType.totalVehicles}
                  </div>
                  <Text type="secondary">Xe</Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Đặc điểm */}
        <Col span={12}>
          <Card title="Đặc điểm" size="small">
            <Row gutter={[8, 8]}>
              {vehicleType.characteristics.map((characteristic, index) => (
                <Col key={index}>
                  <Tag color="blue" style={{ fontSize: 12, padding: "4px 8px" }}>
                    <CarOutlined style={{ marginRight: 4 }} />
                    {characteristic}
                  </Tag>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* Khách hàng mục tiêu */}
        <Col span={24}>
          <Card title="Khách hàng mục tiêu" size="small">
            <Row gutter={[8, 8]}>
              {vehicleType.targetCustomers.map((customer, index) => (
                <Col key={index}>
                  <Tag color="green" style={{ fontSize: 12, padding: "4px 8px" }}>
                    <TeamOutlined style={{ marginRight: 4 }} />
                    {customer}
                  </Tag>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* Hãng xe phổ biến */}
        <Col span={12}>
          <Card title="Hãng xe phổ biến" size="small">
            <Row gutter={[8, 8]}>
              {vehicleType.popularBrands.map((brand, index) => (
                <Col key={index}>
                  <Tag color="purple" style={{ fontSize: 12, padding: "4px 8px" }}>
                    <TrophyOutlined style={{ marginRight: 4 }} />
                    {brand}
                  </Tag>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* Ví dụ model */}
        <Col span={12}>
          <Card title="Ví dụ model" size="small">
            <Row gutter={[8, 8]}>
              {vehicleType.examples.map((example, index) => (
                <Col key={index}>
                  <Tag color="orange" style={{ fontSize: 12, padding: "4px 8px" }}>
                    <StarOutlined style={{ marginRight: 4 }} />
                    {example}
                  </Tag>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* Thông tin hệ thống */}
        <Col span={24}>
          <Card title="Thông tin hệ thống" size="small">
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Ngày tạo">
                <Text>{new Date(vehicleType.createdAt).toLocaleDateString("vi-VN")}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Cập nhật cuối">
                <Text>{new Date(vehicleType.updatedAt).toLocaleDateString("vi-VN")}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </Modal>
  );
};

export default VehicleTypeDetailModal;
