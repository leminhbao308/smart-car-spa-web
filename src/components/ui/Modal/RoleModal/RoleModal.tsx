"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Button,
  Divider,
  message,
  Row,
  Col,
  Space,
  Tag,
  Typography} from "antd";
import { 
  UserOutlined, 
  SafetyOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined
} from "@ant-design/icons";
import { Role, CreateRoleRequest, UpdateRoleRequest } from "@/lib/api/types";
import { RoleService } from "@/lib/api/services";
import { MemoizedInput, MemoizedTextArea, MemoizedInputNumber } from "@/components/ui/MemoizedComponents";

const { Text, Title } = Typography;

interface RoleModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (data: Role) => void;
  editData?: Role | null;
  viewMode?: boolean;
  title?: string;
}

const RoleModal: React.FC<RoleModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  editData,
  viewMode = false,
  title}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Determine modal title based on mode
  const getModalTitle = () => {
    if (title) return title;
    if (viewMode) return "Chi tiết vai trò";
    if (editData) return "Chỉnh sửa vai trò";
    return "Thêm vai trò mới";
  };

  useEffect(() => {
    if (visible) {
      if (editData || viewMode) {
        form.setFieldsValue({
          role_name: editData?.role_name,
          role_code: editData?.role_code,
          description: editData?.description});
      } else {
        form.resetFields();
      }
    }
  }, [visible, editData, viewMode, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      if (editData) {
        // Update existing role
        const updateData: UpdateRoleRequest = {
          role_name: values.role_name,
          description: values.description};
        
        const response = await RoleService.updateRole(editData.role_id, updateData);
        message.success("Cập nhật vai trò thành công!");
        onSuccess(response.data);
      } else {
        // Create new role
        const createData: CreateRoleRequest = {
          role_name: values.role_name,
          role_code: values.role_code,
          description: values.description};
        
        const response = await RoleService.createRole(createData);
        message.success("Tạo vai trò thành công!");
        onSuccess(response.data);
      }
      
      onCancel();
    } catch (error: unknown) {
      console.log("Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra. Vui lòng thử lại!";
      message.error(errorMessage);
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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {viewMode ? (
            <EyeOutlined style={{ color: "#52c41a" }} />
          ) : editData ? (
            <EditOutlined style={{ color: "#1890ff" }} />
          ) : (
            <PlusOutlined style={{ color: "#1890ff" }} />
          )}
          <span>{getModalTitle()}</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      width={600}
      footer={
        viewMode ? [
          <Button key="close" onClick={handleCancel}>
            Đóng
          </Button>,
        ] : [
          <Button key="cancel" onClick={handleCancel}>
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
        ]
      }
    >
      <Form
        form={form}
        layout="vertical"
        disabled={viewMode}
      >
        <Divider orientation="left">
          <SafetyOutlined style={{ marginRight: 8 }} />
          Thông tin vai trò
        </Divider>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Tên vai trò"
              name="role_name"
              rules={[
                { required: true, message: "Vui lòng nhập tên vai trò!" },
                { min: 2, message: "Tên vai trò phải có ít nhất 2 ký tự!" },
                { max: 100, message: "Tên vai trò không được vượt quá 100 ký tự!" },
              ]}
            >
              <MemoizedInput
                prefix={<UserOutlined />}
                placeholder="Nhập tên vai trò"
                maxLength={100}
                showCount
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
                { min: 2, message: "Mã vai trò phải có ít nhất 2 ký tự!" },
                { max: 20, message: "Mã vai trò không được vượt quá 20 ký tự!" },
              ]}
            >
              <MemoizedInput
                placeholder="Nhập mã vai trò (vd: ADMIN, MANAGER)"
                disabled={!!editData || viewMode}
                style={{ textTransform: 'uppercase' }}
                maxLength={20}
                showCount
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
            { max: 500, message: "Mô tả không được vượt quá 500 ký tự!" },
          ]}
        >
          <MemoizedTextArea
            rows={4}
            placeholder="Nhập mô tả chi tiết về vai trò này..."
            maxLength={500}
            showCount
          />
        </Form.Item>

        {/* Display role information in view mode */}
        {viewMode && editData && (
          <>
            <Divider orientation="left">
              <EyeOutlined style={{ marginRight: 8 }} />
              Thông tin bổ sung
            </Divider>
            
            <Row gutter={16}>
              <Col span={24}>
                <Space direction="vertical" size="small" style={{ width: "100%" }}>
                  <div>
                    <Text strong>ID vai trò:</Text>
                    <br />
                    <Text code style={{ fontSize: 12 }}>
                      {editData.role_id}
                    </Text>
                  </div>
                  
                  <div>
                    <Text strong>Loại vai trò:</Text>
                    <br />
                    <Tag color={editData.role_code === "CUSTOMER" ? "green" : "blue"}>
                      {editData.role_code === "CUSTOMER" ? "Khách hàng" : "Nhân viên"}
                    </Tag>
                  </div>
                  
                  {editData.permissions && editData.permissions.length > 0 && (
                    <div>
                      <Text strong>Quyền hạn:</Text>
                      <br />
                      <Space wrap>
                        {editData.permissions.map((permission) => (
                          <Tag key={permission.permission_id} color="purple">
                            {permission.permission_name}
                          </Tag>
                        ))}
                      </Space>
                    </div>
                  )}
                </Space>
              </Col>
            </Row>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default RoleModal;

