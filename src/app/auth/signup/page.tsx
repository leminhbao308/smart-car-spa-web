"use client";
import React, { useState, useEffect, useRef } from "react";
import { App, Form, Button } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import CustomerHeader from "@/components/layout/Header/customer.header";
import {
  AuthIntegrationService,
  RecaptchaVerifier,
  ConfirmationResult,
} from "@/lib/firebase";
import { useAuth } from "@/lib/api/hooks/useAuth";
import { SignupRequest } from "@/lib/api/types";
import {
  Step1PhoneInput,
  Step2OTPVerify,
  Step3PasswordInfo,
} from "@/components/auth/signup";

interface BasicInfoFormData {
  phoneNumber: string;
  agreeToTerms: boolean;
}

interface PasswordFormData {
  fullName: string;
  password: string;
  confirmPassword: string;
}

const SignupPage = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Phone, 2: OTP, 3: Password
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpExpired, setOtpExpired] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup } = useAuth();

  // Phone Auth states
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const [otpCode, setOtpCode] = useState("");

  const handlePhoneSubmit = async (values: BasicInfoFormData) => {
    try {
      setLoading(true);

      setPhoneNumber(values.phoneNumber);

      // Create Recaptcha Verifier
      if (recaptchaVerifierRef.current) {
        AuthIntegrationService.clearRecaptchaVerifier(
          recaptchaVerifierRef.current
        );
      }

      const verifier = AuthIntegrationService.createRecaptchaVerifier(
        "recaptcha-container"
      );
      recaptchaVerifierRef.current = verifier;

      // Send OTP to phone
      const confirmationResult = await AuthIntegrationService.sendOTPToPhone(
        values.phoneNumber,
        verifier
      );

      confirmationResultRef.current = confirmationResult;
      setCurrentStep(2);
      setOtpTimer(60);
      setOtpExpired(false);
      message.success(
        `Mã OTP đã được gửi đến số điện thoại ${values.phoneNumber}!`
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gửi OTP thất bại. Vui lòng thử lại!";
      message.error(errorMessage);

      // Clear recaptcha on error
      if (recaptchaVerifierRef.current) {
        AuthIntegrationService.clearRecaptchaVerifier(
          recaptchaVerifierRef.current
        );
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async () => {
    try {
      setLoading(true);

      // Phone Auth: Verify OTP code
      if (!otpCode || otpCode.length !== 6) {
        message.error("Vui lòng nhập đầy đủ mã OTP 6 chữ số!");
        return;
      }

      if (!confirmationResultRef.current) {
        message.error("Phiên xác thực đã hết hạn. Vui lòng thử lại!");
        return;
      }

      await AuthIntegrationService.verifyPhoneOTP(
        confirmationResultRef.current,
        otpCode
      );

      message.success("Xác thực số điện thoại thành công!");
      setCurrentStep(3);
    } catch (error: unknown) {
      console.log("Error verifying OTP:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Xác thực OTP thất bại!";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (values: PasswordFormData) => {
    try {
      setLoading(true);

      // Prepare signup data for backend API
      const signupData: SignupRequest = {
        email: null, // Backend allows null email
        password: values.password,
        google_id: null,
        full_name: values.fullName,
        phone_number: phoneNumber,
        date_of_birth: new Date().toISOString(),
        gender: "MALE",
        address: "",
        avatar_url: null,
      };

      // Call backend API to create account
      await signup(signupData);

      message.success(
        "Đăng ký thành công! Chào mừng bạn đến với Smart Car SPA!"
      );
      router.push("/");
    } catch (error: unknown) {
      console.log("Error creating account:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Đăng ký thất bại. Vui lòng thử lại!";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    try {
      setLoading(true);

      // Phone Auth: Resend OTP
      if (recaptchaVerifierRef.current) {
        AuthIntegrationService.clearRecaptchaVerifier(
          recaptchaVerifierRef.current
        );
      }

      const verifier = AuthIntegrationService.createRecaptchaVerifier(
        "recaptcha-container"
      );
      recaptchaVerifierRef.current = verifier;

      const confirmationResult = await AuthIntegrationService.sendOTPToPhone(
        phoneNumber,
        verifier
      );

      confirmationResultRef.current = confirmationResult;
      message.success("Mã OTP mới đã được gửi!");
      setOtpTimer(60); // Reset timer to 60 seconds
      setOtpExpired(false);
    } catch (error: unknown) {
      console.log("Error resending OTP:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Gửi lại OTP thất bại!";
      message.error(errorMessage);

      // Clear recaptcha on error
      if (recaptchaVerifierRef.current) {
        AuthIntegrationService.clearRecaptchaVerifier(
          recaptchaVerifierRef.current
        );
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle URL parameters for step navigation
  useEffect(() => {
    const step = searchParams.get("step");

    if (step === "3") {
      setCurrentStep(3);
    }
  }, [searchParams]);

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            setOtpExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [otpTimer]);

  // Cleanup recaptcha on unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        AuthIntegrationService.clearRecaptchaVerifier(
          recaptchaVerifierRef.current
        );
      }
    };
  }, []);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1PhoneInput
            form={form}
            loading={loading}
            onSubmit={handlePhoneSubmit}
          />
        );

      case 2:
        return (
          <Step2OTPVerify
            phoneNumber={phoneNumber}
            otpCode={otpCode}
            setOtpCode={setOtpCode}
            loading={loading}
            onVerify={handleOTPVerify}
            onResend={resendOTP}
            onBack={() => {
              setCurrentStep(1);
              setOtpCode("");
              if (recaptchaVerifierRef.current) {
                AuthIntegrationService.clearRecaptchaVerifier(
                  recaptchaVerifierRef.current
                );
                recaptchaVerifierRef.current = null;
              }
            }}
            otpTimer={otpTimer}
            otpExpired={otpExpired}
          />
        );

      case 3:
        return (
          <Step3PasswordInfo
            form={form}
            loading={loading}
            onSubmit={handlePasswordSubmit}
            onBack={() => setCurrentStep(2)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <style jsx>{`
        .signup-form-container {
          padding: 40px;
          max-width: 400px;
        }

        @media (max-width: 767px) {
          .signup-form-container {
            padding: 24px;
            max-width: 350px;
            margin: 0 16px;
          }
        }

        @media (max-width: 480px) {
          .signup-form-container {
            padding: 20px;
            max-width: 320px;
            margin: 0 12px;
          }
        }
      `}</style>
      {/* Container */}
      <div
        style={{
          minHeight: "100vh",
          position: "relative",
          backgroundColor: "#F4F7FE",
        }}
      >
        {/* Header */}
        <CustomerHeader isLoginPage={true} />

        {/* reCAPTCHA Container - Global container for all steps */}
        <div
          id="recaptcha-container"
          style={{
            width: 0,
            height: 0,
            overflow: "hidden",
          }}
        />

        {/* Form Container */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "calc(100vh - 80px)",
          }}
        >
          {/* Signup Form Container */}
          <div
            className="signup-form-container"
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              padding: "40px",
              width: "100%",
              maxWidth: "400px",
              margin: "0 20px",
              border: "1px solid #E5E7EB",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
            }}
          >
            {renderStepContent()}

            {/* Login Link - only show on first step */}
            {currentStep === 1 && (
              <div style={{ textAlign: "center", marginTop: "24px" }}>
                <span style={{ color: "#8B92A5", fontSize: "14px" }}>
                  Đã có tài khoản?{" "}
                </span>
                <Button
                  type="link"
                  style={{
                    color: "#3B82F6",
                    padding: 0,
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                  href="/auth/login"
                >
                  Đăng nhập
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const SignupPageWithApp = () => {
  return (
    <App>
      <SignupPage />
    </App>
  );
};

export default SignupPageWithApp;
