"use client";
import { useEffect, useRef, useState } from "react";
import { Message } from "./types";

interface UseChatSocketProps {
  roomId?: string;
  userId: string;
  onNewMessage?: (message: Message) => void;
  onTyping?: (userId: string, isTyping: boolean) => void;
}

interface UseChatSocketReturn {
  isConnected: boolean;
  sendMessage: (content: string, type: "text") => void;
  sendFile: (file: File, type: "image" | "file", content?: string) => void;
  sendTyping: (isTyping: boolean) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
}

// Mock WebSocket implementation
// In a real application, you would use Socket.io or native WebSocket
const useChatSocket = ({
  roomId,
  userId,
  onNewMessage,
  onTyping,
}: UseChatSocketProps): UseChatSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mock connection - in real app, connect to actual WebSocket server
  useEffect(() => {
    // Simulate connection
    const connect = () => {
      setIsConnected(true);
    };

    connect();

    return () => {
      setIsConnected(false);
    };
  }, []);

  const sendMessage = (content: string, type: "text") => {
    if (!isConnected || !roomId) return;

    const message: Message = {
      id: `msg_${Date.now()}_${Math.random()}`,
      content,
      senderId: userId,
      senderName: "Current User", // This should come from user context
      senderType: "staff",
      timestamp: new Date(),
      type,
    };

    // In real app, send via WebSocket

    // Simulate receiving the message back (echo)
    setTimeout(() => {
      onNewMessage?.(message);
    }, 100);
  };

  const sendFile = (file: File, type: "image" | "file", content?: string) => {
    if (!isConnected || !roomId) return;

    // In real app, upload file to server first, then send message with file URL
    const fileUrl = URL.createObjectURL(file); // Mock file URL

    const message: Message = {
      id: `msg_${Date.now()}_${Math.random()}`,
      content: content || "",
      senderId: userId,
      senderName: "Current User",
      senderType: "staff",
      timestamp: new Date(),
      type,
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
    };

    // Simulate receiving the message back
    setTimeout(() => {
      onNewMessage?.(message);
    }, 100);
  };

  const sendTyping = (isTyping: boolean) => {
    if (!isConnected || !roomId) return;

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing status
    onTyping?.(userId, isTyping);

    // Auto-stop typing after 3 seconds
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(false);
      }, 3000);
    }
  };

  const joinRoom = (newRoomId: string) => {
    if (!isConnected) return;

    // In real app, emit 'join-room' event
  };

  const leaveRoom = (roomIdToLeave: string) => {
    if (!isConnected) return;
    // In real app, emit 'leave-room' event
  };

  return {
    isConnected,
    sendMessage,
    sendFile,
    sendTyping,
    joinRoom,
    leaveRoom,
  };
};

export default useChatSocket;
