"use client";
import React from "react";
import {
  Modal,
  Descriptions,
  Tag,
  Avatar,
  Divider,
  Row,
  Col,
  Card,
  List,
  Typography,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  TeamOutlined,
  CarOutlined,
} from "@ant-design/icons";
import { userRoles, departments, permissions } from "@/components/utils/data/user-accounts.data";
import { customerTypes, genders } from "@/components/utils/data/customers.data";

const { Title, Text } = Typography;

interface AccountDetailModalProps {
  visible: boolean;
  onCancel: () => void;
  data: any;
  type: "staff" | "customer";
}

const AccountDetailModal: React.FC<AccountDetailModalProps> = ({
  visible,
  onCancel,
  data,
  type,
}) => {
  if (!data) return null;

  const getRoleConfig = (role: string) => {
    return userRoles.find((r) => r.value === role);
  };

  const getPermissionLabels = (perms: string[]) => {
    return perms.map((perm) => {
      const permConfig = permissions.find((p) => p.value === perm);
      return permConfig?.label || perm;
    });
  };

  const getCustomerTypeConfig = (type: string) => {
    return customerTypes.find((t) => t.value === type);
  };

  const getGenderConfig = (gender: string) => {
    return genders.find((g) => g.value === gender);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Chưa có";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal
      title={`Chi tiết tài khoản ${type === "staff" ? "nhân viên" : "khách hàng"}`}
      open={visible}
      onCancel={onCancel}
      width={900}
      footer={null}
    >
      <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
        {/* Thông tin tài khoản */}
        <Card title="Thông tin tài khoản" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col span={4}>
              <Avatar
                size={64}
                style={{ backgroundColor: type === "staff" ? "#1890ff" : "#52c41a" }}
                icon={<UserOutlined />}
              >
                {data.fullName?.charAt(0) || data.name?.charAt(0)}
              </Avatar>
            </Col>
            <Col span={20}>
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <Text strong>Tên đăng nhập:</Text>
                  <br />
                  <Text>{data.username || "Chưa có"}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Email:</Text>
                  <br />
                  <Text>{data.email}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Trạng thái:</Text>
                  <br />
                  <Tag color={data.status === "active" ? "green" : "red"}>
                    {data.status === "active" ? "Hoạt động" : "Không hoạt động"}
                  </Tag>
                </Col>
                <Col span={12}>
                  <Text strong>Ngày tạo:</Text>
                  <br />
                  <Text>{formatDate(data.createdAt)}</Text>
                </Col>
                {data.lastLogin && (
                  <Col span={12}>
                    <Text strong>Đăng nhập cuối:</Text>
                    <br />
                    <Text>{formatDate(data.lastLogin)}</Text>
                  </Col>
                )}
              </Row>
            </Col>
          </Row>
        </Card>

        {/* Thông tin cá nhân */}
        <Card title="Thông tin cá nhân" size="small" style={{ marginBottom: 16 }}>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Họ và tên">
              {data.fullName || data.name}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {data.phone}
            </Descriptions.Item>
            {type === "staff" ? (
              <>
                <Descriptions.Item label="Chức vụ">
                  <Tag color="blue">{data.position}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Phòng ban">
                  {data.department}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày vào làm">
                  {data.joinDate ? new Date(data.joinDate).toLocaleDateString("vi-VN") : "Chưa có"}
                </Descriptions.Item>
              </>
            ) : (
              <>
                <Descriptions.Item label="Mã khách hàng">
                  <Tag color="green">{data.customerCode}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Giới tính">
                  {getGenderConfig(data.gender)?.label || data.gender}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày sinh">
                  {data.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString("vi-VN") : "Chưa có"}
                </Descriptions.Item>
                <Descriptions.Item label="Loại khách hàng">
                  <Tag color={getCustomerTypeConfig(data.customerType)?.color}>
                    {getCustomerTypeConfig(data.customerType)?.label || data.customerType}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Tổng đơn hàng">
                  {data.totalOrders || 0}
                </Descriptions.Item>
                <Descriptions.Item label="Tổng chi tiêu">
                  {formatCurrency(data.totalSpent || 0)}
                </Descriptions.Item>
                <Descriptions.Item label="Lần cuối ghé thăm">
                  {formatDate(data.lastVisit)}
                </Descriptions.Item>
              </>
            )}
            {data.address && (
              <Descriptions.Item label="Địa chỉ" span={2}>
                {data.address}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* Thông tin quyền hạn (chỉ cho nhân viên) */}
        {type === "staff" && data.role && (
          <Card title="Thông tin quyền hạn" size="small" style={{ marginBottom: 16 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Vai trò">
                <Tag color={getRoleConfig(data.role)?.color}>
                  {getRoleConfig(data.role)?.label || data.role}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Quyền hạn">
                <div>
                  {getPermissionLabels(data.permissions || []).map((perm, index) => (
                    <Tag key={index} color="blue" style={{ marginBottom: 4 }}>
                      {perm}
                    </Tag>
                  ))}
                </div>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {/* Thông tin xe (chỉ cho khách hàng) */}
        {type === "customer" && data.vehicles && data.vehicles.length > 0 && (
          <Card title="Thông tin xe" size="small" style={{ marginBottom: 16 }}>
            <List
              dataSource={data.vehicles}
              renderItem={(vehicle: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<CarOutlined style={{ fontSize: 20, color: "#1890ff" }} />}
                    title={`${vehicle.brand} ${vehicle.model} (${vehicle.year})`}
                    description={`Biển số: ${vehicle.licensePlate}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        )}

        {/* Dịch vụ ưa thích (chỉ cho khách hàng) */}
        {type === "customer" && data.preferredServices && data.preferredServices.length > 0 && (
          <Card title="Dịch vụ ưa thích" size="small" style={{ marginBottom: 16 }}>
            <div>
              {data.preferredServices.map((service: string, index: number) => (
                <Tag key={index} color="purple" style={{ marginBottom: 4 }}>
                  {service}
                </Tag>
              ))}
            </div>
          </Card>
        )}

        {/* Ghi chú */}
        {data.notes && (
          <Card title="Ghi chú" size="small">
            <Text>{data.notes}</Text>
          </Card>
        )}
      </div>
    </Modal>
  );
};

export default AccountDetailModal;
