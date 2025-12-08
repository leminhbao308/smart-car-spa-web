"use client";
import React from "react";
import { Form, Input, Button, Checkbox } from "antd";
import Link from "next/link";

interface Step1PhoneInputProps {
  form: any;
  loading: boolean;
  onSubmit: (values: any) => void;
}

const Step1PhoneInput: React.FC<Step1PhoneInputProps> = ({
  form,
  loading,
  onSubmit,
}) => {
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
          Nhập số điện thoại để nhận mã OTP!
        </p>
      </div>

      {/* Phone Form */}
      <Form
        form={form}
        onFinish={onSubmit}
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
              Số điện thoại
            </span>
          }
          name="phoneNumber"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập số điện thoại!",
            },
            {
              pattern: /^[0-9]{10,11}$/,
              message: "Số điện thoại phải có 10-11 chữ số!",
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
            placeholder="0123456789"
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
};

export default Step1PhoneInput;

