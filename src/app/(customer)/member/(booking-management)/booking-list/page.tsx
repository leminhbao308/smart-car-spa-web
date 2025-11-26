"use client";
import React, { useState } from "react";
import {
  Card,
  Table,
  Tag,
  Space,
  Typography,
  Button,
  Row,
  Col,
  Statistic,
  Spin,
  Empty,
  Popconfirm,
  App,
  DatePicker,
  Select,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/lib/api/hooks/useAuth";
import { useCustomerBookings } from "@/lib/api/hooks/useUsers";
import { useCancelBooking } from "@/lib/api/hooks/useBooking";
import { useBranches } from "@/lib/api/hooks/useBranches";
import { useRouter } from "next/navigation";
import dayjs, { Dayjs } from "dayjs";
import CustomerBookingDetailModal from "@/components/ui/Modal/CustomerBookingDetailModal/CustomerBookingDetailModal";
import CustomerUpdateBookingModal from "@/components/ui/Modal/CustomerUpdateBookingModal";
import { BookingInfoDto, BookingType } from "@/lib/api/types/booking.types";
import { getErrorMessage } from "@/components/utils/helper/error.helper";
import { useBookingEvents } from "@/hooks/useWebSocket";
import { useQueryClient } from "@tanstack/react-query";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const CustomerBookingListPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { message, notification } = App.useApp();
  const queryClient = useQueryClient();

  // State for detail modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingInfoDto | null>(
    null
  );

  // State for update modal
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedBookingForUpdate, setSelectedBookingForUpdate] =
    useState<BookingInfoDto | null>(null);

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
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 8,
  });

  // Get branches for filter
  const { branches, loading: isLoadingBranches } = useBranches();

  // Add CSS styles for better table appearance and responsive design
  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .booking-table .ant-table-thead > tr > th {
        background: #fafafa;
        color: #262626;
        font-weight: bold;
        text-align: center;
        border: 1px solid #f0f0f0;
        padding: 12px 8px;
        white-space: nowrap;
      }
      
      .booking-table .ant-table-tbody > tr > td {
        padding: 12px 8px;
        border-bottom: 1px solid #f0f0f0;
        vertical-align: middle;
        word-wrap: break-word;
        word-break: break-word;
      }
      
      .booking-table .ant-table-tbody > tr:hover > td {
        background-color: #f5f5f5;
      }
      
      .booking-table .ant-table-tbody > tr:nth-child(even) > td {
        background-color: #fafafa;
      }
      
      .booking-table .ant-table-tbody > tr:nth-child(even):hover > td {
        background-color: #f0f0f0;
      }
      
      .booking-table .ant-table-pagination {
        margin-top: 24px;
        text-align: right;
        overflow-x: auto;
      }

      /* Responsive styles for mobile */
      @media (max-width: 768px) {
        .booking-table .ant-table-thead > tr > th {
          padding: 10px 4px;
          font-size: 12px;
        }
        
        .booking-table .ant-table-tbody > tr > td {
          padding: 10px 4px;
          font-size: 12px;
        }

        .booking-table .ant-table-pagination {
          flex-direction: column;
          gap: 12px;
          align-items: flex-start;
        }

        .booking-table .ant-pagination {
          flex-wrap: wrap;
          justify-content: flex-start;
        }

        .booking-table .ant-pagination-options {
          margin-left: 0 !important;
          margin-top: 8px;
        }

        /* Hide some less important columns on mobile */
        .booking-table .ant-table-thead > tr > th:nth-child(4),
        .booking-table .ant-table-tbody > tr > td:nth-child(4) {
          display: none;
        }

        .booking-table .ant-table-thead > tr > th:nth-child(6),
        .booking-table .ant-table-tbody > tr > td:nth-child(6) {
          display: none;
        }
      }

      /* Responsive styles for tablet */
      @media (min-width: 769px) and (max-width: 1024px) {
        .booking-table .ant-table-thead > tr > th {
          padding: 12px 6px;
          font-size: 13px;
        }
        
        .booking-table .ant-table-tbody > tr > td {
          padding: 12px 6px;
          font-size: 13px;
        }

        .booking-table .ant-table-pagination {
          flex-wrap: wrap;
        }
      }

      /* Responsive for small mobile */
      @media (max-width: 576px) {
        .booking-table-wrapper {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .booking-table .ant-table {
          min-width: 600px;
        }

        .booking-table .ant-table-thead > tr > th,
        .booking-table .ant-table-tbody > tr > td {
          padding: 8px 4px;
          font-size: 11px;
        }

        /* Show only essential columns on very small screens */
        .booking-table .ant-table-thead > tr > th:nth-child(3),
        .booking-table .ant-table-tbody > tr > td:nth-child(3),
        .booking-table .ant-table-thead > tr > th:nth-child(5),
        .booking-table .ant-table-tbody > tr > td:nth-child(5) {
          display: none;
        }
      }

      /* Improve scrollbar appearance */
      .booking-table-wrapper::-webkit-scrollbar {
        height: 8px;
      }

      .booking-table-wrapper::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
      }

      .booking-table-wrapper::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 4px;
      }

      .booking-table-wrapper::-webkit-scrollbar-thumb:hover {
        background: #555;
      }

      /* Better fixed column styling */
      .booking-table .ant-table-cell-fix-left,
      .booking-table .ant-table-cell-fix-right {
        background-color: #fff;
        z-index: 1;
      }

      .booking-table .ant-table-tbody > tr:hover > .ant-table-cell-fix-left,
      .booking-table .ant-table-tbody > tr:hover > .ant-table-cell-fix-right {
        background-color: #f5f5f5;
      }

      .booking-table .ant-table-tbody > tr:nth-child(even) > .ant-table-cell-fix-left,
      .booking-table .ant-table-tbody > tr:nth-child(even) > .ant-table-cell-fix-right {
        background-color: #fafafa;
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

  // Get customer bookings
  const { bookings, loading, error, refetch } = useCustomerBookings(
    user?.user_id || null
  );

  // WebSocket: Subscribe to booking events for realtime updates
  useBookingEvents({
    onBookingCreated: (event) => {
      if (event.booking_data) {
        // Add new booking to list if it belongs to current user
        const newBooking = event.booking_data;
        if (newBooking.customer_id === user?.user_id) {
          queryClient.setQueryData(['bookings', 'customer', user?.user_id], (old: BookingInfoDto[] | undefined) => {
            // Check if booking already exists (avoid duplicates)
            const exists = old?.some(b => b.booking_id === event.booking_id);
            if (exists) {
              return old;
            }
            // Add new booking to the beginning of the list
            return [newBooking, ...(old || [])];
          });
          
          notification.success({
            message: 'Đặt lịch thành công',
            description: event.message || `Booking ${event.booking_code} đã được tạo`,
          });
        }
      } else {
        // If no booking_data, refetch to get latest data
        refetch();
      }
    },
    onBookingUpdated: (event) => {
      if (event.booking_data) {
        // Update booking in list
        queryClient.setQueryData(['bookings', 'customer', user?.user_id], (old: BookingInfoDto[] | undefined) => 
          old?.map(b => b.booking_id === event.booking_id ? event.booking_data! : b) || []
        );
        
        notification.info({
          message: 'Booking đã cập nhật',
          description: event.message,
        });
      }
    },
    onBookingConfirmed: (event) => {
      if (event.booking_data) {
        // Update booking status to CONFIRMED
        queryClient.setQueryData(['bookings', 'customer', user?.user_id], (old: BookingInfoDto[] | undefined) => 
          old?.map(b => b.booking_id === event.booking_id ? event.booking_data! : b) || []
        );
        
        notification.success({
          message: 'Booking đã được xác nhận',
          description: event.message,
        });
      }
    },
    onBookingCheckedIn: (event) => {
      if (event.booking_data) {
        // Update booking status to CHECKED_IN
        queryClient.setQueryData(['bookings', 'customer', user?.user_id], (old: BookingInfoDto[] | undefined) => 
          old?.map(b => b.booking_id === event.booking_id ? event.booking_data! : b) || []
        );
        
        notification.success({
          message: 'Booking đã check-in',
          description: event.message,
        });
      }
    },
    onBookingStarted: (event) => {
      if (event.booking_data) {
        // Update booking status to IN_PROGRESS
        queryClient.setQueryData(['bookings', 'customer', user?.user_id], (old: BookingInfoDto[] | undefined) => 
          old?.map(b => b.booking_id === event.booking_id ? event.booking_data! : b) || []
        );
        
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
        
        notification.success({
          message: 'Dịch vụ đã hoàn thành',
          description: event.message,
        });
      }
    },
    onBookingCancelled: (event) => {
      // Update booking status to CANCELLED
      queryClient.setQueryData(['bookings', 'customer', user?.user_id], (old: BookingInfoDto[] | undefined) => 
        old?.map(b => b.booking_id === event.booking_id ? { ...b, status: 'CANCELLED' } : b) || []
      );
      
      notification.warning({
        message: 'Booking đã hủy',
        description: event.message,
      });
    },
  });

  // Client-side filtering with useMemo
  const filteredBookings = React.useMemo(() => {
    let result = bookings || [];

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

    // Filter by booking type based on booking_type field
    if (selectedBookingType) {
      result = result.filter((booking: BookingInfoDto) => {
        // Đặt trước (advance booking): booking_type === SCHEDULED
        if (selectedBookingType === "advance") {
          return booking.booking_type === BookingType.SCHEDULED;
        }
        // Đặt xử lý tại chỗ (walk-in): booking_type === WALK_IN
        if (selectedBookingType === "walk-in") {
          return booking.booking_type === BookingType.WALK_IN;
        }
        return true;
      });
    }

    return result;
  }, [bookings, dateRange, selectedBranchId, selectedBookingType]);

  // Client-side pagination
  const paginatedBookings = React.useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredBookings.slice(start, end);
  }, [filteredBookings, pagination.current, pagination.pageSize]);

  // Cancel booking mutation
  const cancelBookingMutation = useCancelBooking();

  // Function to open detail modal
  const handleViewDetail = (booking: BookingInfoDto) => {
    setSelectedBooking(booking);
    setDetailModalOpen(true);
  };

  // Function to handle edit booking
  const handleEditBooking = (booking: BookingInfoDto) => {
    setSelectedBookingForUpdate(booking);
    setUpdateModalOpen(true);
  };

  // Function to handle update modal close
  const handleUpdateModalClose = () => {
    setUpdateModalOpen(false);
    setSelectedBookingForUpdate(null);
  };

  // Function to handle update modal success
  const handleUpdateModalSuccess = () => {
    setUpdateModalOpen(false);
    setSelectedBookingForUpdate(null);
    // Refresh the bookings list
    refetch();
  };

  // Function to handle cancel booking
  const handleCancelBooking = async (booking: BookingInfoDto) => {
    try {
      await cancelBookingMutation.mutateAsync({
        bookingId: booking.booking_id,
        reason: "Khách hàng hủy đặt lịch",
        cancelledBy: user?.user_id || "",
      });
      message.success("Hủy đặt lịch thành công!");
      refetch();
    } catch (error) {
      console.log("Cancel booking error:", error);
      const errorMessage = getErrorMessage(error);
      message.error(errorMessage);
    }
  };

  // Function to check if booking can be cancelled
  const canCancelBooking = (booking: BookingInfoDto) => {
    // Only allow cancellation for SCHEDULED bookings
    // Fallback: Nếu booking_type không có, kiểm tra booking_code
    // Booking code bắt đầu bằng "BK-" là SCHEDULED, "WALK-IN-" là WALK_IN
    const bookingType = booking.booking_type as string | undefined;
    const isScheduledBooking = 
      bookingType === BookingType.SCHEDULED || 
      bookingType === "SCHEDULED" ||
      (!bookingType && booking.booking_code?.startsWith("BK-"));
    if (!isScheduledBooking) return false;

    // Only allow cancellation for PENDING or CONFIRMED status
    const allowedStatuses = ["PENDING", "CONFIRMED"];
    if (!allowedStatuses.includes(booking.status)) {
      console.log(" Booking cannot be cancelled - status:", booking.status);
      return false;
    }

    // Only allow cancellation if booking is in the future (not yet started)
    const bookingDate = dayjs(booking.scheduled_start_at);
    const now = dayjs();
    const isFutureBooking = bookingDate.isAfter(now);

    if (!isFutureBooking) {
      console.log(" Booking cannot be cancelled - booking time has passed");
      return false;
    }

    return true;
  };

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Calculate statistics from filtered bookings
  const totalBookings = filteredBookings.length;
  const upcomingBookings = filteredBookings.filter(
    (booking: any) => dayjs(booking.scheduled_start_at).isAfter(dayjs())
  ).length;
  const completedBookings = filteredBookings.filter(
    (booking) => booking.status === "COMPLETED"
  ).length;
  const cancelledBookings = filteredBookings.filter(
    (booking) => booking.status === "CANCELLED"
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

  // Handle booking type filter change
  const handleBookingTypeFilterChange = (
    bookingType: "advance" | "walk-in" | undefined
  ) => {
    setSelectedBookingType(bookingType);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setDateRange(null);
    setSelectedBranchId(undefined);
    setSelectedBookingType(undefined);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // Prepare branch options
  const branchOptions = branches.map((branch) => ({
    label: branch.branch_name || branch.branch_code || "N/A",
    value: branch.branch_id,
  }));

  // Get status color and icon
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          color: "orange",
          icon: <ClockCircleOutlined />,
          text: "Chờ xác nhận",
        };
      case "CONFIRMED":
        return {
          color: "blue",
          icon: <CheckCircleOutlined />,
          text: "Đã xác nhận",
        };
      case "IN_PROGRESS":
        return {
          color: "purple",
          icon: <CarOutlined />,
          text: "Đang thực hiện",
        };
      case "COMPLETED":
        return {
          color: "green",
          icon: <CheckCircleOutlined />,
          text: "Hoàn thành",
        };
      case "CANCELLED":
        return {
          color: "red",
          icon: <CloseCircleOutlined />,
          text: "Đã hủy",
        };
      default:
        return {
          color: "default",
          icon: <ExclamationCircleOutlined />,
          text: status,
        };
    }
  };

  // Table columns
  const columns: any[] = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center",
      render: (_: unknown, __: unknown, index: number) => (
        <span style={{ fontSize: 14, color: "#666" }}>
          {(pagination.current - 1) * pagination.pageSize + index + 1}
        </span>
      ),
    },
    {
      title: "Mã đặt lịch",
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

    // {
    //   title: "Dịch vụ",
    //   dataIndex: "booking_items",
    //   key: "booking_items",
    //   width: 180,
    //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //   render: (items: any[]) => (
    // <div>
    //       {items?.map((item, index) => (
    //         <Tag
    //           key={index}
    //           color="blue"
    //           style={{ fontSize: "12px", marginBottom: "4px" }}
    //         >
    //           {item.item_name}
    //         </Tag>
    //       ))}
    //     </div>
    //   ),
    // },
    {
      title: "Xe",
      dataIndex: "vehicle_license_plate",
      key: "vehicle_license_plate",
      width: 140,
      ellipsis: {
        showTitle: false,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (text: string, record: any) => (
        <Space direction="vertical" size="small" style={{ fontSize: "13px" }}>
          <Space>
            <CarOutlined style={{ color: "#1890ff" }} />
            <Text strong ellipsis={{ tooltip: text }}>
              {text}
            </Text>
          </Space>
          {record.vehicle_brand_name && (
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
      title: "Chi nhánh",
      dataIndex: "branch_name",
      key: "branch_name",
      width: 160,
      ellipsis: {
        showTitle: false,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (text: string, record: any) => (
        <Space direction="vertical" size="small" style={{ fontSize: "13px" }}>
          <Space>
            <EnvironmentOutlined style={{ color: "#1890ff" }} />
            <Text strong ellipsis={{ tooltip: text }}>
              {text}
            </Text>
          </Space>
          {record.bay_name && (
            <Text
              type="secondary"
              style={{ fontSize: "11px" }}
              ellipsis={{ tooltip: record.bay_name }}
            >
              {record.bay_name}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Ngày & Giờ",
      dataIndex: "scheduled_start_at",
      key: "scheduled_start_at",
      width: 160,
      render: (date: string, record: BookingInfoDto) => (
        <Space direction="vertical" size="small" style={{ fontSize: "13px" }}>
          <Space>
            <CalendarOutlined style={{ color: "#1890ff" }} />
            <Text strong>{dayjs(date).format("DD/MM/YYYY")}</Text>
          </Space>
          <Space>
            <ClockCircleOutlined style={{ color: "#52c41a" }} />
            <Text>Bắt đầu lúc: {dayjs(date).format("HH:mm")}</Text>
          </Space>
          <Space>
            <ClockCircleOutlined style={{ color: "#52c41a" }} />
            <Text>Kết thúc lúc: {dayjs(date).add(record.estimated_duration_minutes || 0, "minutes").format("HH:mm")}</Text>
          </Space>
        </Space>
      ),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sorter: (a: any, b: any) =>
        dayjs(a.scheduled_start_at).unix() - dayjs(b.scheduled_start_at).unix(),
    },
    {
      title: "Tổng tiền",
      dataIndex: "total_price",
      key: "total_price",
      width: 160,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (amount: number, record: any) => (
        <Space direction="vertical" size="small" style={{ fontSize: "13px" }}>
          <Text strong style={{ color: "#52c41a", fontSize: "14px" }}>
            {amount?.toLocaleString("vi-VN")} {record.currency || "VND"}
          </Text>
          {record.payment_status && (
            <Tag
              color={record.payment_status === "PENDING" ? "orange" : "green"}
              style={{ fontSize: "11px", fontWeight: "bold" }}
            >
              {record.payment_status === "PENDING"
                ? "Chưa thanh toán"
                : "Đã thanh toán"}
            </Tag>
          )}
        </Space>
      ),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sorter: (a: any, b: any) => (a.total_price || 0) - (b.total_price || 0),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status: string) => {
        const config = getStatusConfig(status);
        return (
          <Tag
            color={config.color}
            icon={config.icon}
            style={{ fontSize: "12px", fontWeight: "bold" }}
          >
            {config.text}
          </Tag>
        );
      },
      filters: [
        { text: "Chờ xác nhận", value: "PENDING" },
        { text: "Đã xác nhận", value: "CONFIRMED" },
        { text: "Đang thực hiện", value: "IN_PROGRESS" },
        { text: "Hoàn thành", value: "COMPLETED" },
        { text: "Đã hủy", value: "CANCELLED" },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onFilter: (value: any, record: any) => record.status === value,
    },

    {
      title: "Xem chi tiết",
      key: "view",
      width: 120,
      align: "center",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: any) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
          style={{ fontSize: "12px" }}
        />
      ),
    },
    {
      title: "Chỉnh sửa",
      key: "edit",
      width: 120,
      align: "center",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: any) => {
        // So sánh với cả enum và string để đảm bảo tương thích
        // Fallback: Nếu booking_type không có, kiểm tra booking_code
        // Booking code bắt đầu bằng "BK-" là SCHEDULED, "WALK-IN-" là WALK_IN
        const bookingType = record.booking_type as string | undefined;
        const isScheduledBooking = 
          bookingType === BookingType.SCHEDULED || 
          bookingType === "SCHEDULED" ||
          (!bookingType && record.booking_code?.startsWith("BK-"));
        
        // Cho phép chỉnh sửa khi booking ở trạng thái PENDING hoặc CONFIRMED (giống admin)
        const allowedStatuses = ["PENDING", "CONFIRMED"];
        const canEdit = isScheduledBooking && allowedStatuses.includes(record.status);

        // Debug logging
        console.log(" Edit button check:", {
          bookingCode: record.booking_code,
          bookingType: record.booking_type,
          bookingTypeEnum: BookingType.SCHEDULED,
          bookingTypeString: "SCHEDULED",
          bookingCodeStartsWithBK: record.booking_code?.startsWith("BK-"),
          isScheduledBooking,
          status: record.status,
          allowedStatuses,
          statusIncluded: allowedStatuses.includes(record.status),
          canEdit,
        });

        return canEdit ? (
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditBooking(record)}
            style={{ fontSize: "12px" }}
          />
        ) : (
          <span style={{ color: "#d9d9d9", fontSize: "12px" }}>-</span>
        );
      },
    },
    {
      title: "Hủy Lịch",
      key: "cancel",
      width: 120,
      align: "center",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: any) => {
        const canCancel = canCancelBooking(record);

        return canCancel ? (
          <Popconfirm
            title="Hủy đặt lịch"
            description="Bạn có chắc chắn muốn hủy đặt lịch này không?"
            onConfirm={() => handleCancelBooking(record)}
            okText="Hủy"
            cancelText="Không"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              loading={cancelBookingMutation.isPending}
              style={{ fontSize: "12px" }}
            />
          </Popconfirm>
        ) : (
          <span style={{ color: "#d9d9d9", fontSize: "12px" }}>-</span>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải danh sách đặt lịch...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Empty
          description="Có lỗi xảy ra khi tải danh sách đặt lịch"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => refetch()}>
            Thử lại
          </Button>
        </Empty>
      </div>
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
            Danh sách đặt lịch của tôi
          </Title>
          <Text type="secondary" style={{ fontSize: "16px" }}>
            Quản lý và theo dõi các lịch hẹn dịch vụ của bạn
          </Text>
        </div>
        {/* Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Tổng đặt lịch"
                value={totalBookings}
                prefix={<CalendarOutlined />}
                valueStyle={{ fontSize: "20px" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Sắp tới"
                value={upcomingBookings}
                prefix={<ClockCircleOutlined />}
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
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Đã hủy"
                value={cancelledBookings}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: "#ff4d4f", fontSize: "20px" }}
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

        {/* Bookings Table */}
        <Card
          title={
            <div
              style={{ fontSize: "18px", fontWeight: "bold", color: "#1890ff" }}
            >
              Chi tiết đặt lịch
            </div>
          }
          extra={
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
              type="primary"
              size="middle"
            >
              Làm mới
            </Button>
          }
          style={{
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            borderRadius: "12px",
          }}
        >
          {bookings.length === 0 ? (
            <Empty
              description="Bạn chưa có lịch hẹn nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button
                type="primary"
                onClick={() => router.push("/member/booking")}
              >
                Đặt lịch ngay
              </Button>
            </Empty>
          ) : (
            <div
              className="booking-table-wrapper"
              style={{ overflowX: "auto", overflowY: "hidden" }}
            >
              <Table
                columns={columns}
                dataSource={paginatedBookings}
                rowKey="booking_id"
                pagination={{
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  total: filteredBookings.length,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} của ${total} đặt lịch`,
                  responsive: true,
                  position: ["bottomRight"],
                  pageSizeOptions: ["5", "8", "10", "20", "50"],
                  onChange: (page, pageSize) => {
                    setPagination({
                      current: page,
                      pageSize: pageSize || 8,
                    });
                  },
                }}
                scroll={{
                  x: "max-content",
                  y: undefined,
                }}
                size="middle"
                bordered
                className="booking-table"
                style={{
                  width: "100%",
                }}
              />
            </div>
          )}
        </Card>

        {/* Booking Detail Modal */}
        {selectedBooking && (
          <CustomerBookingDetailModal
            open={detailModalOpen}
            onCancel={() => {
              setDetailModalOpen(false);
              setSelectedBooking(null);
            }}
            booking={selectedBooking}
          />
        )}

        {/* Customer Update Booking Modal */}
        {selectedBookingForUpdate && (
          <CustomerUpdateBookingModal
            open={updateModalOpen}
            onCancel={handleUpdateModalClose}
            onOk={handleUpdateModalSuccess}
            initialData={selectedBookingForUpdate}
            loading={false}
            onRefresh={refetch}
          />
        )}
      </div>
    </App>
  );
};

export default CustomerBookingListPage;
