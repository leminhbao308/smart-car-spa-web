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
  Button,
  Avatar,
  Modal,
  Form,
  Input,
  Radio,
  Space,
  message,
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
  CameraOutlined,
  StarOutlined,
} from "@ant-design/icons";
import AdminTable from "@/components/ui/Table/AdminTable";
import { useConfirmationModalContext } from "@/components/ui/Modal";
import { formatDate } from "@/components/utils/helper/date.format.helper";
import { formatTime } from "@/components/utils/helper/duration.format.helper";
import { 
  useInProgressTrackings,
  useTrackingsByBooking
} from "@/lib/api/hooks/useTracking";
import { 
  useBookingsByStatus,
  useCompleteService
} from "@/lib/api/hooks/useBooking";
import { 
  ServiceProcessTrackingInfoDto,
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

const getStepCategoryIcon = (category: string) => {
  const icons = {
    inspection: "🔍",
    cleaning: "🧽",
    maintenance: "🔧",
    repair: "⚙️",
    testing: "🧪",
    default: "📋"
  };
  return icons[category as keyof typeof icons] || icons.default;
};

const VehiclesInCarePage = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<BookingInfoDto | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const { showModal } = useConfirmationModalContext();
  
  // API hooks
  const { data: inProgressBookings, isLoading: isLoadingBookings, error: bookingsError } = useBookingsByStatus(BookingStatus.IN_PROGRESS);
  const { isLoading: isLoadingTrackings, error: trackingsError } = useInProgressTrackings();
  
  const completeServiceMutation = useCompleteService();
  
  
  // Combine bookings with their trackings
  const data = inProgressBookings?.data || [];
  
  // Error handling
  useEffect(() => {
    if (bookingsError || trackingsError) {
      message.error("Có lỗi xảy ra khi tải dữ liệu xe đang chăm sóc");
    }
  }, [bookingsError, trackingsError]);

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
      key: "view",
      label: "Xem chi tiết",
      icon: <EyeOutlined />,
      onClick: (record: BookingInfoDto) => {
        setSelectedVehicle(record);
        setDetailModalOpen(true);
      },
    },
    {
      key: "complete",
      label: "Hoàn thành",
      icon: <CheckCircleOutlined />,
      condition: (record: BookingInfoDto) => record.status === BookingStatus.IN_PROGRESS,
      onClick: (record: BookingInfoDto) => {
        showModal({
          title: "Xác nhận hoàn thành",
          content: `Bạn có chắc chắn muốn hoàn thành chăm sóc xe "${record.vehicleBrandName} ${record.vehicleModelName}"?`,
          type: "success",
          onConfirm: async () => {
            try {
              await completeServiceMutation.mutateAsync(record.bookingId);
              message.success("Hoàn thành chăm sóc xe thành công");
            } catch {
              message.error("Có lỗi xảy ra khi hoàn thành chăm sóc xe");
            }
          },
        });
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
        loading={isLoadingBookings || isLoadingTrackings}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: number, range: [number, number]) =>
            `${range[0]}-${range[1]} của ${total} xe`,
        }}
      />

      {/* Modal chi tiết xe */}
      {selectedVehicle && (
        <VehicleDetailModal
          open={detailModalOpen}
          onCancel={() => {
            setDetailModalOpen(false);
            setSelectedVehicle(null);
          }}
          vehicle={selectedVehicle}
        />
      )}
    </div>
  );
};

// Component modal chi tiết xe
interface VehicleDetailModalProps {
  open: boolean;
  onCancel: () => void;
  vehicle: BookingInfoDto;
}

const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  open,
  onCancel,
  vehicle,
}) => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [stepDetailModalOpen, setStepDetailModalOpen] = useState(false);
  const [updateStatusModalOpen, setUpdateStatusModalOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<ServiceProcessTrackingInfoDto | null>(null);
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  
  // Get tracking data for this vehicle
  const { data: trackingsResponse, isLoading: isLoadingTrackings } = useTrackingsByBooking(vehicle.bookingId);
  const stepProgressData = trackingsResponse?.data || [];

  const handleUploadImage = (stepId: string) => {
    setCurrentStepId(stepId);
    setUploadModalOpen(true);
  };

  const handleViewStepDetail = (step: ServiceProcessTrackingInfoDto) => {
    setSelectedStep(step);
    setStepDetailModalOpen(true);
  };

  const handleViewImage = (url: string) => {
    // Mở ảnh trong tab mới
    window.open(url, "_blank");
  };

  const handleUpdateStepStatus = (step: ServiceProcessTrackingInfoDto, stepIndex: number) => {
    setSelectedStep({ ...step, stepIndex, allSteps: stepProgressData } as ServiceProcessTrackingInfoDto & { stepIndex: number; allSteps: ServiceProcessTrackingInfoDto[] });
    setUpdateStatusModalOpen(true);
  };

  const handleStatusUpdate = () => {
    // This will be handled by API mutations
    setUpdateStatusModalOpen(false);
    setSelectedStep(null);
  };
  return (
    <Modal
      title={`Chi tiết xe ${vehicle.vehicleBrandName} ${vehicle.vehicleModelName}`}
      open={open}
      onCancel={onCancel}
      width={1000}
      footer={[
        <Button key="close" onClick={onCancel}>
          Đóng
        </Button>,
      ]}
    >
      <div>
        {/* Thông tin xe */}
        <Card title="Thông tin xe" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Text strong>Khách hàng:</Text>
              <div>{vehicle.customerName}</div>
            </Col>
            <Col span={8}>
              <Text strong>Biển số:</Text>
              <div>{vehicle.vehicleLicensePlate}</div>
            </Col>
            <Col span={8}>
              <Text strong>Năm sản xuất:</Text>
              <div>{vehicle.vehicleYear}</div>
            </Col>
            <Col span={8}>
              <Text strong>Màu sắc:</Text>
              <div>{vehicle.vehicleColor}</div>
            </Col>
            <Col span={8}>
              <Text strong>Loại xe:</Text>
              <div>{vehicle.vehicleTypeName}</div>
            </Col>
            <Col span={8}>
              <Text strong>Dịch vụ:</Text>
              <div>{vehicle.bookingItems?.length || 0} dịch vụ</div>
            </Col>
          </Row>
        </Card>

        {/* Tiến độ tổng quan */}
        <Card
          title="Tiến độ tổng quan"
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <Text strong>Tiến độ hoàn thành:</Text>
                <Progress
                  percent={stepProgressData.length > 0 ? 
                    (stepProgressData.filter((step: ServiceProcessTrackingInfoDto) => step.status === TrackingStatus.COMPLETED).length / stepProgressData.length) * 100 : 0}
                  strokeColor={stepProgressData.length > 0 && 
                    stepProgressData.every((step: ServiceProcessTrackingInfoDto) => step.status === TrackingStatus.COMPLETED) ? "#52c41a" : "#1890ff"}
                />
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <Text strong>Thời gian:</Text>
                <div>Bắt đầu: {formatDate(vehicle.actualStartAt || vehicle.scheduledStartAt || vehicle.preferredStartAt || new Date().toISOString())}</div>
                <div>Dự kiến: {formatDate(vehicle.scheduledEndAt || new Date().toISOString())}</div>
                {vehicle.actualEndAt && (
                  <div>Hoàn thành: {formatDate(vehicle.actualEndAt)}</div>
                )}
              </div>
            </Col>
          </Row>
        </Card>

        {/* Các bước chăm sóc */}
        <Card title="Chi tiết các bước chăm sóc" size="small">
          <div style={{ maxHeight: "500px", overflowY: "auto" }}>
            {isLoadingTrackings ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                Đang tải dữ liệu...
              </div>
            ) : stepProgressData.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                Chưa có dữ liệu tracking
              </div>
            ) : (
              stepProgressData.map((step: ServiceProcessTrackingInfoDto, index: number) => {
                const getStepBackgroundColor = (status: TrackingStatus) => {
                  switch (status) {
                    case TrackingStatus.COMPLETED:
                      return "#f6ffed";
                    case TrackingStatus.IN_PROGRESS:
                      return "#e6f7ff";
                    case TrackingStatus.PENDING:
                      return "#fafafa";
                    case TrackingStatus.CANCELLED:
                      return "#fff2f0";
                    default:
                      return "#fafafa";
                  }
                };

                const getStepBorderColor = (status: TrackingStatus) => {
                  switch (status) {
                    case TrackingStatus.COMPLETED:
                      return "#b7eb8f";
                    case TrackingStatus.IN_PROGRESS:
                      return "#91d5ff";
                    case TrackingStatus.PENDING:
                      return "#d9d9d9";
                    case TrackingStatus.CANCELLED:
                      return "#ffccc7";
                    default:
                      return "#d9d9d9";
                  }
                };

              return (
                <Card
                  key={step.trackingId}
                  size="small"
                  style={{
                    marginBottom: 16,
                    backgroundColor: getStepBackgroundColor(step.status),
                    border: `2px solid ${getStepBorderColor(step.status)}`,
                    borderRadius: 8,
                  }}
                  bodyStyle={{ padding: 16 }}
                >
                  {/* Header của bước */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 12,
                      paddingBottom: 8,
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          backgroundColor:
                            step.status === TrackingStatus.COMPLETED
                              ? "#52c41a"
                              : step.status === TrackingStatus.IN_PROGRESS
                              ? "#1890ff"
                              : "#d9d9d9",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                          fontSize: 14,
                          fontWeight: "bold",
                        }}
                      >
                        {step.serviceStepOrder || index + 1}
                      </div>
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: 4,
                          }}
                        >
                          <span style={{ fontSize: 18, marginRight: 8 }}>
                            {getStepCategoryIcon("inspection")}
                          </span>
                          <Text strong style={{ fontSize: 16 }}>
                            {step.serviceStepName}
                          </Text>
                          <Tag
                            color={getStatusConfig(step.status).color}
                            style={{ marginLeft: 8 }}
                          >
                            {getStatusConfig(step.status).label}
                          </Tag>
                        </div>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <UserOutlined
                            style={{ marginRight: 4, color: "#1890ff" }}
                          />
                          <Text style={{ color: "#666", fontSize: 12 }}>
                            Nhân viên: {step.technicianName}
                          </Text>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {step.status !== TrackingStatus.COMPLETED && (
                        <Button
                          type="primary"
                          size="small"
                          icon={<CameraOutlined />}
                          onClick={() => handleUploadImage(step.trackingId)}
                        >
                          Upload ảnh
                        </Button>
                      )}
                      <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewStepDetail(step)}
                      >
                        Xem chi tiết
                      </Button>
                      {(() => {
                        const isNextStep = index === 0 || stepProgressData[index - 1].status === TrackingStatus.COMPLETED;
                        const canUpdate = step.status !== TrackingStatus.COMPLETED && (isNextStep || step.status === TrackingStatus.IN_PROGRESS);
                        
                        if (!canUpdate) return null;
                        
                        return (
                          <Button
                            type="default"
                            size="small"
                            icon={<CheckCircleOutlined />}
                            onClick={() => handleUpdateStepStatus(step, index)}
                          >
                            Cập nhật trạng thái
                          </Button>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Thông tin thời gian */}
                  <Row gutter={[16, 8]} style={{ marginBottom: 12 }}>
                    {step.startTime && (
                      <Col span={8}>
                        <Text style={{ fontSize: 12, color: "#666" }}>
                          <ClockCircleOutlined style={{ marginRight: 4 }} />
                          Bắt đầu: {formatDate(step.startTime)}
                        </Text>
                      </Col>
                    )}
                    {step.endTime && (
                      <Col span={8}>
                        <Text style={{ fontSize: 12, color: "#666" }}>
                          <CheckCircleOutlined style={{ marginRight: 4 }} />
                          Kết thúc: {formatDate(step.endTime)}
                        </Text>
                      </Col>
                    )}
                    {step.actualDuration && (
                      <Col span={8}>
                        <Text style={{ fontSize: 12, color: "#666" }}>
                          <ClockCircleOutlined style={{ marginRight: 4 }} />
                          Thời gian: {formatTime(step.actualDuration)}
                        </Text>
                      </Col>
                    )}
                  </Row>

                  {/* Ghi chú */}
                  {step.notes && (
                    <Row gutter={[16, 8]} style={{ marginBottom: 12 }}>
                      <Col span={12}>
                        <Text style={{ fontSize: 12, color: "#666" }}>
                          <ExclamationCircleOutlined
                            style={{ marginRight: 4 }}
                          />
                          Ghi chú: {step.notes}
                        </Text>
                      </Col>
                    </Row>
                  )}

                  {/* Evidence Media */}
                  {step.evidenceMediaUrls && (
                    <div style={{ marginBottom: 8 }}>
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#666",
                          marginBottom: 4,
                          display: "block",
                        }}
                      >
                        Hình ảnh đã upload:
                      </Text>
                      <div
                        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                      >
                        {step.evidenceMediaUrls.split(',').map((url: string, idx: number) => (
                          <div
                            key={idx}
                            style={{
                              width: 60,
                              height: 60,
                              border: "1px solid #d9d9d9",
                              borderRadius: 4,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: "#fafafa",
                              cursor: "pointer",
                            }}
                            onClick={() => handleViewImage(url.trim())}
                          >
                            <CameraOutlined
                              style={{ fontSize: 20, color: "#1890ff" }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })
            )}
          </div>
        </Card>
      </div>

      {/* Modal upload ảnh */}
      <UploadImageModal
        open={uploadModalOpen}
        onCancel={() => {
          setUploadModalOpen(false);
          setCurrentStepId(null);
        }}
        stepId={currentStepId ? parseInt(currentStepId) : null}
      />

      {/* Modal chi tiết bước */}
      {selectedStep && (
        <StepDetailModal
          open={stepDetailModalOpen}
          onCancel={() => {
            setStepDetailModalOpen(false);
            setSelectedStep(null);
          }}
          step={selectedStep}
        />
      )}

      {/* Modal cập nhật trạng thái bước */}
      {selectedStep && (
        <UpdateStepStatusModal
          open={updateStatusModalOpen}
          onCancel={() => {
            setUpdateStatusModalOpen(false);
            setSelectedStep(null);
          }}
          step={selectedStep}
          onUpdate={handleStatusUpdate}
        />
      )}
    </Modal>
  );
};

// Component modal upload ảnh
interface UploadImageModalProps {
  open: boolean;
  onCancel: () => void;
  stepId: number | null;
}

const UploadImageModal: React.FC<UploadImageModalProps> = ({
  open,
  onCancel,
  stepId,
}) => {
  const [fileList, setFileList] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (fileList.length === 0) return;

    setUploading(true);
    try {
      // Simulate upload
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Uploading files:", fileList);
      // TODO: Implement actual upload logic
      onCancel();
    } catch (error) {
      console.log("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      title="Upload hình ảnh"
      open={open}
      onCancel={onCancel}
      onOk={handleUpload}
      confirmLoading={uploading}
      okText="Upload"
      cancelText="Hủy"
    >
      <div>
        <Text>Bước ID: {stepId}</Text>
        <div style={{ marginTop: 16 }}>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              setFileList(files);
            }}
            style={{ width: "100%" }}
          />
        </div>
        {fileList.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Text>Đã chọn {fileList.length} file(s)</Text>
          </div>
        )}
      </div>
    </Modal>
  );
};

// Component modal chi tiết bước
interface StepDetailModalProps {
  open: boolean;
  onCancel: () => void;
  step: ServiceProcessTrackingInfoDto;
}

const StepDetailModal: React.FC<StepDetailModalProps> = ({
  open,
  onCancel,
  step,
}) => {
  return (
    <Modal
      title={`Chi tiết bước: ${step.serviceStepName}`}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Đóng
        </Button>,
      ]}
      width={800}
    >
      <div>
        {/* Thông tin cơ bản */}
        <Card
          title="Thông tin cơ bản"
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <Text strong>Trạng thái:</Text>
              <div>
                <Tag color={getStatusConfig(step.status).color}>
                  {getStatusConfig(step.status).label}
                </Tag>
              </div>
            </Col>
            <Col span={12}>
              <Text strong>Nhân viên thực hiện:</Text>
              <div>{step.technicianName}</div>
            </Col>
            {step.startTime && (
              <Col span={12}>
                <Text strong>Thời gian bắt đầu:</Text>
                <div>{formatDate(step.startTime)}</div>
              </Col>
            )}
            {step.endTime && (
              <Col span={12}>
                <Text strong>Thời gian kết thúc:</Text>
                <div>{formatDate(step.endTime)}</div>
              </Col>
            )}
            {step.actualDuration && (
              <Col span={12}>
                <Text strong>Thời gian thực tế:</Text>
                <div>{formatTime(step.actualDuration)}</div>
              </Col>
            )}
          </Row>
        </Card>

        {/* Ghi chú */}
        {step.notes && (
          <Card title="Ghi chú" size="small" style={{ marginBottom: 16 }}>
            <Text>{step.notes}</Text>
          </Card>
        )}

        {/* Hình ảnh */}
        {step.evidenceMediaUrls && (
          <Card
            title="Hình ảnh đã upload"
            size="small"
            style={{ marginBottom: 16 }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                gap: 16,
              }}
            >
              {step.evidenceMediaUrls.split(',').map((url: string, idx: number) => (
                <div
                  key={idx}
                  style={{
                    border: "1px solid #d9d9d9",
                    borderRadius: 8,
                    padding: 8,
                    textAlign: "center",
                  }}
                >
                  <div style={{ marginBottom: 8 }}>
                    <CameraOutlined
                      style={{ fontSize: 24, color: "#1890ff" }}
                    />
                  </div>
                  <Text style={{ fontSize: 12, display: "block" }}>
                    File {idx + 1}
                  </Text>
                </div>
              ))}
            </div>
          </Card>
        )}

      </div>
    </Modal>
  );
};

// Component modal cập nhật trạng thái bước
interface UpdateStepStatusModalProps {
  open: boolean;
  onCancel: () => void;
  step: ServiceProcessTrackingInfoDto & { stepIndex?: number; allSteps?: ServiceProcessTrackingInfoDto[] };
  onUpdate: () => void;
}

const UpdateStepStatusModal: React.FC<UpdateStepStatusModalProps> = ({
  open,
  onCancel,
  step,
  onUpdate,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const getAvailableStatuses = (currentStatus: TrackingStatus, stepIndex: number, allSteps: ServiceProcessTrackingInfoDto[]) => {
    // Kiểm tra xem có phải bước tiếp theo cần thực hiện không
    const isNextStep = stepIndex === 0 || allSteps[stepIndex - 1].status === TrackingStatus.COMPLETED;
    
    switch (currentStatus) {
      case TrackingStatus.PENDING:
        if (isNextStep) {
          return [
            { value: TrackingStatus.IN_PROGRESS, label: "Bắt đầu thực hiện", color: "blue" },
            { value: TrackingStatus.CANCELLED, label: "Bỏ qua bước này", color: "orange" },
          ];
        }
        return []; // Không cho phép cập nhật nếu chưa đến lượt
      case TrackingStatus.IN_PROGRESS:
        return [
          { value: TrackingStatus.COMPLETED, label: "Hoàn thành", color: "green" },
          { value: TrackingStatus.CANCELLED, label: "Bỏ qua bước này", color: "red" },
        ];
      case TrackingStatus.CANCELLED:
        if (isNextStep) {
          return [
            { value: TrackingStatus.IN_PROGRESS, label: "Thực hiện lại", color: "blue" },
          ];
        }
        return [];
      default:
        return [];
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await form.validateFields();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onUpdate();
      form.resetFields();
    } catch (error) {
      console.log("Validation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const availableStatuses = getAvailableStatuses(
    step.status, 
    step.stepIndex || 0, 
    step.allSteps || []
  );

  return (
    <Modal
      title={`Cập nhật trạng thái: ${step.serviceStepName}`}
      open={open}
      onCancel={onCancel}
      onOk={availableStatuses.length > 0 ? handleSubmit : undefined}
      confirmLoading={loading}
      okText="Cập nhật"
      cancelText="Đóng"
      width={600}
      okButtonProps={{
        disabled: availableStatuses.length === 0
      }}
    >
      <div>
        {/* Thông tin bước hiện tại */}
        <Card size="small" style={{ marginBottom: 16, backgroundColor: "#fafafa" }}>
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <Text strong>Trạng thái hiện tại:</Text>
              <div>
                <Tag color={getStatusConfig(step.status).color}>
                  {getStatusConfig(step.status).label}
                </Tag>
              </div>
            </Col>
            <Col span={12}>
              <Text strong>Nhân viên:</Text>
              <div>{step.technicianName}</div>
            </Col>
            {step.startTime && (
              <Col span={12}>
                <Text strong>Bắt đầu:</Text>
                <div>{formatDate(step.startTime)}</div>
              </Col>
            )}
            {step.endTime && (
              <Col span={12}>
                <Text strong>Kết thúc:</Text>
                <div>{formatDate(step.endTime)}</div>
              </Col>
            )}
          </Row>
        </Card>

        {/* Form cập nhật */}
        {availableStatuses.length > 0 ? (
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              status: step.status,
            }}
          >
            <Form.Item
              name="status"
              label="Trạng thái mới"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
            >
              <Radio.Group>
                <Space direction="vertical">
                  {availableStatuses.map((status) => (
                    <Radio key={status.value} value={status.value}>
                      <Space>
                        <Tag color={status.color}>{status.label}</Tag>
                      </Space>
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            </Form.Item>
          </Form>
        ) : (
          <div style={{ 
            padding: 16, 
            backgroundColor: "#fff7e6", 
            border: "1px solid #ffd591",
            borderRadius: 4,
            textAlign: "center"
          }}>
            <Text style={{ color: "#d46b08" }}>
              <ExclamationCircleOutlined style={{ marginRight: 8 }} />
              Bước này chưa đến lượt thực hiện. Vui lòng hoàn thành các bước trước đó.
            </Text>
          </div>
        )}

        {availableStatuses.length > 0 && (
          <Form.Item
            name="notes"
            label="Ghi chú (tùy chọn)"
          >
            <Input.TextArea
              rows={3}
              placeholder="Nhập ghi chú về việc cập nhật trạng thái..."
            />
          </Form.Item>
        )}

        {/* Thông tin bổ sung */}
        <div style={{ marginTop: 16, padding: 12, backgroundColor: "#e6f7ff", borderRadius: 4 }}>
          <Text style={{ fontSize: 12, color: "#1890ff" }}>
            <ExclamationCircleOutlined style={{ marginRight: 4 }} />
            <strong>Lưu ý:</strong> Khi cập nhật trạng thái, hệ thống sẽ tự động ghi nhận thời gian thực hiện.
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default VehiclesInCarePage;
