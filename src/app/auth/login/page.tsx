"use client";
import CustomerHeader from "@/components/layout/Header/customer.header";
import InputPassword from "@/components/ui/Input/input.password";
import { ROUTES } from "@/components/utils/constant/path.route";
import { AuthService } from "@/lib/api/services/auth.service";
import { GoogleOutlined } from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  message,
  Row,
  Spin,
} from "antd";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

// Constants
const REMEMBERED_EMAIL_KEY = "remembered_email";
const MIN_PASSWORD_LENGTH = 3;

// Helper function to determine redirect path based on user role
const getRedirectPath = (roleCode?: string): string => {
  if (roleCode !== "member") {
    return ROUTES.DASHBOARD;
  }
  return ROUTES.HOME;
};

const LoginPage = () => {
  const [form] = Form.useForm();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Kiểm tra nếu user đã đăng nhập thì redirect
  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      const userInfo = AuthService.getCurrentUserInfo();
      if (userInfo) {
        // Redirect dựa trên role
        const role = (userInfo as { role?: { role_code?: string } })?.role
          ?.role_code;
        router.push(getRedirectPath(role));
      }
    }
  }, [router]);
  /**
   * Handle form submit
   * @param values Form values
   */
  const onFinish = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await AuthService.login({
        email: values.email,
        password: values.password,
      });

      if (response.success && response.data) {
        message.success("Đăng nhập thành công!");

        // Lưu thông tin remember me nếu được chọn
        if (values.remember) {
          localStorage.setItem(REMEMBERED_EMAIL_KEY, values.email);
        } else {
          localStorage.removeItem(REMEMBERED_EMAIL_KEY);
        }

        // Redirect dựa trên role
        const role = response.data.user_info?.role?.role_code;
        router.push(getRedirectPath(role));
      } else {
        message.error(response.message || "Đăng nhập thất bại!");
      }
    } catch (error) {
      console.log("Login error:", error); 

      // Hiển thị thông báo lỗi chi tiết
      if (error && typeof error === "object" && "response" in error) {
        const apiError = error as {
          response?: { data?: { message?: string } };
        };
        if (apiError.response?.data?.message) {
          message.error(apiError.response.data.message);
        } else {
          message.error("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!");
        }
      } else if (error && typeof error === "object" && "message" in error) {
        const errorWithMessage = error as { message: string };
        message.error(errorWithMessage.message);
      } else {
        message.error("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      form.setFieldsValue({ email: rememberedEmail, remember: true });
    }
  }, [form]);

  // Handle Google login (placeholder for future implementation)
  const handleGoogleLogin = () => {
    message.info("Chức năng đăng nhập với Google đang được phát triển!");
  };

  return (
    <>
      <style jsx>{`
        .login-form-container {
          padding: 40px;
          max-width: 400px;
        }

        @media (max-width: 767px) {
          .login-form-container {
            padding: 24px;
            max-width: 350px;
            margin: 0 16px;
          }
        }

        @media (max-width: 480px) {
          .login-form-container {
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
          {/* Login Form Container */}
          <div
            className="login-form-container"
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
              {/* Email Input */}
              <Form.Item
                label={
                  <span
                    style={{
                      color: "#1B2559",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Email
                  </span>
                }
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
                initialValue={email}
              >
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    height: "48px",
                    backgroundColor: "#F8F9FA",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    color: "#1B2559",
                  }}
                  placeholder="mail@scsms.com"
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
                  { required: true, message: "Vui lòng nhập mật khẩu!" },
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

export default LoginPage;
