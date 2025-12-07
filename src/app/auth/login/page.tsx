"use client";
import CustomerHeader from "@/components/layout/Header/customer.header";
import InputPassword from "@/components/ui/Input/input.password";
import { ROUTES } from "@/components/utils/constant/path.route";
import { useAuth, AuthService } from "@/lib/api";
import { GoogleOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import {
  App,
  Button,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Spin,
} from "antd";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface LoginFormValues {
  identifier: string;
  password: string;
  remember: boolean;
}

// Constants
const REMEMBERED_EMAIL_KEY = "remembered_email";
const MIN_PASSWORD_LENGTH = 3;

const LoginForm = () => {
  const [form] = Form.useForm();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [mounted, setMounted] = useState(false);
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();
  const router = useRouter();
  const { message } = App.useApp();

  // Kiểm tra nếu user đã đăng nhập thì redirect
  useEffect(() => {
    if (isAuthenticated) {
      // Tất cả user (admin, employee, customer) đều về trang chủ
      router.push(ROUTES.HOME);
    }
  }, [isAuthenticated, router]);

  // Kiểm tra redirect_after_login cookie
  useEffect(() => {
    const checkRedirectAfterLogin = () => {
      if (typeof document !== "undefined") {
        const cookies = document.cookie.split(";");
        const redirectCookie = cookies.find((cookie) =>
          cookie.trim().startsWith("redirect_after_login=")
        );

        if (redirectCookie) {
          const redirectPath = redirectCookie.split("=")[1];
          // Xóa cookie sau khi đọc
          document.cookie = "redirect_after_login=; max-age=0; path=/";
          return redirectPath;
        }
      }
      return null;
    };

    const redirectPath = checkRedirectAfterLogin();
    if (redirectPath && isAuthenticated) {
      router.push(redirectPath);
    }
  }, [isAuthenticated, router]);

  /**
   * Handle form submit
   * @param values Form values
   */
  const onFinish = async (values: LoginFormValues) => {
    try {
      clearError(); // Clear any previous errors

      // Determine if identifier is email or phone
      const isEmail = values.identifier.includes("@");

      await login({
        [isEmail ? "email" : "phone_number"]: values.identifier,
        password: values.password,
      });

      message.success("Đăng nhập thành công!");

      // Lưu thông tin remember me nếu được chọn (only for email)
      if (values.remember && isEmail) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, values.identifier);
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }

      // Tất cả user (admin, employee, customer) đều về trang chủ sau khi đăng nhập
      router.push(ROUTES.HOME);
    } catch (error) {
      console.log("Login error:", error);
      message.error("Đăng nhập thất bại!");
    }
  };

  // Set mounted flag to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load remembered email on component mount (only on client)
  useEffect(() => {
    if (!mounted) return;
    
    const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (rememberedEmail) {
      setIdentifier(rememberedEmail);
      form.setFieldsValue({ identifier: rememberedEmail, remember: true });
    }
  }, [form, mounted]);

  // Handle Google login (placeholder for future implementation)
  const handleGoogleLogin = () => {
    message.info("Chức năng đăng nhập với Google đang được phát triển!");
  };

  return (
    <>
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

        {/* Form Container */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "calc(100vh - 80px)",
          }}
        >
          {/* Login Form Container */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              padding: "40px",
              width: "100%",
              maxWidth: "30rem",
              margin: "0 20px",
              border: "1px solid #E5E7EB",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
            }}
          >
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
                Đăng nhập
              </h1>
              <p
                style={{
                  color: "#8B92A5",
                  fontSize: "14px",
                  margin: 0,
                }}
              >
                Nhập vào thông tin để đăng nhập!
              </p>
            </div>

            {/* Google Sign In Button */}
            <Button
              type="default"
              size="large"
              block
              onClick={handleGoogleLogin}
              disabled={isLoading}
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
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              <GoogleOutlined />
              <span style={{ color: "#333333", fontWeight: "500" }}>
                Đăng nhập với Google
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

            {/* Form */}
            <Form
              onFinish={onFinish}
              layout="vertical"
              form={form}
              style={{ width: "100%" }}
              disabled={isLoading}
            >
              {/* Error Display */}
              {error && (
                <div
                  style={{
                    backgroundColor: "#fff2f0",
                    border: "1px solid #ffccc7",
                    borderRadius: "6px",
                    padding: "12px",
                    marginBottom: "16px",
                    color: "#ff4d4f",
                    fontSize: "14px",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Email or Phone Input */}
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
                name="identifier"
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
                initialValue={identifier}
              >
                <Input
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    // Dynamically change icon based on input
                  }}
                  prefix={
                    mounted && identifier.includes("@") ? (
                      <MailOutlined style={{ color: "#8B92A5" }} />
                    ) : (
                      <PhoneOutlined style={{ color: "#8B92A5" }} />
                    )
                  }
                  style={{
                    height: "48px",
                    backgroundColor: "#F8F9FA",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    color: "#1B2559",
                  }}
                  placeholder="mail@scsms.com hoặc 0123456789"
                  disabled={isLoading}
                />
              </Form.Item>

              {/* Password Input */}
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
                  { required: true, message: "" },
                  {
                    min: MIN_PASSWORD_LENGTH,
                    message: `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự!`,
                  },
                ]}
              >
                <InputPassword
                  value={password}
                  onChange={setPassword}
                  placeholderCustom={`Ít nhất ${MIN_PASSWORD_LENGTH} ký tự`}
                  style={{
                    height: "48px",
                    backgroundColor: "#F8F9FA",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    color: "#1B2559",
                    opacity: isLoading ? 0.6 : 1,
                  }}
                />
              </Form.Item>

              {/* Remember & Forgot */}
              <Row
                justify="space-between"
                align="middle"
                style={{ marginBottom: "24px" }}
              >
                <Col>
                  <Form.Item
                    name="remember"
                    valuePropName="checked"
                    style={{ margin: 0 }}
                  >
                    <Checkbox
                      style={{
                        color: "#1B2559",
                        fontSize: "14px",
                      }}
                    >
                      Lưu đăng nhập
                    </Checkbox>
                  </Form.Item>
                </Col>
                <Col>
                  <Button
                    type="link"
                    style={{
                      color: "#3B82F6",
                      padding: 0,
                      fontSize: "14px",
                    }}
                    href="/auth/forgot-password"
                  >
                    Quên mật khẩu?
                  </Button>
                </Col>
              </Row>

              {/* Sign In Button */}
              <Form.Item style={{ marginBottom: "24px" }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={isLoading}
                  disabled={isLoading}
                  style={{
                    height: "48px",
                    backgroundColor: isLoading ? "#9CA3AF" : "#6C7BEA",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  {isLoading ? (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Spin size="small" />
                      Đang đăng nhập...
                    </span>
                  ) : (
                    "Đăng nhập"
                  )}
                </Button>
              </Form.Item>
            </Form>

            {/* Register Link */}
            <div style={{ textAlign: "center" }}>
              <span style={{ color: "#8B92A5", fontSize: "14px" }}>
                Chưa có tài khoản?{" "}
              </span>
              <Button
                type="link"
                style={{
                  color: "#3B82F6",
                  padding: 0,
                  fontSize: "14px",
                  fontWeight: "500",
                }}
                href="/auth/signup"
              >
                Tạo tài khoản
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const LoginPage = () => {
  return (
    <App>
      <LoginForm />
    </App>
  );
};

export default LoginPage;
