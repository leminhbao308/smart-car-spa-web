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
} from "@ant-design/icons";
import { useAuth } from "@/lib/api/hooks/useAuth";
import { useCustomerBookings } from "@/lib/api/hooks/useUsers";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import VehicleTrackingModal from "@/components/ui/Modal/VehicleTrackingModal/VehicleTrackingModal";
import { BookingInfoDto } from "@/lib/api/types/booking.types";
import { ServiceProcessTrackingInfoDto } from "@/lib/api/types/service-process-tracking.types";

const { Title, Text } = Typography;

const CustomerBookingListPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  // State for tracking modal
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingInfoDto | null>(null);
  const [trackings, setTrackings] = useState<ServiceProcessTrackingInfoDto[]>([]);

  // Add CSS styles for better table appearance
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .booking-table .ant-table-thead > tr > th {
        background: #fafafa;
        color: #262626;
        font-weight: bold;
        text-align: center;
        border: 1px solid #f0f0f0;
        padding: 16px 8px;
      }
      
      .booking-table .ant-table-tbody > tr > td {
        padding: 12px 8px;
        border-bottom: 1px solid #f0f0f0;
        vertical-align: middle;
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
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Get customer bookings
  const { bookings, loading, error, refetch } = useCustomerBookings(user?.user_id || null);

  // Function to open tracking modal
  const handleViewTracking = (booking: BookingInfoDto) => {
    setSelectedBooking(booking);
    setTrackings([]); // Will be loaded by the modal
    setTrackingModalOpen(true);
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

  // Calculate statistics
  const totalBookings = bookings.length;
  const upcomingBookings = bookings.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (booking: any) => dayjs(booking.scheduled_start_at).isAfter(dayjs())
  ).length;
  const completedBookings = bookings.filter(
    (booking) => booking.status === "COMPLETED"
  ).length;
  const cancelledBookings = bookings.filter(
    (booking) => booking.status === "CANCELLED"
  ).length;

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: any[] = [
    {
      title: "Mã đặt lịch",
      dataIndex: "booking_code",
      key: "booking_code",
      width: 140,
      fixed: "left",
      render: (text: string) => (
        <Text code style={{ fontSize: "13px", fontWeight: "bold" }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Ngày & Giờ",
      dataIndex: "scheduled_start_at",
      key: "scheduled_start_at",
      width: 160,
      render: (date: string) => (
        <Space direction="vertical" size="small" style={{ fontSize: "13px" }}>
          <Space>
            <CalendarOutlined style={{ color: "#1890ff" }} />
            <Text strong>{dayjs(date).format("DD/MM/YYYY")}</Text>
          </Space>
          <Space>
            <ClockCircleOutlined style={{ color: "#52c41a" }} />
            <Text>{dayjs(date).format("HH:mm")}</Text>
          </Space>
        </Space>
      ),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sorter: (a: any, b: any) => dayjs(a.scheduled_start_at).unix() - dayjs(b.scheduled_start_at).unix(),
    },
    {
      title: "Dịch vụ",
      dataIndex: "booking_items",
      key: "booking_items",
      width: 180,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (items: any[]) => (
        <div>
          {items?.map((item, index) => (
            <Tag key={index} color="blue" style={{ fontSize: "12px", marginBottom: "4px" }}>
              {item.item_name}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Xe",
      dataIndex: "vehicle_license_plate",
      key: "vehicle_license_plate",
      width: 140,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (text: string, record: any) => (
        <Space direction="vertical" size="small" style={{ fontSize: "13px" }}>
          <Space>
            <CarOutlined style={{ color: "#1890ff" }} />
            <Text strong>{text}</Text>
          </Space>
          {record.vehicle_brand_name && (
            <Text type="secondary" style={{ fontSize: "11px" }}>
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (text: string, record: any) => (
        <Space direction="vertical" size="small" style={{ fontSize: "13px" }}>
          <Space>
            <EnvironmentOutlined style={{ color: "#1890ff" }} />
            <Text strong>{text}</Text>
          </Space>
          {record.bay_name && (
            <Text type="secondary" style={{ fontSize: "11px" }}>
              {record.bay_name}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status: string) => {
        const config = getStatusConfig(status);
        return (
          <Tag color={config.color} icon={config.icon} style={{ fontSize: "12px", fontWeight: "bold" }}>
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
              {record.payment_status === "PENDING" ? "Chưa thanh toán" : "Đã thanh toán"}
            </Tag>
          )}
        </Space>
      ),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sorter: (a: any, b: any) => (a.total_price || 0) - (b.total_price || 0),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      fixed: "right",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_, record: any) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewTracking(record)}
          style={{ fontSize: "12px" }}
        >
          Xem chi tiết
        </Button>
      ),
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
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <Title level={2} style={{ fontSize: "28px", marginBottom: "12px", color: "#1890ff" }}>
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

      {/* Bookings Table */}
      <Card
        title={
          <div style={{ fontSize: "18px", fontWeight: "bold", color: "#1890ff" }}>
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
          borderRadius: "12px"
        }}
      >
        {bookings.length === 0 ? (
          <Empty
            description="Bạn chưa có lịch hẹn nào"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => router.push("/member/booking")}>
              Đặt lịch ngay
            </Button>
          </Empty>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <Table
              columns={columns}
              dataSource={bookings}
              rowKey="booking_id"
              pagination={{
                pageSize: 8,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} đặt lịch`,
                responsive: true,
                size: "middle",
                position: ["bottomRight"],
              }}
              scroll={{ x: 1120 }}
              size="middle"
              bordered
              style={{ 
                minWidth: "800px",
                maxWidth: "100%"
              }}
              className="booking-table"
            />
          </div>
        )}
      </Card>

      {/* Vehicle Tracking Modal */}
      {selectedBooking && (
        <VehicleTrackingModal
          open={trackingModalOpen}
          onCancel={() => {
            setTrackingModalOpen(false);
            setSelectedBooking(null);
          }}
          booking={selectedBooking}
          trackings={trackings}
          shouldCreateTracking={false}
        />
      )}
    </div>
  );
};

export default CustomerBookingListPage;
