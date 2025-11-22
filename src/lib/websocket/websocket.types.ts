/**
 * WebSocket TypeScript Types
 * 
 * MỤC ĐÍCH:
 * - Định nghĩa types cho WebSocket system
 * - Type safety cho topics, signals, callbacks
 * - Centralize type definitions để dễ maintain
 * 
 * LÝ DO:
 * - TypeScript giúp catch errors tại compile time
 * - IntelliSense support trong IDE
 * - Self-documenting code
 */

/**
 * WebSocket Connection Status
 * 
 * DISCONNECTED: Chưa kết nối hoặc đã ngắt kết nối
 * CONNECTING: Đang trong quá trình kết nối
 * CONNECTED: Đã kết nối thành công và sẵn sàng nhận messages
 * ERROR: Có lỗi xảy ra (connection failed, token invalid, etc.)
 */
export type WebSocketStatus = 
  | 'DISCONNECTED' 
  | 'CONNECTING' 
  | 'CONNECTED' 
  | 'ERROR';

/**
 * STOMP Topics
 * 
 * Topics là các channels mà client subscribe để nhận messages
 * Backend gửi messages đến topics, tất cả subscribers sẽ nhận được
 * 
 * /topic/bookings: Nhận notifications về thay đổi booking
 * /topic/vehicle-profiles: Nhận notifications về thay đổi vehicle profile
 * /topic/customers: Nhận notifications về thay đổi customer
 * 
 * LƯU Ý: Phải match chính xác với backend topics
 */
export type Topic = 
  | '/topic/bookings'
  | '/topic/vehicle-profiles'
  | '/topic/customers';

/**
 * Message Signals
 * 
 * Backend gửi string signals thay vì JSON objects
 * Mỗi signal tương ứng với một action cần thực hiện ở frontend
 * 
 * RELOAD_BOOKING: Reload booking data (từ /topic/bookings)
 * RELOAD_VEHICLE_PROFILE: Reload vehicle profile data (từ /topic/vehicle-profiles)
 * RELOAD_CUSTOMER: Reload customer data (từ /topic/customers)
 * 
 * LƯU Ý: Phải match chính xác với backend message constants
 */
export type MessageSignal = 
  | 'RELOAD_BOOKING'
  | 'RELOAD_VEHICLE_PROFILE'
  | 'RELOAD_CUSTOMER';

/**
 * Message Callback Function
 * 
 * Callback được gọi khi nhận message từ topic
 * 
 * @param signal - Message signal từ backend
 * 
 * VÍ DỤ:
 * ```typescript
 * const callback: MessageCallback = (signal) => {
 *   if (signal === 'RELOAD_BOOKING') {
 *     refetch(); // Reload booking data
 *   }
 * };
 * ```
 */
export type MessageCallback = (signal: MessageSignal) => void;

/**
 * WebSocket Message Interface
 * 
 * (Optional) Có thể extend sau nếu backend gửi structured JSON
 * Hiện tại backend chỉ gửi string signals
 */
export interface WebSocketMessage {
  signal: MessageSignal;
  timestamp?: number;
  data?: unknown; // Optional data payload
}

