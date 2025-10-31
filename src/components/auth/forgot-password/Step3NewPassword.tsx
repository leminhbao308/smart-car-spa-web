"use client";
import React from "react";
import { Form, Input, Button, Typography } from "antd";
import { LockOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface Step3NewPasswordProps {
  form: any;
  loading: boolean;
  onSubmit: (values: any) => void;
  onBack: () => void;
}

const Step3NewPassword: React.FC<Step3NewPasswordProps> = ({
  form,
  loading,
  onSubmit,
  onBack,
}) => {
  return (
    <Form
      form={form}
      name="forgot-password-new"
      onFinish={onSubmit}
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
    </Form>
  );
};

export default Step3NewPassword;

