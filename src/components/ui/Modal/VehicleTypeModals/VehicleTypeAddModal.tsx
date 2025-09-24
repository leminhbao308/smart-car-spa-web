"use client";
import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  message,
  Space,
  Typography,
  InputNumber,
} from "antd";
import {
  PlusOutlined,
  CarOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { fuelEfficiencyLevels, comfortLevels, performanceLevels, typeStatuses } from "@/components/utils/data/vehicle-types.data";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface VehicleTypeAddModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (vehicleType: any) => void;
}

const VehicleTypeAddModal: React.FC<VehicleTypeAddModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [characteristics, setCharacteristics] = useState<string[]>([]);
  const [targetCustomers, setTargetCustomers] = useState<string[]>([]);
  const [popularBrands, setPopularBrands] = useState<string[]>([]);
  const [examples, setExamples] = useState<string[]>([]);
  const [newCharacteristic, setNewCharacteristic] = useState("");
  const [newCustomer, setNewCustomer] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [newExample, setNewExample] = useState("");

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const newVehicleType = {
        id: Date.now(),
        ...values,
        characteristics,
        targetCustomers,
        popularBrands,
        examples,
        totalModels: 0,
        totalVehicles: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onSuccess(newVehicleType);
      message.success("Thêm loại xe thành công!");
      form.resetFields();
      resetArrays();
      onClose();
    } catch (error) {
      message.error("Có lỗi xảy ra khi thêm loại xe!");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    resetArrays();
    onClose();
  };

  const resetArrays = () => {
    setCharacteristics([]);
    setTargetCustomers([]);
    setPopularBrands([]);
    setExamples([]);
    setNewCharacteristic("");
    setNewCustomer("");
    setNewBrand("");
    setNewExample("");
  };

  const addItem = (type: string, value: string, setter: (items: string[]) => void, setNewValue: (value: string) => void) => {
    if (value.trim()) {
      setter(prev => [...prev, value.trim()]);
      setNewValue("");
    }
  };

  const removeItem = (type: string, value: string, setter: (items: string[]) => void) => {
    setter(prev => prev.filter(item => item !== value));
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <PlusOutlined style={{ color: "#1890ff" }} />
          <Title level={4} style={{ margin: 0 }}>
            Thêm loại xe mới
          </Title>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
      styles={{
        body: { maxHeight: "70vh", overflowY: "auto" },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          status: "active",
        }}
      >
        <Row gutter={[16, 16]}>
          {/* Thông tin cơ bản */}
          <Col span={12}>
            <Form.Item
              label="Tên loại xe"
              name="typeName"
              rules={[
                { required: true, message: "Vui lòng nhập tên loại xe!" },
                { min: 2, message: "Tên loại xe phải có ít nhất 2 ký tự!" },
              ]}
            >
              <Input placeholder="Nhập tên loại xe" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Mã loại xe"
              name="typeCode"
              rules={[
                { required: true, message: "Vui lòng nhập mã loại xe!" },
                { pattern: /^[A-Z0-9_]+$/, message: "Mã loại xe chỉ được chứa chữ hoa, số và dấu gạch dưới!" },
              ]}
            >
              <Input placeholder="VD: SEDAN, SUV" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Icon"
              name="icon"
              rules={[{ required: true, message: "Vui lòng chọn icon!" }]}
            >
              <Select placeholder="Chọn icon">
                <Option value="🚗">🚗 Sedan</Option>
                <Option value="🚙">🚙 SUV</Option>
                <Option value="🚘">🚘 Hatchback</Option>
                <Option value="🏎️">🏎️ Coupe</Option>
                <Option value="🚛">🚛 Truck</Option>
                <Option value="🚐">🚐 Van</Option>
                <Option value="🏍️">🏍️ Motorcycle</Option>
                <Option value="🚜">🚜 Tractor</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Màu sắc"
              name="color"
              rules={[{ required: true, message: "Vui lòng chọn màu sắc!" }]}
            >
              <Select placeholder="Chọn màu sắc">
                <Option value="blue">Xanh dương</Option>
                <Option value="green">Xanh lá</Option>
                <Option value="red">Đỏ</Option>
                <Option value="orange">Cam</Option>
                <Option value="purple">Tím</Option>
                <Option value="pink">Hồng</Option>
                <Option value="cyan">Xanh cyan</Option>
                <Option value="lime">Xanh lime</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label="Mô tả"
              name="description"
              rules={[
                { required: true, message: "Vui lòng nhập mô tả!" },
                { min: 10, message: "Mô tả phải có ít nhất 10 ký tự!" },
              ]}
            >
              <TextArea
                rows={3}
                placeholder="Nhập mô tả về loại xe..."
                showCount
                maxLength={500}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Phân khúc giá"
              name="priceRange"
              rules={[{ required: true, message: "Vui lòng nhập phân khúc giá!" }]}
            >
              <Input placeholder="VD: Từ 400 triệu - 3 tỷ VNĐ" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Trạng thái"
              name="status"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
            >
              <Select placeholder="Chọn trạng thái">
                {typeStatuses.map((status) => (
                  <Option key={status.value} value={status.value}>
                    {status.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Đánh giá hiệu suất */}
          <Col span={8}>
            <Form.Item
              label="Tiết kiệm nhiên liệu"
              name="fuelEfficiency"
              rules={[{ required: true, message: "Vui lòng chọn mức tiết kiệm nhiên liệu!" }]}
            >
              <Select placeholder="Chọn mức độ">
                {fuelEfficiencyLevels.map((level) => (
                  <Option key={level.value} value={level.value}>
                    <Space>
                      <span>{level.icon}</span>
                      <span>{level.label}</span>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Mức độ thoải mái"
              name="comfort"
              rules={[{ required: true, message: "Vui lòng chọn mức độ thoải mái!" }]}
            >
              <Select placeholder="Chọn mức độ">
                {comfortLevels.map((level) => (
                  <Option key={level.value} value={level.value}>
                    <Space>
                      <span>{level.icon}</span>
                      <span>{level.label}</span>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Hiệu suất"
              name="performance"
              rules={[{ required: true, message: "Vui lòng chọn mức hiệu suất!" }]}
            >
              <Select placeholder="Chọn mức độ">
                {performanceLevels.map((level) => (
                  <Option key={level.value} value={level.value}>
                    <Space>
                      <span>{level.icon}</span>
                      <span>{level.label}</span>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Đặc điểm */}
          <Col span={24}>
            <Form.Item label="Đặc điểm">
              <div style={{ marginBottom: 8 }}>
                <Space.Compact style={{ width: "100%" }}>
                  <Input
                    placeholder="Nhập đặc điểm"
                    value={newCharacteristic}
                    onChange={(e) => setNewCharacteristic(e.target.value)}
                    onPressEnter={() => addItem("characteristic", newCharacteristic, setCharacteristics, setNewCharacteristic)}
                  />
                  <Button type="primary" onClick={() => addItem("characteristic", newCharacteristic, setCharacteristics, setNewCharacteristic)}>
                    Thêm
                  </Button>
                </Space.Compact>
              </div>
              <div>
                {characteristics.map((characteristic) => (
                  <Button
                    key={characteristic}
                    size="small"
                    style={{ marginBottom: 4, marginRight: 4 }}
                    onClick={() => removeItem("characteristic", characteristic, setCharacteristics)}
                  >
                    {characteristic} <MinusCircleOutlined />
                  </Button>
                ))}
              </div>
            </Form.Item>
          </Col>

          {/* Khách hàng mục tiêu */}
          <Col span={24}>
            <Form.Item label="Khách hàng mục tiêu">
              <div style={{ marginBottom: 8 }}>
                <Space.Compact style={{ width: "100%" }}>
                  <Input
                    placeholder="Nhập khách hàng mục tiêu"
                    value={newCustomer}
                    onChange={(e) => setNewCustomer(e.target.value)}
                    onPressEnter={() => addItem("customer", newCustomer, setTargetCustomers, setNewCustomer)}
                  />
                  <Button type="primary" onClick={() => addItem("customer", newCustomer, setTargetCustomers, setNewCustomer)}>
                    Thêm
                  </Button>
                </Space.Compact>
              </div>
              <div>
                {targetCustomers.map((customer) => (
                  <Button
                    key={customer}
                    size="small"
                    style={{ marginBottom: 4, marginRight: 4 }}
                    onClick={() => removeItem("customer", customer, setTargetCustomers)}
                  >
                    {customer} <MinusCircleOutlined />
                  </Button>
                ))}
              </div>
            </Form.Item>
          </Col>

          {/* Hãng xe phổ biến */}
          <Col span={12}>
            <Form.Item label="Hãng xe phổ biến">
              <div style={{ marginBottom: 8 }}>
                <Space.Compact style={{ width: "100%" }}>
                  <Input
                    placeholder="Nhập hãng xe"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    onPressEnter={() => addItem("brand", newBrand, setPopularBrands, setNewBrand)}
                  />
                  <Button type="primary" onClick={() => addItem("brand", newBrand, setPopularBrands, setNewBrand)}>
                    Thêm
                  </Button>
                </Space.Compact>
              </div>
              <div>
                {popularBrands.map((brand) => (
                  <Button
                    key={brand}
                    size="small"
                    style={{ marginBottom: 4, marginRight: 4 }}
                    onClick={() => removeItem("brand", brand, setPopularBrands)}
                  >
                    {brand} <MinusCircleOutlined />
                  </Button>
                ))}
              </div>
            </Form.Item>
          </Col>

          {/* Ví dụ model */}
          <Col span={12}>
            <Form.Item label="Ví dụ model">
              <div style={{ marginBottom: 8 }}>
                <Space.Compact style={{ width: "100%" }}>
                  <Input
                    placeholder="Nhập ví dụ model"
                    value={newExample}
                    onChange={(e) => setNewExample(e.target.value)}
                    onPressEnter={() => addItem("example", newExample, setExamples, setNewExample)}
                  />
                  <Button type="primary" onClick={() => addItem("example", newExample, setExamples, setNewExample)}>
                    Thêm
                  </Button>
                </Space.Compact>
              </div>
              <div>
                {examples.map((example) => (
                  <Button
                    key={example}
                    size="small"
                    style={{ marginBottom: 4, marginRight: 4 }}
                    onClick={() => removeItem("example", example, setExamples)}
                  >
                    {example} <MinusCircleOutlined />
                  </Button>
                ))}
              </div>
            </Form.Item>
          </Col>
        </Row>

        <div style={{ textAlign: "right", marginTop: 24 }}>
          <Space>
            <Button onClick={handleCancel}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Thêm loại xe
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

export default VehicleTypeAddModal;
