"use client";
import React from "react";
import { Input, Button, Typography } from "antd";

const { Text } = Typography;

interface Step2OTPVerifyProps {
  phoneNumber: string;
  otpCode: string;
  setOtpCode: (value: string) => void;
  loading: boolean;
  onVerify: () => void;
  onResend: () => void;
  onBack: () => void;
  otpTimer: number;
  otpExpired: boolean;
}

const Step2OTPVerify: React.FC<Step2OTPVerifyProps> = ({
  phoneNumber,
  otpCode,
  setOtpCode,
  loading,
  onVerify,
  onResend,
  onBack,
  otpTimer,
  otpExpired,
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
          Xác thực số điện thoại
        </h1>
        <p
          style={{
            color: "#8B92A5",
            fontSize: "14px",
            margin: 0,
          }}
        >
          Chúng tôi đã gửi mã OTP đến {phoneNumber}
        </p>
      </div>

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
        onClick={onVerify}
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

      {/* Resend OTP */}
      <div style={{ textAlign: "center" }}>
        <Text style={{ color: "#8B92A5", fontSize: "14px" }}>
          Không nhận được mã OTP?{" "}
        </Text>
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

export default Step2OTPVerify;

