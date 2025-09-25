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
  message,
  Row,
  Col,
  Card,
  Table,
  Popconfirm,
} from "antd";
import {
  EditOutlined,
  SaveOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { serviceStatuses } from "@/components/utils/data/services.data";
import { serviceTypesData } from "@/components/utils/data/service-types.data";
import { productsData } from "@/components/utils/data/products.data";
import formatCurrency from "@/components/utils/helper/currency.format.helper";

const { Option } = Select;
const { TextArea } = Input;

interface ServiceProduct {
  productId: number;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Service {
  id: number;
  serviceCode: string;
  serviceName: string;
  serviceTypeId: number;
  serviceTypeName: string;
  description: string;
  products: ServiceProduct[];
  laborCost: number;
  totalPrice: number;
  duration: number;
  status: string;
  features: string[];
  requirements: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface ServiceEditModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (data: Service) => void;
  editData?: Service | null;
}

const ServiceEditModal: React.FC<ServiceEditModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  editData,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [features, setFeatures] = useState<string[]>([]);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [products, setProducts] = useState<ServiceProduct[]>([]);
  const [laborCost, setLaborCost] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  useEffect(() => {
    if (visible && editData) {
      form.setFieldsValue({
        serviceCode: editData.serviceCode,
        serviceName: editData.serviceName,
        serviceTypeName: editData.serviceTypeName,
        description: editData.description,
        duration: editData.duration,
        status: editData.status,
        notes: editData.notes,
      });
      setFeatures(editData.features || []);
      setRequirements(editData.requirements || []);
      setProducts(editData.products || []);
      setLaborCost(editData.laborCost || 0);
      setTotalPrice(editData.totalPrice || 0);
    } else if (visible) {
      form.resetFields();
      setFeatures([]);
      setRequirements([]);
      setProducts([]);
      setLaborCost(0);
      setTotalPrice(0);
    }
  }, [visible, editData, form]);

  // Tính toán tổng giá khi products hoặc laborCost thay đổi
  useEffect(() => {
    const productsTotal = products.reduce((sum, product) => sum + product.totalPrice, 0);
    const newTotalPrice = productsTotal + laborCost;
    setTotalPrice(newTotalPrice);
  }, [products, laborCost]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const updatedData = {
        ...editData,
        ...values,
        serviceTypeId: serviceTypesData.find(type => type.serviceTypeName === values.serviceTypeName)?.id || 1,
        products,
        laborCost,
        totalPrice,
        features,
        requirements,
        updatedAt: new Date().toISOString(),
        createdAt: editData?.createdAt || new Date().toISOString(),
      };

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onSuccess(updatedData);
      message.success(editData ? "Cập nhật dịch vụ thành công!" : "Thêm dịch vụ thành công!");
      form.resetFields();
      setFeatures([]);
      setRequirements([]);
      setProducts([]);
      setLaborCost(0);
      setTotalPrice(0);
    } catch (error) {
      console.log("Form validation failed:", error);
      message.error("Vui lòng kiểm tra lại thông tin đã nhập!");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFeatures([]);
    setRequirements([]);
    setProducts([]);
    setLaborCost(0);
    setTotalPrice(0);
    onCancel();
  };

  const addFeature = () => {
    setFeatures([...features, ""]);
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const removeFeature = (index: number) => {
    const newFeatures = features.filter((_, i) => i !== index);
    setFeatures(newFeatures);
  };

  const addRequirement = () => {
    setRequirements([...requirements, ""]);
  };

  const updateRequirement = (index: number, value: string) => {
    const newRequirements = [...requirements];
    newRequirements[index] = value;
    setRequirements(newRequirements);
  };

  const removeRequirement = (index: number) => {
    const newRequirements = requirements.filter((_, i) => i !== index);
    setRequirements(newRequirements);
  };

  // Product management functions
  const addProduct = () => {
    const newProduct: ServiceProduct = {
      productId: 0,
      productCode: "",
      productName: "",
      quantity: 0,
      unitPrice: 0,
      totalPrice: 0,
    };
    setProducts([...products, newProduct]);
  };

  const updateProduct = (index: number, field: keyof ServiceProduct, value: any) => {
    const newProducts = [...products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    
    // Nếu cập nhật productId, tự động điền thông tin sản phẩm
    if (field === 'productId' && value) {
      const selectedProduct = productsData.find(p => p.id === value);
      if (selectedProduct) {
        newProducts[index] = {
          ...newProducts[index],
          productCode: selectedProduct.productCode,
          productName: selectedProduct.name,
          unitPrice: selectedProduct.price,
          totalPrice: newProducts[index].quantity * selectedProduct.price,
        };
      }
    }
    
    // Nếu cập nhật quantity, tính lại totalPrice
    if (field === 'quantity') {
      newProducts[index].totalPrice = value * newProducts[index].unitPrice;
    }
    
    setProducts(newProducts);
  };

  const removeProduct = (index: number) => {
    const newProducts = products.filter((_, i) => i !== index);
    setProducts(newProducts);
  };

  return (
    <Modal
      title={
        <Space>
          {editData ? <EditOutlined /> : <PlusOutlined />}
          {editData ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ"}
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      width={1200}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
          icon={<SaveOutlined />}
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
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Mã dịch vụ"
              name="serviceCode"
              rules={[
                { required: true, message: "Vui lòng nhập mã dịch vụ!" },
                { max: 20, message: "Mã không được quá 20 ký tự!" },
              ]}
            >
              <Input placeholder="Nhập mã dịch vụ" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Tên dịch vụ"
              name="serviceName"
              rules={[
                { required: true, message: "Vui lòng nhập tên dịch vụ!" },
                { max: 100, message: "Tên không được quá 100 ký tự!" },
              ]}
            >
              <Input placeholder="Nhập tên dịch vụ" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Loại dịch vụ"
              name="serviceTypeName"
              rules={[{ required: true, message: "Vui lòng chọn loại dịch vụ!" }]}
            >
              <Select placeholder="Chọn loại dịch vụ">
                {serviceTypesData.map((type) => (
                  <Option key={type.serviceTypeName} value={type.serviceTypeName}>
                    {type.serviceTypeName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Trạng thái"
              name="status"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
            >
              <Select placeholder="Chọn trạng thái">
                {serviceStatuses.map((status) => (
                  <Option key={status.value} value={status.value}>
                    {status.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Mô tả"
          name="description"
          rules={[
            { required: true, message: "Vui lòng nhập mô tả!" },
            { max: 500, message: "Mô tả không được quá 500 ký tự!" },
          ]}
        >
          <TextArea
            rows={3}
            placeholder="Nhập mô tả dịch vụ"
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item
              label="Chi phí lao động (VNĐ)"
              rules={[
                { required: true, message: "Vui lòng nhập chi phí lao động!" },
                { type: "number", min: 0, message: "Chi phí phải lớn hơn 0!" },
              ]}
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                value={laborCost}
                onChange={(value) => setLaborCost(value || 0)}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ''))}
                placeholder="Nhập chi phí lao động"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="Tổng giá dịch vụ (VNĐ)"
            >
              <InputNumber
                style={{ width: "100%" }}
                value={totalPrice}
                disabled
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ''))}
                placeholder="Tự động tính toán"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="Thời gian thực hiện (phút)"
              name="duration"
              rules={[
                { required: true, message: "Vui lòng nhập thời gian thực hiện!" },
                { type: "number", min: 1, message: "Thời gian phải lớn hơn 0!" },
              ]}
            >
              <InputNumber
                min={1}
                style={{ width: "100%" }}
                placeholder="Nhập thời gian (phút)"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Ghi chú"
          name="notes"
          rules={[{ max: 1000, message: "Ghi chú không được quá 1000 ký tự!" }]}
        >
          <TextArea
            rows={2}
            placeholder="Nhập ghi chú (tùy chọn)"
            maxLength={1000}
            showCount
          />
        </Form.Item>

        {/* Quản lý sản phẩm */}
        <Card
          title="Sản phẩm sử dụng"
          size="small"
          extra={
            <Button
              type="dashed"
              size="small"
              icon={<PlusOutlined />}
              onClick={addProduct}
            >
              Thêm sản phẩm
            </Button>
          }
        >
          {products.length > 0 ? (
            <Table
              dataSource={products}
              pagination={false}
              size="small"
              columns={[
                {
                  title: "Sản phẩm",
                  key: "product",
                  width: 200,
                  render: (_, record, index) => (
                    <Select
                      placeholder="Chọn sản phẩm"
                      value={record.productId || undefined}
                      onChange={(value) => updateProduct(index, 'productId', value)}
                      style={{ width: "100%" }}
                    >
                      {productsData.map((product) => (
                        <Option key={product.id} value={product.id}>
                          {product.name} - {formatCurrency(product.price)}
                        </Option>
                      ))}
                    </Select>
                  ),
                },
                {
                  title: "Số lượng",
                  key: "quantity",
                  width: 100,
                  render: (_, record, index) => (
                    <InputNumber
                      min={0}
                      step={0.1}
                      value={record.quantity}
                      onChange={(value) => updateProduct(index, 'quantity', value || 0)}
                      style={{ width: "100%" }}
                    />
                  ),
                },
                {
                  title: "Đơn giá",
                  key: "unitPrice",
                  width: 120,
                  render: (_, record) => (
                    <span>{formatCurrency(record.unitPrice)}</span>
                  ),
                },
                {
                  title: "Thành tiền",
                  key: "totalPrice",
                  width: 120,
                  render: (_, record) => (
                    <span style={{ fontWeight: 500, color: "#52c41a" }}>
                      {formatCurrency(record.totalPrice)}
                    </span>
                  ),
                },
                {
                  title: "Thao tác",
                  key: "actions",
                  width: 80,
                  render: (_, record, index) => (
                    <Popconfirm
                      title="Xóa sản phẩm này?"
                      onConfirm={() => removeProduct(index)}
                      okText="Xóa"
                      cancelText="Hủy"
                    >
                      <Button type="text" danger size="small">
                        Xóa
                      </Button>
                    </Popconfirm>
                  ),
                },
              ]}
            />
          ) : (
            <div style={{ textAlign: "center", color: "#999", padding: "20px" }}>
              Chưa có sản phẩm nào
            </div>
          )}
          
          {/* Tổng kết */}
          {products.length > 0 && (
            <div style={{ marginTop: 16, padding: 12, backgroundColor: "#f5f5f5", borderRadius: 6 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <div style={{ fontSize: 12, color: "#666" }}>Tổng sản phẩm:</div>
                  <div style={{ fontWeight: 500, color: "#1890ff" }}>
                    {formatCurrency(products.reduce((sum, p) => sum + p.totalPrice, 0))}
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ fontSize: 12, color: "#666" }}>Chi phí lao động:</div>
                  <div style={{ fontWeight: 500, color: "#fa8c16" }}>
                    {formatCurrency(laborCost)}
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ fontSize: 12, color: "#666" }}>Tổng giá dịch vụ:</div>
                  <div style={{ fontWeight: 500, color: "#52c41a", fontSize: 16 }}>
                    {formatCurrency(totalPrice)}
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Card>

        {/* Đặc điểm dịch vụ */}
        <Card
          title="Đặc điểm dịch vụ"
          size="small"
          extra={
            <Button
              type="dashed"
              size="small"
              icon={<PlusOutlined />}
              onClick={addFeature}
            >
              Thêm đặc điểm
            </Button>
          }
        >
          {features.map((feature, index) => (
            <Row key={index} gutter={8} style={{ marginBottom: 8 }}>
              <Col span={20}>
                <Input
                  placeholder="Nhập đặc điểm"
                  value={feature}
                  onChange={(e) => updateFeature(index, e.target.value)}
                />
              </Col>
              <Col span={4}>
                <Button
                  type="text"
                  danger
                  onClick={() => removeFeature(index)}
                >
                  Xóa
                </Button>
              </Col>
            </Row>
          ))}
          {features.length === 0 && (
            <div style={{ textAlign: "center", color: "#999", padding: "20px" }}>
              Chưa có đặc điểm nào
            </div>
          )}
        </Card>

        {/* Yêu cầu */}
        <Card
          title="Yêu cầu"
          size="small"
          extra={
            <Button
              type="dashed"
              size="small"
              icon={<PlusOutlined />}
              onClick={addRequirement}
            >
              Thêm yêu cầu
            </Button>
          }
        >
          {requirements.map((requirement, index) => (
            <Row key={index} gutter={8} style={{ marginBottom: 8 }}>
              <Col span={20}>
                <Input
                  placeholder="Nhập yêu cầu"
                  value={requirement}
                  onChange={(e) => updateRequirement(index, e.target.value)}
                />
              </Col>
              <Col span={4}>
                <Button
                  type="text"
                  danger
                  onClick={() => removeRequirement(index)}
                >
                  Xóa
                </Button>
              </Col>
            </Row>
          ))}
          {requirements.length === 0 && (
            <div style={{ textAlign: "center", color: "#999", padding: "20px" }}>
              Chưa có yêu cầu nào
            </div>
          )}
        </Card>
      </Form>
    </Modal>
  );
};

export default ServiceEditModal;
