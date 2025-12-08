"use client";
import React from "react";
import { Typography, Space } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface TypingIndicatorProps {
  typingUsers: string[];
  currentUserId: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingUsers,
  currentUserId,
}) => {
  const otherTypingUsers = typingUsers.filter(userId => userId !== currentUserId);

  if (otherTypingUsers.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (otherTypingUsers.length === 1) {
      return "đang nhập...";
    } else if (otherTypingUsers.length === 2) {
      return "đang nhập...";
    } else {
      return `${otherTypingUsers.length} người đang nhập...`;
    }
  };

  return (
    <div
      style={{
        padding: "8px 16px",
        backgroundColor: "#f5f5f5",
        borderTop: "1px solid #f0f0f0",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <UserOutlined style={{ fontSize: "12px", color: "#999" }} />
      <Text type="secondary" style={{ fontSize: "12px" }}>
        {getTypingText()}
      </Text>
      <div
        style={{
          display: "flex",
          gap: "2px",
          marginLeft: "4px",
        }}
      >
        <div
          style={{
            width: "4px",
            height: "4px",
            backgroundColor: "#999",
            borderRadius: "50%",
            animation: "typing 1.4s infinite ease-in-out",
            animationDelay: "0s",
          }}
        />
        <div
          style={{
            width: "4px",
            height: "4px",
            backgroundColor: "#999",
            borderRadius: "50%",
            animation: "typing 1.4s infinite ease-in-out",
            animationDelay: "0.2s",
          }}
        />
        <div
          style={{
            width: "4px",
            height: "4px",
            backgroundColor: "#999",
            borderRadius: "50%",
            animation: "typing 1.4s infinite ease-in-out",
            animationDelay: "0.4s",
          }}
        />
      </div>
      
      <style jsx>{`
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default TypingIndicator;
