/**
 * WebSocket Service
 * 
 * MỤC ĐÍCH:
 * - Quản lý WebSocket connection lifecycle (connect, disconnect, reconnect)
 * - Quản lý STOMP subscriptions (subscribe, unsubscribe)
 * - Xử lý messages từ backend và gọi callbacks
 * - Quản lý connection status và notify listeners
 * 
 * LÝ DO SINGLETON PATTERN:
 * - Chỉ cần một WebSocket connection cho toàn bộ app
 * - Tránh multiple connections gây waste resources
 * - Centralize connection management
 * 
 * ARCHITECTURE:
 * - Service layer: Pure logic, không phụ thuộc React
 * - Có thể dùng ở bất kỳ đâu (React components, hooks, providers)
 * - Separation of concerns: Service chỉ quản lý WebSocket, không quản lý UI state
 */

import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getWebSocketUrl, WS_CONFIG } from './websocket.config';
import { Topic, MessageSignal, MessageCallback, WebSocketStatus, BookingEventDto, EnhancedMessageCallback } from './websocket.types';
import { TokenManager } from '../api/utils/token.manager';

class WebSocketService {
  // STOMP client instance
  private client: Client | null = null;
  
  // Current connection status
  private status: WebSocketStatus = 'DISCONNECTED';
  
  // Map topic -> subscription (STOMP subscription object)
  private subscriptions: Map<Topic, StompSubscription> = new Map();
  
  // Map topic -> Set of callbacks (multiple callbacks per topic)
  // Support both old MessageCallback (string signal) and new EnhancedMessageCallback (structured event)
  private callbacks: Map<Topic, Set<MessageCallback | EnhancedMessageCallback>> = new Map();
  
  // Reconnection state
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  // Status change listeners (để React hooks có thể listen status changes)
  private statusListeners: Set<(status: WebSocketStatus) => void> = new Set();

  /**
   * Get JWT token từ TokenManager
   * 
   * LÝ DO:
   * - WebSocket cần JWT token để authenticate với backend
   * - Token được gửi qua query parameter: ws://host:port/ws?token=xxx
   * - Backend validate token trong handshake interceptor
   * 
   * @returns JWT access token hoặc null nếu không có
   */
  private getToken(): string | null {
    return TokenManager.getAccessToken();
  }

  /**
   * Build WebSocket URL với JWT token
   * 
   * FORMAT: ws://host:port/ws?token=<JWT_TOKEN>
   * 
   * LÝ DO:
   * - Backend yêu cầu token trong query parameter
   * - Token được validate trong WebSocketHandshakeInterceptor
   * - Nếu không có token, backend có thể reject connection
   * 
   * @returns WebSocket URL với token query parameter
   */
  private buildWebSocketUrl(): string {
    const baseUrl = getWebSocketUrl();
    const token = this.getToken();
    
    if (!token) {
      console.warn('[WebSocket] No token available');
      return baseUrl;
    }
    
    // Append token as query parameter
    const urlWithToken = `${baseUrl}?token=${encodeURIComponent(token)}`;
    
    // Debug logging
    if (WS_CONFIG.debug) {
      console.log('[WebSocket] Building WebSocket URL:', {
        baseUrl,
        hasToken: !!token,
        url: urlWithToken.substring(0, 100) + '...' // Truncate để không log full token
      });
    }
    
    return urlWithToken;
  }

  /**
   * Set connection status và notify tất cả listeners
   * 
   * LÝ DO:
   * - React hooks cần biết status để update UI
   * - Centralize status management
   * - Prevent duplicate status updates
   * 
   * @param status - New connection status
   */
  private setStatus(status: WebSocketStatus): void {
    if (this.status === status) return; // Prevent duplicate updates
    
    this.status = status;
    
    // Notify all listeners (React hooks)
    this.statusListeners.forEach(listener => listener(status));
    
    if (WS_CONFIG.debug) {
      console.log(`[WebSocket] Status changed: ${status}`);
    }
  }

  /**
   * Subscribe to status changes
   * 
   * MỤC ĐÍCH:
   * - Cho phép React hooks listen status changes
   * - Return unsubscribe function để cleanup
   * 
   * @param callback - Function được gọi khi status thay đổi
   * @returns Unsubscribe function
   */
  public onStatusChange(callback: (status: WebSocketStatus) => void): () => void {
    this.statusListeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  /**
   * Connect to WebSocket
   * 
   * FLOW:
   * 1. Check if already connected → return early
   * 2. Get JWT token → if no token, set ERROR status
   * 3. Set status CONNECTING
   * 4. Create STOMP client với SockJS
   * 5. Configure event handlers (onConnect, onError, etc.)
   * 6. Activate client → start connection
   * 
   * LÝ DO SOCKJS:
   * - Backend endpoint /ws sử dụng SockJS
   * - SockJS có fallback mechanisms cho browsers cũ
   * - Tương thích tốt với Spring WebSocket
   */
  public connect(): void {
    // Prevent multiple connections
    if (this.client?.active) {
      console.warn('[WebSocket] Already connected');
      return;
    }

    // Check token availability
    const token = this.getToken();
    if (!token) {
      console.log('[WebSocket] Cannot connect: No token available');
      this.setStatus('ERROR');
      return;
    }

    this.setStatus('CONNECTING');

    // Create STOMP client với SockJS
    this.client = new Client({
      // SockJS factory - tạo WebSocket connection với SockJS protocol
      webSocketFactory: () => new SockJS(this.buildWebSocketUrl()) as any,
      
      // Reconnect configuration
      reconnectDelay: WS_CONFIG.reconnectDelay,
      
      // Heartbeat configuration (keep connection alive)
      heartbeatIncoming: WS_CONFIG.heartbeatIncoming,
      heartbeatOutgoing: WS_CONFIG.heartbeatOutgoing,
      
      // Debug logging
      debug: (str: string) => {
        if (WS_CONFIG.debug) {
          console.log(`[STOMP] ${str}`);
        }
      },
      
      // Event: Connection established
      onConnect: () => {
        console.log('[WebSocket] Connected successfully');
        this.setStatus('CONNECTED');
        this.reconnectAttempts = 0; // Reset reconnect attempts
        
        // Subscribe to all topics that have callbacks
        this.subscribeToAllTopics();
      },
      
      // Event: STOMP protocol error
      onStompError: (frame) => {
        console.log('[WebSocket] STOMP error:', frame);
        this.setStatus('ERROR');
      },
      
      // Event: WebSocket connection closed
      onWebSocketClose: () => {
        console.log('[WebSocket] Connection closed');
        this.setStatus('DISCONNECTED');
        this.subscriptions.clear(); // Clear subscriptions
      },
      
      // Event: Disconnected
      onDisconnect: () => {
        console.log('[WebSocket] Disconnected');
        this.setStatus('DISCONNECTED');
        this.subscriptions.clear();
      },
    });

    // Handle WebSocket connection errors
    this.client.onWebSocketError = (error) => {
      console.log('[WebSocket] Connection error:', error);
      this.setStatus('ERROR');
      
      // Auto reconnect với exponential backoff
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = WS_CONFIG.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
        console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})...`);
        
        setTimeout(() => {
          if (this.status !== 'CONNECTED') {
            this.connect();
          }
        }, delay);
      } else {
        console.log('[WebSocket] Max reconnection attempts reached');
        this.setStatus('ERROR');
      }
    };

    // Activate client → start connection
    this.client.activate();
  }

  /**
   * Disconnect from WebSocket
   * 
   * FLOW:
   * 1. Unsubscribe all topics
   * 2. Deactivate STOMP client
   * 3. Clear subscriptions map
   * 4. Set status DISCONNECTED
   * 5. Reset reconnect attempts
   * 
   * LÝ DO:
   * - Cleanup resources khi không cần connection nữa
   * - Prevent memory leaks
   * - Proper cleanup khi user logout
   */
  public disconnect(): void {
    if (this.client) {
      // Unsubscribe all topics
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();
      
      // Deactivate client
      this.client.deactivate();
      this.client = null;
    }
    
    this.setStatus('DISCONNECTED');
    this.reconnectAttempts = 0;
  }

  /**
   * Subscribe to a topic
   * 
   * FLOW:
   * 1. Add callback to callbacks map
   * 2. If already subscribed → return unsubscribe function
   * 3. If connected → subscribe to topic immediately
   * 4. Return unsubscribe function
   * 
   * LÝ DO MULTIPLE CALLBACKS:
   * - Nhiều components có thể subscribe cùng một topic
   * - Mỗi component có callback riêng
   * - Khi nhận message, gọi tất cả callbacks
   * 
   * @param topic - STOMP topic to subscribe
   * @param callback - Callback function khi nhận message (có thể nhận string signal hoặc structured event)
   * @returns Unsubscribe function
   */
  public subscribe(topic: Topic, callback: MessageCallback | EnhancedMessageCallback): () => void {
    // Add callback to map
    if (!this.callbacks.has(topic)) {
      this.callbacks.set(topic, new Set());
    }
    this.callbacks.get(topic)!.add(callback);

    // If already subscribed, just return unsubscribe function
    if (this.subscriptions.has(topic)) {
      return () => {
        this.callbacks.get(topic)?.delete(callback);
      };
    }

    // Subscribe to topic if connected
    // QUAN TRỌNG: Chỉ subscribe nếu connection đã established (status = CONNECTED)
    // Không subscribe nếu đang connecting (status = CONNECTING) hoặc disconnected
    if (this.client && this.client.active && this.status === 'CONNECTED') {
      this.subscribeToTopic(topic);
    } else {
      // Connection chưa established, sẽ subscribe sau khi onConnect được gọi
      if (WS_CONFIG.debug) {
        console.log(`[WebSocket] Deferring subscription to ${topic} until connection established`);
      }
    }

    // Return unsubscribe function
    return () => {
      // Remove callback
      this.callbacks.get(topic)?.delete(callback);
      
      // If no more callbacks, unsubscribe from topic
      if (this.callbacks.get(topic)?.size === 0) {
        this.subscriptions.get(topic)?.unsubscribe();
        this.subscriptions.delete(topic);
      }
    };
  }

  /**
   * Subscribe to a specific topic (internal method)
   * 
   * FLOW:
   * 1. Check if connected → return if not
   * 2. Check if already subscribed → return if yes
   * 3. Create STOMP subscription
   * 4. Parse message body (string signal)
   * 5. Call all callbacks for this topic
   * 6. Store subscription in map
   * 
   * LÝ DO:
   * - Internal method, chỉ được gọi từ subscribe() hoặc subscribeToAllTopics()
   * - Handle message parsing và callback execution
   * - Error handling để không crash nếu callback có lỗi
   * 
   * @param topic - STOMP topic to subscribe
   */
  private subscribeToTopic(topic: Topic): void {
    // Check if client exists and is connected
    // QUAN TRỌNG: Phải check cả client tồn tại, active, và connected
    if (!this.client) {
      console.warn(`[WebSocket] Cannot subscribe to ${topic}: Client not initialized`);
      return;
    }

    if (!this.client.active) {
      console.warn(`[WebSocket] Cannot subscribe to ${topic}: Client not active`);
      return;
    }

    // Double check: Verify connection is actually established
    // STOMP client có thể active nhưng chưa connected (đang connecting)
    if (this.status !== 'CONNECTED') {
      console.warn(`[WebSocket] Cannot subscribe to ${topic}: Not connected (status: ${this.status})`);
      return;
    }

    if (this.subscriptions.has(topic)) {
      console.warn(`[WebSocket] Already subscribed to ${topic}`);
      return;
    }

    // Create STOMP subscription
    const subscription = this.client.subscribe(topic, (message: IMessage) => {
      try {
        // Parse message body - có thể là string signal hoặc structured JSON event
        const body = message.body;
        
        if (WS_CONFIG.debug) {
          console.log(`[WebSocket] Received message from ${topic}:`, body);
        }

        // Try to parse as JSON (structured event)
        let parsedMessage: MessageSignal | BookingEventDto | null = null;
        try {
          parsedMessage = JSON.parse(body) as BookingEventDto;
          // Check if it's a structured event (has event_type field)
          if (!parsedMessage.event_type) {
            // Not a structured event, treat as string signal
            parsedMessage = body as MessageSignal;
          }
        } catch {
          // Not JSON, treat as string signal (backward compatible)
          parsedMessage = body as MessageSignal;
        }

        // Call all callbacks for this topic
        const callbacks = this.callbacks.get(topic);
        if (callbacks) {
          callbacks.forEach(callback => {
            try {
              // Callback có thể là MessageCallback (string) hoặc EnhancedMessageCallback (string | event)
              callback(parsedMessage as any);
            } catch (error) {
              // Error trong callback không ảnh hưởng đến callbacks khác
              console.log(`[WebSocket] Error in callback for ${topic}:`, error);
            }
          });
        }
      } catch (error) {
        console.log(`[WebSocket] Error processing message from ${topic}:`, error);
      }
    });

    // Store subscription
    this.subscriptions.set(topic, subscription);
    console.log(`[WebSocket] Subscribed to ${topic}`);
  }

  /**
   * Subscribe to all topics that have callbacks
   * 
   * MỤC ĐÍCH:
   * - Khi reconnect, cần resubscribe tất cả topics
   * - Chỉ subscribe topics có callbacks (tránh waste resources)
   * 
   * LÝ DO:
   * - Được gọi trong onConnect event
   * - Đảm bảo tất cả subscriptions được restore sau reconnect
   */
  private subscribeToAllTopics(): void {
    const topics: Topic[] = [
      '/topic/bookings',
      '/topic/vehicle-profiles',
      '/topic/customers',
    ];

    topics.forEach(topic => {
      // Chỉ subscribe nếu có callbacks
      if (this.callbacks.has(topic) && this.callbacks.get(topic)!.size > 0) {
        this.subscribeToTopic(topic);
      }
    });
  }

  /**
   * Get current connection status
   * 
   * @returns Current WebSocket status
   */
  public getStatus(): WebSocketStatus {
    return this.status;
  }

  /**
   * Check if connected
   * 
   * @returns true nếu connected và client active
   */
  public isConnected(): boolean {
    return this.status === 'CONNECTED' && this.client?.active === true;
  }
}

// Export singleton instance
// LÝ DO: Chỉ cần một WebSocket connection cho toàn bộ app
export const websocketService = new WebSocketService();

