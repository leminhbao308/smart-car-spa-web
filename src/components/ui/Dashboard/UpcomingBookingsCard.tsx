"use client";
import React from "react";
import { Card, List, Avatar, Typography, Tag, Space, Button } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CarOutlined,
} from "@ant-design/icons";
import { UpcomingBooking } from "@/lib/api";

const { Text, Title } = Typography;

interface UpcomingBookingsCardProps {
  bookings: UpcomingBooking[];
  title?: string;
}

function formatDateTime(dateTime: string) {
  const dateObj = new Date(dateTime);
  const optionsDate: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };
  const optionsTime: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };
  const date = dateObj.toLocaleDateString("vi-VN", optionsDate);
  const time = dateObj.toLocaleTimeString("vi-VN", optionsTime);
  return { date, time };
}

const UpcomingBookingsCard: React.FC<UpcomingBookingsCardProps> = ({
  bookings,
  title = "Lịch đặt sắp tới",
}) => {
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "confirmed":
        return "green";
      case "pending":
        return "orange";
      case "in_progress":
        return "blue";
      case "cancelled":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "confirmed":
        return "Đã xác nhận";
      case "pending":
        return "Chờ xác nhận";
      case "in_progress":
        return "Đang xử lý";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  return (
    <Card
      title={
        <Title
          level={4}
          style={{ margin: 0 }}
        >
          {title}
        </Title>
      }
      style={{
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        border: "none",
        height: "100%",
      }}
      styles={{
        body: {
          padding: 16,
        },
      }}
      extra={
        <Button
          type="link"
          size="small"
        >
          Xem tất cả
        </Button>
      }
    >
      <List
        dataSource={bookings}
        renderItem={(booking) => {
          const { date, time } = formatDateTime(booking.scheduledTime);
          return (
            <List.Item
              style={{
                padding: "12px 0",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    style={{
                      backgroundColor: "#1890ff",
                      border: "2px solid #fff",
                    }}
                    icon={<CalendarOutlined />}
                  />
                }
                title={
                  <Space>
                    <Text
                      strong
                      style={{ fontSize: 14 }}
                    >
                      {booking.customerName}
                    </Text>
                    <Tag
                      color={getStatusColor(booking.status)}
                    >
                      {getStatusText(booking.status)}
                    </Tag>
                  </Space>
                }
                description={
                  <div>
                    <div style={{ marginBottom: 4 }}>
                      <Space>
                        <CarOutlined style={{ color: "#8c8c8c" }} />
                        <Text
                          type="secondary"
                          style={{ fontSize: 12 }}
                        >
                          {booking.vehicleInfo}
                        </Text>
                      </Space>
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      <Text
                        type="secondary"
                        style={{ fontSize: 12 }}
                      >
                        {booking.service}
                      </Text>
                    </div>
                    <div>
                      <Space>
                        <ClockCircleOutlined style={{ color: "#8c8c8c" }} />
                        <Text
                          type="secondary"
                          style={{ fontSize: 11 }}
                        >
                          {date} - {time}
                        </Text>
                      </Space>
                    </div>
                  </div>
                }
              />
            </List.Item>
          );
        }}
        locale={{
          emptyText: "Không có lịch đặt sắp tới",
        }}
      />
    </Card>
  );
};

export default UpcomingBookingsCard;
