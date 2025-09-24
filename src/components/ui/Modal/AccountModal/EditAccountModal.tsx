"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Divider,
  message,
  Row,
  Col,
  Switch,
} from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined } from "@ant-design/icons";
import { departments, userRoles } from "@/components/utils/data/user-accounts.data";
import { customerTypes, genders } from "@/components/utils/data/customers.data";
import { format, parseISO } from "date-fns";

const { Option } = Select;

// Types
interface Staff {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  status: string;
  joinDate: string;
  hasAccount?: boolean;
}

interface Customer {
  id: number;
  customerCode: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  customerType: string;
  totalOrders: number;
  totalSpent: number;
  lastVisit: string;
  joinDate: string;
  status: string;
  notes: string;
  vehicles: Array<{
    id: number;
    brand: string;
    model: string;
    year: number;
    licensePlate: string;
  }>;
  preferredServices: string[];
  hasAccount?: boolean;
}

interface EditAccountModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (data: Staff | Customer) => void;
  data: Staff | Customer | null;
  type: "staff" | "customer";
}

const EditAccountModal: React.FC<EditAccountModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  data,
  type,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  useEffect(() => {
    if (visible && data) {
      // Convert date strings to YYYY-MM-DD format for HTML date input
      const dateOfBirthValue = (data as Customer).dateOfBirth 
        ? format(parseISO((data as Customer).dateOfBirth), 'yyyy-MM-dd') 
        : '';
      const joinDateValue = (data as Staff).joinDate 
        ? format(parseISO((data as Staff).joinDate), 'yyyy-MM-dd') 
        : '';
      
      form.setFieldsValue({
        ...data,
        dateOfBirth: dateOfBirthValue,
        joinDate: joinDateValue,
      });
      setChangePassword(false);
    }
  }, [visible, data, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedData = {
        ...data,
        ...values,
        dateOfBirth: values.dateOfBirth || (data as Customer).dateOfBirth,
        joinDate: values.joinDate || (data as Staff).joinDate,
        updatedAt: new Date().toISOString(),
      };

      // Remove password from data if not changing
      if (!changePassword) {
        delete updatedData.password;
      }

      message.success("Cập nhật thông tin tài khoản thành công!");
      onSuccess(updatedData);
      onCancel();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Chỉnh sửa thông tin tài khoản ${type === "staff" ? "nhân viên" : "khách hàng"}`}
      open={visible}
      onCancel={onCancel}
      width={900}
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
          Cập nhật
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: "active",
        }}
      >
        <Divider orientation="left">Thông tin tài khoản</Divider>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Tên đăng nhập"
              name="username"
              rules={[
                { required: true, message: "Vui lòng nhập tên đăng nhập!" },
                { min: 3, message: "Tên đăng nhập phải có ít nhất 3 ký tự!" },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Nhập tên đăng nhập"
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
            <Form.Item label="Thay đổi mật khẩu">
              <Switch
                checked={changePassword}
                onChange={setChangePassword}
                checkedChildren="Có"
                unCheckedChildren="Không"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Trạng thái"
              name="status"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
            >
              <Select placeholder="Chọn trạng thái">
                <Option value="active">Hoạt động</Option>
                <Option value="inactive">Không hoạt động</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {changePassword && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Mật khẩu mới"
                name="password"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                  { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Nhập mật khẩu mới"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Xác nhận mật khẩu"
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Xác nhận mật khẩu mới"
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        {type === "staff" && (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Vai trò"
                  name="role"
                  rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
                >
                  <Select placeholder="Chọn vai trò">
                    {userRoles.map((role) => (
                      <Option key={role.value} value={role.value}>
                        {role.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Phòng ban"
                  name="department"
                  rules={[{ required: true, message: "Vui lòng chọn phòng ban!" }]}
                >
                  <Select placeholder="Chọn phòng ban">
                    {departments.map((dept) => (
                      <Option key={dept.value} value={dept.value}>
                        {dept.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        <Divider orientation="left">Thông tin cá nhân</Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Họ và tên"
              name={type === "staff" ? "name" : "fullName"}
              rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Nhập họ và tên"
              />
            </Form.Item>
          </Col>
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
        </Row>

        {type === "staff" ? (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Chức vụ"
                name="position"
                rules={[{ required: true, message: "Vui lòng nhập chức vụ!" }]}
              >
                <Input placeholder="Nhập chức vụ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Ngày vào làm"
                name="joinDate"
              >
                <Input
                  type="date"
                  style={{ width: '100%' }}
                  placeholder="Chọn ngày vào làm"
                />
              </Form.Item>
            </Col>
          </Row>
        ) : (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Mã khách hàng"
                  name="customerCode"
                  rules={[{ required: true, message: "Vui lòng nhập mã khách hàng!" }]}
                >
                  <Input placeholder="Nhập mã khách hàng" />
                </Form.Item>
              </Col>
              <Col span={12}>
              <Form.Item
                label="Ngày sinh"
                name="dateOfBirth"
              >
                <Input
                  type="date"
                  style={{ width: '100%' }}
                  placeholder="Chọn ngày sinh"
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
                  <Select placeholder="Chọn giới tính">
                    {genders.map((gender) => (
                      <Option key={gender.value} value={gender.value}>
                        {gender.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Loại khách hàng"
                  name="customerType"
                  rules={[{ required: true, message: "Vui lòng chọn loại khách hàng!" }]}
                >
                  <Select placeholder="Chọn loại khách hàng">
                    {customerTypes.map((type) => (
                      <Option key={type.value} value={type.value}>
                        {type.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Địa chỉ"
              name="address"
              rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Nhập địa chỉ"
              />
            </Form.Item>
          </>
        )}

        <Form.Item
          label="Ghi chú"
          name="notes"
        >
          <Input.TextArea
            rows={2}
            placeholder="Nhập ghi chú (tùy chọn)"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditAccountModal;
