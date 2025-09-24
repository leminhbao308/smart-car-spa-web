"use client";
import React from "react";
import {
  Modal,
  Row,
  Col,
  Card,
  Tag,
  Space,
  Typography,
  Progress,
  Divider,
} from "antd";
import {
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CarOutlined,
} from "@ant-design/icons";
import { Branch } from "@/components/utils/data/branches.data";
import { getStatusColor, getStatusLabel } from "@/components/utils/helper/center.helper";

const { Title, Text } = Typography;

interface BranchDetailModalProps {
  open: boolean;
  onCancel: () => void;
  branch: Branch | null;
}

const BranchDetailModal: React.FC<BranchDetailModalProps> = ({
  open,
  onCancel,
  branch,
}) => {
  if (!branch) return null;

  return (
    <Modal
      title={
        <Space>
          <EnvironmentOutlined />
          <span>Chi tiết chi nhánh: {branch.name}</span>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      width={800}
      footer={null}
    >
      <Row gutter={[16, 16]}>
        {/* Thông tin cơ bản */}
        <Col span={24}>
          <Card title="Thông tin cơ bản" size="small">
            <Row gutter={[16, 8]}>
              <Col span={12}>
                <Space>
                  <EnvironmentOutlined style={{ color: "#8c8c8c" }} />
                  <Text strong>Địa chỉ:</Text>
                  <Text>{branch.address}</Text>
                </Space>
              </Col>
              <Col span={12}>
                <Space>
                  <UserOutlined style={{ color: "#722ed1" }} />
                  <Text strong>Quản lý:</Text>
                  <Text>{branch.manager}</Text>
                </Space>
              </Col>
              <Col span={12}>
                <Space>
                  <PhoneOutlined style={{ color: "#52c41a" }} />
                  <Text strong>Điện thoại:</Text>
                  <Text>{branch.phone}</Text>
                </Space>
              </Col>
              <Col span={12}>
                <Space>
                  <MailOutlined style={{ color: "#1890ff" }} />
                  <Text strong>Email:</Text>
                  <Text>{branch.email}</Text>
                </Space>
              </Col>
              <Col span={12}>
                <Space>
                  <CarOutlined style={{ color: "#fa8c16" }} />
                  <Text strong>Sức chứa:</Text>
                  <Text>{branch.capacity} xe</Text>
                </Space>
              </Col>
              <Col span={12}>
                <Space>
                  <Tag color={getStatusColor(branch.status)}>
                    {getStatusLabel(branch.status)}
                  </Tag>
                </Space>
              </Col>
            </Row>
            {branch.description && (
              <div style={{ marginTop: 12 }}>
                <Text strong>Mô tả:</Text>
                <Text style={{ marginTop: 4, display: "block" }}>
                  {branch.description}
                </Text>
              </div>
            )}
          </Card>
        </Col>

        {/* Giờ hoạt động */}
        <Col span={12}>
          <Card title="Giờ hoạt động" size="small">
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <ClockCircleOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                <Text strong>Ngày thường:</Text>
                <Text style={{ marginLeft: 8 }}>{branch.openingHours.weekdays}</Text>
              </div>
              <div>
                <ClockCircleOutlined style={{ marginRight: 8, color: "#52c41a" }} />
                <Text strong>Cuối tuần:</Text>
                <Text style={{ marginLeft: 8 }}>{branch.openingHours.weekends}</Text>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Thống kê slot */}
        <Col span={12}>
          <Card title="Thống kê slot chăm sóc" size="small">
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ textAlign: "center" }}>
                  <Text strong style={{ fontSize: 18, color: "#1890ff" }}>
                    {branch.totalSlots}
                  </Text>
                  <div>
                    <Text type="secondary">Tổng slot</Text>
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: "center" }}>
                  <Text strong style={{ fontSize: 18, color: "#52c41a" }}>
                    {branch.availableSlots}
                  </Text>
                  <div>
                    <Text type="secondary">Trống</Text>
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: "center" }}>
                  <Text strong style={{ fontSize: 18, color: "#fa8c16" }}>
                    {branch.currentBookings}
                  </Text>
                  <div>
                    <Text type="secondary">Đang sử dụng</Text>
                  </div>
                </div>
              </Col>
            </Row>
            <Divider />
            <div>
              <Text strong>Tỷ lệ sử dụng:</Text>
              <Progress
                percent={Math.round((branch.currentBookings / branch.totalSlots) * 100)}
                strokeColor="#1890ff"
                style={{ marginTop: 8 }}
              />
            </div>
          </Card>
        </Col>

        {/* Dịch vụ */}
        <Col span={12}>
          <Card title="Dịch vụ cung cấp" size="small">
            <Space wrap>
              {branch.services.map((service, index) => (
                <Tag key={index} color="blue">
                  {service}
                </Tag>
              ))}
            </Space>
          </Card>
        </Col>

        {/* Tiện ích */}
        <Col span={12}>
          <Card title="Tiện ích" size="small">
            <Space wrap>
              {branch.facilities.map((facility, index) => (
                <Tag key={index} color="green">
                  {facility}
                </Tag>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </Modal>
  );
};

export default BranchDetailModal;