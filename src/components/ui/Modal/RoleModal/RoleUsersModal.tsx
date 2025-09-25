"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Table,
  Tag,
  Space,
  Typography,
  Divider,
  Button,
  message,
  Avatar,
  Tooltip,
} from "antd";
import { 
  UserOutlined,
  TeamOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined
} from "@ant-design/icons";
import { Role, UserManagementInfo } from "@/lib/api/types";
import { RoleService } from "@/lib/api/services";
import { ColumnsType } from "antd/es/table";

const { Text, Title } = Typography;

interface RoleUsersModalProps {
  visible: boolean;
  onCancel: () => void;
  roleData: Role | null;
}

const RoleUsersModal: React.FC<RoleUsersModalProps> = ({
  visible,
  onCancel,
  roleData,
}) => {
  const [users, setUsers] = useState<UserManagementInfo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && roleData) {
      fetchUsersByRole();
    }
  }, [visible, roleData]);

  const fetchUsersByRole = async () => {
    if (!roleData) return;
    
    setLoading(true);
    try {
      const response = await RoleService.getUsersByRole(roleData.role_id);
      setUsers(response);
    } catch (error: unknown) {
      console.log("Error fetching users by role:", error);
      const errorMessage = error instanceof Error ? error.message : "Không thể tải danh sách người dùng";
      message.error(errorMessage);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<UserManagementInfo> = [
    {
      title: "Người dùng",
      key: "user_info",
      width: 250,
      render: (_, record) => (
        <Space>
          <Avatar 
            src={record.avatar_url} 
            icon={<UserOutlined />}
            size="large"
          />
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>
              {record.full_name}
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>
              {record.email}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Thông tin liên hệ",
      key: "contact",
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Space size="small">
            <MailOutlined style={{ color: "#1890ff" }} />
            <Text style={{ fontSize: 12 }}>{record.email}</Text>
          </Space>
          <Space size="small">
            <PhoneOutlined style={{ color: "#52c41a" }} />
            <Text style={{ fontSize: 12 }}>{record.phone_number}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 120,
      render: (_, record) => (
        <Tag color={record.is_active ? "green" : "red"}>
          {record.is_active ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Loại người dùng",
      key: "user_type",
      width: 120,
      render: (_, record) => (
        <Tag color={record.user_type === "CUSTOMER" ? "blue" : "purple"}>
          {record.user_type === "CUSTOMER" ? "Khách hàng" : "Nhân viên"}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      key: "created_at",
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Space size="small">
            <CalendarOutlined style={{ color: "#666" }} />
            <Text style={{ fontSize: 12 }}>
              {new Date(record.created_at).toLocaleDateString('vi-VN')}
            </Text>
          </Space>
        </Space>
      ),
    },
  ];

  if (!roleData) return null;

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TeamOutlined style={{ color: "#1890ff" }} />
          <span>Người dùng có vai trò "{roleData.role_name}"</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={1000}
      footer={[
        <Button key="close" onClick={onCancel}>
          Đóng
        </Button>,
      ]}
    >
      <div style={{ padding: "16px 0" }}>
        {/* Role Info Header */}
        <div style={{ 
          marginBottom: 24,
          padding: "16px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: 8,
          color: "white"
        }}>
          <Space>
            <UserOutlined style={{ fontSize: 24 }} />
            <div>
              <Title level={4} style={{ color: "white", margin: 0 }}>
                {roleData.role_name}
              </Title>
              <Text style={{ color: "rgba(255,255,255,0.8)" }}>
                {roleData.description}
              </Text>
            </div>
          </Space>
        </div>

        {/* Users Table */}
        <Divider orientation="left">
          <TeamOutlined style={{ marginRight: 8 }} />
          Danh sách người dùng ({users.length})
        </Divider>
        
        <Table
          columns={columns}
          dataSource={users}
          loading={loading}
          rowKey="user_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} người dùng`,
          }}
          scroll={{ x: 800 }}
          locale={{
            emptyText: (
              <div style={{ padding: "40px 0", textAlign: "center" }}>
                <UserOutlined style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }} />
                <div style={{ color: "#999" }}>
                  Không có người dùng nào có vai trò này
                </div>
              </div>
            ),
          }}
        />
      </div>
    </Modal>
  );
};

export default RoleUsersModal;
