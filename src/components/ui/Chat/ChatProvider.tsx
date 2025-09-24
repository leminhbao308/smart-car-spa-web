"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Message, ChatRoom, ChatUser } from "./types";
import useChatSocket from "./useChatSocket";

interface ChatContextType {
  // State
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  messages: Message[];
  currentUser: ChatUser | null;
  isConnected: boolean;
  typingUsers: string[];
  
  // Actions
  setCurrentRoom: (room: ChatRoom | null) => void;
  sendMessage: (content: string, type: "text") => void;
  sendFile: (file: File, type: "image" | "file", content?: string) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  updateRooms: (rooms: ChatRoom[]) => void;
  addMessage: (message: Message) => void;
  markRoomAsRead: (roomId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
  initialRooms?: ChatRoom[];
  initialUser?: ChatUser;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({
  children,
  initialRooms = [],
  initialUser = null,
}) => {
  const [rooms, setRooms] = useState<ChatRoom[]>(initialRooms);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser] = useState<ChatUser | null>(initialUser);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const {
    isConnected,
    sendMessage: socketSendMessage,
    sendFile: socketSendFile,
    sendTyping,
    joinRoom: socketJoinRoom,
    leaveRoom: socketLeaveRoom,
  } = useChatSocket({
    roomId: currentRoom?.id,
    userId: currentUser?.id || "",
    onNewMessage: (message) => {
      setMessages(prev => [...prev, message]);
      
      // Update room's last message
      setRooms(prevRooms =>
        prevRooms.map(room =>
          room.id === currentRoom?.id
            ? {
                ...room,
                lastMessage: message,
                updatedAt: new Date(),
                unreadCount: message.senderId !== currentUser?.id 
                  ? room.unreadCount + 1 
                  : room.unreadCount,
              }
            : room
        )
      );
    },
    onTyping: (userId, isTyping) => {
      setTypingUsers(prev => {
        if (isTyping) {
          return prev.includes(userId) ? prev : [...prev, userId];
        } else {
          return prev.filter(id => id !== userId);
        }
      });
    },
  });

  const handleSendMessage = (content: string, type: "text") => {
    if (!currentRoom || !currentUser) return;
    
    socketSendMessage(content, type);
    sendTyping(false); // Stop typing indicator
  };

  const handleSendFile = (file: File, type: "image" | "file", content?: string) => {
    if (!currentRoom || !currentUser) return;
    
    socketSendFile(file, type, content);
  };

  const handleJoinRoom = (roomId: string) => {
    socketJoinRoom(roomId);
  };

  const handleLeaveRoom = (roomId: string) => {
    socketLeaveRoom(roomId);
  };

  const updateRooms = (newRooms: ChatRoom[]) => {
    setRooms(newRooms);
  };

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const markRoomAsRead = (roomId: string) => {
    setRooms(prevRooms =>
      prevRooms.map(room =>
        room.id === roomId ? { ...room, unreadCount: 0 } : room
      )
    );
  };

  // Update messages when room changes
  useEffect(() => {
    if (currentRoom) {
      // In real app, fetch messages for the room
      setMessages([]);
      handleJoinRoom(currentRoom.id);
    } else {
      setMessages([]);
    }

    return () => {
      if (currentRoom) {
        handleLeaveRoom(currentRoom.id);
      }
    };
  }, [currentRoom]);

  const contextValue: ChatContextType = {
    rooms,
    currentRoom,
    messages,
    currentUser,
    isConnected,
    typingUsers,
    setCurrentRoom,
    sendMessage: handleSendMessage,
    sendFile: handleSendFile,
    joinRoom: handleJoinRoom,
    leaveRoom: handleLeaveRoom,
    updateRooms,
    addMessage,
    markRoomAsRead,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
