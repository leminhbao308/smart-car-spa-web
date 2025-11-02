import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Row,
  Col,
  Typography,
  Divider,
  message,
} from "antd";
import { Category } from "@/lib/api/types/category.types";
import {
  useCreateCategory,
  useUpdateCategory,
  useCategories,
} from "@/lib/api/hooks/useCategory";

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

// Interface for form validation error
interface FormValidationError {
  errorFields?: Array<{
    name: string[];
    errors: string[];
  }>;
  message?: string;
}

interface CategoryModalProps {
  visible: boolean;
  onCancel: () => void;
  category?: Category | null;
  parentCategory?: Category | null;
  mode: "create" | "edit";
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  visible,
  onCancel,
  category,
  parentCategory,
  mode,
}) => {
  const [form] = Form.useForm();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const { data: categoriesData } = useCategories(0, 1000);

  const isEdit = mode === "edit";
  const isSubCategory = !!parentCategory;

  useEffect(() => {
    if (visible) {
      if (isEdit && category) {
        const editValues = {
          category_name: category.category_name,
          category_url: category.category_url,
          description: category.description,
          category_type: category.category_type,
          parent_category_id: category.parent_category_id || null,
          is_active: category.is_active,
        };
        form.setFieldsValue(editValues);
      } else if (isSubCategory && parentCategory) {
        const subCategoryValues = {
          parent_category_id: parentCategory.category_id,
          category_type: parentCategory.category_type, // Inherit type from parent
          is_active: true,
        };
        form.setFieldsValue(subCategoryValues);
      } else {
        form.resetFields();
        const newCategoryValues = {
          parent_category_id: null, // Root category
          is_active: true,
        };
        form.setFieldsValue(newCategoryValues);
      }
    }
  }, [visible, category, parentCategory, isEdit, isSubCategory, form]);

  const handleSubmit = async () => {
    try {
      // Debug: Log current form values before validation
      const currentValues = form.getFieldsValue();

      // Check if form is properly initialized
      if (!form) {
        throw new Error("Form chưa được khởi tạo");
      }

      const values = await form.validateFields();

      // Additional validation checks
      if (!values.category_name || values.category_name.trim() === "") {
        throw new Error("Tên danh mục không được để trống");
      }
      if (!values.category_url || values.category_url.trim() === "") {
        throw new Error("URL danh mục không được để trống");
      }
      if (!values.category_type) {
        throw new Error("Loại danh mục không được để trống");
      }

      if (isEdit && category) {
        await updateCategoryMutation.mutateAsync({
          category_id: category.category_id,
          ...values,
        });
      } else {
        // Prepare data for create category
        const createData = {
          ...values,
          // Set parent_category_id based on context
          parent_category_id:
            isSubCategory && parentCategory
              ? parentCategory.category_id
              : values.parent_category_id || null,
        };

        await createCategoryMutation.mutateAsync(createData);
      }

      form.resetFields();
      onCancel();
    } catch (error) {
      // Handle form validation errors
      const validationError = error as FormValidationError;
      if (validationError && validationError.errorFields) {
        console.log("Form validation failed:", validationError.errorFields);
        // Show specific validation errors to user
        const errorMessages = validationError.errorFields
          .map((field) => `${field.name.join(".")}: ${field.errors.join(", ")}`)
          .join("\n");
        console.log("Validation errors:", errorMessages);
        message.error("Vui lòng kiểm tra lại thông tin đã nhập!");
      } else if (validationError && validationError.message) {
        console.log("Form validation failed:", validationError.message);
        message.error("Có lỗi xảy ra khi xác thực form!");
      } else {
        console.log(
          "Form validation failed:",
          JSON.stringify(error, null, 2)
        );
        message.error("Có lỗi xảy ra khi xác thực form!");
      }
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const generateUrlFromName = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .trim();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const url = generateUrlFromName(name);
    form.setFieldsValue({ category_url: url });
  };

  // Get available parent categories (exclude current category and its children in edit mode)
  const getAvailableParentCategories = () => {
    if (!categoriesData?.data?.content) return [];

    let available = categoriesData.data.content.filter((cat) => cat.is_active);

    if (isEdit && category) {
      // Exclude current category and its descendants
      const excludeIds = [category.category_id];
      const getDescendantIds = (cat: Category) => {
        cat.subcategories?.forEach((sub) => {
          excludeIds.push(sub.category_id);
          getDescendantIds(sub);
        });
      };
      getDescendantIds(category);
      available = available.filter(
        (cat) => !excludeIds.includes(cat.category_id)
      );
    }

    return available;
  };

  const getModalTitle = () => {
    if (isEdit) return "Chỉnh sửa danh mục";
    if (isSubCategory)
      return `Thêm sub-category cho "${parentCategory?.category_name}"`;
    return "Thêm danh mục mới";
  };

  return (
    <Modal
      title={getModalTitle()}
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      width={600}
      confirmLoading={
        createCategoryMutation.isPending || updateCategoryMutation.isPending
      }
      okText={isEdit ? "Cập nhật" : "Tạo mới"}
      cancelText="Hủy"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          is_active: true,
        }}
      >
        {/* Parent Category Info (for sub-category) */}
        {isSubCategory && parentCategory && (
          <>
            <Row gutter={16}>
              <Col span={24}>
                <Text type="secondary">
                  Danh mục cha:{" "}
                  <Text strong>{parentCategory.category_name}</Text>
                </Text>
              </Col>
            </Row>
            <Divider />
          </>
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Tên danh mục"
              name="category_name"
              rules={[
                { required: true, message: "Vui lòng nhập tên danh mục!" },
                { min: 2, message: "Tên danh mục phải có ít nhất 2 ký tự!" },
                { max: 100, message: "Tên danh mục không được quá 100 ký tự!" },
              ]}
            >
              <Input
                placeholder="Nhập tên danh mục"
                onChange={handleNameChange}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="URL danh mục"
              name="category_url"
              rules={[
                { required: true, message: "Vui lòng nhập URL danh mục!" },
                {
                  pattern: /^[a-z0-9-]+$/,
                  message:
                    "URL chỉ được chứa chữ thường, số và dấu gạch ngang!",
                },
              ]}
            >
              <Input placeholder="url-danh-muc" addonBefore="/" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Loại danh mục"
              name="category_type"
              rules={[
                { required: true, message: "Vui lòng chọn loại danh mục!" },
              ]}
            >
              <Select placeholder="Chọn loại danh mục">
                <Option value="PRODUCT">Sản phẩm</Option>
                <Option value="SERVICE">Dịch vụ</Option>
                <Option value="PRODUCT_SYS">Sản phẩm hệ thống</Option>
                <Option value="SERVICE_SYS">Dịch vụ hệ thống</Option>
                <Option value="PROMOTION_SYS">Khuyến mãi hệ thống</Option>
                <Option value="OTHER">Khác</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Danh mục cha"
              name="parent_category_id"
              tooltip={
                isSubCategory
                  ? "Danh mục cha được xác định tự động"
                  : "Để trống nếu đây là danh mục gốc"
              }
            >
              <Select
                placeholder={
                  isSubCategory
                    ? "Danh mục cha"
                    : "Chọn danh mục cha (tùy chọn)"
                }
                allowClear={!isSubCategory}
                showSearch={!isSubCategory}
                disabled={isSubCategory}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children as unknown as string)
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {getAvailableParentCategories().map((cat) => (
                  <Option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Mô tả"
          name="description"
          rules={[{ max: 500, message: "Mô tả không được quá 500 ký tự!" }]}
        >
          <TextArea
            rows={3}
            placeholder="Nhập mô tả cho danh mục (tùy chọn)"
            showCount
            maxLength={500}
          />
        </Form.Item>

        <Form.Item label="Trạng thái" name="is_active" valuePropName="checked">
          <Switch
            checkedChildren="Hoạt động"
            unCheckedChildren="Không hoạt động"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CategoryModal;
