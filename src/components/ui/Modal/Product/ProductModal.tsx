"use client";
import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Select,
  Button,
  Space,
  Row,
  Col,
  Card,
  Switch,
  Typography,
  Avatar} from "antd";
import { MemoizedInput, MemoizedTextArea, MemoizedInputNumber } from "@/components/ui/MemoizedComponents";
import ProductAttributeManager from "@/components/ui/ProductAttributeManager/ProductAttributeManager";
import {
  EditOutlined,
  SaveOutlined,
  PlusOutlined,
  DollarOutlined,
  InfoCircleOutlined,
  InboxOutlined} from "@ant-design/icons";
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  CreateProductAttributeValueRequest} from "@/lib/api/types/product.types";
import {
  useCreateProduct,
  useUpdateProduct} from "@/lib/api/hooks/useProducts";
import { useProductTypes } from "@/lib/api/hooks/useProductTypes";
import { useSuppliers } from "@/lib/api/hooks/useSuppliers";
import { useUpdateAllProductAttributeValues } from "@/lib/api/hooks/useProductAttributeValues";

const { Option } = Select;
const { Title, Text } = Typography;

interface ProductModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  editData?: Product | null;
}

const ProductModal: React.FC<ProductModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  editData}) => {
  const [form] = Form.useForm();
  const [attributeValues, setAttributeValues] = React.useState<CreateProductAttributeValueRequest[]>([]);

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const updateAllAttributesMutation = useUpdateAllProductAttributeValues();
  const { data: productTypesData } = useProductTypes({
    filters: {
      is_active: true
    }
  });
  const { data: suppliersData } = useSuppliers({});
  const suppliers = suppliersData?.data?.content || [];

  const productTypes = productTypesData?.data?.content || [];

  const loading =
    createProductMutation.isPending || 
    updateProductMutation.isPending || 
    updateAllAttributesMutation.isPending;

  useEffect(() => {
    if (visible && editData) {
      form.setFieldsValue({
        productName: editData.product_name,
        productUrl: editData.product_url,
        productTypeId: editData.product_type_id,
        brand: editData.brand,
        model: editData.model,
        sku: editData.sku,
        barcode: editData.barcode,
        peakPrice: editData.peak_price,
        isFeatured: editData.is_featured,
        supplierId: editData.supplier_id,
        description: editData.description,
        unitOfMeasure: editData.unit_of_measure,
        is_active: editData.is_active});
      
      // Initialize attribute values for editing
      if (editData.attribute_values && editData.attribute_values.length > 0) {
        const initialAttributes = editData.attribute_values.map(attr => ({
          product_id: editData.product_id,
          attribute_id: attr.attribute_id,
          value_text: attr.value_text,
          value_number: attr.value_number,
        }));
        setAttributeValues(initialAttributes);
      } else {
        setAttributeValues([]);
      }
    } else if (visible) {
      form.resetFields();
      setAttributeValues([]);
    }
  }, [visible, editData, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editData) {
        // Update existing product - transform to API format
        const updateData: UpdateProductRequest = {
          product_name: values.productName,
          product_url: values.productUrl,
          product_type_id: values.productTypeId,
          description: values.description,
          unit_of_measure: values.unitOfMeasure,
          brand: values.brand,
          model: values.model,
          sku: values.sku,
          barcode: values.barcode,
          supplier_id: values.supplierId,
          is_featured: values.isFeatured,
          is_active: values.is_active};

        // Update product first
        updateProductMutation.mutate({
          productId: editData.product_id,
          data: updateData
        }, {
          onSuccess: () => {
            // Then update attributes if there are any
            if (attributeValues.length > 0) {
              updateAllAttributesMutation.mutate({
                productId: editData.product_id,
                attributeValues: attributeValues
              }, {
                onSuccess: () => {
                  onSuccess();
                },
                onError: (error) => {
                  console.error("Failed to update attributes:", error);
                  onSuccess(); // Still call onSuccess for product update
                }
              });
            } else {
              onSuccess();
            }
          }
        });
      } else {
        // Create new product - transform to API format
        const productData: CreateProductRequest = {
          product_name: values.productName,
          product_url: values.productUrl,
          product_type_id: values.productTypeId,
          description: values.description,
          unit_of_measure: values.unitOfMeasure,
          brand: values.brand,
          model: values.model,
          sku: values.sku,
          barcode: values.barcode,
          supplier_id: values.supplierId,
          is_featured: values.isFeatured,
          is_active: values.is_active};
        
        createProductMutation.mutate(productData, {
          onSuccess: (newProduct) => {
            // After creating product, create attributes if there are any
            if (attributeValues.length > 0 && newProduct?.product_id) {
              const attributesWithProductId = attributeValues.map(attr => ({
                ...attr,
                product_id: newProduct.product_id
              }));
              
              updateAllAttributesMutation.mutate({
                productId: newProduct.product_id,
                attributeValues: attributesWithProductId
              }, {
                onSuccess: () => {
                  onSuccess();
                },
                onError: (error) => {
                  console.error("Failed to create attributes:", error);
                  onSuccess(); // Still call onSuccess for product creation
                }
              });
            } else {
              onSuccess();
            }
          }
        });
      }
    } catch (error) {
      console.log("Form validation failed:", error);
    }
  };

  const handleAttributeChange = (newAttributeValues: CreateProductAttributeValueRequest[]) => {
    setAttributeValues(newAttributeValues);
  };

  const handleCancel = () => {
    form.resetFields();
    setAttributeValues([]);
    onCancel();
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar
            size={40}
            icon={editData ? <EditOutlined /> : <PlusOutlined />}
            style={{ 
              backgroundColor: editData ? "#1890ff" : "#52c41a",
              color: "white"
            }}
          />
          <div>
            <Title level={4} style={{ margin: 0, color: "#262626" }}>
              {editData ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {editData ? "Cập nhật thông tin sản phẩm" : "Nhập thông tin sản phẩm mới"}
            </Text>
          </div>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      width={1200}
      footer={[
        <Button key="cancel" onClick={handleCancel} size="large">
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
          icon={<SaveOutlined />}
          size="large"
          style={{
            background: editData ? "#1890ff" : "#52c41a",
            borderColor: editData ? "#1890ff" : "#52c41a"}}
        >
          {editData ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
        </Button>,
      ]}
      styles={{
        body: { 
          padding: "24px",
          maxHeight: "80vh",
          overflowY: "auto"
        }
      }}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        scrollToFirstError
      >
        {/* Thông tin cơ bản */}
        <Card
          title={
            <Space>
              <InfoCircleOutlined style={{ color: "#1890ff" }} />
              <span>Thông tin cơ bản</span>
            </Space>
          }
          size="small"
          style={{ 
            marginBottom: 16,
            border: "1px solid #f0f0f0",
            borderRadius: 8
          }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Tên sản phẩm"
                name="productName"
                rules={[
                  { required: true, message: "Vui lòng nhập tên sản phẩm!" },
                  { max: 100, message: "Tên không được quá 100 ký tự!" },
                ]}
              >
                <MemoizedInput placeholder="Nhập tên sản phẩm" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="URL sản phẩm"
                name="productUrl"
                rules={[
                  { required: true, message: "Vui lòng nhập URL sản phẩm!" },
                  { max: 100, message: "URL không được quá 100 ký tự!" },
                ]}
              >
                <MemoizedInput placeholder="Nhập URL sản phẩm" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                label="SKU"
                name="sku"
                rules={[
                  { required: true, message: "Vui lòng nhập SKU!" },
                  { max: 50, message: "SKU không được quá 50 ký tự!" },
                ]}
              >
                <MemoizedInput placeholder="Nhập SKU" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Barcode"
                name="barcode"
                rules={[
                  { required: true, message: "Vui lòng nhập barcode!" },
                  { max: 50, message: "Barcode không được quá 50 ký tự!" },
                ]}
              >
                <MemoizedInput placeholder="Nhập barcode" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Loại sản phẩm"
                name="productTypeId"
                rules={[{ required: true, message: "Vui lòng chọn loại sản phẩm!" }]}
              >
                <Select
                  placeholder="Tìm kiếm và chọn loại sản phẩm"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    String(option?.children || '').toLowerCase().includes(input.toLowerCase())
                  }
                  style={{ width: "100%" }}
                >
                  {productTypes?.map((productType: { product_type_id: string; product_type_name: string }) => (
                    <Option
                      key={productType.product_type_id}
                      value={productType.product_type_id}
                    >
                      {productType.product_type_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Thương hiệu"
                name="brand"
                rules={[
                  { required: true, message: "Vui lòng nhập thương hiệu!" },
                  { max: 50, message: "Thương hiệu không được quá 50 ký tự!" },
                ]}
              >
                <MemoizedInput placeholder="Nhập thương hiệu" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Model"
                name="model"
                rules={[
                  { required: true, message: "Vui lòng nhập model!" },
                  { max: 50, message: "Model không được quá 50 ký tự!" },
                ]}
              >
                <MemoizedInput placeholder="Nhập model" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Đơn vị"
                name="unitOfMeasure"
                rules={[{ required: true, message: "Vui lòng nhập đơn vị!" }]}
              >
                <MemoizedInput placeholder="Nhập đơn vị (cái, lít, kg...)" />
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
            <MemoizedTextArea
              rows={3}
              placeholder="Nhập mô tả sản phẩm"
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Card>

        {/* Thông tin giá cả */}
        <Card
          title={
            <Space>
              <DollarOutlined style={{ color: "#52c41a" }} />
              <span>Thông tin giá cả</span>
            </Space>
          }
          size="small"
          style={{ 
            marginBottom: 16,
            border: "1px solid #f0f0f0",
            borderRadius: 8
          }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Giá cao nhất (VNĐ)"
                name="peakPrice"
                rules={[
                  { type: "number", min: 0, message: "Giá phải lớn hơn hoặc bằng 0!" },
                ]}
              >
                <MemoizedInputNumber
                  min={0}
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  placeholder="Nhập giá cao nhất"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Thông tin bổ sung */}
        <Card
          title={
            <Space>
              <InboxOutlined style={{ color: "#fa8c16" }} />
              <span>Thông tin bổ sung</span>
            </Space>
          }
          size="small"
          style={{ 
            marginBottom: 16,
            border: "1px solid #f0f0f0",
            borderRadius: 8
          }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Nhà cung cấp"
                name="supplierId"
                rules={[
                  { required: true, message: "Vui lòng chọn nhà cung cấp!" },
                ]}
              >
                <Select
                  placeholder="Tìm kiếm và chọn nhà cung cấp"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    String(option?.children || '').toLowerCase().includes(input.toLowerCase())
                  }
                  style={{ width: "100%" }}
                >
                  {suppliers?.map((supplier: { supplier_id: string; supplier_name: string }) => (
                    <Option
                      key={supplier.supplier_id}
                      value={supplier.supplier_id}
                    >
                      {supplier.supplier_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Sản phẩm nổi bật"
                name="isFeatured"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Trạng thái hoạt động"
                name="is_active"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Product Attribute Manager */}
        <ProductAttributeManager
          productId={editData?.product_id}
          initialAttributeValues={editData?.attribute_values || []}
          onChange={handleAttributeChange}
          disabled={loading}
        />
      </Form>
    </Modal>
  );
};

export default ProductModal;

