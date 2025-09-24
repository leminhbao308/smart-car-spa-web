export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'staff';
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

export interface ChatRoom {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  staffId?: string;
  staffName?: string;
  lastMessage?: Message;
  unreadCount: number;
  status: 'active' | 'waiting' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  type: 'customer' | 'staff';
  isOnline: boolean;
  lastSeen?: Date;
}
