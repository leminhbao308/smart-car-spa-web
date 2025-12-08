"use client";
import React, { useState, useEffect } from "react";
import {
  Typography,
  Space,
  Input,
  Select,
  message,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import {
  ChatWindow,
  ChatRoomList,
  ChatProvider,
  useChat,
  ChatRoom,
  ChatUser,
} from "@/components/ui/Chat";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

// Mock data - trong thực tế sẽ lấy từ API
const mockRooms: ChatRoom[] = [
  {
    id: "1",
    customerId: "customer1",
    customerName: "Nguyễn Văn A",
    customerAvatar: undefined,
    staffId: "staff1",
    staffName: "Nhân viên 1",
    lastMessage: {
      id: "msg1",
      content: "Xin chào, tôi cần hỗ trợ về dịch vụ",
      senderId: "customer1",
      senderName: "Nguyễn Văn A",
      senderType: "customer",
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      type: "text",
    },
    unreadCount: 2,
    status: "active",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: "2",
    customerId: "customer2",
    customerName: "Trần Thị B",
    customerAvatar: undefined,
    staffId: "staff2",
    staffName: "Nhân viên 2",
    lastMessage: {
      id: "msg2",
      content: "Cảm ơn bạn đã hỗ trợ!",
      senderId: "staff2",
      senderName: "Nhân viên 2",
      senderType: "staff",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      type: "text",
    },
    unreadCount: 0,
    status: "waiting",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "3",
    customerId: "customer3",
    customerName: "Lê Văn C",
    customerAvatar: undefined,
    lastMessage: {
      id: "msg3",
      content: "Tôi muốn đặt lịch hẹn",
      senderId: "customer3",
      senderName: "Lê Văn C",
      senderType: "customer",
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      type: "text",
    },
    unreadCount: 1,
    status: "waiting",
    createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60),
  },
];

// Mock messages data - sẽ được sử dụng trong ChatProvider

// Mock current user (staff)
const currentUser: ChatUser = {
  id: "staff1",
  name: "Nhân viên 1",
  type: "staff",
  isOnline: true,
};

const CustomerServiceContent: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading] = useState(false);

  const {
    rooms,
    currentRoom,
    messages,
    isConnected,
    typingUsers,
    setCurrentRoom,
    sendMessage,
    sendFile,
    updateRooms,
    markRoomAsRead,
  } = useChat();

  useEffect(() => {
    // Initialize with mock data
    updateRooms(mockRooms);
  }, [updateRooms]);

  const handleRoomSelect = (room: ChatRoom) => {
    setCurrentRoom(room);
    markRoomAsRead(room.id);
  };

  const handleSendMessage = (content: string, type: "text") => {
    sendMessage(content, type);
    message.success("Gửi tin nhắn thành công!");
  };

  const handleSendFile = (
    file: File,
    type: "image" | "file",
    content?: string
  ) => {
    sendFile(file, type, content);
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.customerName
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || room.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ height: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #f0f0f0",
          backgroundColor: "#fff",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Chăm sóc khách hàng
            </Title>
            <Text type="secondary">Hỗ trợ khách hàng qua chat realtime</Text>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
        {/* Sidebar - Room List */}
        <div
          style={{
            width: "350px",
            backgroundColor: "#fff",
            borderRight: "1px solid #f0f0f0",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
          }}
        >
          <div style={{ padding: "16px", borderBottom: "1px solid #f0f0f0", flexShrink: 0 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Search
                placeholder="Tìm kiếm khách hàng..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                prefix={<SearchOutlined />}
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: "100%" }}
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">Tất cả</Option>
                <Option value="active">Đang hoạt động</Option>
                <Option value="waiting">Chờ phản hồi</Option>
                <Option value="closed">Đã đóng</Option>
              </Select>
            </Space>
          </div>

          <div style={{ flex: 1, overflow: "hidden" }}>
            <ChatRoomList
              rooms={filteredRooms}
              selectedRoomId={currentRoom?.id}
              onRoomSelect={handleRoomSelect}
              loading={loading}
            />
          </div>
        </div>

        {/* Main Chat Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {currentRoom ? (
            <ChatWindow
              room={currentRoom}
              currentUser={currentUser}
              messages={messages}
              onSendMessage={handleSendMessage}
              onSendFile={handleSendFile}
              loading={loading}
              typingUsers={typingUsers}
            />
          ) : (
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#fafafa",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <Title level={4} type="secondary">
                  Chọn một cuộc trò chuyện để bắt đầu
                </Title>
                <Text type="secondary">
                  Chọn khách hàng từ danh sách bên trái để bắt đầu hỗ trợ
                </Text>
                <div style={{ marginTop: "16px" }}>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Trạng thái kết nối:{" "}
                    {isConnected ? "🟢 Đã kết nối" : "🔴 Mất kết nối"}
                  </Text>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CustomerServicePage: React.FC = () => {
  return (
    <ChatProvider initialUser={currentUser}>
      <CustomerServiceContent />
    </ChatProvider>
  );
};

export default CustomerServicePage;
