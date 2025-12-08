"use client";
import React from "react";
import { Modal, Descriptions, Avatar, Typography } from "antd";
import { UserOutlined, PhoneOutlined, MailOutlined, HomeOutlined, CalendarOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  joinDate: string;
  avatar?: string;
}

interface CustomerInfoModalProps {
  open: boolean;
  onClose: () => void;
  customerInfo: CustomerInfo;
}

const CustomerInfoModal: React.FC<CustomerInfoModalProps> = ({
  open,
  onClose,
  customerInfo,
}) => {
  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Avatar
            size="large"
            icon={<UserOutlined />}
            src={customerInfo.avatar}
          />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Thông tin khách hàng
            </Title>
            <Text type="secondary">Chi tiết thông tin liên hệ</Text>
          </div>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={500}
      centered
    >
      <Descriptions
        column={1}
        size="middle"
        styles={{
          label: {
            fontWeight: 600,
            color: "#666",
            width: "120px"
          },
          content: {
            color: "#333"
          }
        }}
      >
        <Descriptions.Item
          label={
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <UserOutlined style={{ color: "#1890ff" }} />
              <span>Họ tên</span>
            </div>
          }
        >
          {customerInfo.name}
        </Descriptions.Item>
        
        <Descriptions.Item
          label={
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <PhoneOutlined style={{ color: "#52c41a" }} />
              <span>Số điện thoại</span>
            </div>
          }
        >
          <Text copyable={{ text: customerInfo.phone }}>
            {customerInfo.phone}
          </Text>
        </Descriptions.Item>
        
        <Descriptions.Item
          label={
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <MailOutlined style={{ color: "#fa8c16" }} />
              <span>Email</span>
            </div>
          }
        >
          <Text copyable={{ text: customerInfo.email }}>
            {customerInfo.email}
          </Text>
        </Descriptions.Item>
        
        <Descriptions.Item
          label={
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <HomeOutlined style={{ color: "#722ed1" }} />
              <span>Địa chỉ</span>
            </div>
          }
        >
          {customerInfo.address}
        </Descriptions.Item>
        
        <Descriptions.Item
          label={
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <CalendarOutlined style={{ color: "#13c2c2" }} />
              <span>Ngày tham gia</span>
            </div>
          }
        >
          {customerInfo.joinDate}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default CustomerInfoModal;
