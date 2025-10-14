"use client";
import React from "react";
import {
  Modal,
  Card,
  Row,
  Col,
  Tag,
  Typography,
  Timeline,
  Progress,
  Divider,
  Space,
  Avatar,
  Statistic,
} from "antd";
import {
  ClockCircleOutlined,
  UserOutlined,
  CarOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ExclamationCircleOutlined,
  EnvironmentOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { ServiceProcessTrackingInfoDto, TrackingStatus } from "@/lib/api/types/service-process-tracking.types";
import { formatDate } from "@/components/utils/helper/date.format.helper";
import { formatTime } from "@/components/utils/helper/duration.format.helper";

const { Text, Title } = Typography;

interface TrackingDetailModalProps {
  open: boolean;
  onCancel: () => void;
  tracking: ServiceProcessTrackingInfoDto | null;
}

const TrackingDetailModal: React.FC<TrackingDetailModalProps> = ({
  open,
  onCancel,
  tracking,
}) => {
  if (!tracking) return null;

  const getStatusConfig = (status: TrackingStatus) => {
    const statusConfigs = {
      [TrackingStatus.PENDING]: { 
        label: "Chờ thực hiện", 
        color: "default", 
        icon: <ClockCircleOutlined /> 
      },
      [TrackingStatus.IN_PROGRESS]: { 
        label: "Đang thực hiện", 
        color: "blue", 
        icon: <PlayCircleOutlined /> 
      },
      [TrackingStatus.COMPLETED]: { 
        label: "Hoàn thành", 
        color: "green", 
        icon: <CheckCircleOutlined /> 
      },
      [TrackingStatus.CANCELLED]: { 
        label: "Đã hủy", 
        color: "red", 
        icon: <ExclamationCircleOutlined /> 
      },
    };
    return statusConfigs[status] || { 
      label: "Unknown", 
      color: "default", 
      icon: <ClockCircleOutlined /> 
    };
  };

  const statusConfig = getStatusConfig(tracking.status);

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 2) return "#52c41a"; // Green - Very efficient
    if (efficiency >= 1.5) return "#faad14"; // Orange - Good
    if (efficiency >= 1) return "#fa8c16"; // Orange - Average
    return "#f5222d"; // Red - Poor
  };

  const getEfficiencyLabel = (efficiency: number) => {
    if (efficiency >= 2) return "Rất hiệu quả";
    if (efficiency >= 1.5) return "Hiệu quả";
    if (efficiency >= 1) return "Trung bình";
    return "Cần cải thiện";
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ToolOutlined style={{ color: "#1890ff" }} />
          <span>Chi tiết tracking</span>
          <Tag color={statusConfig.color} icon={statusConfig.icon}>
            {statusConfig.label}
          </Tag>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={900}
      destroyOnHidden
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Header Information */}
        <Card size="small">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                <CarOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                <Text strong>Thông tin xe</Text>
              </div>
              <div style={{ marginLeft: 24 }}>
                <div>
                  <Text strong>Biển số:</Text> {tracking.vehicleLicensePlate}
                </div>
                <div>
                  <Text strong>Khách hàng:</Text> {tracking.customerName}
                </div>
                <div>
                  <Text strong>SĐT:</Text> {tracking.customerPhone}
                </div>
                <div>
                  <Text strong>Mã booking:</Text> {tracking.bookingCode}
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                <ToolOutlined style={{ marginRight: 8, color: "#52c41a" }} />
                <Text strong>Thông tin bước dịch vụ</Text>
              </div>
              <div style={{ marginLeft: 24 }}>
                <div>
                  <Text strong>Bước {tracking.serviceStepOrder}:</Text> {tracking.serviceStepName}
                </div>
                <div>
                  <Text strong>Mô tả:</Text> {tracking.serviceStepDescription}
                </div>
                <div>
                  <Text strong>Thời gian ước tính:</Text> {tracking.estimatedTime} phút
                </div>
                <div>
                  <Text strong>Bắt buộc:</Text> 
                  <Tag color={tracking.isRequired ? "red" : "blue"} style={{ marginLeft: 4 }}>
                    {tracking.isRequired ? "Có" : "Không"}
                  </Tag>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Progress and Status */}
        <Card size="small" title="Tiến độ và trạng thái">
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Statistic
                title="Tiến độ"
                value={tracking.progressPercent || 0}
                precision={1}
                suffix="%"
                valueStyle={{ color: "#1890ff" }}
              />
              <Progress
                percent={tracking.progressPercent || 0}
                size="small"
                status={tracking.status === TrackingStatus.COMPLETED ? "success" : "active"}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Hiệu quả"
                value={tracking.efficiency || 0}
                precision={2}
                valueStyle={{ color: getEfficiencyColor(tracking.efficiency || 0) }}
                suffix="x"
              />
              <Text style={{ color: getEfficiencyColor(tracking.efficiency || 0), fontSize: 12 }}>
                {getEfficiencyLabel(tracking.efficiency || 0)}
              </Text>
            </Col>
            <Col span={8}>
              <Statistic
                title="Thời gian thực tế"
                value={tracking.actualDuration || 0}
                suffix="phút"
                valueStyle={{ color: "#52c41a" }}
              />
              <Text style={{ fontSize: 12, color: "#666" }}>
                Ước tính: {tracking.estimatedDuration} phút
              </Text>
            </Col>
          </Row>
        </Card>

        {/* Technician and Bay Information */}
        <Card size="small" title="Thông tin nhân viên và khu vực">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                <UserOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                <Text strong>Kỹ thuật viên</Text>
              </div>
              <div style={{ marginLeft: 24 }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
                  <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
                  <div>
                    <div>
                      <Text strong>{tracking.technicianName}</Text>
                    </div>
                    <div>
                      <Text style={{ fontSize: 12, color: "#666" }}>
                        {tracking.technicianCode}
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                <EnvironmentOutlined style={{ marginRight: 8, color: "#52c41a" }} />
                <Text strong>Khu vực dịch vụ</Text>
              </div>
              <div style={{ marginLeft: 24 }}>
                <div>
                  <Text strong>{tracking.bayName}</Text>
                </div>
                <div>
                  <Text style={{ fontSize: 12, color: "#666" }}>
                    Mã: {tracking.bayCode}
                  </Text>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Timeline */}
        <Card size="small" title="Timeline thực hiện">
          <Timeline
            items={[
              {
                children: (
                  <div>
                    <Text strong>Tạo tracking</Text>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      {formatDate(tracking.createdAt)}
                    </div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      Bởi: {tracking.createdBy}
                    </div>
                  </div>
                ),
                color: "blue",
              },
              ...(tracking.startTime ? [{
                children: (
                  <div>
                    <Text strong>Bắt đầu thực hiện</Text>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      {formatDate(tracking.startTime)}
                    </div>
                  </div>
                ),
                color: "green",
              }] : []),
              ...(tracking.endTime ? [{
                children: (
                  <div>
                    <Text strong>Hoàn thành</Text>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      {formatDate(tracking.endTime)}
                    </div>
                  </div>
                ),
                color: "green",
              }] : []),
              {
                children: (
                  <div>
                    <Text strong>Cập nhật cuối</Text>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      {tracking.lastUpdatedAt ? formatDate(tracking.lastUpdatedAt) : "Chưa có"}
                    </div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      Bởi: {tracking.lastUpdatedByName || "N/A"}
                    </div>
                  </div>
                ),
                color: "gray",
              },
            ]}
          />
        </Card>

        {/* Notes */}
        {tracking.notes && (
          <Card size="small" title="Ghi chú">
            <Text>{tracking.notes}</Text>
          </Card>
        )}

        {/* Evidence Media */}
        {tracking.evidenceMediaUrls && (
          <Card size="small" title="Bằng chứng">
            <Text>{tracking.evidenceMediaUrls}</Text>
          </Card>
        )}
      </Space>
    </Modal>
  );
};

export default TrackingDetailModal;
