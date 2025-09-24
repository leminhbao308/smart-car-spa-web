"use client";
import React from "react";
import {
  Modal,
  Descriptions,
  Tag,
  Divider,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
} from "antd";
import { 
  SafetyOutlined,
  UserOutlined,
  CalendarOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";
import { Role } from "@/lib/api/types";

const { Title, Text } = Typography;

interface RoleDetailModalProps {
  visible: boolean;
  onCancel: () => void;
  data?: Role | null;
}

const RoleDetailModal: React.FC<RoleDetailModalProps> = ({
  visible,
  onCancel,
  data,
}) => {
  if (!data) return null;

  const isCustomerRole = data.role_code === "CUSTOMER";

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <SafetyOutlined style={{ color: "#1890ff" }} />
          <span>Chi tiết vai trò</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={700}
      footer={[
        <div key="footer" style={{ textAlign: "right" }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Vai trò được tạo vào: {new Date().toLocaleDateString("vi-VN")}
          </Text>
        </div>
      ]}
    >
      <div style={{ marginBottom: 24 }}>
        <Card>
          <Row gutter={16}>
            <Col span={8}>
              <Statistic
                title="Loại vai trò"
                value={isCustomerRole ? "Khách hàng" : "Nhân viên"}
                prefix={<UserOutlined />}
                valueStyle={{ 
                  color: isCustomerRole ? "#52c41a" : "#1890ff",
                  fontSize: 18
                }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Mã vai trò"
                value={data.role_code}
                prefix={<SafetyOutlined />}
                valueStyle={{ 
                  color: "#722ed1",
                  fontSize: 18,
                  fontFamily: "monospace"
                }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Trạng thái"
                value="Hoạt động"
                valueStyle={{ 
                  color: "#52c41a",
                  fontSize: 18
                }}
              />
            </Col>
          </Row>
        </Card>
      </div>

      <Divider orientation="left">
        <InfoCircleOutlined style={{ marginRight: 8 }} />
        Thông tin chi tiết
      </Divider>

      <Descriptions
        bordered
        column={1}
        size="middle"
        labelStyle={{ 
          backgroundColor: "#fafafa", 
          fontWeight: 500,
          width: "30%"
        }}
      >
        <Descriptions.Item label="Tên vai trò">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Title level={5} style={{ margin: 0 }}>
              {data.role_name}
            </Title>
            <Tag color={isCustomerRole ? "green" : "blue"}>
              {isCustomerRole ? "Khách hàng" : "Nhân viên"}
            </Tag>
          </div>
        </Descriptions.Item>

        <Descriptions.Item label="Mã vai trò">
          <Tag color="purple" style={{ fontFamily: "monospace", fontSize: 14 }}>
            {data.role_code}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Mô tả">
          <Text>{data.description}</Text>
        </Descriptions.Item>

        <Descriptions.Item label="ID vai trò">
          <Text code style={{ fontSize: 12 }}>
            {data.role_id}
          </Text>
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">
        <CalendarOutlined style={{ marginRight: 8 }} />
        Thông tin hệ thống
      </Divider>

      <Descriptions
        bordered
        column={2}
        size="small"
        labelStyle={{ 
          backgroundColor: "#fafafa", 
          fontWeight: 500 
        }}
      >
        <Descriptions.Item label="Ngày tạo">
          {new Date().toLocaleDateString("vi-VN")}
        </Descriptions.Item>
        <Descriptions.Item label="Cập nhật cuối">
          {new Date().toLocaleDateString("vi-VN")}
        </Descriptions.Item>
        <Descriptions.Item label="Số người dùng">
          <Tag color="blue">0</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color="green">Hoạt động</Tag>
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default RoleDetailModal;
