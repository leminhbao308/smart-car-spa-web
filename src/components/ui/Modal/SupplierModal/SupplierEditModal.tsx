"use client";
import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Typography,
  message,
  Spin,
  Switch,
} from "antd";
import {
  BankOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  UserOutlined,
  SaveOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { Supplier, UpdateSupplierRequest } from "@/lib/api/types/supplier.types";
import { useUpdateSupplier } from "@/lib/api/hooks/useSuppliers";

const { Title } = Typography;

interface SupplierEditModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  supplier: Supplier | null;
  loading?: boolean;
}

const SupplierEditModal: React.FC<SupplierEditModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  supplier,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const updateSupplierMutation = useUpdateSupplier();

  useEffect(() => {
    if (supplier && visible) {
      form.setFieldsValue({
        supplier_name: supplier.supplier_name,
        contact_person: supplier.contact_person,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        bank_name: supplier.bank_name,
        bank_account: supplier.bank_account,
        is_active: supplier.is_active,
      });
    }
  }, [supplier, visible, form]);

  const handleSubmit = async (values: UpdateSupplierRequest) => {
    if (!supplier) return;

    try {
      await updateSupplierMutation.mutateAsync({
        supplierId: supplier.supplier_id,
        data: values,
      });
      message.success("Cập nhật nhà cung cấp thành công");
      onSuccess();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi cập nhật nhà cung cấp";
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
          <span>Chỉnh sửa nhà cung cấp</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      width={800}
      footer={null}
      styles={{
        header: {
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        },
      }}
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
                    { min: 2, message: "Tên nhà cung cấp phải có ít nhất 2 ký tự" },
                    { max: 255, message: "Tên nhà cung cấp không được vượt quá 255 ký tự" },
                  ]}
                >
                  <Input
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
                    { max: 255, message: "Tên người liên hệ không được vượt quá 255 ký tự" },
                  ]}
                >
                  <Input
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
                    { max: 20, message: "Số điện thoại không được vượt quá 20 ký tự" },
                    { pattern: /^[0-9+\-\s()]*$/, message: "Số điện thoại không hợp lệ" },
                  ]}
                >
                  <Input
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
                    { type: "email", message: "Email không hợp lệ" },
                    { max: 255, message: "Email không được vượt quá 255 ký tự" },
                  ]}
                >
                  <Input
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
                    { max: 1000, message: "Địa chỉ không được vượt quá 1000 ký tự" },
                  ]}
                >
                  <Input.TextArea
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
                    { max: 255, message: "Tên ngân hàng không được vượt quá 255 ký tự" },
                  ]}
                >
                  <Input
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
                    { max: 255, message: "Số tài khoản không được vượt quá 255 ký tự" },
                  ]}
                >
                  <Input
                    prefix={<BankOutlined />}
                    placeholder="Nhập số tài khoản"
                    size="large"
                    style={{ fontFamily: "monospace" }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Status Information */}
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircleOutlined style={{ color: "#52c41a" }} />
                <span>Trạng thái</span>
              </div>
            }
            style={{ marginBottom: 24 }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Form.Item
                  name="is_active"
                  label="Trạng thái hoạt động"
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren="Hoạt động"
                    unCheckedChildren="Tạm dừng"
                    size="large"
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
              borderTop: "1px solid #f0f0f0",
            }}
          >
            <Button size="large" onClick={handleCancel}>
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              icon={<SaveOutlined />}
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
              }}
            >
              Cập nhật
            </Button>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
};

export default SupplierEditModal;
