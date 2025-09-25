"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  App,
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
  HomeOutlined,
} from "@ant-design/icons";
import {
  UserManagementInfo,
  Role,
  UpdateUserRequest,
  CreateUserRequest,
} from "@/lib/api/types";
import { RoleService } from "@/lib/api/services/role.service";
import { UserService } from "@/lib/api/services/user.service";

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
  const { message } = App.useApp();

  const genders = [
    { value: "MALE", label: "Nam" },
    { value: "FEMALE", label: "Nữ" },
  ];

  // Load roles from API
  const loadRoles = useCallback(async () => {
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
  }, [message]);

  useEffect(() => {
    if (visible) {
      loadRoles();

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
          role_id: editData.role?.role_id,
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, editData, form, loadRoles]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      if (editData) {
        // Update existing customer
        const selectedRole = customerRoles.find(
          (role) => role.role_id === values.role_id
        );

        const updateData: UpdateUserRequest = {
          email: values.email,
          full_name: values.full_name,
          phone_number: values.phone_number,
          date_of_birth: values.date_of_birth
            ? values.date_of_birth.toISOString()
            : new Date().toISOString(),
          gender: values.gender,
          address: values.address || "",
          avatar_url: null,
          is_active: true,
          role_code: selectedRole?.role_code || customerRoles[0]?.role_code,
          customer_rank: "BRONZE", // Default rank for customers
          accumulated_points: 0,
        };

        await UserService.updateUser(editData.user_id, updateData);
        message.success("Cập nhật khách hàng thành công!");
      } else {
        // Create new customer using real API
        const selectedRole = customerRoles.find(
          (role) => role.role_id === values.role_id
        );

        const createData: CreateUserRequest = {
          email: values.email,
          password: values.password,
          googleId: null,
          fullName: values.full_name,
          phoneNumber: values.phone_number,
          dateOfBirth: values.date_of_birth
            ? values.date_of_birth.toISOString()
            : new Date().toISOString(),
          gender: values.gender,
          address: values.address || "",
          avatarUrl: null,
          roleCode: (selectedRole?.role_code ||
            customerRoles[0]?.role_code ||
            "CUSTOMER") as "CUSTOMER" | "ADMIN" | "STAFF",
        };

        const response = await UserService.createUser(createData);
        message.success("Tạo khách hàng thành công!");

        // response.data is already UserManagementInfo format
        onSuccess(response.data);
      }

      onCancel();
    } catch (error: unknown) {
      console.error("Error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra. Vui lòng thử lại!";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <App>
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

          {!editData && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Mật khẩu"
                  name="password"
                  rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu!" },
                    { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
                  ]}
                >
                  <Input.Password placeholder="Nhập mật khẩu" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Xác nhận mật khẩu"
                  name="confirmPassword"
                  dependencies={["password"]}
                  rules={[
                    { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("Mật khẩu xác nhận không khớp!")
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="Xác nhận mật khẩu" />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Số điện thoại"
                name="phone_number"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="Nhập số điện thoại"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Ngày sinh" name="date_of_birth">
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
                  notFoundContent={
                    rolesLoading ? <Spin size="small" /> : "Không có dữ liệu"
                  }
                  options={customerRoles.map((role) => ({
                    value: role.role_id,
                    label: (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
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
    </App>
  );
};

export default CustomerModal;
