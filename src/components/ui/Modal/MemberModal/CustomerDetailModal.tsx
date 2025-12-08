"use client";
import React from "react";
import {
  Modal,
  Descriptions,
  Tag,
  Card,
  Typography,
  Button,
  Avatar,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { UserManagementInfo } from "@/lib/api/types";
import { calculateAge } from "@/components/utils/helper/member.helper";

const { Title, Text } = Typography;

interface CustomerDetailModalProps {
  visible: boolean;
  onCancel: () => void;
  data: UserManagementInfo | null;
}

const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
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

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <UserOutlined style={{ color: "#1890ff" }} />
          <span>Chi tiết khách hàng: {data.full_name}</span>
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
                <Tag color="green">
                  Khách hàng
                </Tag>
                <Tag color={data.is_active ? "green" : "red"}>
                  {data.is_active ? "Hoạt động" : "Không hoạt động"}
                </Tag>
                {data.customer_rank && (
                  <Tag color={
                    data.customer_rank === "BRONZE" ? "orange" :
                    data.customer_rank === "SILVER" ? "gray" :
                    data.customer_rank === "GOLD" ? "gold" :
                    data.customer_rank === "PLATINUM" ? "blue" : "default"
                  }>
                    {data.customer_rank}
                  </Tag>
                )}
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
            <Descriptions.Item label="Địa chỉ">
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <HomeOutlined style={{ color: "#666" }} />
                <Text>{data.address || "Chưa cập nhật"}</Text>
              </div>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Thông tin khách hàng */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Title level={5} style={{ marginBottom: 16 }}>
            <UserOutlined style={{ marginRight: 8 }} />
            Thông tin khách hàng
          </Title>
          
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Hạng khách hàng">
              <Tag color={
                data.customer_rank === "BRONZE" ? "orange" :
                data.customer_rank === "SILVER" ? "gray" :
                data.customer_rank === "GOLD" ? "gold" :
                data.customer_rank === "PLATINUM" ? "blue" : "default"
              }>
                {data.customer_rank || "Chưa xếp hạng"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Điểm tích lũy">
              <Text style={{ fontWeight: 500, color: "#1890ff" }}>
                {data.accumulated_points?.toLocaleString() || "0"} điểm
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tổng đơn hàng">
              <Text style={{ fontWeight: 500 }}>
                {data.total_orders || "0"} đơn
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tổng chi tiêu">
              <Text style={{ fontWeight: 500, color: "#52c41a" }}>
                {data.total_spent ? `${data.total_spent.toLocaleString()} VNĐ` : "0 VNĐ"}
              </Text>
            </Descriptions.Item>
          </Descriptions>
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
            <Descriptions.Item label="Trạng thái tài khoản">
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <ClockCircleOutlined style={{ color: "#666" }} />
                <Tag color={data.is_active ? "green" : "red"}>
                  {data.is_active ? "Hoạt động" : "Không hoạt động"}
                </Tag>
              </div>
            </Descriptions.Item>
            {data.created_at && (
              <Descriptions.Item label="Ngày tạo">
                <Text>
                  {new Date(data.created_at).toLocaleDateString("vi-VN")}
                </Text>
              </Descriptions.Item>
            )}
            {data.updated_at && (
              <Descriptions.Item label="Cập nhật lần cuối">
                <Text>
                  {new Date(data.updated_at).toLocaleDateString("vi-VN")}
                </Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      </div>
    </Modal>
  );
};

export default CustomerDetailModal;