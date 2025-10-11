"use client";

import React from "react";
import {
  Card,
  Tag,
  Space,
  Button,
  Tooltip,
  Typography,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  EditOutlined,
  EyeOutlined,
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
        display: "flex",
        flexDirection: "column",
        minHeight: "280px",
      }}
      styles={{ 
        body: { 
          padding: "16px", 
          flex: 1, 
          display: "flex", 
          flexDirection: "column" 
        } 
      }}
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
      <div style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <span style={{ fontSize: "24px", marginTop: "2px" }}>{typeInfo.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Title 
              level={4} 
              style={{ 
                margin: 0, 
                marginBottom: "4px",
                fontSize: "16px",
                fontWeight: 600,
                lineHeight: "1.2",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}
            >
              {bay.bay_name}
            </Title>
            {bay.bay_code && (
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Mã: {bay.bay_code}
              </Text>
            )}
          </div>
        </div>
      </div>

      {/* Status and Branch */}
      <div style={{ marginBottom: "16px" }}>
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          <Tag color="green" style={{ fontSize: "12px", padding: "4px 8px" }}>
            Hoạt động
          </Tag>
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



    </Card>
  );
};

export default ServiceBayCard;
