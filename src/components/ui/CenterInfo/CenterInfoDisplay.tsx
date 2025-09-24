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
  CarOutlined,
  DollarOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { CenterInfo } from "@/components/utils/data/center-info.data";
import formatCurrency from "@/components/utils/helper/currency.format.helper";

const { Title, Text, Paragraph } = Typography;

interface CenterInfoDisplayProps {
  centerInfo: CenterInfo;
  onEdit?: () => void;
}

const CenterInfoDisplay: React.FC<CenterInfoDisplayProps> = ({
  centerInfo,
  onEdit,
}) => {
  return (
    <div style={{ padding: 24 }}>
      {/* Header với logo và thông tin cơ bản */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24} align="middle">
          <Col span={4}>
            <Avatar
              size={100}
              src={centerInfo.logo}
              style={{ border: "2px solid #f0f0f0" }}
            >
              {centerInfo.name.charAt(0)}
            </Avatar>
          </Col>
          <Col span={16}>
            <div>
              <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
                {centerInfo.name}
              </Title>
              <Paragraph
                style={{ fontSize: 16, color: "#666", marginBottom: 16 }}
              >
                {centerInfo.description}
              </Paragraph>
              <Space wrap>
                <Tag color="blue" icon={<ClockCircleOutlined />}>
                  Thành lập: {centerInfo.establishedYear}
                </Tag>
                <Tag color={centerInfo.status === "active" ? "green" : "red"}>
                  {centerInfo.status === "active"
                    ? "Đang hoạt động"
                    : "Tạm dừng"}
                </Tag>
                <Tag color="gold" icon={<StarOutlined />}>
                  {centerInfo.statistics.averageRating}/5.0
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
                  <Text>
                    {centerInfo.address.street}, {centerInfo.address.ward},{" "}
                    {centerInfo.address.district}, {centerInfo.address.city}
                  </Text>
                </div>
                <Text type="secondary" style={{ marginLeft: 24 }}>
                  Mã bưu điện: {centerInfo.address.postalCode}
                </Text>
              </div>

              <div>
                <Text strong>Liên hệ:</Text>
                <div style={{ marginTop: 4 }}>
                  <PhoneOutlined style={{ marginRight: 8, color: "#52c41a" }} />
                  <Text>{centerInfo.phone}</Text>
                </div>
                <div style={{ marginTop: 4 }}>
                  <PhoneOutlined style={{ marginRight: 8, color: "#fa8c16" }} />
                  <Text>Hotline: {centerInfo.hotline}</Text>
                </div>
                <div style={{ marginTop: 4 }}>
                  <MailOutlined style={{ marginRight: 8, color: "#722ed1" }} />
                  <Text>{centerInfo.email}</Text>
                </div>
                <div style={{ marginTop: 4 }}>
                  <GlobalOutlined
                    style={{ marginRight: 8, color: "#13c2c2" }}
                  />
                  <Text>{centerInfo.website}</Text>
                </div>
              </div>

              <div>
                <Text strong>Giờ làm việc:</Text>
                <div style={{ marginTop: 4 }}>
                  <ClockCircleOutlined
                    style={{ marginRight: 8, color: "#1890ff" }}
                  />
                  <Text>
                    Thứ 2 - Thứ 6: {centerInfo.businessHours.weekdays.open} -{" "}
                    {centerInfo.businessHours.weekdays.close}
                  </Text>
                </div>
                <div style={{ marginTop: 4 }}>
                  <ClockCircleOutlined
                    style={{ marginRight: 8, color: "#1890ff" }}
                  />
                  <Text>
                    Thứ 7 - Chủ nhật: {centerInfo.businessHours.weekends.open} -{" "}
                    {centerInfo.businessHours.weekends.close}
                  </Text>
                </div>
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary">
                    {centerInfo.businessHours.holidays}
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
                  <Text>{centerInfo.licenseNumber}</Text>
                </div>
              </div>
              <div>
                <Text strong>Mã số thuế:</Text>
                <div style={{ marginTop: 4 }}>
                  <Text>{centerInfo.taxCode}</Text>
                </div>
              </div>
              <div>
                <Text strong>Thông tin ngân hàng:</Text>
                <div style={{ marginTop: 4 }}>
                  <Text>{centerInfo.bankInfo.bankName}</Text>
                </div>
                <div style={{ marginTop: 4 }}>
                  <Text>STK: {centerInfo.bankInfo.accountNumber}</Text>
                </div>
                <div style={{ marginTop: 4 }}>
                  <Text>Chủ TK: {centerInfo.bankInfo.accountHolder}</Text>
                </div>
                <div style={{ marginTop: 4 }}>
                  <Text>Chi nhánh: {centerInfo.bankInfo.branch}</Text>
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
                  value={centerInfo.statistics.totalCustomers}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Tổng xe phục vụ"
                  value={centerInfo.statistics.totalVehicles}
                  prefix={<CarOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Tổng dịch vụ"
                  value={centerInfo.statistics.totalServices}
                  valueStyle={{ color: "#fa8c16" }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Doanh thu"
                  value={centerInfo.statistics.totalRevenue}
                  formatter={(value) => formatCurrency(Number(value))}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Col>
            </Row>
            <Divider />
            <div>
              <Text strong>Đánh giá trung bình:</Text>
              <div style={{ marginTop: 8 }}>
                <Text style={{ fontSize: 18, fontWeight: "bold", color: "#52c41a" }}>
                  {centerInfo.statistics.averageRating}/5.0
                </Text>
                <Text
                  type="secondary"
                  style={{ marginLeft: 8 }}
                >
                  ({centerInfo.statistics.totalReviews} đánh giá)
                </Text>
              </div>
            </div>
          </Card>

          {/* Dịch vụ cung cấp */}
          <Card title="Dịch vụ cung cấp">
            <List
              dataSource={centerInfo.services}
              renderItem={(service) => (
                <List.Item>
                  <Text>• {service}</Text>
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
