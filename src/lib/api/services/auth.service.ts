/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { enhancedApiClient } from '../axios';
import { TokenManager } from '../utils/token.manager';
import {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  UserInfo,
} from '../types';

export class AuthService {
  /**
   * Login user with email and password
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await enhancedApiClient.post<LoginResponse>('/auth/login', credentials);
      
      if (response.success && response.data) {
        const { access_token, refresh_token, user_info } = response.data;
        
        // Store tokens and user info
        TokenManager.setTokens(access_token, refresh_token, user_info);
        
        return response.data;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logout user and clear tokens
   */
  static async logout(): Promise<void> {
    try {
      // Call logout endpoint to invalidate tokens on server
      await enhancedApiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Always clear local tokens
      TokenManager.clearAll();
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(): Promise<RefreshTokenResponse> {
    try {
      const refreshToken = TokenManager.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const request: RefreshTokenRequest = {
        refresh_token: refreshToken,
      };

      const response = await enhancedApiClient.post<RefreshTokenResponse>(
        '/auth/refresh-token',
        request
      );

      if (response.success && response.data) {
        const { access_token, refresh_token } = response.data;
        
        // Update tokens
        TokenManager.setAccessToken(access_token);
        TokenManager.setRefreshToken(refresh_token);
        
        return response.data;
      } else {
        throw new Error(response.message || 'Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      
      // Clear tokens if refresh fails
      TokenManager.clearAll();
      throw error;
    }
  }

  /**
   * Verify if current token is valid
   */
  static async verifyToken(): Promise<boolean> {
    try {
      const response = await enhancedApiClient.get('/auth/verify-token');
      return response.success;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  }

  /**
   * Get current user info
   */
  static async getCurrentUser(): Promise<UserInfo | null> {
    try {
      const response = await enhancedApiClient.get<UserInfo>('/auth/me');
      
      if (response.success && response.data) {
        // Update user info in storage
        TokenManager.setUserInfo(response.data);
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Send forgot password email
   */
  static async forgotPassword(request: ForgotPasswordRequest): Promise<void> {
    try {
      const response = await enhancedApiClient.post('/auth/forgot-password', request);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(request: ResetPasswordRequest): Promise<void> {
    try {
      const response = await enhancedApiClient.post('/auth/reset-password', request);
      
      if (!response.success) {
        throw new Error(response.message || 'Password reset failed');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  /**
   * Change password for authenticated user
   */
  static async changePassword(request: ChangePasswordRequest): Promise<void> {
    try {
      const response = await enhancedApiClient.post('/auth/change-password', request);
      
      if (!response.success) {
        throw new Error(response.message || 'Password change failed');
      }
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return TokenManager.isAuthenticated();
  }

  /**
   * Get current user info from storage
   */
  static getCurrentUserFromStorage(): UserInfo | null {
    return TokenManager.getUserInfo();
  }

  /**
   * Get access token from storage
   */
  static getAccessToken(): string | null {
    return TokenManager.getAccessToken();
  }

  /**
   * Get refresh token from storage
   */
  static getRefreshToken(): string | null {
    return TokenManager.getRefreshToken();
  }

  /**
   * Clear all authentication data
   */
  static clearAuth(): void {
    TokenManager.clearAll();
  }
}
