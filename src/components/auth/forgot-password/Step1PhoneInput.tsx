"use client";
import React from "react";
import { Form, Input, Button, Typography } from "antd";
import { PhoneOutlined } from "@ant-design/icons";

const { Text } = Typography;

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
    <Form
      form={form}
      name="forgot-password-phone"
      onFinish={onSubmit}
      layout="vertical"
      size="large"
    >
      <Form.Item
        name="phoneNumber"
        label={
          <Text style={{ color: "#1B2559", fontSize: "14px", fontWeight: "500" }}>
            Số điện thoại
          </Text>
        }
        rules={[
          { required: true, message: "Vui lòng nhập số điện thoại!" },
          { pattern: /^[0-9]{10,11}$/, message: "Số điện thoại phải có 10-11 chữ số!" },
        ]}
      >
        <Input
          prefix={<PhoneOutlined style={{ color: "#8B92A5" }} />}
          placeholder="Nhập số điện thoại của bạn"
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

      {/* reCAPTCHA Container - Hidden but needed for Phone Auth */}
      <div
        id="recaptcha-container"
        style={{
          display: "none",
        }}
      />
    </Form>
  );
};

export default Step1PhoneInput;

