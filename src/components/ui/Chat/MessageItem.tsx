"use client";
import React from "react";
import { Avatar, Typography, Space, Tooltip } from "antd";
import { UserOutlined, FileOutlined, PictureOutlined } from "@ant-design/icons";
import { Message } from "./types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const { Text, Paragraph } = Typography;

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isOwn,
  showAvatar = true,
}) => {
  const formatTime = (date: Date) => {
    return format(date, "HH:mm", { locale: vi });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case "text":
        return (
          <Paragraph
            style={{
              margin: 0,
              wordBreak: "break-word",
              whiteSpace: "pre-wrap",
            }}
          >
            {message.content}
          </Paragraph>
        );
      case "image":
        return (
          <div>
            <img
              src={message.fileUrl}
              alt={message.fileName || "Hình ảnh"}
              style={{
                maxWidth: "200px",
                maxHeight: "200px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
              onClick={() => window.open(message.fileUrl, "_blank")}
            />
            {message.content && (
              <Paragraph style={{ margin: "8px 0 0 0" }}>
                {message.content}
              </Paragraph>
            )}
          </div>
        );
      case "file":
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
              border: "1px solid #d9d9d9",
            }}
          >
            <FileOutlined style={{ fontSize: "20px", color: "#1890ff" }} />
            <div style={{ flex: 1 }}>
              <Text strong style={{ display: "block" }}>
                {message.fileName}
              </Text>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {message.fileSize && formatFileSize(message.fileSize)}
              </Text>
            </div>
            <a
              href={message.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#1890ff" }}
            >
              Tải xuống
            </a>
          </div>
        );
      default:
        return <Text>{message.content}</Text>;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isOwn ? "flex-end" : "flex-start",
        marginBottom: "12px",
        padding: "0 16px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: isOwn ? "row-reverse" : "row",
          alignItems: "flex-end",
          gap: "8px",
          maxWidth: "70%",
        }}
      >
        {showAvatar && !isOwn && (
          <Avatar
            size="small"
            icon={<UserOutlined />}
            src={message.senderType === "customer" ? undefined : undefined}
          />
        )}
        
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: isOwn ? "flex-end" : "flex-start",
          }}
        >
          <div
            style={{
              backgroundColor: isOwn ? "#1890ff" : "#f0f0f0",
              color: isOwn ? "#fff" : "#000",
              padding: "8px 12px",
              borderRadius: "12px",
              maxWidth: "100%",
              wordBreak: "break-word",
            }}
          >
            {renderMessageContent()}
          </div>
          
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              marginTop: "4px",
              fontSize: "11px",
              color: "#999",
            }}
          >
            <Text type="secondary" style={{ fontSize: "11px" }}>
              {formatTime(message.timestamp)}
            </Text>
            {isOwn && (
              <Text type="secondary" style={{ fontSize: "11px" }}>
                • {message.senderName}
              </Text>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
