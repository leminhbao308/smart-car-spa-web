/**
 * WebSocket Provider
 * 
 * MỤC ĐÍCH:
 * - Quản lý WebSocket connection lifecycle dựa trên authentication status
 * - Connect khi user đăng nhập, disconnect khi user logout
 * - Wrap app để WebSocket connection available globally
 * 
 * LÝ DO PROVIDER PATTERN:
 * - Centralize connection management
 * - Tự động connect/disconnect dựa trên auth status
 * - Không cần manual connect/disconnect trong components
 * 
 * ARCHITECTURE:
 * - Provider layer: React context, lifecycle management
 * - Service layer: Pure WebSocket logic
 * - Separation of concerns: Provider chỉ quản lý khi nào connect/disconnect
 */

'use client';

import { useEffect, ReactNode } from 'react';
import { websocketService } from '@/lib/websocket/websocket.service';
import { useAuth } from '@/lib/api';

interface WebSocketProviderProps {
  children: ReactNode;
  /**
   * Authentication status từ AuthProvider
   * - true: User đã đăng nhập → connect WebSocket
   * - false: User chưa đăng nhập hoặc đã logout → disconnect WebSocket
   */
  isAuthenticated: boolean;
  /**
   * Loading status từ AuthProvider
   * - true: Đang check authentication → không connect/disconnect
   * - false: Đã xác định auth status → có thể connect/disconnect
   */
  isLoading?: boolean;
}

/**
 * WebSocket Provider Component
 * 
 * FLOW:
 * 1. Nhận isAuthenticated và isLoading từ props (từ AuthProvider)
 * 2. Nếu isLoading === true → không làm gì (đợi auth check xong)
 * 3. Nếu isAuthenticated === true → connect WebSocket
 * 4. Nếu isAuthenticated === false → disconnect WebSocket
 * 5. Cleanup: disconnect khi component unmount hoặc auth status thay đổi
 * 
 * LÝ DO:
 * - WebSocket chỉ nên connect khi user đã authenticate
 * - Backend validate JWT token trong handshake
 * - Nếu không có token hoặc token invalid → connection bị reject
 * 
 * @param props - WebSocketProviderProps
 */
export function WebSocketProvider({
  children,
  isAuthenticated,
  isLoading = false,
}: WebSocketProviderProps) {
  useEffect(() => {
    // Don't connect/disconnect nếu đang loading auth status
    // LÝ DO: Tránh connect/disconnect không cần thiết khi chưa biết auth status
    if (isLoading) {
      return;
    }

    // Connect nếu authenticated, disconnect nếu không
    if (isAuthenticated) {
      console.log('[WebSocketProvider] User authenticated, connecting...');
      websocketService.connect();
    } else {
      console.log('[WebSocketProvider] User not authenticated, disconnecting...');
      websocketService.disconnect();
    }

    // Cleanup function
    // LÝ DO: Disconnect khi component unmount hoặc auth status thay đổi
    // Nếu user logout (isAuthenticated = false), disconnect đã được gọi ở trên
    // Nhưng cần cleanup để đảm bảo disconnect khi component unmount
    return () => {
      if (!isAuthenticated) {
        websocketService.disconnect();
      }
    };
  }, [isAuthenticated, isLoading]); // Re-run khi auth status thay đổi

  return <>{children}</>;
}

/**
 * WebSocket Provider Wrapper
 * 
 * LÝ DO TÁCH RA:
 * - RootLayout là server component, không thể dùng hooks
 * - Cần client component để sử dụng useAuth() hook
 * - Wrapper này sử dụng useAuth() và pass props cho WebSocketProvider
 * 
 * ARCHITECTURE:
 * - RootLayout (server) → WebSocketProviderWrapper (client) → WebSocketProvider
 * - WebSocketProviderWrapper: Lấy auth status từ useAuth()
 * - WebSocketProvider: Quản lý connection lifecycle
 */
export function WebSocketProviderWrapper({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <WebSocketProvider isAuthenticated={isAuthenticated} isLoading={isLoading}>
      {children}
    </WebSocketProvider>
  );
}

