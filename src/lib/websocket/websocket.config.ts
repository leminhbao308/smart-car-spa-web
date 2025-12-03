/**
 * WebSocket Configuration
 *
 * MỤC ĐÍCH:
 * - Cấu hình WebSocket URL dựa trên API base URL
 * - Convert HTTP/HTTPS URL sang WebSocket URL (ws/wss)
 * - Định nghĩa các config constants cho WebSocket connection
 *
 * LÝ DO:
 * - Backend WebSocket endpoints KHÔNG có /api prefix
 * - Cần convert protocol: http -> ws, https -> wss
 * - Centralize config để dễ maintain và test
 */

/**
 * Lấy SockJS URL từ API base URL
 *
 * QUAN TRỌNG: SockJS cần HTTP/HTTPS URL, KHÔNG phải ws:///wss://
 * SockJS sẽ tự động handle WebSocket upgrade internally
 *
 * LOGIC:
 * 1. Lấy API base URL từ axios config (http://192.168.1.16:8081/api)
 * 2. GIỮ NGUYÊN /api prefix (vì backend có context-path=/api)
 * 3. GIỮ NGUYÊN protocol: http:// hoặc https:// (SockJS cần HTTP/HTTPS)
 * 4. Append endpoint: /ws (cho SockJS - web browsers)
 *
 * VÍ DỤ:
 * Input:  http://192.168.1.16:8081/api
 * Output: http://192.168.1.16:8081/api/ws
 *
 * LƯU Ý: Với context-path=/api, SockJS info endpoint cần /api/ws/info
 */
export const getWebSocketUrl = (): string => {
  // Lấy API base URL từ axios config
  // TODO: Có thể lấy từ environment variable hoặc axios config
  // const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.16:8081/api';
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';
  
  // GIỮ NGUYÊN /api prefix vì backend có context-path=/api
  // QUAN TRỌNG: KHÔNG convert http -> ws vì SockJS cần HTTP/HTTPS URL
  // QUAN TRỌNG: KHÔNG remove /api vì với context-path, endpoint là /api/ws

  // Web endpoint: /ws (SockJS) - cho web browsers
  // Với context-path=/api, endpoint sẽ là /api/ws
  // SockJS sẽ tự động upgrade sang WebSocket nếu browser support
  const wsUrl = `${apiBaseUrl}/ws`;

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('[WebSocket Config] API Base URL:', apiBaseUrl);
    console.log('[WebSocket Config] WebSocket URL (with /api prefix):', wsUrl);
  }

  return wsUrl;
};

/**
 * WebSocket Configuration Constants
 *
 * reconnectDelay: Thời gian delay giữa các lần reconnect (ms)
 * - Bắt đầu với 5s, tăng dần theo exponential backoff
 *
 * heartbeatIncoming: Thời gian giữa các heartbeat messages từ server (ms)
 * - Server gửi heartbeat để kiểm tra connection còn sống
 * - 10s = server gửi heartbeat mỗi 10 giây
 *
 * heartbeatOutgoing: Thời gian giữa các heartbeat messages từ client (ms)
 * - Client gửi heartbeat để báo cho server biết còn kết nối
 * - 10s = client gửi heartbeat mỗi 10 giây
 *
 * debug: Bật/tắt debug logs
 * - Development: true để debug dễ dàng
 * - Production: false để giảm logs
 */
export const WS_CONFIG = {
  reconnectDelay: 5000,        // 5 seconds - delay ban đầu
  heartbeatIncoming: 10000,    // 10 seconds - server heartbeat
  heartbeatOutgoing: 10000,    // 10 seconds - client heartbeat
  debug: process.env.NODE_ENV === 'development', // Debug mode trong dev
} as const;

