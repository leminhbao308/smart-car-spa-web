/**
 * Utility functions for managing conversation history in localStorage
 */

import { AIChatbotMessage } from "../types";

const STORAGE_KEY = "ai_chatbot_conversation_history";
const MAX_MESSAGES = 50; // Giới hạn số lượng messages để tránh localStorage quá lớn

/**
 * Load conversation history from localStorage
 */
export const loadConversationHistory = (): AIChatbotMessage[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const messages = JSON.parse(stored) as AIChatbotMessage[];
    
    // Convert timestamp strings back to Date objects
    return messages.map((msg) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));
  } catch (error) {
    console.error("Error loading conversation history from localStorage:", error);
    return [];
  }
};

/**
 * Save conversation history to localStorage
 */
export const saveConversationHistory = (messages: AIChatbotMessage[]): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    // Limit number of messages to prevent localStorage from getting too large
    const messagesToSave = messages.slice(-MAX_MESSAGES);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messagesToSave));
  } catch (error) {
    console.error("Error saving conversation history to localStorage:", error);
    
    // If storage is full, try to save fewer messages
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      try {
        // Try saving only the last 20 messages
        const messagesToSave = messages.slice(-20);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messagesToSave));
        console.warn("Storage quota exceeded. Saved only last 20 messages.");
      } catch (retryError) {
        console.error("Failed to save conversation history even with reduced size:", retryError);
      }
    }
  }
};

/**
 * Clear conversation history from localStorage
 */
export const clearConversationHistory = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing conversation history from localStorage:", error);
  }
};

/**
 * Get conversation history size (number of messages)
 */
export const getConversationHistorySize = (): number => {
  const messages = loadConversationHistory();
  return messages.length;
};

