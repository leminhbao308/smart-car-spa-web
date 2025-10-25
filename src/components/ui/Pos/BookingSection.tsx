"use client";
import React, { useMemo } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Button,
  Space,
  Divider,
  Empty,
  Spin,
  Alert,
} from "antd";
import {
  CarOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { BookingInfoDto } from "@/lib/api/types/booking.types";
import { BranchDisplay } from "@/lib/api/types/branch.types";
import { Service } from "@/lib/api/types/service.types";
import { formatDate } from "@/components/utils/helper/date.format.helper";
import { formatTime } from "@/components/utils/helper/duration.format.helper";

const { Text, Title } = Typography;

interface BookingSectionProps {
  bookings: BookingInfoDto[];
  selectedBranch: BranchDisplay | null;
  isLoading: boolean;
  error: string | null;
  onAddBookingToCart: (booking: BookingInfoDto) => void;
  onRefresh: () => void;
  // Services data for booking items
  services: Service[];
  isLoadingServices: boolean;
  servicesError: string | null;
  // Price books data
  activePriceBooks: any[];
  isLoadingPriceBooks: boolean;
  priceBooksError: string | null;
  // All price books data
  allPriceBooks: any[];
  isLoadingAllPriceBooks: boolean;
  allPriceBooksError: string | null;
  // Selected booking (to hide card when added to cart)
  selectedBookingId?: string | null;
}

const BookingSection: React.FC<BookingSectionProps> = ({
  bookings,
  selectedBranch,
  isLoading,
  error,
  onAddBookingToCart,
  onRefresh,
  // Services data for booking items
  services,
  isLoadingServices,
  servicesError,
  // Price books data
  activePriceBooks,
  isLoadingPriceBooks,
  priceBooksError,
  // All price books data
  allPriceBooks,
  isLoadingAllPriceBooks,
  allPriceBooksError,
  // Selected booking
  selectedBookingId,
}) => {
  // Filter bookings by selected branch AND exclude selected booking
  const filteredBookings = useMemo(() => {
    if (!selectedBranch) return [];
    return bookings.filter(
      (booking) =>
        booking.branch_id === selectedBranch.branch_id &&
        booking.booking_id !== selectedBookingId // Hide booking if selected
    );
  }, [bookings, selectedBranch, selectedBookingId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "orange";
      case "CONFIRMED":
        return "blue";
      case "CHECKED_IN":
        return "cyan";
      case "IN_PROGRESS":
        return "green";
      case "COMPLETED":
        return "green";
      case "CANCELLED":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Chờ xác nhận";
      case "CONFIRMED":
        return "Đã xác nhận";
      case "CHECKED_IN":
        return "Đã check-in";
      case "IN_PROGRESS":
        return "Đang thực hiện";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  if (error) {
    return (
      <Alert
        message="Lỗi tải dữ liệu"
        description={error}
        type="error"
        showIcon
        action={
          <Button
            size="small"
            onClick={onRefresh}
          >
            Thử lại
          </Button>
        }
      />
    );
  }

  if (servicesError) {
    return (
      <Alert
        message="Lỗi tải dịch vụ"
        description={servicesError}
        type="error"
        showIcon
        action={
          <Button
            size="small"
            onClick={onRefresh}
          >
            Thử lại
          </Button>
        }
      />
    );
  }

  if (priceBooksError) {
    return (
      <Alert
        message="Lỗi tải bảng giá"
        description={priceBooksError}
        type="error"
        showIcon
        action={
          <Button
            size="small"
            onClick={onRefresh}
          >
            Thử lại
          </Button>
        }
      />
    );
  }

  if (
    isLoading ||
    isLoadingServices ||
    isLoadingPriceBooks ||
    isLoadingAllPriceBooks
  ) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>
            {isLoading
              ? "Đang tải danh sách booking..."
              : isLoadingServices
              ? "Đang tải danh sách dịch vụ..."
              : isLoadingPriceBooks
              ? "Đang tải bảng giá active..."
              : "Đang tải tất cả bảng giá..."}
          </Text>
        </div>
      </div>
    );
  }

  if (!selectedBranch) {
    return (
      <Empty
        description="Vui lòng chọn chi nhánh để xem booking"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  if (filteredBookings.length === 0) {
    return (
      <Empty
        description={
          services.length === 0 || allPriceBooks.length === 0
            ? `Không có booking, dịch vụ hoặc bảng giá hệ thống nào`
            : `Không có booking chờ thanh toán cho chi nhánh ${selectedBranch.branch_name}`
        }
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={4}>
          Booking chờ thanh toán - {selectedBranch.branch_name}
        </Title>
        <Text type="secondary">
          Tìm thấy {filteredBookings.length} booking chờ thanh toán
        </Text>
      </div>

      <Row gutter={[16, 16]}>
        {filteredBookings.map((booking) => (
          <Col
            xs={24}
            sm={12}
            lg={12}
            xl={12}
            key={booking.booking_id}
          >
            <Card
              hoverable
              style={{ height: "100%" }}
              actions={[
                <Button
                  key="pay-booking"
                  type="primary"
                  size="large"
                  icon={<DollarOutlined />}
                  onClick={() => onAddBookingToCart(booking)}
                  block
                >
                  Thanh toán
                </Button>,
              ]}
            >
              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <Tag color={getStatusColor(booking.status)}>
                    {getStatusLabel(booking.status)}
                  </Tag>
                  <Tag color="orange">Chờ thanh toán</Tag>
                </div>
                <Text
                  strong
                  style={{ fontSize: 14 }}
                >
                  {booking.booking_code}
                </Text>
              </div>

              <Divider style={{ margin: "8px 0" }} />

              {/* Customer Info */}
              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <UserOutlined style={{ color: "#1890ff" }} />
                  <Text strong>{booking.customer_name}</Text>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <PhoneOutlined style={{ color: "#52c41a" }} />
                  <Text style={{ fontSize: 12 }}>{booking.customer_phone}</Text>
                </div>
                {booking.customer_email && (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <MailOutlined style={{ color: "#722ed1" }} />
                    <Text style={{ fontSize: 12 }}>
                      {booking.customer_email}
                    </Text>
                  </div>
                )}
              </div>

              {/* Vehicle Info */}
              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <CarOutlined style={{ color: "#fa8c16" }} />
                  <Text strong>
                    {booking.vehicle_brand_name} {booking.vehicle_model_name}
                  </Text>
                </div>
                <Text style={{ fontSize: 12, color: "#666" }}>
                  {booking.vehicle_license_plate} • {booking.vehicle_year} •{" "}
                  {booking.vehicle_color}
                </Text>
              </div>

              {/* Time Info */}
              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <CalendarOutlined style={{ color: "#13c2c2" }} />
                  <Text style={{ fontSize: 12 }}>
                    {formatDate(
                      booking.scheduled_start_at ||
                        booking.preferred_start_at ||
                        new Date().toISOString()
                    )}
                  </Text>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <ClockCircleOutlined style={{ color: "#eb2f96" }} />
                  <Text style={{ fontSize: 12 }}>
                    {formatTime(booking.estimated_duration_minutes || 0)}
                  </Text>
                </div>
              </div>

              {/* Services */}
              <div style={{ marginBottom: 12 }}>
                <Text
                  strong
                  style={{ fontSize: 12, color: "#666" }}
                >
                  Dịch vụ ({booking.booking_items?.length || 0}):
                </Text>
                <div style={{ marginTop: 4 }}>
                  {booking.booking_items?.slice(0, 2).map((item, index) => (
                    <div
                      key={index}
                      style={{ fontSize: 11, color: "#999" }}
                    >
                      • {item.item_name}
                    </div>
                  ))}
                  {(booking.booking_items?.length || 0) > 2 && (
                    <div style={{ fontSize: 11, color: "#999" }}>
                      • ... và {(booking.booking_items?.length || 0) - 2} dịch
                      vụ khác
                    </div>
                  )}
                </div>
              </div>

              {/* Total Price */}
              <div
                style={{
                  backgroundColor: "#f0f8ff",
                  padding: "8px",
                  borderRadius: "4px",
                  textAlign: "center",
                }}
              >
                <Text
                  strong
                  style={{ fontSize: 16, color: "#1890ff" }}
                >
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(booking.total_price || 0)}
                </Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default BookingSection;
