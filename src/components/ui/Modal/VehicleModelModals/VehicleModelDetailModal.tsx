"use client";
import React from "react";
import {
  Modal,
  Descriptions,
  Tag,
  Card,
  Typography,
  Button,
  Divider,
  Row,
  Col,
  Spin,
  message,
} from "antd";
import { useVehicleModel } from "@/lib/api/hooks/useVehicleModels";
import { useVehicleBrandsDropdown, useVehicleTypesDropdown } from "@/lib/api/hooks";

const { Title, Text, Paragraph } = Typography;

interface VehicleModelDetailModalProps {
  visible: boolean;
  onCancel: () => void;
  modelId: string | null;
}

const VehicleModelDetailModal: React.FC<VehicleModelDetailModalProps> = ({
  visible,
  onCancel,
  modelId,
}) => {
  const { model, loading, error } = useVehicleModel(modelId);
  const { dropdownData: brandsData } = useVehicleBrandsDropdown();
  const { dropdownData: typesData } = useVehicleTypesDropdown();

  // Helper functions to get names by ID
  const getBrandName = (brandId: string) => {
    const brand = brandsData.find(b => b.brand_id === brandId);
    return brand ? brand.brand_name : `Brand ID: ${brandId}`;
  };

  const getTypeName = (typeId: string) => {
    const type = typesData.find(t => t.type_id === typeId);
    return type ? type.type_name : `Type ID: ${typeId}`;
  };

  // Show error message if there's an error
  if (error) {
    message.error("Không thể tải thông tin chi tiết model xe");
  }

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
              {model?.model_name || "Đang tải..."}
            </Title>
            <Text type="secondary">
              {model ? `${getBrandName(model.brand_id)} • ${getTypeName(model.type_id)}` : ""}
            </Text>
          </div>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Đóng
        </Button>,
      ]}
      width={900}
      styles={{
        body: { 
          maxHeight: "70vh", 
          overflowY: "auto",
          overflowX: "hidden"
        },
      }}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <Spin size="large" />
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Text type="danger">Không thể tải thông tin model xe</Text>
        </div>
      ) : model ? (
        <Row gutter={[24, 24]}>
          {/* Thông tin cơ bản */}
          <Col span={24}>
            <Card title="Thông tin cơ bản" size="small">
              <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                <Descriptions.Item label="Tên model">
                  <Text strong>{model.model_name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Mã model">
                  <Tag color="blue">{model.model_code}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Hãng xe">
                  <Text>{getBrandName(model.brand_id)}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Loại xe">
                  <Tag color="green">{getTypeName(model.type_id)}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={model.is_active ? "green" : "red"}>
                    {model.is_active ? "Hoạt động" : "Không hoạt động"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái xóa">
                  <Tag color={model.is_deleted ? "red" : "green"}>
                    {model.is_deleted ? "Đã xóa" : "Chưa xóa"}
                  </Tag>
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

          {/* Thông tin hệ thống */}
          <Col span={24}>
            <Card title="Thông tin hệ thống" size="small">
              <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                <Descriptions.Item label="Ngày tạo">
                  <Text>{new Date(model.created_date).toLocaleDateString("vi-VN")}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Cập nhật cuối">
                  <Text>{new Date(model.modified_date).toLocaleDateString("vi-VN")}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Người tạo">
                  <Text>{model.created_by}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Người cập nhật">
                  <Text>{model.modified_by}</Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      ) : null}
    </Modal>
  );
};

export default VehicleModelDetailModal;