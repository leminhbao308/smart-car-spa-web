"use client";
import React from "react";
import { Form, Input, Button, Typography } from "antd";

const { Text } = Typography;

interface Step2OTPVerifyProps {
  form: any;
  phoneNumber: string;
  otp: string;
  setOtp: (value: string) => void;
  loading: boolean;
  onVerify: () => void;
  onResend: () => void;
  onBack: () => void;
  otpTimer: number;
  otpExpired: boolean;
}

const Step2OTPVerify: React.FC<Step2OTPVerifyProps> = ({
  form,
  phoneNumber,
  otp,
  setOtp,
  loading,
  onVerify,
  onResend,
  onBack,
  otpTimer,
  otpExpired,
}) => {
  return (
    <Form
      form={form}
      name="forgot-password-otp"
      onFinish={onVerify}
      layout="vertical"
      size="large"
    >
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <Text style={{ color: "#8B92A5", fontSize: "16px", lineHeight: "24px" }}>
          Chúng tôi đã gửi mã OTP đến{" "}
          <Text strong style={{ color: "#1B2559" }}>{phoneNumber}</Text>
        </Text>
      </div>

      <Form.Item
        name="otp"
        label={
          <Text style={{ color: "#1B2559", fontSize: "14px", fontWeight: "500" }}>
            Mã OTP
          </Text>
        }
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
            onClick={onResend}
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
          disabled={!otp || otp.length !== 6}
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

      {/* Back Button */}
      <div style={{ textAlign: "center", marginTop: "16px" }}>
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
    </Form>
  );
};

export default Step2OTPVerify;

