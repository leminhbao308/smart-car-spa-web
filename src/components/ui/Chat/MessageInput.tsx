"use client";
import React, { useState, useRef } from "react";
import { Input, Button, Upload, Space, message, Tooltip } from "antd";
import {
  SendOutlined,
  PaperClipOutlined,
  PictureOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import type { UploadProps, UploadFile } from "antd";

const { TextArea } = Input;

interface MessageInputProps {
  onSendMessage: (content: string, type: "text") => void;
  onSendFile: (file: File, type: "image" | "file", content?: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onSendFile,
  disabled = false,
  placeholder = "Nhập tin nhắn...",
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue.trim(), "text");
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (file: File, type: "image" | "file") => {
    const maxSize = type === "image" ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB for images, 10MB for files
    const allowedImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    
    if (file.size > maxSize) {
      message.error(`File quá lớn. Kích thước tối đa: ${type === "image" ? "5MB" : "10MB"}`);
      return;
    }

    if (type === "image" && !allowedImageTypes.includes(file.type)) {
      message.error("Chỉ hỗ trợ file hình ảnh: JPG, PNG, GIF, WebP");
      return;
    }

    setIsUploading(true);
    
    // Simulate file upload - in real app, you would upload to server
    setTimeout(() => {
      onSendFile(file, type, inputValue.trim() || undefined);
      setInputValue("");
      setIsUploading(false);
      message.success("Gửi file thành công!");
    }, 1000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, "file");
    }
    e.target.value = ""; // Reset input
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, "image");
    }
    e.target.value = ""; // Reset input
  };

  return (
    <div
      className="message-input-container"
      style={{
        borderTop: "1px solid #f0f0f0",
        padding: "12px 16px",
        backgroundColor: "#fff",
        flexShrink: 0,
        position: "sticky",
        bottom: 0,
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <TextArea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || isUploading}
            autoSize={{ minRows: 1, maxRows: 4 }}
            style={{
              resize: "none",
              border: "1px solid #d9d9d9",
              borderRadius: "20px",
              padding: "8px 12px",
            }}
          />
        </div>
        
        <Space>
          <Tooltip title="Gửi hình ảnh">
            <Button
              type="text"
              icon={<PictureOutlined />}
              onClick={() => imageInputRef.current?.click()}
              disabled={disabled || isUploading}
              style={{ color: "#1890ff" }}
            />
          </Tooltip>
          
          <Tooltip title="Gửi file">
            <Button
              type="text"
              icon={<PaperClipOutlined />}
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
              style={{ color: "#1890ff" }}
            />
          </Tooltip>
          
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            disabled={!inputValue.trim() || disabled || isUploading}
            loading={isUploading}
            style={{ borderRadius: "20px" }}
          >
            Gửi
          </Button>
        </Space>
      </div>
      
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: "none" }}
        onChange={handleFileSelect}
        accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx"
      />
      <input
        ref={imageInputRef}
        type="file"
        style={{ display: "none" }}
        onChange={handleImageSelect}
        accept="image/*"
      />
    </div>
  );
};

export default MessageInput;
