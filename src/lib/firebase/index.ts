export { auth } from "./config";
export { FirebaseAuthService } from "./firebase-auth.service";
export { AuthIntegrationService } from "./auth-integration.service";
export type { SignupData, LoginData, FirebaseAuthError, PhoneAuthData } from "./firebase-auth.service";
export type { RecaptchaVerifier, ConfirmationResult } from "firebase/auth";