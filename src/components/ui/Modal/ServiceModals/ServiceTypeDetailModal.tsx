"use client";
import React from "react";
import {
  Modal,
  Card,
  Descriptions,
  Tag,
  Badge,
  Typography,
  Space,
} from "antd";
import {
  CalendarOutlined,
  TagOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

import { ServiceType } from "@/lib/api/types/service-type.types";

interface ServiceTypeDetailModalProps {
  visible: boolean;
  onCancel: () => void;
  data?: ServiceType | null;
}

const ServiceTypeDetailModal: React.FC<ServiceTypeDetailModalProps> = ({
  visible,
  onCancel,
  data,
}) => {
  if (!data) return null;

  const getStatusConfig = (isActive: boolean) => {
    return isActive 
      ? { label: "Hoạt động", color: "green" }
      : { label: "Không hoạt động", color: "red" };
  };

  const statusConfig = getStatusConfig(data.isActive);

  return (
    <Modal
      title={
        <Space>
          <Title level={4} style={{ margin: 0 }}>
            {data.name}
          </Title>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={800}
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
              <Badge count={data.serviceTypeId} style={{ backgroundColor: "#1890ff" }} />
            </Descriptions.Item>
            <Descriptions.Item label="Mã loại dịch vụ">
              <Text code>{data.code}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tên loại dịch vụ" span={2}>
              <Text strong style={{ fontSize: 16 }}>
                {data.name}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả" span={2}>
              <Text>{data.description}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian mặc định">
              <Text>{data.defaultDuration ? `${data.defaultDuration} phút` : "Không xác định"}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={statusConfig.color}>{statusConfig.label}</Tag>
            </Descriptions.Item>
            {data.displayName && (
              <Descriptions.Item label="Tên hiển thị">
                <Text>{data.displayName}</Text>
              </Descriptions.Item>
            )}
            {data.version && (
              <Descriptions.Item label="Phiên bản">
                <Badge count={data.version} style={{ backgroundColor: "#52c41a" }} />
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* Thông tin thời gian */}
        <Card
          title={
            <Space>
              <CalendarOutlined />
              Thông tin thời gian
            </Space>
          }
        >
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Ngày tạo">
              {data.created_date ? new Date(data.created_date).toLocaleString("vi-VN") : "Không xác định"}
            </Descriptions.Item>
            <Descriptions.Item label="Người tạo">
              <Text>{data.created_by || "Không xác định"}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày cập nhật">
              {data.modified_date ? new Date(data.modified_date).toLocaleString("vi-VN") : "Không xác định"}
            </Descriptions.Item>
            <Descriptions.Item label="Người cập nhật">
              <Text>{data.modified_by || "Không xác định"}</Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </Modal>
  );
};

export default ServiceTypeDetailModal;
