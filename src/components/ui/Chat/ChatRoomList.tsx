"use client";
import React from "react";
import { List, Avatar, Typography, Badge, Space, Tag } from "antd";
import { UserOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { ChatRoom } from "./types";
import { format, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const { Text, Paragraph } = Typography;

interface ChatRoomListProps {
  rooms: ChatRoom[];
  selectedRoomId?: string;
  onRoomSelect: (room: ChatRoom) => void;
  loading?: boolean;
}

const ChatRoomList: React.FC<ChatRoomListProps> = ({
  rooms,
  selectedRoomId,
  onRoomSelect,
  loading = false,
}) => {
  const getStatusColor = (status: ChatRoom["status"]) => {
    switch (status) {
      case "active":
        return "green";
      case "waiting":
        return "orange";
      case "closed":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusText = (status: ChatRoom["status"]) => {
    switch (status) {
      case "active":
        return "Đang hoạt động";
      case "waiting":
        return "Chờ phản hồi";
      case "closed":
        return "Đã đóng";
      default:
        return "Không xác định";
    }
  };

  const formatLastMessageTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return format(date, "HH:mm", { locale: vi });
    } else if (diffInHours < 168) { // 7 days
      return format(date, "EEEE", { locale: vi });
    } else {
      return format(date, "dd/MM/yyyy", { locale: vi });
    }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #f0f0f0",
          backgroundColor: "#fafafa",
          flexShrink: 0,
        }}
      >
        <Typography.Title level={5} style={{ margin: 0 }}>
          Cuộc trò chuyện
        </Typography.Title>
        <Text type="secondary" style={{ fontSize: "12px" }}>
          {rooms.length} cuộc trò chuyện
        </Text>
      </div>
      
      <div style={{ flex: 1, overflow: "auto" }}>
        <List
          loading={loading}
          dataSource={rooms}
          renderItem={(room) => (
          <List.Item
            style={{
              padding: "12px 16px",
              cursor: "pointer",
              backgroundColor: selectedRoomId === room.id ? "#e6f7ff" : "transparent",
              borderLeft: selectedRoomId === room.id ? "3px solid #1890ff" : "3px solid transparent",
            }}
            onClick={() => onRoomSelect(room)}
          >
            <List.Item.Meta
              avatar={
                <Badge
                  count={room.unreadCount}
                  size="small"
                  offset={[-5, 5]}
                  style={{ display: room.unreadCount > 0 ? "block" : "none" }}
                >
                  <Avatar
                    size="large"
                    icon={<UserOutlined />}
                    src={room.customerAvatar}
                  />
                </Badge>
              }
              title={
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Text strong style={{ fontSize: "14px" }}>
                    {room.customerName}
                  </Text>
                  <Space size="small">
                    <Tag
                      color={getStatusColor(room.status)}
                      size="small"
                    >
                      {getStatusText(room.status)}
                    </Tag>
                    <Text type="secondary" style={{ fontSize: "11px" }}>
                      {room.lastMessage && formatLastMessageTime(room.lastMessage.timestamp)}
                    </Text>
                  </Space>
                </div>
              }
              description={
                <div>
                  {room.lastMessage && (
                    <Paragraph
                      ellipsis={{ rows: 1 }}
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: room.unreadCount > 0 ? "#000" : "#666",
                        fontWeight: room.unreadCount > 0 ? 500 : 400,
                      }}
                    >
                      {room.lastMessage.type === "text" && room.lastMessage.content}
                      {room.lastMessage.type === "image" && "📷 Hình ảnh"}
                      {room.lastMessage.type === "file" && `📎 ${room.lastMessage.fileName}`}
                    </Paragraph>
                  )}
                  {!room.lastMessage && (
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Chưa có tin nhắn nào
                    </Text>
                  )}
                </div>
              }
            />
          </List.Item>
        )}
      />
      </div>
    </div>
  );
};

export default ChatRoomList;
