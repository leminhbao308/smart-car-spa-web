"use client";
import React from "react";
import { Form, Input, Button } from "antd";

interface Step3PasswordInfoProps {
  form: any;
  loading: boolean;
  onSubmit: (values: any) => void;
  onBack: () => void;
}

const Step3PasswordInfo: React.FC<Step3PasswordInfoProps> = ({
  form,
  loading,
  onSubmit,
  onBack,
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
          Hoàn thành đăng ký
        </h1>
        <p
          style={{
            color: "#8B92A5",
            fontSize: "14px",
            margin: 0,
          }}
        >
          Nhập họ tên và mật khẩu để hoàn tất đăng ký
        </p>
      </div>

      {/* Password Form */}
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
          onClick={onBack}
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
};

export default Step3PasswordInfo;

