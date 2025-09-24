"use client";
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
  Badge,
  Empty,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  MinusOutlined,
  SearchOutlined,
  FilterOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import {
  packageStatuses,
  targetCustomerGroups,
  validityPeriods,
  maxUsageOptions,
} from "@/components/utils/data/service-packages.data";
import { servicesData } from "@/components/utils/data/services.data";
import formatCurrency from "@/components/utils/helper/currency.format.helper";
import ServiceDetailTooltip from "./ServiceDetailTooltip";

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

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

interface ServicePackageModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (data: ServicePackage) => void;
  initialData?: ServicePackage | null;
  title?: string;
}

const ServicePackageModal: React.FC<ServicePackageModalProps> = ({
  open,
  onCancel,
  onOk,
  initialData,
  title = "Thêm gói dịch vụ mới",
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState<
    Array<{
      id: number;
      serviceName: string;
      totalPrice: number;
      quantity: number;
    }>
  >([]);
  const [packageTotalPrice, setPackageTotalPrice] = useState(0);

  // Search and filter states
  const [searchText, setSearchText] = useState("");
  const [selectedServiceType, setSelectedServiceType] = useState<
    string | undefined
  >(undefined);
  const [priceRange, setPriceRange] = useState<[number, number] | undefined>(
    undefined
  );

  // Calculate total price when services change
  useEffect(() => {
    const total = selectedServices.reduce(
      (sum, service) => sum + service.totalPrice * service.quantity,
      0
    );
    setPackageTotalPrice(total);
  }, [selectedServices]);

  // Initialize form when modal opens
  useEffect(() => {
    if (open) {
      if (initialData) {
        form.setFieldsValue({
          packageCode: initialData.packageCode,
          packageName: initialData.packageName,
          description: initialData.description,
          status: initialData.status,
          validityPeriod: initialData.validityPeriod,
          maxUsage: initialData.maxUsage,
          features: initialData.features || [],
          targetCustomers: initialData.targetCustomers || [],
        });
        setSelectedServices(initialData.services);
      } else {
        form.resetFields();
        setSelectedServices([]);
        setPackageTotalPrice(0);
      }
    }
  }, [open, initialData, form]);

  const handleAddService = (serviceId: number) => {
    const service = servicesData.find((s) => s.id === serviceId);
    if (service) {
      const existingService = selectedServices.find((s) => s.id === serviceId);
      if (existingService) {
        setSelectedServices((prev) =>
          prev.map((s) =>
            s.id === serviceId ? { ...s, quantity: s.quantity + 1 } : s
          )
        );
      } else {
        setSelectedServices((prev) => [
          ...prev,
          {
            id: service.id,
            serviceName: service.serviceName,
            totalPrice: service.totalPrice,
            quantity: 1,
          },
        ]);
      }
    }
  };

  const handleRemoveService = (serviceId: number) => {
    setSelectedServices((prev) => prev.filter((s) => s.id !== serviceId));
  };

  const handleUpdateQuantity = (serviceId: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveService(serviceId);
      return;
    }
    setSelectedServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, quantity } : s))
    );
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      if (selectedServices.length === 0) {
        message.error("Vui lòng chọn ít nhất một dịch vụ!");
        return;
      }

      const packageData: ServicePackage = {
        id: initialData?.id || Date.now(),
        packageCode: values.packageCode,
        packageName: values.packageName,
        description: values.description,
        services: selectedServices,
        totalPrice: packageTotalPrice,
        status: values.status,
        targetCustomers: values.targetCustomers || [],
        validityPeriod: values.validityPeriod || 30,
        maxUsage: values.maxUsage || 1,
        features: values.features || [],
        createdAt:
          initialData?.createdAt || new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      };

      onOk(packageData);
      message.success(
        initialData
          ? "Cập nhật gói dịch vụ thành công!"
          : "Thêm gói dịch vụ thành công!"
      );

      // Reset form
      form.resetFields();
      setSelectedServices([]);
      setPackageTotalPrice(0);
    } catch (error) {
      console.error("Validation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedServices([]);
    setPackageTotalPrice(0);
    onCancel();
  };

  // Filter available services
  const filteredServices = servicesData.filter((service) => {
    const matchesSearch =
      service.serviceName.toLowerCase().includes(searchText.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchText.toLowerCase());
    const matchesType =
      !selectedServiceType || service.serviceTypeName === selectedServiceType;
    const matchesPrice =
      !priceRange ||
      (service.totalPrice >= priceRange[0] &&
        service.totalPrice <= priceRange[1]);
    const isActive = service.status === "active";
    const notSelected = !selectedServices.some((s) => s.id === service.id);

    return (
      matchesSearch && matchesType && matchesPrice && isActive && notSelected
    );
  });

  // Get unique service types for filter
  const serviceTypes = [...new Set(servicesData.map((s) => s.serviceTypeName))];

  return (
    <Modal
      title={
        <Space>
          <ShoppingCartOutlined />
          {title}
        </Space>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={1200}
      style={{ top: 20 }}
      styles={{
        body: {
          maxHeight: "85vh",
          overflowY: "auto",
          overflowX: "hidden",
          padding: "16px 24px",
        },
      }}
    >
      <div>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: "active",
            validityPeriod: 30,
            maxUsage: 1,
            features: [],
            targetCustomers: [],
          }}
        >
          <Row gutter={[16, 16]}>
            {/* Thông tin cơ bản */}
            <Col span={12}>
              <Card title="Thông tin cơ bản" size="small">
                <Form.Item
                  name="packageCode"
                  label="Mã gói dịch vụ"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập mã gói dịch vụ!",
                    },
                  ]}
                >
                  <Input placeholder="Nhập mã gói dịch vụ" />
                </Form.Item>

                <Form.Item
                  name="packageName"
                  label="Tên gói dịch vụ"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập tên gói dịch vụ!",
                    },
                  ]}
                >
                  <Input placeholder="Nhập tên gói dịch vụ" />
                </Form.Item>

                <Form.Item name="description" label="Mô tả">
                  <TextArea rows={3} placeholder="Nhập mô tả gói dịch vụ" />
                </Form.Item>

                <Form.Item
                  name="status"
                  label="Trạng thái"
                  rules={[
                    { required: true, message: "Vui lòng chọn trạng thái!" },
                  ]}
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

            {/* Thông tin giá và khuyến mãi */}
            <Col span={12}>
              <Card
                title={
                  <Space>
                    <DollarOutlined />
                    Thông tin giá và khuyến mãi
                  </Space>
                }
                size="small"
              >
                {/* Hiển thị giá trực quan */}
                <div
                  style={{
                    padding: 20,
                    backgroundColor: "#f6ffed",
                    borderRadius: 12,
                    marginBottom: 16,
                    border: "2px solid #b7eb8f",
                    textAlign: "center",
                  }}
                >
                  <div style={{ marginBottom: 12 }}>
                    <Text strong style={{ fontSize: 16, color: "#52c41a" }}>
                      Tổng giá gói dịch vụ
                    </Text>
                  </div>
                  <div
                    style={{
                      fontSize: 28,
                      color: "#52c41a",
                      fontWeight: "bold",
                      marginBottom: 8,
                    }}
                  >
                    {formatCurrency(packageTotalPrice)}
                  </div>
                  <Row gutter={16} justify="center">
                    <Col>
                      <Space>
                        <ShoppingCartOutlined style={{ color: "#1890ff" }} />
                        <Text type="secondary" style={{ fontSize: 14 }}>
                          {selectedServices.length} dịch vụ
                        </Text>
                      </Space>
                    </Col>
                  </Row>
                </div>

                <Form.Item
                  name="targetCustomers"
                  label="Nhóm khách hàng mục tiêu"
                >
                  <Select
                    mode="multiple"
                    placeholder="Chọn nhóm khách hàng"
                    allowClear
                  >
                    {targetCustomerGroups.map((group) => (
                      <Option key={group.value} value={group.value}>
                        {group.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Card>
            </Col>

            {/* Chọn dịch vụ - Giao diện mới */}
            <Col span={24}>
              <Card
                title={
                  <Space>
                    <ShoppingCartOutlined />
                    Chọn dịch vụ cho gói
                    <Badge
                      count={selectedServices.length}
                      showZero
                      color="#52c41a"
                    />
                  </Space>
                }
                size="small"
              >
                {/* Bộ lọc và tìm kiếm */}
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                  <Col span={8}>
                    <Input
                      placeholder="Tìm kiếm dịch vụ..."
                      prefix={<SearchOutlined />}
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      allowClear
                    />
                  </Col>
                  <Col span={6}>
                    <Select
                      placeholder="Loại dịch vụ"
                      value={selectedServiceType}
                      onChange={setSelectedServiceType}
                      allowClear
                      style={{ width: "100%" }}
                    >
                      {serviceTypes.map((type) => (
                        <Option key={type} value={type}>
                          {type}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={6}>
                    <Select
                      placeholder="Khoảng giá"
                      value={priceRange}
                      onChange={setPriceRange}
                      allowClear
                      style={{ width: "100%" }}
                    >
                      <Option value={[0, 100000]}>Dưới 100k</Option>
                      <Option value={[100000, 500000]}>100k - 500k</Option>
                      <Option value={[500000, 1000000]}>500k - 1M</Option>
                      <Option value={[1000000, 999999999]}>Trên 1M</Option>
                    </Select>
                  </Col>
                  <Col span={4}>
                    <Button
                      icon={<FilterOutlined />}
                      onClick={() => {
                        setSearchText("");
                        setSelectedServiceType(undefined);
                        setPriceRange(undefined);
                      }}
                    >
                      Reset
                    </Button>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  {/* Danh sách dịch vụ có sẵn */}
                  <Col span={14}>
                    <div style={{ marginBottom: 16 }}>
                      <Space style={{ marginBottom: 12 }}>
                        <Text strong>Dịch vụ có sẵn</Text>
                        <Tag color="blue">
                          {filteredServices.length} dịch vụ
                        </Tag>
                      </Space>

                      <div
                        style={{
                          maxHeight: 350,
                          overflowY: "auto",
                          overflowX: "hidden",
                          border: "1px solid #f0f0f0",
                          borderRadius: 8,
                          padding: 8,
                        }}
                      >
                        {filteredServices.length > 0 ? (
                          <Row gutter={[8, 8]}>
                            {filteredServices.map((service) => (
                              <Col span={24} key={service.id}>
                                <Card
                                  size="small"
                                  hoverable
                                  style={{
                                    border: "1px solid #e8e8e8",
                                    borderRadius: 6,
                                    marginBottom: 8,
                                  }}
                                  bodyStyle={{ padding: 12 }}
                                >
                                  <Row gutter={8} align="middle">
                                    <Col span={16}>
                                      <div>
                                        <Space>
                                          <Text strong style={{ fontSize: 14 }}>
                                            {service.serviceName}
                                          </Text>
                                          <Tag color="green">
                                            {service.serviceTypeName}
                                          </Tag>
                                        </Space>
                                        <br />
                                        <Space style={{ marginTop: 4 }}>
                                          <Text
                                            type="secondary"
                                            style={{ fontSize: 12 }}
                                          >
                                            <DollarOutlined />{" "}
                                            {formatCurrency(service.totalPrice)}
                                          </Text>
                                          <Text
                                            type="secondary"
                                            style={{ fontSize: 12 }}
                                          >
                                            <ClockCircleOutlined />{" "}
                                            {service.duration} phút
                                          </Text>
                                        </Space>
                                        {service.description && (
                                          <div style={{ marginTop: 4 }}>
                                            <Text
                                              type="secondary"
                                              style={{ fontSize: 11 }}
                                            >
                                              {service.description.length > 60
                                                ? `${service.description.substring(
                                                    0,
                                                    60
                                                  )}...`
                                                : service.description}
                                            </Text>
                                          </div>
                                        )}
                                      </div>
                                    </Col>
                                    <Col
                                      span={8}
                                      style={{ textAlign: "right" }}
                                    >
                                      <Button
                                        type="primary"
                                        size="small"
                                        icon={<PlusOutlined />}
                                        onClick={() =>
                                          handleAddService(service.id)
                                        }
                                        style={{ marginBottom: 4 }}
                                      >
                                        Thêm
                                      </Button>
                                      <br />
                                      <ServiceDetailTooltip service={service}>
                                        <Button
                                          type="text"
                                          size="small"
                                          icon={<InfoCircleOutlined />}
                                        />
                                      </ServiceDetailTooltip>
                                    </Col>
                                  </Row>
                                </Card>
                              </Col>
                            ))}
                          </Row>
                        ) : (
                          <Empty
                            description="Không tìm thấy dịch vụ nào"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                          />
                        )}
                      </div>
                    </div>
                  </Col>

                  {/* Dịch vụ đã chọn */}
                  <Col span={10}>
                    <div style={{ marginBottom: 16 }}>
                      <Space style={{ marginBottom: 12 }}>
                        <Text strong>Dịch vụ đã chọn</Text>
                        <Tag color="green">
                          {selectedServices.length} dịch vụ
                        </Tag>
                      </Space>

                      <div
                        style={{
                          maxHeight: 350,
                          overflowY: "auto",
                          overflowX: "hidden",
                          border: "1px solid #f0f0f0",
                          borderRadius: 8,
                          padding: 8,
                        }}
                      >
                        {selectedServices.length > 0 ? (
                          <div>
                            {selectedServices.map((service) => (
                              <Card
                                key={service.id}
                                size="small"
                                style={{
                                  border: "1px solid #52c41a",
                                  borderRadius: 6,
                                  marginBottom: 8,
                                  backgroundColor: "#f6ffed",
                                }}
                                bodyStyle={{ padding: 12 }}
                              >
                                <Row gutter={8} align="middle">
                                  <Col span={16}>
                                    <div>
                                      <Space>
                                        <Text strong style={{ fontSize: 14 }}>
                                          {service.serviceName}
                                        </Text>
                                        <Badge
                                          count={service.quantity}
                                          color="#52c41a"
                                        />
                                      </Space>
                                      <br />
                                      <Space style={{ marginTop: 4 }}>
                                        <Text
                                          type="secondary"
                                          style={{ fontSize: 12 }}
                                        >
                                          <DollarOutlined />{" "}
                                          {formatCurrency(service.totalPrice)}
                                        </Text>
                                        <Text
                                          strong
                                          style={{
                                            fontSize: 12,
                                            color: "#52c41a",
                                          }}
                                        >
                                          ={" "}
                                          {formatCurrency(
                                            service.totalPrice *
                                              service.quantity
                                          )}
                                        </Text>
                                      </Space>
                                    </div>
                                  </Col>
                                  <Col span={8} style={{ textAlign: "right" }}>
                                    <Space direction="vertical" size="small">
                                      <Space>
                                        <Button
                                          type="text"
                                          size="small"
                                          icon={<MinusOutlined />}
                                          onClick={() =>
                                            handleUpdateQuantity(
                                              service.id,
                                              service.quantity - 1
                                            )
                                          }
                                          disabled={service.quantity <= 1}
                                        />
                                        <InputNumber
                                          min={1}
                                          max={10}
                                          value={service.quantity}
                                          onChange={(value) =>
                                            handleUpdateQuantity(
                                              service.id,
                                              value || 1
                                            )
                                          }
                                          size="small"
                                          style={{ width: 50 }}
                                        />
                                        <Button
                                          type="text"
                                          size="small"
                                          icon={<PlusOutlined />}
                                          onClick={() =>
                                            handleUpdateQuantity(
                                              service.id,
                                              service.quantity + 1
                                            )
                                          }
                                          disabled={service.quantity >= 10}
                                        />
                                      </Space>
                                      <Button
                                        type="text"
                                        danger
                                        size="small"
                                        icon={<DeleteOutlined />}
                                        onClick={() =>
                                          handleRemoveService(service.id)
                                        }
                                      />
                                    </Space>
                                  </Col>
                                </Row>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <Empty
                            description="Chưa có dịch vụ nào được chọn"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                          />
                        )}
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Thông tin bổ sung */}
            <Col span={24}>
              <Card title="Thông tin bổ sung" size="small">
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="validityPeriod"
                      label="Thời gian hiệu lực (ngày)"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn thời gian hiệu lực!",
                        },
                      ]}
                    >
                      <Select placeholder="Chọn thời gian hiệu lực">
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
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn số lần sử dụng!",
                        },
                      ]}
                    >
                      <Select placeholder="Chọn số lần sử dụng">
                        {maxUsageOptions.map((option) => (
                          <Option key={option.value} value={option.value}>
                            {option.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col span={8}>
                    <Form.Item name="features" label="Tính năng nổi bật">
                      <Select
                        mode="tags"
                        placeholder="Nhập tính năng nổi bật"
                        allowClear
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          <Divider />

          <div style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={handleCancel}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<ShoppingCartOutlined />}
              >
                {initialData ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Space>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default ServicePackageModal;
