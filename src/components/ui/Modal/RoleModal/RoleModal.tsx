"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Divider,
  message,
  Row,
  Col,
} from "antd";
import { 
  UserOutlined, 
  SafetyOutlined
} from "@ant-design/icons";
import { Role } from "@/lib/api/types";

const { TextArea } = Input;

interface RoleModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (data: Role) => void;
  editData?: Role | null;
  title?: string;
}

const RoleModal: React.FC<RoleModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  editData,
  title = "Thêm vai trò mới",
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (editData) {
        form.setFieldsValue({
          role_name: editData.role_name,
          role_code: editData.role_code,
          description: editData.description,
        });
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
      
      const roleData: Role = {
        role_id: editData?.role_id || `role_${Date.now()}`,
        role_name: values.role_name,
        role_code: values.role_code,
        description: values.description,
      };

      message.success(editData ? "Cập nhật vai trò thành công!" : "Tạo vai trò thành công!");
      onSuccess(roleData);
      onCancel();
    } catch (error) {
      console.error("Error:", error);
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
          {editData ? "Cập nhật" : "Tạo vai trò"}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Divider orientation="left">Thông tin vai trò</Divider>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Tên vai trò"
              name="role_name"
              rules={[
                { required: true, message: "Vui lòng nhập tên vai trò!" },
                { min: 2, message: "Tên vai trò phải có ít nhất 2 ký tự!" },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Nhập tên vai trò"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Mã vai trò"
              name="role_code"
              rules={[
                { required: true, message: "Vui lòng nhập mã vai trò!" },
                { pattern: /^[A-Z_]+$/, message: "Mã vai trò chỉ được chứa chữ hoa và dấu gạch dưới!" },
              ]}
            >
              <Input
                placeholder="Nhập mã vai trò (vd: ADMIN, MANAGER)"
                disabled={!!editData}
                style={{ textTransform: 'uppercase' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Mô tả"
          name="description"
          rules={[
            { required: true, message: "Vui lòng nhập mô tả!" },
            { min: 10, message: "Mô tả phải có ít nhất 10 ký tự!" },
          ]}
        >
          <TextArea
            rows={3}
            placeholder="Nhập mô tả chi tiết về vai trò này..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RoleModal;
