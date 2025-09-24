"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  message,
  Row,
  Col,
  DatePicker,
  Radio,
  Card,
  Typography,
  Tag,
} from "antd";
import dayjs from "dayjs";
import { 
  UserOutlined, 
  PhoneOutlined,
  MailOutlined,
  HomeOutlined
} from "@ant-design/icons";
import { customerTypes, genders, customerStatuses } from "@/components/utils/data/customers.data";

const { TextArea } = Input;
const { Text } = Typography;

interface CustomerModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (data: Record<string, unknown>) => void;
  editData?: Record<string, unknown>;
  title?: string;
}

const CustomerModal: React.FC<CustomerModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  editData,
  title = "Thêm khách hàng mới",
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (editData) {
        form.setFieldsValue({
          ...editData,
          dateOfBirth: editData.dateOfBirth ? dayjs(editData.dateOfBirth as string) : null,
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, editData, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const customerData = {
        ...values,
        id: editData?.id || Date.now(),
        customerCode: editData?.customerCode || `KH${String(Date.now()).slice(-3)}`,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
        totalOrders: editData?.totalOrders || 0,
        totalSpent: editData?.totalSpent || 0,
        lastVisit: editData?.lastVisit || new Date().toISOString().replace("T", " ").substring(0, 19),
        joinDate: editData?.joinDate || new Date().toISOString().replace("T", " ").substring(0, 19),
        status: editData?.status || "active",
        vehicles: editData?.vehicles || [],
        preferredServices: editData?.preferredServices || [],
        hasAccount: editData?.hasAccount || false,
      };

      message.success(editData ? "Cập nhật khách hàng thành công!" : "Tạo khách hàng thành công!");
      onSuccess(customerData);
      onCancel();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <UserOutlined style={{ color: "#1890ff" }} />
          <span>{title}</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          {editData ? "Cập nhật" : "Tạo khách hàng"}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: "active",
          customerType: "regular",
          gender: "male",
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[
                { required: true, message: "Vui lòng nhập họ và tên!" },
                { min: 2, message: "Họ và tên phải có ít nhất 2 ký tự!" },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Nhập họ và tên"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Nhập email"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
                { pattern: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ!" },
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="Nhập số điện thoại"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Ngày sinh"
              name="dateOfBirth"
              rules={[
                { required: true, message: "Vui lòng chọn ngày sinh!" },
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Chọn ngày sinh"
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Giới tính"
              name="gender"
              rules={[
                { required: true, message: "Vui lòng chọn giới tính!" },
              ]}
            >
              <Radio.Group>
                {genders.map((gender) => (
                  <Radio key={gender.value} value={gender.value}>
                    {gender.label}
                  </Radio>
                ))}
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Loại khách hàng"
              name="customerType"
              rules={[
                { required: true, message: "Vui lòng chọn loại khách hàng!" },
              ]}
            >
              <Select
                placeholder="Chọn loại khách hàng"
                options={customerTypes.map(type => ({
                  value: type.value,
                  label: (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Tag color={type.color} style={{ margin: 0 }}>
                        {type.label}
                      </Tag>
                      <span>{type.description}</span>
                    </div>
                  ),
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Địa chỉ"
          name="address"
          rules={[
            { required: true, message: "Vui lòng nhập địa chỉ!" },
            { min: 10, message: "Địa chỉ phải có ít nhất 10 ký tự!" },
          ]}
        >
          <Input
            prefix={<HomeOutlined />}
            placeholder="Nhập địa chỉ đầy đủ"
          />
        </Form.Item>

        <Form.Item
          label="Ghi chú"
          name="notes"
        >
          <TextArea
            rows={3}
            placeholder="Nhập ghi chú về khách hàng (tùy chọn)..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CustomerModal;
