"use client";
import React, { useState, useRef, useEffect } from "react";
import { Input, Button, Space } from "antd";
import { SendOutlined, SmileOutlined } from "@ant-design/icons";

const { TextArea } = Input;

interface AIChatbotInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const AIChatbotInput: React.FC<AIChatbotInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Nhập câu hỏi của bạn...",
}) => {
  const [inputValue, setInputValue] = useState("");
  const textAreaRef = useRef<any>(null);

  const handleSend = () => {
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue.trim());
      setInputValue("");
      // Reset textarea height
      if (textAreaRef.current?.resizableTextArea?.textArea) {
        textAreaRef.current.resizableTextArea.textArea.style.height = "auto";
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        borderTop: "1px solid #f0f0f0",
        padding: "12px 16px",
        backgroundColor: "#fff",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "8px",
          backgroundColor: "#f5f5f5",
          borderRadius: "24px",
          padding: "4px 4px 4px 12px",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <TextArea
            ref={textAreaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            autoSize={{ minRows: 1, maxRows: 4 }}
            bordered={false}
            style={{
              resize: "none",
              backgroundColor: "transparent",
              fontSize: "14px",
            }}
          />
        </div>

        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          disabled={!inputValue.trim() || disabled}
          shape="circle"
          size="large"
          style={{
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        />
      </div>
    </div>
  );
};

export default AIChatbotInput;

