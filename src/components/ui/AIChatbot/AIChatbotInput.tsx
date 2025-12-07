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
  const containerRef = useRef<HTMLDivElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (inputValue.trim() && !disabled) {
      const message = inputValue.trim();
      
      // Get current height before clearing to maintain layout
      const inputContainer = inputContainerRef.current;
      const textArea = textAreaRef.current?.resizableTextArea?.textArea;
      const currentHeight = inputContainer?.offsetHeight || 44;
      
      // Lock height temporarily to prevent jump
      if (inputContainer && textArea) {
        inputContainer.style.height = `${currentHeight}px`;
        inputContainer.style.overflow = "hidden";
      }
      
      // Send message and clear input
      onSendMessage(message);
      setInputValue("");
      
      // Reset height smoothly after a brief delay
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (textArea) {
            // Reset to auto height
            textArea.style.height = "auto";
            // Force reflow
            void textArea.offsetHeight;
          }
          
          // Unlock container height with smooth transition
          if (inputContainer) {
            inputContainer.style.transition = "height 0.2s ease";
            inputContainer.style.height = "auto";
            inputContainer.style.overflow = "";
            
            // Remove transition after animation completes
            setTimeout(() => {
              if (inputContainer) {
                inputContainer.style.transition = "";
              }
            }, 200);
          }
        });
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle mobile keyboard behavior - scroll to bottom when input is focused
  useEffect(() => {
    const handleFocus = () => {
      // Scroll to bottom when keyboard appears on mobile
      if (window.innerWidth <= 768) {
        setTimeout(() => {
          const messagesContainer = document.querySelector('.ai-chatbot-messages-container');
          if (messagesContainer) {
            // Smooth scroll to bottom
            messagesContainer.scrollTo({
              top: messagesContainer.scrollHeight,
              behavior: 'smooth'
            });
          }
        }, 300); // Wait for keyboard animation
      }
    };

    const textArea = textAreaRef.current?.resizableTextArea?.textArea;
    if (textArea) {
      textArea.addEventListener('focus', handleFocus);
      return () => {
        textArea.removeEventListener('focus', handleFocus);
      };
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="ai-chatbot-input"
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
      <div
        ref={inputContainerRef}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          backgroundColor: "#f5f5f5",
          borderRadius: "24px",
          padding: "8px 4px 8px 12px",
          minHeight: "44px",
          boxSizing: "border-box",
        }}
      >
        <div 
          style={{ 
            flex: 1, 
            minWidth: 0, 
            display: "flex", 
            alignItems: "center",
            justifyContent: "flex-start",
            minHeight: "28px",
            maxHeight: "100px",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <TextArea
            ref={textAreaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            autoSize={{ minRows: 1, maxRows: 4 }}
            variant="borderless"
            style={{
              resize: "none",
              backgroundColor: "transparent",
              fontSize: "14px",
              lineHeight: "20px",
              padding: "0",
              margin: "0",
              border: "none",
              outline: "none",
              boxShadow: "none",
              width: "100%",
            }}
            rows={1}
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
            minWidth: "36px",
            minHeight: "36px",
            maxWidth: "36px",
            maxHeight: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            padding: "0",
            margin: "0",
          }}
        />
      </div>
    </div>
  );
};

export default AIChatbotInput;

