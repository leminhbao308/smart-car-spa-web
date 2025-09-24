"use client";
import React from "react";
import {
  Modal,
  Descriptions,
  Tag,
  Avatar,
  Rate,
  Row,
  Col,
  Card,
  Typography,
  Space,
  Button,
  Divider,
} from "antd";
import {
  CarOutlined,
  CalendarOutlined,
  LinkOutlined,
  TrophyOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import {
  vehicleBrandsData,
  countries,
  brandStatuses,
} from "@/components/utils/data/vehicle-brands.data";
import { calculateBrandAge } from "@/components/utils/helper/vehicle.brand.helper";

const { Title, Text, Paragraph } = Typography;

interface VehicleBrandDetailModalProps {
  visible: boolean;
  onClose: () => void;
  brandId: number | null;
}

const VehicleBrandDetailModal: React.FC<VehicleBrandDetailModalProps> = ({
  visible,
  onClose,
  brandId,
}) => {
  const brand = vehicleBrandsData.find((b) => b.id === brandId);

  if (!brand) return null;

  const countryConfig = countries.find((c) => c.label === brand.country);
  const statusConfig = brandStatuses.find((s) => s.value === brand.status);

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar
            size={40}
            src={brand.logo}
            style={{ backgroundColor: "#f0f0f0" }}
          >
            {brand.brandName.charAt(0)}
          </Avatar>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {brand.brandName}
            </Title>
            <Text type="secondary">{brand.brandCode}</Text>
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
              <Descriptions.Item label="Tên hãng">
                <Text strong>{brand.brandName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Mã hãng">
                <Tag color="blue">{brand.brandCode}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Quốc gia">
                <Space>
                  <span style={{ fontSize: 16 }}>{countryConfig?.flag}</span>
                  <Text>{brand.country}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Năm thành lập">
                <Space>
                  <CalendarOutlined />
                  <Text>{brand.foundedYear}</Text>
                  <Text type="secondary">
                    ({calculateBrandAge(brand.foundedYear)} tuổi)
                  </Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={statusConfig?.color}>{statusConfig?.label}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Website">
                <Button
                  type="link"
                  icon={<LinkOutlined />}
                  onClick={() => window.open(brand.website, "_blank")}
                  style={{ padding: 0 }}
                >
                  Truy cập website
                </Button>
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            <div>
              <Text strong>Mô tả:</Text>
              <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                {brand.description}
              </Paragraph>
            </div>
          </Card>
        </Col>

        {/* Thống kê */}
        <Col span={12}>
          <Card title="Thống kê" size="small">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#1890ff",
                    }}
                  >
                    {brand.totalModels}
                  </div>
                  <Text type="secondary">Model</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#52c41a",
                    }}
                  >
                    {brand.totalVehicles}
                  </div>
                  <Text type="secondary">Xe</Text>
                </div>
              </Col>
            </Row>
            <Divider />
            <div>
              <Text strong>Đánh giá trung bình:</Text>
              <div style={{ marginTop: 8 }}>
                <Rate disabled value={brand.averageRating} />
                <Text style={{ marginLeft: 8 }}>({brand.averageRating}/5)</Text>
              </div>
            </div>
          </Card>
        </Col>

        {/* Phân khúc giá */}
        <Col span={12}>
          <Card title="Phân khúc giá" size="small">
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <DollarOutlined
                style={{ fontSize: 32, color: "#52c41a", marginBottom: 8 }}
              />
              <div>
                <Text strong style={{ fontSize: 16 }}>
                  {brand.priceRange}
                </Text>
              </div>
            </div>
          </Card>
        </Col>

        {/* Model phổ biến */}
        <Col span={24}>
          <Card title="Model phổ biến" size="small">
            <Row gutter={[8, 8]}>
              {brand.popularModels.map((model, index) => (
                <Col key={index}>
                  <Tag
                    color="blue"
                    style={{ fontSize: 12, padding: "4px 8px" }}
                  >
                    <CarOutlined style={{ marginRight: 4 }} />
                    {model}
                  </Tag>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* Đặc điểm nổi bật */}
        <Col span={24}>
          <Card title="Đặc điểm nổi bật" size="small">
            <Row gutter={[8, 8]}>
              {brand.specialties.map((specialty, index) => (
                <Col key={index}>
                  <Tag
                    color="green"
                    style={{ fontSize: 12, padding: "4px 8px" }}
                  >
                    <TrophyOutlined style={{ marginRight: 4 }} />
                    {specialty}
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
                <Text>
                  {new Date(brand.createdAt).toLocaleDateString("vi-VN")}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Cập nhật cuối">
                <Text>
                  {new Date(brand.updatedAt).toLocaleDateString("vi-VN")}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </Modal>
  );
};

export default VehicleBrandDetailModal;
