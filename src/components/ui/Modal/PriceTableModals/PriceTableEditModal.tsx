"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Card,
  Row,
  Col,
  Table,
  Tag,
  Typography,
  message,
  Empty,
  InputNumber,
  Tabs,
  Space,
  Spin,
} from "antd";
import {
  DeleteOutlined,
  FileTextOutlined,
  TagOutlined,
  DollarOutlined,
  ShoppingOutlined,
  ToolOutlined,
  InsertRowBelowOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

// Mock data (thay thế bằng import thực tế)
const branchesData = [
  { id: "1", name: "Chi nhánh 1", code: "CN1" },
  { id: "2", name: "Chi nhánh 2", code: "CN2" },
];

const servicesData = [
  { id: 1, serviceName: "Rửa xe", serviceTypeName: "Vệ sinh", base_price: 50000 },
  { id: 2, serviceName: "Đánh bóng", serviceTypeName: "Làm đẹp", base_price: 200000 },
];

const productsData = [
  { id: 1, name: "Dầu nhớt", categoryName: "Dầu", price: 150000, sku: "OIL001" },
  { id: 2, name: "Lốp xe", categoryName: "Lốp", price: 800000, sku: "TIRE001" },
];

const servicePackagesData = [
  { id: 1, packageName: "Gói bảo dưỡng cơ bản", totalPrice: 500000 },
  { id: 2, packageName: "Gói bảo dưỡng cao cấp", totalPrice: 1200000 },
];

// API Service
const PricingService = {
  createPriceBook: async (data: any) => {
    // Giả lập API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id: Date.now().toString(), ...data });
      }, 1000);
    });
  },
  updatePriceBook: async (id: string, data: any) => {
    // Giả lập API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id, ...data });
      }, 1000);
    });
  },
};

// Interfaces
interface PriceBookItem {
  item_type: "PRODUCT" | "SERVICE" | "SERVICE_PACKAGE";
  item_id: string;
  item_name: string;
  policy_type: "FIXED" | "MARKUP";
  fixed_price?: number;
  markup_percent?: number;
  product?: { product_id: string };
  service?: { service_id: string };
  servicePackage?: { packageId: string };
}

interface PriceBookData {
  id?: string;
  code: string;
  name: string;
  currency: string;
  valid_from: string;
  valid_to?: string;
  active: boolean;
  items: PriceBookItem[];
}

interface PriceTableEditModalProps {
  open: boolean;
  onOk: (priceTable: any) => void;
  onCancel: () => void;
  initialData?: any | null;
  title?: string;
}

const PriceTableEditModal: React.FC<PriceTableEditModalProps> = ({
                                                                   open,
                                                                   onOk,
                                                                   onCancel,
                                                                   initialData,
                                                                   title = "Thêm bảng giá mới",
                                                                 }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [items, setItems] = useState<PriceBookItem[]>([]);

  // Initialize form
  useEffect(() => {
    if (open) {
      if (initialData) {
        form.setFieldsValue({
          name: initialData.name,
          code: initialData.code,
          currency: initialData.currency || "VND",
          valid_from: initialData.valid_from ? dayjs(initialData.valid_from) : null,
          valid_to: initialData.valid_to ? dayjs(initialData.valid_to) : null,
          active: initialData.active !== undefined ? initialData.active : true,
        });
        setItems(initialData.items || []);
      } else {
        form.resetFields();
        form.setFieldsValue({
          currency: "VND",
          active: true,
        });
        setItems([]);
      }
    }
  }, [open, initialData, form]);

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString("vi-VN")} ₫`;
  };

  // Add item functions
  const addService = (serviceId: number) => {
    const service = servicesData.find((s) => s.id === serviceId);
    if (service && !items.find((i) => i.item_type === "SERVICE" && i.item_id === String(serviceId))) {
      const newItem: PriceBookItem = {
        item_type: "SERVICE",
        item_id: String(serviceId),
        item_name: service.serviceName,
        policy_type: "FIXED",
        fixed_price: service.base_price,
        service: { service_id: String(serviceId) },
      };
      setItems([...items, newItem]);
      message.success(`Đã thêm dịch vụ: ${service.serviceName}`);
    }
  };

  const addProduct = (productId: number) => {
    const product = productsData.find((p) => p.id === productId);
    if (product && !items.find((i) => i.item_type === "PRODUCT" && i.item_id === String(productId))) {
      const newItem: PriceBookItem = {
        item_type: "PRODUCT",
        item_id: String(productId),
        item_name: product.name,
        policy_type: "FIXED",
        fixed_price: product.price,
        product: { product_id: String(productId) },
      };
      setItems([...items, newItem]);
      message.success(`Đã thêm sản phẩm: ${product.name}`);
    }
  };

  const addServicePackage = (packageId: number) => {
    const pkg = servicePackagesData.find((p) => p.id === packageId);
    if (pkg && !items.find((i) => i.item_type === "SERVICE_PACKAGE" && i.item_id === String(packageId))) {
      const newItem: PriceBookItem = {
        item_type: "SERVICE_PACKAGE",
        item_id: String(packageId),
        item_name: pkg.packageName,
        policy_type: "FIXED",
        fixed_price: pkg.totalPrice,
        servicePackage: { packageId: String(packageId) },
      };
      setItems([...items, newItem]);
      message.success(`Đã thêm gói dịch vụ: ${pkg.packageName}`);
    }
  };

  const removeItem = (itemType: string, itemId: string) => {
    setItems(items.filter((i) => !(i.item_type === itemType && i.item_id === itemId)));
    message.success("Đã xóa mục");
  };

  const updateItemPolicy = (itemType: string, itemId: string, policyType: "FIXED" | "MARKUP") => {
    setItems(
      items.map((i) =>
        i.item_type === itemType && i.item_id === itemId
          ? {
            ...i,
            policy_type: policyType,
            fixed_price: policyType === "FIXED" ? i.fixed_price : undefined,
            markup_percent: policyType === "MARKUP" ? 0 : undefined,
          }
          : i
      )
    );
  };

  const updateItemPrice = (itemType: string, itemId: string, field: string, value: number) => {
    setItems(
      items.map((i) =>
        i.item_type === itemType && i.item_id === itemId
          ? {
            ...i,
            [field]: value,
          }
          : i
      )
    );
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // Validate items
      if (items.length === 0) {
        message.warning("Vui lòng thêm ít nhất một mục vào bảng giá");
        setLoading(false);
        return;
      }

      // Prepare data for API
      const priceBookData: PriceBookData = {
        code: values.code,
        name: values.name,
        currency: values.currency,
        valid_from: values.valid_from ? values.valid_from.format("YYYY-MM-DD") : "",
        valid_to: values.valid_to ? values.valid_to.format("YYYY-MM-DD") : undefined,
        active: values.active,
        items: items,
      };

      // Call API
      let result;
      if (initialData?.id) {
        result = await PricingService.updatePriceBook(initialData.id, priceBookData);
        message.success("Cập nhật bảng giá thành công!");
      } else {
        result = await PricingService.createPriceBook(priceBookData);
        message.success("Thêm bảng giá thành công!");
      }

      // Pass result to parent
      onOk(result);

      // Reset form
      form.resetFields();
      setItems([]);
      setActiveTab("basic");
    } catch (error: any) {
      console.log("Submit failed:", error);
      message.error(error?.message || "Có lỗi xảy ra khi lưu bảng giá");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setItems([]);
    setActiveTab("basic");
    onCancel();
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case "PRODUCT":
        return <ShoppingOutlined style={{ color: "#1890ff" }} />;
      case "SERVICE":
        return <ToolOutlined style={{ color: "#52c41a" }} />;
      case "SERVICE_PACKAGE":
        return <InsertRowBelowOutlined style={{ color: "#fa8c16" }} />;
      default:
        return null;
    }
  };

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case "PRODUCT":
        return "Sản phẩm";
      case "SERVICE":
        return "Dịch vụ";
      case "SERVICE_PACKAGE":
        return "Gói dịch vụ";
      default:
        return type;
    }
  };

  const itemColumns = [
    {
      title: "Loại",
      dataIndex: "item_type",
      key: "item_type",
      width: 140,
      render: (type: string) => (
        <Tag icon={getItemIcon(type)} color={type === "PRODUCT" ? "blue" : type === "SERVICE" ? "green" : "orange"}>
          {getItemTypeLabel(type)}
        </Tag>
      ),
    },
    {
      title: "Tên mục",
      dataIndex: "item_name",
      key: "item_name",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Chính sách giá",
      dataIndex: "policy_type",
      key: "policy_type",
      width: 180,
      render: (policy: string, record: PriceBookItem) => (
        <Select
          value={policy}
          onChange={(val) => updateItemPolicy(record.item_type, record.item_id, val)}
          style={{ width: "100%" }}
          size="small"
        >
          <Option value="FIXED">Giá cố định</Option>
          <Option value="MARKUP">Markup (%)</Option>
        </Select>
      ),
    },
    {
      title: "Giá trị",
      key: "price_value",
      width: 200,
      render: (_: any, record: PriceBookItem) => {
        if (record.policy_type === "FIXED") {
          return (
            <InputNumber
              value={record.fixed_price}
              onChange={(val) => updateItemPrice(record.item_type, record.item_id, "fixed_price", val || 0)}
              formatter={(value) => formatCurrency(Number(value))}
              parser={(value) => Number(value!.replace(/[^\d]/g, ""))}
              style={{ width: "100%" }}
              size="small"
            />
          );
        } else {
          return (
            <InputNumber
              value={record.markup_percent}
              onChange={(val) => updateItemPrice(record.item_type, record.item_id, "markup_percent", val || 0)}
              min={0}
              max={1000}
              formatter={(value) => `${value}%`}
              parser={(value) => Number(value!.replace("%", ""))}
              style={{ width: "100%" }}
              size="small"
            />
          );
        }
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      render: (_: any, record: PriceBookItem) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeItem(record.item_type, record.item_id)}
          size="small"
        />
      ),
    },
  ];

  const tabItems = [
    {
      key: "basic",
      label: "Thông tin cơ bản",
      children: (
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item name="name" label="Tên bảng giá" rules={[{ required: true, message: "Vui lòng nhập tên bảng giá!" }]}>
              <Input placeholder="Nhập tên bảng giá" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="code" label="Mã bảng giá" rules={[{ required: true, message: "Vui lòng nhập mã bảng giá!" }]}>
              <Input placeholder="Nhập mã bảng giá" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="currency" label="Đơn vị tiền tệ" rules={[{ required: true, message: "Vui lòng chọn đơn vị!" }]}>
              <Select>
                <Option value="VND">VND (Việt Nam Đồng)</Option>
                <Option value="USD">USD (US Dollar)</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="valid_from" label="Ngày hiệu lực" rules={[{ required: true, message: "Vui lòng chọn ngày hiệu lực!" }]}>
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="valid_to" label="Ngày hết hạn">
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="active" label="Trạng thái" valuePropName="checked">
              <Select>
                <Option value={true}>Đang áp dụng</Option>
                <Option value={false}>Ngừng áp dụng</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      ),
    },
    {
      key: "items",
      label: (
        <span>
          Mục giá <Tag color="blue">{items.length}</Tag>
        </span>
      ),
      children: (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          {/* Add Items Section */}
          <Card title="Thêm mục vào bảng giá" size="small">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <div>
                  <Text strong>Thêm dịch vụ:</Text>
                  <Select
                    placeholder="Chọn dịch vụ"
                    style={{ width: "100%", marginTop: 8 }}
                    onSelect={addService}
                    showSearch
                    filterOption={(input, option) => option?.children?.toString().toLowerCase().includes(input.toLowerCase()) ?? false}
                  >
                    {servicesData
                      .filter((service) => !items.find((i) => i.item_type === "SERVICE" && i.item_id === String(service.id)))
                      .map((service) => (
                        <Option key={service.id} value={service.id}>
                          {service.serviceName} - {formatCurrency(service.base_price)}
                        </Option>
                      ))}
                  </Select>
                </div>
              </Col>
              <Col span={8}>
                <div>
                  <Text strong>Thêm sản phẩm:</Text>
                  <Select
                    placeholder="Chọn sản phẩm"
                    style={{ width: "100%", marginTop: 8 }}
                    onSelect={addProduct}
                    showSearch
                    filterOption={(input, option) => option?.children?.toString().toLowerCase().includes(input.toLowerCase()) ?? false}
                  >
                    {productsData
                      .filter((product) => !items.find((i) => i.item_type === "PRODUCT" && i.item_id === String(product.id)))
                      .map((product) => (
                        <Option key={product.id} value={product.id}>
                          {product.name} - {formatCurrency(product.price)}
                        </Option>
                      ))}
                  </Select>
                </div>
              </Col>
              <Col span={8}>
                <div>
                  <Text strong>Thêm gói dịch vụ:</Text>
                  <Select
                    placeholder="Chọn gói dịch vụ"
                    style={{ width: "100%", marginTop: 8 }}
                    onSelect={addServicePackage}
                    showSearch
                    filterOption={(input, option) => option?.children?.toString().toLowerCase().includes(input.toLowerCase()) ?? false}
                  >
                    {servicePackagesData
                      .filter((pkg) => !items.find((i) => i.item_type === "SERVICE_PACKAGE" && i.item_id === String(pkg.id)))
                      .map((pkg) => (
                        <Option key={pkg.id} value={pkg.id}>
                          {pkg.packageName} - {formatCurrency(pkg.totalPrice)}
                        </Option>
                      ))}
                  </Select>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Items Table */}
          {items.length > 0 ? (
            <Card title="Danh sách mục giá" size="small">
              <Table dataSource={items} columns={itemColumns} rowKey={(record) => `${record.item_type}_${record.item_id}`} pagination={false} size="small" />
            </Card>
          ) : (
            <Empty description="Chưa có mục nào được thêm vào bảng giá" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </Space>
      ),
    },
  ];

  return (
    <Modal
      title={title}
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      width={1200}
      confirmLoading={loading}
      okText={initialData?.id ? "Cập nhật" : "Thêm mới"}
      cancelText="Hủy"
      styles={{
        body: {
          maxHeight: "70vh",
          overflowY: "auto",
        },
      }}
    >
      <Spin spinning={loading}>
        <Form form={form} layout="vertical">
          <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
        </Form>
      </Spin>
    </Modal>
  );
};

export default PriceTableEditModal;
