"use client";
import React, { useState, useEffect } from "react";
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
import {
  EditOutlined,
  SaveOutlined,
  PlusOutlined,
  DollarOutlined,
  InfoCircleOutlined,
  InboxOutlined,
  TagOutlined,
  PictureOutlined} from "@ant-design/icons";
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest} from "@/lib/api/types/product.types";
import {
  useCreateProduct,
  useUpdateProduct} from "@/lib/api/hooks/useProducts";
import { useCategories } from "@/lib/api/hooks/useCategory";
import { useSuppliers } from "@/lib/api/hooks/useSuppliers";

const { Option } = Select;
const { Title, Text } = Typography;

interface ProductEditModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  editData?: Product | null;
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  editData}) => {
  const [form] = Form.useForm();
  const [specifications, setSpecifications] = useState<{
    [key: string]: string;
  }>({});
  const [dimensions, setDimensions] = useState<{ [key: string]: string }>({});
  const [tags, setTags] = useState<{ [key: string]: string }>({});
  const [imageUrls, setImageUrls] = useState<{ [key: string]: string }>({});

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const { data: categoriesData } = useCategories();
  const { suppliers } = useSuppliers({});

  const categories = categoriesData?.data?.content || [];

  const loading =
    createProductMutation.isPending || updateProductMutation.isPending;

  useEffect(() => {
    if (visible && editData) {
      form.setFieldsValue({
        productName: editData.productName,
        productUrl: editData.productUrl,
        categoryId: editData.categoryId,
        brand: editData.brand,
        model: editData.model,
        sku: editData.sku,
        barcode: editData.barcode,
        costPrice: editData.costPrice,
        sellingPrice: editData.sellingPrice,
        minStockLevel: editData.minStockLevel,
        maxStockLevel: editData.maxStockLevel,
        weight: editData.weight,
        warrantyPeriodMonths: editData.warrantyPeriodMonths,
        isFeatured: editData.isFeatured,
        supplierId: editData.supplierId,
        description: editData.description,
        unitOfMeasure: editData.unitOfMeasure,
        is_active: editData.is_active});
      setSpecifications(editData.specifications || {});
      setDimensions(editData.dimensions ? Object.fromEntries(
        Object.entries(editData.dimensions).filter(([, value]) => value !== undefined)
      ) as { [key: string]: string } : {});
      setTags(editData.tags || {});
      setImageUrls(editData.imageUrls ? Object.fromEntries(
        Object.entries(editData.imageUrls).filter(([, value]) => value !== undefined)
      ) as { [key: string]: string } : {});
    } else if (visible) {
      form.resetFields();
      setSpecifications({});
      setDimensions({});
      setTags({});
      setImageUrls({});
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
          category_id: values.categoryId,
          description: values.description,
          unit_of_measure: values.unitOfMeasure,
          brand: values.brand,
          model: values.model,
          specifications: filterEmptyValues(specifications),
          sku: values.sku,
          barcode: values.barcode,
          cost_price: values.costPrice,
          selling_price: values.sellingPrice,
          min_stock_level: values.minStockLevel,
          max_stock_level: values.maxStockLevel,
          weight: values.weight,
          dimensions: filterEmptyValues(dimensions),
          warranty_period_months: values.warrantyPeriodMonths,
          image_urls: filterEmptyValues(imageUrls),
          tags: filterEmptyValues(tags),
          supplier_id: values.supplierId,
          is_featured: values.isFeatured,
          is_active: values.is_active};

        updateProductMutation.mutate({
          productId: editData.productId,
          data: updateData});
      } else {
        // Create new product - transform to API format
        const productData: CreateProductRequest = {
          product_name: values.productName,
          product_url: values.productUrl,
          category_id: values.categoryId,
          description: values.description,
          unit_of_measure: values.unitOfMeasure,
          brand: values.brand,
          model: values.model,
          specifications: filterEmptyValues(specifications),
          sku: values.sku,
          barcode: values.barcode,
          cost_price: values.costPrice,
          selling_price: values.sellingPrice,
          min_stock_level: values.minStockLevel,
          max_stock_level: values.maxStockLevel,
          weight: values.weight,
          dimensions: filterEmptyValues(dimensions),
          warranty_period_months: values.warrantyPeriodMonths,
          image_urls: filterEmptyValues(imageUrls),
          tags: filterEmptyValues(tags),
          supplier_id: values.supplierId,
          is_featured: values.isFeatured,
          is_active: values.is_active};
        createProductMutation.mutate(productData);
      }

      onSuccess();
    } catch (error) {
      console.log("Form validation failed:", error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSpecifications({});
    setDimensions({});
    setTags({});
    setImageUrls({});
    onCancel();
  };

  // Helper functions for fixed fields
  const updateSpecification = (key: string, value: string) => {
    setSpecifications({ ...specifications, [key]: value });
  };

  const updateDimension = (key: string, value: string) => {
    setDimensions({ ...dimensions, [key]: value });
  };

  const updateTag = (key: string, value: string) => {
    setTags({ ...tags, [key]: value });
  };

  const updateImageUrl = (key: string, value: string) => {
    setImageUrls({ ...imageUrls, [key]: value });
  };

  // Filter out empty values before submitting
  const filterEmptyValues = (obj: { [key: string]: string }) => {
    return Object.fromEntries(
      Object.entries(obj).filter(([, value]) => value && value.trim() !== "")
    );
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
                label="Danh mục"
                name="categoryId"
                rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
              >
                <Select
                  placeholder="Tìm kiếm và chọn danh mục"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    String(option?.children || '').toLowerCase().includes(input.toLowerCase())
                  }
                  style={{ width: "100%" }}
                >
                  {categories?.map((category: { category_id: string; category_name: string }) => (
                    <Option
                      key={category.category_id}
                      value={category.category_id}
                    >
                      {category.category_name}
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

        {/* Thông tin giá cả và tồn kho */}
        <Card
          title={
            <Space>
              <DollarOutlined style={{ color: "#52c41a" }} />
              <span>Thông tin giá cả và tồn kho</span>
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
            <Col xs={24} sm={8}>
              <Form.Item
                label="Giá nhập (VNĐ)"
                name="costPrice"
                rules={[
                  { required: true, message: "Vui lòng nhập giá nhập!" },
                  { type: "number", min: 0, message: "Giá phải lớn hơn 0!" },
                ]}
              >
                <MemoizedInputNumber
                  min={0}
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  placeholder="Nhập giá nhập"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Giá bán (VNĐ)"
                name="sellingPrice"
                rules={[
                  { required: true, message: "Vui lòng nhập giá bán!" },
                  { type: "number", min: 0, message: "Giá phải lớn hơn 0!" },
                ]}
              >
                <MemoizedInputNumber
                  min={0}
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  placeholder="Nhập giá bán"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Trọng lượng (kg)"
                name="weight"
                rules={[
                  { required: true, message: "Vui lòng nhập trọng lượng!" },
                  {
                    type: "number",
                    min: 0,
                    message: "Trọng lượng phải lớn hơn 0!"},
                ]}
              >
                <MemoizedInputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="Nhập trọng lượng"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Tồn kho tối thiểu"
                name="minStockLevel"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tồn kho tối thiểu!"},
                  {
                    type: "number",
                    min: 0,
                    message: "Tồn kho tối thiểu phải lớn hơn hoặc bằng 0!"},
                ]}
              >
                <MemoizedInputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="Nhập tồn kho tối thiểu"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Tồn kho tối đa"
                name="maxStockLevel"
                rules={[
                  { required: true, message: "Vui lòng nhập tồn kho tối đa!" },
                  {
                    type: "number",
                    min: 0,
                    message: "Tồn kho tối đa phải lớn hơn hoặc bằng 0!"},
                ]}
              >
                <MemoizedInputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="Nhập tồn kho tối đa"
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
            <Col xs={24} sm={8}>
              <Form.Item
                label="Thời gian bảo hành (tháng)"
                name="warrantyPeriodMonths"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập thời gian bảo hành!"},
                  {
                    type: "number",
                    min: 0,
                    message: "Thời gian bảo hành phải lớn hơn hoặc bằng 0!"},
                ]}
              >
                <MemoizedInputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="Nhập thời gian bảo hành"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
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
            <Col xs={24} sm={6}>
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

        {/* Thông số kỹ thuật */}
        <Card
          title={
            <Space>
              <InfoCircleOutlined style={{ color: "#722ed1" }} />
              <span>Thông số kỹ thuật</span>
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
                label="Màu sắc"
                name="specColor"
                initialValue={specifications.color || ""}
              >
                <MemoizedInput 
                  placeholder="Ví dụ: xanh dương, đỏ, etc."
                  onChange={(e) => updateSpecification("color", e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Kích thước/Dung tích"
                name="specSize"
                initialValue={specifications.size || ""}
              >
                <MemoizedInput 
                  placeholder="Ví dụ: 1L, 30x25cm, etc."
                  onChange={(e) => updateSpecification("size", e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Chất liệu/Công nghệ"
                name="specMaterial"
                initialValue={specifications.material || ""}
              >
                <MemoizedInput 
                  placeholder="Ví dụ: Microfiber, AGM, etc."
                  onChange={(e) => updateSpecification("material", e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Đặc tính"
                name="specFeature"
                initialValue={specifications.feature || ""}
              >
                <MemoizedInput 
                  placeholder="Ví dụ: chống trượt, thấm hút tốt, etc."
                  onChange={(e) => updateSpecification("feature", e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Thông số khác"
                name="specOther"
                initialValue={specifications.other || ""}
              >
                <MemoizedInput 
                  placeholder="Thông số bổ sung khác"
                  onChange={(e) => updateSpecification("other", e.target.value)}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Kích thước */}
        <Card
          title={
            <Space>
              <InfoCircleOutlined style={{ color: "#13c2c2" }} />
              <span>Kích thước</span>
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
            <Col xs={24} sm={8}>
              <Form.Item
                label="Chiều dài"
                name="dimLength"
                initialValue={dimensions.length || ""}
              >
                <MemoizedInput 
                  placeholder="Ví dụ: 30cm, 10cm"
                  onChange={(e) => updateDimension("length", e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Chiều rộng"
                name="dimWidth"
                initialValue={dimensions.width || ""}
              >
                <MemoizedInput 
                  placeholder="Ví dụ: 25cm, 5cm"
                  onChange={(e) => updateDimension("width", e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Chiều cao"
                name="dimHeight"
                initialValue={dimensions.height || ""}
              >
                <MemoizedInput 
                  placeholder="Ví dụ: 2cm, 15cm"
                  onChange={(e) => updateDimension("height", e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Đường kính"
                name="dimDiameter"
                initialValue={dimensions.diameter || ""}
              >
                <MemoizedInput 
                  placeholder="Ví dụ: 65cm, 16inch"
                  onChange={(e) => updateDimension("diameter", e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Kích thước vành"
                name="dimRimSize"
                initialValue={dimensions.rim_size || ""}
              >
                <MemoizedInput 
                  placeholder="Ví dụ: 16inch, 17inch"
                  onChange={(e) => updateDimension("rim_size", e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Trọng lượng"
                name="dimWeight"
                initialValue={dimensions.weight || ""}
              >
                <MemoizedInput 
                  placeholder="Ví dụ: 1kg, 18kg"
                  onChange={(e) => updateDimension("weight", e.target.value)}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Tags */}
        <Card
          title={
            <Space>
              <TagOutlined style={{ color: "#eb2f96" }} />
              <span>Tags</span>
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
            <Col xs={24} sm={8}>
              <Form.Item
                label="Tag 1"
                name="tag1"
                initialValue={tags.tag1 || ""}
              >
                <MemoizedInput 
                  placeholder="Ví dụ: cao cấp, bền bỉ"
                  onChange={(e) => updateTag("tag1", e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Tag 2"
                name="tag2"
                initialValue={tags.tag2 || ""}
              >
                <MemoizedInput 
                  placeholder="Ví dụ: tiết kiệm, hiệu quả"
                  onChange={(e) => updateTag("tag2", e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Tag 3"
                name="tag3"
                initialValue={tags.tag3 || ""}
              >
                <MemoizedInput 
                  placeholder="Ví dụ: dễ sử dụng, an toàn"
                  onChange={(e) => updateTag("tag3", e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Tag 4"
                name="tag4"
                initialValue={tags.tag4 || ""}
              >
                <MemoizedInput 
                  placeholder="Ví dụ: chính hãng, bảo hành"
                  onChange={(e) => updateTag("tag4", e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Tag 5"
                name="tag5"
                initialValue={tags.tag5 || ""}
              >
                <MemoizedInput 
                  placeholder="Ví dụ: phù hợp, đa dạng"
                  onChange={(e) => updateTag("tag5", e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Tag 6"
                name="tag6"
                initialValue={tags.tag6 || ""}
              >
                <MemoizedInput 
                  placeholder="Tag bổ sung khác"
                  onChange={(e) => updateTag("tag6", e.target.value)}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Hình ảnh */}
        <Card
          title={
            <Space>
              <PictureOutlined style={{ color: "#fa541c" }} />
              <span>Hình ảnh</span>
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
                label="Hình ảnh chính"
                name="imgMain"
                initialValue={imageUrls.main || ""}
              >
                <MemoizedInput 
                  placeholder="URL hình ảnh chính của sản phẩm"
                  onChange={(e) => updateImageUrl("main", e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Hình ảnh thumbnail"
                name="imgThumbnail"
                initialValue={imageUrls.thumbnail || ""}
              >
                <MemoizedInput 
                  placeholder="URL hình ảnh thu nhỏ"
                  onChange={(e) => updateImageUrl("thumbnail", e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Hình ảnh chi tiết"
                name="imgDetail"
                initialValue={imageUrls.detail || ""}
              >
                <MemoizedInput 
                  placeholder="URL hình ảnh chi tiết"
                  onChange={(e) => updateImageUrl("detail", e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Hình ảnh nhãn"
                name="imgLabel"
                initialValue={imageUrls.label || ""}
              >
                <MemoizedInput 
                  placeholder="URL hình ảnh nhãn sản phẩm"
                  onChange={(e) => updateImageUrl("label", e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Hình ảnh bao bì"
                name="imgPackage"
                initialValue={imageUrls.package || ""}
              >
                <MemoizedInput 
                  placeholder="URL hình ảnh bao bì"
                  onChange={(e) => updateImageUrl("package", e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Hình ảnh gallery"
                name="imgGallery"
                initialValue={imageUrls.gallery || ""}
              >
                <MemoizedInput 
                  placeholder="URL hình ảnh gallery"
                  onChange={(e) => updateImageUrl("gallery", e.target.value)}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    </Modal>
  );
};

export default ProductEditModal;

