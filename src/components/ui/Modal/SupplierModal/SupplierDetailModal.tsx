"use client";
import React from "react";
import {
  Modal,
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Avatar,
  Divider,
  Button,
} from "antd";
import {
  BankOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { Supplier } from "@/lib/api/types/supplier.types";
import { formatDate } from "@/components/utils/helper/date.format.helper";

const { Title, Text } = Typography;

interface SupplierDetailModalProps {
  visible: boolean;
  onCancel: () => void;
  supplier: Supplier | null;
}

const SupplierDetailModal: React.FC<SupplierDetailModalProps> = ({
  visible,
  onCancel,
  supplier,
}) => {
  if (!supplier) return null;

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <BankOutlined style={{ color: "#1890ff" }} />
          <span>Chi tiết nhà cung cấp</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="close" type="primary" onClick={onCancel}>
          Đóng
        </Button>
      ]}
    >
      <div style={{ padding: "16px 0" }}>
        {/* Header Section */}
        <Card
          style={{
            marginBottom: 16,
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            border: "none",
          }}
        >
          <Row align="middle" gutter={[16, 16]}>
            <Col>
              <Avatar
                size={64}
                icon={<BankOutlined />}
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              />
            </Col>
            <Col flex={1}>
              <Title level={3} style={{ margin: 0, color: "#1890ff" }}>
                {supplier.supplier_name}
              </Title>
              <Text type="secondary" style={{ fontSize: 14 }}>
                ID: {supplier.supplier_id}
              </Text>
              <div style={{ marginTop: 8 }}>
                <Tag color={supplier.is_active ? "green" : "red"} style={{ fontSize: 12 }}>
                  {supplier.is_active ? "Hoạt động" : "Tạm dừng"}
                </Tag>
              </div>
            </Col>
          </Row>
        </Card>

        <Row gutter={[16, 16]}>
          {/* Contact Information */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <PhoneOutlined style={{ color: "#52c41a" }} />
                  <span>Thông tin liên hệ</span>
                </div>
              }
              style={{ height: "100%" }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <UserOutlined style={{ color: "#1890ff" }} />
                  <div>
                    <Text strong>Người liên hệ:</Text>
                    <br />
                    <Text>{supplier.contact_person}</Text>
                  </div>
                </div>
                <Divider style={{ margin: "8px 0" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <PhoneOutlined style={{ color: "#52c41a" }} />
                  <div>
                    <Text strong>Số điện thoại:</Text>
                    <br />
                    <Text copyable>{supplier.phone}</Text>
                  </div>
                </div>
                <Divider style={{ margin: "8px 0" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <MailOutlined style={{ color: "#fa8c16" }} />
                  <div>
                    <Text strong>Email:</Text>
                    <br />
                    <Text copyable>{supplier.email}</Text>
                  </div>
                </div>
                <Divider style={{ margin: "8px 0" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <EnvironmentOutlined style={{ color: "#722ed1" }} />
                  <div>
                    <Text strong>Địa chỉ:</Text>
                    <br />
                    <Text>{supplier.address}</Text>
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          {/* Bank Information */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <BankOutlined style={{ color: "#722ed1" }} />
                  <span>Thông tin ngân hàng</span>
                </div>
              }
              style={{ height: "100%" }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <BankOutlined style={{ color: "#722ed1" }} />
                  <div>
                    <Text strong>Tên ngân hàng:</Text>
                    <br />
                    <Text>{supplier.bank_name}</Text>
                  </div>
                </div>
                <Divider style={{ margin: "8px 0" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <BankOutlined style={{ color: "#1890ff" }} />
                  <div>
                    <Text strong>Số tài khoản:</Text>
                    <br />
                    <Text copyable style={{ fontFamily: "monospace" }}>
                      {supplier.bank_account}
                    </Text>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* System Information */}
        <Card
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CalendarOutlined style={{ color: "#8c8c8c" }} />
              <span>Thông tin hệ thống</span>
            </div>
          }
          style={{ marginTop: 16 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <div>
                <Text strong>Ngày tạo:</Text>
                <br />
                <Text>{formatDate(supplier.created_date)}</Text>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div>
                <Text strong>Ngày cập nhật:</Text>
                <br />
                <Text>{formatDate(supplier.modified_date)}</Text>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div>
                <Text strong>Người tạo:</Text>
                <br />
                <Text>{supplier.created_by}</Text>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div>
                <Text strong>Người cập nhật:</Text>
                <br />
                <Text>{supplier.modified_by}</Text>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </Modal>
  );
};

export default SupplierDetailModal;
