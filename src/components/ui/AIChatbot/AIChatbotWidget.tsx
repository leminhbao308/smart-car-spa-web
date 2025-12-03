"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Typography, Empty, App } from "antd";
import {
  MessageOutlined,
  CloseOutlined,
  MinusOutlined,
  CustomerServiceOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import AIChatbotMessage from "./AIChatbotMessage";
import AIChatbotInput from "./AIChatbotInput";
import QuickActions from "./QuickActions";
import { AIChatbotMessage as MessageType, QuickAction } from "./types";
import { AiAssistantService } from "@/lib/api/services/ai-assistant.service";
import { useAuth } from "@/lib/api/hooks/useAuth";
import { ChatMessage } from "@/lib/api/types/ai-assistant.types";
import {
  loadConversationHistory,
  saveConversationHistory,
  clearConversationHistory,
  getOrCreateSessionId,
  saveSessionId,
  clearSessionId,
  getDraftId,
  saveDraftId,
  clearDraftId,
  clearAllChatbotData,
} from "./utils/conversationStorage";

const { Title, Text } = Typography;

interface AIChatbotWidgetProps {
  position?: "bottom-right" | "bottom-left";
}

const AIChatbotWidget: React.FC<AIChatbotWidgetProps> = ({
  position = "bottom-right",
}) => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { message, modal } = App.useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  /**
   * Get welcome message with user's name
   */
  const getWelcomeMessage = (): MessageType => {
    return {
      id: "1",
      content: user?.full_name
        ? `Xin chào ${user.full_name}! 👋\n\nTôi là trợ lý đặt lịch thông minh của Smart Car Spa. Tôi sẽ giúp bạn đặt lịch hẹn chăm sóc xe một cách nhanh chóng và thuận tiện.\n\nHãy để tôi bắt đầu quy trình đặt lịch cho bạn nhé! 🚗✨`
        : "Xin chào! 👋\n\nTôi là trợ lý đặt lịch thông minh của Smart Car Spa. Tôi sẽ giúp bạn đặt lịch hẹn chăm sóc xe một cách nhanh chóng và thuận tiện.\n\nHãy để tôi bắt đầu quy trình đặt lịch cho bạn nhé! 🚗✨",
      sender: "assistant",
      timestamp: new Date(),
    };
  };

  // Initialize messages with welcome message or load from localStorage
  const getInitialMessages = (): MessageType[] => {
    const savedMessages = loadConversationHistory();

    // If we have saved messages, use them
    if (savedMessages.length > 0) {
      return savedMessages;
    }

    // Otherwise, return welcome message
    return [getWelcomeMessage()];
  };

  const [messages, setMessages] = useState<MessageType[]>(getInitialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  // Initialize session ID on mount
  useEffect(() => {
    const session = getOrCreateSessionId();
    setSessionId(session);
    
    // Load draft ID if exists
    const savedDraftId = getDraftId();
    if (savedDraftId) {
      setDraftId(savedDraftId);
    }
  }, []);

  // Quick actions
  const quickActions: QuickAction[] = [
    { id: "1", label: "Đặt lịch hẹn", action: "Tôi muốn đặt lịch hẹn" },
  ];

  // Auto scroll to bottom when new message arrives
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  // Save conversation history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveConversationHistory(messages);
    }
  }, [messages]);

  // Update welcome message when user changes (login/logout)
  // Only update if user's full_name changes and we have no conversation history
  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.full_name) {
      const savedMessages = loadConversationHistory();

      // Only update welcome message if:
      // 1. No saved messages (first time chat)
      // 2. Or first message is welcome message and user name might have changed
      if (savedMessages.length === 0) {
        const welcomeMsg: MessageType = {
          id: "1",
          content: `Xin chào ${user.full_name}! 👋\n\nTôi là trợ lý đặt lịch thông minh của Smart Car Spa. Tôi sẽ giúp bạn đặt lịch hẹn chăm sóc xe một cách nhanh chóng và thuận tiện.\n\nHãy để tôi bắt đầu quy trình đặt lịch cho bạn nhé! 🚗✨`,
          sender: "assistant",
          timestamp: new Date(),
        };
        setMessages([welcomeMsg]);
      } else {
        // Check if first message is welcome message and update it with user's name
        const firstMessage = savedMessages[0];
        if (firstMessage.id === "1" && firstMessage.sender === "assistant") {
          const welcomeMsg: MessageType = {
            id: "1",
            content: `Xin chào ${user.full_name}! 👋\n\nTôi là trợ lý đặt lịch thông minh của Smart Car Spa. Tôi sẽ giúp bạn đặt lịch hẹn chăm sóc xe một cách nhanh chóng và thuận tiện.\n\nHãy để tôi bắt đầu quy trình đặt lịch cho bạn nhé! 🚗✨`,
            sender: "assistant",
            timestamp: new Date(),
          };
          const updatedMessages = [welcomeMsg, ...savedMessages.slice(1)];
          setMessages(updatedMessages);
        }
      }
    }
  }, [user?.full_name, isAuthenticated, authLoading]);

  /**
   * Convert messages to conversation history format for API
   */
  const getConversationHistory = (): ChatMessage[] => {
    // Skip the first welcome message and convert to API format
    return messages
      .slice(1) // Skip welcome message
      .map((msg) => ({
        role: msg.sender as "user" | "assistant",
        content: msg.content,
      }));
  };

  const handleSendMessage = useCallback(async (content: string) => {
    // Ensure we have a session ID
    if (!sessionId) {
      const newSessionId = getOrCreateSessionId();
      setSessionId(newSessionId);
    }

    // Add user message
    const userMessage: MessageType = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date(),
    };

    setIsLoading(true);

    try {
      // Build conversation history BEFORE adding current user message
      // This ensures we don't include the current message in history
      const conversationHistory = getConversationHistory();
      
      // Add user message to state after building history
      setMessages((prev) => [...prev, userMessage]);

      // Call AI Assistant API
      // Note: customer_phone and customer_id are automatically extracted from JWT token by backend
      // No need to send them explicitly
      const response = await AiAssistantService.chat({
        message: content,
        conversation_history: conversationHistory,
        session_id: sessionId || getOrCreateSessionId(),
        draft_id: draftId || undefined,
      });

      // Save draft_id from response if present
      if (response.draft_id) {
        setDraftId(response.draft_id);
        saveDraftId(response.draft_id);
      }

      // Add assistant response
      const assistantMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        sender: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.log("Error sending message to AI:", error);
      const errorMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        content:
          error?.message ||
          "Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.",
        sender: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      message.error("Không thể kết nối với trợ lý AI. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, draftId, message]);

  // Auto-start booking process when chat is opened for the first time
  useEffect(() => {
    if (
      isOpen &&
      !isMinimized &&
      !hasAutoStarted &&
      isAuthenticated &&
      !authLoading &&
      messages.length === 1 &&
      messages[0].id === "1" &&
      messages[0].sender === "assistant"
    ) {
      // Only auto-start if we have welcome message only (no conversation history)
      setHasAutoStarted(true);
      
      // Send message immediately when chat is opened
      // This will trigger AI to call getCustomerVehicles() to load customer's vehicles
      // Use setTimeout with 0ms to ensure it runs after state updates
      setTimeout(() => {
        handleSendMessage("Tôi muốn đặt lịch hẹn");
      }, 0);
    }
  }, [isOpen, isMinimized, hasAutoStarted, isAuthenticated, authLoading, messages, handleSendMessage]);

  const handleQuickAction = (action: QuickAction) => {
    handleSendMessage(action.action);
  };

  const handleToggle = () => {
    // Check authentication when opening chat
    if (!isOpen) {
      // If auth is still loading, wait
      if (authLoading) {
        return;
      }

      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        message.warning("Vui lòng đăng nhập để sử dụng trợ lý AI");
        router.push("/auth/login");
        return;
      }

      // Reset auto-start flag when opening chat
      const savedMessages = loadConversationHistory();
      if (savedMessages.length === 0 || (savedMessages.length === 1 && savedMessages[0].id === "1")) {
        setHasAutoStarted(false);
      }
    }

    if (isOpen && isMinimized) {
      setIsMinimized(false);
    } else if (isOpen && !isMinimized) {
      setIsMinimized(true);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  /**
   * Handle close chat with confirmation
   * Clears draft, conversation history, and closes chat
   */
  const handleClose = async () => {
    modal.confirm({
      title: "Xác nhận đóng chat",
      content: "Bạn có chắc chắn muốn đóng chat? Tất cả lịch sử hội thoại và booking draft sẽ bị xóa.",
      okText: "Đóng",
      cancelText: "Hủy",
      okType: "danger",
      onOk: async () => {
        try {
          // Clear draft on backend
          if (draftId) {
            try {
              await AiAssistantService.clearDraft(draftId);
              console.log("Draft cleared successfully by draft_id");
            } catch (error) {
              console.log("Failed to clear draft by draft_id:", error);
              // Fallback to session_id if draft_id fails
              if (sessionId) {
                try {
                  await AiAssistantService.clearDraftBySession(sessionId);
                  console.log("Draft cleared successfully by session_id (fallback)");
                } catch (sessionError) {
                  console.log("Failed to clear draft by session_id:", sessionError);
                  // Continue anyway - backend might not have draft
                }
              }
            }
          } else if (sessionId) {
            // Clear bằng session_id nếu không có draft_id
            try {
              await AiAssistantService.clearDraftBySession(sessionId);
              console.log("Draft cleared successfully by session_id");
            } catch (error) {
              console.log("Failed to clear draft by session_id:", error);
              // Continue anyway - backend might not have draft
            }
          }

          // Clear all chatbot data (conversation, session, draft)
          clearAllChatbotData();
          
          // Reset state
          setMessages([getWelcomeMessage()]);
          setDraftId(null);
          setHasAutoStarted(false);
          
          // Close chat
          setIsOpen(false);
          setIsMinimized(false);
          
          message.success("Đã đóng chat và xóa lịch sử");
        } catch (error) {
          console.log("Error closing chat:", error);
          // Still clear local state and close even if API call fails
          clearAllChatbotData();
          setMessages([getWelcomeMessage()]);
          setDraftId(null);
          setHasAutoStarted(false);
          setIsOpen(false);
          setIsMinimized(false);
          message.success("Đã đóng chat");
        }
      },
    });
  };

  /**
   * Refresh conversation - clear history and reset to welcome message
   * Also clears draft on backend by calling API
   * This keeps the chat open (unlike handleClose)
   */
  const handleRefresh = async () => {
    try {
      // Option 1: Clear bằng draft_id (khuyến nghị)
      if (draftId) {
        try {
          await AiAssistantService.clearDraft(draftId);
          console.log("Draft cleared successfully by draft_id");
        } catch (error) {
          console.log("Failed to clear draft by draft_id:", error);
          // Fallback to session_id if draft_id fails
          if (sessionId) {
            try {
              await AiAssistantService.clearDraftBySession(sessionId);
              console.log("Draft cleared successfully by session_id (fallback)");
            } catch (sessionError) {
              console.log("Failed to clear draft by session_id:", sessionError);
              // Continue anyway - backend might not have draft
            }
          }
        }
      } else if (sessionId) {
        // Option 2: Clear bằng session_id nếu không có draft_id
        try {
          await AiAssistantService.clearDraftBySession(sessionId);
          console.log("Draft cleared successfully by session_id");
        } catch (error) {
          console.log("Failed to clear draft by session_id:", error);
          // Continue anyway - backend might not have draft
        }
      }

      // Clear all chatbot data (conversation, session, draft)
      clearAllChatbotData();
      
      // Reset state
      setMessages([getWelcomeMessage()]);
      setDraftId(null);
      setHasAutoStarted(false);
      
      // Create new session ID
      const newSessionId = getOrCreateSessionId();
      setSessionId(newSessionId);
      
      message.success("Đã xóa lịch sử hội thoại");
    } catch (error) {
      console.log("Error clearing chat:", error);
      // Still clear local state even if API call fails
      clearAllChatbotData();
      setMessages([getWelcomeMessage()]);
      setDraftId(null);
      setHasAutoStarted(false);
      const newSessionId = getOrCreateSessionId();
      setSessionId(newSessionId);
      message.success("Đã xóa lịch sử hội thoại");
    }
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
            styles={{
              body: {
                padding: 0,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              },
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
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
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
                {!isMinimized && messages.length > 1 && (
                  <Button
                    type="text"
                    icon={<ReloadOutlined />}
                    onClick={handleRefresh}
                    style={{ color: "#fff" }}
                    title="Làm mới cuộc trò chuyện"
                  />
                )}
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

                {/* Quick Actions - Only show if not auto-started yet */}
                {messages.length <= 1 && !hasAutoStarted && (
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
