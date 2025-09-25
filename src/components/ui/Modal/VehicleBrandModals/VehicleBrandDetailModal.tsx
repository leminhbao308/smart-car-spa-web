"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Descriptions,
  Tag,
  Avatar,
  Row,
  Col,
  Card,
  Typography,
  Button,
  Spin,
} from "antd";
import {
  CalendarOutlined,
} from "@ant-design/icons";
import { VehicleBrand } from "@/lib/api/types";
import { VehicleService } from "@/lib/api/services/vehicle.service";

const { Title, Text } = Typography;

interface VehicleBrandDetailModalProps {
  visible: boolean;
  onClose: () => void;
  brandId: string | null;
}

const VehicleBrandDetailModal: React.FC<VehicleBrandDetailModalProps> = ({
  visible,
  onClose,
  brandId,
}) => {
  const [brand, setBrand] = useState<VehicleBrand | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchBrandDetails = useCallback(async () => {
    if (!brandId) return;
    
    setLoading(true);
    try {
      const brandData = await VehicleService.getVehicleBrandById(brandId);
      setBrand(brandData);
    } catch (error) {
      console.error("Error fetching brand details:", error);
    } finally {
      setLoading(false);
    }
  }, [brandId]);

  useEffect(() => {
    if (visible && brandId) {
      fetchBrandDetails();
    }
  }, [visible, brandId, fetchBrandDetails]);

  if (!brand && !loading) return null;

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar
            size={40}
            src={brand?.brand_logo_url || undefined}
            style={{ backgroundColor: "#f0f0f0" }}
          >
            {brand?.brand_name.charAt(0)}
          </Avatar>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {brand?.brand_name}
            </Title>
            <Text type="secondary">{brand?.brand_code}</Text>
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
      width={800}
      styles={{
        body: { maxHeight: "70vh", overflowY: "auto" },
      }}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
        </div>
      ) : brand ? (
        <Row gutter={[24, 24]}>
          {/* Thông tin cơ bản */}
          <Col span={24}>
            <Card title="Thông tin cơ bản" size="small">
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Tên hãng">
                  <Text strong>{brand.brand_name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Mã hãng">
                  <Tag color="blue">{brand.brand_code}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Mô tả" span={2}>
                  <Text>{brand.description}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={brand.is_active ? "green" : "red"}>
                    {brand.is_active ? "Hoạt động" : "Không hoạt động"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Đã xóa">
                  <Tag color={brand.is_deleted ? "red" : "green"}>
                    {brand.is_deleted ? "Đã xóa" : "Chưa xóa"}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Thông tin hệ thống */}
          <Col span={24}>
            <Card title="Thông tin hệ thống" size="small">
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Ngày tạo">
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <CalendarOutlined style={{ color: "#666" }} />
                    <Text>
                      {new Date(brand.created_date).toLocaleDateString("vi-VN")}
                    </Text>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày cập nhật">
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <CalendarOutlined style={{ color: "#666" }} />
                    <Text>
                      {new Date(brand.modified_date).toLocaleDateString("vi-VN")}
                    </Text>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Người tạo">
                  <Text>{brand.created_by}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Người cập nhật">
                  <Text>{brand.modified_by}</Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Logo */}
          {brand.brand_logo_url && (
            <Col span={24}>
              <Card title="Logo hãng xe" size="small">
                <div style={{ textAlign: "center" }}>
                  <Avatar
                    size={120}
                    src={brand.brand_logo_url}
                    style={{ backgroundColor: "#f0f0f0" }}
                  >
                    {brand.brand_name.charAt(0)}
                  </Avatar>
                </div>
              </Card>
            </Col>
          )}
        </Row>
      ) : null}
    </Modal>
  );
};

export default VehicleBrandDetailModal;