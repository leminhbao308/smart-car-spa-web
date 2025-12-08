"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Select,
  DatePicker,
  Row,
  Col,
  Card,
  Divider,
  Space,
  Button,
  message} from "antd";
import {
  CarOutlined,
  UserOutlined,
  CalendarOutlined,
  ToolOutlined} from "@ant-design/icons";
import {
  vehicleTypes,
  vehicleStatuses,
  vehicleBrands,
  vehicleColors,
  engineTypes,
  transmissions,
  fuelTypes} from "@/components/utils/data/car-profiles.data";
import dayjs from "dayjs";
import { MemoizedInput, MemoizedTextArea, MemoizedInputNumber } from "@/components/ui/MemoizedComponents";

const { Option } = Select;

interface CarProfile {
  id?: number;
  vehicleCode: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  engineType: string;
  engineCapacity: string;
  transmission: string;
  fuelType: string;
  mileage: number;
  vehicleType: string;
  status: string;
  registrationDate: string;
  insuranceExpiry: string;
  lastServiceDate?: string;
  nextServiceDate?: string;
  customerId?: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes?: string;
}

interface CarProfileModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (data: CarProfile) => void;
  editData?: CarProfile | null;
}

const CarProfileModal: React.FC<CarProfileModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  editData}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (editData) {
        // Edit mode - populate form with existing data
        form.setFieldsValue({
          ...editData,
          registrationDate: editData.registrationDate ? dayjs(editData.registrationDate) : null,
          insuranceExpiry: editData.insuranceExpiry ? dayjs(editData.insuranceExpiry) : null,
          lastServiceDate: editData.lastServiceDate ? dayjs(editData.lastServiceDate) : null,
          nextServiceDate: editData.nextServiceDate ? dayjs(editData.nextServiceDate) : null});
      } else {
        // Add mode - reset form
        form.resetFields();
        // Set default values for new vehicle
        form.setFieldsValue({
          status: "active",
          year: new Date().getFullYear(),
          mileage: 0,
          vehicleType: "sedan",
          engineType: "xăng",
          transmission: "tự động",
          fuelType: "Xăng A95"});
      }
    }
  }, [visible, editData, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Format dates
      const formattedData = {
        ...values,
        registrationDate: values.registrationDate?.format('YYYY-MM-DD'),
        insuranceExpiry: values.insuranceExpiry?.format('YYYY-MM-DD'),
        lastServiceDate: values.lastServiceDate?.format('YYYY-MM-DD'),
        nextServiceDate: values.nextServiceDate?.format('YYYY-MM-DD'),
        id: editData?.id || Date.now(), // Generate ID for new records
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSuccess(formattedData);
      message.success(editData ? "Cập nhật hồ sơ xe thành công!" : "Thêm hồ sơ xe thành công!");
      form.resetFields();
    } catch (error) {
      console.log("Form validation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <Space>
          <CarOutlined />
          {editData ? "Chỉnh sửa hồ sơ xe" : "Thêm hồ sơ xe mới"}
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      width={1000}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          {editData ? "Cập nhật" : "Thêm mới"}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        scrollToFirstError
      >
        {/* Vehicle Information */}
        <Card
          title={
            <Space>
              <CarOutlined />
              Thông tin xe
            </Space>
          }
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Mã xe"
                name="vehicleCode"
                rules={[
                  { required: true, message: "Vui lòng nhập mã xe!" },
                  { min: 3, message: "Mã xe phải có ít nhất 3 ký tự!" },
                ]}
              >
                <MemoizedInput placeholder="VD: X001" />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Biển số"
                name="licensePlate"
                rules={[
                  { required: true, message: "Vui lòng nhập biển số!" },
                  { pattern: /^[0-9]{2}[A-Z]{1,2}-[0-9]{4,5}$/, message: "Biển số không đúng định dạng!" },
                ]}
              >
                <MemoizedInput placeholder="VD: 51A-12345" style={{ textTransform: 'uppercase' }} />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Trạng thái"
                name="status"
                rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
              >
                <Select placeholder="Chọn trạng thái">
                  {vehicleStatuses.map(status => (
                    <Option key={status.value} value={status.value}>
                      {status.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="Hãng xe"
                name="brand"
                rules={[{ required: true, message: "Vui lòng chọn hãng xe!" }]}
              >
                <Select
                  placeholder="Chọn hãng xe"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {vehicleBrands.map(brand => (
                    <Option key={brand} value={brand}>{brand}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="Dòng xe"
                name="model"
                rules={[{ required: true, message: "Vui lòng nhập dòng xe!" }]}
              >
                <MemoizedInput placeholder="VD: Camry" />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="Năm sản xuất"
                name="year"
                rules={[
                  { required: true, message: "Vui lòng nhập năm sản xuất!" },
                  { type: 'number', min: 1990, max: new Date().getFullYear(), message: "Năm không hợp lệ!" },
                ]}
              >
                <MemoizedInputNumber
                  placeholder="2024"
                  style={{ width: '100%' }}
                  min={1990}
                  max={new Date().getFullYear()}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="Màu sắc"
                name="color"
                rules={[{ required: true, message: "Vui lòng chọn màu sắc!" }]}
              >
                <Select placeholder="Chọn màu">
                  {vehicleColors.map(color => (
                    <Option key={color} value={color}>{color}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="Loại xe"
                name="vehicleType"
                rules={[{ required: true, message: "Vui lòng chọn loại xe!" }]}
              >
                <Select placeholder="Chọn loại xe">
                  {vehicleTypes.map(type => (
                    <Option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="Loại động cơ"
                name="engineType"
                rules={[{ required: true, message: "Vui lòng chọn loại động cơ!" }]}
              >
                <Select placeholder="Chọn động cơ">
                  {engineTypes.map(engine => (
                    <Option key={engine.value} value={engine.value}>
                      {engine.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="Dung tích động cơ"
                name="engineCapacity"
                rules={[{ required: true, message: "Vui lòng nhập dung tích động cơ!" }]}
              >
                <MemoizedInput placeholder="VD: 2.5L" />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="Hộp số"
                name="transmission"
                rules={[{ required: true, message: "Vui lòng chọn hộp số!" }]}
              >
                <Select placeholder="Chọn hộp số">
                  {transmissions.map(trans => (
                    <Option key={trans.value} value={trans.value}>
                      {trans.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Loại nhiên liệu"
                name="fuelType"
                rules={[{ required: true, message: "Vui lòng chọn loại nhiên liệu!" }]}
              >
                <Select placeholder="Chọn nhiên liệu">
                  {fuelTypes.map(fuel => (
                    <Option key={fuel} value={fuel}>{fuel}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Số km hiện tại"
                name="mileage"
                rules={[
                  { required: true, message: "Vui lòng nhập số km!" },
                  { type: 'number', min: 0, message: "Số km phải lớn hơn 0!" },
                ]}
              >
                <MemoizedInputNumber
                  placeholder="0"
                  style={{ width: '100%' }}
                  min={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Ngày đăng ký"
                name="registrationDate"
                rules={[{ required: true, message: "Vui lòng chọn ngày đăng ký!" }]}
              >
                <DatePicker
                  placeholder="Chọn ngày"
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Customer Information */}
        <Card
          title={
            <Space>
              <UserOutlined />
              Thông tin chủ xe
            </Space>
          }
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Tên chủ xe"
                name="customerName"
                rules={[
                  { required: true, message: "Vui lòng nhập tên chủ xe!" },
                  { min: 2, message: "Tên phải có ít nhất 2 ký tự!" },
                ]}
              >
                <MemoizedInput placeholder="Nhập tên chủ xe" />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Số điện thoại"
                name="customerPhone"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                  { pattern: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ!" },
                ]}
              >
                <MemoizedInput placeholder="0123456789" />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Email"
                name="customerEmail"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: 'email', message: "Email không hợp lệ!" },
                ]}
              >
                <MemoizedInput placeholder="example@gmail.com" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Insurance & Service Information */}
        <Card
          title={
            <Space>
              <CalendarOutlined />
              Bảo hiểm & Bảo dưỡng
            </Space>
          }
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Ngày hết hạn bảo hiểm"
                name="insuranceExpiry"
                rules={[{ required: true, message: "Vui lòng chọn ngày hết hạn bảo hiểm!" }]}
              >
                <DatePicker
                  placeholder="Chọn ngày"
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Lần bảo dưỡng cuối"
                name="lastServiceDate"
              >
                <DatePicker
                  placeholder="Chọn ngày"
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Lần bảo dưỡng tiếp theo"
                name="nextServiceDate"
              >
                <DatePicker
                  placeholder="Chọn ngày"
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Notes */}
        <Card
          title={
            <Space>
              <ToolOutlined />
              Ghi chú
            </Space>
          }
          size="small"
        >
          <Form.Item
            label="Ghi chú"
            name="notes"
          >
            <MemoizedTextArea
              rows={4}
              placeholder="Nhập ghi chú về xe (tình trạng, lịch sử sửa chữa, v.v.)"
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Card>
      </Form>
    </Modal>
  );
};

export default CarProfileModal;

