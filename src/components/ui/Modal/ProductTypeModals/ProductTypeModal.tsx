"use client";
import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select, Button, Space, App } from "antd";
import { useCreateProductType, useUpdateProductType } from "@/lib/api/hooks/useProductTypes";
import { useActiveCategories } from "@/lib/api/hooks/useCategories";
import { ProductType, CreateProductTypeRequest, UpdateProductTypeRequest } from "@/lib/api/types/product.types";

const { TextArea } = Input;
const { Option } = Select;

interface ProductTypeModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  initialData?: ProductType | null;
}

const ProductTypeModal: React.FC<ProductTypeModalProps> = ({
  open,
  onCancel,
  onSuccess,
  initialData,
}) => {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const createMutation = useCreateProductType();
  const updateMutation = useUpdateProductType();
  const { data: categoriesData, isLoading: categoriesLoading } = useActiveCategories();

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        productTypeName: initialData.product_type_name,
        productTypeCode: initialData.product_type_code,
        description: initialData.description,
        categoryId: initialData.category_id,
      });
    } else {
      form.resetFields();
    }
  }, [initialData, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (initialData) {
        // Update existing product type
        const updateData: UpdateProductTypeRequest = {
          product_type_name: values.productTypeName,
          product_type_code: values.productTypeCode,
          description: values.description,
          category_id: values.categoryId,
        };

        await updateMutation.mutateAsync({
          productTypeId: initialData.product_type_id,
          data: updateData,
        });
      } else {
        // Create new product type
        const createData: CreateProductTypeRequest = {
          product_type_name: values.productTypeName,
          product_type_code: values.productTypeCode,
          description: values.description,
          category_id: values.categoryId,
        };

        await createMutation.mutateAsync(createData);
      }

      onSuccess();
    } catch (error) {
      console.error("Form validation or submission error:", error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={initialData ? "Chỉnh sửa loại sản phẩm" : "Thêm loại sản phẩm mới"}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      width={600}
      confirmLoading={createMutation.isPending || updateMutation.isPending}
      okText={initialData ? "Cập nhật" : "Tạo mới"}
      cancelText="Hủy"
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
      >
        <Form.Item
          name="productTypeName"
          label="Tên loại sản phẩm"
          rules={[
            { required: true, message: "Vui lòng nhập tên loại sản phẩm" },
            { max: 255, message: "Tên loại sản phẩm không được vượt quá 255 ký tự" },
          ]}
        >
          <Input placeholder="Nhập tên loại sản phẩm" />
        </Form.Item>

        <Form.Item
          name="productTypeCode"
          label="Mã loại sản phẩm"
          rules={[
            { required: true, message: "Vui lòng nhập mã loại sản phẩm" },
            { max: 100, message: "Mã loại sản phẩm không được vượt quá 100 ký tự" },
            { pattern: /^[A-Z0-9_]+$/, message: "Mã loại sản phẩm chỉ được chứa chữ hoa, số và dấu gạch dưới" },
          ]}
        >
          <Input placeholder="Nhập mã loại sản phẩm (VD: TIRE_PREMIUM)" />
        </Form.Item>

        <Form.Item
          name="categoryId"
          label="Danh mục"
          rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
        >
          <Select 
            placeholder="Chọn danh mục"
            loading={categoriesLoading}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              String(option?.children || '').toLowerCase().includes(input.toLowerCase())
            }
          >
            {categoriesData?.data?.map((category) => (
              <Option key={category.category_id} value={category.category_id}>
                {category.category_name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
          rules={[
            { max: 1000, message: "Mô tả không được vượt quá 1000 ký tự" },
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Nhập mô tả loại sản phẩm (tùy chọn)"
          />
        </Form.Item>

        {initialData && (
          <Form.Item
            name="version"
            label="Phiên bản"
          >
            <InputNumber
              min={0}
              disabled
              style={{ width: "100%" }}
              addonBefore="v"
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export { ProductTypeModal };
