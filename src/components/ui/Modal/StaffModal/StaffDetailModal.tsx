"use client";
import React from "react";
import {
  Modal,
  Descriptions,
  Tag,
  Card,
  Row,
  Col,
  Typography,
  Button,
  Avatar,
} from "antd";
import {
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  CalendarOutlined,
  TeamOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { UserManagementInfo } from "@/lib/api/types";

const { Title, Text } = Typography;

interface StaffDetailModalProps {
  visible: boolean;
  onCancel: () => void;
  data: UserManagementInfo | null;
}

const StaffDetailModal: React.FC<StaffDetailModalProps> = ({
  visible,
  onCancel,
  data,
}) => {
  if (!data) return null;

  const getGenderColor = (gender: string) => {
    return gender === "MALE" ? "blue" : "pink";
  };

  const getGenderLabel = (gender: string) => {
    return gender === "MALE" ? "Nam" : "Nữ";
  };

  const calculateAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return "Chưa cập nhật";
    const birth = new Date(dateOfBirth);
    const now = new Date();
    const age = now.getFullYear() - birth.getFullYear();
    return `${age} tuổi`;
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TeamOutlined style={{ color: "#1890ff" }} />
          <span>Chi tiết nhân viên: {data.full_name}</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="close" onClick={onCancel}>
          Đóng
        </Button>,
      ]}
    >
      <div style={{ maxHeight: 600, overflowY: "auto" }}>
        {/* Thông tin cơ bản */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <Avatar size={64} style={{ backgroundColor: "#1890ff" }}>
              {data.full_name.charAt(0)}
            </Avatar>
            <div>
              <Title level={4} style={{ margin: 0, marginBottom: 4 }}>
                {data.full_name}
              </Title>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <Tag color="blue">
                  {data.role.role_name}
                </Tag>
                <Tag color={data.is_active ? "green" : "red"}>
                  {data.is_active ? "Hoạt động" : "Không hoạt động"}
                </Tag>
              </div>
              <Text type="secondary">
                ID: <Text code>{data.user_id}</Text>
              </Text>
            </div>
          </div>
          
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Email">
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <MailOutlined style={{ color: "#666" }} />
                <Text>{data.email}</Text>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <PhoneOutlined style={{ color: "#666" }} />
                <Text>{data.phone_number}</Text>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Giới tính">
              <Tag color={getGenderColor(data.gender)}>
                {getGenderLabel(data.gender)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tuổi">
              <Text>{calculateAge(data.date_of_birth)}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="CMND/CCCD">
              <Text>{data.citizen_id || "Chưa cập nhật"}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <HomeOutlined style={{ color: "#666" }} />
                <Text>{data.address || "Chưa cập nhật"}</Text>
              </div>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Thông tin vai trò */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Title level={5} style={{ marginBottom: 16 }}>
            <SafetyOutlined style={{ marginRight: 8 }} />
            Thông tin vai trò
          </Title>
          
          <Row gutter={16}>
            <Col span={12}>
              <div style={{ textAlign: "center", padding: 16, backgroundColor: "#e6f7ff", borderRadius: 6 }}>
                <div style={{ fontSize: 20, fontWeight: "bold", color: "#1890ff", marginBottom: 4 }}>
                  {data.role.role_name}
                </div>
                <Text type="secondary">Tên vai trò</Text>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ textAlign: "center", padding: 16, backgroundColor: "#f6ffed", borderRadius: 6 }}>
                <div style={{ fontSize: 20, fontWeight: "bold", color: "#52c41a", marginBottom: 4 }}>
                  {data.role.role_code}
                </div>
                <Text type="secondary">Mã vai trò</Text>
              </div>
            </Col>
          </Row>
          
          <div style={{ marginTop: 16, padding: 12, backgroundColor: "#fafafa", borderRadius: 6 }}>
            <Text strong style={{ display: "block", marginBottom: 4 }}>Mô tả vai trò:</Text>
            <Text>{data.role.description}</Text>
          </div>
        </Card>

        {/* Thông tin hệ thống */}
        <Card size="small">
          <Title level={5} style={{ marginBottom: 16 }}>
            <CalendarOutlined style={{ marginRight: 8 }} />
            Thông tin hệ thống
          </Title>
          
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Ngày sinh">
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <CalendarOutlined style={{ color: "#666" }} />
                <Text>
                  {data.date_of_birth 
                    ? new Date(data.date_of_birth).toLocaleDateString("vi-VN")
                    : "Chưa cập nhật"
                  }
                </Text>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tuyển dụng">
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <CalendarOutlined style={{ color: "#666" }} />
                <Text>
                  {data.hired_at 
                    ? new Date(data.hired_at).toLocaleDateString("vi-VN")
                    : "Chưa cập nhật"
                  }
                </Text>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái tài khoản">
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <ClockCircleOutlined style={{ color: "#666" }} />
                <Tag color={data.is_active ? "green" : "red"}>
                  {data.is_active ? "Hoạt động" : "Không hoạt động"}
                </Tag>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Loại tài khoản">
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <TeamOutlined style={{ color: "#666" }} />
                <Tag color="blue">
                  {data.user_type === "EMPLOYEE" ? "Nhân viên" : "Khách hàng"}
                </Tag>
              </div>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </Modal>
  );
};

export default StaffDetailModal;
