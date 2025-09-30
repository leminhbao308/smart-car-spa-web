"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
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
  App,
  Divider,
  Typography,
  Tag,
  Badge,
  Empty,
  List,
  Tabs,
  Statistic,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  MinusOutlined,
  SearchOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  EditOutlined,
  ToolOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { categoryService } from "@/lib/api/services/category.service";
import { serviceService } from "@/lib/api/services/service.service";
import { productService } from "@/lib/api/services/product.service";
import {
  ServicePackage,
  SERVICE_PACKAGE_TYPE_OPTIONS,
  ServicePackageProduct,
  ServicePackageService,
} from "@/lib/api/types/service-package.types";
import { Category, CategoryResponse } from "@/lib/api/types/category.types";
import { Service } from "@/lib/api/types/service.types";
import { Product } from "@/lib/api/types/product.types";
import formatCurrency from "@/components/utils/helper/currency.format.helper";

const { Option } = Select;
const { TextArea } = Input;
const { Text, Title } = Typography;

interface ServicePackageModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (data: {
    packageName: string;
    packageUrl: string;
    categoryId: string;
    description: string;
    packageType: string;
    imageUrls: string;
    packageProducts?: {
      productId: string;
      quantity: number;
      unitPrice: number;
      notes?: string;
      isRequired: boolean;
    }[];
    packageServices?: {
      serviceId: string;
      quantity: number;
      unitPrice: number;
      notes?: string;
      isRequired: boolean;
    }[];
  }) => void;
  initialData?: ServicePackage | null;
  title?: string;
}

const ServicePackageModalSimple: React.FC<ServicePackageModalProps> = ({
  open,
  onCancel,
  onOk,
  initialData,
  title = "Thêm gói dịch vụ mới",
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [packageProducts, setPackageProducts] = useState<
    ServicePackageProduct[]
  >([]);
  const [packageServices, setPackageServices] = useState<
    ServicePackageService[]
  >([]);
  const [packageTotalPrice, setPackageTotalPrice] = useState(0);

  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Search and filter states
  const [serviceSearchText, setServiceSearchText] = useState("");
  const [productSearchText, setProductSearchText] = useState("");

  // Image URLs state
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // Helper function to validate URL
  const isValidImageUrl = (url: string): boolean => {
    try {
      new URL(url);
      return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
    } catch {
      return false;
    }
  };

  // Load data functions
  const loadCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      console.log("Loading categories...");

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 10000)
      );

      const response = (await Promise.race([
        categoryService.getAllCategories(0, 1000),
        timeoutPromise,
      ])) as CategoryResponse;

      console.log("Categories response:", response);

      if (response && response.success && response.data) {
        setCategories(response.data.content || []);
        console.log(
          "Categories loaded successfully:",
          response.data.content?.length || 0
        );
      } else {
        console.warn("Categories response not successful:", response);
        setCategories([]);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        error,
      });

      // Don't show error message for timeout or network issues
      if (error instanceof Error && !error.message.includes("timeout")) {
        message.error("Không thể tải danh sách danh mục");
      }
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, [message]);

  const loadServices = useCallback(async () => {
    try {
      console.log("Loading services...");
      const response = await serviceService.getAllServices(0, 1000);
      console.log("Services response:", response);

      if (response && response.success && response.data) {
        setServices(response.data.content || []);
        console.log(
          "Services loaded successfully:",
          response.data.content?.length || 0
        );
      } else {
        console.warn("Services response not successful:", response);
        setServices([]);
      }
    } catch (error) {
      console.error("Error loading services:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        error,
      });
      message.error("Không thể tải danh sách dịch vụ");
      setServices([]);
    }
  }, [message]);

  const loadProducts = useCallback(async () => {
    try {
      console.log("Loading products...");
      const response = await productService.getAllProducts({
        page: 1,
        size: 1000,
        sort: "productName",
        direction: "ASC",
      });
      console.log("Products response:", response);

      if (response && response.success && response.data) {
        setProducts(response.data.content || []);
        console.log(
          "Products loaded successfully:",
          response.data.content?.length || 0
        );
      } else {
        console.warn("Products response not successful:", response);
        setProducts([]);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        error,
      });
      message.error("Không thể tải danh sách sản phẩm");
      setProducts([]);
    }
  }, [message]);

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
      // Load data with error handling
      Promise.allSettled([
        loadCategories(),
        loadServices(),
        loadProducts(),
      ]).then((results) => {
        results.forEach((result, index) => {
          const dataTypes = ["categories", "services", "products"];
          if (result.status === "rejected") {
            console.error(`Failed to load ${dataTypes[index]}:`, result.reason);
          } else {
            console.log(`${dataTypes[index]} loaded successfully`);
          }
        });
      });

      if (initialData) {
        const imageUrlsArray = initialData.imageUrls
          ? initialData.imageUrls.split("\n").filter((url) => url.trim())
          : [];
        form.setFieldsValue({
          packageName: initialData.packageName,
          packageUrl: initialData.packageUrl,
          categoryId: initialData.categoryId,
          description: initialData.description,
          packageType: initialData.packageType,
          imageUrls: initialData.imageUrls,
        });
        setPackageServices(initialData.packageServices || []);
        setPackageProducts(initialData.packageProducts || []);
        setImageUrls(imageUrlsArray);
      } else {
        form.resetFields();
        setPackageServices([]);
        setPackageProducts([]);
        setPackageTotalPrice(0);
        setImageUrls([]);
      }
    }
  }, [open, initialData, form, loadCategories, loadServices, loadProducts]);

  // Service handlers
  const handleAddService = (serviceId: string) => {
    const service = services.find((s) => s.serviceId === serviceId);
    if (service) {
      const existingService = packageServices.find(
        (s) => s.serviceId === serviceId
      );
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
        isActive: true,
      };

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

  // Product handlers
  const handleAddProduct = (productId: string) => {
    const product = products.find((p) => p.productId === productId);
    if (product) {
      const existingProduct = packageProducts.find(
        (p) => p.productId === productId
      );
      if (existingProduct) {
        message.warning("Sản phẩm này đã được thêm vào gói!");
        return;
      }

      const newProduct: ServicePackageProduct = {
        productId: product.productId,
        productName: product.productName,
        productCode: product.sku,
        quantity: 1,
        unitPrice: product.sellingPrice || 0,
        totalPrice: product.sellingPrice || 0,
        notes: "",
        isRequired: true,
        isActive: true,
      };

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
        packageProducts: packageProducts.map((p) => ({
          productId: p.productId,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
          notes: p.notes,
          isRequired: p.isRequired,
        })),
        packageServices: packageServices.map((s) => ({
          serviceId: s.serviceId || "",
          quantity: s.quantity,
          unitPrice: s.unitPrice,
          notes: s.notes,
          isRequired: s.isRequired,
        })),
      };

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
    setImageUrls([]);
    onCancel();
  };

  // Filter available services
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      serviceSearchText === "" ||
      service.serviceName
        .toLowerCase()
        .includes(serviceSearchText.toLowerCase()) ||
      service.description
        ?.toLowerCase()
        .includes(serviceSearchText.toLowerCase());
    const notSelected = !packageServices.some(
      (s) => s.serviceId === service.serviceId
    );
    return matchesSearch && notSelected && service.isActive;
  });

  // Filter available products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      productSearchText === "" ||
      product.productName
        .toLowerCase()
        .includes(productSearchText.toLowerCase()) ||
      product.sku?.toLowerCase().includes(productSearchText.toLowerCase());
    const notSelected = !packageProducts.some(
      (p) => p.productId === product.productId
    );
    return matchesSearch && notSelected;
  });

  return (
    <Modal
      title={
        <div
          style={{
            textAlign: "center",
            padding: "20px 0",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            margin: "-24px -24px 24px -24px",
            borderRadius: "8px 8px 0 0",
          }}
        >
          <Space direction="vertical" size="small">
            <div
              style={{
                background: "rgba(255,255,255,0.2)",
                borderRadius: "50%",
                width: 60,
                height: 60,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
              }}
            >
              <InboxOutlined style={{ fontSize: 28, color: "white" }} />
            </div>
            <Title
              level={2}
              style={{ margin: 0, color: "white", fontWeight: 600 }}
            >
              {title}
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>
              Quản lý gói dịch vụ một cách chuyên nghiệp
            </Text>
          </Space>
        </div>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={1500}
      style={{ top: 10 }}
      styles={{
        body: {
          maxHeight: "90vh",
          overflowY: "auto",
          overflowX: "hidden",
          padding: "0 32px 32px 32px",
          background: "#fafafa",
        },
      }}
    >
      <div>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            packageType: "MAINTENANCE",
          }}
        >
          <Tabs
            defaultActiveKey="basic"
            size="large"
            style={{
              background: "white",
              borderRadius: 12,
              padding: "20px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
            tabBarStyle={{
              marginBottom: 24,
              borderBottom: "2px solid #f0f0f0",
            }}
            items={[
              {
                key: "basic",
                label: (
                  <Space style={{ padding: "8px 16px" }}>
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        borderRadius: "50%",
                        width: 32,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <InfoCircleOutlined
                        style={{ color: "white", fontSize: 16 }}
                      />
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>
                      Thông tin cơ bản
                    </span>
                  </Space>
                ),
                children: (
                  <Row gutter={[24, 24]}>
                    <Col span={12}>
                      <Card
                        title={
                          <Space>
                            <div
                              style={{
                                background:
                                  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                borderRadius: "50%",
                                width: 28,
                                height: 28,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <InfoCircleOutlined
                                style={{ color: "white", fontSize: 14 }}
                              />
                            </div>
                            <span style={{ fontWeight: 600, fontSize: 16 }}>
                              Thông tin gói dịch vụ
                            </span>
                          </Space>
                        }
                        style={{
                          height: "100%",
                          borderRadius: 12,
                          border: "1px solid #e8e8e8",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                        }}
                        styles={{
                          header: {
                            background:
                              "linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)",
                            borderRadius: "12px 12px 0 0",
                            borderBottom: "1px solid #e8e8e8",
                          },
                        }}
                      >
                        <Form.Item
                          name="packageName"
                          label={
                            <span
                              style={{
                                fontWeight: 600,
                                color: "#333",
                                fontSize: 14,
                              }}
                            >
                              📦 Tên gói dịch vụ
                            </span>
                          }
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập tên gói dịch vụ!",
                            },
                          ]}
                        >
                          <Input
                            placeholder="Nhập tên gói dịch vụ"
                            size="large"
                            prefix={
                              <div
                                style={{
                                  background:
                                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                  borderRadius: "50%",
                                  width: 20,
                                  height: 20,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  marginRight: 8,
                                }}
                              >
                                <InboxOutlined
                                  style={{ color: "white", fontSize: 12 }}
                                />
                              </div>
                            }
                            style={{
                              borderRadius: 8,
                              border: "2px solid #f0f0f0",
                              transition: "all 0.3s ease",
                            }}
                          />
                        </Form.Item>

                        <Form.Item
                          name="packageUrl"
                          label="URL gói dịch vụ"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập URL gói dịch vụ!",
                            },
                          ]}
                        >
                          <Input
                            placeholder="Nhập URL gói dịch vụ"
                            size="large"
                            prefix={<EditOutlined />}
                          />
                        </Form.Item>

                        <Form.Item
                          name="categoryId"
                          label="Danh mục"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn danh mục!",
                            },
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
                              <Option
                                key={category.category_id}
                                value={category.category_id}
                              >
                                <Space>
                                  <Tag color="blue">
                                    {category.category_name}
                                  </Tag>
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
                            <div
                              style={{
                                background:
                                  "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                                borderRadius: "50%",
                                width: 28,
                                height: 28,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <EditOutlined
                                style={{ color: "white", fontSize: 14 }}
                              />
                            </div>
                            <span style={{ fontWeight: 600, fontSize: 16 }}>
                              Mô tả
                            </span>
                          </Space>
                        }
                        style={{
                          height: "100%",
                          borderRadius: 12,
                          border: "1px solid #e8e8e8",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                        }}
                        styles={{
                          header: {
                            background:
                              "linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%)",
                            borderRadius: "12px 12px 0 0",
                            borderBottom: "1px solid #e8e8e8",
                          },
                        }}
                      >
                        <Form.Item
                          name="description"
                          label={
                            <span
                              style={{
                                fontWeight: 600,
                                color: "#333",
                                fontSize: 14,
                              }}
                            >
                              📝 Mô tả gói dịch vụ
                            </span>
                          }
                        >
                          <TextArea
                            rows={6}
                            placeholder="Nhập mô tả chi tiết về gói dịch vụ..."
                            showCount
                            maxLength={500}
                            style={{
                              borderRadius: 8,
                              border: "2px solid #f0f0f0",
                              transition: "all 0.3s ease",
                            }}
                          />
                        </Form.Item>
                      </Card>
                    </Col>
                  </Row>
                ),
              },
              {
                key: "services",
                label: (
                  <Space style={{ padding: "8px 16px" }}>
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                        borderRadius: "50%",
                        width: 32,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ShoppingCartOutlined
                        style={{ color: "white", fontSize: 16 }}
                      />
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>
                      Dịch vụ & Sản phẩm
                    </span>
                    <Badge
                      count={packageServices.length + packageProducts.length}
                      showZero
                      color="#52c41a"
                      style={{ marginLeft: 8 }}
                    />
                  </Space>
                ),
                children: (
                  <Row gutter={[24, 24]}>
                    {/* Dịch vụ */}
                    <Col span={12}>
                      <Card
                        title={
                          <Space>
                            <ToolOutlined style={{ color: "#1890ff" }} />
                            Dịch vụ
                            <Badge
                              count={packageServices.length}
                              showZero
                              color="#1890ff"
                            />
                          </Space>
                        }
                      >
                        <div style={{ marginBottom: 16 }}>
                          <Input
                            placeholder="Tìm kiếm dịch vụ..."
                            prefix={<SearchOutlined />}
                            value={serviceSearchText}
                            onChange={(e) =>
                              setServiceSearchText(e.target.value)
                            }
                            allowClear
                            size="large"
                          />
                        </div>

                        <div
                          style={{
                            maxHeight: 300,
                            overflowY: "auto",
                            overflowX: "hidden",
                          }}
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
                                      transition: "all 0.3s ease",
                                    }}
                                    styles={{ body: { padding: 12 } }}
                                  >
                                    <Row gutter={8} align="middle">
                                      <Col span={16}>
                                        <Space direction="vertical" size={4}>
                                          <Space>
                                            <Text
                                              strong
                                              style={{ fontSize: 13 }}
                                            >
                                              {service.serviceName}
                                            </Text>
                                            <Tag color="green">Hoạt động</Tag>
                                          </Space>
                                          <Space>
                                            <Text
                                              type="secondary"
                                              style={{ fontSize: 11 }}
                                            >
                                              <DollarOutlined />{" "}
                                              {formatCurrency(
                                                service.basePrice
                                              )}
                                            </Text>
                                            <Text
                                              type="secondary"
                                              style={{ fontSize: 11 }}
                                            >
                                              <ClockCircleOutlined />{" "}
                                              {service.standardDuration} phút
                                            </Text>
                                          </Space>
                                        </Space>
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
                                            handleAddService(
                                              service.serviceId || ""
                                            )
                                          }
                                        >
                                          Thêm
                                        </Button>
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

                        {/* Dịch vụ đã chọn */}
                        {packageServices.length > 0 && (
                          <div style={{ marginTop: 16 }}>
                            <Text strong>Dịch vụ đã chọn:</Text>
                            <div style={{ marginTop: 8 }}>
                              {packageServices.map((service) => (
                                <Card
                                  key={service.serviceId}
                                  size="small"
                                  style={{
                                    border: "1px solid #52c41a",
                                    borderRadius: 6,
                                    marginBottom: 8,
                                    backgroundColor: "#f6ffed",
                                  }}
                                  styles={{ body: { padding: 8 } }}
                                >
                                  <Row gutter={8} align="middle">
                                    <Col span={16}>
                                      <Space direction="vertical" size={2}>
                                        <Space>
                                          <Text strong style={{ fontSize: 12 }}>
                                            {service.serviceName}
                                          </Text>
                                          <Badge
                                            count={service.quantity}
                                            color="#52c41a"
                                          />
                                        </Space>
                                        <Text
                                          type="secondary"
                                          style={{ fontSize: 10 }}
                                        >
                                          {formatCurrency(service.unitPrice)} ×{" "}
                                          {service.quantity} ={" "}
                                          {formatCurrency(service.totalPrice)}
                                        </Text>
                                      </Space>
                                    </Col>
                                    <Col
                                      span={8}
                                      style={{ textAlign: "right" }}
                                    >
                                      <Space direction="vertical" size="small">
                                        <Space>
                                          <Button
                                            type="text"
                                            size="small"
                                            icon={<MinusOutlined />}
                                            onClick={() =>
                                              handleUpdateServiceQuantity(
                                                service.serviceId || "",
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
                                              handleUpdateServiceQuantity(
                                                service.serviceId || "",
                                                value ?? 1
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
                                                service.serviceId || "",
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
                                            handleRemoveService(
                                              service.serviceId || ""
                                            )
                                          }
                                        />
                                      </Space>
                                    </Col>
                                  </Row>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                      </Card>
                    </Col>

                    {/* Sản phẩm */}
                    <Col span={12}>
                      <Card
                        title={
                          <Space>
                            <InboxOutlined style={{ color: "#1890ff" }} />
                            Sản phẩm
                            <Badge
                              count={packageProducts.length}
                              showZero
                              color="#1890ff"
                            />
                          </Space>
                        }
                      >
                        <div style={{ marginBottom: 16 }}>
                          <Input
                            placeholder="Tìm kiếm sản phẩm..."
                            prefix={<SearchOutlined />}
                            value={productSearchText}
                            onChange={(e) =>
                              setProductSearchText(e.target.value)
                            }
                            allowClear
                            size="large"
                          />
                        </div>

                        <div
                          style={{
                            maxHeight: 300,
                            overflowY: "auto",
                            overflowX: "hidden",
                          }}
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
                                      transition: "all 0.3s ease",
                                    }}
                                    styles={{ body: { padding: 12 } }}
                                  >
                                    <Row gutter={8} align="middle">
                                      <Col span={16}>
                                        <Space direction="vertical" size={4}>
                                          <Space>
                                            <Text
                                              strong
                                              style={{ fontSize: 13 }}
                                            >
                                              {product.productName}
                                            </Text>
                                            <Tag color="blue">
                                              {product.sku}
                                            </Tag>
                                          </Space>
                                          <Space>
                                            <Text
                                              type="secondary"
                                              style={{ fontSize: 11 }}
                                            >
                                              <DollarOutlined />{" "}
                                              {formatCurrency(
                                                product.sellingPrice || 0
                                              )}
                                            </Text>
                                            <Text
                                              type="secondary"
                                              style={{ fontSize: 11 }}
                                            >
                                              <InboxOutlined />{" "}
                                              {product.maxStockLevel || 0} tồn
                                              kho
                                            </Text>
                                          </Space>
                                        </Space>
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
                                            handleAddProduct(
                                              product.productId || ""
                                            )
                                          }
                                        >
                                          Thêm
                                        </Button>
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

                        {/* Sản phẩm đã chọn */}
                        {packageProducts.length > 0 && (
                          <div style={{ marginTop: 16 }}>
                            <Text strong>Sản phẩm đã chọn:</Text>
                            <div style={{ marginTop: 8 }}>
                              {packageProducts.map((product) => (
                                <Card
                                  key={product.productId}
                                  size="small"
                                  style={{
                                    border: "1px solid #52c41a",
                                    borderRadius: 6,
                                    marginBottom: 8,
                                    backgroundColor: "#f6ffed",
                                  }}
                                  styles={{ body: { padding: 8 } }}
                                >
                                  <Row gutter={8} align="middle">
                                    <Col span={16}>
                                      <Space direction="vertical" size={2}>
                                        <Space>
                                          <Text strong style={{ fontSize: 12 }}>
                                            {product.productName}
                                          </Text>
                                          <Badge
                                            count={product.quantity}
                                            color="#52c41a"
                                          />
                                        </Space>
                                        <Text
                                          type="secondary"
                                          style={{ fontSize: 10 }}
                                        >
                                          {formatCurrency(product.unitPrice)} ×{" "}
                                          {product.quantity} ={" "}
                                          {formatCurrency(product.totalPrice)}
                                        </Text>
                                      </Space>
                                    </Col>
                                    <Col
                                      span={8}
                                      style={{ textAlign: "right" }}
                                    >
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
                                          <InputNumber
                                            min={1}
                                            max={100}
                                            value={product.quantity}
                                            onChange={(value) =>
                                              handleUpdateProductQuantity(
                                                product.productId,
                                                value ?? 1
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
                                          onClick={() =>
                                            handleRemoveProduct(
                                              product.productId || ""
                                            )
                                          }
                                        />
                                      </Space>
                                    </Col>
                                  </Row>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                      </Card>
                    </Col>
                  </Row>
                ),
              },
              {
                key: "summary",
                label: (
                  <Space style={{ padding: "8px 16px" }}>
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, #fa8c16 0%, #ffa940 100%)",
                        borderRadius: "50%",
                        width: 32,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CheckCircleOutlined
                        style={{ color: "white", fontSize: 16 }}
                      />
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>
                      Tóm tắt
                    </span>
                  </Space>
                ),
                children: (
                  <Row gutter={[24, 24]}>
                    <Col span={16}>
                      <Card title="Tóm tắt gói dịch vụ">
                        <Space
                          direction="vertical"
                          size="large"
                          style={{ width: "100%" }}
                        >
                          <div>
                            <Title level={4}>Thông tin gói</Title>
                            <Row gutter={16}>
                              <Col span={8}>
                                <Text strong>Tên gói:</Text>
                                <br />
                                <Text>
                                  {form.getFieldValue("packageName") ||
                                    "Chưa nhập"}
                                </Text>
                              </Col>
                              <Col span={8}>
                                <Text strong>Loại gói:</Text>
                                <br />
                                <Tag color="blue">
                                  {SERVICE_PACKAGE_TYPE_OPTIONS.find(
                                    (t) =>
                                      t.value ===
                                      form.getFieldValue("packageType")
                                  )?.label || "Chưa chọn"}
                                </Tag>
                              </Col>
                              <Col span={8}>
                                <Text strong>Hình ảnh:</Text>
                                <br />
                                <Space>
                                  <Tag
                                    color={
                                      imageUrls.length > 0 ? "green" : "default"
                                    }
                                  >
                                    {imageUrls.length > 0
                                      ? "Có hình ảnh"
                                      : "Chưa có hình ảnh"}
                                  </Tag>
                                  {imageUrls.length > 0 && (
                                    <Tag
                                      color={
                                        isValidImageUrl(imageUrls[0])
                                          ? "blue"
                                          : "red"
                                      }
                                    >
                                      {isValidImageUrl(imageUrls[0])
                                        ? "Hợp lệ"
                                        : "Không hợp lệ"}
                                    </Tag>
                                  )}
                                </Space>
                              </Col>
                            </Row>
                          </div>

                          <div>
                            <Title level={4}>
                              Dịch vụ đã chọn ({packageServices.length})
                            </Title>
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
                                            {formatCurrency(service.unitPrice)}{" "}
                                            × {service.quantity}
                                          </Text>
                                          <Text
                                            strong
                                            style={{ color: "#52c41a" }}
                                          >
                                            ={" "}
                                            {formatCurrency(service.totalPrice)}
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
                            <Title level={4}>
                              Sản phẩm đã chọn ({packageProducts.length})
                            </Title>
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
                                            {formatCurrency(product.unitPrice)}{" "}
                                            × {product.quantity}
                                          </Text>
                                          <Text
                                            strong
                                            style={{ color: "#52c41a" }}
                                          >
                                            ={" "}
                                            {formatCurrency(product.totalPrice)}
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
                                value={packageServices.reduce(
                                  (sum, s) => sum + s.totalPrice,
                                  0
                                )}
                                formatter={(value) =>
                                  formatCurrency(Number(value))
                                }
                                valueStyle={{ color: "#1890ff", fontSize: 16 }}
                              />
                            </Col>
                            <Col span={12}>
                              <Statistic
                                title="Sản phẩm"
                                value={packageProducts.reduce(
                                  (sum, p) => sum + p.totalPrice,
                                  0
                                )}
                                formatter={(value) =>
                                  formatCurrency(Number(value))
                                }
                                valueStyle={{ color: "#722ed1", fontSize: 16 }}
                              />
                            </Col>
                          </Row>

                          <Divider />

                          <Space
                            direction="vertical"
                            size="small"
                            style={{ width: "100%" }}
                          >
                            <Text type="secondary">
                              <CheckCircleOutlined /> {packageServices.length}{" "}
                              dịch vụ
                            </Text>
                            <Text type="secondary">
                              <InboxOutlined /> {packageProducts.length} sản
                              phẩm
                            </Text>
                          </Space>
                        </div>
                      </Card>
                    </Col>
                  </Row>
                ),
              },
            ]}
          />

          <Divider />

          {/* Action Buttons */}
          <div
            style={{
              textAlign: "right",
              padding: "24px 0",
              background: "linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)",
              margin: "0 -32px -32px -32px",
              borderRadius: "0 0 12px 12px",
              borderTop: "1px solid #e8e8e8",
            }}
          >
            <Space size="large">
              <Button
                onClick={handleCancel}
                size="large"
                style={{
                  borderRadius: 8,
                  height: 48,
                  padding: "0 24px",
                  fontWeight: 600,
                  border: "2px solid #d9d9d9",
                  background: "white",
                }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                icon={<CheckCircleOutlined />}
                style={{
                  borderRadius: 8,
                  height: 48,
                  padding: "0 32px",
                  fontWeight: 600,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                }}
              >
                {initialData ? "Cập nhật gói" : "Tạo gói dịch vụ"}
              </Button>
            </Space>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default ServicePackageModalSimple;
