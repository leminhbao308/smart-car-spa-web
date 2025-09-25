/**
 * Authentication related types
 */

import { BaseEntity } from "./common.types";

// User Role
export interface Role {
  role_id: string;
  role_name: string;
  role_code: string;
  description: string;
  permissions?: Permission[];
}

// Permission
export interface Permission {
  permission_id: string;
  permission_name: string;
  permission_code: string;
  description: string;
  module?: string;
}

// Get All Roles Response
export interface GetAllRolesResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: Role[];
}

// Create Role Request
export interface CreateRoleRequest {
  role_name: string;
  role_code: string;
  description: string;
}

// Update Role Request
export interface UpdateRoleRequest {
  role_name: string;
  description: string;
}

// Role Response
export interface RoleResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: Role;
}

// User Info
export interface UserInfo extends BaseEntity {
  user_id: string;
  email: string;
  full_name: string;
  phone_number: string;
  date_of_birth: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  address: string;
  avatar_url?: string | null;
  is_active: boolean;
  role: Role;
  user_type: "CUSTOMER" | "ADMIN" | "STAFF";
  customer_rank?: string | null;
  accumulated_points: number;
  total_orders: number;
  total_spent: number;
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

// Refresh Token Request
export interface LogoutRequest {
  refresh_token: string;
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

// Signup Request
export interface SignupRequest {
  email: string;
  password: string;
  googleId?: string | null;
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string; // ISO date string
  gender: "MALE" | "FEMALE" | "OTHER";
  address: string;
  avatarUrl?: string | null;
}

// Signup Response
export interface SignupResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data?: {
    access_token: string;
    refresh_token: string;
    user_info: UserInfo;
  };
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
  signup: (signupData: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
  verifyToken: () => Promise<boolean>;
  clearError: () => void;
}
