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
  Card} from "antd";
import {
  EditOutlined,
  SaveOutlined,
  PlusOutlined} from "@ant-design/icons";
import { serviceTypeStatuses, serviceTypeColors } from "@/components/utils/data/service-types.data";
import { MemoizedInput, MemoizedTextArea, MemoizedInputNumber } from "@/components/ui/MemoizedComponents";

const { Option } = Select;

interface ServiceType {
  id: number;
  serviceTypeCode: string;
  serviceTypeName: string;
  description: string;
  icon: string;
  color: string;
  status: string;
  totalServices: number;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

interface ServiceTypeEditModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (data: ServiceType) => void;
  editData?: ServiceType | null;
}

const ServiceTypeEditModal: React.FC<ServiceTypeEditModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  editData}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [features, setFeatures] = useState<string[]>([]);

  useEffect(() => {
    if (visible && editData) {
      form.setFieldsValue({
        serviceTypeName: editData.serviceTypeName,
        serviceTypeCode: editData.serviceTypeCode,
        description: editData.description,
        icon: editData.icon,
        color: editData.color,
        status: editData.status});
      setFeatures(editData.features || []);
    } else if (visible) {
      form.resetFields();
      setFeatures([]);
    }
  }, [visible, editData, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const updatedData = {
        ...editData,
        ...values,
        features,
        updatedAt: new Date().toISOString(),
        createdAt: editData?.createdAt || new Date().toISOString()};

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onSuccess(updatedData);
      message.success(editData ? "Cập nhật loại dịch vụ thành công!" : "Thêm loại dịch vụ thành công!");
      form.resetFields();
      setFeatures([]);
    } catch (error) {
      console.log("Form validation failed:", error);
      message.error("Vui lòng kiểm tra lại thông tin đã nhập!");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFeatures([]);
    onCancel();
  };

  const addFeature = () => {
    setFeatures([...features, ""]);
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const removeFeature = (index: number) => {
    const newFeatures = features.filter((_, i) => i !== index);
    setFeatures(newFeatures);
  };

  return (
    <Modal
      title={
        <Space>
          {editData ? <EditOutlined /> : <PlusOutlined />}
          {editData ? "Chỉnh sửa loại dịch vụ" : "Thêm loại dịch vụ"}
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
              label="Tên loại dịch vụ"
              name="serviceTypeName"
              rules={[
                { required: true, message: "Vui lòng nhập tên loại dịch vụ!" },
                { max: 100, message: "Tên không được quá 100 ký tự!" },
              ]}
            >
              <MemoizedInput placeholder="Nhập tên loại dịch vụ" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Mã loại dịch vụ"
              name="serviceTypeCode"
              rules={[
                { required: true, message: "Vui lòng nhập mã loại dịch vụ!" },
                { max: 20, message: "Mã không được quá 20 ký tự!" },
              ]}
            >
              <MemoizedInput placeholder="Nhập mã loại dịch vụ" />
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
            placeholder="Nhập mô tả loại dịch vụ"
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
                <Option value="🔧">🔧 Bảo dưỡng</Option>
                <Option value="✨">✨ Làm đẹp</Option>
                <Option value="🔍">🔍 Kiểm định</Option>
                <Option value="🚨">🚨 Cứu hộ</Option>
                <Option value="💎">💎 Cao cấp</Option>
                <Option value="💬">💬 Tư vấn</Option>
                <Option value="📦">📦 Gói dịch vụ</Option>
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
                {serviceTypeColors.map((color) => (
                  <Option key={color.value} value={color.value}>
                    <span style={{ color: color.color === "gold" ? "#faad14" : color.color === "lime" ? "#a0d911" : undefined }}>
                      {color.label}
                    </span>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="Trạng thái"
              name="status"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
            >
              <Select placeholder="Chọn trạng thái">
                {serviceTypeStatuses.map((status) => (
                  <Option key={status.value} value={status.value}>
                    {status.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Đặc điểm */}
        <Card
          title="Đặc điểm dịch vụ"
          size="small"
          extra={
            <Button
              type="dashed"
              size="small"
              icon={<PlusOutlined />}
              onClick={addFeature}
            >
              Thêm đặc điểm
            </Button>
          }
        >
          {features.map((feature, index) => (
            <Row key={index} gutter={8} style={{ marginBottom: 8 }}>
              <Col span={20}>
                <MemoizedInput
                  placeholder="Nhập đặc điểm"
                  value={feature}
                  onChange={(e) => updateFeature(index, e.target.value)}
                />
              </Col>
              <Col span={4}>
                <Button
                  type="text"
                  danger
                  onClick={() => removeFeature(index)}
                >
                  Xóa
                </Button>
              </Col>
            </Row>
          ))}
          {features.length === 0 && (
            <div style={{ textAlign: "center", color: "#999", padding: "20px" }}>
              Chưa có đặc điểm nào
            </div>
          )}
        </Card>
      </Form>
    </Modal>
  );
};

export default ServiceTypeEditModal;

