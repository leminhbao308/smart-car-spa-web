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
} from "@ant-design/icons";
import { categoryStatuses, categoryColors } from "@/components/utils/data/product-categories.data";

const { Option } = Select;
const { TextArea } = Input;

interface ProductCategory {
  id: number;
  categoryCode: string;
  categoryName: string;
  description: string;
  icon: string;
  color: string;
  parentId: null;
  status: string;
  totalProducts: number;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

interface ProductCategoryEditModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (data: ProductCategory) => void;
  editData?: ProductCategory | null;
}

const ProductCategoryEditModal: React.FC<ProductCategoryEditModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  editData,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && editData) {
      form.setFieldsValue({
        categoryName: editData.categoryName,
        categoryCode: editData.categoryCode,
        description: editData.description,
        icon: editData.icon,
        color: editData.color,
        status: editData.status,
        features: editData.features?.join(", ") || "",
      });
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, editData, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const updatedData = {
        ...editData,
        ...values,
        features: values.features ? values.features.split(",").map((f: string) => f.trim()).filter((f: string) => f) : [],
        updatedAt: new Date().toISOString(),
      };

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onSuccess(updatedData);
      message.success("Cập nhật loại sản phẩm thành công!");
      form.resetFields();
    } catch (error) {
      console.log("Form validation failed:", error);
      message.error("Vui lòng kiểm tra lại thông tin đã nhập!");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <Space>
          <EditOutlined />
          {editData ? "Chỉnh sửa loại sản phẩm" : "Thêm loại sản phẩm"}
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      width={800}
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
              label="Tên loại sản phẩm"
              name="categoryName"
              rules={[
                { required: true, message: "Vui lòng nhập tên loại sản phẩm!" },
                { max: 100, message: "Tên không được quá 100 ký tự!" },
              ]}
            >
              <Input placeholder="Nhập tên loại sản phẩm" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Mã danh mục"
              name="categoryCode"
              rules={[
                { required: true, message: "Vui lòng nhập mã danh mục!" },
                { max: 20, message: "Mã không được quá 20 ký tự!" },
              ]}
            >
              <Input placeholder="Nhập mã danh mục" />
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
            placeholder="Nhập mô tả loại sản phẩm"
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item
              label="Icon"
              name="icon"
              rules={[{ required: true, message: "Vui lòng chọn icon!" }]}
            >
              <Select placeholder="Chọn icon">
                <Option value="🧽">🧽 Làm sạch</Option>
                <Option value="🛋️">🛋️ Nội thất</Option>
                <Option value="🔧">🔧 Bảo dưỡng</Option>
                <Option value="🎨">🎨 Phụ kiện</Option>
                <Option value="🛠️">🛠️ Dụng cụ</Option>
                <Option value="🛡️">🛡️ An toàn</Option>
                <Option value="💎">💎 Cao cấp</Option>
                <Option value="🌱">🌱 Thân thiện môi trường</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="Màu sắc"
              name="color"
              rules={[{ required: true, message: "Vui lòng chọn màu sắc!" }]}
            >
              <Select placeholder="Chọn màu sắc">
                {categoryColors.map((color) => (
                  <Option key={color.value} value={color.value}>
                    <span style={{ color: color.color === "gold" ? "#faad14" : color.color === "lime" ? "#a0d911" : undefined }}>
                      {color.label}
                    </span>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>



        <Form.Item
          label="Trạng thái"
          name="status"
          rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
        >
          <Select placeholder="Chọn trạng thái">
            {categoryStatuses.map((status) => (
              <Option key={status.value} value={status.value}>
                {status.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Đặc điểm (cách nhau bởi dấu phẩy)"
          name="features"
          rules={[{ max: 1000, message: "Đặc điểm không được quá 1000 ký tự!" }]}
        >
          <TextArea
            rows={3}
            placeholder="Nhập các đặc điểm, cách nhau bởi dấu phẩy. Ví dụ: An toàn cho sơn xe, Hiệu quả cao, Dễ sử dụng"
            maxLength={1000}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProductCategoryEditModal;
