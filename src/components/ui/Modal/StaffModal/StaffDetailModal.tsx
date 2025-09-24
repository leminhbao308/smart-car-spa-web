"use client";
import React from "react";
import {
  Modal,
  Descriptions,
  Tag,
  Badge,
  Card,
  Row,
  Col,
  Typography,
  Button,
  Avatar,
  Divider,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  CalendarOutlined,
  TeamOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

interface StaffDetailModalProps {
  visible: boolean;
  onCancel: () => void;
  data: any;
}

const StaffDetailModal: React.FC<StaffDetailModalProps> = ({
  visible,
  onCancel,
  data,
}) => {
  if (!data) return null;

  const getPositionColor = (position: string) => {
    const colors: Record<string, string> = {
      "Quản lý": "red",
      "Trưởng phòng": "orange", 
      "Nhân viên": "blue",
      "Kỹ thuật viên": "green",
      "Nhân viên kinh doanh": "purple",
      "Kế toán": "cyan",
      "Nhân viên kho": "lime",
    };
    return colors[position] || "default";
  };

  const getDepartmentColor = (department: string) => {
    const colors: Record<string, string> = {
      "Kỹ thuật": "blue",
      "Kinh doanh": "green",
      "Kế toán": "purple",
      "Kho": "orange",
      "Hành chính": "cyan",
    };
    return colors[department] || "default";
  };

  const getGenderColor = (gender: string) => {
    return gender === "male" ? "blue" : "pink";
  };

  const getGenderLabel = (gender: string) => {
    return gender === "male" ? "Nam" : "Nữ";
  };

  const calculateWorkDays = (joinDate: string) => {
    const join = new Date(joinDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - join.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TeamOutlined style={{ color: "#1890ff" }} />
          <span>Chi tiết nhân viên: {data.name}</span>
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
              {data.name.charAt(0)}
            </Avatar>
            <div>
              <Title level={4} style={{ margin: 0, marginBottom: 4 }}>
                {data.name}
              </Title>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <Tag color={getPositionColor(data.position)}>
                  {data.position}
                </Tag>
                <Tag color={getDepartmentColor(data.department)}>
                  {data.department}
                </Tag>
                <Tag color={data.status === "active" ? "green" : "red"}>
                  {data.status === "active" ? "Hoạt động" : "Không hoạt động"}
                </Tag>
              </div>
              <Text type="secondary">
                ID: <Text code>{data.id}</Text>
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
                <Text>{data.phone}</Text>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Giới tính">
              <Tag color={getGenderColor(data.gender)}>
                {getGenderLabel(data.gender)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái tài khoản">
              <Tag color={data.hasAccount ? "green" : "orange"}>
                {data.hasAccount ? "Có tài khoản" : "Chưa có tài khoản"}
              </Tag>
            </Descriptions.Item>
            {data.address && (
              <Descriptions.Item label="Địa chỉ" span={2}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <HomeOutlined style={{ color: "#666" }} />
                  <Text>{data.address}</Text>
                </div>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* Thông tin công việc */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Title level={5} style={{ marginBottom: 16 }}>
            <SafetyOutlined style={{ marginRight: 8 }} />
            Thông tin công việc
          </Title>
          
          <Row gutter={16}>
            <Col span={8}>
              <div style={{ textAlign: "center", padding: 16, backgroundColor: "#e6f7ff", borderRadius: 6 }}>
                <div style={{ fontSize: 24, fontWeight: "bold", color: "#1890ff", marginBottom: 4 }}>
                  {calculateWorkDays(data.joinDate)}
                </div>
                <Text type="secondary">Ngày làm việc</Text>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: "center", padding: 16, backgroundColor: "#f6ffed", borderRadius: 6 }}>
                <div style={{ fontSize: 24, fontWeight: "bold", color: "#52c41a", marginBottom: 4 }}>
                  {data.position}
                </div>
                <Text type="secondary">Chức vụ</Text>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: "center", padding: 16, backgroundColor: "#fff7e6", borderRadius: 6 }}>
                <div style={{ fontSize: 24, fontWeight: "bold", color: "#fa8c16", marginBottom: 4 }}>
                  {data.department}
                </div>
                <Text type="secondary">Phòng ban</Text>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Thông tin thời gian */}
        <Card size="small">
          <Title level={5} style={{ marginBottom: 16 }}>
            <CalendarOutlined style={{ marginRight: 8 }} />
            Thông tin thời gian
          </Title>
          
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Ngày vào làm">
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <CalendarOutlined style={{ color: "#666" }} />
                <Text>{new Date(data.joinDate).toLocaleDateString("vi-VN")}</Text>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian làm việc">
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <ClockCircleOutlined style={{ color: "#666" }} />
                <Text>{calculateWorkDays(data.joinDate)} ngày</Text>
              </div>
            </Descriptions.Item>
          </Descriptions>

          {data.notes && (
            <>
              <Divider />
              <div>
                <Text strong>Ghi chú:</Text>
                <div style={{ marginTop: 8, padding: 12, backgroundColor: "#f6ffed", borderRadius: 6 }}>
                  <Text>{data.notes}</Text>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </Modal>
  );
};

export default StaffDetailModal;
