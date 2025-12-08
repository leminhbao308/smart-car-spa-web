/**
 * AI Assistant API Types
 */

export interface ChatRequest {
  message: string;
  conversation_history?: ChatMessage[];
  customer_phone?: string;
  customer_id?: string;
  session_id?: string; // NEW - Khuyến nghị gửi
  draft_id?: string; // NEW - Gửi nếu có từ response trước
  extracted_uuids?: ExtractedUuids; // NEW - Optional, để tối ưu
}

export interface ChatMessage {
  role: "user" | "assistant" | "tool";
  content: string;
  tool_call_id?: string;
  tool_name?: string;
  tool_response?: any;
}

export interface ExtractedUuids {
  vehicle_id?: string;
  vehicle_license_plate?: string;
  branch_id?: string;
  branch_name?: string;
  bay_id?: string;
  bay_name?: string;
  service_type?: string;
}

export interface ChatResponse {
  message: string;
  functions_called?: string[];
  requires_action?: boolean;
  action_type?: string | null;
  draft_id?: string; // NEW - Lưu lại để gửi request tiếp theo
  draft_data?: DraftData; // NEW - Thông tin progress
}

export interface DraftData {
  current_step: number; // 1-7
  has_vehicle: boolean;
  has_date: boolean;
  has_branch: boolean;
  has_service: boolean;
  has_bay: boolean;
  has_time: boolean;
  is_complete: boolean;
}

