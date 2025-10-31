"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  App,
  Form,
  Input,
  Button,
  Typography,
  Divider,
  Checkbox,
} from "antd";
import { GoogleOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import CustomerHeader from "@/components/layout/Header/customer.header";
import { AuthIntegrationService, RecaptchaVerifier, ConfirmationResult } from "@/lib/firebase";
import { useAuth } from "@/lib/api/hooks/useAuth";
import { SignupRequest } from "@/lib/api/types";

const { Text } = Typography;

interface BasicInfoFormData {
  emailOrPhone: string;
  agreeToTerms: boolean;
}

interface PasswordFormData {
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE";
  address: string;
  password: string;
  confirmPassword: string;
}

const SignupPage = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Email/Phone, 2: OTP, 3: Password
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [isGoogleSignup, setIsGoogleSignup] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpExpired, setOtpExpired] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup } = useAuth();
  
  // Phone Auth states
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const [isPhoneAuth, setIsPhoneAuth] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const handleEmailOrPhoneSubmit = async (values: BasicInfoFormData) => {
    try {
      setLoading(true);

      // Check if it's email or phone
      const isEmail = values.emailOrPhone.includes("@");
      
      setEmailOrPhone(values.emailOrPhone);
      
      if (isEmail) {
        // Email Auth Flow
        setIsPhoneAuth(false);
        await AuthIntegrationService.sendOTPToEmail(values.emailOrPhone);
        setCurrentStep(2);
        setOtpTimer(60);
        setOtpExpired(false);
        message.success(
          `Mã OTP đã được gửi đến email ${values.emailOrPhone}! Vui lòng kiểm tra hộp thư.`
        );
      } else {
        // Phone Auth Flow
        setIsPhoneAuth(true);
        
        // Create Recaptcha Verifier
        if (recaptchaVerifierRef.current) {
          AuthIntegrationService.clearRecaptchaVerifier(recaptchaVerifierRef.current);
        }
        
        const verifier = AuthIntegrationService.createRecaptchaVerifier('recaptcha-container');
        recaptchaVerifierRef.current = verifier;
        
        // Send OTP to phone
        const confirmationResult = await AuthIntegrationService.sendOTPToPhone(
          values.emailOrPhone,
          verifier
        );
        
        confirmationResultRef.current = confirmationResult;
        setCurrentStep(2);
        setOtpTimer(60);
        setOtpExpired(false);
        message.success(
          `Mã OTP đã được gửi đến số điện thoại ${values.emailOrPhone}!`
        );
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gửi OTP thất bại. Vui lòng thử lại!";
      message.error(errorMessage);
      
      // Clear recaptcha on error
      if (recaptchaVerifierRef.current) {
        AuthIntegrationService.clearRecaptchaVerifier(recaptchaVerifierRef.current);
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      setIsGoogleSignup(true);

      // Simulate Google signup
      await new Promise((resolve) => setTimeout(resolve, 2000));

      message.success("Đăng ký với Google thành công!");
      router.push("/auth/login");
    } catch {
      message.error("Đăng ký với Google thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async () => {
    try {
      setLoading(true);

      if (isPhoneAuth && confirmationResultRef.current) {
        // Phone Auth: Verify OTP code
        if (!otpCode || otpCode.length !== 6) {
          message.error("Vui lòng nhập đầy đủ mã OTP 6 chữ số!");
          return;
        }
        
        await AuthIntegrationService.verifyPhoneOTP(
          confirmationResultRef.current,
          otpCode
        );
        
        message.success("Xác thực số điện thoại thành công!");
        setCurrentStep(3);
      } else {
        // Email Auth: Firebase sử dụng email link
        message.info("Vui lòng kiểm tra email và click vào link để xác thực!");
        window.location.href = `/auth/verify-email?email=${emailOrPhone}`;
      }
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
        email: emailOrPhone,
        password: values.password,
        google_id: null,
        full_name: values.fullName,
        phone_number: values.phoneNumber,
        date_of_birth: new Date(values.dateOfBirth).toISOString(),
        gender: values.gender,
        address: values.address,
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

      if (isPhoneAuth) {
        // Phone Auth: Resend OTP
        if (recaptchaVerifierRef.current) {
          AuthIntegrationService.clearRecaptchaVerifier(recaptchaVerifierRef.current);
        }
        
        const verifier = AuthIntegrationService.createRecaptchaVerifier('recaptcha-container');
        recaptchaVerifierRef.current = verifier;
        
        const confirmationResult = await AuthIntegrationService.sendOTPToPhone(
          emailOrPhone,
          verifier
        );
        
        confirmationResultRef.current = confirmationResult;
        message.success("Mã OTP mới đã được gửi!");
      } else {
        // Email Auth: Resend OTP
        await AuthIntegrationService.sendOTPToEmail(emailOrPhone);
        message.success("Mã OTP mới đã được gửi!");
      }

      setOtpTimer(60); // Reset timer to 60 seconds
      setOtpExpired(false);
    } catch (error: unknown) {
      console.log("Error resending OTP:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Gửi lại OTP thất bại!";
      message.error(errorMessage);
      
      // Clear recaptcha on error
      if (recaptchaVerifierRef.current) {
        AuthIntegrationService.clearRecaptchaVerifier(recaptchaVerifierRef.current);
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle URL parameters for step navigation
  useEffect(() => {
    const step = searchParams.get("step");
    const email = searchParams.get("email");

    if (step === "3" && email) {
      setCurrentStep(3);
      setEmailOrPhone(email);
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
        AuthIntegrationService.clearRecaptchaVerifier(recaptchaVerifierRef.current);
      }
    };
  }, []);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            {/* Title */}
            <div style={{ textAlign: "left", marginBottom: "32px" }}>
              <h1
                style={{
                  color: "#1B2559",
                  fontSize: "32px",
                  fontWeight: "bold",
                  margin: "0 0 8px 0",
                }}
              >
                Đăng ký tài khoản
              </h1>
              <p
                style={{
                  color: "#8B92A5",
                  fontSize: "14px",
                  margin: 0,
                }}
              >
                Chọn cách đăng ký tài khoản của bạn!
              </p>
            </div>

            {/* Google Sign Up Button */}
            <Button
              type="default"
              size="large"
              block
              onClick={handleGoogleSignup}
              loading={loading && isGoogleSignup}
              style={{
                height: "48px",
                backgroundColor: "#F5F5F5",
                border: "1px solid #E0E0E0",
                borderRadius: "8px",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
              }}
            >
              <GoogleOutlined />
              <span style={{ color: "#333333", fontWeight: "500" }}>
                {loading && isGoogleSignup
                  ? "Đang đăng ký..."
                  : "Đăng ký với Google"}
              </span>
            </Button>

            {/* Divider */}
            <Divider
              orientation="center"
              style={{
                color: "#8B92A5",
                padding: "0",
                fontSize: "14px",
                borderColor: "#E0E5F2",
              }}
            >
              hoặc
            </Divider>

            {/* Email or Phone Form */}
            <Form
              form={form}
              onFinish={handleEmailOrPhoneSubmit}
              layout="vertical"
              style={{ width: "100%" }}
            >
              <Form.Item
                label={
                  <span
                    style={{
                      color: "#1B2559",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Email hoặc số điện thoại
                  </span>
                }
                name="emailOrPhone"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập email hoặc số điện thoại!",
                  },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();

                      const isEmail = value.includes("@");
                      const isPhone = /^[0-9]{10,11}$/.test(value);

                      if (isEmail) {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(value)) {
                          return Promise.reject(
                            new Error("Email không hợp lệ!")
                          );
                        }
                      } else if (isPhone) {
                        return Promise.resolve();
                      } else {
                        return Promise.reject(
                          new Error(
                            "Vui lòng nhập email hợp lệ hoặc số điện thoại 10-11 chữ số!"
                          )
                        );
                      }

                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  style={{
                    height: "48px",
                    backgroundColor: "#F8F9FA",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    color: "#1B2559",
                  }}
                  placeholder="mail@example.com hoặc 0123456789"
                />
              </Form.Item>

              <Form.Item
                name="agreeToTerms"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error("Vui lòng đồng ý với điều khoản sử dụng!")
                          ),
                  },
                ]}
                style={{ marginBottom: "24px" }}
              >
                <Checkbox
                  style={{
                    color: "#1B2559",
                    fontSize: "14px",
                  }}
                >
                  Tôi đồng ý với{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    style={{ color: "#3B82F6" }}
                  >
                    điều khoản sử dụng
                  </Link>{" "}
                  và{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    style={{ color: "#3B82F6" }}
                  >
                    chính sách bảo mật
                  </Link>
                </Checkbox>
              </Form.Item>

              <Form.Item style={{ marginBottom: "24px" }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  block
                  style={{
                    height: "48px",
                    backgroundColor: "#6C7BEA",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  {loading ? "Đang gửi OTP..." : "Gửi mã xác thực"}
                </Button>
              </Form.Item>
            </Form>

            {/* reCAPTCHA Container - Hidden but needed for Phone Auth */}
            <div
              id="recaptcha-container"
              style={{
                display: "none",
              }}
            />
          </>
        );

      case 2:
        return (
          <>
            {/* Title */}
            <div style={{ textAlign: "left", marginBottom: "32px" }}>
              <h1
                style={{
                  color: "#1B2559",
                  fontSize: "32px",
                  fontWeight: "bold",
                  margin: "0 0 8px 0",
                }}
              >
                {isPhoneAuth ? "Xác thực số điện thoại" : "Xác thực Email"}
              </h1>
              <p
                style={{
                  color: "#8B92A5",
                  fontSize: "14px",
                  margin: 0,
                }}
              >
                {isPhoneAuth 
                  ? `Chúng tôi đã gửi mã OTP đến ${emailOrPhone}`
                  : `Chúng tôi đã gửi link xác thực đến ${emailOrPhone}`}
              </p>
            </div>

            {isPhoneAuth ? (
              <>
                {/* OTP Input for Phone */}
                <div style={{ marginBottom: "24px" }}>
                  <Input.OTP
                    length={6}
                    value={otpCode}
                    onChange={setOtpCode}
                    style={{
                      gap: "8px",
                    }}
                  />
                </div>

                {/* Verify Button */}
                <Button
                  type="primary"
                  onClick={handleOTPVerify}
                  loading={loading}
                  size="large"
                  block
                  disabled={!otpCode || otpCode.length !== 6}
                  style={{
                    height: "48px",
                    backgroundColor: "#6C7BEA",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "16px",
                  }}
                >
                  {loading ? "Đang xác thực..." : "Xác thực mã OTP"}
                </Button>
              </>
            ) : (
              <>
                {/* Email Verification Info */}
                <div
                  style={{
                    marginBottom: "24px",
                    padding: "16px",
                    backgroundColor: "#F8F9FA",
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <p
                      style={{
                        color: "#1B2559",
                        fontSize: "14px",
                        margin: "0 0 8px 0",
                      }}
                    >
                      📧 Kiểm tra hộp thư của bạn
                    </p>
                    <p style={{ color: "#8B92A5", fontSize: "12px", margin: 0 }}>
                      Click vào link trong email để xác thực tài khoản
                    </p>
                  </div>
                </div>

                {/* Verify Button for Email */}
                <Button
                  type="primary"
                  onClick={handleOTPVerify}
                  loading={loading}
                  size="large"
                  block
                  style={{
                    height: "48px",
                    backgroundColor: "#6C7BEA",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "16px",
                  }}
                >
                  {loading ? "Đang xử lý..." : "Tôi đã xác thực email"}
                </Button>
              </>
            )}

            {/* Resend OTP */}
            <div style={{ textAlign: "center" }}>
              <Text style={{ color: "#8B92A5", fontSize: "14px" }}>
                {isPhoneAuth ? "Không nhận được mã OTP? " : "Không nhận được email? "}
              </Text>
              {otpExpired ? (
                <Button
                  type="link"
                  onClick={resendOTP}
                  loading={loading}
                  style={{
                    color: "#3B82F6",
                    padding: 0,
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Gửi lại
                </Button>
              ) : (
                <Text style={{ color: "#8B92A5", fontSize: "14px" }}>
                  Gửi lại sau {otpTimer}s
                </Text>
              )}
            </div>

            {/* Back Button */}
            <div style={{ textAlign: "center", marginTop: "16px" }}>
              <Button
                type="link"
                onClick={() => {
                  setCurrentStep(1);
                  setIsPhoneAuth(false);
                  setOtpCode("");
                  if (recaptchaVerifierRef.current) {
                    AuthIntegrationService.clearRecaptchaVerifier(recaptchaVerifierRef.current);
                    recaptchaVerifierRef.current = null;
                  }
                }}
                style={{
                  color: "#8B92A5",
                  padding: 0,
                  fontSize: "14px",
                }}
              >
                ← Quay lại
              </Button>
            </div>

            {/* reCAPTCHA Container - Hidden but needed for Phone Auth */}
            <div
              id="recaptcha-container"
              style={{
                display: "none",
              }}
            />
          </>
        );

      case 3:
        return (
          <>
            {/* Title */}
            <div style={{ textAlign: "left", marginBottom: "32px" }}>
              <h1
                style={{
                  color: "#1B2559",
                  fontSize: "32px",
                  fontWeight: "bold",
                  margin: "0 0 8px 0",
                }}
              >
                Hoàn thành đăng ký
              </h1>
              <p
                style={{
                  color: "#8B92A5",
                  fontSize: "14px",
                  margin: 0,
                }}
              >
                Nhập thông tin cá nhân và tạo mật khẩu để hoàn tất đăng ký
              </p>
            </div>

            {/* Password Form */}
            <Form
              form={form}
              onFinish={handlePasswordSubmit}
              layout="vertical"
              style={{ width: "100%" }}
            >
              <Form.Item
                label={
                  <span
                    style={{
                      color: "#1B2559",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Họ và tên
                  </span>
                }
                name="fullName"
                rules={[
                  { required: true, message: "Vui lòng nhập họ và tên!" },
                  { min: 2, message: "Họ tên phải có ít nhất 2 ký tự!" },
                ]}
              >
                <Input
                  placeholder="Nhập họ và tên"
                  style={{
                    height: "48px",
                    backgroundColor: "#F8F9FA",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    color: "#1B2559",
                  }}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span
                    style={{
                      color: "#1B2559",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Số điện thoại
                  </span>
                }
                name="phoneNumber"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                  {
                    pattern: /^[0-9]{10,11}$/,
                    message: "Số điện thoại phải có 10-11 chữ số!",
                  },
                ]}
              >
                <Input
                  placeholder="Nhập số điện thoại"
                  style={{
                    height: "48px",
                    backgroundColor: "#F8F9FA",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    color: "#1B2559",
                  }}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span
                    style={{
                      color: "#1B2559",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Ngày sinh
                  </span>
                }
                name="dateOfBirth"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày sinh!" },
                ]}
              >
                <Input
                  type="date"
                  style={{
                    height: "48px",
                    backgroundColor: "#F8F9FA",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    color: "#1B2559",
                  }}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span
                    style={{
                      color: "#1B2559",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Giới tính
                  </span>
                }
                name="gender"
                rules={[
                  { required: true, message: "Vui lòng chọn giới tính!" },
                ]}
              >
                <select
                  style={{
                    height: "48px",
                    backgroundColor: "#F8F9FA",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    color: "#1B2559",
                    width: "100%",
                    padding: "0 12px",
                  }}
                >
                  <option value="">Chọn giới tính</option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                </select>
              </Form.Item>

              <Form.Item
                label={
                  <span
                    style={{
                      color: "#1B2559",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Địa chỉ
                  </span>
                }
                name="address"
                rules={[
                  { required: true, message: "Vui lòng nhập địa chỉ!" },
                  { min: 5, message: "Địa chỉ phải có ít nhất 5 ký tự!" },
                ]}
              >
                <Input
                  placeholder="Nhập địa chỉ"
                  style={{
                    height: "48px",
                    backgroundColor: "#F8F9FA",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    color: "#1B2559",
                  }}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span
                    style={{
                      color: "#1B2559",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Mật khẩu
                  </span>
                }
                name="password"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu!" },
                  { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
                ]}
              >
                <Input.Password
                  placeholder="Ít nhất 6 ký tự"
                  style={{
                    height: "48px",
                    backgroundColor: "#F8F9FA",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    color: "#1B2559",
                  }}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span
                    style={{
                      color: "#1B2559",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Xác nhận mật khẩu
                  </span>
                }
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Mật khẩu xác nhận không khớp!")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  placeholder="Nhập lại mật khẩu"
                  style={{
                    height: "48px",
                    backgroundColor: "#F8F9FA",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    color: "#1B2559",
                  }}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: "24px" }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  block
                  style={{
                    height: "48px",
                    backgroundColor: "#6C7BEA",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  {loading ? "Đang tạo tài khoản..." : "Hoàn thành đăng ký"}
                </Button>
              </Form.Item>
            </Form>

            {/* Back Button */}
            <div style={{ textAlign: "center" }}>
              <Button
                type="link"
                onClick={() => setCurrentStep(2)}
                style={{
                  color: "#8B92A5",
                  padding: 0,
                  fontSize: "14px",
                }}
              >
                ← Quay lại
              </Button>
            </div>
          </>
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
        <CustomerHeader />

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
