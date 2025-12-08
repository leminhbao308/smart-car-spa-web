/**
 * Utility functions for managing conversation history in localStorage
 */

import { AIChatbotMessage } from "../types";

const STORAGE_KEY = "ai_chatbot_conversation_history";
const SESSION_ID_KEY = "ai_chat_session_id";
const DRAFT_ID_KEY = "ai_chat_draft_id";
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
    console.log("Error loading conversation history from localStorage:", error);
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
    console.log("Error saving conversation history to localStorage:", error);
    
    // If storage is full, try to save fewer messages
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      try {
        // Try saving only the last 20 messages
        const messagesToSave = messages.slice(-20);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messagesToSave));
        console.warn("Storage quota exceeded. Saved only last 20 messages.");
      } catch (retryError) {
        console.log("Failed to save conversation history even with reduced size:", retryError);
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
    console.log("Error clearing conversation history from localStorage:", error);
  }
};

/**
 * Get conversation history size (number of messages)
 */
export const getConversationHistorySize = (): number => {
  const messages = loadConversationHistory();
  return messages.length;
};

/**
 * Generate a new session ID (UUID)
 */
export const generateSessionId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Get or create session ID
 */
export const getOrCreateSessionId = (): string => {
  if (typeof window === "undefined") {
    return generateSessionId();
  }

  try {
    let sessionId = localStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = generateSessionId();
      localStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    return sessionId;
  } catch (error) {
    console.log("Error getting/creating session ID:", error);
    return generateSessionId();
  }
};

/**
 * Save session ID
 */
export const saveSessionId = (sessionId: string): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  } catch (error) {
    console.log("Error saving session ID:", error);
  }
};

/**
 * Clear session ID
 */
export const clearSessionId = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(SESSION_ID_KEY);
  } catch (error) {
    console.log("Error clearing session ID:", error);
  }
};

/**
 * Get draft ID
 */
export const getDraftId = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return localStorage.getItem(DRAFT_ID_KEY);
  } catch (error) {
    console.log("Error getting draft ID:", error);
    return null;
  }
};

/**
 * Save draft ID
 */
export const saveDraftId = (draftId: string): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(DRAFT_ID_KEY, draftId);
  } catch (error) {
    console.log("Error saving draft ID:", error);
  }
};

/**
 * Clear draft ID
 */
export const clearDraftId = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(DRAFT_ID_KEY);
  } catch (error) {
    console.log("Error clearing draft ID:", error);
  }
};

/**
 * Clear all chatbot-related data (session, draft, conversation history)
 */
export const clearAllChatbotData = (): void => {
  clearConversationHistory();
  clearSessionId();
  clearDraftId();
};

