"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  Divider,
  Radio,
  message,
  Row,
  Col,
} from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { departments } from "@/components/utils/data/user-accounts.data";
import { staffData as staffDataMock } from "@/components/utils/data/staff.data";

const { Option } = Select;

interface StaffAccountModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (data: any) => void;
  editData?: any;
}

interface Staff {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  status: string;
  joinDate: string;
}

const StaffAccountModal: React.FC<StaffAccountModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  editData,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState<"new" | "existing">("new");
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([]);

  useEffect(() => {
    if (visible) {
      // Lọc ra những nhân viên chưa có tài khoản
      // Trong thực tế, bạn sẽ gọi API để lấy danh sách nhân viên chưa có tài khoản
      setAvailableStaff(staffDataMock.filter(staff => !staff.hasAccount));
      
      if (editData) {
        form.setFieldsValue(editData);
        setAccountType("existing");
      } else {
        form.resetFields();
        setAccountType("new");
      }
    }
  }, [visible, editData, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const accountData = {
        ...values,
        id: editData?.id || Date.now(),
        createdAt: new Date().toISOString(),
        lastLogin: null,
        status: "active",
        permissions: getDefaultPermissions(values.role),
      };

      message.success(editData ? "Cập nhật tài khoản thành công!" : "Tạo tài khoản thành công!");
      onSuccess(accountData);
      onCancel();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultPermissions = (role: string) => {
    const permissionMap: { [key: string]: string[] } = {
      admin: ["all"],
      manager: ["read", "write", "manage_staff"],
      staff: ["read", "write"],
      viewer: ["read"],
    };
    return permissionMap[role] || ["read"];
  };

  const handleStaffSelect = (staffId: number) => {
    const staff = availableStaff.find(s => s.id === staffId);
    if (staff) {
      setSelectedStaff(staff);
      form.setFieldsValue({
        fullName: staff.name,
        email: staff.email,
        phone: staff.phone,
        department: staff.department,
        position: staff.position,
      });
    }
  };

  return (
    <Modal
      title={editData ? "Chỉnh sửa tài khoản nhân viên" : "Thêm tài khoản nhân viên"}
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
          {editData ? "Cập nhật" : "Tạo tài khoản"}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          role: "staff",
          status: "active",
        }}
      >
        {!editData && (
          <>
            <Divider orientation="left">Loại tài khoản</Divider>
            <Form.Item label="Chọn loại tài khoản">
              <Radio.Group
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
              >
                <Radio value="new">Tạo mới hoàn toàn</Radio>
                <Radio value="existing">Từ thông tin nhân viên có sẵn</Radio>
              </Radio.Group>
            </Form.Item>

            {accountType === "existing" && (
              <Form.Item
                label="Chọn nhân viên"
                name="staffId"
                rules={[{ required: true, message: "Vui lòng chọn nhân viên!" }]}
              >
                <Select
                  placeholder="Chọn nhân viên chưa có tài khoản"
                  onChange={handleStaffSelect}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {availableStaff.map((staff) => (
                    <Option key={staff.id} value={staff.id}>
                      {staff.name} - {staff.email} ({staff.position})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}
          </>
        )}

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
                disabled={accountType === "existing" && selectedStaff}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                { required: !editData, message: "Vui lòng nhập mật khẩu!" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
              ]}
            >
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Vai trò"
              name="role"
              rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
            >
              <Select placeholder="Chọn vai trò">
                <Option value="admin">Quản trị viên</Option>
                <Option value="manager">Quản lý</Option>
                <Option value="staff">Nhân viên</Option>
                <Option value="viewer">Người xem</Option>
              </Select>
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

        <Divider orientation="left">Thông tin cá nhân</Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Nhập họ và tên"
                disabled={accountType === "existing" && selectedStaff}
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
                disabled={accountType === "existing" && selectedStaff}
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
                disabled={accountType === "existing" && selectedStaff}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Chức vụ"
              name="position"
              rules={[{ required: true, message: "Vui lòng nhập chức vụ!" }]}
            >
              <Input placeholder="Nhập chức vụ" />
            </Form.Item>
          </Col>
        </Row>

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
      </Form>
    </Modal>
  );
};

export default StaffAccountModal;
