/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import apiClient from "../axios";
import { TokenManager } from "../utils/token.manager";
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

export class AuthService {
  /**
   * Login user with email and password
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post("/auth/login", credentials);

      if (response.data.success && response.data.data) {
        const { access_token, refresh_token, user_info } = response.data.data;

        // Store tokens and user info
        TokenManager.setTokens(access_token, refresh_token, user_info);

        return response.data.data;
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
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
      console.error("Signup error:", error);
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
   * Verify if current token is valid
   */
  static async verifyToken(): Promise<boolean> {
    try {
      const response = await apiClient.get("/auth/verify-token");
      return response.data.success;
    } catch (error) {
      console.error("Token verification error:", error);
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
      console.error("Get current user error:", error);
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
      console.error("Forgot password error:", error);
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
      console.error("Reset password error:", error);
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
      console.error("Change password error:", error);
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
}
