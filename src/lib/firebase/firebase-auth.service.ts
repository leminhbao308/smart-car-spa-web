import { 
  sendSignInLinkToEmail, 
  signInWithEmailLink, 
  isSignInWithEmailLink,
  createUserWithEmailAndPassword,
  updateProfile,
  User,
  AuthError,
  sendEmailVerification,
  signOut,
  signInWithPhoneNumber,
  ConfirmationResult,
  RecaptchaVerifier
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

export interface PhoneAuthData {
  phoneNumber: string;
  verificationCode?: string;
  recaptchaVerifier?: RecaptchaVerifier;
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
   * Tạo Recaptcha Verifier cho Phone Auth
   */
  static createRecaptchaVerifier(elementId: string): RecaptchaVerifier {
    const verifier = new RecaptchaVerifier(auth, elementId, {
      size: 'normal',
      callback: () => {
        console.log('reCAPTCHA solved');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
      },
    });
    return verifier;
  }

  /**
   * Gửi OTP đến số điện thoại
   */
  static async sendOTPToPhone(
    phoneNumber: string,
    recaptchaVerifier: RecaptchaVerifier
  ): Promise<ConfirmationResult> {
    try {
      // Ensure phone number has country code
      let formattedPhone = phoneNumber.trim();
      
      // If phone doesn't start with +, add +84 and remove leading 0
      if (!formattedPhone.startsWith('+')) {
        // Remove leading 0 if present
        if (formattedPhone.startsWith('0')) {
          formattedPhone = formattedPhone.substring(1);
        }
        // Add Vietnam country code
        formattedPhone = `+84${formattedPhone}`;
      }
      
      console.log('Original phone:', phoneNumber);
      console.log('Formatted phone:', formattedPhone);
      
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        recaptchaVerifier
      );
      
      return confirmationResult;
    } catch (error) {
      console.log('Error sending OTP to phone:', error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Verify OTP code cho Phone Auth
   */
  static async verifyPhoneOTP(
    confirmationResult: ConfirmationResult,
    otpCode: string
  ): Promise<User> {
    try {
      const result = await confirmationResult.confirm(otpCode);
      return result.user;
    } catch (error) {
      console.log('Error verifying phone OTP:', error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Xóa Recaptcha Verifier
   */
  static clearRecaptchaVerifier(verifier: RecaptchaVerifier): void {
    if (verifier) {
      verifier.clear();
    }
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
      'auth/requires-recent-login': 'Vui lòng đăng nhập lại để thực hiện thao tác này',
      'auth/invalid-phone-number': 'Số điện thoại không hợp lệ',
      'auth/invalid-verification-code': 'Mã OTP không đúng',
      'auth/missing-verification-code': 'Vui lòng nhập mã OTP',
      'auth/code-expired': 'Mã OTP đã hết hạn',
      'auth/quota-exceeded': 'Đã vượt quá giới hạn gửi OTP',
      'auth/captcha-check-failed': 'Xác thực reCAPTCHA thất bại',
      'auth/session-expired': 'Phiên đăng nhập đã hết hạn'
    };

    return {
      code: error.code,
      message: errorMessages[error.code] || error.message || 'Có lỗi xảy ra'
    };
  }
}