import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Space,
  Card,
  Row,
  Col,
  message,
  Divider,
  Typography,
  Tag,
  List,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  CalculatorOutlined,
} from "@ant-design/icons";
import {
  packageStatuses,
  targetCustomerGroups,
  validityPeriods,
  maxUsageOptions,
} from "@/components/utils/data/service-packages.data";
import { servicesData } from "@/components/utils/data/services.data";
import formatCurrency from "@/components/utils/helper/currency.format.helper";

const { Option } = Select;
const { TextArea } = Input;
const { Text, Title } = Typography;

interface ServicePackage {
  id: number;
  packageCode: string;
  packageName: string;
  description: string;
  services: Array<{
    id: number;
    serviceName: string;
    totalPrice: number;
    quantity: number;
  }>;
  totalPrice: number; // Chỉ có totalPrice = tổng giá các dịch vụ
  status: string;
  targetCustomers: string[];
  validityPeriod: number;
  maxUsage: number;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

interface ServicePackageEditModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (data: ServicePackage) => void;
  editData: ServicePackage | null;
}

const ServicePackageEditModal: React.FC<ServicePackageEditModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  editData,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState<Array<{
    id: number;
    serviceName: string;
    totalPrice: number;
    quantity: number;
  }>>([]);
  const [packageTotalPrice, setPackageTotalPrice] = useState(0);

  // Calculate total price when services change
  useEffect(() => {
    const total = selectedServices.reduce((sum, service) => sum + (service.totalPrice * service.quantity), 0);
    setPackageTotalPrice(total);
  }, [selectedServices]);

  // Initialize form when modal opens
  useEffect(() => {
    if (visible) {
      if (editData) {
        form.setFieldsValue({
          packageCode: editData.packageCode,
          packageName: editData.packageName,
          description: editData.description,
          status: editData.status,
          targetCustomers: editData.targetCustomers,
          validityPeriod: editData.validityPeriod,
          maxUsage: editData.maxUsage,
          features: editData.features,
        });
        setSelectedServices(editData.services);
      } else {
        form.resetFields();
        setSelectedServices([]);
        setPackageTotalPrice(0);
      }
    }
  }, [visible, editData, form]);

  const handleAddService = (serviceId: number) => {
    const service = servicesData.find((s) => s.id === serviceId);
    if (service) {
      const existingService = selectedServices.find((s) => s.id === serviceId);
      if (existingService) {
        message.warning("Dịch vụ này đã được thêm vào gói!");
        return;
      }
      
      setSelectedServices([
        ...selectedServices,
        {
          id: service.id,
          serviceName: service.serviceName,
          totalPrice: service.totalPrice,
          quantity: 1,
        },
      ]);
    }
  };

  const handleRemoveService = (serviceId: number) => {
    setSelectedServices(selectedServices.filter((s) => s.id !== serviceId));
  };

  const handleQuantityChange = (serviceId: number, quantity: number) => {
    setSelectedServices(
      selectedServices.map((s) =>
        s.id === serviceId ? { ...s, quantity } : s
      )
    );
  };


  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (selectedServices.length === 0) {
        message.error("Vui lòng thêm ít nhất một dịch vụ vào gói!");
        return;
      }

      setLoading(true);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const packageData: ServicePackage = {
        id: editData?.id || 0,
        packageCode: values.packageCode,
        packageName: values.packageName,
        description: values.description,
        services: selectedServices,
        totalPrice: packageTotalPrice,
        status: values.status,
        targetCustomers: values.targetCustomers,
        validityPeriod: values.validityPeriod,
        maxUsage: values.maxUsage,
        features: values.features || [],
        createdAt: editData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onSuccess(packageData);
      message.success(editData ? "Cập nhật gói dịch vụ thành công!" : "Thêm gói dịch vụ thành công!");
      
    } catch (error) {
      console.log("Form validation failed:", error);
      message.error("Vui lòng kiểm tra lại thông tin đã nhập!");
    } finally {
      setLoading(false);
    }
  };

  const availableServices = servicesData.filter(
    (service) => !selectedServices.some((s) => s.id === service.id)
  );

  return (
    <Modal
      title={
        <Space>
          <ShoppingCartOutlined />
          {editData ? "Chỉnh sửa gói dịch vụ" : "Thêm gói dịch vụ mới"}
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1200}
      style={{ top: 20 }}
    >
      <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: "active",
            validityPeriod: 30,
            maxUsage: 1,
            features: [],
          }}
        >
          <Row gutter={[16, 16]}>
            {/* Thông tin cơ bản */}
            <Col span={12}>
              <Card title="Thông tin cơ bản" size="small">
                <Form.Item
                  name="packageCode"
                  label="Mã gói dịch vụ"
                  rules={[{ required: true, message: "Vui lòng nhập mã gói dịch vụ!" }]}
                >
                  <Input placeholder="VD: PKG001" />
                </Form.Item>

                <Form.Item
                  name="packageName"
                  label="Tên gói dịch vụ"
                  rules={[{ required: true, message: "Vui lòng nhập tên gói dịch vụ!" }]}
                >
                  <Input placeholder="VD: Gói chăm sóc xe cơ bản" />
                </Form.Item>

                <Form.Item
                  name="description"
                  label="Mô tả"
                  rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
                >
                  <TextArea rows={3} placeholder="Mô tả chi tiết về gói dịch vụ..." />
                </Form.Item>

                <Form.Item
                  name="status"
                  label="Trạng thái"
                  rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
                >
                  <Select placeholder="Chọn trạng thái">
                    {packageStatuses.map((status) => (
                      <Option key={status.value} value={status.value}>
                        {status.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Card>
            </Col>

            {/* Thông tin giá cả */}
            <Col span={12}>
              <Card title="Thông tin giá cả" size="small">
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <Text type="secondary" style={{ fontSize: 14 }}>Tổng giá gói dịch vụ:</Text>
                  <div style={{ fontSize: 24, fontWeight: 600, color: "#52c41a", marginTop: 8 }}>
                    {formatCurrency(packageTotalPrice)}
                  </div>
                  <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: "block" }}>
                    Tổng giá của {selectedServices.length} dịch vụ
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Quản lý dịch vụ */}
          <Card title="Quản lý dịch vụ" style={{ marginTop: 16 }} size="small">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div>
                  <Text strong>Thêm dịch vụ:</Text>
                  <Select
                    placeholder="Chọn dịch vụ để thêm"
                    style={{ width: "100%", marginTop: 8 }}
                    onSelect={handleAddService}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {availableServices.map((service) => (
                      <Option key={service.id} value={service.id}>
                        {service.serviceName} - {formatCurrency(service.totalPrice)}
                      </Option>
                    ))}
                  </Select>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Text strong>Dịch vụ đã chọn ({selectedServices.length}):</Text>
                </div>
              </Col>
            </Row>

            {selectedServices.length > 0 && (
              <List
                dataSource={selectedServices}
                renderItem={(service) => (
                  <List.Item
                    actions={[
                      <InputNumber
                        min={1}
                        max={10}
                        value={service.quantity}
                        onChange={(value) => handleQuantityChange(service.id, value || 1)}
                        style={{ width: 80 }}
                      />,
                      <Popconfirm
                        title="Xóa dịch vụ này?"
                        onConfirm={() => handleRemoveService(service.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                      >
                        <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                      </Popconfirm>,
                    ]}
                  >
                    <List.Item.Meta
                      title={service.serviceName}
                      description={
                        <Space>
                          <Text>Giá: {formatCurrency(service.totalPrice)}</Text>
                          <Text type="secondary">
                            Tổng: {formatCurrency(service.totalPrice * service.quantity)}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>

          {/* Thông tin sử dụng */}
          <Card title="Thông tin sử dụng" style={{ marginTop: 16 }} size="small">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Form.Item
                  name="validityPeriod"
                  label="Thời gian hiệu lực"
                  rules={[{ required: true, message: "Vui lòng chọn thời gian hiệu lực!" }]}
                >
                  <Select placeholder="Chọn thời gian">
                    {validityPeriods.map((period) => (
                      <Option key={period.value} value={period.value}>
                        {period.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="maxUsage"
                  label="Số lần sử dụng tối đa"
                  rules={[{ required: true, message: "Vui lòng chọn số lần sử dụng!" }]}
                >
                  <Select placeholder="Chọn số lần">
                    {maxUsageOptions.map((option) => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="targetCustomers"
                  label="Khách hàng mục tiêu"
                  rules={[{ required: true, message: "Vui lòng chọn khách hàng mục tiêu!" }]}
                >
                  <Select
                    mode="multiple"
                    placeholder="Chọn khách hàng mục tiêu"
                    style={{ width: "100%" }}
                  >
                    {targetCustomerGroups.map((group) => (
                      <Option key={group.value} value={group.value}>
                        {group.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Tính năng nổi bật */}
          <Card title="Tính năng nổi bật" style={{ marginTop: 16 }} size="small">
            <Form.Item
              name="features"
              label="Danh sách tính năng"
            >
              <Select
                mode="tags"
                placeholder="Nhập tính năng và nhấn Enter"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Card>

          {/* Actions */}
          <div style={{ textAlign: "right", marginTop: 24 }}>
            <Space>
              <Button onClick={onCancel}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editData ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Space>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default ServicePackageEditModal;
