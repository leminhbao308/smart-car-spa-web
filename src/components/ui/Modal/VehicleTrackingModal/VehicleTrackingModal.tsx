"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Card,
  Table,
  Tag,
  Typography,
  Row,
  Col,
  Progress,
  Button,
  Space,
  Statistic,
  Timeline,
  Avatar,
  Divider,
} from "antd";
import {
  EyeOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  CarOutlined,
  ToolOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import TrackingDetailModal from "../TrackingDetailModal";
import {
  ServiceProcessTrackingInfoDto,
  TrackingStatus,
} from "@/lib/api/types/service-process-tracking.types";
import { BookingInfoDto } from "@/lib/api/types/booking.types";
import { formatDate } from "@/components/utils/helper/date.format.helper";
import { formatTime } from "@/components/utils/helper/duration.format.helper";

const { Text, Title } = Typography;

interface VehicleTrackingModalProps {
  open: boolean;
  onCancel: () => void;
  booking: BookingInfoDto;
  trackings: ServiceProcessTrackingInfoDto[];
}

const VehicleTrackingModal: React.FC<VehicleTrackingModalProps> = ({
  open,
  onCancel,
  booking,
  trackings,
}) => {
  const [selectedTracking, setSelectedTracking] =
    useState<ServiceProcessTrackingInfoDto | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const getStatusConfig = (status: TrackingStatus) => {
    const statusConfigs = {
      [TrackingStatus.PENDING]: {
        label: "Chờ thực hiện",
        color: "default",
        icon: <ClockCircleOutlined />,
      },
      [TrackingStatus.IN_PROGRESS]: {
        label: "Đang thực hiện",
        color: "blue",
        icon: <PlayCircleOutlined />,
      },
      [TrackingStatus.COMPLETED]: {
        label: "Hoàn thành",
        color: "green",
        icon: <CheckCircleOutlined />,
      },
      [TrackingStatus.CANCELLED]: {
        label: "Đã hủy",
        color: "red",
        icon: <ExclamationCircleOutlined />,
      },
    };
    return (
      statusConfigs[status] || {
        label: "Unknown",
        color: "default",
        icon: <ClockCircleOutlined />,
      }
    );
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 2) return "#52c41a";
    if (efficiency >= 1.5) return "#faad14";
    if (efficiency >= 1) return "#fa8c16";
    return "#f5222d";
  };

  const getEfficiencyLabel = (efficiency: number) => {
    if (efficiency >= 2) return "Rất hiệu quả";
    if (efficiency >= 1.5) return "Hiệu quả";
    if (efficiency >= 1) return "Trung bình";
    return "Cần cải thiện";
  };

  // Calculate overall statistics
  const totalSteps = trackings.length;
  const completedSteps = trackings.filter(
    (t) => t.status === TrackingStatus.COMPLETED
  ).length;
  const inProgressSteps = trackings.filter(
    (t) => t.status === TrackingStatus.IN_PROGRESS
  ).length;
  const pendingSteps = trackings.filter(
    (t) => t.status === TrackingStatus.PENDING
  ).length;
  const overallProgress =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const totalEstimatedTime = trackings.reduce(
    (sum, t) => sum + (t.estimatedTime || 0),
    0
  );
  const totalActualTime = trackings.reduce(
    (sum, t) => sum + (t.actualDuration || 0),
    0
  );
  const averageEfficiency =
    trackings.length > 0
      ? trackings.reduce((sum, t) => sum + (t.efficiency || 0), 0) /
        trackings.length
      : 0;

  const handleViewDetail = (tracking: ServiceProcessTrackingInfoDto) => {
    setSelectedTracking(tracking);
    setDetailModalOpen(true);
  };

  const columns = [
    {
      title: "STT",
      key: "stepOrder",
      width: 60,
      align: "center" as const,
      render: (
        _: ServiceProcessTrackingInfoDto,
        __: ServiceProcessTrackingInfoDto,
        index: number
      ) => index + 1,
    },
    {
      title: "Bước dịch vụ",
      key: "serviceStep",
      width: 200,
      render: (
        _: ServiceProcessTrackingInfoDto,
        tracking: ServiceProcessTrackingInfoDto
      ) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 14 }}>
            Bước {tracking.serviceStepOrder}: {tracking.serviceStepName}
          </div>
          <div style={{ marginTop: 4 }}>
            <Tag color={tracking.isRequired ? "red" : "blue"}>
              {tracking.isRequired ? "Bắt buộc" : "Tùy chọn"}
            </Tag>
            <Text style={{ fontSize: 11, color: "#666", marginLeft: 8 }}>
              {tracking.estimatedTime} phút
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Khu vực",
      key: "bay",
      width: 120,
      render: (
        _: ServiceProcessTrackingInfoDto,
        tracking: ServiceProcessTrackingInfoDto
      ) => (
        <div>
          <div style={{ fontSize: 12, fontWeight: 500 }}>
            {tracking.bayName}
          </div>
          <div style={{ fontSize: 10, color: "#666" }}>{tracking.bayCode}</div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 120,
      align: "center" as const,
      render: (
        _: ServiceProcessTrackingInfoDto,
        tracking: ServiceProcessTrackingInfoDto
      ) => {
        const statusConfig = getStatusConfig(tracking.status);
        return (
          <Tag color={statusConfig.color} icon={statusConfig.icon}>
            {statusConfig.label}
          </Tag>
        );
      },
    },

    {
      title: "Thời gian",
      key: "duration",
      width: 100,
      align: "center" as const,
      render: (
        _: ServiceProcessTrackingInfoDto,
        tracking: ServiceProcessTrackingInfoDto
      ) => (
        <div>
          <div style={{ fontSize: 12, fontWeight: 500 }}>
            {tracking.actualDuration || 0} phút
          </div>
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 80,
      align: "center" as const,
      render: (
        _: ServiceProcessTrackingInfoDto,
        tracking: ServiceProcessTrackingInfoDto
      ) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(tracking)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <>
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CarOutlined style={{ color: "#1890ff" }} />
            <span>Quá trình chăm sóc xe</span>
            <Tag color="blue">{booking.bookingCode}</Tag>
          </div>
        }
        open={open}
        onCancel={onCancel}
        footer={null}
        width={1400}
        destroyOnHidden
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* Vehicle Information */}
          <Card size="small">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <CarOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                  <Text strong>Thông tin xe</Text>
                </div>
                <div style={{ marginLeft: 24 }}>
                  <div>
                    <Text strong>Biển số:</Text> {booking.vehicleLicensePlate}
                  </div>
                  <div>
                    <Text strong>Khách hàng:</Text> {booking.customerName}
                  </div>
                  <div>
                    <Text strong>SĐT:</Text> {booking.customerPhone}
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <ToolOutlined style={{ marginRight: 8, color: "#52c41a" }} />
                  <Text strong>Thông tin dịch vụ</Text>
                </div>
                <div style={{ marginLeft: 24 }}>
                  <div>
                    <Text strong>Số bước:</Text> {totalSteps} bước
                  </div>
                  <div>
                    <Text strong>Thời gian ước tính:</Text> {totalEstimatedTime}{" "}
                    phút
                  </div>
                  <div>
                    <Text strong>Thời gian thực tế:</Text> {totalActualTime}{" "}
                    phút
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <EnvironmentOutlined
                    style={{ marginRight: 8, color: "#fa8c16" }}
                  />
                  <Text strong>Chi nhánh</Text>
                </div>
                <div style={{ marginLeft: 24 }}>
                  <div>
                    <Text strong>{booking.branchName}</Text>
                  </div>
                  <div>
                    <Text style={{ fontSize: 12, color: "#666" }}>
                      {booking.branchCode}
                    </Text>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Overall Statistics */}
          <Card size="small" title="Thống kê tổng quan">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Đang thực hiện"
                  value={inProgressSteps}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Đã hoàn thành"
                  value={completedSteps}
                  suffix={`/ ${totalSteps}`}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Col>
            </Row>
          </Card>

          {/* Tracking Steps Table */}
          <Card size="small" title="Chi tiết các bước thực hiện">
            <Table
              dataSource={trackings}
              columns={columns}
              rowKey="trackingId"
              pagination={false}
              size="small"
              scroll={{ x: 1000 }}
            />
          </Card>
        </Space>
      </Modal>

      {/* Tracking Detail Modal */}
      {selectedTracking && (
        <TrackingDetailModal
          open={detailModalOpen}
          onCancel={() => {
            setDetailModalOpen(false);
            setSelectedTracking(null);
          }}
          tracking={selectedTracking}
        />
      )}
    </>
  );
};

export default VehicleTrackingModal;
