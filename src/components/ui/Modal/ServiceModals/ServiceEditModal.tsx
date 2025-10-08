"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Select,
  Button,
  Space,
  message,
  Row,
  Col,
  Card,
  Table,
  Popconfirm,
  Switch,
  Upload} from "antd";
import { MemoizedInput, MemoizedTextArea, MemoizedInputNumber } from "@/components/ui/MemoizedComponents";
import {
  EditOutlined,
  SaveOutlined,
  PlusOutlined,
  UploadOutlined,
  DeleteOutlined} from "@ant-design/icons";
import {
  Service,
  ServiceProduct,
  SERVICE_STATUS_OPTIONS} from "@/lib/api/types/service.types";
import { productService, categoryService } from "@/lib/api/services";
import { Product } from "@/lib/api/types/product.types";
import { Category } from "@/lib/api/types/category.types";
import formatCurrency from "@/components/utils/helper/currency.format.helper";

const { Option } = Select;

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
  editData}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [serviceProducts, setServiceProducts] = useState<ServiceProduct[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Load categories when modal opens
  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      console.log("Loading categories...");

      const response = await categoryService.getAllCategories(0, 1000);
      console.log("Category API response:", response);

      if (response.success && response.data) {
        console.log("Categories loaded:", response.data.content);
        setCategories(response.data.content || []);
      } else {
        console.log("No categories found or API error");
        setCategories([]);
      }
    } catch (error) {
      console.log("Error loading categories:", error);
      message.error(
        "Không thể tải danh sách danh mục! Vui lòng kiểm tra kết nối mạng hoặc tạo danh mục trước."
      );
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Load products when modal opens
  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      console.log("Loading products...");

      const response = await productService.getAllProducts({
        page: 1,
        size: 1000, // Load tất cả sản phẩm
        sort: "productName",
        direction: "ASC"});

      console.log("Product API response:", response);

      if (response.success && response.data) {
        console.log("Products loaded:", response.data.content);
        setProducts(response.data.content || []);
      } else {
        console.log("No products found or API error");
        setProducts([]);
      }
    } catch (error) {
      console.log("Error loading products:", error);
      message.error(
        "Không thể tải danh sách sản phẩm! Vui lòng kiểm tra kết nối mạng hoặc tạo sản phẩm trước."
      );
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadCategories(); // Load categories when modal opens
      loadProducts(); // Load products when modal opens

      if (editData) {
        form.setFieldsValue({
          serviceName: editData.serviceName,
          serviceUrl: editData.serviceUrl,
          categoryId: editData.categoryId,
          description: editData.description,
          standardDuration: editData.standardDuration,
          requiredSkillLevel: editData.requiredSkillLevel,
          basePrice: editData.basePrice,
          laborCost: editData.laborCost,
          isFeatured: editData.isFeatured,
          isActive: editData.isActive});
        setServiceProducts(editData.serviceProducts || []);
        setImageUrls(editData.imageUrls ? JSON.parse(editData.imageUrls) : []);
      } else {
        form.resetFields();
        setServiceProducts([]);
        setImageUrls([]);
      }
    }
  }, [visible, editData, form]);

  // Tính toán tổng giá khi serviceProducts thay đổi
  const calculateTotalPrice = () => {
    const productsTotal = serviceProducts.reduce(
      (sum, product) => sum + product.totalPrice,
      0
    );
    const laborCost = form.getFieldValue("laborCost") || 0;
    return productsTotal + laborCost;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const updatedData: Service = {
        serviceId: editData?.serviceId || "",
        serviceUrl: values.serviceUrl,
        serviceName: values.serviceName,
        categoryId: values.categoryId,
        categoryName: "", // Will be filled by API
        description: values.description,
        standardDuration: values.standardDuration,
        requiredSkillLevel: values.requiredSkillLevel,
        isPackage: false, // Mặc định không phải gói dịch vụ
        basePrice: values.basePrice,
        laborCost: values.laborCost,
        productCost: serviceProducts.reduce((sum, p) => sum + p.totalPrice, 0),
        serviceType: "CUSTOM", // Mặc định loại tùy chỉnh
        photoRequired: false, // Mặc định không yêu cầu ảnh
        imageUrls: JSON.stringify(imageUrls),
        isFeatured: values.isFeatured,
        isActive: values.isActive,
        serviceProducts,
        audit: editData?.audit};

      onSuccess(updatedData);
    } catch (error) {
      console.log("Form validation failed:", error);
      message.error("Vui lòng kiểm tra lại thông tin đã nhập!");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setServiceProducts([]);
    setImageUrls([]);
    onCancel();
  };

  // Service Product management functions
  const addServiceProduct = () => {
    const newProduct: ServiceProduct = {
      serviceProductId: undefined,
      serviceId: null,
      productId: null,
      productName: null,
      productUrl: null,
      productSku: null,
      productBrand: null,
      productModel: null,
      unitOfMeasure: null,
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      notes: "",
      isRequired: true,
      isActive: true,
      audit: null};
    setServiceProducts([...serviceProducts, newProduct]);
  };

  const updateServiceProduct = (
    index: number,
    field: keyof ServiceProduct,
    value: unknown
  ) => {
    const newProducts = [...serviceProducts];
    newProducts[index] = { ...newProducts[index], [field]: value };

    // Nếu cập nhật productId, tự động điền thông tin sản phẩm
    if (field === "productId" && value) {
      const selectedProduct = products.find((p) => p.productId === value);
      if (selectedProduct) {
        newProducts[index] = {
          ...newProducts[index],
          productName: selectedProduct.productName,
          productSku: selectedProduct.sku,
          productBrand: selectedProduct.brand,
          unitPrice: selectedProduct.sellingPrice,
          totalPrice:
            newProducts[index].quantity * selectedProduct.sellingPrice};
      }
    }

    // Nếu cập nhật quantity hoặc unitPrice, tính lại totalPrice
    if (field === "quantity" || field === "unitPrice") {
      newProducts[index].totalPrice =
        newProducts[index].quantity * newProducts[index].unitPrice;
    }

    setServiceProducts(newProducts);
  };

  const removeServiceProduct = (index: number) => {
    const newProducts = serviceProducts.filter((_, i) => i !== index);
    setServiceProducts(newProducts);
  };

  // Image management functions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleImageUpload = (info: any) => {
    if (info.file.status === "done") {
      const newImageUrl = info.file.response?.url || info.file.url;
      if (newImageUrl) {
        setImageUrls([...imageUrls, newImageUrl]);
        message.success("Tải lên hình ảnh thành công!");
      }
    } else if (info.file.status === "error") {
      message.error("Tải lên hình ảnh thất bại!");
    }
  };

  const handleImageUploadBefore = (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Chỉ được tải lên file hình ảnh!");
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Kích thước hình ảnh không được vượt quá 2MB!");
      return false;
    }
    return true;
  };

  const removeImage = (index: number) => {
    const newImageUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newImageUrls);
  };

  // Debug log
  console.log("Current products state:", products);
  console.log("Products loading:", productsLoading);
  console.log("Current categories state:", categories);
  console.log("Categories loading:", categoriesLoading);

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
              label="Tên dịch vụ"
              name="serviceName"
              rules={[
                { required: true, message: "Vui lòng nhập tên dịch vụ!" },
                { max: 100, message: "Tên không được quá 100 ký tự!" },
              ]}
            >
              <MemoizedInput placeholder="Nhập tên dịch vụ" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="URL dịch vụ"
              name="serviceUrl"
              rules={[
                { required: true, message: "Vui lòng nhập URL dịch vụ!" },
                { max: 200, message: "URL không được quá 200 ký tự!" },
              ]}
            >
              <MemoizedInput placeholder="Nhập URL dịch vụ" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Danh mục"
              name="categoryId"
              rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
            >
              <Select
                placeholder="Chọn danh mục"
                loading={categoriesLoading}
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string)
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <Option
                      key={category.category_id}
                      value={category.category_id}
                    >
                      {category.category_name}
                    </Option>
                  ))
                ) : (
                  <Option disabled value="no-categories">
                    {categoriesLoading
                      ? "Đang tải danh mục..."
                      : "Không có danh mục nào"}
                  </Option>
                )}
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
          <MemoizedTextArea
            rows={3}
            placeholder="Nhập mô tả dịch vụ"
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} sm={6}>
            <Form.Item
              label="Thời gian thực hiện (phút)"
              name="standardDuration"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập thời gian thực hiện!"},
                {
                  type: "number",
                  min: 1,
                  message: "Thời gian phải lớn hơn 0!"},
              ]}
            >
              <MemoizedInputNumber
                min={1}
                style={{ width: "100%" }}
                placeholder="Nhập thời gian (phút)"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Form.Item
              label="Kỹ năng yêu cầu"
              name="requiredSkillLevel"
              rules={[
                { required: true, message: "Vui lòng chọn kỹ năng yêu cầu!" },
              ]}
            >
              <Select placeholder="Chọn kỹ năng">
                {SERVICE_STATUS_OPTIONS.map((skill) => (
                  <Option key={skill.value} value={skill.value}>
                    {skill.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Form.Item
              label="Giá cơ bản (VNĐ)"
              name="basePrice"
              rules={[
                { required: true, message: "Vui lòng nhập giá cơ bản!" },
                { type: "number", min: 0, message: "Giá phải lớn hơn 0!" },
              ]}
            >
              <MemoizedInputNumber
                min={0}
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                placeholder="Nhập giá cơ bản"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Form.Item
              label="Chi phí lao động (VNĐ)"
              name="laborCost"
              rules={[
                { required: true, message: "Vui lòng nhập chi phí lao động!" },
                { type: "number", min: 0, message: "Chi phí phải lớn hơn 0!" },
              ]}
            >
              <MemoizedInputNumber
                min={0}
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                placeholder="Nhập chi phí lao động"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Dịch vụ nổi bật"
              name="isFeatured"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Trạng thái hoạt động"
              name="isActive"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        {/* Quản lý sản phẩm */}
        <Card
          title="Sản phẩm sử dụng"
          size="small"
          extra={
            <Button
              type="dashed"
              size="small"
              icon={<PlusOutlined />}
              onClick={addServiceProduct}
            >
              Thêm sản phẩm
            </Button>
          }
        >
          {serviceProducts.length > 0 ? (
            <Table
              dataSource={serviceProducts}
              pagination={false}
              size="small"
              rowKey={(record, index) => record.serviceProductId || record.productId || `product-${index}`}
              columns={[
                {
                  title: "Sản phẩm",
                  key: "product",
                  width: 200,
                  render: (_, record, index) => (
                    <Select
                      placeholder="Chọn sản phẩm"
                      value={record.productId || undefined}
                      onChange={(value) =>
                        updateServiceProduct(index, "productId", value)
                      }
                      style={{ width: "100%" }}
                      loading={productsLoading}
                      showSearch
                      filterOption={(input, option) =>
                        (option?.children as unknown as string)
                          ?.toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    >
                      {products.length > 0 ? (
                        products.map((product) => (
                          <Option
                            key={product.productId}
                            value={product.productId}
                          >
                            {product.productName} -{" "}
                            {formatCurrency(product.sellingPrice)}
                          </Option>
                        ))
                      ) : (
                        <Option disabled value="no-products">
                          {productsLoading
                            ? "Đang tải sản phẩm..."
                            : "Không có sản phẩm nào"}
                        </Option>
                      )}
                    </Select>
                  )},
                {
                  title: "Số lượng",
                  key: "quantity",
                  width: 100,
                  render: (_, record, index) => (
                    <MemoizedInputNumber
                      min={0}
                      step={0.1}
                      value={record.quantity}
                      onChange={(value) =>
                        updateServiceProduct(index, "quantity", value || 0)
                      }
                      style={{ width: "100%" }}
                    />
                  )},
                {
                  title: "Đơn giá",
                  key: "unitPrice",
                  width: 120,
                  render: (_, record) => (
                    <span style={{ fontWeight: 500, color: "#1890ff" }}>
                      {formatCurrency(record.unitPrice)}
                    </span>
                  )},
                {
                  title: "Thành tiền",
                  key: "totalPrice",
                  width: 120,
                  render: (_, record) => (
                    <span style={{ fontWeight: 500, color: "#52c41a" }}>
                      {formatCurrency(record.totalPrice)}
                    </span>
                  )},
                {
                  title: "Bắt buộc",
                  key: "isRequired",
                  width: 100,
                  render: (_, record, index) => (
                    <Switch
                      checked={record.isRequired}
                      onChange={(checked) =>
                        updateServiceProduct(index, "isRequired", checked)
                      }
                      size="small"
                    />
                  )},
                {
                  title: "Ghi chú",
                  key: "notes",
                  width: 150,
                  render: (_, record, index) => (
                    <MemoizedInput
                      placeholder="Ghi chú"
                      value={record.notes}
                      onChange={(e) =>
                        updateServiceProduct(index, "notes", e.target.value)
                      }
                      size="small"
                    />
                  )},
                {
                  title: "Thao tác",
                  key: "actions",
                  width: 80,
                  render: (_, record, index) => (
                    <Popconfirm
                      title="Xóa sản phẩm này?"
                      onConfirm={() => removeServiceProduct(index)}
                      okText="Xóa"
                      cancelText="Hủy"
                    >
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                      >
                        Xóa
                      </Button>
                    </Popconfirm>
                  )},
              ]}
            />
          ) : (
            <div
              style={{ textAlign: "center", color: "#999", padding: "20px" }}
            >
              Chưa có sản phẩm nào
            </div>
          )}

          {/* Tổng kết */}
          {serviceProducts.length > 0 && (
            <div
              style={{
                marginTop: 16,
                padding: 12,
                backgroundColor: "#f5f5f5",
                borderRadius: 6}}
            >
              <Row gutter={16}>
                <Col span={8}>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    Tổng sản phẩm:
                  </div>
                  <div style={{ fontWeight: 500, color: "#1890ff" }}>
                    {formatCurrency(
                      serviceProducts.reduce((sum, p) => sum + p.totalPrice, 0)
                    )}
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    Chi phí lao động:
                  </div>
                  <div style={{ fontWeight: 500, color: "#fa8c16" }}>
                    {formatCurrency(form.getFieldValue("laborCost") || 0)}
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    Tổng giá dịch vụ:
                  </div>
                  <div
                    style={{ fontWeight: 500, color: "#52c41a", fontSize: 16 }}
                  >
                    {formatCurrency(calculateTotalPrice())}
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Card>

        {/* Quản lý hình ảnh */}
        <Card
          title="Hình ảnh dịch vụ"
          size="small"
          extra={
            <Upload
              accept="image/*"
              showUploadList={false}
              onChange={handleImageUpload}
              beforeUpload={handleImageUploadBefore}
              action="/api/upload" // Cần cấu hình endpoint upload thực tế
              name="file"
            >
              <Button type="dashed" size="small" icon={<UploadOutlined />}>
                Tải lên ảnh
              </Button>
            </Upload>
          }
        >
          {imageUrls.length > 0 ? (
            <Row gutter={[16, 16]}>
              {imageUrls.map((url, index) => (
                <Col key={index} span={8}>
                  <div style={{ position: "relative" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Service image ${index + 1}`}
                      style={{
                        width: "100%",
                        height: 100,
                        objectFit: "cover",
                        borderRadius: 8}}
                    />
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      style={{ position: "absolute", top: 4, right: 4 }}
                      onClick={() => removeImage(index)}
                    />
                  </div>
                </Col>
              ))}
            </Row>
          ) : (
            <div
              style={{ textAlign: "center", color: "#999", padding: "20px" }}
            >
              Chưa có hình ảnh nào
            </div>
          )}
        </Card>
      </Form>
    </Modal>
  );
};

export default ServiceEditModal;

