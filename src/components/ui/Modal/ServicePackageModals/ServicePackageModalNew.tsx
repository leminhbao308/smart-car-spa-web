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
  Popconfirm,
  Tabs,
  Steps,
  Progress,
  Tooltip,
  Avatar,
  Statistic,
  Input} from "antd";
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
  InboxOutlined,
  CheckCircleOutlined,
  EditOutlined,
  EyeOutlined,
  StarOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  GiftOutlined,
  CalendarOutlined,
  UserOutlined,
  SettingOutlined} from "@ant-design/icons";
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

const { Option } = Select;
const { TextArea } = Input;
const { Text, Title } = Typography;
const { TabPane } = Tabs;

interface ServicePackageModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (data: any) => void;
  initialData?: ServicePackage | null;
  title?: string;
}

const ServicePackageModalNew: React.FC<ServicePackageModalProps> = ({
  open,
  onCancel,
  onOk,
  initialData,
  title = "Thêm gói dịch vụ mới"}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
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

  // Steps configuration
  const steps = [
    {
      title: "Thông tin cơ bản",
      icon: <InfoCircleOutlined />,
      description: "Nhập thông tin gói dịch vụ"},
    {
      title: "Chọn dịch vụ",
      icon: <ToolOutlined />,
      description: "Thêm dịch vụ vào gói"},
    {
      title: "Chọn sản phẩm",
      icon: <InboxOutlined />,
      description: "Thêm sản phẩm vào gói"},
    {
      title: "Xác nhận",
      icon: <CheckCircleOutlined />,
      description: "Kiểm tra và hoàn tất"},
  ];

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
        setCurrentStep(0);
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
      message.success(`Đã thêm "${service.serviceName}" vào gói!`);
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
      message.success(`Đã thêm "${product.productName}" vào gói!`);
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

      const packageData = {
        packageName: values.packageName,
        packageUrl: values.packageUrl,
        categoryId: values.categoryId,
        description: values.description,
        packageType: values.packageType,
        imageUrls: values.imageUrls,
        packageProducts: packageProducts.map(p => ({
          productId: p.productId,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
          notes: p.notes,
          isRequired: p.isRequired})),
        packageServices: packageServices.map(s => ({
          serviceId: s.serviceId,
          quantity: s.quantity,
          unitPrice: s.unitPrice,
          notes: s.notes,
          isRequired: s.isRequired}))};

      onOk(packageData);
      message.success(
        initialData
          ? "Cập nhật gói dịch vụ thành công!"
          : "Thêm gói dịch vụ thành công!"
      );

      // Reset form
      form.resetFields();
      setPackageServices([]);
      setPackageProducts([]);
      setPackageTotalPrice(0);
      setCurrentStep(0);
    } catch (error) {
      console.log("Validation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setPackageServices([]);
    setPackageProducts([]);
    setPackageTotalPrice(0);
    setCurrentStep(0);
    onCancel();
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Filter available services
  const filteredServices = services.filter((service) => {
    const matchesSearch = serviceSearchText === "" || 
      service.serviceName.toLowerCase().includes(serviceSearchText.toLowerCase()) ||
      service.description?.toLowerCase().includes(serviceSearchText.toLowerCase());
    const notSelected = !packageServices.some((s) => s.serviceId === service.serviceId);
    return matchesSearch && notSelected && service.isActive;
  });

  // Filter available products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = productSearchText === "" || 
      product.productName.toLowerCase().includes(productSearchText.toLowerCase()) ||
      product.productSku?.toLowerCase().includes(productSearchText.toLowerCase());
    const notSelected = !packageProducts.some((p) => p.productId === product.productId);
    return matchesSearch && notSelected && product.isActive;
  });

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div style={{ padding: "24px 0" }}>
            <Row gutter={[24, 24]}>
              <Col span={12}>
                <Card 
                  title={
                    <Space>
                      <InfoCircleOutlined style={{ color: "#1890ff" }} />
                      Thông tin cơ bản
                    </Space>
                  }
                  style={{ height: "100%" }}
                >
                  <Form.Item
                    name="packageName"
                    label="Tên gói dịch vụ"
                    rules={[
                      { required: true, message: "Vui lòng nhập tên gói dịch vụ!" },
                    ]}
                  >
                    <MemoizedInput 
                      placeholder="Nhập tên gói dịch vụ" 
                      size="large"
                      prefix={<InboxOutlined />}
                    />
                  </Form.Item>

                  <Form.Item
                    name="packageUrl"
                    label="URL gói dịch vụ"
                    rules={[
                      { required: true, message: "Vui lòng nhập URL gói dịch vụ!" },
                    ]}
                  >
                    <MemoizedInput 
                      placeholder="Nhập URL gói dịch vụ" 
                      size="large"
                      prefix={<EditOutlined />}
                    />
                  </Form.Item>

                  <Form.Item
                    name="categoryId"
                    label="Danh mục"
                    rules={[
                      { required: true, message: "Vui lòng chọn danh mục!" },
                    ]}
                  >
                    <Select 
                      placeholder="Chọn danh mục" 
                      size="large"
                      loading={categoriesLoading}
                      showSearch
                      optionFilterProp="children"
                    >
                      {categories.map((category) => (
                        <Option key={category.categoryId} value={category.categoryId}>
                          <Space>
                            <Tag color="blue">{category.categoryName}</Tag>
                          </Space>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="packageType"
                    label="Loại gói"
                    rules={[
                      { required: true, message: "Vui lòng chọn loại gói!" },
                    ]}
                  >
                    <Select placeholder="Chọn loại gói" size="large">
                      {SERVICE_PACKAGE_TYPE_OPTIONS.map((type) => (
                        <Option key={type.value} value={type.value}>
                          <Space>
                            <Tag color={type.color}>{type.label}</Tag>
                          </Space>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Card>
              </Col>

              <Col span={12}>
                <Card 
                  title={
                    <Space>
                      <EditOutlined style={{ color: "#52c41a" }} />
                      Mô tả và hình ảnh
                    </Space>
                  }
                  style={{ height: "100%" }}
                >
                  <Form.Item name="description" label="Mô tả gói dịch vụ">
                    <MemoizedTextArea 
                      rows={6} 
                      placeholder="Nhập mô tả chi tiết về gói dịch vụ..." 
                      showCount
                      maxLength={500}
                    />
                  </Form.Item>

                  <Form.Item name="imageUrls" label="URL hình ảnh">
                    <MemoizedTextArea 
                      rows={3} 
                      placeholder="Nhập URL hình ảnh (mỗi URL một dòng)" 
                    />
                  </Form.Item>
                </Card>
              </Col>
            </Row>
          </div>
        );

      case 1:
        return (
          <div style={{ padding: "24px 0" }}>
            <Row gutter={[24, 24]}>
              <Col span={14}>
                <Card 
                  title={
                    <Space>
                      <ToolOutlined style={{ color: "#1890ff" }} />
                      Dịch vụ có sẵn
                      <Badge count={filteredServices.length} showZero color="#1890ff" />
                    </Space>
                  }
                >
                  <div style={{ marginBottom: 16 }}>
                    <MemoizedInput
                      placeholder="Tìm kiếm dịch vụ..."
                      prefix={<SearchOutlined />}
                      value={serviceSearchText}
                      onChange={(e) => setServiceSearchText(e.target.value)}
                      allowClear
                      size="large"
                    />
                  </div>

                  <div
                    style={{
                      maxHeight: 400,
                      overflowY: "auto",
                      overflowX: "hidden"}}
                  >
                    {filteredServices.length > 0 ? (
                      <Row gutter={[12, 12]}>
                        {filteredServices.map((service) => (
                          <Col span={24} key={service.serviceId}>
                            <Card
                              size="small"
                              hoverable
                              style={{
                                border: "1px solid #e8e8e8",
                                borderRadius: 8,
                                transition: "all 0.3s ease"}}
                              bodyStyle={{ padding: 16 }}
                            >
                              <Row gutter={12} align="middle">
                                <Col span={16}>
                                  <Space direction="vertical" size={4}>
                                    <Space>
                                      <Text strong style={{ fontSize: 14 }}>
                                        {service.serviceName}
                                      </Text>
                                      <Tag color="green">Hoạt động</Tag>
                                    </Space>
                                    <Space>
                                      <Text type="secondary" style={{ fontSize: 12 }}>
                                        <DollarOutlined /> {formatCurrency(service.basePrice)}
                                      </Text>
                                      <Text type="secondary" style={{ fontSize: 12 }}>
                                        <ClockCircleOutlined /> {service.standardDuration} phút
                                      </Text>
                                    </Space>
                                    {service.description && (
                                      <Text type="secondary" style={{ fontSize: 11 }}>
                                        {service.description.length > 80
                                          ? `${service.description.substring(0, 80)}...`
                                          : service.description}
                                      </Text>
                                    )}
                                  </Space>
                                </Col>
                                <Col span={8} style={{ textAlign: "right" }}>
                                  <Button
                                    type="primary"
                                    size="small"
                                    icon={<PlusOutlined />}
                                    onClick={() => handleAddService(service.serviceId)}
                                    style={{ marginBottom: 8 }}
                                  >
                                    Thêm
                                  </Button>
                                  <br />
                                  <Tooltip title="Xem chi tiết">
                                    <Button
                                      type="text"
                                      size="small"
                                      icon={<EyeOutlined />}
                                    />
                                  </Tooltip>
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
                </Card>
              </Col>

              <Col span={10}>
                <Card 
                  title={
                    <Space>
                      <CheckCircleOutlined style={{ color: "#52c41a" }} />
                      Dịch vụ đã chọn
                      <Badge count={packageServices.length} showZero color="#52c41a" />
                    </Space>
                  }
                >
                  <div
                    style={{
                      maxHeight: 400,
                      overflowY: "auto",
                      overflowX: "hidden"}}
                  >
                    {packageServices.length > 0 ? (
                      <div>
                        {packageServices.map((service) => (
                          <Card
                            key={service.serviceId}
                            size="small"
                            style={{
                              border: "1px solid #52c41a",
                              borderRadius: 8,
                              marginBottom: 12,
                              backgroundColor: "#f6ffed"}}
                            bodyStyle={{ padding: 12 }}
                          >
                            <Row gutter={8} align="middle">
                              <Col span={16}>
                                <Space direction="vertical" size={4}>
                                  <Space>
                                    <Text strong style={{ fontSize: 13 }}>
                                      {service.serviceName}
                                    </Text>
                                    <Badge count={service.quantity} color="#52c41a" />
                                  </Space>
                                  <Space>
                                    <Text type="secondary" style={{ fontSize: 11 }}>
                                      {formatCurrency(service.unitPrice)} × {service.quantity}
                                    </Text>
                                    <Text strong style={{ fontSize: 12, color: "#52c41a" }}>
                                      = {formatCurrency(service.totalPrice)}
                                    </Text>
                                  </Space>
                                </Space>
                              </Col>
                              <Col span={8} style={{ textAlign: "right" }}>
                                <Space direction="vertical" size="small">
                                  <Space>
                                    <Button
                                      type="text"
                                      size="small"
                                      icon={<MinusOutlined />}
                                      onClick={() =>
                                        handleUpdateServiceQuantity(
                                          service.serviceId,
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
                                        handleUpdateServiceQuantity(
                                          service.serviceId,
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
                                        handleUpdateServiceQuantity(
                                          service.serviceId,
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
                                    onClick={() => handleRemoveService(service.serviceId)}
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
                </Card>
              </Col>
            </Row>
          </div>
        );

      case 2:
        return (
          <div style={{ padding: "24px 0" }}>
            <Row gutter={[24, 24]}>
              <Col span={14}>
                <Card 
                  title={
                    <Space>
                      <InboxOutlined style={{ color: "#1890ff" }} />
                      Sản phẩm có sẵn
                      <Badge count={filteredProducts.length} showZero color="#1890ff" />
                    </Space>
                  }
                >
                  <div style={{ marginBottom: 16 }}>
                    <MemoizedInput
                      placeholder="Tìm kiếm sản phẩm..."
                      prefix={<SearchOutlined />}
                      value={productSearchText}
                      onChange={(e) => setProductSearchText(e.target.value)}
                      allowClear
                      size="large"
                    />
                  </div>

                  <div
                    style={{
                      maxHeight: 400,
                      overflowY: "auto",
                      overflowX: "hidden"}}
                  >
                    {filteredProducts.length > 0 ? (
                      <Row gutter={[12, 12]}>
                        {filteredProducts.map((product) => (
                          <Col span={24} key={product.productId}>
                            <Card
                              size="small"
                              hoverable
                              style={{
                                border: "1px solid #e8e8e8",
                                borderRadius: 8,
                                transition: "all 0.3s ease"}}
                              bodyStyle={{ padding: 16 }}
                            >
                              <Row gutter={12} align="middle">
                                <Col span={16}>
                                  <Space direction="vertical" size={4}>
                                    <Space>
                                      <Text strong style={{ fontSize: 14 }}>
                                        {product.productName}
                                      </Text>
                                      <Tag color="blue">{product.productSku}</Tag>
                                    </Space>
                                    <Space>
                                      <Text type="secondary" style={{ fontSize: 12 }}>
                                        <DollarOutlined /> {formatCurrency(product.sellingPrice || 0)}
                                      </Text>
                                      <Text type="secondary" style={{ fontSize: 12 }}>
                                        <InboxOutlined /> {product.stockQuantity || 0} tồn kho
                                      </Text>
                                    </Space>
                                    {product.description && (
                                      <Text type="secondary" style={{ fontSize: 11 }}>
                                        {product.description.length > 80
                                          ? `${product.description.substring(0, 80)}...`
                                          : product.description}
                                      </Text>
                                    )}
                                  </Space>
                                </Col>
                                <Col span={8} style={{ textAlign: "right" }}>
                                  <Button
                                    type="primary"
                                    size="small"
                                    icon={<PlusOutlined />}
                                    onClick={() => handleAddProduct(product.productId)}
                                    style={{ marginBottom: 8 }}
                                  >
                                    Thêm
                                  </Button>
                                  <br />
                                  <Tooltip title="Xem chi tiết">
                                    <Button
                                      type="text"
                                      size="small"
                                      icon={<EyeOutlined />}
                                    />
                                  </Tooltip>
                                </Col>
                              </Row>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    ) : (
                      <Empty
                        description="Không tìm thấy sản phẩm nào"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    )}
                  </div>
                </Card>
              </Col>

              <Col span={10}>
                <Card 
                  title={
                    <Space>
                      <CheckCircleOutlined style={{ color: "#52c41a" }} />
                      Sản phẩm đã chọn
                      <Badge count={packageProducts.length} showZero color="#52c41a" />
                    </Space>
                  }
                >
                  <div
                    style={{
                      maxHeight: 400,
                      overflowY: "auto",
                      overflowX: "hidden"}}
                  >
                    {packageProducts.length > 0 ? (
                      <div>
                        {packageProducts.map((product) => (
                          <Card
                            key={product.productId}
                            size="small"
                            style={{
                              border: "1px solid #52c41a",
                              borderRadius: 8,
                              marginBottom: 12,
                              backgroundColor: "#f6ffed"}}
                            bodyStyle={{ padding: 12 }}
                          >
                            <Row gutter={8} align="middle">
                              <Col span={16}>
                                <Space direction="vertical" size={4}>
                                  <Space>
                                    <Text strong style={{ fontSize: 13 }}>
                                      {product.productName}
                                    </Text>
                                    <Badge count={product.quantity} color="#52c41a" />
                                  </Space>
                                  <Space>
                                    <Text type="secondary" style={{ fontSize: 11 }}>
                                      {formatCurrency(product.unitPrice)} × {product.quantity}
                                    </Text>
                                    <Text strong style={{ fontSize: 12, color: "#52c41a" }}>
                                      = {formatCurrency(product.totalPrice)}
                                    </Text>
                                  </Space>
                                </Space>
                              </Col>
                              <Col span={8} style={{ textAlign: "right" }}>
                                <Space direction="vertical" size="small">
                                  <Space>
                                    <Button
                                      type="text"
                                      size="small"
                                      icon={<MinusOutlined />}
                                      onClick={() =>
                                        handleUpdateProductQuantity(
                                          product.productId,
                                          product.quantity - 1
                                        )
                                      }
                                      disabled={product.quantity <= 1}
                                    />
                                    <MemoizedInputNumber
                                      min={1}
                                      max={100}
                                      value={product.quantity}
                                      onChange={(value) =>
                                        handleUpdateProductQuantity(
                                          product.productId,
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
                                        handleUpdateProductQuantity(
                                          product.productId,
                                          product.quantity + 1
                                        )
                                      }
                                      disabled={product.quantity >= 100}
                                    />
                                  </Space>
                                  <Button
                                    type="text"
                                    danger
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleRemoveProduct(product.productId)}
                                  />
                                </Space>
                              </Col>
                            </Row>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Empty
                        description="Chưa có sản phẩm nào được chọn"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    )}
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        );

      case 3:
        return (
          <div style={{ padding: "24px 0" }}>
            <Row gutter={[24, 24]}>
              <Col span={16}>
                <Card title="Tóm tắt gói dịch vụ">
                  <Space direction="vertical" size="large" style={{ width: "100%" }}>
                    <div>
                      <Title level={4}>Thông tin gói</Title>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Text strong>Tên gói:</Text>
                          <br />
                          <Text>{form.getFieldValue("packageName") || "Chưa nhập"}</Text>
                        </Col>
                        <Col span={12}>
                          <Text strong>Loại gói:</Text>
                          <br />
                          <Tag color="blue">
                            {SERVICE_PACKAGE_TYPE_OPTIONS.find(
                              t => t.value === form.getFieldValue("packageType")
                            )?.label || "Chưa chọn"}
                          </Tag>
                        </Col>
                      </Row>
                    </div>

                    <div>
                      <Title level={4}>Dịch vụ đã chọn ({packageServices.length})</Title>
                      {packageServices.length > 0 ? (
                        <List
                          size="small"
                          dataSource={packageServices}
                          renderItem={(service) => (
                            <List.Item>
                              <List.Item.Meta
                                title={service.serviceName}
                                description={
                                  <Space>
                                    <Text type="secondary">
                                      {formatCurrency(service.unitPrice)} × {service.quantity}
                                    </Text>
                                    <Text strong style={{ color: "#52c41a" }}>
                                      = {formatCurrency(service.totalPrice)}
                                    </Text>
                                  </Space>
                                }
                              />
                            </List.Item>
                          )}
                        />
                      ) : (
                        <Text type="secondary">Chưa có dịch vụ nào</Text>
                      )}
                    </div>

                    <div>
                      <Title level={4}>Sản phẩm đã chọn ({packageProducts.length})</Title>
                      {packageProducts.length > 0 ? (
                        <List
                          size="small"
                          dataSource={packageProducts}
                          renderItem={(product) => (
                            <List.Item>
                              <List.Item.Meta
                                title={product.productName}
                                description={
                                  <Space>
                                    <Text type="secondary">
                                      {formatCurrency(product.unitPrice)} × {product.quantity}
                                    </Text>
                                    <Text strong style={{ color: "#52c41a" }}>
                                      = {formatCurrency(product.totalPrice)}
                                    </Text>
                                  </Space>
                                }
                              />
                            </List.Item>
                          )}
                        />
                      ) : (
                        <Text type="secondary">Chưa có sản phẩm nào</Text>
                      )}
                    </div>
                  </Space>
                </Card>
              </Col>

              <Col span={8}>
                <Card 
                  title={
                    <Space>
                      <DollarOutlined style={{ color: "#52c41a" }} />
                      Tổng giá gói
                    </Space>
                  }
                >
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <Statistic
                      title="Tổng giá gói dịch vụ"
                      value={packageTotalPrice}
                      formatter={(value) => formatCurrency(Number(value))}
                      valueStyle={{ color: "#52c41a", fontSize: 24 }}
                    />
                    
                    <Divider />
                    
                    <Row gutter={16}>
                      <Col span={12}>
                        <Statistic
                          title="Dịch vụ"
                          value={packageServices.reduce((sum, s) => sum + s.totalPrice, 0)}
                          formatter={(value) => formatCurrency(Number(value))}
                          valueStyle={{ color: "#1890ff", fontSize: 16 }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="Sản phẩm"
                          value={packageProducts.reduce((sum, p) => sum + p.totalPrice, 0)}
                          formatter={(value) => formatCurrency(Number(value))}
                          valueStyle={{ color: "#722ed1", fontSize: 16 }}
                        />
                      </Col>
                    </Row>

                    <Divider />

                    <Space direction="vertical" size="small" style={{ width: "100%" }}>
                      <Text type="secondary">
                        <CheckCircleOutlined /> {packageServices.length} dịch vụ
                      </Text>
                      <Text type="secondary">
                        <InboxOutlined /> {packageProducts.length} sản phẩm
                      </Text>
                    </Space>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      title={
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <Space direction="vertical" size="small">
            <Space>
              <InboxOutlined style={{ fontSize: 24, color: "#1890ff" }} />
              <Title level={3} style={{ margin: 0 }}>
                {title}
              </Title>
            </Space>
            <Text type="secondary">
              Bước {currentStep + 1} / {steps.length}: {steps[currentStep].title}
            </Text>
          </Space>
        </div>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={1400}
      style={{ top: 20 }}
      styles={{
        body: {
          maxHeight: "85vh",
          overflowY: "auto",
          overflowX: "hidden",
          padding: "0 24px 24px 24px"}}}
    >
      <div>
        {/* Progress Steps */}
        <div style={{ marginBottom: 32 }}>
          <Steps
            current={currentStep}
            size="small"
            items={steps.map((step, index) => ({
              title: step.title,
              description: step.description,
              icon: step.icon}))}
          />
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: 24 }}>
          <Progress
            percent={((currentStep + 1) / steps.length) * 100}
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068'}}
            showInfo={false}
          />
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            packageType: "MAINTENANCE"}}
        >
          {renderStepContent()}

          <Divider />

          {/* Navigation Buttons */}
          <div style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={handleCancel} size="large">
                Hủy
              </Button>
              
              {currentStep > 0 && (
                <Button onClick={prevStep} size="large">
                  Quay lại
                </Button>
              )}
              
              {currentStep < steps.length - 1 ? (
                <Button type="primary" onClick={nextStep} size="large">
                  Tiếp theo
                </Button>
              ) : (
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  icon={<CheckCircleOutlined />}
                >
                  {initialData ? "Cập nhật gói" : "Tạo gói dịch vụ"}
                </Button>
              )}
            </Space>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default ServicePackageModalNew;
