"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Select,
  DatePicker,
  TimePicker,
  Input,
  InputNumber,
  Card,
  Row,
  Col,
  Space,
  Button,
  message,
  Divider,
  Typography,
  Tag,
} from "antd";
import { CalendarOutlined, ToolOutlined, CarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

interface VehicleInfo {
  id: number;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  customerName: string;
  customerPhone: string;
  lastServiceDate?: string;
  nextServiceDate?: string;
}

interface ServiceType {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
  description: string;
  category: string;
}

interface Technician {
  id: string;
  name: string;
  specialization: string[];
  rating: number;
  available: boolean;
}

interface ScheduleServiceModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (data: unknown) => void;
  vehicleData?: VehicleInfo | null;
}

const ScheduleServiceModal: React.FC<ScheduleServiceModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  vehicleData,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(
    null
  );
  const [availableTechnicians, setAvailableTechnicians] = useState<
    Technician[]
  >([]);
  const [, setSelectedDate] = useState<dayjs.Dayjs | null>(null);

  // Mock data for services
  const serviceTypes: ServiceType[] = [
    {
      id: "basic_maintenance",
      name: "Bảo dưỡng định kỳ",
      duration: 120,
      price: 2500000,
      description: "Thay dầu, lọc gió, kiểm tra tổng thể",
      category: "Bảo dưỡng",
    },
    {
      id: "oil_change",
      name: "Thay dầu động cơ",
      duration: 60,
      price: 800000,
      description: "Thay dầu động cơ và lọc dầu",
      category: "Bảo dưỡng",
    },
    {
      id: "brake_service",
      name: "Bảo dưỡng phanh",
      duration: 90,
      price: 1500000,
      description: "Kiểm tra và bảo dưỡng hệ thống phanh",
      category: "Sửa chữa",
    },
    {
      id: "tire_service",
      name: "Thay lốp",
      duration: 45,
      price: 1200000,
      description: "Thay lốp và cân bằng",
      category: "Sửa chữa",
    },
    {
      id: "engine_check",
      name: "Kiểm tra động cơ",
      duration: 180,
      price: 2000000,
      description: "Kiểm tra toàn diện động cơ",
      category: "Chẩn đoán",
    },
    {
      id: "premium_wash",
      name: "Rửa xe cao cấp",
      duration: 90,
      price: 500000,
      description: "Rửa xe và đánh bóng",
      category: "Làm sạch",
    },
  ];

  // Mock data for technicians
  const technicians: Technician[] = React.useMemo(() => [
    {
      id: "tech_001",
      name: "Nguyễn Văn An",
      specialization: ["Bảo dưỡng", "Sửa chữa"],
      rating: 4.8,
      available: true,
    },
    {
      id: "tech_002",
      name: "Trần Thị Bình",
      specialization: ["Chẩn đoán", "Bảo dưỡng"],
      rating: 4.9,
      available: true,
    },
    {
      id: "tech_003",
      name: "Lê Văn Cường",
      specialization: ["Sửa chữa", "Làm sạch"],
      rating: 4.7,
      available: false,
    },
  ], []);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setSelectedService(null);
      setSelectedDate(null);

      // Set default values
      if (vehicleData) {
        form.setFieldsValue({
          vehicleId: vehicleData.id,
          customerName: vehicleData.customerName,
          customerPhone: vehicleData.customerPhone,
        });
      }
    }
  }, [visible, vehicleData, form]);

  // Filter available technicians based on selected service
  useEffect(() => {
    if (selectedService) {
      const available = technicians.filter(
        (tech) =>
          tech.available &&
          tech.specialization.some(
            (spec) =>
              selectedService.category === spec ||
              (selectedService.category === "Bảo dưỡng" && spec === "Bảo dưỡng")
          )
      );
      setAvailableTechnicians(available);
    } else {
      setAvailableTechnicians([]);
    }
  }, [selectedService, technicians]);

  const handleServiceChange = (serviceId: string) => {
    const service = serviceTypes.find((s) => s.id === serviceId);
    setSelectedService(service || null);

    if (service) {
      form.setFieldsValue({
        serviceName: service.name,
        estimatedDuration: service.duration,
        estimatedPrice: service.price,
      });
    }
  };

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    setSelectedDate(date);

    // Check if date is in the past
    if (date && date.isBefore(dayjs(), "day")) {
      message.warning("Không thể đặt lịch trong quá khứ!");
      form.setFieldsValue({ appointmentDate: null });
      setSelectedDate(null);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Check if service is selected
      if (!selectedService) {
        message.error("Vui lòng chọn loại dịch vụ!");
        return;
      }

      // Check if technician is available
      if (availableTechnicians.length === 0) {
        message.error("Không có kỹ thuật viên khả dụng cho dịch vụ này!");
        return;
      }

      const values = await form.validateFields();

      const appointmentData = {
        ...values,
        appointmentDate: values.appointmentDate?.format("YYYY-MM-DD"),
        appointmentTime: values.appointmentTime?.format("HH:mm"),
        vehicleInfo: vehicleData,
        serviceInfo: selectedService,
        status: "scheduled",
        createdAt: new Date().toISOString(),
      };

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onSuccess(appointmentData);
      message.success("Đặt lịch bảo dưỡng thành công!");
      form.resetFields();
    } catch (error) {
      console.error("Form validation failed:", error);
      
      // Handle Ant Design form validation errors
      if (error && typeof error === 'object' && 'errorFields' in error) {
        const errorFields = (error as { errorFields: Array<{ errors: string[] }> }).errorFields;
        if (errorFields && errorFields.length > 0) {
          const firstError = errorFields[0];
          if (firstError.errors && firstError.errors.length > 0) {
            message.error(firstError.errors[0]);
            return;
          }
        }
      }
      
      // Handle other errors
      if (error instanceof Error) {
        message.error(`Lỗi: ${error.message}`);
      } else {
        message.error("Vui lòng kiểm tra lại thông tin đã nhập!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedService(null);
    setSelectedDate(null);
    onCancel();
  };

  return (
    <Modal
      title={
        <Space>
          <CalendarOutlined />
          Đặt lịch bảo dưỡng
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      width={800}
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
          Đặt lịch
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
        {vehicleData && (
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
              <Col xs={24} sm={12}>
                <div>
                  <Text type="secondary">Biển số:</Text>
                  <br />
                  <Text strong style={{ fontSize: 16 }}>
                    {vehicleData.licensePlate}
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div>
                  <Text type="secondary">Xe:</Text>
                  <br />
                  <Text strong>
                    {vehicleData.brand} {vehicleData.model} ({vehicleData.year})
                  </Text>
                </div>
              </Col>
            </Row>
            <Divider style={{ margin: "12px 0" }} />
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <div>
                  <Text type="secondary">Chủ xe:</Text>
                  <br />
                  <Text>{vehicleData.customerName}</Text>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div>
                  <Text type="secondary">SĐT:</Text>
                  <br />
                  <Text>{vehicleData.customerPhone}</Text>
                </div>
              </Col>
            </Row>
          </Card>
        )}

        {/* Service Selection */}
        <Card
          title={
            <Space>
              <ToolOutlined />
              Chọn dịch vụ
            </Space>
          }
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Loại dịch vụ"
                name="serviceType"
                rules={[
                  { required: true, message: "Vui lòng chọn loại dịch vụ!" },
                ]}
              >
                <Select
                  placeholder="Chọn dịch vụ"
                  onChange={handleServiceChange}
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.children)
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {serviceTypes.map((service) => (
                    <Option key={service.id} value={service.id}>
                      <div>
                        <div style={{ fontWeight: 500 }}>{service.name}</div>
                        <div style={{ fontSize: 12, color: "#666" }}>
                          {service.duration} phút •{" "}
                          {service.price.toLocaleString()} VNĐ
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Tên dịch vụ" name="serviceName">
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>

          {selectedService && (
            <div
              style={{
                padding: 12,
                backgroundColor: "#f6ffed",
                border: "1px solid #b7eb8f",
                borderRadius: 6,
                marginBottom: 16,
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <Text strong>{selectedService.name}</Text>
                <Tag color="green" style={{ marginLeft: 8 }}>
                  {selectedService.category}
                </Tag>
              </div>
              <Text type="secondary">{selectedService.description}</Text>
            </div>
          )}

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Thời gian dự kiến (phút)"
                name="estimatedDuration"
              >
                <InputNumber style={{ width: "100%" }} disabled suffix="phút" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Giá dự kiến" name="estimatedPrice">
                <InputNumber
                  style={{ width: "100%" }}
                  disabled
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                  suffix="VNĐ"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Appointment Details */}
        <Card
          title={
            <Space>
              <CalendarOutlined />
              Chi tiết lịch hẹn
            </Space>
          }
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Ngày hẹn"
                name="appointmentDate"
                rules={[{ required: true, message: "Vui lòng chọn ngày hẹn!" }]}
              >
                <DatePicker
                  placeholder="Chọn ngày"
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  onChange={handleDateChange}
                  disabledDate={(current) =>
                    current && current < dayjs().startOf("day")
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Giờ hẹn"
                name="appointmentTime"
                rules={[{ required: true, message: "Vui lòng chọn giờ hẹn!" }]}
              >
                <TimePicker
                  placeholder="Chọn giờ"
                  style={{ width: "100%" }}
                  format="HH:mm"
                  minuteStep={15}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Kỹ thuật viên"
                name="technicianId"
                rules={[
                  { required: true, message: "Vui lòng chọn kỹ thuật viên!" },
                ]}
              >
                <Select
                  placeholder="Chọn kỹ thuật viên"
                  disabled={!selectedService}
                >
                  {availableTechnicians.map((tech) => (
                    <Option key={tech.id} value={tech.id}>
                      <div>
                        <div style={{ fontWeight: 500 }}>{tech.name}</div>
                        <div style={{ fontSize: 12, color: "#666" }}>
                          ⭐ {tech.rating} • {tech.specialization.join(", ")}
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Chi nhánh"
                name="branch"
                rules={[
                  { required: true, message: "Vui lòng chọn chi nhánh!" },
                ]}
              >
                <Select placeholder="Chọn chi nhánh">
                  <Option value="branch_1">Chi nhánh 1 - Quận 1</Option>
                  <Option value="branch_2">Chi nhánh 2 - Quận 3</Option>
                  <Option value="branch_3">Chi nhánh 3 - Quận 7</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Additional Information */}
        <Card title="Thông tin bổ sung" size="small">
          <Form.Item label="Ghi chú" name="notes">
            <TextArea
              rows={3}
              placeholder="Nhập ghi chú về yêu cầu đặc biệt hoặc vấn đề cần chú ý..."
              maxLength={300}
              showCount
            />
          </Form.Item>

          <Form.Item
            label="Phương thức thanh toán"
            name="paymentMethod"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn phương thức thanh toán!",
              },
            ]}
          >
            <Select placeholder="Chọn phương thức thanh toán">
              <Option value="cash">Tiền mặt</Option>
              <Option value="card">Thẻ</Option>
              <Option value="transfer">Chuyển khoản</Option>
            </Select>
          </Form.Item>
        </Card>
      </Form>
    </Modal>
  );
};

export default ScheduleServiceModal;
