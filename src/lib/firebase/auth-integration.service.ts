/**
 * Auth Integration Service
 * Tích hợp Firebase Auth với Backend API Auth Service
 */

import { FirebaseAuthService, FirebaseAuthError } from './firebase-auth.service';
import { AuthService } from '../api/services/auth.service';
import { User } from 'firebase/auth';
import { SignupRequest } from '../api/types';

export class AuthIntegrationService {
  /**
   * Gửi OTP qua email sử dụng Firebase
   */
  static async sendOTPToEmail(email: string): Promise<void> {
    try {
      await FirebaseAuthService.sendOTPToEmail(email);
    } catch (error) {
      const firebaseError = error as FirebaseAuthError;
      throw new Error(firebaseError.message);
    }
  }

  /**
   * Verify email link và tạo tài khoản Firebase
   */
  static async verifyEmailAndCreateFirebaseAccount(
    email: string, 
    password: string, 
    displayName: string
  ): Promise<User> {
    try {
      // Tạo tài khoản Firebase
      const firebaseUser = await FirebaseAuthService.createAccount(email, password, displayName);
      
      // TODO: Có thể sync với backend API ở đây nếu cần
      // await this.syncUserWithBackend(firebaseUser);
      
      return firebaseUser;
    } catch (error) {
      const firebaseError = error as FirebaseAuthError;
      throw new Error(firebaseError.message);
    }
  }

  /**
   * Tạo tài khoản với backend API (không cần Firebase)
   */
  static async createAccountWithBackend(signupData: SignupRequest): Promise<void> {
    try {
      await AuthService.signup(signupData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify email link từ URL
   */
  static async verifyEmailLink(): Promise<User | null> {
    try {
      return await FirebaseAuthService.verifyEmailLink();
    } catch (error) {
      const firebaseError = error as FirebaseAuthError;
      throw new Error(firebaseError.message);
    }
  }

  /**
   * Đăng xuất khỏi cả Firebase và Backend
   */
  static async signOut(): Promise<void> {
    try {
      // Đăng xuất khỏi Firebase
      await FirebaseAuthService.signOut();
      
      // Đăng xuất khỏi Backend API
      await AuthService.logout();
    } catch (error) {
      console.warn('Error during sign out:', error);
      // Vẫn clear local storage
      AuthService.clearAuth();
    }
  }

  /**
   * Kiểm tra trạng thái đăng nhập
   */
  static isAuthenticated(): boolean {
    // Kiểm tra cả Firebase và Backend auth
    return AuthService.isAuthenticated();
  }

  /**
   * Lấy thông tin user hiện tại
   */
  static getCurrentUser() {
    return AuthService.getCurrentUserFromStorage();
  }

  /**
   * Helper methods
   */
  static isEmailLink(): boolean {
    return FirebaseAuthService.isEmailLink();
  }

  static getEmailForSignIn(): string | null {
    return FirebaseAuthService.getEmailForSignIn();
  }

  static clearEmailForSignIn(): void {
    FirebaseAuthService.clearEmailForSignIn();
  }

  /**
   * Sync Firebase user với Backend API (Optional)
   * Có thể implement sau nếu cần sync user data
   */
  private static async syncUserWithBackend(firebaseUser: User): Promise<void> {
    // TODO: Implement sync logic với backend API
    // Ví dụ: Gửi Firebase user data lên backend để lưu thông tin user
    console.log('Syncing Firebase user with backend:', firebaseUser);
  }
}
