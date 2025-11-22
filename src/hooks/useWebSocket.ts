/**
 * WebSocket React Hooks
 * 
 * MỤC ĐÍCH:
 * - Tích hợp WebSocket service với React components
 * - Subscribe to topics và handle reload signals
 * - Monitor connection status
 * 
 * LÝ DO HOOKS:
 * - React hooks pattern: reusable, composable
 * - Automatic cleanup khi component unmount
 * - Easy to use trong components
 * 
 * ARCHITECTURE:
 * - Hooks layer: React integration
 * - Service layer: Pure WebSocket logic
 * - Separation of concerns: Hooks chỉ handle React lifecycle, không handle WebSocket logic
 */

import { useEffect, useRef, useState } from 'react';
import { websocketService } from '@/lib/websocket/websocket.service';
import { MessageSignal, WebSocketStatus } from '@/lib/websocket/websocket.types';

/**
 * Hook để subscribe booking reload notifications
 * 
 * MỤC ĐÍCH:
 * - Subscribe vào /topic/bookings
 * - Khi nhận signal "RELOAD_BOOKING", gọi onReload callback
 * - Tự động unsubscribe khi component unmount
 * 
 * USAGE:
 * ```typescript
 * const { data, refetch } = useQuery(['bookings'], fetchBookings);
 * 
 * useBookingReload(() => {
 *   console.log('Reloading bookings...');
 *   refetch();
 * });
 * ```
 * 
 * LÝ DO useRef cho callback:
 * - Callback có thể thay đổi (ví dụ: refetch function)
 * - useRef giữ reference mới nhất mà không trigger re-subscribe
 * - Tránh unsubscribe/subscribe lại mỗi khi callback thay đổi
 * 
 * @param onReload - Callback function được gọi khi nhận reload signal
 */
export function useBookingReload(onReload: () => void): void {
  // useRef để giữ reference mới nhất của callback
  // LÝ DO: Callback có thể thay đổi (ví dụ: refetch function), nhưng không muốn re-subscribe
  const callbackRef = useRef(onReload);
  
  // Update callback ref khi nó thay đổi
  useEffect(() => {
    callbackRef.current = onReload;
  }, [onReload]);

  useEffect(() => {
    // Subscribe to booking topic
    const unsubscribe = websocketService.subscribe(
      '/topic/bookings',
      (signal: MessageSignal) => {
        // Chỉ handle RELOAD_BOOKING signal
        if (signal === 'RELOAD_BOOKING') {
          console.log('[WebSocket] Booking reload signal received');
          // Gọi callback với reference mới nhất
          callbackRef.current();
        }
      }
    );

    // Cleanup: unsubscribe khi component unmount
    return unsubscribe;
  }, []); // Empty deps: chỉ subscribe một lần khi mount
}

/**
 * Hook để subscribe vehicle profile reload notifications
 * 
 * TƯƠNG TỰ như useBookingReload nhưng cho vehicle profiles
 * 
 * @param onReload - Callback function được gọi khi nhận reload signal
 */
export function useVehicleProfileReload(onReload: () => void): void {
  const callbackRef = useRef(onReload);
  
  useEffect(() => {
    callbackRef.current = onReload;
  }, [onReload]);

  useEffect(() => {
    const unsubscribe = websocketService.subscribe(
      '/topic/vehicle-profiles',
      (signal: MessageSignal) => {
        if (signal === 'RELOAD_VEHICLE_PROFILE') {
          console.log('[WebSocket] Vehicle profile reload signal received');
          callbackRef.current();
        }
      }
    );

    return unsubscribe;
  }, []);
}

/**
 * Hook để subscribe customer reload notifications
 * 
 * TƯƠNG TỰ như useBookingReload nhưng cho customers
 * 
 * @param onReload - Callback function được gọi khi nhận reload signal
 */
export function useCustomerReload(onReload: () => void): void {
  const callbackRef = useRef(onReload);
  
  useEffect(() => {
    callbackRef.current = onReload;
  }, [onReload]);

  useEffect(() => {
    const unsubscribe = websocketService.subscribe(
      '/topic/customers',
      (signal: MessageSignal) => {
        if (signal === 'RELOAD_CUSTOMER') {
          console.log('[WebSocket] Customer reload signal received');
          callbackRef.current();
        }
      }
    );

    return unsubscribe;
  }, []);
}

/**
 * Hook để monitor WebSocket connection status
 * 
 * MỤC ĐÍCH:
 * - Theo dõi connection status trong React components
 * - Có thể dùng để hiển thị connection indicator trong UI
 * 
 * USAGE:
 * ```typescript
 * const status = useWebSocketStatus();
 * 
 * return (
 *   <div>
 *     {status === 'CONNECTED' && <Badge color="green">Connected</Badge>}
 *     {status === 'ERROR' && <Badge color="red">Disconnected</Badge>}
 *   </div>
 * );
 * ```
 * 
 * @returns Current WebSocket connection status
 */
export function useWebSocketStatus(): WebSocketStatus {
  // State để store status
  const [status, setStatus] = useState<WebSocketStatus>(
    websocketService.getStatus() // Initial status
  );

  useEffect(() => {
    // Subscribe to status changes
    const unsubscribe = websocketService.onStatusChange(setStatus);
    
    // Cleanup: unsubscribe khi component unmount
    return unsubscribe;
  }, []);

  return status;
}

