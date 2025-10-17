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
import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import {
  ServiceBay,
  BayStatus,
  BAY_STATUS_OPTIONS,
} from "@/lib/api/types/service-bay.types";

const { Text, Title } = Typography;

interface ServiceBayCardProps {
  bay: ServiceBay;
  onEdit: (bay: ServiceBay) => void;
  onView: (bay: ServiceBay) => void;
  loading?: boolean;
}

const ServiceBayCard: React.FC<ServiceBayCardProps> = ({
  bay,
  onEdit,
  onView,
  loading = false,
}) => {
  // getBayTypeInfo removed as BayType is no longer used

  const getBayStatusInfo = (status: BayStatus) => {
    return (
      BAY_STATUS_OPTIONS.find((opt) => opt.value === status) || {
        label: status,
        color: "default",
      }
    );
  };

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

  // const getAvailabilityStatus = () => {
  //   if (bay.is_maintenance) {
  //     return { text: "Bảo trì", color: "warning" };
  //   }
  //   if (bay.is_closed) {
  //     return { text: "Tạm đóng", color: "error" };
  //   }
  //   if (bay.is_available) {
  //     return { text: "Có sẵn", color: "success" };
  //   }
  //   return { text: "Bận", color: "processing" };
  // };

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
          flexDirection: "column",
        },
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
      ]}
    >
      {/* Header */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <span style={{ fontSize: "24px", marginTop: "2px" }}>🔧</span>
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
                textOverflow: "ellipsis",
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
          <Space size="small">
            <Tag
              color={statusInfo.color}
              style={{ fontSize: "12px", padding: "4px 8px" }}
            >
              {statusInfo.label}
            </Tag>
          </Space>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {bay.branch_name}
          </Text>
        </Space>
      </div>

      {/* Statistics */}
      <Row gutter={8} style={{ marginBottom: "12px" }}>
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
        <Col span={8}>
          <Statistic
            title="Kỹ thuật viên"
            value={bay.technician_count || 0}
            valueStyle={{ fontSize: "14px", color: "#1890ff" }}
          />
        </Col>
      </Row>

      {/* Technician Info */}
      {bay.technicians && bay.technicians.length > 0 && (
        <div style={{ marginBottom: "12px" }}>
          <Text type="secondary" style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>
            Kỹ thuật viên:
          </Text>
          <Space wrap size="small">
            {bay.technicians.slice(0, 3).map((technician) => (
              <Tag key={technician.technician_id} color="blue">
                {technician.technician_name}
              </Tag>
            ))}
            {bay.technicians.length > 3 && (
              <Tag color="default">
                +{bay.technicians.length - 3} khác
              </Tag>
            )}
          </Space>
        </div>
      )}
    </Card>
  );
};

export default ServiceBayCard;
