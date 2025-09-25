"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  message,
  Row,
  Col,
  DatePicker,
  Radio,
  Select,
  Tag,
  Spin,
} from "antd";
import dayjs from "dayjs";
import { 
  UserOutlined, 
  PhoneOutlined,
  MailOutlined,
  HomeOutlined
} from "@ant-design/icons";
import { UserManagementInfo, Role } from "@/lib/api/types";
import { RoleService } from "@/lib/api/services/role.service";

const { TextArea } = Input;

interface CustomerModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (data: UserManagementInfo) => void;
  editData?: UserManagementInfo | null;
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
  const [rolesLoading, setRolesLoading] = useState(false);
  const [customerRoles, setCustomerRoles] = useState<Role[]>([]);

  const genders = [
    { value: "MALE", label: "Nam" },
    { value: "FEMALE", label: "Nữ" },
  ];

  // Load roles from API
  const loadRoles = async () => {
    try {
      setRolesLoading(true);
      const response = await RoleService.getAllRoles();
      
      if (response.success && response.data) {
        // Filter only customer roles
        const customerOnlyRoles = response.data.filter(
          (role: Role) => role.role_code === "CUSTOMER"
        );
        setCustomerRoles(customerOnlyRoles);
      }
    } catch (error) {
      console.error("Error loading roles:", error);
      message.error("Không thể tải danh sách vai trò. Vui lòng thử lại.");
    } finally {
      setRolesLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadRoles();
      
      if (editData) {
        form.setFieldsValue({
          full_name: editData.full_name,
          email: editData.email,
          phone_number: editData.phone_number,
          date_of_birth: editData.date_of_birth ? dayjs(editData.date_of_birth) : null,
          gender: editData.gender,
          address: editData.address,
          role_id: editData.role?.role_id,
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
      
      const selectedRole = customerRoles.find(role => role.role_id === values.role_id) || customerRoles[0];
      
      const customerData: UserManagementInfo = {
        id: editData?.id || `customer_${Date.now()}`,
        user_id: editData?.user_id || `user_${Date.now()}`,
        email: values.email,
        full_name: values.full_name,
        phone_number: values.phone_number,
        date_of_birth: values.date_of_birth ? values.date_of_birth.format("YYYY-MM-DD HH:mm:ss") : null,
        gender: values.gender,
        address: values.address,
        avatar_url: null,
        is_active: true,
        role: selectedRole,
        user_type: "CUSTOMER",
        customer_rank: null,
        accumulated_points: 0,
        total_orders: 0,
        total_spent: 0.0,
        hired_at: null,
        citizen_id: null,
        created_at: editData?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      message.success(editData ? "Cập nhật khách hàng thành công!" : "Tạo khách hàng thành công!");
      onSuccess(customerData);
      onCancel();
    } catch (error) {
      console.log("Error:", error);
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
          gender: "MALE",
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
              name="phone_number"
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
              label="Vai trò"
              name="role_id"
              rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
            >
              <Select
                placeholder="Chọn vai trò"
                loading={rolesLoading}
                notFoundContent={rolesLoading ? <Spin size="small" /> : "Không có dữ liệu"}
                options={customerRoles.map((role) => ({
                  value: role.role_id,
                  label: (
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <Tag color="green" style={{ margin: 0 }}>
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
          <Col span={24}>
            <Form.Item label="Địa chỉ" name="address">
              <Input
                prefix={<HomeOutlined />}
                placeholder="Nhập địa chỉ (tùy chọn)"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CustomerModal;
