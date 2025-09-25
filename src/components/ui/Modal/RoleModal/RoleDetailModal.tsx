"use client";
import React from "react";
import {
  Modal,
  Descriptions,
  Tag,
  Space,
  Typography,
  Divider,
  Button,
} from "antd";
import { 
  EyeOutlined,
  SafetyOutlined,
  UserOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";
import { Role } from "@/lib/api/types";

const { Text, Title } = Typography;

interface RoleDetailModalProps {
  visible: boolean;
  onCancel: () => void;
  data: Role | null;
}

const RoleDetailModal: React.FC<RoleDetailModalProps> = ({
  visible,
  onCancel,
  data,
}) => {
  if (!data) return null;

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <EyeOutlined style={{ color: "#52c41a" }} />
          <span>Chi tiết vai trò</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={700}
      footer={[
        <Button key="close" onClick={onCancel}>
          Đóng
        </Button>,
      ]}
    >
      <div style={{ padding: "16px 0" }}>
        {/* Header Section */}
        <div style={{ 
          textAlign: "center", 
          marginBottom: 24,
          padding: "20px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: 8,
          color: "white"
        }}>
          <SafetyOutlined style={{ fontSize: 48, marginBottom: 16 }} />
          <Title level={3} style={{ color: "white", margin: 0 }}>
            {data.role_name}
          </Title>
          <Tag 
            color={data.role_code === "CUSTOMER" ? "green" : "blue"}
            style={{ 
              fontSize: 14, 
              padding: "4px 12px",
              marginTop: 8,
              background: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.3)"
            }}
          >
            {data.role_code}
          </Tag>
        </div>

        {/* Basic Information */}
        <Divider orientation="left">
          <InfoCircleOutlined style={{ marginRight: 8 }} />
          Thông tin cơ bản
        </Divider>
        
        <Descriptions
          bordered
          column={1}
          size="middle"
          styles={{
            label: {
              fontWeight: 600,
              backgroundColor: "#fafafa",
              width: "30%"
            }
          }}
        >
          <Descriptions.Item label="ID vai trò">
            <Text code style={{ fontSize: 12 }}>
              {data.role_id}
            </Text>
          </Descriptions.Item>
          
          <Descriptions.Item label="Tên vai trò">
            <Space>
              <UserOutlined />
              <Text strong>{data.role_name}</Text>
            </Space>
          </Descriptions.Item>
          
          <Descriptions.Item label="Mã vai trò">
            <Tag color="blue" style={{ fontFamily: "monospace", fontSize: 14 }}>
              {data.role_code}
            </Tag>
          </Descriptions.Item>
          
          <Descriptions.Item label="Loại vai trò">
            <Tag color={data.role_code === "CUSTOMER" ? "green" : "blue"}>
              {data.role_code === "CUSTOMER" ? "Khách hàng" : "Nhân viên"}
            </Tag>
          </Descriptions.Item>
          
          <Descriptions.Item label="Mô tả">
            <Text>{data.description}</Text>
          </Descriptions.Item>
        </Descriptions>

        {/* Permissions Section */}
        {data.permissions && data.permissions.length > 0 && (
          <>
            <Divider orientation="left">
              <SafetyOutlined style={{ marginRight: 8 }} />
              Quyền hạn ({data.permissions.length})
            </Divider>
            
            <div style={{ 
              padding: 16, 
              backgroundColor: "#f8f9fa", 
              borderRadius: 8,
              border: "1px solid #e9ecef"
            }}>
              <Space wrap>
                {data.permissions.map((permission) => (
                  <Tag 
                    key={permission.permission_id} 
                    color="purple"
                    style={{ 
                      padding: "4px 12px",
                      fontSize: 13,
                      margin: "4px"
                    }}
                  >
                    {permission.permission_name}
                  </Tag>
                ))}
              </Space>
            </div>
          </>
        )}

        {/* Additional Info */}
        <Divider orientation="left">
          <InfoCircleOutlined style={{ marginRight: 8 }} />
          Thông tin bổ sung
        </Divider>
        
        <div style={{ 
          padding: 16, 
          backgroundColor: "#f0f8ff", 
          borderRadius: 8,
          border: "1px solid #d6e4ff"
        }}>
          <Space direction="vertical" size="small">
            <Text type="secondary">
              <InfoCircleOutlined style={{ marginRight: 8 }} />
              Vai trò này được sử dụng để phân quyền và quản lý quyền truy cập trong hệ thống.
            </Text>
            <Text type="secondary">
              Mã vai trò ({data.role_code}) được sử dụng để định danh duy nhất cho vai trò này.
            </Text>
            {data.role_code === "CUSTOMER" && (
              <Text type="secondary">
                Đây là vai trò dành cho khách hàng, có quyền truy cập hạn chế.
              </Text>
            )}
            {data.role_code !== "CUSTOMER" && (
              <Text type="secondary">
                Đây là vai trò dành cho nhân viên, có quyền truy cập mở rộng hơn.
              </Text>
            )}
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export default RoleDetailModal;