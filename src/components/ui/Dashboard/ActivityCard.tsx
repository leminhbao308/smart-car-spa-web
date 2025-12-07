"use client";
import React from "react";
import { Card, List, Avatar, Typography, Tag, Space } from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  ToolOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { RecentActivity } from "@/lib/api";

const { Text, Title } = Typography;

interface ActivityCardProps {
  activities: RecentActivity[];
  title?: string;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  activities,
  title = "Hoạt động gần đây",
}) => {
  const getActivityIcon = (type: string) => {
    const typeUpper = type.toUpperCase();
    switch (typeUpper) {
      case "BOOKING":
        return <CalendarOutlined style={{ color: "#1890ff" }} />;
      case "CUSTOMER":
        return <UserOutlined style={{ color: "#52c41a" }} />;
      case "SERVICE":
        return <ToolOutlined style={{ color: "#722ed1" }} />;
      case "PAYMENT":
        return <DollarOutlined style={{ color: "#fa8c16" }} />;
      default:
        return <InfoCircleOutlined style={{ color: "#8c8c8c" }} />;
    }
  };

  const getStatusIcon = (status: string) => {
    const statusUpper = status.toUpperCase();
    switch (statusUpper) {
      case "PENDING":
        return <ExclamationCircleOutlined style={{ color: "#faad14" }} />;
      case "CONFIRMED":
        return <CheckCircleOutlined style={{ color: "#1890ff" }} />;
      case "CHECKED_IN":
        return <InfoCircleOutlined style={{ color: "#722ed1" }} />;
      case "IN_PROGRESS":
        return <InfoCircleOutlined style={{ color: "#fa8c16" }} />;
      case "COMPLETED":
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case "CANCELLED":
        return <CloseCircleOutlined style={{ color: "#ff4d4f" }} />;
      case "NO_SHOW":
        return <CloseCircleOutlined style={{ color: "#8c8c8c" }} />;
      default:
        return <InfoCircleOutlined style={{ color: "#8c8c8c" }} />;
    }
  };

  const getStatusColor = (status: string) => {
    const statusUpper = status.toUpperCase();
    switch (statusUpper) {
      case "PENDING":
        return "orange";
      case "CONFIRMED":
        return "blue";
      case "CHECKED_IN":
        return "purple";
      case "IN_PROGRESS":
        return "cyan";
      case "COMPLETED":
        return "green";
      case "CANCELLED":
        return "red";
      case "NO_SHOW":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    const statusUpper = status.toUpperCase();
    switch (statusUpper) {
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
      case "NO_SHOW":
        return "Không đến";
      default:
        return status;
    }
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
    >
      <List
        dataSource={activities}
        renderItem={(activity) => (
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
                    backgroundColor: "#f0f0f0",
                    border: "2px solid #fff",
                  }}
                  icon={getActivityIcon(activity.type)}
                />
              }
              title={
                <Space>
                  <Text
                    strong
                    style={{ fontSize: 14 }}
                  >
                    {activity.description}
                  </Text>
                  <Tag color={getStatusColor(activity.status)}>
                    {getStatusIcon(activity.status)}{" "}
                    {getStatusText(activity.status)}
                  </Tag>
                </Space>
              }
              description={
                <div>
                  <Text
                    type="secondary"
                    style={{ fontSize: 12 }}
                  >
                    {formatDateTime(activity.timestamp)}
                  </Text>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default ActivityCard;
