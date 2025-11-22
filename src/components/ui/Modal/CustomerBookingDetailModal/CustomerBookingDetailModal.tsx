"use client";

import React from "react";
import {
  Modal,
  Descriptions,
  Tag,
  Card,
  Row,
  Col,
  Button,
  Space,
  Typography,
  Table,
  Divider,
} from "antd";
import {
  EyeOutlined,
  CloseOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CarOutlined,
  UserOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { BookingInfoDto, BookingStatus, BookingType } from "@/lib/api/types/booking.types";

const { Text, Title } = Typography;

interface CustomerBookingDetailModalProps {
  open: boolean;
  onCancel: () => void;
  booking: BookingInfoDto | null;
}

const CustomerBookingDetailModal: React.FC<CustomerBookingDetailModalProps> = ({
  open,
  onCancel,
  booking,
}) => {
  if (!booking) return null;

  // Get status config
  const getStatusConfig = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
        return {
          color: "orange",
          icon: <ClockCircleOutlined />,
          text: "Chờ xác nhận",
        };
      case BookingStatus.CONFIRMED:
        return {
          color: "blue",
          icon: <CheckCircleOutlined />,
          text: "Đã xác nhận",
        };
      case BookingStatus.CHECKED_IN:
        return {
          color: "cyan",
          icon: <CheckCircleOutlined />,
          text: "Đã check-in",
        };
      case BookingStatus.IN_PROGRESS:
        return {
          color: "purple",
          icon: <CarOutlined />,
          text: "Đang thực hiện",
        };
      case BookingStatus.PAUSED:
        return {
          color: "default",
          icon: <ExclamationCircleOutlined />,
          text: "Tạm dừng",
        };
      case BookingStatus.COMPLETED:
        return {
          color: "green",
          icon: <CheckCircleOutlined />,
          text: "Hoàn thành",
        };
      case BookingStatus.CANCELLED:
        return {
          color: "red",
          icon: <CloseCircleOutlined />,
          text: "Đã hủy",
        };
      case BookingStatus.NO_SHOW:
        return {
          color: "red",
          icon: <CloseCircleOutlined />,
          text: "Không đến",
        };
      default:
        return {
          color: "default",
          icon: <ExclamationCircleOutlined />,
          text: status,
        };
    }
  };

  const statusConfig = getStatusConfig(booking.status);

  // Get booking type text
  const getBookingTypeText = (type: BookingType) => {
    switch (type) {
      case BookingType.SCHEDULED:
        return "Đặt trước";
      case BookingType.WALK_IN:
        return "Đặt xử lý tại chỗ";
      default:
        return type;
    }
  };

  // Booking items table columns
  const bookingItemsColumns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center" as const,
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: "Dịch vụ",
      dataIndex: "service_name",
      key: "service_name",
      render: (text: string) => <Text strong>{text || "N/A"}</Text>,
    },
    {
      title: "Mô tả",
      dataIndex: "service_description",
      key: "service_description",
      render: (text: string) => <Text type="secondary">{text || "-"}</Text>,
    },
    {
      title: "Đơn giá",
      dataIndex: "unit_price",
      key: "unit_price",
      align: "right" as const,
      render: (price: number) => (
        <Text>
          {price?.toLocaleString("vi-VN")} {booking.currency || "VND"}
        </Text>
      ),
    },
    {
      title: "Thời lượng",
      dataIndex: "duration_minutes",
      key: "duration_minutes",
      align: "center" as const,
      render: (minutes: number) => (
        <Text>{minutes ? `${minutes} phút` : "-"}</Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "item_status",
      key: "item_status",
      align: "center" as const,
      render: (status: string) => {
        if (!status) return "-";
        const color =
          status === "COMPLETED"
            ? "green"
            : status === "IN_PROGRESS"
            ? "blue"
            : "default";
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <EyeOutlined style={{ color: "#1890ff" }} />
          <span>Chi tiết đặt lịch</span>
          <Tag color={statusConfig.color}>
            {statusConfig.icon} {statusConfig.text}
          </Tag>
        </div>
      }
      open={open}
      onCancel={onCancel}
      width="95%"
      style={{ maxWidth: 1000 }}
      footer={[
        <Button key="close" onClick={onCancel}>
          <CloseOutlined />
          Đóng
        </Button>,
      ]}
      destroyOnHidden
    >
      <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
        {/* Basic Information */}
        <Card
          title={
            <Space>
              <span style={{ fontSize: "20px" }}>📋</span>
              <span>Thông tin đặt lịch</span>
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="Mã đặt lịch">
              <Text code strong style={{ fontSize: "14px" }}>
                {booking.booking_code}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Loại đặt lịch">
              <Tag color={booking.booking_type === BookingType.SCHEDULED ? "blue" : "green"}>
                {getBookingTypeText(booking.booking_type)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={statusConfig.color}>
                {statusConfig.icon} {statusConfig.text}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái thanh toán">
              <Tag
                color={
                  booking.payment_status === "PAID"
                    ? "green"
                    : booking.payment_status === "PENDING"
                    ? "orange"
                    : "default"
                }
              >
                {booking.payment_status === "PAID"
                  ? "Đã thanh toán"
                  : booking.payment_status === "PENDING"
                  ? "Chờ thanh toán"
                  : booking.payment_status || "N/A"}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Customer Information */}
        <Card
          title={
            <Space>
              <span style={{ fontSize: "20px" }}>👤</span>
              <span>Thông tin khách hàng</span>
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="Tên khách hàng">
              <Space>
                <UserOutlined />
                <Text strong>{booking.customer_name}</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              <Space>
                <PhoneOutlined />
                <Text>{booking.customer_phone}</Text>
              </Space>
            </Descriptions.Item>
            {booking.customer_email && (
              <Descriptions.Item label="Email" span={2}>
                <Space>
                  <MailOutlined />
                  <Text>{booking.customer_email}</Text>
                </Space>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* Vehicle Information */}
        <Card
          title={
            <Space>
              <span style={{ fontSize: "20px" }}></span>
              <span>Thông tin xe</span>
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="Biển số xe">
              <Space>
                <CarOutlined />
                <Text code strong>
                  {booking.vehicle_license_plate}
                </Text>
              </Space>
            </Descriptions.Item>
            {booking.vehicle_brand_name && (
              <Descriptions.Item label="Hãng xe">
                <Text>{booking.vehicle_brand_name}</Text>
              </Descriptions.Item>
            )}
            {booking.vehicle_model_name && (
              <Descriptions.Item label="Mẫu xe">
                <Text>{booking.vehicle_model_name}</Text>
              </Descriptions.Item>
            )}
            {booking.vehicle_type_name && (
              <Descriptions.Item label="Loại xe">
                <Text>{booking.vehicle_type_name}</Text>
              </Descriptions.Item>
            )}
            {booking.vehicle_year && (
              <Descriptions.Item label="Năm sản xuất">
                <Text>{booking.vehicle_year}</Text>
              </Descriptions.Item>
            )}
            {booking.vehicle_color && (
              <Descriptions.Item label="Màu sắc">
                <Text>{booking.vehicle_color}</Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* Branch and Bay Information */}
        <Card
          title={
            <Space>
              <span style={{ fontSize: "20px" }}>📍</span>
              <span>Thông tin chi nhánh</span>
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="Chi nhánh">
              <Space>
                <EnvironmentOutlined />
                <Text strong>{booking.branch_name || "N/A"}</Text>
                {booking.branch_code && (
                  <Text type="secondary">({booking.branch_code})</Text>
                )}
              </Space>
            </Descriptions.Item>
            {booking.bay_name && (
              <Descriptions.Item label="Khu vực dịch vụ">
                <Space>
                  <ToolOutlined />
                  <Text>{booking.bay_name}</Text>
                  {booking.bay_type && (
                    <Tag color="blue">{booking.bay_type}</Tag>
                  )}
                </Space>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* Scheduling Information */}
        <Card
          title={
            <Space>
              <span style={{ fontSize: "20px" }}>📅</span>
              <span>Thông tin lịch hẹn</span>
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Descriptions column={2} size="small" bordered>
            {booking.preferred_start_at && (
              <Descriptions.Item label="Thời gian mong muốn">
                <Space>
                  <CalendarOutlined />
                  <Text>
                    {dayjs(booking.preferred_start_at).format(
                      "DD/MM/YYYY HH:mm"
                    )}
                  </Text>
                </Space>
              </Descriptions.Item>
            )}
            {booking.scheduled_start_at && (
              <Descriptions.Item label="Thời gian đã hẹn (Bắt đầu)">
                <Space>
                  <ClockCircleOutlined />
                  <Text strong>
                    {dayjs(booking.scheduled_start_at).format(
                      "DD/MM/YYYY HH:mm"
                    )}
                  </Text>
                </Space>
              </Descriptions.Item>
            )}
            {booking.scheduled_end_at && (
              <Descriptions.Item label="Thời gian kết thúc dự kiến">
                <Space>
                  <ClockCircleOutlined />
                  <Text>
                    {dayjs(booking.scheduled_end_at).format(
                      "DD/MM/YYYY HH:mm"
                    )}
                  </Text>
                </Space>
              </Descriptions.Item>
            )}
            {booking.actual_check_in_at && (
              <Descriptions.Item label="Thời gian check-in thực tế">
                <Space>
                  <CheckCircleOutlined />
                  <Text type="success">
                    {dayjs(booking.actual_check_in_at).format(
                      "DD/MM/YYYY HH:mm"
                    )}
                  </Text>
                </Space>
              </Descriptions.Item>
            )}
            {booking.actual_start_at && (
              <Descriptions.Item label="Thời gian bắt đầu thực tế">
                <Space>
                  <CarOutlined />
                  <Text>
                    {dayjs(booking.actual_start_at).format(
                      "DD/MM/YYYY HH:mm"
                    )}
                  </Text>
                </Space>
              </Descriptions.Item>
            )}
            {booking.actual_end_at && (
              <Descriptions.Item label="Thời gian kết thúc thực tế">
                <Space>
                  <CheckCircleOutlined />
                  <Text type="success">
                    {dayjs(booking.actual_end_at).format("DD/MM/YYYY HH:mm")}
                  </Text>
                </Space>
              </Descriptions.Item>
            )}
            {booking.estimated_duration_minutes && (
              <Descriptions.Item label="Thời lượng ước tính">
                <Text>{booking.estimated_duration_minutes} phút</Text>
              </Descriptions.Item>
            )}
            {booking.actual_duration_minutes && (
              <Descriptions.Item label="Thời lượng thực tế">
                <Text type="success">
                  {booking.actual_duration_minutes} phút
                </Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* Booking Items */}
        {booking.booking_items && booking.booking_items.length > 0 && (
          <Card
            title={
              <Space>
                <span style={{ fontSize: "20px" }}>🔧</span>
                <span>Danh sách dịch vụ</span>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Table
              columns={bookingItemsColumns}
              dataSource={booking.booking_items}
              rowKey={(record) =>
                record.booking_item_id || 
                `item-${record.service_id || ''}-${record.display_order || ''}-${record.service_name || ''}`
              }
              pagination={false}
              size="small"
            />
          </Card>
        )}

        {/* Pricing Information */}
        {booking.total_price !== undefined && booking.total_price !== null && (
          <Card
            title={
              <Space>
                <span style={{ fontSize: "20px" }}>💰</span>
                <span>Thông tin thanh toán</span>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Descriptions column={1} size="small" bordered>
                  <Descriptions.Item label="Tổng tiền">
                    <Space>
                      <DollarOutlined style={{ color: "#52c41a" }} />
                      <Text strong style={{ fontSize: "16px", color: "#52c41a" }}>
                        {booking.total_price.toLocaleString("vi-VN")}{" "}
                        {booking.currency || "VND"}
                      </Text>
                    </Space>
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </Card>
        )}

        {/* Notes */}
        {booking.notes && (
          <Card
            title={
              <Space>
                <span style={{ fontSize: "20px" }}>📝</span>
                <span>Ghi chú</span>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Text>{booking.notes}</Text>
          </Card>
        )}

        {/* Cancellation Information */}
        {booking.status === BookingStatus.CANCELLED && (
          <Card
            title={
              <Space>
                <span style={{ fontSize: "20px" }}>❌</span>
                <span>Thông tin hủy đặt lịch</span>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Descriptions column={1} size="small" bordered>
              {booking.cancellation_reason && (
                <Descriptions.Item label="Lý do hủy">
                  <Text type="danger">{booking.cancellation_reason}</Text>
                </Descriptions.Item>
              )}
              {booking.cancelled_at && (
                <Descriptions.Item label="Thời gian hủy">
                  <Text>
                    {dayjs(booking.cancelled_at).format("DD/MM/YYYY HH:mm")}
                  </Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        )}

        {/* Audit Information */}
        <Card
          title={
            <Space>
              <span style={{ fontSize: "20px" }}>📊</span>
              <span>Thông tin hệ thống</span>
            </Space>
          }
        >
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="Ngày tạo">
              <Text>
                {dayjs(booking.created_at).format("DD/MM/YYYY HH:mm:ss")}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày cập nhật">
              <Text>
                {dayjs(booking.updated_at).format("DD/MM/YYYY HH:mm:ss")}
              </Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </Modal>
  );
};

export default CustomerBookingDetailModal;

