"use client";

import React from "react";
import {
  Card,
  Tag,
  Space,
  Button,
  Tooltip,
  Badge,
  Typography,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  EditOutlined,
  EyeOutlined,
  ToolOutlined,
  CarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  ServiceBay,
  BayType,
  BayStatus,
  BAY_TYPE_OPTIONS,
  BAY_STATUS_OPTIONS,
} from "@/lib/api/types/service-bay.types";

const { Text, Title } = Typography;

interface ServiceBayCardProps {
  bay: ServiceBay;
  onEdit: (bay: ServiceBay) => void;
  onView: (bay: ServiceBay) => void;
  onStatusChange: (bay: ServiceBay, status: BayStatus) => void;
  loading?: boolean;
}

const ServiceBayCard: React.FC<ServiceBayCardProps> = ({
  bay,
  onEdit,
  onView,
  onStatusChange,
  loading = false,
}) => {
  const getBayTypeInfo = (type: BayType) => {
    return BAY_TYPE_OPTIONS.find(opt => opt.value === type) || {
      label: type,
      color: "#8c8c8c",
      icon: "🔧"
    };
  };

  const getBayStatusInfo = (status: BayStatus) => {
    return BAY_STATUS_OPTIONS.find(opt => opt.value === status) || {
      label: status,
      color: "default"
    };
  };

  const typeInfo = getBayTypeInfo(bay.bay_type);
  const statusInfo = getBayStatusInfo(bay.status);

  const getStatusColor = (status: BayStatus) => {
    switch (status) {
      case BayStatus.ACTIVE:
        return "#52c41a";
      case BayStatus.MAINTENANCE:
        return "#faad14";
      case BayStatus.CLOSED:
        return "#ff4d4f";
      case BayStatus.INACTIVE:
        return "#8c8c8c";
      default:
        return "#8c8c8c";
    }
  };

  const getAvailabilityStatus = () => {
    if (bay.is_maintenance) {
      return { text: "Bảo trì", color: "warning" };
    }
    if (bay.is_closed) {
      return { text: "Tạm đóng", color: "error" };
    }
    if (bay.is_available) {
      return { text: "Có sẵn", color: "success" };
    }
    return { text: "Bận", color: "processing" };
  };

  const availability = getAvailabilityStatus();

  return (
    <Card
      hoverable
      loading={loading}
      style={{
        height: "100%",
        borderRadius: "12px",
        border: `2px solid ${getStatusColor(bay.status)}20`,
        transition: "all 0.3s ease",
      }}
      styles={{ body: { padding: "16px" } }}
      actions={[
        <Tooltip title="Xem chi tiết" key="view">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => onView(bay)}
            style={{ color: "#1890ff" }}
          />
        </Tooltip>,
        <Tooltip title="Chỉnh sửa" key="edit">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(bay)}
            style={{ color: "#52c41a" }}
          />
        </Tooltip>,
        <Tooltip title="Quản lý trạng thái" key="status">
          <Button
            type="text"
            icon={<SettingOutlined />}
            onClick={() => onStatusChange(bay, bay.status)}
            style={{ color: "#722ed1" }}
          />
        </Tooltip>,
      ]}
    >
      {/* Header */}
      <div style={{ marginBottom: "12px" }}>
        <Row justify="space-between" align="top">
          <Col flex="auto">
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "20px" }}>{typeInfo.icon}</span>
                <Title level={5} style={{ margin: 0, flex: 1 }}>
                  {bay.bay_name}
                </Title>
                <Badge
                  status={availability.color as any}
                  text={availability.text}
                  style={{ fontSize: "12px" }}
                />
              </div>
              {bay.bay_code && (
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Mã: {bay.bay_code}
                </Text>
              )}
            </Space>
          </Col>
        </Row>
      </div>

      {/* Type and Status */}
      <div style={{ marginBottom: "12px" }}>
        <Space wrap>
          <Tag color={typeInfo.color} icon={<ToolOutlined />}>
            {typeInfo.label}
          </Tag>
          <Tag color={statusInfo.color}>
            {statusInfo.label}
          </Tag>
        </Space>
      </div>

      {/* Branch Info */}
      <div style={{ marginBottom: "12px" }}>
        <Space>
          <CarOutlined style={{ color: "#8c8c8c" }} />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {bay.branch_name}
          </Text>
        </Space>
      </div>

      {/* Statistics */}
      <Row gutter={8} style={{ marginBottom: "12px" }}>
        <Col span={8}>
          <Statistic
            title="Sức chứa"
            value={bay.capacity}
            suffix="xe"
            valueStyle={{ fontSize: "14px", color: "#1890ff" }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Đặt lịch"
            value={bay.total_bookings}
            valueStyle={{ fontSize: "14px", color: "#52c41a" }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Đang dùng"
            value={bay.active_bookings}
            valueStyle={{ fontSize: "14px", color: "#faad14" }}
          />
        </Col>
      </Row>

      {/* Description */}
      {bay.description && (
        <div style={{ marginBottom: "12px" }}>
          <Text
            type="secondary"
            style={{
              fontSize: "12px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {bay.description}
          </Text>
        </div>
      )}

      {/* Special Indicators */}
      <div style={{ marginTop: "8px" }}>
        <Space size="small">
          {bay.is_wash_bay && (
            <Tag color="blue" size="small">
              🚿 Rửa xe
            </Tag>
          )}
          {bay.is_repair_bay && (
            <Tag color="green" size="small">
              🔧 Sửa chữa
            </Tag>
          )}
          {bay.is_lift_bay && (
            <Tag color="purple" size="small">
              ⬆️ Nâng xe
            </Tag>
          )}
        </Space>
      </div>

      {/* Notes */}
      {bay.notes && (
        <div style={{ marginTop: "8px", padding: "8px", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
          <Text type="secondary" style={{ fontSize: "11px" }}>
            <ExclamationCircleOutlined style={{ marginRight: "4px" }} />
            {bay.notes}
          </Text>
        </div>
      )}
    </Card>
  );
};

export default ServiceBayCard;
