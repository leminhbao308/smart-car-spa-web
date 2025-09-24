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
  Card,
  Checkbox,
  Typography,
  Tag,
} from "antd";
import { 
  UserOutlined, 
  SafetyOutlined,
  CheckCircleOutlined 
} from "@ant-design/icons";
import { allPermissions, permissionCategories } from "@/components/utils/data/permissions.data";

const { TextArea } = Input;
const { Text } = Typography;

interface PermissionModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (data: Record<string, unknown>) => void;
  editData?: Record<string, unknown>;
  title?: string;
}

const PermissionModal: React.FC<PermissionModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  editData,
  title = "Thêm vai trò mới",
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      if (editData) {
        form.setFieldsValue({
          ...editData,
        });
        setSelectedPermissions((editData.permissions as string[]) || []);
      } else {
        form.resetFields();
        setSelectedPermissions([]);
      }
    }
  }, [visible, editData, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const roleData = {
        ...values,
        id: editData?.id || Date.now(),
        permissions: selectedPermissions,
        userCount: editData?.userCount || 0,
        status: editData?.status || "active",
        createdAt: editData?.createdAt || new Date().toISOString().replace("T", " ").substring(0, 19),
        updatedAt: new Date().toISOString().replace("T", " ").substring(0, 19),
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

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permission]);
    } else {
      setSelectedPermissions(selectedPermissions.filter(p => p !== permission));
    }
  };

  const handleCategorySelect = (category: string, checked: boolean) => {
    const categoryPermissions = allPermissions
      .filter(p => p.category === category)
      .map(p => p.code);
    
    if (checked) {
      // Add all permissions in this category
      const newPermissions = [...new Set([...selectedPermissions, ...categoryPermissions])];
      setSelectedPermissions(newPermissions);
    } else {
      // Remove all permissions in this category
      setSelectedPermissions(selectedPermissions.filter(p => !categoryPermissions.includes(p)));
    }
  };

  const isCategorySelected = (category: string) => {
    const categoryPermissions = allPermissions
      .filter(p => p.category === category)
      .map(p => p.code);
    return categoryPermissions.every(p => selectedPermissions.includes(p));
  };

  const isCategoryPartiallySelected = (category: string) => {
    const categoryPermissions = allPermissions
      .filter(p => p.category === category)
      .map(p => p.code);
    const selectedInCategory = categoryPermissions.filter(p => selectedPermissions.includes(p));
    return selectedInCategory.length > 0 && selectedInCategory.length < categoryPermissions.length;
  };

  const getPermissionInfo = (code: string) => {
    return allPermissions.find(p => p.code === code);
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
      width={900}
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
        initialValues={{
          status: "active",
        }}
      >
        <Divider orientation="left">Thông tin cơ bản</Divider>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Tên vai trò"
              name="name"
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
              name="code"
              rules={[
                { required: true, message: "Vui lòng nhập mã vai trò!" },
                { pattern: /^[a-z_]+$/, message: "Mã vai trò chỉ được chứa chữ thường và dấu gạch dưới!" },
              ]}
            >
              <Input
                placeholder="Nhập mã vai trò (vd: admin, manager)"
                disabled={!!editData}
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

        <Divider orientation="left">Phân quyền</Divider>
        
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ marginBottom: 8, display: "block" }}>
            Chọn quyền hạn cho vai trò này:
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Bạn có thể chọn theo danh mục hoặc chọn từng quyền cụ thể
          </Text>
        </div>

        <Row gutter={[16, 16]}>
          {permissionCategories.map((category) => {
            const categoryPermissions = allPermissions.filter(p => p.category === category.value);
            const isSelected = isCategorySelected(category.value);
            const isPartiallySelected = isCategoryPartiallySelected(category.value);
            
            return (
              <Col span={12} key={category.value}>
                <Card
                  size="small"
                  title={
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Checkbox
                        checked={isSelected}
                        indeterminate={isPartiallySelected}
                        onChange={(e) => handleCategorySelect(category.value, e.target.checked)}
                      />
                      <Tag color={category.color}>{category.label}</Tag>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        ({categoryPermissions.length} quyền)
                      </Text>
                    </div>
                  }
                  style={{ height: "100%" }}
                >
                  <div style={{ maxHeight: 200, overflowY: "auto" }}>
                    {categoryPermissions.map((permission) => (
                      <div key={permission.code} style={{ marginBottom: 8 }}>
                        <Checkbox
                          checked={selectedPermissions.includes(permission.code)}
                          onChange={(e) => handlePermissionChange(permission.code, e.target.checked)}
                        >
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 13 }}>
                              {permission.name}
                            </div>
                            <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>
                              {permission.description}
                            </div>
                          </div>
                        </Checkbox>
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>

        {selectedPermissions.length > 0 && (
          <div style={{ marginTop: 16, padding: 12, backgroundColor: "#f6ffed", borderRadius: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <CheckCircleOutlined style={{ color: "#52c41a" }} />
              <Text strong style={{ color: "#52c41a" }}>
                Đã chọn {selectedPermissions.length} quyền:
              </Text>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {selectedPermissions.map((permissionCode) => {
                const permission = getPermissionInfo(permissionCode);
                return (
                  <Tag key={permissionCode} color="green" style={{ fontSize: 11 }}>
                    {permission?.name || permissionCode}
                  </Tag>
                );
              })}
            </div>
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default PermissionModal;
