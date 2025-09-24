"use client";
import React from "react";
import { Modal, Button, Card, Descriptions, Tag, Typography } from "antd";
import { SafetyOutlined } from "@ant-design/icons";
import { Permission } from "@/lib/api/types";

const { Text } = Typography;

interface PermissionDetailModalProps {
  visible: boolean;
  onCancel: () => void;
  data: Permission | null;
}

const PermissionDetailModal: React.FC<PermissionDetailModalProps> = ({
  visible,
  onCancel,
  data,
}) => {
  if (!data) return null;

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <SafetyOutlined style={{ color: "#722ed1" }} />
          <span>Chi tiết quyền hạn: {data.permission_name}</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={600}
      footer={[
        <Button key="close" onClick={onCancel}>
          Đóng
        </Button>,
      ]}
    >
      <Card size="small">
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Tên quyền hạn">
            <Text strong>{data.permission_name}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Mã quyền hạn">
            <Tag color="purple" style={{ fontFamily: "monospace" }}>
              {data.permission_code}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Module">
            <Tag color="green">{data.module}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Mô tả">
            <Text>{data.description}</Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </Modal>
  );
};

export default PermissionDetailModal;