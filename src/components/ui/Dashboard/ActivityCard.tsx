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
import { RecentActivity } from "@/components/utils/data/dashboard.data";
import formatCurrency from "@/components/utils/helper/currency.format.helper";

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
    switch (type) {
      case "booking":
        return <CalendarOutlined style={{ color: "#1890ff" }} />;
      case "customer":
        return <UserOutlined style={{ color: "#52c41a" }} />;
      case "service":
        return <ToolOutlined style={{ color: "#722ed1" }} />;
      case "payment":
        return <DollarOutlined style={{ color: "#fa8c16" }} />;
      default:
        return <InfoCircleOutlined style={{ color: "#8c8c8c" }} />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case "warning":
        return <ExclamationCircleOutlined style={{ color: "#faad14" }} />;
      case "error":
        return <CloseCircleOutlined style={{ color: "#ff4d4f" }} />;
      case "info":
        return <InfoCircleOutlined style={{ color: "#1890ff" }} />;
      default:
        return <InfoCircleOutlined style={{ color: "#8c8c8c" }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "green";
      case "warning":
        return "orange";
      case "error":
        return "red";
      case "info":
        return "blue";
      default:
        return "default";
    }
  };

  return (
    <Card
      title={
        <Title level={4} style={{ margin: 0 }}>
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
                  <Text strong style={{ fontSize: 14 }}>
                    {activity.title}
                  </Text>
                  <Tag color={getStatusColor(activity.status)}>
                    {getStatusIcon(activity.status)}
                  </Tag>
                </Space>
              }
              description={
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {activity.description}
                  </Text>
                  <div style={{ marginTop: 4 }}>
                    <Space>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {activity.time}
                      </Text>
                      {activity.user && (
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          • {activity.user}
                        </Text>
                      )}
                      {activity.amount && (
                        <Text
                          strong
                          style={{
                            fontSize: 11,
                            color: "#52c41a",
                          }}
                        >
                          {formatCurrency(activity.amount)}
                        </Text>
                      )}
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

export default ActivityCard;
