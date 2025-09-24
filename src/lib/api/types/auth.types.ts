/**
 * Authentication related types
 */

import { BaseEntity } from './common.types';

// User Role
export interface Role extends BaseEntity {
  role_name: string;
  role_code: string;
  description?: string;
  permissions?: Permission[];
}

// Permission
export interface Permission extends BaseEntity {
  permission_name: string;
  permission_code: string;
  description?: string;
}

// User Info
export interface UserInfo extends BaseEntity {
  email: string;
  full_name: string;
  phone?: string;
  avatar?: string;
  is_active: boolean;
  role: Role;
}

// Login Request
export interface LoginRequest {
  email: string;
  password: string;
}

// Login Response
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user_info: UserInfo;
  expires_in: number;
}

// Refresh Token Request
export interface RefreshTokenRequest {
  refresh_token: string;
}

// Refresh Token Response
export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

// Forgot Password Request
export interface ForgotPasswordRequest {
  email: string;
}

// Reset Password Request
export interface ResetPasswordRequest {
  token: string;
  new_password: string;
  confirm_password: string;
}

// Change Password Request
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// Auth State
export interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth Context
export interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  verifyToken: () => Promise<boolean>;
  clearError: () => void;
}
