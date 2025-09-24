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
  Tag,
} from "antd";
import dayjs from "dayjs";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  TeamOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;

interface StaffModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (data: Record<string, unknown>) => void;
  editData?: Record<string, unknown>;
  title?: string;
}

const StaffModal: React.FC<StaffModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  editData,
  title = "Thêm nhân viên mới",
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Mock data for positions and departments
  const positions = [
    { value: "Quản lý", label: "Quản lý", color: "red" },
    { value: "Trưởng phòng", label: "Trưởng phòng", color: "orange" },
    { value: "Nhân viên", label: "Nhân viên", color: "blue" },
    { value: "Kỹ thuật viên", label: "Kỹ thuật viên", color: "green" },
    {
      value: "Nhân viên kinh doanh",
      label: "Nhân viên kinh doanh",
      color: "purple",
    },
    { value: "Kế toán", label: "Kế toán", color: "cyan" },
    { value: "Nhân viên kho", label: "Nhân viên kho", color: "lime" },
  ];

  const departments = [
    { value: "Kỹ thuật", label: "Kỹ thuật", color: "blue" },
    { value: "Kinh doanh", label: "Kinh doanh", color: "green" },
    { value: "Kế toán", label: "Kế toán", color: "purple" },
    { value: "Kho", label: "Kho", color: "orange" },
    { value: "Hành chính", label: "Hành chính", color: "cyan" },
  ];

  const genders = [
    { value: "male", label: "Nam", color: "blue" },
    { value: "female", label: "Nữ", color: "pink" },
  ];

  useEffect(() => {
    if (visible) {
      if (editData) {
        form.setFieldsValue({
          ...editData,
          joinDate: editData.joinDate
            ? dayjs(editData.joinDate as string)
            : null,
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
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const staffData = {
        ...values,
        id: editData?.id || Date.now(),
        joinDate: values.joinDate ? values.joinDate.format("YYYY-MM-DD") : null,
        status: editData?.status || "active",
        hasAccount: editData?.hasAccount || false,
      };

      message.success(
        editData
          ? "Cập nhật nhân viên thành công!"
          : "Tạo nhân viên thành công!"
      );
      onSuccess(staffData);
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
          <TeamOutlined style={{ color: "#1890ff" }} />
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
          {editData ? "Cập nhật" : "Tạo nhân viên"}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: "active",
          gender: "male",
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Họ và tên"
              name="name"
              rules={[
                { required: true, message: "Vui lòng nhập họ và tên!" },
                { min: 2, message: "Họ và tên phải có ít nhất 2 ký tự!" },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên" />
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
              <Input prefix={<MailOutlined />} placeholder="Nhập email" />
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
                {
                  pattern: /^[0-9]{10,11}$/,
                  message: "Số điện thoại không hợp lệ!",
                },
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
              label="Ngày vào làm"
              name="joinDate"
              rules={[
                { required: true, message: "Vui lòng chọn ngày vào làm!" },
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Chọn ngày vào làm"
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
              rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
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
              label="Chức vụ"
              name="position"
              rules={[{ required: true, message: "Vui lòng chọn chức vụ!" }]}
            >
              <Select
                placeholder="Chọn chức vụ"
                options={positions.map((pos) => ({
                  value: pos.value,
                  label: (
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <Tag color={pos.color} style={{ margin: 0 }}>
                        {pos.label}
                      </Tag>
                    </div>
                  ),
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Phòng ban"
              name="department"
              rules={[{ required: true, message: "Vui lòng chọn phòng ban!" }]}
            >
              <Select
                placeholder="Chọn phòng ban"
                options={departments.map((dept) => ({
                  value: dept.value,
                  label: (
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <Tag color={dept.color} style={{ margin: 0 }}>
                        {dept.label}
                      </Tag>
                    </div>
                  ),
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Địa chỉ" name="address">
              <Input
                prefix={<HomeOutlined />}
                placeholder="Nhập địa chỉ (tùy chọn)"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Ghi chú" name="notes">
          <TextArea
            rows={3}
            placeholder="Nhập ghi chú về nhân viên (tùy chọn)..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StaffModal;
