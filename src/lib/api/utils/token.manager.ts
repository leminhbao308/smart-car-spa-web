/**
 * Token Management Utility
 * Handles automatic token storage, retrieval, and cleanup
 */

import { clearDeviceInfo } from "./device.manager";

// Token storage keys
const TOKEN_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER_INFO: "user_info",
} as const;

// AI Chatbot conversation history storage key
const AI_CHATBOT_STORAGE_KEY = "ai_chatbot_conversation_history";

export class TokenManager {
  /**
   * Check if we're in browser environment
   */
  private static isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  /**
   * Get access token from localStorage
   */
  static getAccessToken(): string | null {
    if (!this.isBrowser()) return null;

    try {
      return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.log("Error getting access token:", error);
      return null;
    }
  }

  /**
   * Get refresh token from localStorage
   */
  static getRefreshToken(): string | null {
    if (!this.isBrowser()) return null;

    try {
      return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.log("Error getting refresh token:", error);
      return null;
    }
  }

  /**
   * Get user info from localStorage
   */
  static getUserInfo(): unknown | null {
    if (!this.isBrowser()) return null;

    try {
      const userInfo = localStorage.getItem(TOKEN_KEYS.USER_INFO);
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.log("Error getting user info:", error);
      return null;
    }
  }

  /**
   * Set access token in localStorage
   */
  static setAccessToken(token: string): void {
    if (!this.isBrowser()) return;

    try {
      localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, token);
    } catch (error) {
      console.log("Error setting access token:", error);
    }
  }

  /**
   * Set refresh token in localStorage
   */
  static setRefreshToken(token: string): void {
    if (!this.isBrowser()) return;

    try {
      localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, token);
    } catch (error) {
      console.log("Error setting refresh token:", error);
    }
  }

  /**
   * Set user info in localStorage
   */
  static setUserInfo(userInfo: unknown): void {
    if (!this.isBrowser()) return;

    try {
      localStorage.setItem(TOKEN_KEYS.USER_INFO, JSON.stringify(userInfo));
    } catch (error) {
      console.log("Error setting user info:", error);
    }
  }

  /**
   * Set all tokens and user info
   */
  static setTokens(
    accessToken: string,
    refreshToken: string,
    userInfo: unknown
  ): void {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
    this.setUserInfo(userInfo);

    // Đồng bộ với cookies để middleware có thể đọc được
    this.syncToCookies(accessToken, refreshToken, userInfo);
  }

  /**
   * Remove access token from localStorage
   */
  static removeAccessToken(): void {
    if (!this.isBrowser()) return;

    try {
      localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.log("Error removing access token:", error);
    }
  }

  /**
   * Remove refresh token from localStorage
   */
  static removeRefreshToken(): void {
    if (!this.isBrowser()) return;

    try {
      localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.log("Error removing refresh token:", error);
    }
  }

  /**
   * Remove user info from localStorage
   */
  static removeUserInfo(): void {
    if (!this.isBrowser()) return;

    try {
      localStorage.removeItem(TOKEN_KEYS.USER_INFO);
    } catch (error) {
      console.log("Error removing user info:", error);
    }
  }

  /**
   * Clear all tokens and user info
   * Also clears AI chatbot conversation history and device info
   */
  static clearAll(): void {
    this.removeAccessToken();
    this.removeRefreshToken();
    this.removeUserInfo();

    // Xóa cookies
    this.clearCookies();

    // Clear AI chatbot conversation history
    this.clearAIChatbotHistory();

    // Clear device info (for multi-device support)
    clearDeviceInfo();
  }

  /**
   * Clear AI chatbot conversation history from localStorage
   */
  private static clearAIChatbotHistory(): void {
    if (!this.isBrowser()) return;

    try {
      localStorage.removeItem(AI_CHATBOT_STORAGE_KEY);
    } catch (error) {
      console.log("Error clearing AI chatbot conversation history:", error);
    }
  }

  /**
   * Check if access token exists
   */
  static hasAccessToken(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Check if refresh token exists
   */
  static hasRefreshToken(): boolean {
    return !!this.getRefreshToken();
  }

  /**
   * Check if user is authenticated (has both tokens)
   */
  static isAuthenticated(): boolean {
    return this.hasAccessToken() && this.hasRefreshToken();
  }

  /**
   * Get authorization header value
   */
  static getAuthHeader(): string | null {
    const token = this.getAccessToken();
    return token ? `Bearer ${token}` : null;
  }

  /**
   * Đồng bộ tokens và user info với cookies
   * Để middleware có thể đọc được thông tin authentication
   */
  static syncToCookies(
    accessToken: string,
    refreshToken: string,
    userInfo: unknown
  ): void {
    if (!this.isBrowser()) return;

    try {
      // Set cookies với các options phù hợp
      const cookieOptions = {
        maxAge: 60 * 60 * 24 * 7, // 7 days
        httpOnly: false, // Cần false để client có thể đọc được
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
      };

      // Set access token cookie
      document.cookie = `access_token=${accessToken}; max-age=${
        cookieOptions.maxAge
      }; path=${cookieOptions.path}; samesite=${cookieOptions.sameSite}${
        cookieOptions.secure ? "; secure" : ""
      }`;

      // Set refresh token cookie
      document.cookie = `refresh_token=${refreshToken}; max-age=${
        cookieOptions.maxAge
      }; path=${cookieOptions.path}; samesite=${cookieOptions.sameSite}${
        cookieOptions.secure ? "; secure" : ""
      }`;

      // Set user info cookie
      document.cookie = `user_info=${JSON.stringify(userInfo)}; max-age=${
        cookieOptions.maxAge
      }; path=${cookieOptions.path}; samesite=${cookieOptions.sameSite}${
        cookieOptions.secure ? "; secure" : ""
      }`;
    } catch (error) {
      console.log("Error syncing to cookies:", error);
    }
  }

  /**
   * Xóa tất cả cookies liên quan đến authentication
   */
  static clearCookies(): void {
    if (!this.isBrowser()) return;

    try {
      // Xóa access token cookie
      document.cookie = "access_token=; max-age=0; path=/";

      // Xóa refresh token cookie
      document.cookie = "refresh_token=; max-age=0; path=/";

      // Xóa user info cookie
      document.cookie = "user_info=; max-age=0; path=/";
    } catch (error) {
      console.log("Error clearing cookies:", error);
    }
  }

  /**
   * Cập nhật cookies khi token được refresh
   */
  static updateCookies(accessToken: string, refreshToken?: string): void {
    if (!this.isBrowser()) return;

    try {
      const cookieOptions = {
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
        sameSite: "lax" as const,
        secure: process.env.NODE_ENV === "production",
      };

      // Update access token
      document.cookie = `access_token=${accessToken}; max-age=${
        cookieOptions.maxAge
      }; path=${cookieOptions.path}; samesite=${cookieOptions.sameSite}${
        cookieOptions.secure ? "; secure" : ""
      }`;

      // Update refresh token nếu có
      if (refreshToken) {
        document.cookie = `refresh_token=${refreshToken}; max-age=${
          cookieOptions.maxAge
        }; path=${cookieOptions.path}; samesite=${cookieOptions.sameSite}${
          cookieOptions.secure ? "; secure" : ""
        }`;
      }
    } catch (error) {
      console.log("Error updating cookies:", error);
    }
  }
}
