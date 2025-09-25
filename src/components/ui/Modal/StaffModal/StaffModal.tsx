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
import { UserManagementInfo, Role } from "@/lib/api/types";

const { TextArea } = Input;

interface StaffModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  editData?: UserManagementInfo | null;
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

  // Mock data for roles (non-customer roles)
  const staffRoles: Role[] = [
    {
      role_id: "91cc1277-709a-4312-98a2-db8c47d7efb1",
      role_name: "Administrator",
      role_code: "ADMIN",
      description: "Full system access"
    },
    {
      role_id: "eee6cddd-f7d8-463a-a2ca-c6784a4282d5",
      role_name: "Manager",
      role_code: "MANAGER",
      description: "Branch management access"
    },
    {
      role_id: "8ed98905-0562-4dba-af32-27839d86a087",
      role_name: "Technician",
      role_code: "TECHNICIAN",
      description: "Service technician access"
    },
    {
      role_id: "af686f51-4781-4fc2-8176-8ada13495db9",
      role_name: "Cashier",
      role_code: "CASHIER",
      description: "Sales and payment processing"
    },
    {
      role_id: "6250fd0d-dbce-4d59-881c-005a43f6a039",
      role_name: "Customer Service",
      role_code: "CS",
      description: "Customer support access"
    },
    {
      role_id: "10b82023-96c8-4d6e-8f35-d01d59663538",
      role_name: "Inventory Manager",
      role_code: "INV_MGR",
      description: "Inventory management access"
    }
  ];

  const genders = [
    { value: "male", label: "Nam", color: "blue" },
    { value: "female", label: "Nữ", color: "pink" },
  ];

  useEffect(() => {
    if (visible) {
      if (editData) {
        form.setFieldsValue({
          full_name: editData.full_name,
          email: editData.email,
          phone_number: editData.phone_number,
          date_of_birth: editData.date_of_birth
            ? dayjs(editData.date_of_birth)
            : null,
          gender: editData.gender,
          address: editData.address,
          role_id: editData.role.role_id,
          citizen_id: editData.citizen_id,
          hired_at: editData.hired_at
            ? dayjs(editData.hired_at)
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

      const selectedRole = staffRoles.find(role => role.role_id === values.role_id);
      
      const staffData: UserManagementInfo = {
        user_id: editData?.user_id || `user_${Date.now()}`,
        email: values.email,
        full_name: values.full_name,
        phone_number: values.phone_number,
        date_of_birth: values.date_of_birth ? values.date_of_birth.format("YYYY-MM-DD HH:mm:ss") : null,
        gender: values.gender,
        address: values.address,
        avatar_url: null,
        is_active: true,
        role: selectedRole || staffRoles[0],
        user_type: "EMPLOYEE",
        customer_rank: null,
        accumulated_points: null,
        total_orders: null,
        total_spent: null,
        hired_at: values.hired_at ? values.hired_at.format("YYYY-MM-DD HH:mm:ss") : null,
        citizen_id: values.citizen_id || null,
        createdDate: editData?.createdDate || new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      };

      message.success(
        editData
          ? "Cập nhật nhân viên thành công!"
          : "Tạo nhân viên thành công!"
      );
      onSuccess();
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
              name="full_name"
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
              name="phone_number"
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
              label="Ngày sinh"
              name="date_of_birth"
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
              rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
            >
              <Radio.Group>
                {genders.map((gender) => (
                  <Radio key={gender.value} value={gender.value.toUpperCase()}>
                    {gender.label}
                  </Radio>
                ))}
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Vai trò"
              name="role_id"
              rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
            >
              <Select
                placeholder="Chọn vai trò"
                options={staffRoles.map((role) => ({
                  value: role.role_id,
                  label: (
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <Tag color="blue" style={{ margin: 0 }}>
                        {role.role_name}
                      </Tag>
                      <span style={{ fontSize: 12, color: "#666" }}>
                        ({role.role_code})
                      </span>
                    </div>
                  ),
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Địa chỉ" name="address">
              <Input
                prefix={<HomeOutlined />}
                placeholder="Nhập địa chỉ (tùy chọn)"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="CMND/CCCD" name="citizen_id">
              <Input
                placeholder="Nhập số CMND/CCCD (tùy chọn)"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Ngày tuyển dụng" name="hired_at">
          <DatePicker
            style={{ width: "100%" }}
            placeholder="Chọn ngày tuyển dụng"
            format="DD/MM/YYYY"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StaffModal;
