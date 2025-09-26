"use client";
import React from "react";
import { Modal, Card, Row, Col, Typography, Tag, Space, Avatar, Statistic, List, Divider } from "antd";
import {
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CarOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { BranchDisplay } from "@/lib/api/types/branch.types";

const { Title, Text, Paragraph } = Typography;

interface BranchDetailModalProps {
  open: boolean;
  onCancel: () => void;
  branch: BranchDisplay | null;
}

const BranchDetailModal: React.FC<BranchDetailModalProps> = ({
  open,
  onCancel,
  branch,
}) => {
  if (!branch) return null;

  return (
    <Modal
      title="Chi tiết chi nhánh"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={1000}
      style={{ top: 20 }}
    >
      <div style={{ padding: 24 }}>
        {/* Header với logo và thông tin cơ bản */}
        <Card style={{ marginBottom: 24 }}>
          <Row gutter={24} align="middle">
            <Col span={4}>
              <Avatar
                size={100}
                style={{ 
                  border: "2px solid #f0f0f0",
                  backgroundColor: "#1890ff",
                  fontSize: 32
                }}
              >
                {branch.branch_name?.charAt(0) || 'B'}
              </Avatar>
            </Col>
            <Col span={16}>
              <div>
                <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
                  {branch.branch_name || 'Chưa có tên'}
                </Title>
                <Paragraph
                  style={{ fontSize: 16, color: "#666", marginBottom: 16 }}
                >
                  {branch.description || 'Chưa có mô tả'}
                </Paragraph>
                <Space wrap>
                  <Tag color="blue" icon={<ClockCircleOutlined />}>
                    Thành lập: {branch.established_date ? new Date(branch.established_date).getFullYear() : 'N/A'}
                  </Tag>
                  <Tag color={branch.is_active ? "green" : "red"}>
                    {branch.is_active ? "Đang hoạt động" : "Tạm dừng"}
                  </Tag>
                  <Tag color="gold">
                    {branch.operating_status || 'N/A'}
                  </Tag>
                  <Tag color={branch.branch_type === "PREMIUM" ? "gold" : branch.branch_type === "VIP" ? "purple" : "blue"}>
                    {branch.branch_type === "PREMIUM" ? "Premium" : branch.branch_type === "VIP" ? "VIP" : "Standard"}
                  </Tag>
                </Space>
              </div>
            </Col>
          </Row>
        </Card>

        <Row gutter={24}>
          {/* Thông tin liên hệ */}
          <Col span={12}>
            <Card title="Thông tin liên hệ" style={{ marginBottom: 24 }}>
              <Space direction="vertical" style={{ width: "100%" }} size="middle">
                <div>
                  <Text strong>Địa chỉ:</Text>
                  <div style={{ marginTop: 4 }}>
                    <EnvironmentOutlined
                      style={{ marginRight: 8, color: "#1890ff" }}
                    />
                    <Text>{branch.address || 'Chưa có địa chỉ'}</Text>
                  </div>
                </div>

                <div>
                  <Text strong>Liên hệ:</Text>
                  <div style={{ marginTop: 4 }}>
                    <PhoneOutlined style={{ marginRight: 8, color: "#52c41a" }} />
                    <Text>{branch.phone || 'Chưa có số điện thoại'}</Text>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <MailOutlined style={{ marginRight: 8, color: "#722ed1" }} />
                    <Text>{branch.email || 'Chưa có email'}</Text>
                  </div>
                </div>

                <div>
                  <Text strong>Giờ làm việc:</Text>
                  <div style={{ marginTop: 4 }}>
                    <ClockCircleOutlined
                      style={{ marginRight: 8, color: "#1890ff" }}
                    />
                    <Text>
                      Thứ 2: {branch.operating_hours?.monday?.open || 'N/A'} - {branch.operating_hours?.monday?.close || 'N/A'}
                    </Text>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <ClockCircleOutlined
                      style={{ marginRight: 8, color: "#1890ff" }}
                    />
                    <Text>
                      Thứ 7: {branch.operating_hours?.saturday?.open || 'N/A'} - {branch.operating_hours?.saturday?.close || 'N/A'}
                    </Text>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <ClockCircleOutlined
                      style={{ marginRight: 8, color: "#1890ff" }}
                    />
                    <Text>
                      Chủ nhật: {branch.operating_hours?.sunday?.open || 'N/A'} - {branch.operating_hours?.sunday?.close || 'N/A'}
                    </Text>
                  </div>
                </div>
              </Space>
            </Card>

            {/* Thông tin pháp lý */}
            <Card title="Thông tin chi nhánh">
              <Space direction="vertical" style={{ width: "100%" }} size="middle">
                <div>
                  <Text strong>Mã chi nhánh:</Text>
                  <div style={{ marginTop: 4 }}>
                    <Text>{branch.branch_code || 'Chưa có'}</Text>
                  </div>
                </div>
                <div>
                  <Text strong>Diện tích:</Text>
                  <div style={{ marginTop: 4 }}>
                    <Text>{branch.area_sqm || 0} m²</Text>
                  </div>
                </div>
                <div>
                  <Text strong>Chỗ đỗ xe:</Text>
                  <div style={{ marginTop: 4 }}>
                    <Text>{branch.parking_spaces || 0} chỗ</Text>
                  </div>
                </div>
              </Space>
            </Card>
          </Col>

          {/* Thống kê và dịch vụ */}
          <Col span={12}>
            <Card title="Thống kê hoạt động" style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Tổng khách hàng"
                    value={branch.total_customers || 0}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Tổng nhân viên"
                    value={branch.total_employees || 0}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: "#52c41a" }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Công suất"
                    value={`${branch.current_workload || 0}/${branch.service_capacity || 0}`}
                    valueStyle={{ color: "#fa8c16" }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Tỷ lệ sử dụng"
                    value={`${Math.round(branch.utilization_rate || 0)}%`}
                    valueStyle={{ color: "#722ed1" }}
                  />
                </Col>
              </Row>
              <Divider />
              <div>
                <Text strong>Quản lý:</Text>
                <div style={{ marginTop: 8 }}>
                  <Text style={{ fontSize: 16, fontWeight: "bold", color: "#52c41a" }}>
                    {branch.manager_name || 'Chưa có quản lý'}
                  </Text>
                  <Text
                    type="secondary"
                    style={{ marginLeft: 8 }}
                  >
                    ({branch.manager_email || 'N/A'})
                  </Text>
                </div>
              </div>
            </Card>

            {/* Cơ sở vật chất */}
            <Card title="Cơ sở vật chất">
              <List
                dataSource={branch.facilities || []}
                renderItem={(facility) => (
                  <List.Item>
                    <Text>• {facility}</Text>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </Modal>
  );
};

export default BranchDetailModal;