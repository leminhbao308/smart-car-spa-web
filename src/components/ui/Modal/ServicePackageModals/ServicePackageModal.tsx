"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Select,
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
  List,
  Popconfirm} from "antd";
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
  ToolOutlined,
  PackageOutlined} from "@ant-design/icons";
import { servicePackageService } from "@/lib/api/services/service-package.service";
import { categoryService } from "@/lib/api/services/category.service";
import { serviceService } from "@/lib/api/services/service.service";
import { productService } from "@/lib/api/services/product.service";
import { 
  ServicePackage, 
  SERVICE_PACKAGE_TYPE_OPTIONS,
  ServicePackageProduct,
  ServicePackageService 
} from "@/lib/api/types/service-package.types";
import { Category } from "@/lib/api/types/category.types";
import { Service } from "@/lib/api/types/service.types";
import { Product } from "@/lib/api/types/product.types";
import formatCurrency from "@/components/utils/helper/currency.format.helper";
import { MemoizedInput, MemoizedTextArea, MemoizedInputNumber } from "@/components/ui/MemoizedComponents";

const { Option } = Select;
const { Text } = Typography;

interface ServicePackageModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (data: any) => void;
  initialData?: ServicePackage | null;
  title?: string;
}

const ServicePackageModal: React.FC<ServicePackageModalProps> = ({
  open,
  onCancel,
  onOk,
  initialData,
  title = "Thêm gói dịch vụ mới"}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [packageProducts, setPackageProducts] = useState<ServicePackageProduct[]>([]);
  const [packageServices, setPackageServices] = useState<ServicePackageService[]>([]);
  const [packageTotalPrice, setPackageTotalPrice] = useState(0);

  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);

  // Search and filter states
  const [serviceSearchText, setServiceSearchText] = useState("");
  const [productSearchText, setProductSearchText] = useState("");

  // Load data functions
  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await categoryService.getAllCategories(0, 1000);
      if (response.success && response.data) {
        setCategories(response.data.content || []);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      message.error("Không thể tải danh sách danh mục");
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      setServicesLoading(true);
      const response = await serviceService.getAllServices(0, 1000);
      if (response.success && response.data) {
        setServices(response.data.content || []);
      }
    } catch (error) {
      console.error("Error loading services:", error);
      message.error("Không thể tải danh sách dịch vụ");
    } finally {
      setServicesLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await productService.getAllProducts({
        page: 1,
        size: 1000,
        sort: "productName",
        direction: "ASC"});
      if (response.success && response.data) {
        setProducts(response.data.content || []);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      message.error("Không thể tải danh sách sản phẩm");
    } finally {
      setProductsLoading(false);
    }
  };

  // Calculate total price when services and products change
  useEffect(() => {
    const serviceTotal = packageServices.reduce(
      (sum, service) => sum + service.totalPrice,
      0
    );
    const productTotal = packageProducts.reduce(
      (sum, product) => sum + product.totalPrice,
      0
    );
    setPackageTotalPrice(serviceTotal + productTotal);
  }, [packageServices, packageProducts]);

  // Initialize form when modal opens
  useEffect(() => {
    if (open) {
      loadCategories();
      loadServices();
      loadProducts();

      if (initialData) {
        form.setFieldsValue({
          packageName: initialData.packageName,
          packageUrl: initialData.packageUrl,
          categoryId: initialData.categoryId,
          description: initialData.description,
          packageType: initialData.packageType,
          imageUrls: initialData.imageUrls});
        setPackageServices(initialData.packageServices || []);
        setPackageProducts(initialData.packageProducts || []);
      } else {
        form.resetFields();
        setPackageServices([]);
        setPackageProducts([]);
        setPackageTotalPrice(0);
      }
    }
  }, [open, initialData, form]);

  // Service handlers
  const handleAddService = (serviceId: string) => {
    const service = services.find((s) => s.serviceId === serviceId);
    if (service) {
      const existingService = packageServices.find((s) => s.serviceId === serviceId);
      if (existingService) {
        message.warning("Dịch vụ này đã được thêm vào gói!");
        return;
      }
      
      const newService: ServicePackageService = {
        serviceId: service.serviceId,
        serviceName: service.serviceName,
        serviceUrl: service.serviceUrl,
        serviceDescription: service.description,
        serviceStandardDuration: service.standardDuration,
        serviceBasePrice: service.basePrice,
        quantity: 1,
        unitPrice: service.basePrice,
        totalPrice: service.basePrice,
        notes: "",
        isRequired: true,
        isActive: true};
      
      setPackageServices((prev) => [...prev, newService]);
    }
  };

  const handleRemoveService = (serviceId: string) => {
    setPackageServices((prev) => prev.filter((s) => s.serviceId !== serviceId));
  };

  const handleUpdateServiceQuantity = (serviceId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveService(serviceId);
      return;
    }
    setPackageServices((prev) =>
      prev.map((s) => 
        s.serviceId === serviceId 
          ? { ...s, quantity, totalPrice: s.unitPrice * quantity }
          : s
      )
    );
  };

  const handleUpdateServicePrice = (serviceId: string, unitPrice: number) => {
    setPackageServices((prev) =>
      prev.map((s) => 
        s.serviceId === serviceId 
          ? { ...s, unitPrice, totalPrice: s.quantity * unitPrice }
          : s
      )
    );
  };

  // Product handlers
  const handleAddProduct = (productId: string) => {
    const product = products.find((p) => p.productId === productId);
    if (product) {
      const existingProduct = packageProducts.find((p) => p.productId === productId);
      if (existingProduct) {
        message.warning("Sản phẩm này đã được thêm vào gói!");
        return;
      }
      
      const newProduct: ServicePackageProduct = {
        productId: product.productId,
        productName: product.productName,
        productCode: product.productSku,
        quantity: 1,
        unitPrice: product.sellingPrice || 0,
        totalPrice: product.sellingPrice || 0,
        notes: "",
        isRequired: true,
        isActive: true};
      
      setPackageProducts((prev) => [...prev, newProduct]);
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setPackageProducts((prev) => prev.filter((p) => p.productId !== productId));
  };

  const handleUpdateProductQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveProduct(productId);
      return;
    }
    setPackageProducts((prev) =>
      prev.map((p) => 
        p.productId === productId 
          ? { ...p, quantity, totalPrice: p.unitPrice * quantity }
          : p
      )
    );
  };

  const handleUpdateProductPrice = (productId: string, unitPrice: number) => {
    setPackageProducts((prev) =>
      prev.map((p) => 
        p.productId === productId 
          ? { ...p, unitPrice, totalPrice: p.quantity * unitPrice }
          : p
      )
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
        updatedAt: new Date().toISOString().split("T")[0]};

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
      console.log("Validation failed:", error);
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
          padding: "16px 24px"}}}
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
            targetCustomers: []}}
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
                      message: "Vui lòng nhập mã gói dịch vụ!"},
                  ]}
                >
                  <MemoizedInput placeholder="Nhập mã gói dịch vụ" />
                </Form.Item>

                <Form.Item
                  name="packageName"
                  label="Tên gói dịch vụ"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập tên gói dịch vụ!"},
                  ]}
                >
                  <MemoizedInput placeholder="Nhập tên gói dịch vụ" />
                </Form.Item>

                <Form.Item name="description" label="Mô tả">
                  <MemoizedTextArea rows={3} placeholder="Nhập mô tả gói dịch vụ" />
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
                    textAlign: "center"}}
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
                      marginBottom: 8}}
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
                    <MemoizedInput
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
                          padding: 8}}
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
                                    marginBottom: 8}}
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
                          padding: 8}}
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
                                  backgroundColor: "#f6ffed"}}
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
                                            color: "#52c41a"}}
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
                                        <MemoizedInputNumber
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
                          message: "Vui lòng chọn thời gian hiệu lực!"},
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
                          message: "Vui lòng chọn số lần sử dụng!"},
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

