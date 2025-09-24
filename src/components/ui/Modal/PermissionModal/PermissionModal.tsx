"use client";
import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, message, Select } from "antd";
import { Permission } from "@/lib/api/types";

const { TextArea } = Input;

interface PermissionModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (data: Permission) => void;
  editData?: Permission | null;
  title?: string;
}

const PermissionModal: React.FC<PermissionModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  editData,
  title = "Thêm quyền hạn mới",
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Mock data for modules
  const modules = [
    "Dashboard",
    "User Management", 
    "Booking",
    "Product",
    "Service",
    "Inventory",
    "Sales",
    "Report",
    "Vehicle Management",
    "Promotion",
    "Center Management"
  ];

  useEffect(() => {
    if (visible) {
      if (editData) {
        form.setFieldsValue(editData);
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

      const permissionData: Permission = {
        permission_id: editData?.permission_id || `perm_${Date.now()}`,
        permission_name: values.permission_name,
        permission_code: values.permission_code,
        module: values.module,
        description: values.description,
      };

      message.success(editData ? "Cập nhật quyền hạn thành công!" : "Tạo quyền hạn thành công!");
      onSuccess(permissionData);
      onCancel();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={title}
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
          {editData ? "Cập nhật" : "Tạo mới"}
        </Button>,
      ]}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        style={{ marginTop: 16 }}
      >
        <Form.Item
          name="permission_name"
          label="Tên quyền hạn"
          rules={[
            { required: true, message: "Vui lòng nhập tên quyền hạn!" },
            { max: 100, message: "Tên quyền hạn không được quá 100 ký tự!" },
          ]}
        >
          <Input placeholder="Nhập tên quyền hạn" />
        </Form.Item>

        <Form.Item
          name="permission_code"
          label="Mã quyền hạn"
          rules={[
            { required: true, message: "Vui lòng nhập mã quyền hạn!" },
            { 
              pattern: /^[A-Z_]+$/, 
              message: "Mã quyền hạn chỉ được chứa chữ hoa và dấu gạch dưới!" 
            },
            { max: 50, message: "Mã quyền hạn không được quá 50 ký tự!" },
          ]}
        >
          <Input 
            placeholder="VD: USER_MANAGE, DASHBOARD_VIEW" 
            style={{ fontFamily: "monospace" }}
          />
        </Form.Item>

        <Form.Item
          name="module"
          label="Module"
          rules={[{ required: true, message: "Vui lòng chọn module!" }]}
        >
          <Select
            placeholder="Chọn module"
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={modules.map(module => ({
              value: module,
              label: module,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
          rules={[
            { required: true, message: "Vui lòng nhập mô tả!" },
            { max: 500, message: "Mô tả không được quá 500 ký tự!" },
          ]}
        >
          <TextArea
            rows={3}
            placeholder="Nhập mô tả chi tiết về quyền hạn này"
            showCount
            maxLength={500}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PermissionModal;