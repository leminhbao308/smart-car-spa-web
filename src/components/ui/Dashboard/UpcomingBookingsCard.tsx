"use client";
import React from "react";
import { Card, List, Avatar, Typography, Tag, Space, Button } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CarOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

interface UpcomingBooking {
  id: number;
  customerName: string;
  service: string;
  time: string;
  date: string;
  status: string;
  vehicle: string;
}

interface UpcomingBookingsCardProps {
  bookings: UpcomingBooking[];
  title?: string;
}

const UpcomingBookingsCard: React.FC<UpcomingBookingsCardProps> = ({
  bookings,
  title = "Lịch đặt sắp tới",
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
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
    switch (status) {
      case "confirmed":
        return "Đã xác nhận";
      case "pending":
        return "Chờ xác nhận";
      case "in_progress":
        return "Đang thực hiện";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  return (
    <Card
      title={<Title level={4} style={{ margin: 0 }}>{title}</Title>}
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
        <Button type="link" size="small">
          Xem tất cả
        </Button>
      }
    >
      <List
        dataSource={bookings}
        renderItem={(booking) => (
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
                  <Text strong style={{ fontSize: 14 }}>
                    {booking.customerName}
                  </Text>
                  <Tag color={getStatusColor(booking.status)} size="small">
                    {getStatusText(booking.status)}
                  </Tag>
                </Space>
              }
              description={
                <div>
                  <div style={{ marginBottom: 4 }}>
                    <Space>
                      <CarOutlined style={{ color: "#8c8c8c" }} />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {booking.vehicle}
                      </Text>
                    </Space>
                  </div>
                  <div style={{ marginBottom: 4 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {booking.service}
                    </Text>
                  </div>
                  <div>
                    <Space>
                      <ClockCircleOutlined style={{ color: "#8c8c8c" }} />
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {booking.date} - {booking.time}
                      </Text>
                    </Space>
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default UpcomingBookingsCard;
