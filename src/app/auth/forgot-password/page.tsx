"use client";
import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Typography, App } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CustomerHeader from "@/components/layout/Header/customer.header";
import {
  AuthIntegrationService,
  RecaptchaVerifier,
  ConfirmationResult,
} from "@/lib/firebase";
import { AuthService } from "@/lib/api/services/auth.service";
import { ForgotPasswordRequest } from "@/lib/api/types";
import {
  Step1PhoneInput,
  Step2OTPVerify,
  Step3NewPassword,
  Step4Success,
} from "@/components/auth/forgot-password";

const { Title, Text } = Typography;

const ForgotPasswordPage: React.FC = () => {
  const { message } = App.useApp();
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Phone, 2: OTP, 3: New Password, 4: Success
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpExpired, setOtpExpired] = useState(false);

  // Phone Auth states
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);

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

  const handlePhoneSubmit = async (values: { phoneNumber: string }) => {
    setLoading(true);
    try {
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
    setLoading(true);
    try {
      if (!otp || otp.length !== 6) {
        message.error("Vui lòng nhập đầy đủ mã OTP 6 chữ số!");
        return;
      }

      if (!confirmationResultRef.current) {
        message.error("Phiên xác thực đã hết hạn. Vui lòng thử lại!");
        return;
      }

      await AuthIntegrationService.verifyPhoneOTP(
        confirmationResultRef.current,
        otp
      );

      message.success("Xác thực OTP thành công!");
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

  const handlePasswordSubmit = async (values: {
    newPassword: string;
    confirmPassword: string;
  }) => {
    setLoading(true);
    try {
      // Prepare forgot password request
      const request: ForgotPasswordRequest = {
        phone_number: phoneNumber,
        new_password: values.newPassword,
      };

      // Call API to reset password
      await AuthService.forgotPassword(request);

      message.success("Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.");
      
      // All tokens are revoked on backend, redirect to login after a short delay
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (error: unknown) {
      console.log("Error resetting password:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra. Vui lòng thử lại!";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setLoading(true);
    try {
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
      setOtpTimer(60);
      setOtpExpired(false);
      setOtp("");
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
            form={form}
            phoneNumber={phoneNumber}
            otp={otp}
            setOtp={setOtp}
            loading={loading}
            onVerify={handleOTPVerify}
            onResend={resendOTP}
            onBack={() => {
              setCurrentStep(1);
              setOtp("");
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
          <Step3NewPassword
            form={form}
            loading={loading}
            onSubmit={handlePasswordSubmit}
            onBack={() => setCurrentStep(2)}
          />
        );

      case 4:
        return <Step4Success />;

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Quên mật khẩu?";
      case 2:
        return "Xác thực OTP";
      case 3:
        return "Đặt lại mật khẩu";
      case 4:
        return "Hoàn thành";
      default:
        return "Quên mật khẩu?";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return "Đừng lo lắng! Nhập số điện thoại của bạn và chúng tôi sẽ gửi mã OTP để khôi phục mật khẩu.";
      case 2:
        return `Nhập mã OTP 6 chữ số đã được gửi đến số điện thoại của bạn.`;
      case 3:
        return "Tạo mật khẩu mới cho tài khoản của bạn.";
      case 4:
        return "Mật khẩu đã được đặt lại thành công!";
      default:
        return "";
    }
  };

  return (
    <>
      <style jsx>{`
        .forgot-password-form-container {
          padding: 40px;
          max-width: 400px;
        }

        @media (max-width: 767px) {
          .forgot-password-form-container {
            padding: 24px;
            max-width: 350px;
            margin: 0 16px;
          }
        }

        @media (max-width: 480px) {
          .forgot-password-form-container {
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
          {/* Forgot Password Form Container */}
          <div
            className="forgot-password-form-container"
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
            <div style={{ textAlign: "center" }}>
              <Title
                level={2}
                style={{ color: "#1B2559", marginBottom: "8px" }}
              >
                {getStepTitle()}
              </Title>

              {getStepDescription() && (
                <Text
                  style={{
                    color: "#8B92A5",
                    fontSize: "16px",
                    lineHeight: "24px",
                    display: "block",
                    marginBottom: "32px",
                  }}
                >
                  {getStepDescription()}
                </Text>
              )}

              {/* Step Content */}
              {renderStepContent()}

              {/* Navigation Links */}
              {currentStep < 4 && (
                <>
                  <div style={{ textAlign: "center", marginTop: "24px" }}>
                    <Text style={{ color: "#8B92A5", fontSize: "14px" }}>
                      Nhớ mật khẩu?{" "}
                      <Link href="/auth/login">
                        <Button
                          type="link"
                          style={{
                            color: "#3B82F6",
                            padding: 0,
                            fontSize: "14px",
                            fontWeight: "500",
                          }}
                        >
                          Đăng nhập ngay
                        </Button>
                      </Link>
                    </Text>
                  </div>

                  <div style={{ textAlign: "center", marginTop: "16px" }}>
                    <Link href="/auth/signup">
                      <Button
                        type="link"
                        style={{
                          color: "#8B92A5",
                          padding: 0,
                          fontSize: "14px",
                        }}
                      >
                        Chưa có tài khoản? Đăng ký
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const ForgotPasswordPageWithApp = () => {
  return (
    <App>
      <ForgotPasswordPage />
    </App>
  );
};

export default ForgotPasswordPageWithApp;
