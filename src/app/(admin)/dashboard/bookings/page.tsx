"use client";
import React, { useState, useEffect } from "react";
import { AdminTable } from "@/components/ui/Table";
import { useConfirmationModalContext } from "@/components/ui/Modal";
import BookingModal from "@/components/ui/Modal/BookingModal/BookingModal";
import CreateTrackingModal from "@/components/ui/Modal/CreateTrackingModal";
import ServiceTrackingModal from "@/components/ui/Modal/ServiceTrackingModal";
import { ColumnsType } from "antd/es/table";
import { Tag, Modal, Typography, Button, Badge, App } from "antd";
import {
  PhoneOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoginOutlined,
  PlayCircleOutlined,
  MonitorOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import formatCurrency from "@/components/utils/helper/currency.format.helper";
import { formatDurationVer01 } from "@/components/utils/helper/duration.format.helper";
import { getTimeRemaining } from "@/components/utils/helper/booking.time.helper";
import {
  useBookings,
  useConfirmBooking,
  useCancelBooking,
  useCompleteService,
  useCheckInBooking,
  useStartService,
} from "@/lib/api/hooks/useBooking";
import { useCustomersDropdown } from "@/lib/api/hooks/useUsers";
import { useVehicleProfiles } from "@/lib/api/hooks/useVehicleProfiles";
import {
  BookingInfoDto,
  BookingStatus,
  Priority,
} from "@/lib/api/types/booking.types";

const { Text } = Typography;

// Extended booking type with enrichment indicators
interface EnrichedBookingInfoDto extends BookingInfoDto {
  isCustomerEnriched?: boolean;
  isVehicleEnriched?: boolean;
}

// Helper functions for status and priority
const getStatusConfig = (status: BookingStatus) => {
  const statusConfigs = {
    [BookingStatus.PENDING]: {
      label: "Chờ xác nhận",
      color: "orange",
      icon: <CheckCircleOutlined />,
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
      icon: <CheckCircleOutlined />,
    },
    [BookingStatus.PAUSED]: {
      label: "Tạm dừng",
      color: "yellow",
      icon: <CheckCircleOutlined />,
    },
    [BookingStatus.COMPLETED]: {
      label: "Hoàn thành",
      color: "green",
      icon: <CheckCircleOutlined />,
    },
    [BookingStatus.CANCELLED]: {
      label: "Đã hủy",
      color: "red",
      icon: <CloseCircleOutlined />,
    },
    [BookingStatus.NO_SHOW]: {
      label: "Không đến",
      color: "red",
      icon: <CloseCircleOutlined />,
    },
  };
  return (
    statusConfigs[status] || {
      label: "Unknown",
      color: "default",
      icon: <CheckCircleOutlined />,
    }
  );
};

const getPriorityConfig = (priority: Priority) => {
  const priorityConfigs = {
    [Priority.NORMAL]: {
      label: "Bình thường",
      color: "default",
      icon: <CheckCircleOutlined />,
    },
    [Priority.HIGH]: {
      label: "Cao",
      color: "orange",
      icon: <CheckCircleOutlined />,
    },
    [Priority.URGENT]: {
      label: "Khẩn cấp",
      color: "red",
      icon: <CheckCircleOutlined />,
    },
  };
  return (
    priorityConfigs[priority] || {
      label: "Unknown",
      color: "default",
      icon: <CheckCircleOutlined />,
    }
  );
};

const BookingsPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedBooking, setSelectedBooking] = useState<BookingInfoDto | null>(
    null
  );
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [createTrackingModalOpen, setCreateTrackingModalOpen] = useState(false);
  const [serviceTrackingModalOpen, setServiceTrackingModalOpen] = useState(false);
  const [filterParams, setFilterParams] = useState({
    page: 0,
    size: 10,
  });

  const { showModal } = useConfirmationModalContext();
  const { notification } = App.useApp();

  // API hooks
  const {
    data: bookingsResponse,
    isLoading,
    error,
  } = useBookings(filterParams);
  const confirmBookingMutation = useConfirmBooking();
  const cancelBookingMutation = useCancelBooking();
  const completeServiceMutation = useCompleteService();
  const checkInBookingMutation = useCheckInBooking();
  const startServiceMutation = useStartService();

  // Fetch additional data for enrichment
  const { customers, loading: isLoadingCustomers } = useCustomersDropdown();
  const { profiles: allVehicles, loading: isLoadingVehicles } =
    useVehicleProfiles({ size: 1000 });

  // Helper function to enrich booking data with customer and vehicle info
  const enrichBookingData = (
    booking: BookingInfoDto
  ): EnrichedBookingInfoDto => {
    let enrichedBooking = { ...booking };
    let isCustomerEnriched = false;
    let isVehicleEnriched = false;

    // Enrich customer info if missing
    if (
      booking.customerId &&
      (!booking.customerName || !booking.customerPhone)
    ) {
      const customer = customers.find((c) => c.user_id === booking.customerId);
      if (customer) {
        enrichedBooking = {
          ...enrichedBooking,
          customerName: enrichedBooking.customerName || customer.full_name,
          customerPhone: enrichedBooking.customerPhone || customer.phone_number,
          customerEmail: enrichedBooking.customerEmail || customer.email,
        };
        isCustomerEnriched = true;
      }
    }

    // Enrich vehicle info if missing
    if (
      booking.vehicleId &&
      (!booking.vehicleBrandName || !booking.vehicleModelName)
    ) {
      const vehicle = allVehicles.find(
        (v) => v.vehicle_id === booking.vehicleId
      );
      if (vehicle) {
        enrichedBooking = {
          ...enrichedBooking,
          vehicleLicensePlate:
            enrichedBooking.vehicleLicensePlate || vehicle.license_plate,
          vehicleBrandName:
            enrichedBooking.vehicleBrandName ||
            ((vehicle as unknown as Record<string, unknown>)
              .brand_name as string),
          vehicleModelName:
            enrichedBooking.vehicleModelName ||
            ((vehicle as unknown as Record<string, unknown>)
              .model_name as string),
          vehicleTypeName:
            enrichedBooking.vehicleTypeName ||
            ((vehicle as unknown as Record<string, unknown>)
              .type_name as string),
          vehicleYear:
            enrichedBooking.vehicleYear ||
            ((vehicle as unknown as Record<string, unknown>)
              .model_year as number),
          vehicleColor:
            enrichedBooking.vehicleColor ||
            ((vehicle as unknown as Record<string, unknown>).color as string),
        };
        isVehicleEnriched = true;
      }
    }

    return { ...enrichedBooking, isCustomerEnriched, isVehicleEnriched };
  };

  // Extract and enrich data from response
  const rawData =
    bookingsResponse?.data?.content || bookingsResponse?.data || [];
  const data = rawData.map(enrichBookingData);
  const totalElements = bookingsResponse?.data?.totalElements || 0;

  // Error handling
  useEffect(() => {
    if (error) {
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi tải dữ liệu booking",
        placement: "topRight",
      });
    }
  }, [error, notification]);

  // Định nghĩa columns
  const columns: ColumnsType<BookingInfoDto> = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center",
      render: (_, __, index: number) => (
        <span style={{ fontSize: 14, color: "#666" }}>
          {index + 1 + filterParams.page * filterParams.size}
        </span>
      ),
    },
    {
      title: "Mã đặt lịch",
      dataIndex: "bookingCode",
      key: "bookingCode",
      width: 120,
      render: (code: string) => (
        <span
          style={{ fontFamily: "monospace", fontWeight: 500, color: "#1890ff", fontSize: 14 }}
        >
          {code}
        </span>
      ),
    },
    {
      title: "Khách hàng",
      key: "customer",
      width: 220,
      render: (_, record: EnrichedBookingInfoDto) => (
        <div>
          <div
            style={{
              fontWeight: 500,
              fontSize: 15,
              marginBottom: 4,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {record.customerName || "N/A"}
            {record.isCustomerEnriched && (
              <Badge
                count="✓"
                style={{
                  backgroundColor: "#52c41a",
                  fontSize: 10,
                  minWidth: 14,
                  height: 14,
                  lineHeight: "14px",
                }}
                title="Dữ liệu đã được bổ sung từ hệ thống"
              />
            )}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#666",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <PhoneOutlined style={{ fontSize: 12 }} />
            {record.customerPhone || "N/A"}
          </div>
          {record.customerEmail && (
          <div style={{ fontSize: 12, color: "#999" }}>
            {record.customerEmail}
          </div>
          )}
        </div>
      ),
    },
    {
      title: "Xe",
      key: "vehicle",
      width: 200,
      render: (_, record: EnrichedBookingInfoDto) => (
        <div>
          <div
            style={{
              fontWeight: 500,
              fontSize: 15,
              marginBottom: 2,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {record.vehicleLicensePlate || "N/A"}
            {record.isVehicleEnriched && (
              <Badge
                count="✓"
                style={{
                  backgroundColor: "#52c41a",
                  fontSize: 10,
                  minWidth: 14,
                  height: 14,
                  lineHeight: "14px",
                }}
                title="Dữ liệu đã được bổ sung từ hệ thống"
              />
            )}
          </div>
          <div style={{ fontSize: 13, color: "#666" }}>
            {record.vehicleBrandName || "N/A"} {record.vehicleModelName || ""}
          </div>
          <div style={{ fontSize: 12, color: "#999" }}>
            {record.vehicleYear || "N/A"} • {record.vehicleColor || "N/A"}
          </div>
        </div>
      ),
    },
    {
      title: "Dịch vụ",
      key: "service",
      width: 180,
      render: (_, record: BookingInfoDto) => (
          <div>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
            {record.bookingItems?.length || 0} dịch vụ
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>
            {formatDurationVer01(record.estimatedDurationMinutes || 0)}
            </div>
            <div style={{ fontSize: 12, color: "#52c41a", fontWeight: 500 }}>
            {formatCurrency(record.totalPrice || 0)} {record.currency || "VND"}
            </div>
          </div>
      ),
    },
    {
      title: "Thời gian",
      key: "datetime",
      width: 150,
      sorter: (a, b) => {
        const aTime = a.scheduledStartAt || a.preferredStartAt || a.createdAt;
        const bTime = b.scheduledStartAt || b.preferredStartAt || b.createdAt;
        return dayjs(aTime).unix() - dayjs(bTime).unix();
      },
      render: (_, record: BookingInfoDto) => {
        const displayTime =
          record.scheduledStartAt ||
          record.preferredStartAt ||
          record.createdAt;
        return (
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>
              {dayjs(displayTime).format("DD/MM/YYYY")}
          </div>
          <div style={{ fontSize: 13, color: "#666" }}>
              {dayjs(displayTime).format("HH:mm")}
          </div>
          <div
            style={{
              fontSize: 11,
              color:
                  record.status === BookingStatus.COMPLETED
                  ? "#52c41a"
                    : record.status === BookingStatus.CANCELLED
                  ? "#ff4d4f"
                  : "#1890ff",
            }}
          >
              {getTimeRemaining(
                dayjs(displayTime).format("YYYY-MM-DD"),
                dayjs(displayTime).format("HH:mm")
              )}
          </div>
        </div>
        );
      },
    },
    {
      title: "Chi nhánh",
      dataIndex: "branchName",
      key: "branchName",
      width: 160,
      render: (name: string, record: BookingInfoDto) => (
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{name || "N/A"}</div>
          <div style={{ fontSize: 11, color: "#666" }}>
            {record.bayName || "Chưa chọn bay"}
          </div>
          {record.branchCode && (
            <div style={{ fontSize: 10, color: "#999" }}>
              {record.branchCode}
            </div>
          )}
        </div>
      ),
    },

    {
      title: "Ưu tiên",
      dataIndex: "priority",
      key: "priority",
      width: 100,
      align: "center",
      render: (priority: Priority) => {
        const priorityConfig = getPriorityConfig(priority);
        return (
          <Tag color={priorityConfig.color} icon={priorityConfig.icon} style={{ fontSize: 12 }}>
            {priorityConfig.label}
          </Tag>
        );
      },
      filters: Object.values(Priority).map((priority) => ({
        text: getPriorityConfig(priority).label,
        value: priority,
      })),
      onFilter: (value, record) => record.priority === value,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center",
      render: (status: BookingStatus) => {
        const statusConfig = getStatusConfig(status);
        return (
          <Tag color={statusConfig.color} icon={statusConfig.icon} style={{ fontSize: 12 }}>
            {statusConfig.label}
          </Tag>
        );
      },
      filters: Object.values(BookingStatus).map((status) => ({
        text: getStatusConfig(status).label,
        value: status,
      })),
      onFilter: (value, record) => record.status === value,
    },
  ];

  // Handlers
  const handleAdd = () => {
    setModalMode("create");
    setSelectedBooking(null);
    setModalOpen(true);
  };

  const handleEdit = (record: BookingInfoDto) => {
    setModalMode("edit");
    setSelectedBooking(record);
    setModalOpen(true);
  };

  const handleDelete = (record: BookingInfoDto) => {
    showModal({
      title: "Hủy lịch đặt",
      content: `Bạn có chắc chắn muốn hủy lịch đặt ${record.bookingCode} của khách hàng ${record.customerName}?`,
      type: "error",
      onConfirm: async () => {
        try {
          await cancelBookingMutation.mutateAsync({
            bookingId: record.bookingId,
            reason: "Hủy bởi admin",
            cancelledBy: "admin",
          });
          notification.success({
            message: "Thành công",
            description: "Hủy lịch đặt thành công",
            placement: "topRight",
          });
        } catch {
          notification.error({
            message: "Lỗi",
            description: "Có lỗi xảy ra khi hủy lịch đặt",
            placement: "topRight",
          });
        }
      },
    });
  };

  const handleView = (record: BookingInfoDto) => {
    setSelectedBooking(record);
    setDetailModalOpen(true);
  };

  const handleViewDetail = (record: BookingInfoDto) => {
    setSelectedBooking(record);
    setDetailModalOpen(true);
  };

  const handleCheckIn = (record: BookingInfoDto) => {
    showModal({
      title: "Check-in lịch đặt",
      content: `Xác nhận check-in cho lịch đặt ${record.bookingCode} của khách hàng ${record.customerName}?`,
      type: "info",
      onConfirm: async () => {
        try {
          await checkInBookingMutation.mutateAsync(record.bookingId);
          notification.success({
            message: "Thành công",
            description: "Check-in thành công",
            placement: "topRight",
          });
        } catch {
          notification.error({
            message: "Lỗi",
            description: "Có lỗi xảy ra khi check-in",
            placement: "topRight",
          });
        }
      },
    });
  };

  const handleStartService = (record: BookingInfoDto) => {
    showModal({
      title: "Bắt đầu dịch vụ",
      content: `Xác nhận bắt đầu dịch vụ cho lịch đặt ${record.bookingCode} của khách hàng ${record.customerName}?`,
      type: "info",
      onConfirm: async () => {
        try {
          await startServiceMutation.mutateAsync(record.bookingId);
          notification.success({
            message: "Thành công",
            description: "Bắt đầu dịch vụ thành công",
            placement: "topRight",
          });
        } catch (error) {
          console.error("Start service error:", error);
          notification.error({
            message: "Lỗi",
            description: "Có lỗi xảy ra khi bắt đầu dịch vụ",
            placement: "topRight",
          });
        }
      },
    });
  };

  const handleCompleteService = (record: BookingInfoDto) => {
    showModal({
      title: "Hoàn thành dịch vụ",
      content: `Xác nhận hoàn thành dịch vụ cho lịch đặt ${record.bookingCode} của khách hàng ${record.customerName}?`,
      type: "info",
      onConfirm: async () => {
        try {
          await completeServiceMutation.mutateAsync(record.bookingId);
          notification.success({
            message: "Thành công",
            description: "Hoàn thành dịch vụ thành công",
            placement: "topRight",
          });
        } catch {
          notification.error({
            message: "Lỗi",
            description: "Có lỗi xảy ra khi hoàn thành dịch vụ",
            placement: "topRight",
          });
        }
      },
    });
  };

  const handleModalOk = async () => {
    // This will be handled by the BookingModal component
    setModalOpen(false);
  };

  const handleConfirm = (record: BookingInfoDto) => {
    showModal({
      title: "Xác nhận lịch đặt",
      content: `Xác nhận lịch đặt ${record.bookingCode} của khách hàng ${record.customerName}?`,
      type: "info",
      onConfirm: async () => {
        try {
          await confirmBookingMutation.mutateAsync(record.bookingId);
          notification.success({
            message: "Thành công",
            description: "Xác nhận lịch đặt thành công",
            placement: "topRight",
          });
        } catch {
          notification.error({
            message: "Lỗi",
            description: "Có lỗi xảy ra khi xác nhận lịch đặt",
            placement: "topRight",
          });
        }
      },
    });
  };

  const handleComplete = (record: BookingInfoDto) => {
    showModal({
      title: "Hoàn thành lịch đặt",
      content: `Đánh dấu lịch đặt ${record.bookingCode} là hoàn thành?`,
      type: "success",
      onConfirm: async () => {
        try {
          await completeServiceMutation.mutateAsync(record.bookingId);
          notification.success({
            message: "Thành công",
            description: "Hoàn thành lịch đặt thành công",
            placement: "topRight",
          });
        } catch {
          notification.error({
            message: "Lỗi",
            description: "Có lỗi xảy ra khi hoàn thành lịch đặt",
            placement: "topRight",
          });
        }
      },
    });
  };

  const handleCreateTrackingSuccess = () => {
    setCreateTrackingModalOpen(false);
    setSelectedBooking(null);
  };

  const handleServiceTracking = (record: BookingInfoDto) => {
    setSelectedBooking(record);
    setServiceTrackingModalOpen(true);
  };

  return (
    <App>
      <AdminTable
        title="Quản lý đặt lịch"
        dataSource={data}
        columns={columns}
        scroll={{ x: 1300 }}
        loading={
          isLoading ||
          isLoadingCustomers ||
          isLoadingVehicles ||
          confirmBookingMutation.isPending ||
          cancelBookingMutation.isPending ||
          completeServiceMutation.isPending ||
          checkInBookingMutation.isPending ||
          startServiceMutation.isPending
        }
        onAdd={handleAdd}
        onEdit={handleEdit}
        onEditCondition={(record: BookingInfoDto) => {
          // Chỉ cho phép chỉnh sửa khi booking ở trạng thái PENDING hoặc CONFIRMED
          return record.status === BookingStatus.PENDING || record.status === BookingStatus.CONFIRMED;
        }}
        onView={handleView}
        addButtonText="Đặt lịch mới"
        searchable={true}
        searchPlaceholder="Tìm kiếm đặt lịch theo mã, khách hàng, dịch vụ..."
        searchFields={["bookingCode", "customerName", "vehicleLicensePlate"]}
        pagination={{
          current: filterParams.page + 1,
          pageSize: filterParams.size,
          total: totalElements,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: number, range: [number, number]) =>
            `${range[0]}-${range[1]} của ${total} booking`,
          onChange: (page: number, pageSize: number) => {
            setFilterParams({
              ...filterParams,
              page: page - 1,
              size: pageSize || 10,
            });
          },
        }}
        actions={[
          {
            key: "confirm",
            label: "Xác nhận",
            type: "default",
            icon: <CheckCircleOutlined />,
            onClick: handleConfirm,
            condition: (record: BookingInfoDto) =>
              record.status === BookingStatus.PENDING,
          },
          {
            key: "checkin",
            label: "Check-in",
            type: "default",
            icon: <LoginOutlined />,
            onClick: handleCheckIn,
            condition: (record: BookingInfoDto) =>
              record.status === BookingStatus.CONFIRMED,
          },
          {
            key: "start",
            label: "Bắt đầu dịch vụ",
            type: "default",
            icon: <PlayCircleOutlined />,
            onClick: handleStartService,
            condition: (record: BookingInfoDto) =>
              record.status === BookingStatus.CHECKED_IN,
          },
          {
            key: "tracking",
            label: "Theo dõi quá trình chăm sóc xe",
            type: "primary",
            icon: <MonitorOutlined />,
            onClick: handleServiceTracking,
            condition: (record: BookingInfoDto) =>
              [BookingStatus.IN_PROGRESS, BookingStatus.PAUSED].includes(record.status),
          },
          {
            key: "cancel",
            label: "Hủy",
            type: "default",
            danger: true,
            icon: <CloseCircleOutlined />,
            onClick: handleDelete,
            condition: (record: BookingInfoDto) =>
              [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN].includes(record.status),
          },
        ]}
      />

      {/* Modal đặt lịch */}
      <BookingModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleModalOk}
        initialData={selectedBooking || undefined}
        mode={modalMode}
        loading={isLoading}
      />

      {/* Modal tạo tracking */}
      {selectedBooking && (
        <CreateTrackingModal
          open={createTrackingModalOpen}
          onCancel={() => setCreateTrackingModalOpen(false)}
          onSuccess={handleCreateTrackingSuccess}
          booking={selectedBooking}
        />
      )}

      {/* Modal theo dõi quá trình chăm sóc xe */}
      {selectedBooking && (
        <ServiceTrackingModal
          open={serviceTrackingModalOpen}
          onCancel={() => setServiceTrackingModalOpen(false)}
          booking={selectedBooking}
        />
      )}

      {/* Modal chi tiết */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <EyeOutlined style={{ color: "#1890ff" }} />
            <span>Chi tiết lịch đặt</span>
            {selectedBooking && (
              <Tag
                color={getStatusConfig(selectedBooking.status).color}
                style={{ marginLeft: 8 }}
              >
                {getStatusConfig(selectedBooking.status).label}
              </Tag>
            )}
          </div>
        }
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={1000}
        style={{ top: 20 }}
      >
        {selectedBooking && (
          <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
            {/* Header Info */}
            <div
                style={{
                marginBottom: 24,
                padding: 16,
                backgroundColor: "#f8f9fa",
                borderRadius: 8,
                border: "1px solid #e9ecef",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
              <div>
                  <Text
                    style={{ fontSize: 18, fontWeight: 600, color: "#1890ff" }}
                  >
                    {selectedBooking.bookingCode}
                  </Text>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                    ID: {selectedBooking.bookingId}
                </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>
                    {formatCurrency(selectedBooking.totalPrice || 0)}{" "}
                    {selectedBooking.currency || "VND"}
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>
                    {formatDurationVer01(
                      selectedBooking.estimatedDurationMinutes || 0
                    )}
                </div>
              </div>
              </div>

              {/* Priority and Status */}
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Tag
                  color={
                    getPriorityConfig(
                      selectedBooking.priority || Priority.NORMAL
                    ).color
                  }
                  icon={
                    getPriorityConfig(
                      selectedBooking.priority || Priority.NORMAL
                    ).icon
                  }
                >
                  {
                    getPriorityConfig(
                      selectedBooking.priority || Priority.NORMAL
                    ).label
                  }
                </Tag>
                {selectedBooking.paymentStatus && (
                  <Tag color="blue">
                    Thanh toán: {selectedBooking.paymentStatus}
                  </Tag>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 24,
              }}
            >
              {/* Left Column */}
              <div>
                {/* Customer Info */}
                <div style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      marginBottom: 12,
                      color: "#262626",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <PhoneOutlined style={{ color: "#1890ff" }} />
                    Thông tin khách hàng
                    {(selectedBooking as EnrichedBookingInfoDto)
                      .isCustomerEnriched && (
                      <Badge
                        count="✓"
                        style={{ backgroundColor: "#52c41a", fontSize: 8 }}
                      />
                    )}
                </div>
                  <div
                    style={{
                      padding: 16,
                      backgroundColor: "#fff",
                      border: "1px solid #d9d9d9",
                      borderRadius: 6,
                    }}
                  >
                    <div
                      style={{ fontWeight: 500, fontSize: 15, marginBottom: 8 }}
                    >
                      {selectedBooking.customerName || "N/A"}
                </div>
                    <div
                      style={{ fontSize: 13, color: "#666", marginBottom: 4 }}
                    >
                      📞 {selectedBooking.customerPhone || "N/A"}
                </div>
                    {selectedBooking.customerEmail && (
                      <div
                        style={{ fontSize: 13, color: "#666", marginBottom: 4 }}
                      >
                        📧 {selectedBooking.customerEmail}
              </div>
                    )}
                    {selectedBooking.customerId && (
                      <div
                        style={{
                          fontSize: 11,
                          color: "#999",
                          fontFamily: "monospace",
                        }}
                      >
                        ID: {selectedBooking.customerId.substring(0, 8)}...
                      </div>
                    )}
                  </div>
                </div>

                {/* Vehicle Info */}
                <div style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      marginBottom: 12,
                      color: "#262626",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span>🚗</span>
                    Thông tin xe
                    {(selectedBooking as EnrichedBookingInfoDto)
                      .isVehicleEnriched && (
                      <Badge
                        count="✓"
                        style={{ backgroundColor: "#52c41a", fontSize: 8 }}
                      />
                    )}
                </div>
                  <div
                    style={{
                      padding: 16,
                      backgroundColor: "#fff",
                      border: "1px solid #d9d9d9",
                      borderRadius: 6,
                    }}
                  >
                    <div
                      style={{ fontWeight: 500, fontSize: 15, marginBottom: 8 }}
                    >
                      {selectedBooking.vehicleLicensePlate || "N/A"}
                </div>
                    <div
                      style={{ fontSize: 13, color: "#666", marginBottom: 4 }}
                    >
                      {selectedBooking.vehicleBrandName || "N/A"}{" "}
                      {selectedBooking.vehicleModelName || ""}
              </div>
                    <div
                      style={{ fontSize: 13, color: "#666", marginBottom: 4 }}
                    >
                      {selectedBooking.vehicleTypeName || "N/A"} •{" "}
                      {selectedBooking.vehicleYear || "N/A"} •{" "}
                      {selectedBooking.vehicleColor || "N/A"}
                    </div>
                    {selectedBooking.vehicleId && (
                      <div
                        style={{
                          fontSize: 11,
                          color: "#999",
                          fontFamily: "monospace",
                        }}
                      >
                        ID: {selectedBooking.vehicleId.substring(0, 8)}...
                      </div>
                    )}
                  </div>
                </div>

                {/* Branch Info */}
                <div style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      marginBottom: 12,
                      color: "#262626",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span>🏢</span>
                    Chi nhánh & Bay
                </div>
                  <div
                    style={{
                      padding: 16,
                      backgroundColor: "#fff",
                      border: "1px solid #d9d9d9",
                      borderRadius: 6,
                    }}
                  >
                    <div
                      style={{ fontWeight: 500, fontSize: 15, marginBottom: 8 }}
                    >
                      {selectedBooking.branchName || "N/A"}
                    </div>
                    <div
                      style={{ fontSize: 13, color: "#666", marginBottom: 4 }}
                    >
                      Bay: {selectedBooking.bayName || "Chưa chọn bay"}
                    </div>
                    {selectedBooking.branchCode && (
                      <div style={{ fontSize: 12, color: "#999" }}>
                        Mã: {selectedBooking.branchCode}
                      </div>
                    )}
                    {selectedBooking.bayType && (
                      <div style={{ fontSize: 12, color: "#999" }}>
                        Loại: {selectedBooking.bayType}
                </div>
                    )}
              </div>
                </div>
              </div>

              {/* Right Column */}
              <div>
                {/* Services */}
                <div style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      marginBottom: 12,
                      color: "#262626",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span>🔧</span>
                    Dịch vụ ({selectedBooking.bookingItems?.length || 0})
                </div>
                  <div
                    style={{
                      padding: 16,
                      backgroundColor: "#fff",
                      border: "1px solid #d9d9d9",
                      borderRadius: 6,
                    }}
                  >
                    {selectedBooking.bookingItems?.length ? (
                      <div>
                        {selectedBooking.bookingItems.map(
                          (item, index: number) => (
                            <div
                              key={index}
                              style={{
                                marginBottom: 8,
                                padding: 8,
                                backgroundColor: "#f0f8ff",
                                borderRadius: 4,
                                border: "1px solid #d6e4ff",
                              }}
                            >
                              <div style={{ fontWeight: 500, fontSize: 13 }}>
                                {item.serviceName ||
                                  `Service ${item.serviceId?.substring(
                                    0,
                                    8
                                  )}...`}
                              </div>
                              <div
                                style={{
                                  fontSize: 12,
                                  color: "#666",
                                  marginTop: 2,
                                }}
                              >
                                {formatCurrency(item.totalPrice || 0)} • Số
                                lượng: {item.quantity || 1}
                              </div>
                              {item.notes && (
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: "#999",
                                    marginTop: 2,
                                  }}
                                >
                                  Ghi chú: {item.notes}
                                </div>
                              )}
                            </div>
                          )
                        )}
                        <div
                          style={{
                            marginTop: 12,
                            padding: 8,
                            backgroundColor: "#f6ffed",
                            borderRadius: 4,
                            border: "1px solid #b7eb8f",
                          }}
                        >
                          <div style={{ fontWeight: 600, color: "#52c41a" }}>
                            Tổng:{" "}
                            {formatCurrency(selectedBooking.totalPrice || 0)}{" "}
                            {selectedBooking.currency || "VND"}
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>
                            Thời gian ước tính:{" "}
                            {formatDurationVer01(
                              selectedBooking.estimatedDurationMinutes || 0
                            )}
                </div>
              </div>
                      </div>
                    ) : (
                      <Text type="secondary">Không có dịch vụ</Text>
                    )}
                  </div>
                </div>

                {/* Staff Assignments */}
                <div style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      marginBottom: 12,
                      color: "#262626",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span>👥</span>
                    Nhân viên phân công
                  </div>
                  <div
                    style={{
                      padding: 16,
                      backgroundColor: "#fff",
                      border: "1px solid #d9d9d9",
                      borderRadius: 6,
                    }}
                  >
                    {selectedBooking.assignments?.length ? (
              <div>
                        {selectedBooking.assignments.map(
                          (assignment, index: number) => (
                            <Tag
                              key={index}
                              color="green"
                              style={{ marginBottom: 4, marginRight: 4 }}
                            >
                              {assignment.technicianName ||
                                `Tech ${assignment.technicianId?.substring(
                                  0,
                                  8
                                )}...`}
                              {assignment.role && ` - ${assignment.role}`}
                    </Tag>
                  )
                )}
              </div>
                    ) : (
                      <Text type="secondary">Chưa phân công nhân viên</Text>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                <div style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      marginBottom: 12,
                      color: "#262626",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span>⏰</span>
                    Thời gian
                  </div>
                  <div
                    style={{
                      padding: 16,
                      backgroundColor: "#fff",
                      border: "1px solid #d9d9d9",
                      borderRadius: 6,
                    }}
                  >
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 12, color: "#666" }}>
                        Thời gian đặt lịch
                      </div>
                      <div style={{ fontWeight: 500 }}>
                        {dayjs(
                          selectedBooking.scheduledStartAt ||
                            selectedBooking.preferredStartAt ||
                            selectedBooking.createdAt
                        ).format("DD/MM/YYYY HH:mm")}
                      </div>
                      <div style={{ fontSize: 11, color: "#1890ff" }}>
                        {getTimeRemaining(
                          dayjs(
                            selectedBooking.scheduledStartAt ||
                              selectedBooking.preferredStartAt ||
                              selectedBooking.createdAt
                          ).format("YYYY-MM-DD"),
                          dayjs(
                            selectedBooking.scheduledStartAt ||
                              selectedBooking.preferredStartAt ||
                              selectedBooking.createdAt
                          ).format("HH:mm")
                        )}
                      </div>
                    </div>

                    {selectedBooking.actualStartAt && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 12, color: "#666" }}>
                          Bắt đầu thực hiện
                        </div>
                        <div style={{ fontWeight: 500, color: "#52c41a" }}>
                          {dayjs(selectedBooking.actualStartAt).format(
                            "DD/MM/YYYY HH:mm"
                          )}
                        </div>
                      </div>
                    )}

                    {selectedBooking.actualEndAt && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 12, color: "#666" }}>
                          Hoàn thành
                        </div>
                        <div style={{ fontWeight: 500, color: "#1890ff" }}>
                          {dayjs(selectedBooking.actualEndAt).format(
                            "DD/MM/YYYY HH:mm"
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            {(selectedBooking.notes ||
              selectedBooking.specialRequests?.length ||
              selectedBooking.depositAmount ||
              selectedBooking.couponCode) && (
              <div style={{ marginTop: 24 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    marginBottom: 12,
                    color: "#262626",
                  }}
                >
                  Thông tin bổ sung
                </div>
                <div
                  style={{
                    padding: 16,
                    backgroundColor: "#fff",
                    border: "1px solid #d9d9d9",
                    borderRadius: 6,
                  }}
                >
            {selectedBooking.notes && (
                    <div style={{ marginBottom: 12 }}>
                      <div
                        style={{ fontSize: 12, color: "#666", marginBottom: 4 }}
                      >
                        Ghi chú
                      </div>
                      <div style={{ fontSize: 13 }}>
                {selectedBooking.notes}
                      </div>
                    </div>
            )}

            {selectedBooking.specialRequests &&
              selectedBooking.specialRequests.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#666",
                            marginBottom: 4,
                          }}
                        >
                          Yêu cầu đặc biệt
                        </div>
                        <div>
                  {selectedBooking.specialRequests.map(
                    (request: string, index: number) => (
                      <Tag
                        key={index}
                        color="purple"
                                style={{ marginBottom: 4, marginRight: 4 }}
                      >
                        {request}
                      </Tag>
                    )
                  )}
                        </div>
                      </div>
                    )}

                  {(selectedBooking.depositAmount ||
                    selectedBooking.couponCode) && (
                    <div style={{ marginBottom: 12 }}>
                      <div
                        style={{ fontSize: 12, color: "#666", marginBottom: 4 }}
                      >
                        Thanh toán
                      </div>
                      {selectedBooking.depositAmount && (
                        <div style={{ fontSize: 13, marginBottom: 2 }}>
                          Đặt cọc:{" "}
                          {formatCurrency(selectedBooking.depositAmount)}{" "}
                          {selectedBooking.currency || "VND"}
                        </div>
                      )}
                      {selectedBooking.couponCode && (
                        <div style={{ fontSize: 13, color: "#52c41a" }}>
                          Mã giảm giá: {selectedBooking.couponCode}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* System Info */}
            <div
              style={{
                marginTop: 24,
                padding: 16,
                backgroundColor: "#fafafa",
                borderRadius: 6,
                border: "1px solid #e8e8e8",
              }}
            >
              <div style={{ fontSize: 12, color: "#999", marginBottom: 8 }}>
                Thông tin hệ thống
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                  fontSize: 11,
                  color: "#666",
                }}
              >
                <div>
                  Tạo:{" "}
                  {dayjs(selectedBooking.createdAt).format("DD/MM/YYYY HH:mm")}
                </div>
                <div>
                  Cập nhật:{" "}
                  {dayjs(selectedBooking.updatedAt).format("DD/MM/YYYY HH:mm")}
                </div>
                {selectedBooking.createdBy && (
                  <div>Người tạo: {selectedBooking.createdBy}</div>
                )}
                {selectedBooking.cancelledAt && (
                  <div style={{ color: "#ff4d4f" }}>
                    Hủy:{" "}
                    {dayjs(selectedBooking.cancelledAt).format(
                      "DD/MM/YYYY HH:mm"
                    )}
                  </div>
                )}
                {selectedBooking.cancellationReason && (
                  <div style={{ color: "#ff4d4f" }}>
                    Lý do: {selectedBooking.cancellationReason}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </App>
  );
};

export default BookingsPage;
