"use client";
import React, { useState, useCallback, useMemo } from "react";
import {
  Card,
  Table,
  Tag,
  Space,
  Typography,
  Button,
  Spin,
  Empty,
  App,
  Badge,
  Modal,
  Timeline,
  Progress,
  Divider,
  Row,
  Col,
  Statistic,
  DatePicker,
  Select,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ReloadOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CarOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/lib/api/hooks/useAuth";
import { useCustomerBookings } from "@/lib/api/hooks/useUsers";
import { useBranches } from "@/lib/api/hooks/useBranches";
import { BookingInfoDto, BookingStatus } from "@/lib/api/types/booking.types";
import { BookingService } from "@/lib/api/services/bookingService";
import { ServiceProcessTrackingService } from "@/lib/api/services/service-process-tracking.service";
import {
  ServiceProcessTrackingInfoDto,
  TrackingStatus,
} from "@/lib/api/types/service-process-tracking.types";
import { useBookingEvents, useTrackingEvents } from "@/hooks/useWebSocket";
import { useQueryClient } from "@tanstack/react-query";
import dayjs, { Dayjs } from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface ServiceWithTrackings {
  serviceId: string;
  serviceName: string;
  trackings: ServiceProcessTrackingInfoDto[];
}

const CareTrackingPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { message, notification } = App.useApp();
  const queryClient = useQueryClient();

  // State for detail modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingInfoDto | null>(null);
  const [servicesWithTrackings, setServicesWithTrackings] = useState<ServiceWithTrackings[]>([]);
  const [loadingTracking, setLoadingTracking] = useState(false);

  // Filter states
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | undefined>(
    undefined
  );
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    undefined
  );
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // Get branches for filter
  const { branches, loading: isLoadingBranches } = useBranches();

  // Get customer bookings
  const { bookings, loading, error, refetch } = useCustomerBookings(
    user?.user_id || null
  );

  // WebSocket: Subscribe to booking events for realtime updates
  useBookingEvents({
    onBookingUpdated: (event) => {
      if (event.booking_data) {
        // Update booking in list
        queryClient.setQueryData(['bookings', 'customer', user?.user_id], (old: BookingInfoDto[] | undefined) => 
          old?.map(b => b.booking_id === event.booking_id ? event.booking_data! : b) || []
        );
        
        // If this booking is currently selected in modal, reload tracking data
        if (selectedBooking?.booking_id === event.booking_id) {
          loadTrackingData(event.booking_id);
        }
        
        notification.info({
          message: 'Booking đã cập nhật',
          description: event.message,
        });
      }
    },
    onBookingCheckedIn: (event) => {
      if (event.booking_data) {
        // Add booking to list if not exists, or update if exists
        queryClient.setQueryData(['bookings', 'customer', user?.user_id], (old: BookingInfoDto[] | undefined) => {
          const exists = old?.some(b => b.booking_id === event.booking_id);
          if (!exists && event.booking_data) {
            return [...(old || []), event.booking_data];
          }
          return old?.map(b => b.booking_id === event.booking_id ? event.booking_data! : b) || [];
        });
        
        notification.success({
          message: 'Booking đã check-in',
          description: event.message,
        });
      }
    },
    onBookingStarted: (event) => {
      if (event.booking_data) {
        // Update booking status to IN_PROGRESS
        queryClient.setQueryData(['bookings', 'customer', user?.user_id], (old: BookingInfoDto[] | undefined) => {
          const exists = old?.some(b => b.booking_id === event.booking_id);
          if (!exists && event.booking_data) {
            return [...(old || []), event.booking_data];
          }
          return old?.map(b => b.booking_id === event.booking_id ? event.booking_data! : b) || [];
        });
        
        // If this booking is currently selected in modal, reload tracking data
        if (selectedBooking?.booking_id === event.booking_id) {
          loadTrackingData(event.booking_id);
        }
        
        notification.success({
          message: 'Dịch vụ đã bắt đầu',
          description: event.message,
        });
      }
    },
    onBookingCompleted: (event) => {
      if (event.booking_data) {
        // Update booking status to COMPLETED
        queryClient.setQueryData(['bookings', 'customer', user?.user_id], (old: BookingInfoDto[] | undefined) => 
          old?.map(b => b.booking_id === event.booking_id ? event.booking_data! : b) || []
        );
        
        // If this booking is currently selected in modal, reload tracking data
        if (selectedBooking?.booking_id === event.booking_id) {
          loadTrackingData(event.booking_id);
        }
        
        notification.success({
          message: 'Dịch vụ đã hoàn thành',
          description: event.message,
        });
      }
    },
    onBookingCancelled: (event) => {
      // Remove booking from list if cancelled
      queryClient.setQueryData(['bookings', 'customer', user?.user_id], (old: BookingInfoDto[] | undefined) => 
        old?.filter(b => b.booking_id !== event.booking_id) || []
      );
      
      notification.warning({
        message: 'Booking đã hủy',
        description: event.message,
      });
    },
  });

  // WebSocket: Subscribe to tracking events for realtime updates
  useTrackingEvents({
    onTrackingCreated: (event) => {
      // If this tracking belongs to the currently selected booking, reload tracking data
      if (selectedBooking?.booking_id === event.booking_id) {
        loadTrackingData(event.booking_id);
        notification.info({
          message: 'Tracking mới',
          description: event.message,
        });
      }
    },
    onTrackingStarted: (event) => {
      // Update tracking in modal if this booking is selected
      if (selectedBooking?.booking_id === event.booking_id && event.tracking_data) {
        setServicesWithTrackings((prev:any) => {
          return prev.map((service:any) => ({
            ...service,
            trackings: service.trackings.map((t:any) =>
              t.trackingId === event.tracking_id ? event.tracking_data! : t
            ),
          }));
        });
        notification.success({
          message: 'Bước đã bắt đầu',
          description: event.message,
        });
      }
    },
    onTrackingUpdated: (event) => {
      // Update tracking in modal if this booking is selected
      if (selectedBooking?.booking_id === event.booking_id && event.tracking_data) {
        setServicesWithTrackings((prev:any) => {
          return prev.map((service:any) => ({
            ...service,
            trackings: service.trackings.map((t:any) =>
              t.trackingId === event.tracking_id ? event.tracking_data! : t
            ),
          }));
        });
        notification.info({
          message: 'Tracking đã cập nhật',
          description: event.message,
        });
      }
    },
    onTrackingCompleted: (event) => {
      // Update tracking in modal if this booking is selected
      if (selectedBooking?.booking_id === event.booking_id && event.tracking_data) {
        setServicesWithTrackings((prev:any) => {
          return prev.map((service:any) => ({
            ...service,
            trackings: service.trackings.map((t:any) =>
              t.trackingId === event.tracking_id ? event.tracking_data! : t
            ),
          }));
        });
        notification.success({
          message: 'Bước đã hoàn thành',
          description: event.message,
        });
      }
    },
    onTrackingCancelled: (event) => {
      // Update tracking in modal if this booking is selected
      if (selectedBooking?.booking_id === event.booking_id && event.tracking_data) {
        setServicesWithTrackings((prev:any) => {
          return prev.map((service:any) => ({
            ...service,
            trackings: service.trackings.map((t:any) =>
              t.trackingId === event.tracking_id ? event.tracking_data! : t
            ),
          }));
        });
        notification.warning({
          message: 'Bước đã hủy',
          description: event.message,
        });
      }
    },
  });

  // Filter bookings with status CHECKED_IN, IN_PROGRESS, COMPLETED
  const careBookings = useMemo(() => {
    if (!bookings) return [];
    return bookings.filter(
      (b) =>
        b.status === BookingStatus.CHECKED_IN ||
        b.status === BookingStatus.IN_PROGRESS ||
        b.status === BookingStatus.COMPLETED
    );
  }, [bookings]);

  // Client-side filtering with useMemo
  const filteredBookings = useMemo(() => {
    let result = careBookings || [];

    // Filter by date range
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf("day");
      const endDate = dateRange[1].endOf("day");
      result = result.filter((booking: BookingInfoDto) => {
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
        (booking: BookingInfoDto) => booking.branch_id === selectedBranchId
      );
    }

    // Filter by status
    if (selectedStatus) {
      result = result.filter(
        (booking: BookingInfoDto) => booking.status === selectedStatus
      );
    }

    return result;
  }, [careBookings, dateRange, selectedBranchId, selectedStatus]);

  // Client-side pagination
  const paginatedBookings = useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredBookings.slice(start, end);
  }, [filteredBookings, pagination.current, pagination.pageSize]);

  // Calculate statistics from filtered bookings
  const totalBookings = filteredBookings.length;
  const checkedInBookings = filteredBookings.filter(
    (booking) => booking.status === BookingStatus.CHECKED_IN
  ).length;
  const inProgressBookings = filteredBookings.filter(
    (booking) => booking.status === BookingStatus.IN_PROGRESS
  ).length;
  const completedBookings = filteredBookings.filter(
    (booking) => booking.status === BookingStatus.COMPLETED
  ).length;

  // Handle date range change
  const handleDateRangeChange = (
    dates: [Dayjs | null, Dayjs | null] | null
  ) => {
    setDateRange(dates);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // Handle branch filter change
  const handleBranchFilterChange = (branchId: string | undefined) => {
    setSelectedBranchId(branchId);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // Handle status filter change
  const handleStatusFilterChange = (status: string | undefined) => {
    setSelectedStatus(status);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setDateRange(null);
    setSelectedBranchId(undefined);
    setSelectedStatus(undefined);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // Prepare branch options
  const branchOptions = branches.map((branch) => ({
    label: branch.branch_name || branch.branch_code || "N/A",
    value: branch.branch_id,
  }));

  const statusToColor = (status?: string) => {
    switch ((status || "").toUpperCase()) {
      case BookingStatus.CHECKED_IN:
        return "purple";
      case BookingStatus.IN_PROGRESS:
        return "processing";
      case BookingStatus.COMPLETED:
        return "success";
      default:
        return "default";
    }
  };

  const statusToLabel = (status?: string) => {
    switch ((status || "").toUpperCase()) {
      case BookingStatus.CHECKED_IN:
        return "Đã check-in";
      case BookingStatus.IN_PROGRESS:
        return "Đang chăm sóc";
      case BookingStatus.COMPLETED:
        return "Hoàn thành";
      default:
        return status || "";
    }
  };

  const loadTrackingData = useCallback(async (bookingId: string) => {
    setLoadingTracking(true);
    try {
      // Fetch booking details and trackings in parallel
      const [bookingData, trackingsData] = await Promise.all([
        BookingService.getBookingById(bookingId),
        ServiceProcessTrackingService.getTrackingsByBooking(bookingId),
      ]);

      // Group trackings by service
      const serviceMap = new Map<string, ServiceWithTrackings>();

      // First, create service groups based on booking_items
      if (bookingData?.booking_items) {
        for (const bookingItem of bookingData.booking_items) {
          if (bookingItem.service_id) {
            const serviceId = bookingItem.service_id;
            const serviceName = bookingItem.service_name || "Dịch vụ chưa có tên";

            if (!serviceMap.has(serviceId)) {
              serviceMap.set(serviceId, {
                serviceId,
                serviceName,
                trackings: [],
              });
            }
          }
        }
      }

      // Then, assign trackings to their corresponding services using carServiceId
      for (const tracking of trackingsData) {
        let assignedServiceId: string | null = null;

        // Priority 1: Use carServiceId if available and valid
        if (tracking.carServiceId && serviceMap.has(tracking.carServiceId)) {
          assignedServiceId = tracking.carServiceId;
        } else if (serviceMap.size > 0) {
          // Priority 2: If no carServiceId, assign to first available service
          assignedServiceId = Array.from(serviceMap.keys())[0];
        }

        if (assignedServiceId && serviceMap.has(assignedServiceId)) {
          const service = serviceMap.get(assignedServiceId)!;
          service.trackings.push(tracking);
        }
      }

      // Filter out services that have no trackings and sort trackings by step order
      const services = Array.from(serviceMap.values())
        .filter((service) => service.trackings.length > 0)
        .map((service) => ({
          ...service,
          trackings: service.trackings.sort(
            (a, b) => (a.serviceStepOrder || 0) - (b.serviceStepOrder || 0)
          ),
        }));

      setServicesWithTrackings(services);
    } catch (error) {
      console.error("Error loading tracking data:", error);
      message.error("Không thể tải thông tin quy trình chăm sóc");
      setServicesWithTrackings([]);
    } finally {
      setLoadingTracking(false);
    }
  }, [message]);

  const handleViewDetails = useCallback(
    async (booking: BookingInfoDto) => {
      setSelectedBooking(booking);
      setDetailModalOpen(true);
      await loadTrackingData(booking.booking_id);
    },
    [loadTrackingData]
  );

  const getStatusConfig = (status: string) => {
    switch (status) {
      case TrackingStatus.PENDING:
        return { label: "Chờ thực hiện", color: "default" };
      case TrackingStatus.IN_PROGRESS:
        return { label: "Đang thực hiện", color: "processing" };
      case TrackingStatus.COMPLETED:
        return { label: "Hoàn thành", color: "success" };
      case TrackingStatus.CANCELLED:
        return { label: "Đã hủy", color: "error" };
      default:
        return { label: status || "", color: "default" };
    }
  };

  // Add CSS styles for better table appearance and responsive design
  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .care-tracking-table .ant-table-thead > tr > th {
        background: #fafafa;
        color: #262626;
        font-weight: bold;
        text-align: center;
        border: 1px solid #f0f0f0;
        padding: 12px 8px;
        white-space: nowrap;
      }
      
      .care-tracking-table .ant-table-tbody > tr > td {
        padding: 12px 8px;
        border-bottom: 1px solid #f0f0f0;
        vertical-align: middle;
        word-wrap: break-word;
        word-break: break-word;
      }
      
      .care-tracking-table .ant-table-tbody > tr:hover > td {
        background-color: #f5f5f5;
      }
      
      .care-tracking-table .ant-table-tbody > tr:nth-child(even) > td {
        background-color: #fafafa;
      }
      
      .care-tracking-table .ant-table-tbody > tr:nth-child(even):hover > td {
        background-color: #f0f0f0;
      }
      
      .care-tracking-table .ant-table-pagination {
        margin-top: 24px;
        text-align: right;
      }

      /* Responsive styles for mobile */
      @media (max-width: 768px) {
        .care-tracking-table .ant-table-thead > tr > th {
          padding: 10px 4px;
          font-size: 12px;
        }
        
        .care-tracking-table .ant-table-tbody > tr > td {
          padding: 10px 4px;
          font-size: 12px;
        }
      }

      /* Responsive filter section */
      @media (max-width: 768px) {
        .filter-card .ant-space {
          width: 100%;
        }

        .filter-card .ant-space-item {
          width: 100%;
        }

        .filter-card .ant-picker,
        .filter-card .ant-select {
          width: 100% !important;
        }
      }

      @media (max-width: 576px) {
        .filter-card .ant-space {
          flex-direction: column;
          align-items: stretch;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const columns: ColumnsType<BookingInfoDto> = [
    {
      title: "Mã booking",
      dataIndex: "booking_code",
      key: "booking_code",
      width: 140,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => (
        <Text
          code
          style={{ fontSize: "13px", fontWeight: "bold" }}
          ellipsis={{ tooltip: text }}
        >
          {text}
        </Text>
      ),
    },
    {
      title: "Thời gian",
      key: "scheduled_start_at",
      width: 180,
      render: (record: BookingInfoDto) => (
        <Space direction="vertical" size="small" style={{ fontSize: "13px" }}>
          <Space>
            <ClockCircleOutlined style={{ color: "#1890ff" }} />
            <Text strong>{dayjs(record.scheduled_start_at).format("DD/MM/YYYY")}</Text>
          </Space>
          <Space>
            <ClockCircleOutlined style={{ color: "#52c41a" }} />
            <Text>{dayjs(record.scheduled_start_at).format("HH:mm")}</Text>
          </Space>
          {record.branch_name && (
            <Space>
              <EnvironmentOutlined style={{ color: "#1890ff" }} />
              <Text type="secondary" style={{ fontSize: "12px" }} ellipsis={{ tooltip: record.branch_name }}>
                {record.branch_name}
              </Text>
            </Space>
          )}
        </Space>
      ),
    },
    {
      title: "Xe",
      key: "vehicle",
      width: 160,
      render: (record: BookingInfoDto) => (
        <Space direction="vertical" size="small" style={{ fontSize: "13px" }}>
          <Space>
            <CarOutlined style={{ color: "#1890ff" }} />
            <Text strong ellipsis={{ tooltip: record.vehicle_license_plate }}>
              {record.vehicle_license_plate}
            </Text>
          </Space>
          {(record.vehicle_brand_name || record.vehicle_model_name) && (
            <Text
              type="secondary"
              style={{ fontSize: "11px" }}
              ellipsis={{
                tooltip: `${record.vehicle_brand_name} ${record.vehicle_model_name}`,
              }}
            >
              {record.vehicle_brand_name} {record.vehicle_model_name}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Khu vực",
      dataIndex: "bay_name",
      key: "bay_name",
      width: 120,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => (
        <Text ellipsis={{ tooltip: text || "N/A" }}>{text || "N/A"}</Text>
      ),
    },
    {
      title: "Tổng tiền",
      key: "total_price",
      width: 150,
      render: (record: BookingInfoDto) => (
        <Text strong style={{ color: "#52c41a", fontSize: "14px" }}>
          {record.total_price?.toLocaleString("vi-VN")} {record.currency || "VND"}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status: string) => {
        const config = {
          color: statusToColor(status),
          label: statusToLabel(status),
        };
        return (
          <Tag
            color={config.color}
            style={{ fontSize: "12px", fontWeight: "bold" }}
          >
            {config.label}
          </Tag>
        );
      },
      filters: [
        { text: "Đã check-in", value: BookingStatus.CHECKED_IN },
        { text: "Đang chăm sóc", value: BookingStatus.IN_PROGRESS },
        { text: "Hoàn thành", value: BookingStatus.COMPLETED },
      ],
      onFilter: (value: any, record: BookingInfoDto) => record.status === value,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      align: "center" as const,
      render: (_: any, record: BookingInfoDto) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
          style={{ fontSize: "12px" }}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  if (authLoading || loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Empty description="Vui lòng đăng nhập để xem lịch sử chăm sóc" />
    );
  }

  return (
    <App>
      <div
        style={{
          padding: "24px",
          maxWidth: "1400px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <Title
            level={2}
            style={{ fontSize: "28px", marginBottom: "12px", color: "#1890ff" }}
          >
            Theo dõi quy trình chăm sóc
          </Title>
          <Text type="secondary" style={{ fontSize: "16px" }}>
            Theo dõi tiến độ dịch vụ đang được thực hiện cho xe của bạn
          </Text>
        </div>

        {/* Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Tổng số"
                value={totalBookings}
                prefix={<CalendarOutlined />}
                valueStyle={{ fontSize: "20px" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Đã check-in"
                value={checkedInBookings}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: "#722ed1", fontSize: "20px" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Đang chăm sóc"
                value={inProgressBookings}
                prefix={<CarOutlined />}
                valueStyle={{ color: "#1890ff", fontSize: "20px" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Hoàn thành"
                value={completedBookings}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a", fontSize: "20px" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filter Section */}
        <Card
          className="filter-card"
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
              placeholder="Trạng thái"
              style={{ width: 200 }}
              allowClear
              value={selectedStatus}
              onChange={handleStatusFilterChange}
              options={[
                { label: "Đã check-in", value: BookingStatus.CHECKED_IN },
                { label: "Đang chăm sóc", value: BookingStatus.IN_PROGRESS },
                { label: "Hoàn thành", value: BookingStatus.COMPLETED },
              ]}
            />
            {(dateRange || selectedBranchId || selectedStatus) && (
              <Button onClick={handleClearFilters} size="small">
                Xóa bộ lọc
              </Button>
            )}
          </Space>
        </Card>

        {/* Bookings Table */}
        <Card
          title={
            <div
              style={{ fontSize: "18px", fontWeight: "bold", color: "#1890ff" }}
            >
              Danh sách đang chăm sóc
            </div>
          }
          extra={
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
              type="primary"
              size="middle"
              loading={loading}
            >
              Làm mới
            </Button>
          }
          style={{
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            borderRadius: "12px",
          }}
        >
          {error ? (
            <Empty description="Không thể tải dữ liệu. Vui lòng thử lại." />
          ) : filteredBookings.length === 0 ? (
            <Empty description="Bạn chưa có lịch chăm sóc nào" />
          ) : (
            <Table
              dataSource={paginatedBookings}
              columns={columns}
              rowKey="booking_id"
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: filteredBookings.length,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} booking`,
                responsive: true,
                position: ["bottomRight"],
                pageSizeOptions: ["5", "10", "20", "50"],
                onChange: (page, pageSize) => {
                  setPagination({
                    current: page,
                    pageSize: pageSize || 10,
                  });
                },
              }}
              scroll={{ x: "max-content" }}
              size="middle"
              bordered
              className="care-tracking-table"
            />
          )}
        </Card>

        {/* Detail Modal */}
        <Modal
          title={
            <Space>
              <Text strong>Chi tiết quy trình chăm sóc</Text>
              {selectedBooking && (
                <Badge
                  status={statusToColor(selectedBooking.status) as any}
                  text={statusToLabel(selectedBooking.status)}
                />
              )}
            </Space>
          }
          open={detailModalOpen}
          onCancel={() => {
            setDetailModalOpen(false);
            setSelectedBooking(null);
            setServicesWithTrackings([]);
          }}
          footer={[
            <Button key="close" onClick={() => setDetailModalOpen(false)}>
              Đóng
            </Button>,
          ]}
          width={900}
        >
          {selectedBooking && (
            <div style={{ marginBottom: 24 }}>
              <Card size="small" style={{ marginBottom: 16 }}>
                <Space direction="vertical" style={{ width: "100%" }} size="small">
                  <div>
                    <Text strong>Mã booking: </Text>
                    <Text>{selectedBooking.booking_code}</Text>
                  </div>
                  <div>
                    <Text strong>Xe: </Text>
                    <Text>{selectedBooking.vehicle_license_plate}</Text>
                    {(selectedBooking.vehicle_brand_name ||
                      selectedBooking.vehicle_model_name) && (
                      <Text type="secondary">
                        {" • "}
                        {[
                          selectedBooking.vehicle_brand_name,
                          selectedBooking.vehicle_model_name,
                        ]
                          .filter(Boolean)
                          .join(" • ")}
                      </Text>
                    )}
                  </div>
                  <div>
                    <Text strong>Chi nhánh: </Text>
                    <Text>{selectedBooking.branch_name}</Text>
                  </div>
                  <div>
                    <Text strong>Khu vực: </Text>
                    <Text>{selectedBooking.bay_name}</Text>
                  </div>
                  <div>
                    <Text strong>Thời gian: </Text>
                    <Text>
                      {dayjs(selectedBooking.scheduled_start_at).format(
                        "DD/MM/YYYY HH:mm"
                      )}
                    </Text>
                  </div>
                </Space>
              </Card>
            </div>
          )}

          {loadingTracking ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>Đang tải quy trình chăm sóc...</div>
            </div>
          ) : servicesWithTrackings.length === 0 ? (
            <Empty description="Chưa có thông tin quy trình chăm sóc" />
          ) : (
            <div>
              {servicesWithTrackings.map((service, serviceIndex) => {
                const completedCount = service.trackings.filter(
                  (t) => t.status === TrackingStatus.COMPLETED
                ).length;
                const totalCount = service.trackings.length;
                const progressPercent =
                  totalCount > 0
                    ? Math.round((completedCount / totalCount) * 100)
                    : 0;

                return (
                  <Card
                    key={service.serviceId}
                    style={{ marginBottom: 24 }}
                    title={
                      <Space>
                        <Text strong>{service.serviceName}</Text>
                        <Tag color="blue">
                          {completedCount}/{totalCount} bước hoàn thành
                        </Tag>
                      </Space>
                    }
                    extra={
                      <Text type="secondary" style={{ fontSize: 14 }}>
                        {progressPercent}%
                      </Text>
                    }
                  >
                    <Progress
                      percent={progressPercent}
                      status={
                        progressPercent === 100
                          ? "success"
                          : progressPercent > 0
                          ? "active"
                          : "normal"
                      }
                      style={{ marginBottom: 24 }}
                    />

                    <Timeline>
                      {service.trackings.map((tracking, index) => {
                        const statusConfig = getStatusConfig(tracking.status);
                        return (
                          <Timeline.Item
                            key={tracking.trackingId}
                            color={
                              statusConfig.color === "success"
                                ? "green"
                                : statusConfig.color === "processing"
                                ? "blue"
                                : statusConfig.color === "error"
                                ? "red"
                                : "gray"
                            }
                          >
                            <Card size="small" style={{ marginBottom: 16 }}>
                              <Space direction="vertical" style={{ width: "100%" }} size="small">
                                <div>
                                  <Text strong>
                                    Bước {tracking.serviceStepOrder || index + 1}:{" "}
                                    {tracking.serviceStepName || "Chưa có tên"}
                                  </Text>
                                  <Tag
                                    color={statusConfig.color}
                                    style={{ marginLeft: 8 }}
                                  >
                                    {statusConfig.label}
                                  </Tag>
                                  {tracking.isRequired && (
                                    <Tag color="red" style={{ marginLeft: 4 }}>
                                      Bắt buộc
                                    </Tag>
                                  )}
                                  {tracking.estimatedTime && (
                                    <Tag color="blue" style={{ marginLeft: 4 }}>
                                      ~{tracking.estimatedTime} phút
                                    </Tag>
                                  )}
                                </div>
                                {tracking.serviceStepDescription && (
                                  <Text type="secondary">
                                    {tracking.serviceStepDescription}
                                  </Text>
                                )}
                                <Divider style={{ margin: "8px 0" }} />
                                {tracking.technicianName && (
                                  <div>
                                    <Text type="secondary">Kỹ thuật viên: </Text>
                                    <Text strong>{tracking.technicianName}</Text>
                                  </div>
                                )}
                                {tracking.startTime && (
                                  <div>
                                    <Text type="secondary">Bắt đầu: </Text>
                                    <Text>
                                      {dayjs(tracking.startTime).format(
                                        "DD/MM/YYYY HH:mm"
                                      )}
                                    </Text>
                                  </div>
                                )}
                                {tracking.endTime && (
                                  <div>
                                    <Text type="secondary">Kết thúc: </Text>
                                    <Text>
                                      {dayjs(tracking.endTime).format(
                                        "DD/MM/YYYY HH:mm"
                                      )}
                                    </Text>
                                  </div>
                                )}
                                {tracking.notes && (
                                  <div style={{ marginTop: 8 }}>
                                    <Text type="secondary">Ghi chú: </Text>
                                    <div
                                      style={{
                                        marginTop: 4,
                                        padding: 8,
                                        backgroundColor: "#f5f5f5",
                                        borderRadius: 4,
                                      }}
                                    >
                                      <Text>{tracking.notes}</Text>
                                    </div>
                                  </div>
                                )}
                              </Space>
                            </Card>
                          </Timeline.Item>
                        );
                      })}
                    </Timeline>
                  </Card>
                );
              })}
            </div>
          )}
        </Modal>
      </div>
    </App>
  );
};

export default CareTrackingPage;

