"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
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
} from "antd";
import {
  DeleteOutlined,
  FileTextOutlined,
  TagOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  PriceTable,
  PriceTableService,
  PriceTableProduct,
  PriceTableServicePackage,
  VehicleTypePricing,
  DiscountProgram,
  branchesData,
  discountProgramsData,
  PRICE_TABLE_STATUSES,
  APPLICABLE_TO_OPTIONS,
  VEHICLE_TYPE_MULTIPLIERS,
} from "@/components/utils/data/price-table.data";
import { servicesData } from "@/components/utils/data/services.data";
import { productsData } from "@/components/utils/data/products.data";
import { servicePackagesData } from "@/components/utils/data/service-packages.data";
import { vehicleTypesData } from "@/components/utils/data/vehicle-types.data";
import formatCurrency from "@/components/utils/helper/currency.format.helper";

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

// Interface for pricing table record
interface PricingTableRecord {
  type: 'service' | 'product' | 'package';
  id?: number;
  serviceId?: number;
  productId?: number;
  packageId?: number;
  serviceName?: string;
  productName?: string;
  packageName?: string;
  serviceCategory?: string;
  productCategory?: string;
  basePrice: number;
  finalPrice: number;
  discountPercentage: number;
  status: string;
}

interface PriceTableEditModalProps {
  open: boolean;
  onOk: (priceTable: PriceTable) => void;
  onCancel: () => void;
  initialData?: PriceTable | null;
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

  // State for different sections
  const [services, setServices] = useState<PriceTableService[]>([]);
  const [products, setProducts] = useState<PriceTableProduct[]>([]);
  const [servicePackages, setServicePackages] = useState<PriceTableServicePackage[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypePricing[]>([]);
  const [discountPrograms, setDiscountPrograms] = useState<DiscountProgram[]>([]);

  // Initialize form when modal opens
  useEffect(() => {
    if (open) {
      if (initialData) {
        form.setFieldsValue({
          name: initialData.name,
          code: initialData.code,
          description: initialData.description,
          branchId: initialData.branchId,
          status: initialData.status,
          effectiveDate: initialData.effectiveDate ? dayjs(initialData.effectiveDate) : null,
          expiryDate: initialData.expiryDate ? dayjs(initialData.expiryDate) : null,
          isDefault: initialData.isDefault,
        });
        setServices(initialData.services || []);
        setProducts(initialData.products || []);
        setServicePackages(initialData.servicePackages || []);
        setVehicleTypes(initialData.vehicleTypes || []);
        setDiscountPrograms(initialData.discountPrograms || []);
      } else {
        form.resetFields();
        setServices([]);
        setProducts([]);
        setServicePackages([]);
        setVehicleTypes([]);
        setDiscountPrograms([]);
      }
    }
  }, [open, initialData, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const priceTableData: PriceTable = {
        id: initialData?.id || Date.now(),
        name: values.name,
        code: values.code,
        description: values.description,
        branchId: values.branchId || null,
        branchName: values.branchId ? branchesData.find(b => b.id === values.branchId)?.name : undefined,
        status: values.status,
        effectiveDate: values.effectiveDate ? values.effectiveDate.format("YYYY-MM-DD") : "",
        expiryDate: values.expiryDate ? values.expiryDate.format("YYYY-MM-DD") : undefined,
        isDefault: values.isDefault || false,
        services,
        products,
        servicePackages,
        vehicleTypes,
        discountPrograms,
        createdAt: initialData?.createdAt || new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
        createdBy: "admin",
        updatedBy: "admin",
      };

      onOk(priceTableData);
      message.success(
        initialData
          ? "Cập nhật bảng giá thành công!"
          : "Thêm bảng giá thành công!"
      );

      // Reset form
      form.resetFields();
      setServices([]);
      setProducts([]);
      setServicePackages([]);
      setVehicleTypes([]);
      setDiscountPrograms([]);
    } catch (error) {
      console.error("Validation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setServices([]);
    setProducts([]);
    setServicePackages([]);
    setVehicleTypes([]);
    setDiscountPrograms([]);
    onCancel();
  };

  // Service management functions
  const addService = (serviceId: number) => {
    const service = servicesData.find(s => s.id === serviceId);
    if (service && !services.find(s => s.serviceId === serviceId)) {
      const newService: PriceTableService = {
        id: Date.now(),
        serviceId: service.id,
        serviceName: service.serviceName,
        serviceCategory: service.serviceTypeName,
        basePrice: service.totalPrice,
        finalPrice: service.totalPrice,
        discountPercentage: 0,
        priceRanges: [],
        status: "active",
      };
      setServices([...services, newService]);
    }
  };

  const removeService = (serviceId: number) => {
    setServices(services.filter(s => s.serviceId !== serviceId));
  };

  const updateServicePrice = (serviceId: number, field: string, value: number) => {
    setServices(services.map(s => 
      s.serviceId === serviceId 
        ? { ...s, [field]: value, finalPrice: field === 'basePrice' ? value * (1 - s.discountPercentage / 100) : s.finalPrice }
        : s
    ));
  };

  // Product management functions
  const addProduct = (productId: number) => {
    const product = productsData.find(p => p.id === productId);
    if (product && !products.find(p => p.productId === productId)) {
      const newProduct: PriceTableProduct = {
        id: Date.now(),
        productId: product.id,
        productName: product.name,
        productCategory: product.categoryName,
        basePrice: product.price,
        finalPrice: product.price,
        discountPercentage: 0,
        status: "active",
      };
      setProducts([...products, newProduct]);
    }
  };

  const removeProduct = (productId: number) => {
    setProducts(products.filter(p => p.productId !== productId));
  };

  const updateProductPrice = (productId: number, field: string, value: number) => {
    setProducts(products.map(p => 
      p.productId === productId 
        ? { ...p, [field]: value, finalPrice: field === 'basePrice' ? value * (1 - p.discountPercentage / 100) : p.finalPrice }
        : p
    ));
  };

  // Service Package management functions
  const addServicePackage = (packageId: number) => {
    const servicePackage = servicePackagesData.find(p => p.id === packageId);
    if (servicePackage && !servicePackages.find(p => p.packageId === packageId)) {
      const newServicePackage: PriceTableServicePackage = {
        id: Date.now(),
        packageId: servicePackage.id,
        packageName: servicePackage.packageName,
        basePrice: servicePackage.totalPrice,
        finalPrice: servicePackage.totalPrice,
        discountPercentage: 0,
        status: "active",
      };
      setServicePackages([...servicePackages, newServicePackage]);
    }
  };

  const removeServicePackage = (packageId: number) => {
    setServicePackages(servicePackages.filter(p => p.packageId !== packageId));
  };

  const updateServicePackagePrice = (packageId: number, field: string, value: number) => {
    setServicePackages(servicePackages.map(p => 
      p.packageId === packageId 
        ? { ...p, [field]: value, finalPrice: field === 'basePrice' ? value * (1 - p.discountPercentage / 100) : p.finalPrice }
        : p
    ));
  };

  // Vehicle Type management functions
  const addVehicleType = (vehicleTypeId: number) => {
    const vehicleType = vehicleTypesData.find(v => v.id === vehicleTypeId);
    if (vehicleType && !vehicleTypes.find(v => v.vehicleTypeId === vehicleTypeId)) {
      const newVehicleType: VehicleTypePricing = {
        id: Date.now(),
        vehicleTypeId: vehicleType.id,
        vehicleTypeName: vehicleType.typeName,
        multiplier: 1.0,
        description: vehicleType.description,
      };
      setVehicleTypes([...vehicleTypes, newVehicleType]);
    }
  };

  const removeVehicleType = (vehicleTypeId: number) => {
    setVehicleTypes(vehicleTypes.filter(v => v.vehicleTypeId !== vehicleTypeId));
  };

  const updateVehicleTypeMultiplier = (vehicleTypeId: number, multiplier: number) => {
    setVehicleTypes(vehicleTypes.map(v => 
      v.vehicleTypeId === vehicleTypeId 
        ? { ...v, multiplier }
        : v
    ));
  };

  // Discount Program management functions
  const addDiscountProgram = (programId: number) => {
    const program = discountProgramsData.find(p => p.id === programId);
    if (program && !discountPrograms.find(p => p.id === programId)) {
      setDiscountPrograms([...discountPrograms, program]);
    }
  };

  const removeDiscountProgram = (programId: number) => {
    setDiscountPrograms(discountPrograms.filter(p => p.id !== programId));
  };

  // Service columns (unused - kept for compatibility)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const serviceColumns = [
    {
      title: "Dịch vụ",
      dataIndex: "serviceName",
      key: "serviceName",
      render: (text: string, record: PriceTableService) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.serviceCategory}
          </Text>
        </div>
      ),
    },
    {
      title: "Giá gốc",
      dataIndex: "basePrice",
      key: "basePrice",
      render: (value: number, record: PriceTableService) => (
        <InputNumber
          value={value}
          onChange={(val) => updateServicePrice(record.serviceId, 'basePrice', val || 0)}
          formatter={(value) => formatCurrency(Number(value))}
          parser={(value) => Number(value!.replace(/[^\d]/g, ''))}
          style={{ width: 120 }}
        />
      ),
    },
    {
      title: "Giảm giá (%)",
      dataIndex: "discountPercentage",
      key: "discountPercentage",
      render: (value: number, record: PriceTableService) => (
        <InputNumber
          value={value}
          onChange={(val) => updateServicePrice(record.serviceId, 'discountPercentage', val || 0)}
          min={0}
          max={100}
          style={{ width: 80 }}
        />
      ),
    },
    {
      title: "Giá cuối",
      dataIndex: "finalPrice",
      key: "finalPrice",
      render: (value: number) => (
        <Text strong style={{ color: "#52c41a" }}>
          {formatCurrency(value)}
        </Text>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: unknown, record: PriceTableService) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeService(record.serviceId)}
        />
      ),
    },
  ];

  // Product columns (unused - kept for compatibility)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const productColumns = [
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      render: (text: string, record: PriceTableProduct) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.productCategory}
          </Text>
        </div>
      ),
    },
    {
      title: "Giá gốc",
      dataIndex: "basePrice",
      key: "basePrice",
      render: (value: number, record: PriceTableProduct) => (
        <InputNumber
          value={value}
          onChange={(val) => updateProductPrice(record.productId, 'basePrice', val || 0)}
          formatter={(value) => formatCurrency(Number(value))}
          parser={(value) => Number(value!.replace(/[^\d]/g, ''))}
          style={{ width: 120 }}
        />
      ),
    },
    {
      title: "Giảm giá (%)",
      dataIndex: "discountPercentage",
      key: "discountPercentage",
      render: (value: number, record: PriceTableProduct) => (
        <InputNumber
          value={value}
          onChange={(val) => updateProductPrice(record.productId, 'discountPercentage', val || 0)}
          min={0}
          max={100}
          style={{ width: 80 }}
        />
      ),
    },
    {
      title: "Giá cuối",
      dataIndex: "finalPrice",
      key: "finalPrice",
      render: (value: number) => (
        <Text strong style={{ color: "#52c41a" }}>
          {formatCurrency(value)}
        </Text>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: unknown, record: PriceTableProduct) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeProduct(record.productId)}
        />
      ),
    },
  ];

  // Service Package columns
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const servicePackageColumns = [
    {
      title: "Gói dịch vụ",
      dataIndex: "packageName",
      key: "packageName",
    },
    {
      title: "Giá gốc",
      dataIndex: "basePrice",
      key: "basePrice",
      render: (value: number, record: PriceTableServicePackage) => (
        <InputNumber
          value={value}
          onChange={(val) => updateServicePackagePrice(record.packageId, 'basePrice', val || 0)}
          formatter={(value) => formatCurrency(Number(value))}
          parser={(value) => Number(value!.replace(/[^\d]/g, ''))}
          style={{ width: 120 }}
        />
      ),
    },
    {
      title: "Giảm giá (%)",
      dataIndex: "discountPercentage",
      key: "discountPercentage",
      render: (value: number, record: PriceTableServicePackage) => (
        <InputNumber
          value={value}
          onChange={(val) => updateServicePackagePrice(record.packageId, 'discountPercentage', val || 0)}
          min={0}
          max={100}
          style={{ width: 80 }}
        />
      ),
    },
    {
      title: "Giá cuối",
      dataIndex: "finalPrice",
      key: "finalPrice",
      render: (value: number) => (
        <Text strong style={{ color: "#52c41a" }}>
          {formatCurrency(value)}
        </Text>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: unknown, record: PriceTableServicePackage) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeServicePackage(record.packageId)}
        />
      ),
    },
  ];

  // Vehicle Type columns
  const vehicleTypeColumns = [
    {
      title: "Loại xe",
      dataIndex: "vehicleTypeName",
      key: "vehicleTypeName",
      render: (text: string, record: VehicleTypePricing) => (
        <div>
          <Text strong>{text}</Text>
          {record.description && (
            <>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.description}
              </Text>
            </>
          )}
        </div>
      ),
    },
    {
      title: "Hệ số nhân",
      dataIndex: "multiplier",
      key: "multiplier",
      render: (value: number, record: VehicleTypePricing) => (
        <Select
          value={value}
          onChange={(val) => updateVehicleTypeMultiplier(record.vehicleTypeId, val)}
          style={{ width: 120 }}
        >
          {VEHICLE_TYPE_MULTIPLIERS.map(multiplier => (
            <Option key={multiplier.value} value={multiplier.value}>
              {multiplier.label}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: unknown, record: VehicleTypePricing) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeVehicleType(record.vehicleTypeId)}
        />
      ),
    },
  ];

  // Tabs items configuration
  const tabItems = [
    {
      key: "basic",
      label: "Thông tin cơ bản",
      children: (
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Tên bảng giá"
              rules={[{ required: true, message: "Vui lòng nhập tên bảng giá!" }]}
            >
              <Input placeholder="Nhập tên bảng giá" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="code"
              label="Mã bảng giá"
              rules={[{ required: true, message: "Vui lòng nhập mã bảng giá!" }]}
            >
              <Input placeholder="Nhập mã bảng giá" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="description"
              label="Mô tả"
            >
              <TextArea rows={3} placeholder="Nhập mô tả bảng giá" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="branchId"
              label="Chi nhánh áp dụng"
            >
              <Select placeholder="Chọn chi nhánh" allowClear>
                <Option value={undefined}>Toàn hệ thống</Option>
                {branchesData.map(branch => (
                  <Option key={branch.id} value={branch.id}>
                    {branch.name} ({branch.code})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="status"
              label="Trạng thái"
            >
              <Select>
                {PRICE_TABLE_STATUSES.map(status => (
                  <Option key={status.value} value={status.value}>
                    {status.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="isDefault"
              label="Bảng giá mặc định"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="effectiveDate"
              label="Ngày hiệu lực"
              rules={[{ required: true, message: "Vui lòng chọn ngày hiệu lực!" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="expiryDate"
              label="Ngày hết hạn"
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
    {
      key: "pricing",
      label: "Bảng giá",
      children: (
        <div>
          <Card title="Bảng giá theo loại xe" size="small" style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">
                Quản lý giá của các sản phẩm, dịch vụ và gói dịch vụ theo từng loại xe.
                Giá sẽ được tính dựa trên hệ số nhân của từng loại xe.
              </Text>
            </div>
            
            {/* Add Items Section */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <div>
                  <Text strong>Thêm dịch vụ:</Text>
                  <Select
                    placeholder="Chọn dịch vụ"
                    style={{ width: "100%", marginTop: 8 }}
                    onSelect={addService}
                    showSearch
                    filterOption={(input, option) =>
                      option?.children?.toString().toLowerCase().includes(input.toLowerCase()) ?? false
                    }
                  >
                    {servicesData
                      .filter(service => !services.find(s => s.serviceId === service.id))
                      .map(service => (
                        <Option key={service.id} value={service.id}>
                          {service.serviceName} - {formatCurrency(service.totalPrice)}
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
                    filterOption={(input, option) =>
                      option?.children?.toString().toLowerCase().includes(input.toLowerCase()) ?? false
                    }
                  >
                    {productsData
                      .filter(product => !products.find(p => p.productId === product.id))
                      .map(product => (
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
                    filterOption={(input, option) =>
                      option?.children?.toString().toLowerCase().includes(input.toLowerCase()) ?? false
                    }
                  >
                    {servicePackagesData
                      .filter(pkg => !servicePackages.find(p => p.packageId === pkg.id))
                      .map(pkg => (
                        <Option key={pkg.id} value={pkg.id}>
                          {pkg.packageName} - {formatCurrency(pkg.totalPrice)}
                        </Option>
                      ))}
                  </Select>
                </div>
              </Col>
            </Row>

            {/* Vehicle Types Management */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <div>
                  <Text strong>Thêm loại xe:</Text>
                  <Select
                    placeholder="Chọn loại xe"
                    style={{ width: "100%", marginTop: 8 }}
                    onSelect={addVehicleType}
                    showSearch
                    filterOption={(input, option) =>
                      option?.children?.toString().toLowerCase().includes(input.toLowerCase()) ?? false
                    }
                  >
                    {vehicleTypesData
                      .filter(vt => !vehicleTypes.find(v => v.vehicleTypeId === vt.id))
                      .map(vt => (
                        <Option key={vt.id} value={vt.id}>
                          {vt.typeName}
                        </Option>
                      ))}
                  </Select>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: "right", paddingTop: 32 }}>
                  <Text type="secondary">
                    Tổng: {services.length + products.length + servicePackages.length} mục • {vehicleTypes.length} loại xe
                  </Text>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Pricing Table */}
          {vehicleTypes.length > 0 && (services.length > 0 || products.length > 0 || servicePackages.length > 0) ? (
            <Card title="Bảng giá chi tiết" size="small">
              <Table
                dataSource={[
                  ...services.map(s => ({ ...s, type: 'service' as const })),
                  ...products.map(p => ({ ...p, type: 'product' as const })),
                  ...servicePackages.map(p => ({ ...p, type: 'package' as const }))
                ] as PricingTableRecord[]}
                columns={[
                  {
                    title: 'Sản phẩm/Dịch vụ',
                    dataIndex: 'name',
                    key: 'name',
                    width: 300,
                    render: (text: string, record: PricingTableRecord) => (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                          {record.type === 'service' && <FileTextOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
                          {record.type === 'product' && <TagOutlined style={{ color: '#52c41a', marginRight: 8 }} />}
                          {record.type === 'package' && <DollarOutlined style={{ color: '#722ed1', marginRight: 8 }} />}
                          <Text strong>
                            {record.type === 'service' ? record.serviceName :
                             record.type === 'product' ? record.productName :
                             record.type === 'package' ? record.packageName : text}
                          </Text>
                        </div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {record.type === 'service' ? record.serviceCategory : 
                           record.type === 'product' ? record.productCategory : 'Gói dịch vụ'}
                        </Text>
                      </div>
                    ),
                  },
                  ...vehicleTypes.map(vt => ({
                    title: vt.vehicleTypeName,
                    key: `price_${vt.id}`,
                    width: 150,
                    render: (value: unknown, record: PricingTableRecord) => {
                      const basePrice = record.finalPrice || record.basePrice;
                      const finalPrice = Math.round(basePrice * vt.multiplier);
                      
                      return (
                        <div style={{ textAlign: 'center' }}>
                          <Text strong style={{ color: '#1890ff' }}>
                            {formatCurrency(finalPrice)}
                          </Text>
                          {vt.multiplier !== 1 && (
                            <div>
                              <Text type="secondary" style={{ fontSize: 10 }}>
                                x{vt.multiplier}
                              </Text>
                            </div>
                          )}
                        </div>
                      );
                    },
                  })),
                  {
                    title: 'Thao tác',
                    key: 'action',
                    width: 100,
                    render: (value: unknown, record: PricingTableRecord) => (
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => {
                          if (record.type === 'service' && record.serviceId) removeService(record.serviceId);
                          else if (record.type === 'product' && record.productId) removeProduct(record.productId);
                          else if (record.type === 'package' && record.packageId) removeServicePackage(record.packageId);
                        }}
                      />
                    ),
                  }
                ]}
                rowKey={(record) => `${record.type}_${record.serviceId || record.productId || record.packageId}`}
                pagination={false}
                size="small"
                scroll={{ x: 'max-content' }}
              />
            </Card>
          ) : (
            <Empty
              description="Vui lòng thêm ít nhất một sản phẩm/dịch vụ và một loại xe để xem bảng giá"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}

          {/* Vehicle Types Management */}
          {vehicleTypes.length > 0 && (
            <Card title="Quản lý hệ số loại xe" size="small" style={{ marginTop: 16 }}>
              <Table
                dataSource={vehicleTypes}
                columns={vehicleTypeColumns}
                rowKey="vehicleTypeId"
                pagination={false}
                size="small"
              />
            </Card>
          )}
        </div>
      ),
    },
    {
      key: "discounts",
      label: "Chương trình giảm giá",
      children: (
        <Card title="Quản lý chương trình giảm giá" size="small">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div>
                <Text strong>Thêm chương trình giảm giá:</Text>
                <Select
                  placeholder="Chọn chương trình giảm giá"
                  style={{ width: "100%", marginTop: 8 }}
                  onSelect={addDiscountProgram}
                  showSearch
                  filterOption={(input, option) =>
                    option?.children?.toString().toLowerCase().includes(input.toLowerCase()) ?? false
                  }
                >
                  {discountProgramsData
                    .filter(program => !discountPrograms.find(p => p.id === program.id))
                    .map(program => (
                      <Option key={program.id} value={program.id}>
                        {program.name} - {program.type === 'percentage' ? `${program.value}%` : formatCurrency(program.value)}
                      </Option>
                    ))}
                </Select>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ textAlign: "right" }}>
                <Text type="secondary">
                  Đã chọn: {discountPrograms.length} chương trình
                </Text>
              </div>
            </Col>
          </Row>
          
          {discountPrograms.length > 0 ? (
            <div style={{ marginTop: 16 }}>
              {discountPrograms.map(program => (
                <Card key={program.id} size="small" style={{ marginBottom: 8 }}>
                  <Row gutter={[16, 16]} align="middle">
                    <Col span={12}>
                      <div>
                        <Text strong>{program.name}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {program.type === 'percentage' ? `${program.value}%` : formatCurrency(program.value)}
                        </Text>
                      </div>
                    </Col>
                    <Col span={8}>
                      <Tag color="blue">{APPLICABLE_TO_OPTIONS.find(opt => opt.value === program.applicableTo)?.label}</Tag>
                    </Col>
                    <Col span={4}>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeDiscountProgram(program.id)}
                      />
                    </Col>
                  </Row>
                </Card>
              ))}
            </div>
          ) : (
            <Empty
              description="Chưa có chương trình giảm giá nào được chọn"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ marginTop: 16 }}
            />
          )}
        </Card>
      ),
    },
  ];

  return (
    <Modal
      title={title}
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      width={1400}
      confirmLoading={loading}
      styles={{
        body: {
          maxHeight: "85vh",
          overflowY: "auto",
          overflowX: "hidden",
          padding: "16px 24px",
        },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: "active",
          isDefault: false,
        }}
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Form>
    </Modal>
  );
};

export default PriceTableEditModal;