"use client";
import React, { useState, useEffect } from "react";
import { Card, Avatar, Typography, Space, Badge, Button, Dropdown, Menu } from "antd";
import {
  UserOutlined,
  MoreOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { Message, ChatRoom, ChatUser } from "./types";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import CustomerInfoModal from "./CustomerInfoModal";

const { Title, Text } = Typography;

interface ChatWindowProps {
  room: ChatRoom;
  currentUser: ChatUser;
  messages: Message[];
  onSendMessage: (content: string, type: "text") => void;
  onSendFile: (file: File, type: "image" | "file", content?: string) => void;
  loading?: boolean;
  typingUsers?: string[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  room,
  currentUser,
  messages,
  onSendMessage,
  onSendFile,
  loading = false,
  typingUsers = [],
}) => {
  const [isTyping, setIsTyping] = useState(false);
  const [showCustomerInfoModal, setShowCustomerInfoModal] = useState(false);

  const handleMenuClick = (key: string) => {
    switch (key) {
      case "info":
        setShowCustomerInfoModal(true);
        break;
      default:
        break;
    }
  };

  // Mock customer info - trong thực tế sẽ lấy từ API
  const customerInfo = {
    name: room.customerName,
    phone: "0123 456 789", // Mock data
    email: "customer@example.com", // Mock data
    address: "123 Đường ABC, Quận 1, TP.HCM", // Mock data
    joinDate: "15/01/2024", // Mock data
    avatar: room.customerAvatar,
  };

  const menu = (
    <Menu onClick={({ key }) => handleMenuClick(key)}>
      <Menu.Item key="info" icon={<InfoCircleOutlined />}>
        Thông tin khách hàng
      </Menu.Item>
    </Menu>
  );

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid #f0f0f0",
      }}
    >
      {/* Chat Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #f0f0f0",
          backgroundColor: "#fafafa",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Badge
            dot={room.status === "active"}
            color={room.status === "active" ? "#52c41a" : "#d9d9d9"}
          >
            <Avatar
              size="large"
              icon={<UserOutlined />}
              src={room.customerAvatar}
            />
          </Badge>
          <div>
            <Title level={5} style={{ margin: 0, fontSize: "16px" }}>
              {room.customerName}
            </Title>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {room.status === "active" ? "Đang hoạt động" : "Chờ phản hồi"}
            </Text>
          </div>
        </div>
        
        <Dropdown overlay={menu} trigger={["click"]}>
          <Button
            type="text"
            icon={<MoreOutlined />}
            size="small"
          />
        </Dropdown>
      </div>

      {/* Messages Area */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <MessageList
          messages={messages}
          currentUserId={currentUser.id}
          loading={loading}
        />
      </div>

      {/* Typing Indicator */}
      <TypingIndicator
        typingUsers={typingUsers}
        currentUserId={currentUser.id}
      />

      {/* Message Input */}
      <MessageInput
        onSendMessage={onSendMessage}
        onSendFile={onSendFile}
        disabled={room.status !== "active"}
        placeholder={
          room.status === "active"
            ? "Nhập tin nhắn..."
            : "Cuộc trò chuyện đã đóng"
        }
      />

      {/* Customer Info Modal */}
      <CustomerInfoModal
        open={showCustomerInfoModal}
        onClose={() => setShowCustomerInfoModal(false)}
        customerInfo={customerInfo}
      />
    </div>
  );
};

export default ChatWindow;
