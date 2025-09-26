"use client";
import React from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Space,
  Avatar,
  Statistic,
  List,
  Divider,
  Button,
} from "antd";
import {
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  ClockCircleOutlined,
  StarOutlined,
  UserOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { CenterDisplay } from "@/lib/api/types/center.types";

const { Title, Text, Paragraph } = Typography;

interface CenterInfoDisplayProps {
  centerInfo: CenterDisplay | null;
  onEdit?: () => void;
}

const CenterInfoDisplay: React.FC<CenterInfoDisplayProps> = ({
  centerInfo,
  onEdit,
}) => {
  // Null safety check
  if (!centerInfo) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Text type="secondary">Không có dữ liệu trung tâm</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header với logo và thông tin cơ bản */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24} align="middle">
          <Col span={4}>
            <Avatar
              size={100}
              src={centerInfo.logo_url}
              style={{ border: "2px solid #f0f0f0" }}
            >
              {centerInfo.center_name?.charAt(0) || 'C'}
            </Avatar>
          </Col>
          <Col span={16}>
            <div>
              <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
                {centerInfo.center_name || 'Chưa có tên'}
              </Title>
              <Paragraph
                style={{ fontSize: 16, color: "#666", marginBottom: 16 }}
              >
                {centerInfo.description || 'Chưa có mô tả'}
              </Paragraph>
              <Space wrap>
                <Tag color="blue" icon={<ClockCircleOutlined />}>
                  Thành lập: {centerInfo.established_date ? new Date(centerInfo.established_date).getFullYear() : 'N/A'}
                </Tag>
                <Tag color={centerInfo.is_active ? "green" : "red"}>
                  {centerInfo.is_active ? "Đang hoạt động" : "Tạm dừng"}
                </Tag>
                <Tag color="gold" icon={<StarOutlined />}>
                  {centerInfo.operating_status || 'N/A'}
                </Tag>
              </Space>
            </div>
          </Col>
          <Col span={4}>
            {onEdit && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={onEdit}
                block
              >
                Chỉnh sửa
              </Button>
            )}
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
                  <Text>{centerInfo.headquarters_address || 'Chưa có địa chỉ'}</Text>
                </div>
              </div>

              <div>
                <Text strong>Liên hệ:</Text>
                <div style={{ marginTop: 4 }}>
                  <PhoneOutlined style={{ marginRight: 8, color: "#52c41a" }} />
                  <Text>{centerInfo.headquarters_phone || 'Chưa có số điện thoại'}</Text>
                </div>
                <div style={{ marginTop: 4 }}>
                  <MailOutlined style={{ marginRight: 8, color: "#722ed1" }} />
                  <Text>{centerInfo.headquarters_email || 'Chưa có email'}</Text>
                </div>
                <div style={{ marginTop: 4 }}>
                  <GlobalOutlined
                    style={{ marginRight: 8, color: "#13c2c2" }}
                  />
                  <Text>{centerInfo.website || 'Chưa có website'}</Text>
                </div>
              </div>

              <div>
                <Text strong>Giờ làm việc:</Text>
                <div style={{ marginTop: 4 }}>
                  <ClockCircleOutlined
                    style={{ marginRight: 8, color: "#1890ff" }}
                  />
                  <Text>
                    Thứ 2: {centerInfo.business_hours?.monday?.open || 'N/A'} - {centerInfo.business_hours?.monday?.close || 'N/A'}
                  </Text>
                </div>
                <div style={{ marginTop: 4 }}>
                  <ClockCircleOutlined
                    style={{ marginRight: 8, color: "#1890ff" }}
                  />
                  <Text>
                    Thứ 7: {centerInfo.business_hours?.saturday?.open || 'N/A'} - {centerInfo.business_hours?.saturday?.close || 'N/A'}
                  </Text>
                </div>
                <div style={{ marginTop: 4 }}>
                  <ClockCircleOutlined
                    style={{ marginRight: 8, color: "#1890ff" }}
                  />
                  <Text>
                    Chủ nhật: {centerInfo.business_hours?.sunday?.open || 'N/A'} - {centerInfo.business_hours?.sunday?.close || 'N/A'}
                  </Text>
                </div>
              </div>
            </Space>
          </Card>

          {/* Thông tin pháp lý */}
          <Card title="Thông tin pháp lý">
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              <div>
                <Text strong>Giấy phép kinh doanh:</Text>
                <div style={{ marginTop: 4 }}>
                  <Text>{centerInfo.business_license || 'Chưa có'}</Text>
                </div>
              </div>
              <div>
                <Text strong>Mã số thuế:</Text>
                <div style={{ marginTop: 4 }}>
                  <Text>{centerInfo.tax_code || 'Chưa có'}</Text>
                </div>
              </div>
              <div>
                <Text strong>Mã trung tâm:</Text>
                <div style={{ marginTop: 4 }}>
                  <Text>{centerInfo.center_code || 'Chưa có'}</Text>
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
                  value={centerInfo.total_customers || 0}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Tổng nhân viên"
                  value={centerInfo.total_employees || 0}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Tổng chi nhánh"
                  value={centerInfo.total_branches || 0}
                  valueStyle={{ color: "#fa8c16" }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Trạng thái"
                  value={centerInfo.operating_status || 'N/A'}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Col>
            </Row>
            <Divider />
            <div>
              <Text strong>Quản lý:</Text>
              <div style={{ marginTop: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: "#52c41a" }}>
                  {centerInfo.manager_name || 'Chưa có quản lý'}
                </Text>
                <Text
                  type="secondary"
                  style={{ marginLeft: 8 }}
                >
                  ({centerInfo.manager_email || 'N/A'})
                </Text>
              </div>
            </div>
          </Card>

          {/* Khu vực phục vụ */}
          <Card title="Khu vực phục vụ">
            <List
              dataSource={centerInfo.service_areas || []}
              renderItem={(area) => (
                <List.Item>
                  <Text>• {area}</Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CenterInfoDisplay;