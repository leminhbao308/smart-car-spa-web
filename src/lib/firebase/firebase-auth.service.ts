import { 
  sendSignInLinkToEmail, 
  signInWithEmailLink, 
  isSignInWithEmailLink,
  createUserWithEmailAndPassword,
  updateProfile,
  User,
  AuthError,
  sendEmailVerification,
  signOut
} from 'firebase/auth';
import { auth } from './config';

// Types
export interface SignupData {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface FirebaseAuthError {
  code: string;
  message: string;
}

export class FirebaseAuthService {
  /**
   * Gửi OTP link qua email
   */
  static async sendOTPToEmail(email: string): Promise<void> {
    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/auth/verify-email`,
        handleCodeInApp: true,
      };
      
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      
      // Lưu email vào localStorage để verify sau
      localStorage.setItem('emailForSignIn', email);
    } catch (error) {
      console.log('Error sending OTP to email:', error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Verify OTP link từ email
   */
  static async verifyEmailLink(): Promise<User | null> {
    try {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        const email = localStorage.getItem('emailForSignIn');
        
        if (email) {
          const result = await signInWithEmailLink(auth, email, window.location.href);
          localStorage.removeItem('emailForSignIn');
          return result.user;
        }
      }
      return null;
    } catch (error) {
      console.log('Error verifying email link:', error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Tạo tài khoản với email/password
   */
  static async createAccount(email: string, password: string, displayName: string): Promise<User> {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Cập nhật display name
      await updateProfile(result.user, { displayName });
      
      // Gửi email xác thực (optional)
      await sendEmailVerification(result.user);
      
      return result.user;
    } catch (error) {
      console.log('Error creating account:', error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Đăng xuất khỏi Firebase
   */
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.log('Error signing out:', error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Kiểm tra xem có phải email link không
   */
  static isEmailLink(): boolean {
    return isSignInWithEmailLink(auth, window.location.href);
  }

  /**
   * Lấy email từ localStorage
   */
  static getEmailForSignIn(): string | null {
    return localStorage.getItem('emailForSignIn');
  }

  /**
   * Xóa email từ localStorage
   */
  static clearEmailForSignIn(): void {
    localStorage.removeItem('emailForSignIn');
  }

  /**
   * Xử lý lỗi Firebase Auth
   */
  private static handleAuthError(error: AuthError): FirebaseAuthError {
    const errorMessages: { [key: string]: string } = {
      'auth/email-already-in-use': 'Email này đã được sử dụng',
      'auth/invalid-email': 'Email không hợp lệ',
      'auth/operation-not-allowed': 'Thao tác không được phép',
      'auth/weak-password': 'Mật khẩu quá yếu',
      'auth/user-disabled': 'Tài khoản đã bị vô hiệu hóa',
      'auth/user-not-found': 'Không tìm thấy tài khoản',
      'auth/wrong-password': 'Mật khẩu không đúng',
      'auth/invalid-credential': 'Thông tin đăng nhập không hợp lệ',
      'auth/too-many-requests': 'Quá nhiều yêu cầu, vui lòng thử lại sau',
      'auth/network-request-failed': 'Lỗi kết nối mạng',
      'auth/requires-recent-login': 'Vui lòng đăng nhập lại để thực hiện thao tác này'
    };

    return {
      code: error.code,
      message: errorMessages[error.code] || error.message || 'Có lỗi xảy ra'
    };
  }
}