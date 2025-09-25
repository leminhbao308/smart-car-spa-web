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
} from "antd";
import {
  EditOutlined,
  SaveOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { productStatuses, unitsData } from "@/components/utils/data/products.data";
import { productCategoriesData } from "@/components/utils/data/product-categories.data";

const { Option } = Select;
const { TextArea } = Input;

interface Product {
  id: number;
  productCode: string;
  name: string;
  categoryId: number;
  categoryName: string;
  brand: string;
  unit: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  maxStock: number;
  description: string;
  specifications: {
    [key: string]: string;
  };
  supplierId: number;
  supplierName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductEditModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (data: Product) => void;
  editData?: Product | null;
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  editData,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [specifications, setSpecifications] = useState<{ [key: string]: string }>({});
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);

  useEffect(() => {
    if (visible && editData) {
      const profitMargin = ((editData.price - editData.cost) / editData.cost) * 100;
      form.setFieldsValue({
        productCode: editData.productCode,
        name: editData.name,
        categoryName: editData.categoryName,
        brand: editData.brand,
        unit: editData.unit,
        cost: editData.cost,
        profitMargin: profitMargin.toFixed(1),
        stock: editData.stock,
        minStock: editData.minStock,
        maxStock: editData.maxStock,
        description: editData.description,
        status: editData.status,
      });
      setCalculatedPrice(editData.price);
      setSpecifications(editData.specifications || {});
    } else if (visible) {
      form.resetFields();
      setSpecifications({});
      setCalculatedPrice(0);
    }
  }, [visible, editData, form]);

  const calculatePrice = (cost: number, profitMargin: number) => {
    return cost * (1 + profitMargin / 100);
  };

  const handleCostChange = (value: number | null) => {
    const cost = value || 0;
    const profitMargin = form.getFieldValue('profitMargin') || 0;
    const newPrice = calculatePrice(cost, profitMargin);
    setCalculatedPrice(newPrice);
  };

  const handleProfitMarginChange = (value: number | null) => {
    const profitMargin = value || 0;
    const cost = form.getFieldValue('cost') || 0;
    const newPrice = calculatePrice(cost, profitMargin);
    setCalculatedPrice(newPrice);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const updatedData = {
        ...editData,
        ...values,
        price: calculatedPrice,
        categoryId: productCategoriesData.find(cat => cat.categoryName === values.categoryName)?.id || 1,
        specifications,
        supplierId: editData?.supplierId || 1,
        supplierName: editData?.supplierName || "Nhà cung cấp mặc định",
        updatedAt: new Date().toISOString(),
        createdAt: editData?.createdAt || new Date().toISOString(),
      };

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onSuccess(updatedData);
      message.success(editData ? "Cập nhật sản phẩm thành công!" : "Thêm sản phẩm thành công!");
      form.resetFields();
      setSpecifications({});
      setCalculatedPrice(0);
    } catch (error) {
      console.log("Form validation failed:", error);
      message.error("Vui lòng kiểm tra lại thông tin đã nhập!");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSpecifications({});
    setCalculatedPrice(0);
    onCancel();
  };

  const addSpecification = () => {
    const key = `spec_${Object.keys(specifications).length + 1}`;
    setSpecifications({ ...specifications, [key]: "" });
  };

  const updateSpecification = (key: string, value: string) => {
    setSpecifications({ ...specifications, [key]: value });
  };

  const removeSpecification = (key: string) => {
    const newSpecs = { ...specifications };
    delete newSpecs[key];
    setSpecifications(newSpecs);
  };

  return (
    <Modal
      title={
        <Space>
          {editData ? <EditOutlined /> : <PlusOutlined />}
          {editData ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      width={900}
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
              label="Mã sản phẩm"
              name="productCode"
              rules={[
                { required: true, message: "Vui lòng nhập mã sản phẩm!" },
                { max: 20, message: "Mã không được quá 20 ký tự!" },
              ]}
            >
              <Input placeholder="Nhập mã sản phẩm" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Tên sản phẩm"
              name="name"
              rules={[
                { required: true, message: "Vui lòng nhập tên sản phẩm!" },
                { max: 100, message: "Tên không được quá 100 ký tự!" },
              ]}
            >
              <Input placeholder="Nhập tên sản phẩm" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Thương hiệu"
              name="brand"
              rules={[
                { required: true, message: "Vui lòng nhập thương hiệu!" },
                { max: 50, message: "Thương hiệu không được quá 50 ký tự!" },
              ]}
            >
              <Input placeholder="Nhập thương hiệu" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Loại sản phẩm"
              name="categoryName"
              rules={[{ required: true, message: "Vui lòng chọn loại sản phẩm!" }]}
            >
              <Select placeholder="Chọn loại sản phẩm">
                {productCategoriesData.map((category) => (
                  <Option key={category.categoryName} value={category.categoryName}>
                    {category.categoryName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item
              label="Đơn vị"
              name="unit"
              rules={[{ required: true, message: "Vui lòng chọn đơn vị!" }]}
            >
              <Select placeholder="Chọn đơn vị">
                {unitsData.map((unit) => (
                  <Option key={unit.value} value={unit.value}>
                    {unit.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="Phần trăm lợi nhuận (%)"
              name="profitMargin"
              rules={[
                { required: true, message: "Vui lòng nhập phần trăm lợi nhuận!" },
                { type: "number", min: 0, message: "Phần trăm lợi nhuận phải lớn hơn hoặc bằng 0!" },
              ]}
            >
              <InputNumber
                min={0}
                max={1000}
                style={{ width: "100%" }}
                placeholder="Nhập % lợi nhuận"
                onChange={handleProfitMarginChange}
                suffix="%"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="Giá nhập (VNĐ)"
              name="cost"
              rules={[
                { required: true, message: "Vui lòng nhập giá nhập!" },
                { type: "number", min: 0, message: "Giá phải lớn hơn 0!" },
              ]}
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ''))}
                placeholder="Nhập giá nhập"
                onChange={handleCostChange}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Hiển thị giá bán được tính toán */}
        {calculatedPrice > 0 && (
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={24}>
              <Card size="small" style={{ backgroundColor: "#f6ffed", border: "1px solid #b7eb8f" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 16, color: "#52c41a", fontWeight: 500 }}>
                    Giá bán được tính toán: {calculatedPrice.toLocaleString('vi-VN')} VNĐ
                  </div>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                    (Giá nhập + {form.getFieldValue('profitMargin') || 0}% lợi nhuận)
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        )}

        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item
              label="Tồn kho"
              name="stock"
              rules={[
                { required: true, message: "Vui lòng nhập tồn kho!" },
                { type: "number", min: 0, message: "Tồn kho phải lớn hơn hoặc bằng 0!" },
              ]}
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                placeholder="Nhập tồn kho"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="Tồn kho tối thiểu"
              name="minStock"
              rules={[
                { required: true, message: "Vui lòng nhập tồn kho tối thiểu!" },
                { type: "number", min: 0, message: "Tồn kho tối thiểu phải lớn hơn hoặc bằng 0!" },
              ]}
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                placeholder="Nhập tồn kho tối thiểu"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="Tồn kho tối đa"
              name="maxStock"
              rules={[
                { required: true, message: "Vui lòng nhập tồn kho tối đa!" },
                { type: "number", min: 0, message: "Tồn kho tối đa phải lớn hơn hoặc bằng 0!" },
              ]}
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                placeholder="Nhập tồn kho tối đa"
              />
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
            placeholder="Nhập mô tả sản phẩm"
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item
          label="Trạng thái"
          name="status"
          rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
        >
          <Select placeholder="Chọn trạng thái">
            {productStatuses.map((status) => (
              <Option key={status.value} value={status.value}>
                {status.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Thông số kỹ thuật */}
        <Card
          title="Thông số kỹ thuật"
          size="small"
          extra={
            <Button
              type="dashed"
              size="small"
              icon={<PlusOutlined />}
              onClick={addSpecification}
            >
              Thêm thông số
            </Button>
          }
        >
          {Object.entries(specifications).map(([key, value]) => (
            <Row key={key} gutter={8} style={{ marginBottom: 8 }}>
              <Col span={8}>
                <Input
                  placeholder="Tên thông số"
                  value={key}
                  onChange={(e) => {
                    const newSpecs = { ...specifications };
                    delete newSpecs[key];
                    newSpecs[e.target.value] = value;
                    setSpecifications(newSpecs);
                  }}
                />
              </Col>
              <Col span={14}>
                <Input
                  placeholder="Giá trị"
                  value={value}
                  onChange={(e) => updateSpecification(key, e.target.value)}
                />
              </Col>
              <Col span={2}>
                <Button
                  type="text"
                  danger
                  onClick={() => removeSpecification(key)}
                >
                  Xóa
                </Button>
              </Col>
            </Row>
          ))}
          {Object.keys(specifications).length === 0 && (
            <div style={{ textAlign: "center", color: "#999", padding: "20px" }}>
              Chưa có thông số kỹ thuật nào
            </div>
          )}
        </Card>
      </Form>
    </Modal>
  );
};

export default ProductEditModal;
