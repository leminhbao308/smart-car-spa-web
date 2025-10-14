"use client";
import React, { useState, useEffect } from "react";
import {
  Tag,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Avatar,
  notification,
} from "antd";
import {
  EyeOutlined,
  ClockCircleOutlined,
  CarOutlined,
  UserOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  StarOutlined,
} from "@ant-design/icons";
import AdminTable from "@/components/ui/Table/AdminTable";
import ServiceTrackingModal from "@/components/ui/Modal/ServiceTrackingModal";
import { formatDate } from "@/components/utils/helper/date.format.helper";
import { formatTime } from "@/components/utils/helper/duration.format.helper";
import { 
  useBookingsByStatus
} from "@/lib/api/hooks/useBooking";
import { 
  TrackingStatus
} from "@/lib/api/types/service-process-tracking.types";
import { 
  BookingInfoDto,
  BookingStatus
} from "@/lib/api/types/booking.types";

const { Text } = Typography;

// Helper functions
const getStatusConfig = (status: TrackingStatus) => {
  const statusConfigs = {
    [TrackingStatus.PENDING]: { label: "Chờ thực hiện", color: "default", icon: <ClockCircleOutlined /> },
    [TrackingStatus.IN_PROGRESS]: { label: "Đang thực hiện", color: "blue", icon: <PlayCircleOutlined /> },
    [TrackingStatus.COMPLETED]: { label: "Hoàn thành", color: "green", icon: <CheckCircleOutlined /> },
    [TrackingStatus.CANCELLED]: { label: "Đã hủy", color: "red", icon: <ExclamationCircleOutlined /> },
  };
  return statusConfigs[status] || { label: "Unknown", color: "default", icon: <ClockCircleOutlined /> };
};


const VehiclesInCarePage = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<BookingInfoDto | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  
  // API hooks
  const { data: inProgressBookings, isLoading: isLoadingBookings, error: bookingsError } = useBookingsByStatus(BookingStatus.IN_PROGRESS);
  
  
  // Combine bookings with their trackings
  const data = inProgressBookings?.data || [];
  
  // Error handling
  useEffect(() => {
    if (bookingsError) {
      notification.error({
        message: "Lỗi tải dữ liệu",
        description: "Có lỗi xảy ra khi tải dữ liệu xe đang chăm sóc",
        placement: "topRight",
      });
    }
  }, [bookingsError]);

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.IN_PROGRESS:
        return <PlayCircleOutlined />;
      case BookingStatus.COMPLETED:
        return <CheckCircleOutlined />;
      case BookingStatus.PAUSED:
        return <PauseCircleOutlined />;
      case BookingStatus.CANCELLED:
        return <ExclamationCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const columns = [
    {
      title: "Thông tin xe",
      dataIndex: "vehicleInfo",
      key: "vehicleInfo",
      width: 250,
      render: (_: unknown, record: BookingInfoDto) => (
        <div>
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 4 }}
          >
            <CarOutlined style={{ marginRight: 8, color: "#1890ff" }} />
            <Text strong style={{ fontSize: 14 }}>
              {record.vehicleBrandName} {record.vehicleModelName}
            </Text>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.vehicleLicensePlate} • {record.vehicleYear} •{" "}
            {record.vehicleColor}
          </Text>
          <div style={{ marginTop: 4 }}>
            <Text style={{ fontSize: 11, color: "#8c8c8c" }}>
              Khách hàng: {record.customerName}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Quy trình",
      dataIndex: "careProcessName",
      key: "careProcessName",
      width: 150,
      render: (_: unknown, record: BookingInfoDto) => (
        <div>
          <Text strong style={{ fontSize: 12 }}>
            {record.bookingItems?.length || 0} dịch vụ
          </Text>
          <div style={{ marginTop: 4 }}>
            <Text style={{ fontSize: 11, color: "#8c8c8c" }}>
              Thời gian: {formatTime(record.estimatedDurationMinutes || 0)}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "time",
      key: "time",
      width: 180,
      render: (_: unknown, record: BookingInfoDto) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <Text style={{ fontSize: 12 }}>
              Bắt đầu: {formatDate(record.actualStartAt || record.scheduledStartAt || record.preferredStartAt || new Date().toISOString())}
            </Text>
          </div>
          <div style={{ marginBottom: 4 }}>
            <Text style={{ fontSize: 12 }}>
              Dự kiến: {formatDate(record.scheduledEndAt || new Date().toISOString())}
            </Text>
          </div>
          {record.actualEndAt && (
            <div>
              <Text style={{ fontSize: 12, color: "#52c41a" }}>
                Hoàn thành: {formatDate(record.actualEndAt)}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Nhân viên",
      dataIndex: "assignments",
      key: "assignments",
      width: 150,
      render: (assignments: unknown[]) => (
        <div>
          {(assignments as { technicianName: string; role: string }[])?.map((assignment, index: number) => (
            <div
              key={index}
              style={{ display: "flex", alignItems: "center", marginBottom: 4 }}
            >
              <Avatar
                size="small"
                icon={<UserOutlined />}
                style={{ marginRight: 4 }}
              />
              <div>
                <Text style={{ fontSize: 11 }}>{assignment.technicianName}</Text>
                <div>
                  <Text style={{ fontSize: 10, color: "#8c8c8c" }}>
                    {assignment.role}
                  </Text>
                </div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: BookingStatus) => {
        const statusConfig = getStatusConfig(status as unknown as TrackingStatus);
        return (
          <Tag color={statusConfig.color} icon={getStatusIcon(status)}>
            {statusConfig.label}
          </Tag>
        );
      },
    },
  ];

  const actions = [
    {
      key: "tracking",
      label: "Theo dõi quá trình chăm sóc xe",
      icon: <EyeOutlined />,
      type: "primary" as const,
      onClick: (record: BookingInfoDto) => {
        setSelectedVehicle(record);
        setDetailModalOpen(true);
      },
    },
  ];

  // Thống kê tổng quan
  const totalVehicles = data.length;
  const inProgressVehicles = data.filter(
    (item: BookingInfoDto) => item.status === BookingStatus.IN_PROGRESS
  ).length;
  const completedVehicles = data.filter(
    (item: BookingInfoDto) => item.status === BookingStatus.COMPLETED
  ).length;
  const pausedVehicles = data.filter((item: BookingInfoDto) => item.status === BookingStatus.PAUSED).length;
  const cancelledVehicles = data.filter(
    (item: BookingInfoDto) => item.status === BookingStatus.CANCELLED
  ).length;
  const averageProgress = 0; // Will be calculated from tracking data
  const urgentVehicles = data.filter(
    (item: BookingInfoDto) => item.priority === "URGENT"
  ).length;
  const highPriorityVehicles = data.filter(
    (item: BookingInfoDto) => item.priority === "HIGH"
  ).length;

  return (
    <div>
      {/* Thống kê tổng quan */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng xe đang chăm sóc"
              value={totalVehicles}
              valueStyle={{ color: "#1890ff" }}
              prefix={<CarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đang thực hiện"
              value={inProgressVehicles}
              valueStyle={{ color: "#52c41a" }}
              prefix={<PlayCircleOutlined />}
            />
            <Progress
              percent={Math.round((inProgressVehicles / totalVehicles) * 100)}
              size="small"
              strokeColor="#52c41a"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Hoàn thành"
              value={completedVehicles}
              valueStyle={{ color: "#13c2c2" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tạm dừng"
              value={pausedVehicles}
              valueStyle={{ color: "#fa8c16" }}
              prefix={<PauseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Thống kê bổ sung */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tiến độ TB"
              value={averageProgress}
              precision={1}
              valueStyle={{ color: "#722ed1" }}
              prefix={<ClockCircleOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Khẩn cấp"
              value={urgentVehicles}
              valueStyle={{ color: "#f5222d" }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Ưu tiên cao"
              value={highPriorityVehicles}
              valueStyle={{ color: "#fa8c16" }}
              prefix={<StarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đã hủy"
              value={cancelledVehicles}
              valueStyle={{ color: "#8c8c8c" }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <AdminTable
        title="Danh sách xe đang chăm sóc"
        dataSource={data}
        columns={columns}
        actions={actions}
        loading={isLoadingBookings}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: number, range: [number, number]) =>
            `${range[0]}-${range[1]} của ${total} xe`,
        }}
      />

      {/* Modal theo dõi quá trình chăm sóc xe */}
      {selectedVehicle && (
        <ServiceTrackingModal
          open={detailModalOpen}
          onCancel={() => {
            setDetailModalOpen(false);
            setSelectedVehicle(null);
          }}
          booking={selectedVehicle}
        />
      )}
    </div>
  );
};


export default VehiclesInCarePage;
