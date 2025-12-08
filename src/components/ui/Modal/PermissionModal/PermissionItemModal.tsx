"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Select,
  Button,
  message,
  Row,
  Col,
  Card,
  Typography,
  Tag} from "antd";
import { 
  SafetyOutlined, 
  InfoCircleOutlined
} from "@ant-design/icons";
import { permissionCategories } from "@/components/utils/data/permissions.data";
import { MemoizedInput, MemoizedTextArea, MemoizedInputNumber } from "@/components/ui/MemoizedComponents";

const { Text } = Typography;

interface PermissionItemModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (data: Record<string, unknown>) => void;
  editData?: Record<string, unknown>;
  title?: string;
}

const PermissionItemModal: React.FC<PermissionItemModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  editData,
  title = "Thêm quyền hạn mới"}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (editData) {
        form.setFieldsValue({
          ...editData});
      } else {
        form.resetFields();
      }
    }
  }, [visible, editData, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const permissionData = {
        ...values,
        id: editData?.id || Date.now(),
        createdAt: editData?.createdAt || new Date().toISOString().replace("T", " ").substring(0, 19),
        updatedAt: new Date().toISOString().replace("T", " ").substring(0, 19)};

      message.success(editData ? "Cập nhật quyền hạn thành công!" : "Tạo quyền hạn thành công!");
      onSuccess(permissionData);
      onCancel();
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <SafetyOutlined style={{ color: "#1890ff" }} />
          <span>{title}</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={600}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          {editData ? "Cập nhật" : "Tạo quyền hạn"}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Mã quyền hạn"
              name="code"
              rules={[
                { required: true, message: "Vui lòng nhập mã quyền hạn!" },
                { pattern: /^[a-z_]+$/, message: "Mã quyền hạn chỉ được chứa chữ thường và dấu gạch dưới!" },
              ]}
            >
              <MemoizedInput
                placeholder="Nhập mã quyền hạn (vd: user_management)"
                disabled={!!editData}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Tên quyền hạn"
              name="name"
              rules={[
                { required: true, message: "Vui lòng nhập tên quyền hạn!" },
                { min: 2, message: "Tên quyền hạn phải có ít nhất 2 ký tự!" },
              ]}
            >
              <MemoizedInput
                placeholder="Nhập tên quyền hạn"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Danh mục"
          name="category"
          rules={[
            { required: true, message: "Vui lòng chọn danh mục!" },
          ]}
        >
          <Select
            placeholder="Chọn danh mục quyền hạn"
            options={permissionCategories.map(cat => ({
              value: cat.value,
              label: (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Tag color={cat.color} style={{ margin: 0 }}>
                    {cat.label}
                  </Tag>
                </div>
              )}))}
          />
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="description"
          rules={[
            { required: true, message: "Vui lòng nhập mô tả!" },
            { min: 10, message: "Mô tả phải có ít nhất 10 ký tự!" },
          ]}
        >
          <MemoizedTextArea
            rows={3}
            placeholder="Nhập mô tả chi tiết về quyền hạn này..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PermissionItemModal;

