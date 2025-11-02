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
  Avatar,
  App,
  Tabs,
  Badge,
} from "antd";
import {
  MemoizedInput,
  MemoizedTextArea,
} from "@/components/ui/MemoizedComponents";
import ProductAttributeManager from "@/components/ui/ProductAttributeManager/ProductAttributeManager";
import ProductImageGallery from "@/components/ui/Product/ProductImageGallery";
import ProductImageUploader, {
  PendingImage,
} from "@/components/ui/Product/ProductImageUploader";
import {
  EditOutlined,
  SaveOutlined,
  PlusOutlined,
  InfoCircleOutlined,
  PictureOutlined,
  TagOutlined,
} from "@ant-design/icons";
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  CreateProductAttributeValueRequest,
} from "@/lib/api/types/product.types";
import {
  useCreateProduct,
  useUpdateProduct,
} from "@/lib/api/hooks/useProducts";
import { useUploadProductImage } from "@/lib/api/hooks/useProductImages";
import { useProductTypes } from "@/lib/api/hooks/useProductTypes";
import { productAttributeValueService } from "@/lib/api/services/productAttributeValue.service";

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
  editData,
}) => {
  const [form] = Form.useForm();
  const [attributeValues, setAttributeValues] = React.useState<
    CreateProductAttributeValueRequest[]
  >([]);
  const [pendingImages, setPendingImages] = React.useState<PendingImage[]>([]);
  const { message } = App.useApp();

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const uploadImageMutation = useUploadProductImage();
  const { data: productTypesData } = useProductTypes({
    filters: {
      is_active: true,
    },
  });

  const productTypes = productTypesData?.data?.content || [];

  const loading =
    createProductMutation.isPending || updateProductMutation.isPending;

  // Upload images for newly created product
  const uploadPendingImages = async (productId: string) => {
    let hasErrors = false;
    for (const pendingImage of pendingImages) {
      try {
        await uploadImageMutation.mutateAsync({
          productId,
          file: pendingImage.file,
          altText: pendingImage.altText,
          isMain: pendingImage.isMain,
        });
      } catch (error) {
        console.log("Failed to upload image:", error);
        hasErrors = true;
        message.warning("Có lỗi khi upload ảnh sản phẩm");
      }
    }
    return hasErrors;
  };

  // Create attributes for newly created product
  const createProductAttributes = async (productId: string) => {
    const createAttributes = attributeValues.filter(
      (attr) => attr.operation !== "DELETE"
    );

    if (createAttributes.length === 0) return false;

    try {
      await productAttributeValueService.createMultipleProductAttributeValues(
        productId,
        createAttributes.map((attr) => ({
          product_id: productId,
          attribute_id: attr.attribute_id,
          value_text: attr.value_text,
          value_number: attr.value_number,
        }))
      );
      return false;
    } catch (error) {
      console.log("Failed to create attributes:", error);
      message.warning("Có lỗi khi tạo thuộc tính sản phẩm");
      return true;
    }
  };

  // Handle post-product creation tasks (attributes and images)
  const handlePostProductCreation = async (newProduct: Product) => {
    if (!newProduct?.product_id) {
      message.success("Tạo sản phẩm thành công!");
      onSuccess();
      return;
    }

    let hasAttributeErrors = false;
    let hasImageErrors = false;

    // Create attributes if there are any
    if (attributeValues.length > 0) {
      hasAttributeErrors = await createProductAttributes(newProduct.product_id);
    }

    // Upload pending images if there are any
    if (pendingImages.length > 0) {
      hasImageErrors = await uploadPendingImages(newProduct.product_id);
    }

    // Show success message
    const hasErrors = hasAttributeErrors || hasImageErrors;
    const hasExtras = attributeValues.length > 0 || pendingImages.length > 0;

    if (hasErrors) {
      message.warning("Tạo sản phẩm thành công nhưng có một số lỗi phụ");
    } else if (hasExtras) {
      message.success("Tạo sản phẩm, thuộc tính và ảnh thành công!");
    } else {
      message.success("Tạo sản phẩm thành công!");
    }

    onSuccess();
  };

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
        isFeatured: editData.is_featured,
        description: editData.description,
        unitOfMeasure: editData.unit_of_measure,
        is_active: editData.is_active,
      });

      // Initialize attribute values for editing
      if (editData.attribute_values && editData.attribute_values.length > 0) {
        const initialAttributes = editData.attribute_values.map((attr) => ({
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
      setPendingImages([]); // Reset pending images for new product
    }
  }, [visible, editData, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Validate attributes for new products
      if (!editData && attributeValues.length > 0) {
        const invalidAttributes = attributeValues.filter(
          (attr) =>
            !attr.attribute_id ||
            (attr.value_text === undefined &&
              attr.value_number === undefined) ||
            (attr.value_text === null && attr.value_number === null)
        );

        if (invalidAttributes.length > 0) {
          message.error("Vui lòng hoàn thiện thông tin thuộc tính sản phẩm");
          return;
        }
      }

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
          is_featured: values.isFeatured,
          is_active: values.is_active,
        };

        // Update product first
        updateProductMutation.mutate(
          {
            productId: editData.product_id,
            data: updateData,
          },
          {
            onSuccess: () => {
              // Then update attributes if there are any
              if (attributeValues.length > 0) {
                // Use the new service with operation support
                productAttributeValueService
                  .bulkUpdateProductAttributeValuesByProduct(
                    editData.product_id,
                    attributeValues.map((attr) => ({
                      attribute_id: attr.attribute_id,
                      value_text: attr.value_text,
                      value_number: attr.value_number,
                      operation: attr.operation, // Chỉ có khi là DELETE
                    }))
                  )
                  .then(() => {
                    message.success(
                      "Cập nhật sản phẩm và thuộc tính thành công!"
                    );
                    onSuccess();
                  })
                  .catch((error) => {
                    console.log("Failed to update attributes:", error);
                    message.warning(
                      "Cập nhật sản phẩm thành công nhưng có lỗi khi cập nhật thuộc tính"
                    );
                    onSuccess(); // Still call onSuccess for product update
                  });
              } else {
                message.success("Cập nhật sản phẩm thành công!");
                onSuccess();
              }
            },
          }
        );
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
          is_featured: values.isFeatured,
          is_active: values.is_active,
        };

        createProductMutation.mutate(productData, {
          onSuccess: (newProduct) => {
            // After creating product, handle attributes and images
            handlePostProductCreation(newProduct);
          },
        });
      }
    } catch (error) {
      console.log("Form validation failed:", error);
    }
  };

  const handleAttributeChange = (
    newAttributeValues: CreateProductAttributeValueRequest[]
  ) => {
    setAttributeValues(newAttributeValues);
  };

  const handleImagesChange = (images: PendingImage[]) => {
    setPendingImages(images);
  };

  const handleCancel = () => {
    form.resetFields();
    setAttributeValues([]);
    setPendingImages([]);
    onCancel();
  };

  // Tab 1: Thông tin chung
  const generalInfoTab = (
    <>
      {/* Thông tin trạng thái sản phẩm */}
      <Card
        size="small"
        style={{
          marginBottom: 16,
          border: "1px solid #f0f0f0",
          borderRadius: 8,
        }}
      >
        <Row gutter={16}>
          <Col
            xs={24}
            sm={12}
          >
            <Form.Item
              label="Sản phẩm nổi bật"
              name="isFeatured"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col
            xs={24}
            sm={12}
          >
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
          borderRadius: 8,
        }}
      >
        <Row gutter={16}>
          <Col
            xs={24}
            sm={12}
          >
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
          <Col
            xs={24}
            sm={12}
          >
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
          <Col
            xs={24}
            sm={8}
          >
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
          <Col
            xs={24}
            sm={8}
          >
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
          <Col
            xs={24}
            sm={8}
          >
            <Form.Item
              label="Loại sản phẩm"
              name="productTypeId"
              rules={[
                { required: true, message: "Vui lòng chọn loại sản phẩm!" },
              ]}
            >
              <Select
                placeholder="Tìm kiếm và chọn loại sản phẩm"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  String(option?.children || "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                style={{ width: "100%" }}
              >
                {productTypes?.map(
                  (productType: {
                    product_type_id: string;
                    product_type_name: string;
                  }) => (
                    <Option
                      key={productType.product_type_id}
                      value={productType.product_type_id}
                    >
                      {productType.product_type_name}
                    </Option>
                  )
                )}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col
            xs={24}
            sm={8}
          >
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
          <Col
            xs={24}
            sm={8}
          >
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
          <Col
            xs={24}
            sm={8}
          >
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
    </>
  );

  // Tab 2: Thuộc tính sản phẩm
  const attributesTab = (
    <ProductAttributeManager
      productId={editData?.product_id}
      initialAttributeValues={editData?.attribute_values || []}
      onChange={handleAttributeChange}
      disabled={loading}
      isEditMode={!!editData}
    />
  );

  // Tab 3: Hình ảnh sản phẩm
  const imagesTab = editData?.product_id ? (
    // For existing products, show the full gallery
    <ProductImageGallery productId={editData.product_id} />
  ) : (
    // For new products, show the uploader
    <ProductImageUploader
      onChange={handleImagesChange}
      maxCount={10}
    />
  );

  const tabItems = [
    {
      key: "general",
      label: (
        <Space>
          <InfoCircleOutlined />
          Thông tin chung
        </Space>
      ),
      children: generalInfoTab,
    },
    {
      key: "attributes",
      label: (
        <Space>
          <TagOutlined />
          Thuộc tính sản phẩm
          {editData?.attribute_values &&
            editData.attribute_values.length > 0 && (
              <Badge count={editData.attribute_values.length} />
            )}
        </Space>
      ),
      children: attributesTab,
    },
    {
      key: "images",
      label: (
        <Space>
          <PictureOutlined />
          Hình ảnh sản phẩm
        </Space>
      ),
      children: imagesTab,
    },
  ];

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar
            size={40}
            icon={editData ? <EditOutlined /> : <PlusOutlined />}
            style={{
              backgroundColor: editData ? "#1890ff" : "#52c41a",
              color: "white",
            }}
          />
          <div>
            <Title
              level={4}
              style={{ margin: 0, color: "#262626" }}
            >
              {editData ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
            </Title>
            <Text
              type="secondary"
              style={{ fontSize: 12 }}
            >
              {editData
                ? "Cập nhật thông tin sản phẩm"
                : "Nhập thông tin sản phẩm mới"}
            </Text>
          </div>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      width={1200}
      footer={[
        <Button
          key="cancel"
          onClick={handleCancel}
          size="large"
        >
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
            borderColor: editData ? "#1890ff" : "#52c41a",
          }}
        >
          {editData ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
        </Button>,
      ]}
      styles={{
        body: {
          padding: "24px",
          maxHeight: "80vh",
          overflowY: "auto",
        },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        scrollToFirstError
      >
        <Tabs
          defaultActiveKey="general"
          items={tabItems}
        />
      </Form>
    </Modal>
  );
};

export default ProductModal;
