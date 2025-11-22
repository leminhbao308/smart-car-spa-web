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

/**
 * Booking Event Type
 * 
 * Enum cho các loại booking events từ backend
 */
export type BookingEventType = 
  | 'CREATED'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'CHECKED_IN'
  | 'STARTED'
  | 'COMPLETED'
  | 'UPDATED';

/**
 * Booking Event DTO
 * 
 * Structured event message từ backend cho booking changes
 * Chứa thông tin chi tiết để frontend có thể update smart
 */
export interface BookingEventDto {
  event_type: BookingEventType;
  booking_id: string;
  booking_code: string;
  booking_data?: BookingInfoDto | null; // Optional - null nếu booking đã bị xóa
  timestamp: string; // ISO 8601 format
  message: string; // User-friendly message
}

/**
 * Booking Info DTO (simplified for WebSocket)
 * 
 * Chỉ include các fields cần thiết cho real-time update
 * Full structure có thể fetch từ API nếu cần
 */
export interface BookingInfoDto {
  booking_id: string;
  booking_code: string;
  customer_id?: string;
  customer_name?: string;
  customer_phone?: string;
  vehicle_id?: string;
  vehicle_license_plate?: string;
  branch_id?: string;
  branch_name?: string;
  bay_id?: string;
  bay_name?: string;
  scheduled_start_at?: string;
  scheduled_end_at?: string;
  actual_check_in_at?: string;
  actual_start_at?: string;
  actual_end_at?: string;
  status: string;
  payment_status?: string;
  total_price?: number;
  estimated_duration_minutes?: number;
  notes?: string;
  cancellation_reason?: string;
  cancelled_at?: string;
  cancelled_by?: string;
  created_at?: string;
  updated_at?: string;
  // ... other fields as needed
}

/**
 * Enhanced Message Callback
 * 
 * Callback có thể nhận cả string signal (backward compatible) 
 * và structured BookingEventDto
 */
export type EnhancedMessageCallback = (
  signalOrEvent: MessageSignal | BookingEventDto
) => void;

/**
 * Tracking Event Type
 * 
 * Enum cho các loại tracking events từ backend
 */
export type TrackingEventType = 
  | 'CREATED'
  | 'STARTED'
  | 'UPDATED'
  | 'COMPLETED'
  | 'CANCELLED';

/**
 * Tracking Event DTO
 * 
 * Structured event message từ backend cho tracking changes
 */
export interface TrackingEventDto {
  event_type: TrackingEventType;
  tracking_id: string;
  booking_id: string;
  booking_code: string;
  tracking_data?: ServiceProcessTrackingInfoDto | null;
  timestamp: string;
  message: string;
}

/**
 * Service Process Tracking Info DTO (simplified for WebSocket)
 */
export interface ServiceProcessTrackingInfoDto {
  trackingId: string;
  bookingId: string;
  bookingCode: string;
  serviceStepId: string;
  serviceStepName: string;
  serviceStepDescription?: string;
  serviceStepOrder?: number;
  bayId: string;
  bayName: string;
  carServiceId?: string;
  carServiceName?: string;
  startTime?: string;
  endTime?: string;
  status: string;
  notes?: string;
  evidenceMediaUrls?: string;
  lastUpdatedAt?: string;
  createdAt?: string;
  // ... other fields as needed
}

