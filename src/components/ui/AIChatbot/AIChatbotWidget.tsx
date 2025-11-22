"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button, Card, Typography, Empty } from "antd";
import {
  MessageOutlined,
  CloseOutlined,
  MinusOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";
import AIChatbotMessage from "./AIChatbotMessage";
import AIChatbotInput from "./AIChatbotInput";
import QuickActions from "./QuickActions";
import { AIChatbotMessage as MessageType, QuickAction } from "./types";

const { Title, Text } = Typography;

interface AIChatbotWidgetProps {
  position?: "bottom-right" | "bottom-left";
}

const AIChatbotWidget: React.FC<AIChatbotWidgetProps> = ({
  position = "bottom-right",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: "1",
      content:
        "Xin chào Lê Hoàng Nam! Tôi là trợ lý thông minh của trung tâm chăm sóc xe. Tôi có thể giúp bạn đặt lịch hẹn, tìm hiểu về dịch vụ, và trả lời các câu hỏi của bạn. Bạn cần hỗ trợ gì hôm nay?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  // Quick actions
  const quickActions: QuickAction[] = [
    { id: "1", label: "Đặt lịch hẹn", action: "Tôi muốn đặt lịch hẹn" },
    { id: "2", label: "Xem dịch vụ", action: "Bạn có những dịch vụ gì?" },
    { id: "3", label: "Giờ làm việc", action: "Trung tâm làm việc giờ nào?" },
    { id: "4", label: "Giá cả", action: "Bảng giá dịch vụ như thế nào?" },
  ];

  // Auto scroll to bottom when new message arrives
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  // Mock response function (will be replaced with API call later)
  const getMockResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes("đặt lịch") || lowerMessage.includes("đặt hẹn")) {
      return "Tôi có thể giúp bạn đặt lịch hẹn. Bạn muốn đặt lịch cho dịch vụ gì và vào thời gian nào? Ví dụ: 'Đặt lịch rửa xe vào sáng mai' hoặc 'Tôi muốn đặt lịch ceramic vào ngày 25/11'.";
    }

    if (lowerMessage.includes("dịch vụ") || lowerMessage.includes("service")) {
      return "Chúng tôi cung cấp nhiều dịch vụ chăm sóc xe như:\n• Rửa xe (30 phút)\n• Đánh bóng (60 phút)\n• Phủ Ceramic (240 phút)\n• Bảo dưỡng định kỳ\n• Sửa chữa\n\nBạn quan tâm đến dịch vụ nào?";
    }

    if (lowerMessage.includes("giờ") || lowerMessage.includes("thời gian")) {
      return "Trung tâm làm việc từ 8:00 - 18:00 hàng ngày, từ thứ 2 đến chủ nhật. Bạn muốn đặt lịch vào khung giờ nào?";
    }

    if (lowerMessage.includes("giá") || lowerMessage.includes("price") || lowerMessage.includes("cost")) {
      return "Giá dịch vụ của chúng tôi rất cạnh tranh:\n• Rửa xe: Từ 50.000đ\n• Đánh bóng: Từ 200.000đ\n• Phủ Ceramic: Từ 2.000.000đ\n\nBạn có thể xem chi tiết bảng giá trên website hoặc tôi có thể tư vấn cụ thể hơn nếu bạn cho biết loại xe của bạn.";
    }

    if (lowerMessage.includes("cảm ơn") || lowerMessage.includes("thanks")) {
      return "Không có gì! Rất vui được hỗ trợ bạn. Nếu bạn cần thêm thông tin gì, cứ hỏi tôi nhé! 😊";
    }

    // Default response
    return "Cảm ơn bạn đã liên hệ! Tôi hiểu bạn đang hỏi về: \"" + userMessage + "\". Để tôi có thể hỗ trợ tốt hơn, bạn có thể:\n• Đặt lịch hẹn\n• Tìm hiểu về dịch vụ\n• Xem giờ làm việc\n• Hỏi về giá cả\n\nBạn muốn tìm hiểu điều gì?";
  };

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: MessageType = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const assistantMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        content: getMockResponse(content),
        sender: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000 + Math.random() * 1000); // Random delay 1-2 seconds
  };

  const handleQuickAction = (action: QuickAction) => {
    handleSendMessage(action.action);
  };

  const handleToggle = () => {
    if (isOpen && isMinimized) {
      setIsMinimized(false);
    } else if (isOpen && !isMinimized) {
      setIsMinimized(true);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const positionStyles =
    position === "bottom-right"
      ? { bottom: "20px", right: "20px" }
      : { bottom: "20px", left: "20px" };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<MessageOutlined />}
          onClick={handleToggle}
          style={{
            position: "fixed",
            ...positionStyles,
            width: "60px",
            height: "60px",
            zIndex: 1000,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            fontSize: "24px",
          }}
        />
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={chatWindowRef}
          style={{
            position: "fixed",
            ...positionStyles,
            width: isMinimized ? "320px" : "380px",
            height: isMinimized ? "60px" : "600px",
            maxHeight: "calc(100vh - 40px)",
            zIndex: 1000,
            transition: "all 0.3s ease",
          }}
        >
          <Card
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              padding: 0,
              borderRadius: "16px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
              overflow: "hidden",
            }}
            bodyStyle={{
              padding: 0,
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #f0f0f0",
                backgroundColor: "#1890ff",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <CustomerServiceOutlined style={{ fontSize: "20px" }} />
                <div>
                  <Title
                    level={5}
                    style={{
                      margin: 0,
                      color: "#fff",
                      fontSize: "16px",
                      fontWeight: 600,
                    }}
                  >
                    Trợ Lý Thông Minh
                  </Title>
                  <Text
                    style={{
                      color: "rgba(255, 255, 255, 0.85)",
                      fontSize: "12px",
                    }}
                  >
                    {isMinimized ? "Nhấn để mở rộng" : "Sẵn sàng hỗ trợ"}
                  </Text>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <Button
                  type="text"
                  icon={<MinusOutlined />}
                  onClick={() => setIsMinimized(!isMinimized)}
                  style={{ color: "#fff" }}
                />
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={handleClose}
                  style={{ color: "#fff" }}
                />
              </div>
            </div>

            {/* Messages Area */}
            {!isMinimized && (
              <>
                <div
                  className="ai-chatbot-messages-container"
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    overflowX: "hidden",
                    padding: "16px 0",
                    backgroundColor: "#fafafa",
                  }}
                >
                  {messages.length === 0 ? (
                    <Empty
                      description="Chưa có tin nhắn nào"
                      style={{ marginTop: "40px" }}
                    />
                  ) : (
                    <>
                      {messages.map((message) => (
                        <AIChatbotMessage key={message.id} message={message} />
                      ))}
                      {isLoading && (
                        <AIChatbotMessage
                          message={{
                            id: "loading",
                            content: "",
                            sender: "assistant",
                            timestamp: new Date(),
                            isLoading: true,
                          }}
                        />
                      )}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Quick Actions */}
                {messages.length <= 1 && (
                  <QuickActions
                    actions={quickActions}
                    onActionClick={handleQuickAction}
                    disabled={isLoading}
                  />
                )}

                {/* Input */}
                <AIChatbotInput
                  onSendMessage={handleSendMessage}
                  disabled={isLoading}
                  placeholder="Nhập câu hỏi của bạn..."
                />
              </>
            )}
          </Card>
        </div>
      )}
    </>
  );
};

export default AIChatbotWidget;

