"use client";
import React from "react";
import {
  Modal,
  Descriptions,
  Tag,
  Space,
  Card,
  Row,
  Col,
  Typography,
} from "antd";
import { ServicePackageType } from "@/lib/api/types/service-package-type.types";
import {
  SERVICE_PACKAGE_TYPE_CUSTOMER_TYPE_OPTIONS,
} from "@/lib/api/types/service-package-type.types";

const { Title, Text } = Typography;

interface ServicePackageTypeDetailModalProps {
  visible: boolean;
  onCancel: () => void;
  data: ServicePackageType | null;
}

const ServicePackageTypeDetailModal: React.FC<
  ServicePackageTypeDetailModalProps
> = ({ visible, onCancel, data }) => {
  if (!data) return null;

  const getCustomerTypeLabel = (value: string) => {
    const option = SERVICE_PACKAGE_TYPE_CUSTOMER_TYPE_OPTIONS.find(
      (opt) => opt.value === value
    );
    return option ? option.label : value;
  };

  const getCustomerTypeColor = (value: string) => {
    const option = SERVICE_PACKAGE_TYPE_CUSTOMER_TYPE_OPTIONS.find(
      (opt) => opt.value === value
    );
    return option ? option.color : "default";
  };


  return (
    <Modal
      title={
        <Space>
          <span>Chi tiết loại gói dịch vụ</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      destroyOnHidden
    >
      <div style={{ padding: "16px 0" }}>
        {/* Header Information */}
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16} align="middle">
            <Col flex="auto">
              <Title level={4} style={{ margin: 0 }}>
                {data.name}
              </Title>
              <Text type="secondary" style={{ fontSize: 14 }}>
                Mã: {data.code}
              </Text>
            </Col>
            <Col>
              <Space>
                <Tag color={data.is_active ? "green" : "red"}>
                  {data.is_active ? "Hoạt động" : "Không hoạt động"}
                </Tag>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Basic Information */}
        <Card title="Thông tin cơ bản" style={{ marginBottom: 16 }}>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Mã loại gói">
              <Text code>{data.code}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tên loại gói">
              <Text strong>{data.name}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              {data.description ? (
                <Text>{data.description}</Text>
              ) : (
                <Text type="secondary">Không có mô tả</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Tên hiển thị">
              {data.display_name ? (
                <Text>{data.display_name}</Text>
              ) : (
                <Text type="secondary">Không có tên hiển thị</Text>
              )}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Configuration Information */}
        <Card title="Cấu hình" style={{ marginBottom: 16 }}>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Loại khách hàng áp dụng">
              <Tag color={getCustomerTypeColor(data.applicable_customer_type)}>
                {getCustomerTypeLabel(data.applicable_customer_type)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={data.is_active ? "green" : "red"}>
                {data.is_active ? "Hoạt động" : "Không hoạt động"}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Audit Information */}
        {(data.created_date ||
          data.modified_date ||
          data.created_by ||
          data.modified_by) && (
          <Card title="Thông tin kiểm toán">
            <Descriptions column={1} size="small">
              {data.created_date && (
                <Descriptions.Item label="Ngày tạo">
                  <Text>
                    {new Date(data.created_date).toLocaleString("vi-VN")}
                  </Text>
                </Descriptions.Item>
              )}
              {data.created_by && (
                <Descriptions.Item label="Người tạo">
                  <Text>{data.created_by}</Text>
                </Descriptions.Item>
              )}
              {data.modified_date && (
                <Descriptions.Item label="Ngày cập nhật">
                  <Text>
                    {new Date(data.modified_date).toLocaleString("vi-VN")}
                  </Text>
                </Descriptions.Item>
              )}
              {data.modified_by && (
                <Descriptions.Item label="Người cập nhật">
                  <Text>{data.modified_by}</Text>
                </Descriptions.Item>
              )}
              {data.version && (
                <Descriptions.Item label="Phiên bản">
                  <Text code>v{data.version}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        )}
      </div>
    </Modal>
  );
};

export default ServicePackageTypeDetailModal;
