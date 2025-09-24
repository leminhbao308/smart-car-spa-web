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
import { customersData as customersDataMock, customerTypes, genders } from "@/components/utils/data/customers.data";
import { format, parseISO } from "date-fns";

const { Option } = Select;

interface CustomerAccountModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (data: any) => void;
  editData?: any;
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
}

const CustomerAccountModal: React.FC<CustomerAccountModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  editData,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState<"new" | "existing">("new");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [availableCustomers, setAvailableCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    if (visible) {
      // Lọc ra những khách hàng chưa có tài khoản
      // Trong thực tế, bạn sẽ gọi API để lấy danh sách khách hàng chưa có tài khoản
      setAvailableCustomers(customersDataMock.filter(customer => !customer.hasAccount));
      
      if (editData) {
        const dateOfBirthValue = editData.dateOfBirth 
          ? format(parseISO(editData.dateOfBirth), 'yyyy-MM-dd') 
          : '';
        form.setFieldsValue({
          ...editData,
          dateOfBirth: dateOfBirthValue,
        });
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
        dateOfBirth: values.dateOfBirth || null,
        customerCode: values.customerCode || generateCustomerCode(),
        totalOrders: 0,
        totalSpent: 0,
        lastVisit: null,
        joinDate: new Date().toISOString(),
        vehicles: [],
        preferredServices: [],
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

  const generateCustomerCode = () => {
    const count = customersDataMock.length + 1;
    return `KH${count.toString().padStart(3, '0')}`;
  };

  const handleCustomerSelect = (customerId: number) => {
    const customer = availableCustomers.find(c => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      form.setFieldsValue({
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        dateOfBirth: customer.dateOfBirth 
          ? format(parseISO(customer.dateOfBirth), 'yyyy-MM-dd') 
          : '',
        gender: customer.gender,
        customerType: customer.customerType,
        customerCode: customer.customerCode,
      });
    }
  };

  return (
    <Modal
      title={editData ? "Chỉnh sửa tài khoản khách hàng" : "Thêm tài khoản khách hàng"}
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
          {editData ? "Cập nhật" : "Tạo tài khoản"}
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
        {!editData && (
          <>
            <Divider orientation="left">Loại tài khoản</Divider>
            <Form.Item label="Chọn loại tài khoản">
              <Radio.Group
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
              >
                <Radio value="new">Tạo mới hoàn toàn</Radio>
                <Radio value="existing">Từ thông tin khách hàng có sẵn</Radio>
              </Radio.Group>
            </Form.Item>

            {accountType === "existing" && (
              <Form.Item
                label="Chọn khách hàng"
                name="customerId"
                rules={[{ required: true, message: "Vui lòng chọn khách hàng!" }]}
              >
                <Select
                  placeholder="Chọn khách hàng chưa có tài khoản"
                  onChange={handleCustomerSelect}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {availableCustomers.map((customer) => (
                    <Option key={customer.id} value={customer.id}>
                      {customer.fullName} - {customer.email} ({customer.customerCode})
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
                disabled={accountType === "existing" && selectedCustomer}
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
              label="Mã khách hàng"
              name="customerCode"
              rules={[{ required: true, message: "Vui lòng nhập mã khách hàng!" }]}
            >
              <Input placeholder="Nhập mã khách hàng" />
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
                disabled={accountType === "existing" && selectedCustomer}
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
                disabled={accountType === "existing" && selectedCustomer}
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
                disabled={accountType === "existing" && selectedCustomer}
              />
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
                disabled={accountType === "existing" && selectedCustomer}
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
              <Select placeholder="Chọn giới tính" disabled={accountType === "existing" && selectedCustomer}>
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
            disabled={accountType === "existing" && selectedCustomer}
          />
        </Form.Item>

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

export default CustomerAccountModal;
