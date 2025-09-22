"use client";
import React, { useState, useEffect } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { MailOutlined, LockOutlined, CheckCircleOutlined, PhoneOutlined } from "@ant-design/icons";
import Link from "next/link";
import CustomerHeader from "@/components/layout/Header/customer.header";

const { Title, Text } = Typography;


const ForgotPasswordPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Email/Phone, 2: OTP, 3: New Password, 4: Success
  const [contactMethod, setContactMethod] = useState<"email" | "phone">("email");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpExpired, setOtpExpired] = useState(false);

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

  const handleContactSubmit = async (values: { emailOrPhone: string }) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      console.log("Send OTP to:", contactMethod, values.emailOrPhone);
      setEmailOrPhone(values.emailOrPhone);
      setCurrentStep(2);
      setOtpTimer(60); // 60 seconds countdown
      setOtpExpired(false);
      
      const methodText = contactMethod === "email" ? "email" : "số điện thoại";
      message.success(`Mã OTP đã được gửi đến ${methodText} của bạn!`);
    } catch {
      message.error("Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async (values: { otp: string }) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      console.log("Verify OTP:", values.otp);
      setOtp(values.otp);
      setCurrentStep(3);
      message.success("Xác thực OTP thành công!");
    } catch {
      message.error("Mã OTP không đúng. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (values: { newPassword: string; confirmPassword: string }) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      console.log("Reset password:", { emailOrPhone, contactMethod, otp, newPassword: values.newPassword });
      setCurrentStep(4);
      message.success("Đặt lại mật khẩu thành công!");
    } catch {
      message.error("Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setOtpTimer(60); // Reset timer to 60 seconds
      setOtpExpired(false);
      setOtp(""); // Clear current OTP
      message.success("Mã OTP mới đã được gửi!");
    } catch {
      message.error("Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Form
            form={form}
            name="forgot-password-contact"
            onFinish={handleContactSubmit}
            layout="vertical"
            size="large"
          >
            {/* Contact Method Selection */}
            <Form.Item
              label={
                <Text style={{ color: "#1B2559", fontSize: "14px", fontWeight: "500" }}>
                  Chọn phương thức nhận OTP
                </Text>
              }
            >
              <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                {/* Email Option */}
                <div
                  onClick={() => setContactMethod("email")}
                  style={{
                    flex: 1,
                    padding: "16px",
                    border: `2px solid ${contactMethod === "email" ? "#3B82F6" : "#E0E0E0"}`,
                    borderRadius: "12px",
                    cursor: "pointer",
                    backgroundColor: contactMethod === "email" ? "#F0F7FF" : "#FFFFFF",
                    transition: "all 0.3s ease",
                    textAlign: "center",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    if (contactMethod !== "email") {
                      e.currentTarget.style.borderColor = "#3B82F6";
                      e.currentTarget.style.backgroundColor = "#F8FAFF";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (contactMethod !== "email") {
                      e.currentTarget.style.borderColor = "#E0E0E0";
                      e.currentTarget.style.backgroundColor = "#FFFFFF";
                    }
                  }}
                >
                  {/* Selection Indicator */}
                  {contactMethod === "email" && (
                    <div
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        backgroundColor: "#3B82F6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: "#FFFFFF",
                        }}
                      />
                    </div>
                  )}
                  
                  <MailOutlined 
                    style={{ 
                      fontSize: "24px", 
                      color: contactMethod === "email" ? "#3B82F6" : "#8B92A5",
                      marginBottom: "8px",
                      display: "block"
                    }} 
                  />
                  <Text 
                    style={{ 
                      fontSize: "14px", 
                      fontWeight: "500",
                      color: contactMethod === "email" ? "#1B2559" : "#8B92A5",
                      display: "block"
                    }}
                  >
                    Email
                  </Text>
                </div>

                {/* Phone Option */}
                <div
                  onClick={() => setContactMethod("phone")}
                  style={{
                    flex: 1,
                    padding: "16px",
                    border: `2px solid ${contactMethod === "phone" ? "#3B82F6" : "#E0E0E0"}`,
                    borderRadius: "12px",
                    cursor: "pointer",
                    backgroundColor: contactMethod === "phone" ? "#F0F7FF" : "#FFFFFF",
                    transition: "all 0.3s ease",
                    textAlign: "center",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    if (contactMethod !== "phone") {
                      e.currentTarget.style.borderColor = "#3B82F6";
                      e.currentTarget.style.backgroundColor = "#F8FAFF";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (contactMethod !== "phone") {
                      e.currentTarget.style.borderColor = "#E0E0E0";
                      e.currentTarget.style.backgroundColor = "#FFFFFF";
                    }
                  }}
                >
                  {/* Selection Indicator */}
                  {contactMethod === "phone" && (
                    <div
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        backgroundColor: "#3B82F6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: "#FFFFFF",
                        }}
                      />
                    </div>
                  )}
                  
                  <PhoneOutlined 
                    style={{ 
                      fontSize: "24px", 
                      color: contactMethod === "phone" ? "#3B82F6" : "#8B92A5",
                      marginBottom: "8px",
                      display: "block"
                    }} 
                  />
                  <Text 
                    style={{ 
                      fontSize: "14px", 
                      fontWeight: "500",
                      color: contactMethod === "phone" ? "#1B2559" : "#8B92A5",
                      display: "block"
                    }}
                  >
                    Số điện thoại
                  </Text>
                </div>
              </div>
            </Form.Item>

            <Form.Item
              name="emailOrPhone"
              label={
                <Text style={{ color: "#1B2559", fontSize: "14px", fontWeight: "500" }}>
                  {contactMethod === "email" ? "Email" : "Số điện thoại"}
                </Text>
              }
              rules={[
                { required: true, message: `Vui lòng nhập ${contactMethod === "email" ? "email" : "số điện thoại"}!` },
                ...(contactMethod === "email" 
                  ? [{ type: "email" as const, message: "Email không hợp lệ!" }]
                  : [{ pattern: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ!" }]
                ),
              ]}
            >
              <Input
                prefix={
                  contactMethod === "email" 
                    ? <MailOutlined style={{ color: "#8B92A5" }} />
                    : <PhoneOutlined style={{ color: "#8B92A5" }} />
                }
                placeholder={
                  contactMethod === "email" 
                    ? "Nhập email của bạn" 
                    : "Nhập số điện thoại của bạn"
                }
                style={{
                  height: "48px",
                  borderRadius: "8px",
                  border: "1px solid #E0E0E0",
                  fontSize: "16px",
                }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: "24px" }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{
                  height: "48px",
                  borderRadius: "8px",
                  backgroundColor: "#3B82F6",
                  borderColor: "#3B82F6",
                  fontSize: "16px",
                  fontWeight: "500",
                }}
              >
                Gửi mã OTP
              </Button>
            </Form.Item>
          </Form>
        );

      case 2:
        return (
          <Form
            form={form}
            name="forgot-password-otp"
            onFinish={handleOTPVerify}
            layout="vertical"
            size="large"
          >
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <Text style={{ color: "#8B92A5", fontSize: "16px", lineHeight: "24px" }}>
                Chúng tôi đã gửi mã OTP đến{" "}
                {contactMethod === "email" ? "email" : "số điện thoại"}{" "}
                <Text strong style={{ color: "#1B2559" }}>{emailOrPhone}</Text>
              </Text>
            </div>

            <Form.Item
              name="otp"
              label={
                <Text style={{ color: "#1B2559", fontSize: "14px", fontWeight: "500" }}>
                  Mã OTP
                </Text>
              }
              rules={[
                { required: true, message: "Vui lòng nhập mã OTP!" },
                { len: 6, message: "Mã OTP phải có 6 chữ số!" },
              ]}
            >
              <Input.OTP
                value={otp}
                onChange={setOtp}
                length={6}
                style={{
                  justifyContent: "center",
                  gap: "8px",
                }}
              />
            </Form.Item>

            <div style={{ textAlign: "center", marginBottom: "24px" }}>
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
                  Gửi lại mã OTP
                </Button>
              ) : (
                <Text style={{ color: "#8B92A5", fontSize: "14px" }}>
                  Gửi lại sau {otpTimer}s
                </Text>
              )}
            </div>

            <Form.Item style={{ marginBottom: "24px" }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{
                  height: "48px",
                  borderRadius: "8px",
                  backgroundColor: "#3B82F6",
                  borderColor: "#3B82F6",
                  fontSize: "16px",
                  fontWeight: "500",
                }}
              >
                Xác thực OTP
              </Button>
            </Form.Item>
          </Form>
        );

      case 3:
        return (
          <Form
            form={form}
            name="forgot-password-new"
            onFinish={handlePasswordSubmit}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="newPassword"
              label={
                <Text style={{ color: "#1B2559", fontSize: "14px", fontWeight: "500" }}>
                  Mật khẩu mới
                </Text>
              }
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "#8B92A5" }} />}
                placeholder="Nhập mật khẩu mới"
                style={{
                  height: "48px",
                  borderRadius: "8px",
                  border: "1px solid #E0E0E0",
                  fontSize: "16px",
                }}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label={
                <Text style={{ color: "#1B2559", fontSize: "14px", fontWeight: "500" }}>
                  Xác nhận mật khẩu mới
                </Text>
              }
              dependencies={['newPassword']}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "#8B92A5" }} />}
                placeholder="Nhập lại mật khẩu mới"
                style={{
                  height: "48px",
                  borderRadius: "8px",
                  border: "1px solid #E0E0E0",
                  fontSize: "16px",
                }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: "24px" }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{
                  height: "48px",
                  borderRadius: "8px",
                  backgroundColor: "#3B82F6",
                  borderColor: "#3B82F6",
                  fontSize: "16px",
                  fontWeight: "500",
                }}
              >
                Đặt lại mật khẩu
              </Button>
            </Form.Item>
          </Form>
        );

      case 4:
        return (
          <div style={{ textAlign: "center" }}>
            {/* Success Icon */}
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "#52c41a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <CheckCircleOutlined style={{ fontSize: "32px", color: "white" }} />
            </div>

            <Title level={2} style={{ color: "#1B2559", marginBottom: "16px" }}>
              Đặt lại mật khẩu thành công!
            </Title>

            <Text style={{ color: "#8B92A5", fontSize: "16px", lineHeight: "24px", display: "block", marginBottom: "32px" }}>
              Mật khẩu của bạn đã được đặt lại thành công. 
              Bây giờ bạn có thể đăng nhập với mật khẩu mới.
            </Text>

            <Link href="/auth/login">
              <Button
                type="primary"
                block
                style={{
                  height: "48px",
                  borderRadius: "8px",
                  backgroundColor: "#3B82F6",
                  borderColor: "#3B82F6",
                  fontSize: "16px",
                  fontWeight: "500",
                }}
              >
                Đăng nhập ngay
              </Button>
            </Link>
          </div>
        );

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
        return "Đừng lo lắng! Chọn phương thức nhận OTP và chúng tôi sẽ gửi mã để khôi phục mật khẩu.";
      case 2:
        return `Nhập mã OTP 6 chữ số đã được gửi đến ${contactMethod === "email" ? "email" : "số điện thoại"} của bạn.`;
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
              <Title level={2} style={{ color: "#1B2559", marginBottom: "8px" }}>
                {getStepTitle()}
              </Title>

              {getStepDescription() && (
                <Text style={{ color: "#8B92A5", fontSize: "16px", lineHeight: "24px", display: "block", marginBottom: "32px" }}>
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

export default ForgotPasswordPage;
