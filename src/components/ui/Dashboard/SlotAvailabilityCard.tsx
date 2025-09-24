"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Progress,
  Typography,
  Tag,
  Space,
  Tooltip,
  Button,
  Modal,
} from "antd";
import {
  CarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WrenchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Branch, CareSlot } from "@/components/utils/data/branches.data";

const { Title, Text } = Typography;

interface SlotAvailabilityCardProps {
  branch: Branch;
  onViewDetails?: () => void;
}

const SlotAvailabilityCard: React.FC<SlotAvailabilityCardProps> = ({
  branch,
  onViewDetails,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const getSlotTypeColor = (type: string) => {
    switch (type) {
      case "basic":
        return "blue";
      case "premium":
        return "gold";
      case "vip":
        return "purple";
      default:
        return "default";
    }
  };

  const getSlotTypeLabel = (type: string) => {
    switch (type) {
      case "basic":
        return "Cơ bản";
      case "premium":
        return "Cao cấp";
      case "vip":
        return "VIP";
      default:
        return type;
    }
  };

  const getSlotStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case "occupied":
        return <CarOutlined style={{ color: "#1890ff" }} />;
      case "maintenance":
        return <WrenchOutlined style={{ color: "#fa8c16" }} />;
      default:
        return <ExclamationCircleOutlined />;
    }
  };

  const getSlotStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "success";
      case "occupied":
        return "processing";
      case "maintenance":
        return "warning";
      default:
        return "default";
    }
  };

  const slotStats = {
    total: branch.careSlots.length,
    available: branch.careSlots.filter(s => s.status === "available").length,
    occupied: branch.careSlots.filter(s => s.status === "occupied").length,
    maintenance: branch.careSlots.filter(s => s.status === "maintenance").length,
  };

  const slotTypeStats = {
    basic: branch.careSlots.filter(s => s.type === "basic").length,
    premium: branch.careSlots.filter(s => s.type === "premium").length,
    vip: branch.careSlots.filter(s => s.type === "vip").length,
  };

  const availableByType = {
    basic: branch.careSlots.filter(s => s.type === "basic" && s.status === "available").length,
    premium: branch.careSlots.filter(s => s.type === "premium" && s.status === "available").length,
    vip: branch.careSlots.filter(s => s.type === "vip" && s.status === "available").length,
  };

  const utilizationRate = slotStats.total > 0 ? Math.round((slotStats.occupied / slotStats.total) * 100) : 0;

  return (
    <Card
      title={
        <Space>
          <CarOutlined />
          <span>{branch.name}</span>
          <Tag color={branch.status === "active" ? "green" : branch.status === "maintenance" ? "orange" : "red"}>
            {branch.status === "active" ? "Hoạt động" : branch.status === "maintenance" ? "Bảo trì" : "Ngừng hoạt động"}
          </Tag>
        </Space>
      }
      extra={
        <Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Cập nhật: {currentTime.toLocaleTimeString()}
          </Text>
          {onViewDetails && (
            <Button type="link" size="small" onClick={onViewDetails}>
              Chi tiết
            </Button>
          )}
        </Space>
      }
      style={{ height: "100%" }}
    >
      {/* Tổng quan slot */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <div style={{ textAlign: "center" }}>
            <Title level={3} style={{ margin: 0, color: "#52c41a" }}>
              {slotStats.available}
            </Title>
            <Text type="secondary">Trống</Text>
          </div>
        </Col>
        <Col span={6}>
          <div style={{ textAlign: "center" }}>
            <Title level={3} style={{ margin: 0, color: "#1890ff" }}>
              {slotStats.occupied}
            </Title>
            <Text type="secondary">Đang dùng</Text>
          </div>
        </Col>
        <Col span={6}>
          <div style={{ textAlign: "center" }}>
            <Title level={3} style={{ margin: 0, color: "#fa8c16" }}>
              {slotStats.maintenance}
            </Title>
            <Text type="secondary">Bảo trì</Text>
          </div>
        </Col>
        <Col span={6}>
          <div style={{ textAlign: "center" }}>
            <Title level={3} style={{ margin: 0, color: "#722ed1" }}>
              {utilizationRate}%
            </Title>
            <Text type="secondary">Sử dụng</Text>
          </div>
        </Col>
      </Row>

      {/* Progress bar tổng quan */}
      <div style={{ marginBottom: 16 }}>
        <Text strong>Tình trạng slot</Text>
        <Progress
          percent={utilizationRate}
          strokeColor={{
            "0%": "#52c41a",
            "50%": "#faad14",
            "100%": "#f5222d",
          }}
          showInfo={false}
          style={{ marginTop: 4 }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#8c8c8c" }}>
          <span>Trống ({slotStats.available})</span>
          <span>Đang dùng ({slotStats.occupied})</span>
          <span>Bảo trì ({slotStats.maintenance})</span>
        </div>
      </div>

      {/* Phân loại slot */}
      <div style={{ marginBottom: 16 }}>
        <Text strong>Phân loại slot</Text>
        <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
          <Col span={8}>
            <div style={{ textAlign: "center", padding: 8, backgroundColor: "#f0f8ff", borderRadius: 4 }}>
              <Tag color="blue">Cơ bản</Tag>
              <div style={{ fontSize: 12, color: "#8c8c8c" }}>
                {availableByType.basic}/{slotTypeStats.basic} trống
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ textAlign: "center", padding: 8, backgroundColor: "#fff7e6", borderRadius: 4 }}>
              <Tag color="gold">Cao cấp</Tag>
              <div style={{ fontSize: 12, color: "#8c8c8c" }}>
                {availableByType.premium}/{slotTypeStats.premium} trống
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ textAlign: "center", padding: 8, backgroundColor: "#f9f0ff", borderRadius: 4 }}>
              <Tag color="purple">VIP</Tag>
              <div style={{ fontSize: 12, color: "#8c8c8c" }}>
                {availableByType.vip}/{slotTypeStats.vip} trống
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Danh sách slot nhanh */}
      <div>
        <Text strong>Slot hiện tại</Text>
        <div style={{ marginTop: 8, maxHeight: 120, overflowY: "auto" }}>
          <Row gutter={[4, 4]}>
            {branch.careSlots.slice(0, 6).map((slot) => (
              <Col span={8} key={slot.id}>
                <Tooltip title={`${slot.name} - ${getSlotTypeLabel(slot.type)}`}>
                  <div
                    style={{
                      padding: 4,
                      borderRadius: 4,
                      backgroundColor: slot.status === "available" ? "#f6ffed" : 
                                      slot.status === "occupied" ? "#e6f7ff" : "#fff7e6",
                      border: `1px solid ${slot.status === "available" ? "#b7eb8f" : 
                                         slot.status === "occupied" ? "#91d5ff" : "#ffd591"}`,
                      textAlign: "center",
                      fontSize: 11,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
                      {getSlotStatusIcon(slot.status)}
                      <span>{slot.name}</span>
                    </div>
                    <Tag size="small" color={getSlotTypeColor(slot.type)}>
                      {slot.type}
                    </Tag>
                  </div>
                </Tooltip>
              </Col>
            ))}
          </Row>
          {branch.careSlots.length > 6 && (
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                +{branch.careSlots.length - 6} slot khác
              </Text>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default SlotAvailabilityCard;
