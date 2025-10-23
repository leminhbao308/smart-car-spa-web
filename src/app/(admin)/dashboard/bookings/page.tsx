"use client";
import React, { useState, useEffect } from "react";
import { AdminTable } from "@/components/ui/Table";
import { useConfirmationModalContext } from "@/components/ui/Modal";
import BookingModal from "@/components/ui/Modal/BookingModal/BookingModal";
import UpdateBookingModal from "@/components/ui/Modal/UpdateBookingModal/UpdateBookingModal";
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
import { useBookingWithInventory } from "@/lib/api/hooks/useBookingWithInventory";
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
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingInfoDto | null>(
    null
  );
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [createTrackingModalOpen, setCreateTrackingModalOpen] = useState(false);
  const [serviceTrackingModalOpen, setServiceTrackingModalOpen] =
    useState(false);
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
  
  // Enhanced hooks with inventory management
  const {
    confirmBookingWithInventory,
    cancelBookingWithInventory,
  } = useBookingWithInventory();

  // Fetch additional data for enrichment
  const { customers, loading: isLoadingCustomers } = useCustomersDropdown();
  const { profiles: allVehicles, loading: isLoadingVehicles } =
    useVehicleProfiles({ params: { size: 1000 } });

  // Helper function to enrich booking data with customer and vehicle info
  const enrichBookingData = (
    booking: BookingInfoDto
  ): EnrichedBookingInfoDto => {
    let enrichedBooking = { ...booking };
    let isCustomerEnriched = false;
    let isVehicleEnriched = false;
    console.log("Đây là booking:", booking);
    // Enrich customer info if missing
    if (
      booking.customer_id &&
      (!booking.customer_name || !booking.customer_phone)
    ) {
      const customer = customers.find((c) => c.user_id === booking.customer_id);
      if (customer) {
        enrichedBooking = {
          ...enrichedBooking,
          customer_name: enrichedBooking.customer_name || customer.full_name,
          customer_phone:
            enrichedBooking.customer_phone || customer.phone_number,
          customer_email: enrichedBooking.customer_email || customer.email,
        };
        isCustomerEnriched = true;
      }
    }

    // Enrich vehicle info if missing
    if (
      booking.vehicle_id &&
      (!booking.vehicle_brand_name || !booking.vehicle_model_name)
    ) {
      const vehicle = allVehicles.find(
        (v) => v.vehicle_id === booking.vehicle_id
      );
      if (vehicle) {
        enrichedBooking = {
          ...enrichedBooking,
          vehicle_license_plate:
            enrichedBooking.vehicle_license_plate || vehicle.license_plate,
          vehicle_brand_name:
            enrichedBooking.vehicle_brand_name ||
            ((vehicle as unknown as Record<string, unknown>)
              .brand_name as string),
          vehicle_model_name:
            enrichedBooking.vehicle_model_name ||
            ((vehicle as unknown as Record<string, unknown>)
              .model_name as string),
          vehicle_type_name:
            enrichedBooking.vehicle_type_name ||
            ((vehicle as unknown as Record<string, unknown>)
              .type_name as string),
          vehicle_year:
            enrichedBooking.vehicle_year ||
            ((vehicle as unknown as Record<string, unknown>)
              .model_year as number),
          vehicle_color:
            enrichedBooking.vehicle_color ||
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
      dataIndex: "booking_code",
      key: "booking_code",
      width: 120,
      render: (code: string) => (
        <span
          style={{
            fontFamily: "monospace",
            fontWeight: 500,
            color: "#1890ff",
            fontSize: 14,
          }}
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
            {record.customer_name || "N/A"}
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
            {record.customer_phone || "N/A"}
          </div>
          {record.customer_email && (
            <div style={{ fontSize: 12, color: "#999" }}>
              {record.customer_email}
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
            {record.vehicle_license_plate || "N/A"}
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
            {record.vehicle_brand_name || "N/A"}{" "}
            {record.vehicle_model_name || ""}
          </div>
          <div style={{ fontSize: 12, color: "#999" }}>
            {record.vehicle_year || "N/A"} • {record.vehicle_color || "N/A"}
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
            {record.booking_items?.length || 0} dịch vụ
          </div>
          <div style={{ fontSize: 12, color: "#666" }}>
            {formatDurationVer01(record.estimated_duration_minutes || 0)}
          </div>
          <div style={{ fontSize: 12, color: "#52c41a", fontWeight: 500 }}>
            {formatCurrency(record.total_price || 0)} {record.currency || "VND"}
          </div>
        </div>
      ),
    },
    {
      title: "Thời gian",
      key: "datetime",
      width: 150,
      sorter: (a, b) => {
        const aTime =
          a.scheduled_start_at || a.preferred_start_at || a.created_at;
        const bTime =
          b.scheduled_start_at || b.preferred_start_at || b.created_at;
        return dayjs(aTime).unix() - dayjs(bTime).unix();
      },
      render: (_, record: BookingInfoDto) => {
        const displayTime =
          record.scheduled_start_at ||
          record.preferred_start_at ||
          record.created_at;
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
      dataIndex: "branch_name",
      key: "branch_name",
      width: 160,
      render: (name: string, record: BookingInfoDto) => (
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{name || "N/A"}</div>
          <div style={{ fontSize: 11, color: "#666" }}>
            {record.bay_name || "Chưa chọn bay"}
          </div>
          {record.branch_code && (
            <div style={{ fontSize: 10, color: "#999" }}>
              {record.branch_code}
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
          <Tag
            color={priorityConfig.color}
            icon={priorityConfig.icon}
            style={{ fontSize: 12 }}
          >
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
          <Tag
            color={statusConfig.color}
            icon={statusConfig.icon}
            style={{ fontSize: 12 }}
          >
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
    {
      title: "Thanh toán",
      dataIndex: "payment_status",
      key: "payment_status",
      width: 120,
      align: "center",
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
      filters: [
        { text: "Chờ thanh toán", value: "PENDING" },
        { text: "Đã thanh toán", value: "PAID" },
        { text: "Thanh toán thất bại", value: "FAILED" },
        { text: "Đã hoàn tiền", value: "REFUNDED" },
      ],
      onFilter: (value, record) => record.payment_status === value,
    },
  ];

  // Handlers
  const handleAdd = () => {
    setSelectedBooking(null);
    setModalOpen(true);
  };

  const handleEdit = (record: BookingInfoDto) => {
    setSelectedBooking(record);
    setUpdateModalOpen(true);
  };

  const handleDelete = (record: BookingInfoDto) => {
    showModal({
      title: "Hủy lịch đặt",
      content: `Bạn có chắc chắn muốn hủy lịch đặt ${record.booking_code} của khách hàng ${record.customer_name}?`,
      type: "error",
      onConfirm: async () => {
        try {          
          // Use enhanced hook with inventory release
          await cancelBookingWithInventory(
            record, 
            record.branch_id, 
            "Hủy bởi admin", 
            "admin"
          );
          notification.success({
            message: "Thành công",
            description: "Hủy lịch đặt và hoàn trả sản phẩm thành công",
            placement: "topRight",
          });
        } catch (error) {
          console.error("❌ Error cancelling booking with inventory:", error);
          notification.error({
            message: "Lỗi",
            description: "Có lỗi xảy ra khi hủy lịch đặt hoặc hoàn trả sản phẩm",
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

  const handleCheckIn = (record: BookingInfoDto) => {
    showModal({
      title: "Check-in lịch đặt",
      content: `Xác nhận check-in cho lịch đặt ${record.booking_code} của khách hàng ${record.customer_name}?`,
      type: "info",
      onConfirm: async () => {
        try {
          await checkInBookingMutation.mutateAsync(record.booking_id);
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

  const handleModalOk = async () => {
    // This will be handled by the BookingModal component
    setModalOpen(false);
  };

  const handleUpdateModalOk = async () => {
    // This will be handled by the UpdateBookingModal component
    setUpdateModalOpen(false);
    setSelectedBooking(null);
  };

  const handleConfirm = (record: BookingInfoDto) => {
    showModal({
      title: "Xác nhận lịch đặt",
      content: `Xác nhận lịch đặt ${record.booking_code} của khách hàng ${record.customer_name}?`,
      type: "info",
      onConfirm: async () => {
        try {
          // Use enhanced hook with inventory fulfillment
          await confirmBookingWithInventory(record, record.branch_id);
          notification.success({
            message: "Thành công",
            description: "Xác nhận lịch đặt và xuất sản phẩm thành công",
            placement: "topRight",
          });
        } catch (error) {
          console.error("Error confirming booking with inventory:", error);
          notification.error({
            message: "Lỗi",
            description: "Có lỗi xảy ra khi xác nhận lịch đặt hoặc xuất sản phẩm",
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

  return (
    <App>
      <AdminTable
        title="Quản lý đặt lịch"
        dataSource={data}
        columns={columns}
        scroll={{ x: 1420 }}
        rowKey="booking_id"
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
          return (
            record.status === BookingStatus.PENDING ||
            record.status === BookingStatus.CONFIRMED
          );
        }}
        onView={handleView}
        addButtonText="Đặt lịch mới"
        searchable={true}
        searchPlaceholder="Tìm kiếm đặt lịch theo mã, khách hàng, dịch vụ..."
        searchFields={[
          "booking_code",
          "customer_name",
          "vehicle_license_plate",
        ]}
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
            key: "cancel",
            label: "Hủy booking",
            type: "default",
            icon: <CloseCircleOutlined />,
            onClick: handleDelete,
            condition: (record: BookingInfoDto) =>
              record.status === BookingStatus.PENDING ||
              record.status === BookingStatus.CONFIRMED ||
              record.status === BookingStatus.CHECKED_IN,
          },
        ]}
      />

      {/* Modal đặt lịch */}
      <BookingModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleModalOk}
        loading={isLoading}
      />

      {/* Modal cập nhật booking */}
      {selectedBooking && (
        <UpdateBookingModal
          open={updateModalOpen}
          onCancel={() => setUpdateModalOpen(false)}
          onOk={handleUpdateModalOk}
          initialData={selectedBooking}
          loading={isLoading}
        />
      )}

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
                    {selectedBooking.booking_code}
                  </Text>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                    ID: {selectedBooking.booking_id}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>
                    {formatCurrency(selectedBooking.total_price || 0)}{" "}
                    {selectedBooking.currency || "VND"}
                  </div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    {formatDurationVer01(
                      selectedBooking.estimated_duration_minutes || 0
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
                {selectedBooking.payment_status && (
                  <Tag color="blue">
                    Thanh toán: {selectedBooking.payment_status}
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
                      {selectedBooking.customer_name || "N/A"}
                    </div>
                    <div
                      style={{ fontSize: 13, color: "#666", marginBottom: 4 }}
                    >
                      📞 {selectedBooking.customer_phone || "N/A"}
                    </div>
                    {selectedBooking.customer_email && (
                      <div
                        style={{ fontSize: 13, color: "#666", marginBottom: 4 }}
                      >
                        📧 {selectedBooking.customer_email}
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
                      {selectedBooking.vehicle_license_plate || "N/A"}
                    </div>
                    <div
                      style={{ fontSize: 13, color: "#666", marginBottom: 4 }}
                    >
                      {selectedBooking.vehicle_brand_name || "N/A"}{" "}
                      {selectedBooking.vehicle_model_name || ""}
                    </div>
                    <div
                      style={{ fontSize: 13, color: "#666", marginBottom: 4 }}
                    >
                      {selectedBooking.vehicle_type_name || "N/A"} •{" "}
                      {selectedBooking.vehicle_year || "N/A"} •{" "}
                      {selectedBooking.vehicle_color || "N/A"}
                    </div>
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
                    Chi nhánh
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
                      {selectedBooking.branch_name || "N/A"}
                    </div>
                    <div
                      style={{ fontSize: 13, color: "#666", marginBottom: 4 }}
                    >
                      Bay: {selectedBooking.bay_name || "Chưa chọn bay"}
                    </div>
                    {selectedBooking.branch_code && (
                      <div style={{ fontSize: 12, color: "#999" }}>
                        Mã: {selectedBooking.branch_code}
                      </div>
                    )}
                    {selectedBooking.bay_type && (
                      <div style={{ fontSize: 12, color: "#999" }}>
                        Loại: {selectedBooking.bay_type}
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
                    Dịch vụ ({selectedBooking.booking_items?.length || 0})
                  </div>
                  <div
                    style={{
                      padding: 16,
                      backgroundColor: "#fff",
                      border: "1px solid #d9d9d9",
                      borderRadius: 6,
                    }}
                  >
                    {selectedBooking.booking_items?.length ? (
                      <div>
                        {selectedBooking.booking_items.map(
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
                                {item.item_name ||
                                  `Service ${item.service_id?.substring(
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
                                {formatCurrency(item.unit_price || 0)} • Số
                                lượng: {item.quantity || 1}
                              </div>
                              {item.item_description && (
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: "#999",
                                    marginTop: 2,
                                  }}
                                >
                                  Ghi chú: {item.item_description}
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
                            {formatCurrency(selectedBooking.total_price || 0)}{" "}
                            {selectedBooking.currency || "VND"}
                          </div>
                          <div style={{ fontSize: 12, color: "#666" }}>
                            Thời gian ước tính:{" "}
                            {formatDurationVer01(
                              selectedBooking.estimated_duration_minutes || 0
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Text type="secondary">Không có dịch vụ</Text>
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
                          selectedBooking.scheduled_start_at ||
                            selectedBooking.preferred_start_at ||
                            selectedBooking.created_at
                        ).format("DD/MM/YYYY HH:mm")}
                      </div>
                      <div style={{ fontSize: 11, color: "#1890ff" }}>
                        {getTimeRemaining(
                          dayjs(
                            selectedBooking.scheduled_start_at ||
                              selectedBooking.preferred_start_at ||
                              selectedBooking.created_at
                          ).format("YYYY-MM-DD"),
                          dayjs(
                            selectedBooking.scheduled_start_at ||
                              selectedBooking.preferred_start_at ||
                              selectedBooking.created_at
                          ).format("HH:mm")
                        )}
                      </div>
                    </div>

                    {selectedBooking.actual_start_at && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 12, color: "#666" }}>
                          Bắt đầu thực hiện
                        </div>
                        <div style={{ fontWeight: 500, color: "#52c41a" }}>
                          {dayjs(selectedBooking.actual_start_at).format(
                            "DD/MM/YYYY HH:mm"
                          )}
                        </div>
                      </div>
                    )}

                    {selectedBooking.actual_end_at && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 12, color: "#666" }}>
                          Hoàn thành
                        </div>
                        <div style={{ fontWeight: 500, color: "#1890ff" }}>
                          {dayjs(selectedBooking.actual_end_at).format(
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
              selectedBooking.special_requests?.length ||
              selectedBooking.deposit_amount ||
              selectedBooking.coupon_code) && (
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

                  {selectedBooking.special_requests &&
                    selectedBooking.special_requests.length > 0 && (
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
                          {selectedBooking.special_requests.map(
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

                  {(selectedBooking.deposit_amount ||
                    selectedBooking.coupon_code) && (
                    <div style={{ marginBottom: 12 }}>
                      <div
                        style={{ fontSize: 12, color: "#666", marginBottom: 4 }}
                      >
                        Thanh toán
                      </div>
                      {selectedBooking.deposit_amount && (
                        <div style={{ fontSize: 13, marginBottom: 2 }}>
                          Đặt cọc:{" "}
                          {formatCurrency(selectedBooking.deposit_amount)}{" "}
                          {selectedBooking.currency || "VND"}
                        </div>
                      )}
                      {selectedBooking.coupon_code && (
                        <div style={{ fontSize: 13, color: "#52c41a" }}>
                          Mã giảm giá: {selectedBooking.coupon_code}
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
                  {dayjs(selectedBooking.created_at).format("DD/MM/YYYY HH:mm")}
                </div>
                <div>
                  Cập nhật:{" "}
                  {dayjs(selectedBooking.updated_at).format("DD/MM/YYYY HH:mm")}
                </div>
                {selectedBooking.created_by && (
                  <div>Người tạo: {selectedBooking.created_by}</div>
                )}
                {selectedBooking.cancelled_at && (
                  <div style={{ color: "#ff4d4f" }}>
                    Hủy:{" "}
                    {dayjs(selectedBooking.cancelled_at).format(
                      "DD/MM/YYYY HH:mm"
                    )}
                  </div>
                )}
                {selectedBooking.cancellation_reason && (
                  <div style={{ color: "#ff4d4f" }}>
                    Lý do: {selectedBooking.cancellation_reason}
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
