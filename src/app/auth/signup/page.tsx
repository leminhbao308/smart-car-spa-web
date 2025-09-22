"use client";
import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  Row,
  Col,
  Divider,
  message,
  Checkbox,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
  GoogleOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CustomerHeader from "@/components/layout/Header/customer.header";
import InputPassword from "@/components/ui/Input/input.password";
import InputOTP from "@/components/ui/Input/input.otp";

const { Title, Text } = Typography;

interface BasicInfoFormData {
  emailOrPhone: string;
  agreeToTerms: boolean;
}

interface PasswordFormData {
  password: string;
  confirmPassword: string;
}

const SignupPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Email/Phone, 2: OTP, 3: Password
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [isGoogleSignup, setIsGoogleSignup] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpExpired, setOtpExpired] = useState(false);
  const router = useRouter();

  const handleEmailOrPhoneSubmit = async (values: BasicInfoFormData) => {
    try {
      setLoading(true);

      // Simulate API call to send OTP
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setEmailOrPhone(values.emailOrPhone);
      setCurrentStep(2);
      setOtpTimer(60); // 60 seconds countdown
      setOtpExpired(false);

      // Determine if it's email or phone
      const isEmail = values.emailOrPhone.includes("@");
      const messageText = isEmail
        ? `Mã OTP đã được gửi đến email ${values.emailOrPhone}!`
        : `Mã OTP đã được gửi đến số điện thoại ${values.emailOrPhone}!`;

      message.success(messageText);
    } catch (error) {
      message.error("Gửi OTP thất bại. Vui lòng thử lại!");
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
    } catch (error) {
      message.error("Đăng ký với Google thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async () => {
    try {
      setLoading(true);

      // Simulate OTP verification
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (otp === "123456") {
        // Mock OTP
        setOtpVerified(true);
        setCurrentStep(3);
        message.success("Xác thực OTP thành công!");
      } else {
        message.error("Mã OTP không đúng!");
      }
    } catch (error) {
      message.error("Xác thực OTP thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (values: PasswordFormData) => {
    try {
      setLoading(true);

      // Simulate API call for final registration
      await new Promise((resolve) => setTimeout(resolve, 2000));

      message.success("Đăng ký thành công! Vui lòng đăng nhập.");
      router.push("/auth/login");
    } catch (error) {
      message.error("Đăng ký thất bại. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setOtpTimer(60); // Reset timer to 60 seconds
      setOtpExpired(false);
      setOtp(""); // Clear current OTP
      message.success("Mã OTP mới đã được gửi!");
    } catch (error) {
      message.error("Gửi lại OTP thất bại!");
    } finally {
      setLoading(false);
    }
  };

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
                Xác thực OTP
              </h1>
              <p
                style={{
                  color: "#8B92A5",
                  fontSize: "14px",
                  margin: 0,
                }}
              >
                Nhập mã OTP đã được gửi đến {emailOrPhone}
              </p>
            </div>

            {/* OTP Input */}
            <div style={{ marginBottom: "24px" }}>
              <Input.OTP
                value={otp}
                onChange={setOtp}
                length={6}
                style={{
                  justifyContent: "center",
                  gap: "12px",
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
              disabled={otp.length !== 6}
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
              {loading ? "Đang xác thực..." : "Xác thực OTP"}
            </Button>

            {/* Resend OTP */}
            <div style={{ textAlign: "center" }}>
              <Text style={{ color: "#8B92A5", fontSize: "14px" }}>
                Không nhận được mã?{" "}
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
                onClick={() => setCurrentStep(1)}
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
                Tạo mật khẩu
              </h1>
              <p
                style={{
                  color: "#8B92A5",
                  fontSize: "14px",
                  margin: 0,
                }}
              >
                Tạo mật khẩu mạnh để bảo vệ tài khoản của bạn
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

export default SignupPage;
