"use client";
import React, { useState, useEffect } from "react";
import { AdminTable } from "@/components/ui/Table";
import BookingModal from "@/components/ui/Modal/BookingModal/BookingModal";
import UpdateBookingModal from "@/components/ui/Modal/UpdateBookingModal/UpdateBookingModal";
import CreateTrackingModal from "@/components/ui/Modal/CreateTrackingModal";
import ServiceTrackingModal from "@/components/ui/Modal/ServiceTrackingModal";
import { ColumnsType } from "antd/es/table";
import {
  Tag,
  Modal,
  Typography,
  Button,
  App,
  DatePicker,
  Select,
  Space,
  Card,
} from "antd";
import {
  PhoneOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import formatCurrency from "@/components/utils/helper/currency.format.helper";
import { formatDurationVer01 } from "@/components/utils/helper/duration.format.helper";
import { getTimeRemaining } from "@/components/utils/helper/booking.time.helper";
import {
  useBookings,
  useCompleteService,
  useStartService,
} from "@/lib/api/hooks/useBooking";
import { useCustomersDropdown } from "@/lib/api/hooks/useUsers";
import { useVehicleProfiles } from "@/lib/api/hooks/useVehicleProfiles";
import { useBranches } from "@/lib/api/hooks/useBranches";
import {
  BookingInfoDto,
  BookingStatus,
  Priority,
} from "@/lib/api/types/booking.types";

const { Text } = Typography;
const { RangePicker } = DatePicker;

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
  const [filterParams, setFilterParams] = useState<{
    page: number;
    size: number;
  }>({
    page: 0,
    size: 10,
  });

  // Filter states
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | undefined>(
    undefined
  );
  const [selectedBookingType, setSelectedBookingType] = useState<
    "advance" | "walk-in" | undefined
  >(undefined);

  const { notification } = App.useApp();

  // API hooks - Load all data for client-side filtering
  const {
    data: bookingsResponse,
    isLoading,
    error,
    refetch: refetchBookings,
  } = useBookings({ page: 0, size: 1000 }); // Load large dataset for client-side filtering
  const completeServiceMutation = useCompleteService();
  const startServiceMutation = useStartService();

  // Fetch additional data for enrichment
  const { customers, loading: isLoadingCustomers } = useCustomersDropdown();
  const { profiles: allVehicles, loading: isLoadingVehicles } =
    useVehicleProfiles({ params: { size: 1000 } });
  const { branches, loading: isLoadingBranches } = useBranches();

  // Helper function to enrich booking data with customer, vehicle, branch and bay info
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

    // Enrich branch info if missing
    if (booking.branch_id && (!booking.branch_name || !booking.branch_code)) {
      const branch = branches.find((b) => b.branch_id === booking.branch_id);
      if (branch) {
        enrichedBooking = {
          ...enrichedBooking,
          branch_name: enrichedBooking.branch_name || branch.branch_name,
          branch_code: enrichedBooking.branch_code || branch.branch_code,
        };
      }
    }

    // Enrich bay info if missing (we need to load service bays by branch_id)
    // For now, we'll rely on backend to return bay_name, but we can enhance this later
    // if needed by loading service bays per branch

    return { ...enrichedBooking, isCustomerEnriched, isVehicleEnriched };
  };

  // Extract and enrich data from response
  const rawData =
    bookingsResponse?.data?.content || bookingsResponse?.data || [];
  const enrichedData = rawData.map(enrichBookingData);

  // Client-side filtering with useMemo
  const filteredData = React.useMemo(() => {
    let result = enrichedData;

    // Filter by date range
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf("day");
      const endDate = dateRange[1].endOf("day");
      result = result.filter((booking: EnrichedBookingInfoDto) => {
        const bookingDate =
          booking.scheduled_start_at ||
          booking.preferred_start_at ||
          booking.created_at;
        if (!bookingDate) return false;
        const date = dayjs(bookingDate).startOf("day");
        const startUnix = startDate.unix();
        const endUnix = endDate.unix();
        const dateUnix = date.unix();
        return dateUnix >= startUnix && dateUnix <= endUnix;
      });
    }

    // Filter by branch
    if (selectedBranchId) {
      result = result.filter(
        (booking: EnrichedBookingInfoDto) =>
          booking.branch_id === selectedBranchId
      );
    }

    // Filter by booking type based on booking_code
    if (selectedBookingType) {
      result = result.filter((booking: EnrichedBookingInfoDto) => {
        const bookingCode = booking.booking_code?.toUpperCase() || "";
        // Đặt trước (advance booking): booking_code bắt đầu bằng "BK"
        if (selectedBookingType === "advance") {
          return bookingCode.startsWith("BK");
        }
        // Đặt xử lý tại chỗ (walk-in): booking_code bắt đầu bằng "WALK-IN" hoặc "WALK"
        if (selectedBookingType === "walk-in") {
          return (
            bookingCode.startsWith("WALK-IN") || bookingCode.startsWith("WALK")
          );
        }
        return true;
      });
    }

    return result;
  }, [enrichedData, dateRange, selectedBranchId, selectedBookingType]);

  // Client-side pagination
  const data = React.useMemo(() => {
    const start = filterParams.page * filterParams.size;
    const end = start + filterParams.size;
    return filteredData.slice(start, end);
  }, [filteredData, filterParams.page, filterParams.size]);

  const totalElements = filteredData.length;

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

  const handleView = (record: BookingInfoDto) => {
    setSelectedBooking(record);
    setDetailModalOpen(true);
  };

  const handleModalOk = async () => {
    // This will be handled by the BookingModal component
    setModalOpen(false);
  };

  const handleUpdateModalOk = async (updatedBooking?: unknown) => {
    // Update selectedBooking with the updated data from backend
    if (
      updatedBooking &&
      typeof updatedBooking === "object" &&
      "booking_id" in updatedBooking
    ) {
      console.log("🔄 Updating selectedBooking with new data:", updatedBooking);
      console.log("🔍 Updated booking branch/bay info:", {
        branch_id: (updatedBooking as BookingInfoDto).branch_id,
        branch_name: (updatedBooking as BookingInfoDto).branch_name,
        bay_id: (updatedBooking as BookingInfoDto).bay_id,
        bay_name: (updatedBooking as BookingInfoDto).bay_name,
      });
      // Enrich the updated booking data
      const enrichedBooking = enrichBookingData(
        updatedBooking as BookingInfoDto
      );
      console.log("🔍 Enriched booking branch/bay info:", {
        branch_id: enrichedBooking.branch_id,
        branch_name: enrichedBooking.branch_name,
        bay_id: enrichedBooking.bay_id,
        bay_name: enrichedBooking.bay_name,
      });
      setSelectedBooking(enrichedBooking);
    }
    setUpdateModalOpen(false);
    // Don't clear selectedBooking if detail modal might be open
    // It will be cleared when detail modal is closed
  };

  const handleCreateTrackingSuccess = () => {
    setCreateTrackingModalOpen(false);
    setSelectedBooking(null);
  };

  // Function to refresh table data
  const handleRefreshTable = async () => {
    const result = await refetchBookings();
    // If selectedBooking exists and detail modal is open, update it with fresh data
    if (selectedBooking && detailModalOpen && result.data) {
      const updatedBooking = result.data.find(
        (b: BookingInfoDto) => b.booking_id === selectedBooking.booking_id
      );
      if (updatedBooking) {
        console.log(
          "🔄 Updating selectedBooking after refresh:",
          updatedBooking
        );
        const enrichedBooking = enrichBookingData(updatedBooking);
        setSelectedBooking(enrichedBooking);
      }
    }
  };

  // Handle date range change - Client-side filtering only
  const handleDateRangeChange = (
    dates: [Dayjs | null, Dayjs | null] | null
  ) => {
    setDateRange(dates);
    // Reset to first page when filter changes
    setFilterParams((prev) => ({
      ...prev,
      page: 0,
    }));
  };

  // Handle branch filter change - Client-side filtering only
  const handleBranchFilterChange = (branchId: string | undefined) => {
    setSelectedBranchId(branchId);
    // Reset to first page when filter changes
    setFilterParams((prev) => ({
      ...prev,
      page: 0,
    }));
  };

  // Handle booking type filter change - Client-side filtering only
  const handleBookingTypeFilterChange = (
    bookingType: "advance" | "walk-in" | undefined
  ) => {
    setSelectedBookingType(bookingType);
    // Reset to first page when filter changes
    setFilterParams((prev) => ({
      ...prev,
      page: 0,
    }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setDateRange(null);
    setSelectedBranchId(undefined);
    setSelectedBookingType(undefined);
    setFilterParams({
      page: 0,
      size: filterParams.size,
    });
  };

  // Prepare branch options
  const branchOptions = branches.map((branch) => ({
    label: branch.branch_name || branch.branch_code || "N/A",
    value: branch.branch_id,
  }));

  return (
    <App>
      {/* Filter Section */}
      <Card
        style={{
          marginBottom: 16,
          backgroundColor: "#fafafa",
        }}
        styles={{ body: { padding: 16 } }}
      >
        <Space size="middle" wrap>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FilterOutlined style={{ color: "#1890ff" }} />
            <span style={{ fontWeight: 500, fontSize: 14 }}>Bộ lọc:</span>
          </div>
          <RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            placeholder={["Từ ngày", "Đến ngày"]}
            format="DD/MM/YYYY"
            style={{ width: 280 }}
            allowClear
          />
          <Select
            placeholder="Chọn chi nhánh"
            style={{ width: 250 }}
            allowClear
            value={selectedBranchId}
            onChange={handleBranchFilterChange}
            loading={isLoadingBranches}
            options={branchOptions}
            showSearch
            optionFilterProp="label"
          />
          <Select
            placeholder="Loại đặt lịch"
            style={{ width: 200 }}
            allowClear
            value={selectedBookingType}
            onChange={handleBookingTypeFilterChange}
            options={[
              { label: "Đặt trước", value: "advance" },
              { label: "Đặt xử lý tại chỗ", value: "walk-in" },
            ]}
          />
          {(dateRange || selectedBranchId || selectedBookingType) && (
            <Button onClick={handleClearFilters} size="small">
              Xóa bộ lọc
            </Button>
          )}
        </Space>
      </Card>

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
          isLoadingBranches ||
          completeServiceMutation.isPending ||
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
        actions={[]}
      />

      {/* Modal đặt lịch */}
      <BookingModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleModalOk}
        loading={isLoading}
        onRefresh={handleRefreshTable}
      />

      {/* Modal cập nhật booking */}
      {selectedBooking && (
        <UpdateBookingModal
          open={updateModalOpen}
          onCancel={() => setUpdateModalOpen(false)}
          onOk={handleUpdateModalOk}
          initialData={selectedBooking}
          loading={isLoading}
          onRefresh={handleRefreshTable}
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
                      (() => {
                        const estimated =
                          selectedBooking.estimated_duration_minutes || 0;

                        return estimated;
                      })()
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
                              (() => {
                                const estimated =
                                  selectedBooking.estimated_duration_minutes ||
                                  0;
                                return estimated;
                              })()
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
