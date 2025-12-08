"use client";
import React from "react";
import { Modal, Button, Space } from "antd";
import {
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

export interface ConfirmationModalProps {
  open: boolean;
  title?: string;
  content: string;
  type?: "confirm" | "success" | "warning" | "error" | "info";
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  width?: number;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  title,
  content,
  type = "confirm",
  onConfirm,
  onCancel,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  loading = false,
  width = 400,
}) => {
  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <CheckCircleOutlined style={{ color: "#52c41a", fontSize: "24px" }} />
        );
      case "warning":
        return (
          <ExclamationCircleOutlined
            style={{ color: "#faad14", fontSize: "24px" }}
          />
        );
      case "error":
        return (
          <CloseCircleOutlined style={{ color: "#ff4d4f", fontSize: "24px" }} />
        );
      case "info":
        return (
          <InfoCircleOutlined style={{ color: "#1890ff", fontSize: "24px" }} />
        );
      default:
        return (
          <ExclamationCircleOutlined
            style={{ color: "#faad14", fontSize: "24px" }}
          />
        );
    }
  };

  const getConfirmButtonType = ():
    | "primary"
    | "default"
    | "dashed"
    | "link"
    | "text" => {
    switch (type) {
      case "success":
        return "primary";
      case "warning":
        return "primary";
      case "error":
        return "primary";
      case "info":
        return "primary";
      default:
        return "primary";
    }
  };

  const getConfirmButtonDanger = () => {
    return type === "error";
  };

  return (
    <Modal
      open={open}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {getIcon()}
          <span>{title || "Xác nhận thao tác"}</span>
        </div>
      }
      onCancel={onCancel}
      footer={
        <Space>
          <Button onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            type={getConfirmButtonType()}
            danger={getConfirmButtonDanger()}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </Space>
      }
      width={width}
      centered
      maskClosable={false}
    >
      <div style={{ padding: "16px 0" }}>
        <p style={{ margin: 0, fontSize: "16px", lineHeight: "1.5" }}>
          {content}
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
