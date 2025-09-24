/**
 * Token Management Utility
 * Handles automatic token storage, retrieval, and cleanup
 */

// Token storage keys
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_INFO: 'user_info',
} as const;

// Token expiration buffer (5 minutes before actual expiration)
const TOKEN_EXPIRATION_BUFFER = 5 * 60 * 1000;

export class TokenManager {
  /**
   * Check if we're in browser environment
   */
  private static isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  /**
   * Get access token from localStorage
   */
  static getAccessToken(): string | null {
    if (!this.isBrowser()) return null;
    
    try {
      return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Error getting access token:', error);
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
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  /**
   * Get user info from localStorage
   */
  static getUserInfo(): any | null {
    if (!this.isBrowser()) return null;
    
    try {
      const userInfo = localStorage.getItem(TOKEN_KEYS.USER_INFO);
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('Error getting user info:', error);
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
      console.error('Error setting access token:', error);
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
      console.error('Error setting refresh token:', error);
    }
  }

  /**
   * Set user info in localStorage
   */
  static setUserInfo(userInfo: any): void {
    if (!this.isBrowser()) return;
    
    try {
      localStorage.setItem(TOKEN_KEYS.USER_INFO, JSON.stringify(userInfo));
    } catch (error) {
      console.error('Error setting user info:', error);
    }
  }

  /**
   * Set all tokens and user info
   */
  static setTokens(accessToken: string, refreshToken: string, userInfo: any): void {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
    this.setUserInfo(userInfo);
  }

  /**
   * Remove access token from localStorage
   */
  static removeAccessToken(): void {
    if (!this.isBrowser()) return;
    
    try {
      localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Error removing access token:', error);
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
      console.error('Error removing refresh token:', error);
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
      console.error('Error removing user info:', error);
    }
  }

  /**
   * Clear all tokens and user info
   */
  static clearAll(): void {
    this.removeAccessToken();
    this.removeRefreshToken();
    this.removeUserInfo();
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
   * Check if token is expired (basic check)
   * Note: This is a simple check. For production, you might want to decode JWT
   */
  static isTokenExpired(token?: string): boolean {
    const accessToken = token || this.getAccessToken();
    if (!accessToken) return true;

    try {
      // Simple check - in production, you might want to decode JWT
      // and check the exp claim
      return false;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  /**
   * Get authorization header value
   */
  static getAuthHeader(): string | null {
    const token = this.getAccessToken();
    return token ? `Bearer ${token}` : null;
  }
}
