"use client";
import React from "react";
import {
  Modal,
  Form,
  Button,
  Card,
  Row,
  Col,
  Typography,
  message,
  Spin} from "antd";
import {
  BankOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  UserOutlined,
  PlusOutlined} from "@ant-design/icons";
import { CreateSupplierRequest } from "@/lib/api/types/supplier.types";
import { useSuppliers } from "@/lib/api/hooks/useSuppliers";
import { MemoizedInput, MemoizedTextArea, MemoizedInputNumber } from "@/components/ui/MemoizedComponents";

const { Title } = Typography;

interface SupplierCreateModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  loading?: boolean;
}

const SupplierCreateModal: React.FC<SupplierCreateModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  loading = false}) => {
  const [form] = Form.useForm();
  const { createSupplier } = useSuppliers({});

  const handleSubmit = async (values: CreateSupplierRequest) => {
    try {
      await createSupplier(values);
      message.success("Thêm nhà cung cấp thành công");
      form.resetFields();
      onSuccess();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi thêm nhà cung cấp";
      message.error(errorMessage);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <BankOutlined style={{ color: "#1890ff" }} />
          <span>Thêm nhà cung cấp mới</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      width={800}
      footer={null}
      styles={{
        header: {
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white"}}}
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ padding: "16px 0" }}
        >
          {/* Basic Information */}
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <BankOutlined style={{ color: "#1890ff" }} />
                <span>Thông tin cơ bản</span>
              </div>
            }
            style={{ marginBottom: 16 }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="supplier_name"
                  label="Tên nhà cung cấp"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên nhà cung cấp" },
                    { min: 2, message: "Tên nhà cung cấp phải có ít nhất 2 ký tự" },
                  ]}
                >
                  <MemoizedInput
                    prefix={<BankOutlined />}
                    placeholder="Nhập tên nhà cung cấp"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="contact_person"
                  label="Người liên hệ"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên người liên hệ" },
                    { min: 2, message: "Tên người liên hệ phải có ít nhất 2 ký tự" },
                  ]}
                >
                  <MemoizedInput
                    prefix={<UserOutlined />}
                    placeholder="Nhập tên người liên hệ"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Contact Information */}
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <PhoneOutlined style={{ color: "#52c41a" }} />
                <span>Thông tin liên hệ</span>
              </div>
            }
            style={{ marginBottom: 16 }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="phone"
                  label="Số điện thoại"
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại" },
                    { pattern: /^[0-9+\-\s()]+$/, message: "Số điện thoại không hợp lệ" },
                  ]}
                >
                  <MemoizedInput
                    prefix={<PhoneOutlined />}
                    placeholder="Nhập số điện thoại"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email" },
                    { type: "email", message: "Email không hợp lệ" },
                  ]}
                >
                  <MemoizedInput
                    prefix={<MailOutlined />}
                    placeholder="Nhập email"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="address"
                  label="Địa chỉ"
                  rules={[
                    { required: true, message: "Vui lòng nhập địa chỉ" },
                    { min: 5, message: "Địa chỉ phải có ít nhất 5 ký tự" },
                  ]}
                >
                  <MemoizedTextArea
                    prefix={<EnvironmentOutlined />}
                    placeholder="Nhập địa chỉ đầy đủ"
                    rows={3}
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Bank Information */}
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <BankOutlined style={{ color: "#722ed1" }} />
                <span>Thông tin ngân hàng</span>
              </div>
            }
            style={{ marginBottom: 24 }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="bank_name"
                  label="Tên ngân hàng"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên ngân hàng" },
                    { min: 2, message: "Tên ngân hàng phải có ít nhất 2 ký tự" },
                  ]}
                >
                  <MemoizedInput
                    prefix={<BankOutlined />}
                    placeholder="Nhập tên ngân hàng"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="bank_account"
                  label="Số tài khoản"
                  rules={[
                    { required: true, message: "Vui lòng nhập số tài khoản" },
                    { pattern: /^[0-9]+$/, message: "Số tài khoản chỉ được chứa số" },
                    { min: 8, message: "Số tài khoản phải có ít nhất 8 chữ số" },
                  ]}
                >
                  <MemoizedInput
                    prefix={<BankOutlined />}
                    placeholder="Nhập số tài khoản"
                    size="large"
                    style={{ fontFamily: "monospace" }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
              paddingTop: 16,
              borderTop: "1px solid #f0f0f0"}}
          >
            <Button size="large" onClick={handleCancel}>
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              icon={<PlusOutlined />}
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none"}}
            >
              Thêm mới
            </Button>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
};

export default SupplierCreateModal;

