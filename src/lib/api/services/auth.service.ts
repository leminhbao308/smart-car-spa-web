/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import apiClient from "../axios";
import { TokenManager } from "../utils/token.manager";
import { getDeviceId, getDeviceName } from "../utils/device.manager";
import {
  LoginRequest,
  LoginResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  SignupRequest,
  SignupResponse,
  UserInfo,
  LogoutRequest,
} from "../types";
import { SessionInfo } from "../types/session.types";

export class AuthService {
  /**
   * Login user with email and password
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      // Always ensure device info is included (for multi-device support)
      const deviceId = credentials.device_id || getDeviceId();
      const deviceName = credentials.device_name || getDeviceName();
      
      // Add device info if not provided (for multi-device support)
      const loginPayload: LoginRequest = {
        ...credentials,
        device_id: deviceId,
        device_name: deviceName,
      };

      // Log for debugging
      console.log('Login with device:', { deviceId, deviceName });

      const response = await apiClient.post("/auth/login", loginPayload);

      if (response.data.success && response.data.data) {
        const { access_token, refresh_token, user_info } = response.data.data;

        // Store tokens and user info
        TokenManager.setTokens(access_token, refresh_token, user_info);

        return response.data.data;
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.log("Login error:", error);
      throw error;
    }
  }

  /**
   * Register new user
   */
  static async signup(signupData: SignupRequest): Promise<SignupResponse> {
    try {
      const response = await apiClient.post("/auth/register", signupData);

      if (response.data.success && response.data.data) {
        const { user_info, access_token, refresh_token } = response.data.data;

        // Store tokens and user info
        TokenManager.setTokens(access_token, refresh_token, user_info);

        return response.data;
      } else {
        throw new Error(response.data.message || "Signup failed");
      }
    } catch (error) {
      console.log("Signup error:", error);
      throw error;
    }
  }

  /**
   * Logout user and clear tokens
   */
  static async logout(): Promise<void> {
    try {
      // Call logout endpoint to invalidate tokens on server
      const refresh_token = TokenManager.getRefreshToken();
      if (!refresh_token) {
        throw new Error("No refresh token available");
      }
      const request: LogoutRequest = {
        refresh_token: refresh_token,
      };
      await apiClient.post("/auth/logout", request);
    } catch (error) {
      console.warn(
        "Logout API call failed, proceeding with local logout:",
        error
      );
    } finally {
      // Always clear local tokens
      TokenManager.clearAll();
    }
  }


  /**
   * Refresh JWT token using refresh token
   */
  static async refreshToken(refreshToken: string): Promise<LoginResponse> {
    try {
      const response = await apiClient.post("/auth/refresh-token", {
        refreshToken: refreshToken, // Use correct field name to match backend
      });

      if (response.data.success && response.data.data) {
        const { access_token, refresh_token, user_info } = response.data.data;

        // Store new tokens and user info
        TokenManager.setTokens(access_token, refresh_token, user_info);

        return response.data.data;
      } else {
        throw new Error(response.data.message || "Token refresh failed");
      }
    } catch (error) {
      console.log("Token refresh error:", error);
      throw error;
    }
  }

  /**
   * Verify if current token is valid
   */
  static async verifyToken(): Promise<boolean> {
    try {
      const response = await apiClient.post("/auth/verify-token");
      return response.data.success;
    } catch (error) {
      console.log("Token verification error:", error);
      return false;
    }
  }

  /**
   * Get current user info
   */
  static async getCurrentUser(): Promise<UserInfo | null> {
    try {
      const response = await apiClient.get("/auth/me");

      if (response.data.success && response.data.data) {
        // Update user info in storage
        TokenManager.setUserInfo(response.data.data);
        return response.data.data;
      }

      return null;
    } catch (error) {
      console.log("Get current user error:", error);
      return null;
    }
  }

  /**
   * Send forgot password email
   */
  static async forgotPassword(request: ForgotPasswordRequest): Promise<void> {
    try {
      const response = await apiClient.post("/auth/forgot-password", request);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to send reset email");
      }
    } catch (error) {
      console.log("Forgot password error:", error);
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(request: ResetPasswordRequest): Promise<void> {
    try {
      const response = await apiClient.post("/auth/reset-password", request);

      if (!response.data.success) {
        throw new Error(response.data.message || "Password reset failed");
      }
    } catch (error) {
      console.log("Reset password error:", error);
      throw error;
    }
  }

  /**
   * Change password for authenticated user
   */
  static async changePassword(request: ChangePasswordRequest): Promise<void> {
    try {
      const response = await apiClient.post("/auth/change-password", request);

      if (!response.data.success) {
        throw new Error(response.data.message || "Password change failed");
      }
    } catch (error) {
      console.log("Change password error:", error);
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
    const userInfo = TokenManager.getUserInfo();
    return userInfo as UserInfo | null;
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

  /**
   * Get all active sessions for current user
   */
  static async getActiveSessions(): Promise<SessionInfo[]> {
    try {
      const response = await apiClient.get("/auth/sessions");
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || "Failed to get active sessions");
    } catch (error) {
      console.log("Get active sessions error:", error);
      throw error;
    }
  }

  /**
   * Logout specific device by device ID
   */
  static async logoutDevice(deviceId: string): Promise<void> {
    try {
      const response = await apiClient.post(`/auth/sessions/${deviceId}/logout`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to logout device");
      }
    } catch (error) {
      console.log("Logout device error:", error);
      throw error;
    }
  }

  /**
   * Logout all other devices except current device
   */
  static async logoutAllOtherDevices(): Promise<void> {
    try {
      const response = await apiClient.post("/auth/sessions/logout-others");
      
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to logout other devices");
      }
    } catch (error) {
      console.log("Logout all other devices error:", error);
      throw error;
    }
  }
}
