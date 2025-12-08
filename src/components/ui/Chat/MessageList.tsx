"use client";
import React, { useEffect, useRef } from "react";
import { List, Empty, Spin } from "antd";
import { Message } from "./types";
import MessageItem from "./MessageItem";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  loading?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  loading = false,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Empty
          description="Chưa có tin nhắn nào"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "16px 0",
        minHeight: 0,
      }}
    >
      <List
        dataSource={messages}
        renderItem={(message, index) => {
          const isOwn = message.senderId === currentUserId;
          const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;
          
          return (
            <List.Item style={{ border: "none", padding: 0 }}>
              <MessageItem
                message={message}
                isOwn={isOwn}
                showAvatar={showAvatar}
              />
            </List.Item>
          );
        }}
      />
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
