/**
 * AI Assistant API Types
 */

export interface ChatRequest {
  message: string;
  conversation_history?: ChatMessage[];
  customer_phone?: string;
  customer_id?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  message: string;
  functions_called?: string[];
  requires_action?: boolean;
  action_type?: string | null;
}

