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
  CarOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { customerTypes, genders, customerStatuses } from "@/components/utils/data/customers.data";
import formatCurrency from "@/components/utils/helper/currency.format.helper";
import { calculateAge } from "@/components/utils/helper/member.helper";

const { Title, Text } = Typography;

interface CustomerDetailModalProps {
  visible: boolean;
  onCancel: () => void;
  data: any;
}

const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  visible,
  onCancel,
  data,
}) => {
  if (!data) return null;

  const getCustomerTypeInfo = (type: string) => {
    return customerTypes.find(t => t.value === type);
  };

  const getGenderInfo = (gender: string) => {
    return genders.find(g => g.value === gender);
  };

  const getStatusInfo = (status: string) => {
    return customerStatuses.find(s => s.value === status);
  };

  const getLastVisitInfo = (date: string) => {
    const dateObj = new Date(date);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24)
    );

    let color = "#52c41a";
    let text = "Gần đây";
    
    if (diffDays > 30) {
      color = "#ff4d4f";
      text = "Lâu rồi";
    } else if (diffDays > 7) {
      color = "#faad14";
      text = "Trung bình";
    }

    return { color, text, diffDays };
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <UserOutlined style={{ color: "#1890ff" }} />
          <span>Chi tiết khách hàng: {data.fullName}</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={900}
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
              {data.fullName.charAt(0)}
            </Avatar>
            <div>
              <Title level={4} style={{ margin: 0, marginBottom: 4 }}>
                {data.fullName}
              </Title>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <Tag color={getCustomerTypeInfo(data.customerType)?.color}>
                  {getCustomerTypeInfo(data.customerType)?.label}
                </Tag>
                <Tag color={getStatusInfo(data.status)?.color}>
                  {getStatusInfo(data.status)?.label}
                </Tag>
              </div>
              <Text type="secondary">
                Mã khách hàng: <Text code>{data.customerCode}</Text>
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
              <Tag color={getGenderInfo(data.gender)?.color}>
                {getGenderInfo(data.gender)?.label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tuổi">
              <Text>{calculateAge(data.dateOfBirth)} tuổi</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ" span={2}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <HomeOutlined style={{ color: "#666" }} />
                <Text>{data.address}</Text>
              </div>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Thông tin thống kê */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Title level={5} style={{ marginBottom: 16 }}>
            <ShoppingCartOutlined style={{ marginRight: 8 }} />
            Thống kê hoạt động
          </Title>
          
          <Row gutter={16}>
            <Col span={8}>
              <div style={{ textAlign: "center", padding: 16, backgroundColor: "#f6ffed", borderRadius: 6 }}>
                <div style={{ fontSize: 24, fontWeight: "bold", color: "#52c41a", marginBottom: 4 }}>
                  {data.totalOrders}
                </div>
                <Text type="secondary">Tổng đơn hàng</Text>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: "center", padding: 16, backgroundColor: "#e6f7ff", borderRadius: 6 }}>
                <div style={{ fontSize: 24, fontWeight: "bold", color: "#1890ff", marginBottom: 4 }}>
                  {formatCurrency(data.totalSpent)}
                </div>
                <Text type="secondary">Tổng chi tiêu</Text>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: "center", padding: 16, backgroundColor: "#fff7e6", borderRadius: 6 }}>
                <div style={{ fontSize: 24, fontWeight: "bold", color: "#fa8c16", marginBottom: 4 }}>
                  {data.vehicles?.length || 0}
                </div>
                <Text type="secondary">Số xe</Text>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Thông tin xe */}
        {data.vehicles && data.vehicles.length > 0 && (
          <Card size="small" style={{ marginBottom: 16 }}>
            <Title level={5} style={{ marginBottom: 16 }}>
              <CarOutlined style={{ marginRight: 8 }} />
              Danh sách xe ({data.vehicles.length} xe)
            </Title>
            
            <Row gutter={[16, 16]}>
              {data.vehicles.map((vehicle: any, index: number) => (
                <Col span={12} key={vehicle.id || index}>
                  <Card size="small" style={{ backgroundColor: "#fafafa" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>
                          {vehicle.brand} {vehicle.model}
                        </div>
                        <div style={{ fontSize: 12, color: "#666" }}>
                          Năm: {vehicle.year}
                        </div>
                      </div>
                      <Tag color="blue">{vehicle.licensePlate}</Tag>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        )}

        {/* Dịch vụ ưa thích */}
        {data.preferredServices && data.preferredServices.length > 0 && (
          <Card size="small" style={{ marginBottom: 16 }}>
            <Title level={5} style={{ marginBottom: 16 }}>
              <DollarOutlined style={{ marginRight: 8 }} />
              Dịch vụ ưa thích
            </Title>
            
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {data.preferredServices.map((service: string, index: number) => (
                <Tag key={index} color="green">
                  {service}
                </Tag>
              ))}
            </div>
          </Card>
        )}

        {/* Thông tin thời gian */}
        <Card size="small">
          <Title level={5} style={{ marginBottom: 16 }}>
            <CalendarOutlined style={{ marginRight: 8 }} />
            Thông tin thời gian
          </Title>
          
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Ngày tham gia">
              <Text>{new Date(data.joinDate).toLocaleString("vi-VN")}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Lần cuối ghé thăm">
              <div>
                <div style={{ fontSize: 12 }}>
                  {new Date(data.lastVisit).toLocaleString("vi-VN")}
                </div>
                <Tag color={getLastVisitInfo(data.lastVisit).color}>
                  {getLastVisitInfo(data.lastVisit).text}
                </Tag>
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

export default CustomerDetailModal;
