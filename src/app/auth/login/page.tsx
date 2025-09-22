"use client";
import CustomerHeader from "@/components/layout/Header/customer.header";
import InputPassword from "@/components/ui/Input/input.password";
import { ROUTES } from "@/components/utils/constant/path.route";
import { GoogleOutlined } from "@ant-design/icons";
import { Button, Checkbox, Col, Divider, Form, Input, Row } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

const LoginPage = () => {
  const [form] = Form.useForm();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  /**
   * Handle form submit
   * @param values Form values
   */
  const onFinish = (values: LoginFormValues) => {
    console.log("Form values:", values.email, values.password);
    if (values.email === "admin" && values.password === "admin") {
      router.push(ROUTES.DASHBOARD);
    }
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
              maxWidth: "400px",
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
                    Email hoặc số điện thoại
                  </span>
                }
                name="email"
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
                  placeholder="mail@simmmple.com"
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
              >
                <InputPassword
                  value={password}
                  onChange={setPassword}
                  placeholderCustom="Ít nhất 8 ký tự"
                  style={{
                    height: "48px",
                    backgroundColor: "#F8F9FA",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    color: "#1B2559",
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
                  style={{
                    height: "48px",
                    backgroundColor: "#6C7BEA",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Đăng nhập
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
