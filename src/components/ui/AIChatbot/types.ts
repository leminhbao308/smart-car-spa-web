export interface AIChatbotMessage {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  isLoading?: boolean;
}

export interface QuickAction {
  id: string;
  label: string;
  action: string;
}

