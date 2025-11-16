"use client";
import React, { useState, useEffect } from "react";
import {
  Tag,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Button,
  App,
  Modal,
} from "antd";
import {
  EyeOutlined,
  ClockCircleOutlined,
  CarOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import AdminTable from "@/components/ui/Table/AdminTable";
import VehicleTrackingModal from "@/components/ui/Modal/VehicleTrackingModal";
import UpdateTrackingModal from "@/components/ui/Modal/UpdateTrackingModal";
import BookingTrackingManagementModal from "@/components/ui/Modal/BookingTrackingManagementModal";
import { useVehicleTracking } from "@/lib/api/hooks/useVehicleTracking";
import { formatDate } from "@/components/utils/helper/date.format.helper";
import { formatTime } from "@/components/utils/helper/duration.format.helper";
import {
  useBookingsByStatus,
  useStartService,
  useCancelBooking,
} from "@/lib/api/hooks/useBooking";
import { useBookingWithInventory } from "@/lib/api/hooks/useBookingWithInventory";
import { useQueryClient } from "@tanstack/react-query";
import { BookingInfoDto, BookingStatus } from "@/lib/api/types/booking.types";
import {
  ServiceProcessTrackingInfoDto,
  CreateServiceProcessTrackingRequest,
  TrackingStatus,
} from "@/lib/api/types/service-process-tracking.types";
import { ServiceProcessService } from "@/lib/api/services/service-process.service";
import { ServiceProcessTrackingService } from "@/lib/api/services/service-process-tracking.service";

const { Text } = Typography;

// Helper functions
const getStatusConfig = (status: BookingStatus) => {
  const statusConfigs = {
    [BookingStatus.PENDING]: {
      label: "Chờ xác nhận",
      color: "orange",
      icon: <ClockCircleOutlined />,
    },
    [BookingStatus.CONFIRMED]: {
      label: "Đã xác nhận",
      color: "blue",
      icon: <CheckCircleOutlined />,
    },
    [BookingStatus.CHECKED_IN]: {
      label: "Đã check-in",
      color: "cyan",
      icon: <CheckCircleOutlined />,
    },
    [BookingStatus.IN_PROGRESS]: {
      label: "Đang thực hiện",
      color: "green",
      icon: <PlayCircleOutlined />,
    },
    [BookingStatus.PAUSED]: {
      label: "Tạm dừng",
      color: "yellow",
      icon: <PauseCircleOutlined />,
    },
    [BookingStatus.COMPLETED]: {
      label: "Hoàn thành",
      color: "green",
      icon: <CheckCircleOutlined />,
    },
    [BookingStatus.CANCELLED]: {
      label: "Đã hủy",
      color: "red",
      icon: <ExclamationCircleOutlined />,
    },
    [BookingStatus.NO_SHOW]: {
      label: "Không đến",
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

const VehiclesInCarePage = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<BookingInfoDto | null>(
    null
  );
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "start" | "cancel";
    record: BookingInfoDto | null;
  }>({ type: "start", record: null });
  const [updateTrackingModalOpen, setUpdateTrackingModalOpen] = useState(false);
  const [selectedTracking, setSelectedTracking] =
    useState<ServiceProcessTrackingInfoDto | null>(null);
  const [selectedStepName, setSelectedStepName] = useState<string>("");
  const [bookingTrackingModalOpen, setBookingTrackingModalOpen] =
    useState(false);
  const { notification } = App.useApp();

  // API hooks - Load bookings with multiple statuses
  const {
    data: checkedInBookings,
    isLoading: isLoadingCheckedIn,
    error: checkedInError,
  } = useBookingsByStatus(BookingStatus.CHECKED_IN);
  const {
    data: inProgressBookings,
    isLoading: isLoadingInProgress,
    error: inProgressError,
  } = useBookingsByStatus(BookingStatus.IN_PROGRESS);
  const {
    data: cancelledBookings,
    isLoading: isLoadingCancelled,
    error: cancelledError,
  } = useBookingsByStatus(BookingStatus.CANCELLED);
  const {
    data: completedBookings,
    isLoading: isLoadingCompleted,
    error: completedError,
  } = useBookingsByStatus(BookingStatus.COMPLETED);

  // Load tracking data for selected vehicle
  const { data: trackingData } = useVehicleTracking(
    selectedVehicle?.booking_id || ""
  );

  // Mutation hooks
  const startServiceMutation = useStartService();
  const cancelBookingMutation = useCancelBooking();
  const queryClient = useQueryClient();

  // Enhanced hooks with inventory management
  const { startServiceWithInventory, cancelBookingWithInventory } =
    useBookingWithInventory();

  // Combine bookings with their trackings
  const checkedInData = checkedInBookings?.data || [];
  const inProgressData = inProgressBookings?.data || [];
  const cancelledData = cancelledBookings?.data || [];
  const completedData = completedBookings?.data || [];
  const data = [
    ...checkedInData,
    ...inProgressData,
    ...cancelledData,
    ...completedData,
  ];

  // Error handling
  useEffect(() => {
    if (checkedInError || inProgressError || cancelledError || completedError) {
      notification.error({
        message: "Lỗi tải dữ liệu",
        description: "Có lỗi xảy ra khi tải dữ liệu xe đang chăm sóc",
        placement: "topRight",
      });
    }
  }, [
    checkedInError,
    inProgressError,
    cancelledError,
    completedError,
    notification,
  ]);

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
      title: "STT",
      dataIndex: "index",
      key: "index",
      width: 60,
      align: "center" as const,
      render: (_: unknown, __: unknown, index: number) => (
        <Text style={{ fontSize: 12, fontWeight: 500 }}>{index + 1}</Text>
      ),
    },
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
              {record.vehicle_brand_name} {record.vehicle_model_name}
            </Text>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.vehicle_license_plate} • {record.vehicle_year} •{" "}
            {record.vehicle_color}
          </Text>
          <div style={{ marginTop: 4 }}>
            <Text style={{ fontSize: 11, color: "#8c8c8c" }}>
              Khách hàng: {record.customer_name}
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
            {record.booking_items?.length || 0} dịch vụ
          </Text>
          <div style={{ marginTop: 4 }}>
            <Text style={{ fontSize: 11, color: "#8c8c8c" }}>
              Thời gian: {formatTime(record.estimated_duration_minutes || 0)}
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
              Bắt đầu:{" "}
              {formatDate(
                record.actual_start_at ||
                  record.scheduled_start_at ||
                  record.preferred_start_at ||
                  new Date().toISOString()
              )}
            </Text>
          </div>
          <div style={{ marginBottom: 4 }}>
            <Text style={{ fontSize: 12 }}>
              Dự kiến:{" "}
              {formatDate(record.scheduled_end_at || new Date().toISOString())}
            </Text>
          </div>
          {record.actual_end_at && (
            <div>
              <Text style={{ fontSize: 12, color: "#52c41a" }}>
                Hoàn thành: {formatDate(record.actual_end_at)}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: BookingStatus) => {
        const statusConfig = getStatusConfig(status);
        return (
          <Tag color={statusConfig.color} icon={getStatusIcon(status)}>
            {statusConfig.label}
          </Tag>
        );
      },
    },
    {
      title: "Thanh toán",
      dataIndex: "payment_status",
      key: "payment_status",
      width: 120,
      align: "center" as const,
      render: (paymentStatus: string) => {
        const paymentConfig = {
          PENDING: { label: "Chờ thanh toán", color: "orange" },
          PAID: { label: "Đã thanh toán", color: "green" },
          FAILED: { label: "Thanh toán thất bại", color: "red" },
          REFUNDED: { label: "Đã hoàn tiền", color: "blue" },
        };
        const config = paymentConfig[
          paymentStatus as keyof typeof paymentConfig
        ] || {
          label: "Chưa xác định",
          color: "default",
        };
        return (
          <Tag color={config.color} style={{ fontSize: 12 }}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: "Chăm sóc xe",
      dataIndex: "careActions",
      key: "careActions",
      width: 150,
      align: "center" as const,
      render: (_: unknown, record: BookingInfoDto) => {
        const isBookingInProgress = record.status === BookingStatus.IN_PROGRESS;

        // Only show care buttons when booking is IN_PROGRESS
        if (!isBookingInProgress) {
          return <span style={{ color: "#999", fontSize: 12 }}>-</span>;
        }

        return (
          <Button
            type="primary"
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => handleUpdateTracking(record)}
            style={{ fontSize: 11 }}
          >
            Chăm sóc xe
          </Button>
        );
      },
    },
  ];

  const handleUpdateTracking = async (record: BookingInfoDto) => {
    setSelectedVehicle(record);
    setBookingTrackingModalOpen(true);
  };

  const handleStartService = (record: BookingInfoDto) => {
    setConfirmAction({ type: "start", record });
    setConfirmModalOpen(true);
  };

  const handleCancelBooking = (record: BookingInfoDto) => {
    setConfirmAction({ type: "cancel", record });
    setConfirmModalOpen(true);
  };

  // Auto-create tracking function
  const autoCreateTrackingForBooking = async (booking: BookingInfoDto) => {
    try {
      if (!booking.booking_items || booking.booking_items.length === 0) {
        return;
      }

      const createdTrackings: ServiceProcessTrackingInfoDto[] = [];
      const serviceStepsByService: Array<{
        service_id: string;
        service_name: string;
        steps: Array<{
          id: string;
          name: string;
          service_id: string;
          service_name: string;
          [key: string]: unknown;
        }>;
      }> = [];

      // Lấy process steps cho từng service trong booking
      for (const item of booking.booking_items || []) {
        if (item.service_id) {
          try {
            const serviceProcess =
              await ServiceProcessService.getServiceProcessByServiceId(
                item.service_id
              );
            if (serviceProcess?.process_steps || serviceProcess?.processSteps) {
              const steps =
                serviceProcess.process_steps ||
                serviceProcess.processSteps ||
                [];

              serviceStepsByService.push({
                service_id: item.service_id,
                service_name: item.service_name,
                steps: steps.map((step) => ({
                  ...step,
                  service_id: item.service_id!,
                  service_name: item.service_name,
                })),
              });
            }
          } catch (error) {
            console.warn(
              `Failed to get service process for service ${item.service_id}:`,
              error
            );
          }
        }
      }

      // Tạo tracking cho từng step trong từng service
      for (const serviceData of serviceStepsByService) {
        for (const step of serviceData.steps) {
          try {
            const trackingRequest: CreateServiceProcessTrackingRequest = {
              booking_id: booking.booking_id,
              service_step_id: step.id,
              car_service_id: step.service_id, // ID của service mà booking đã đặt
              bay_id: booking.bay_id || "",
              status: TrackingStatus.PENDING,
              notes: `Tự động tạo tracking cho bước: ${step.name} (${serviceData.service_name})`,
            };
            const createdTracking =
              await ServiceProcessTrackingService.createTracking(
                trackingRequest
              );
            createdTrackings.push(createdTracking);
          } catch (error) {
            console.log(
              `❌ Failed to create tracking for step ${step.name} in service ${serviceData.service_name}:`,
              error
            );
          }
        }
      }

      if (createdTrackings.length > 0) {
        notification.success({
          message: "Thành công",
          description: `Đã tự động tạo ${createdTrackings.length} tracking records`,
          placement: "topRight",
        });
      }
    } catch (error) {
      console.log("❌ Error in auto-create tracking:", error);
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi tự động tạo tracking",
        placement: "topRight",
      });
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmAction.record) return;

    try {
      if (confirmAction.type === "start") {
        // Use enhanced hook with inventory fulfillment
        await startServiceWithInventory(
          confirmAction.record,
          confirmAction.record.branch_id
        );
        notification.success({
          message: "Thành công",
          description: "Bắt đầu chăm sóc và xuất sản phẩm thành công",
          placement: "topRight",
        });

        // Auto-create tracking records directly here
        await autoCreateTrackingForBooking(confirmAction.record);
      } else if (confirmAction.type === "cancel") {
        // Use enhanced hook with inventory release
        await cancelBookingWithInventory(
          confirmAction.record,
          confirmAction.record.branch_id,
          "Hủy bởi admin",
          "admin"
        );
        notification.success({
          message: "Thành công",
          description: "Hủy lịch đặt và hoàn trả sản phẩm thành công",
          placement: "topRight",
        });
      }

      // Refresh data
      await queryClient.invalidateQueries({ queryKey: ["bookings"] });

      setConfirmModalOpen(false);
      setConfirmAction({ type: "start", record: null });
    } catch {
      notification.error({
        message: "Lỗi",
        description: `Có lỗi xảy ra khi ${
          confirmAction.type === "start" ? "bắt đầu chăm sóc" : "hủy lịch đặt"
        }`,
        placement: "topRight",
      });
    }
  };

  const actions = [
    {
      key: "start",
      label: "Bắt đầu chăm sóc",
      icon: <PlayCircleOutlined />,
      type: "primary" as const,
      onClick: handleStartService,
      condition: (record: BookingInfoDto) =>
        record.status === BookingStatus.CHECKED_IN,
    },
    {
      key: "cancel",
      label: "Hủy lịch đặt",
      icon: <ExclamationCircleOutlined />,
      type: "default" as const,
      danger: true,
      onClick: handleCancelBooking,
      condition: (record: BookingInfoDto) =>
        record.status === BookingStatus.CHECKED_IN,
    },
    {
      key: "tracking",
      label: "Xem tiến độ chăm sóc",
      icon: <EyeOutlined />,
      type: "primary" as const,
      onClick: (record: BookingInfoDto) => {
        setSelectedVehicle(record);
        setDetailModalOpen(true);
      },
      condition: (record: BookingInfoDto) =>
        [BookingStatus.IN_PROGRESS, BookingStatus.COMPLETED].includes(
          record.status
        ),
    },
  ];

  // Thống kê tổng quan
  const totalVehicles = data.length;
  const checkedInVehicles = data.filter(
    (item: BookingInfoDto) => item.status === BookingStatus.CHECKED_IN
  ).length;
  const inProgressVehicles = data.filter(
    (item: BookingInfoDto) => item.status === BookingStatus.IN_PROGRESS
  ).length;
  const completedVehicles = data.filter(
    (item: BookingInfoDto) => item.status === BookingStatus.COMPLETED
  ).length;
  const cancelledVehicles = data.filter(
    (item: BookingInfoDto) => item.status === BookingStatus.CANCELLED
  ).length;

  return (
    <App>
      <div>
        {/* Thống kê tổng quan */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng xe"
                value={totalVehicles}
                valueStyle={{ color: "#1890ff" }}
                prefix={<CarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Đã check-in"
                value={checkedInVehicles}
                valueStyle={{ color: "#13c2c2" }}
                prefix={<CheckCircleOutlined />}
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
                title="Đã hủy"
                value={cancelledVehicles}
                valueStyle={{ color: "#f5222d" }}
                prefix={<ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <AdminTable
          title="Quản lý chăm sóc xe"
          dataSource={data}
          columns={columns}
          actions={actions}
          rowKey="booking_id"
          loading={
            isLoadingCheckedIn ||
            isLoadingInProgress ||
            isLoadingCancelled ||
            isLoadingCompleted ||
            startServiceMutation.isPending ||
            cancelBookingMutation.isPending
          }
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
          <VehicleTrackingModal
            open={detailModalOpen}
            onCancel={() => {
              setDetailModalOpen(false);
              setSelectedVehicle(null);
            }}
            booking={selectedVehicle}
            trackings={trackingData || []}
            onTrackingCreated={() => {
              // Refresh tracking data when new tracking is created
              if (selectedVehicle) {
                handleUpdateTracking(selectedVehicle);
              }
            }}
          />
        )}

        {/* Update Tracking Modal */}
        {selectedTracking && (
          <UpdateTrackingModal
            open={updateTrackingModalOpen}
            onCancel={() => {
              setUpdateTrackingModalOpen(false);
              setSelectedTracking(null);
              setSelectedStepName("");
            }}
            onSuccess={() => {
              setUpdateTrackingModalOpen(false);
              setSelectedTracking(null);
              setSelectedStepName("");
              // Refresh all booking data
              queryClient.invalidateQueries({ queryKey: ["bookings"] });
            }}
            tracking={selectedTracking}
            stepName={selectedStepName}
          />
        )}

        {/* Booking Tracking Management Modal */}
        {selectedVehicle && (
          <BookingTrackingManagementModal
            open={bookingTrackingModalOpen}
            onCancel={() => {
              setBookingTrackingModalOpen(false);
              setSelectedVehicle(null);
            }}
            booking={selectedVehicle}
          />
        )}

        {/* Modal xác nhận */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {confirmAction.type === "start" ? (
                <PlayCircleOutlined style={{ color: "#1890ff" }} />
              ) : (
                <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
              )}
              <span>
                {confirmAction.type === "start"
                  ? "Bắt đầu chăm sóc"
                  : "Hủy lịch đặt"}
              </span>
            </div>
          }
          open={confirmModalOpen}
          onCancel={() => {
            setConfirmModalOpen(false);
            setConfirmAction({ type: "start", record: null });
          }}
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setConfirmModalOpen(false);
                setConfirmAction({ type: "start", record: null });
              }}
            >
              Hủy
            </Button>,
            <Button
              key="confirm"
              type="primary"
              danger={confirmAction.type === "cancel"}
              loading={
                startServiceMutation.isPending ||
                cancelBookingMutation.isPending
              }
              onClick={handleConfirmAction}
            >
              {confirmAction.type === "start"
                ? "Bắt đầu chăm sóc"
                : "Hủy lịch đặt"}
            </Button>,
          ]}
          width={500}
        >
          <div style={{ padding: "16px 0" }}>
            <p style={{ fontSize: 16, marginBottom: 16 }}>
              {confirmAction.type === "start"
                ? `Bạn có chắc chắn muốn bắt đầu chăm sóc cho xe ${confirmAction.record?.vehicle_license_plate}?`
                : `Bạn có chắc chắn muốn hủy lịch đặt cho xe ${confirmAction.record?.vehicle_license_plate}?`}
            </p>
            {confirmAction.record && (
              <div
                style={{
                  backgroundColor: "#f5f5f5",
                  padding: 12,
                  borderRadius: 6,
                  fontSize: 14,
                }}
              >
                <div>
                  <strong>Khách hàng:</strong>{" "}
                  {confirmAction.record.customer_name}
                </div>
                <div>
                  <strong>Biển số:</strong>{" "}
                  {confirmAction.record.vehicle_license_plate}
                </div>
                <div>
                  <strong>Dịch vụ:</strong>{" "}
                  {confirmAction.record.booking_items?.length || 0} dịch vụ
                </div>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </App>
  );
};

export default VehiclesInCarePage;
