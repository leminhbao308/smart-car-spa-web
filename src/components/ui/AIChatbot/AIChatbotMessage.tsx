"use client";
import React from "react";
import { Avatar, Typography, Spin } from "antd";
import { UserOutlined, RobotOutlined } from "@ant-design/icons";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { AIChatbotMessage as MessageType } from "./types";

const { Paragraph, Text } = Typography;

interface AIChatbotMessageProps {
  message: MessageType;
}

const AIChatbotMessage: React.FC<AIChatbotMessageProps> = ({ message }) => {
  const formatTime = (date: Date) => {
    return format(date, "HH:mm", { locale: vi });
  };

  const isUser = message.sender === "user";

  return (
    <div
      className="ai-chatbot-message"
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: "16px",
        padding: "0 16px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: isUser ? "row-reverse" : "row",
          alignItems: "flex-end",
          gap: "8px",
          maxWidth: "75%",
        }}
      >
        {/* Avatar */}
        <Avatar
          size={32}
          icon={isUser ? <UserOutlined /> : <RobotOutlined />}
          style={{
            backgroundColor: isUser ? "#1890ff" : "#52c41a",
            flexShrink: 0,
          }}
        />

        {/* Message Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: isUser ? "flex-end" : "flex-start",
            gap: "4px",
          }}
        >
          <div
            style={{
              backgroundColor: isUser ? "#1890ff" : "#f0f0f0",
              color: isUser ? "#fff" : "#000",
              padding: "10px 14px",
              borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              maxWidth: "100%",
              wordBreak: "break-word",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
            }}
          >
            {message.isLoading ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Spin size="small" />
                <Text style={{ color: isUser ? "#fff" : "#000", fontSize: "14px" }}>
                  Đang soạn tin nhắn...
                </Text>
              </div>
            ) : (
              <Paragraph
                style={{
                  margin: 0,
                  wordBreak: "break-word",
                  whiteSpace: "pre-wrap",
                  color: isUser ? "#fff" : "#000",
                  fontSize: "14px",
                  lineHeight: "1.5",
                }}
              >
                {message.content}
              </Paragraph>
            )}
          </div>

          {/* Timestamp */}
          <Text
            type="secondary"
            style={{
              fontSize: "11px",
              padding: "0 4px",
            }}
          >
            {formatTime(message.timestamp)}
          </Text>
        </div>
      </div>
    </div>
  );
};

export default AIChatbotMessage;

