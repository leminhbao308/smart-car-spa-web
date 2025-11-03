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
  Spin,
} from "antd";
import dayjs from "dayjs";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {
  UserManagementInfo,
  Role,
  UpdateUserRequest,
  CreateUserRequest,
} from "@/lib/api/types";
import { RoleService } from "@/lib/api/services/role.service";
import { UserService } from "@/lib/api/services/user.service";

// const { TextArea } = Input; // Not used in this component

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
  const [rolesLoading, setRolesLoading] = useState(false);
  const [staffRoles, setStaffRoles] = useState<Role[]>([]);

  const genders = [
    { value: "male", label: "Nam", color: "blue" },
    { value: "female", label: "Nữ", color: "pink" },
  ];

  // Load roles from API
  const loadRoles = async () => {
    try {
      setRolesLoading(true);
      console.log("StaffModal: Loading roles...");
      const response = await RoleService.getAllRoles();
      console.log("StaffModal: Roles response:", response);

      if (response.success && response.data) {
        // Filter out customer roles for staff
        const nonCustomerRoles = response.data.filter(
          (role: Role) => role.role_code !== "CUSTOMER"
        );
        console.log("StaffModal: Filtered roles:", nonCustomerRoles);
        setStaffRoles(nonCustomerRoles);
      } else {
        console.warn("StaffModal: No roles data received");
        setStaffRoles([]);
      }
    } catch (error) {
      console.log("StaffModal: Error loading roles:", error);
      message.error("Không thể tải danh sách vai trò. Vui lòng thử lại.");
      setStaffRoles([]);
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
          date_of_birth: editData.date_of_birth
            ? dayjs(editData.date_of_birth)
            : null,
          gender: editData.gender,
          address: editData.address,
          role_id: editData.role.role_id,
          citizen_id: editData.citizen_id,
          hired_at: editData.hired_at ? dayjs(editData.hired_at) : null,
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, editData, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      console.log("StaffModal: Starting form validation...");

      const values = await form.validateFields();
      console.log("StaffModal: Form validation successful, values:", values);

      // Additional validation
      if (!values.email || !values.full_name || !values.phone_number) {
        throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc.");
      }

      if (!editData && (!values.password || !values.role_id)) {
        throw new Error("Vui lòng điền đầy đủ mật khẩu và chọn vai trò.");
      }

      if (editData) {
        // Update existing user
        console.log("StaffModal: Updating existing user...");
        const selectedRole = staffRoles.find(
          (role) => role.role_id === values.role_id
        );

        try {
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
            role_code: selectedRole?.role_code || staffRoles[0]?.role_code,
            citizen_id: values.citizen_id || null,
          };

          console.log("StaffModal: Update data:", updateData);
          console.log("StaffModal: Calling UserService.updateUser...");

          const result = await UserService.updateUser(
            editData.user_id,
            updateData
          );
          console.log("StaffModal: UserService.updateUser result:", result);

          message.success("Cập nhật nhân viên thành công!");
        } catch (apiError) {
          console.log("StaffModal: API Error in updateUser:", apiError);
          throw apiError; // Re-throw to be caught by outer catch
        }
      } else {
        // Create new user using real API
        console.log("StaffModal: Creating new user...");
        console.log("StaffModal: Available roles:", staffRoles);
        console.log("StaffModal: Selected role_id:", values.role_id);

        const selectedRole = staffRoles.find(
          (role) => role.role_id === values.role_id
        );
        console.log("StaffModal: Selected role:", selectedRole);

        if (!selectedRole && staffRoles.length === 0) {
          throw new Error(
            "Không có vai trò nào khả dụng. Vui lòng thử lại sau."
          );
        }

        try {
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
              staffRoles[0]?.role_code ||
              "STAFF") as "CUSTOMER" | "ADMIN" | "STAFF",
            user_type: "EMPLOYEE",
            // Employee-specific fields
            hired_at: values.hired_at ? values.hired_at.toISOString() : new Date().toISOString(),
            citizen_id: values.citizen_id,
          };


          const result = await UserService.createUser(createData);
          console.log("StaffModal: UserService.createUser result:", result);

          message.success("Tạo nhân viên thành công!");
        } catch (apiError) {
          console.log("StaffModal: API Error in createUser:", apiError);
          throw apiError; // Re-throw to be caught by outer catch
        }
      }

      console.log("StaffModal: Calling onSuccess...");
      onSuccess();
      console.log("StaffModal: Calling onCancel...");
      onCancel();
      console.log("StaffModal: Success flow completed");
    } catch (error: unknown) {
      // Enhanced error logging
      console.log("=== StaffModal Error Debug ===");
      console.log("Raw error:", error);
      console.log("Error type:", typeof error);
      console.log("Error constructor:", error?.constructor?.name);
      console.log("Error string:", String(error));
      console.log("Error JSON:", JSON.stringify(error, null, 2));

      if (error instanceof Error) {
        console.log("Error message:", error.message);
        console.log("Error stack:", error.stack);
        console.log("Error name:", error.name);
      }

      if (error && typeof error === "object") {
        console.log("Error keys:", Object.keys(error));
        console.log("Error values:", Object.values(error));
      }

      console.log("=== End Error Debug ===");

      let errorMessage = "Có lỗi xảy ra. Vui lòng thử lại!";

      if (error instanceof Error) {
        errorMessage = error.message || "Lỗi không xác định";
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error && typeof error === "object") {
        // Try to extract message from various possible properties
        const errorObj = error as Record<string, unknown>;
        const possibleMessage =
          errorObj.message ||
          errorObj.error ||
          errorObj.detail ||
          errorObj.description;
        if (possibleMessage) {
          errorMessage = String(possibleMessage);
        }
      }

      console.log("Final error message:", errorMessage);
      message.error(errorMessage);
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
                loading={rolesLoading}
                notFoundContent={
                  rolesLoading ? <Spin size="small" /> : "Không có dữ liệu"
                }
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
            <Form.Item 
              label="CMND/CCCD" 
              name="citizen_id"
              rules={[
                { required: !editData, message: "Vui lòng nhập số CMND/CCCD!" },
                {
                  pattern: /^[0-9]{9,12}$/,
                  message: "Số CMND/CCCD phải có 9-12 chữ số!",
                },
              ]}
            >
              <Input placeholder="Nhập số CMND/CCCD" />
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
