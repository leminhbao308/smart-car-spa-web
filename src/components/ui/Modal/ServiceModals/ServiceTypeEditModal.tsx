"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Select,
  Button,
  Space,
  App,
  Row,
  Col,
} from "antd";
import {
  EditOutlined,
  SaveOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { SERVICE_TYPE_STATUS_OPTIONS } from "@/lib/api/types/service-type.types";
import { ServiceType } from "@/lib/api/types/service-type.types";
import { MemoizedInput, MemoizedTextArea, MemoizedInputNumber } from "@/components/ui/MemoizedComponents";

const { Option } = Select;

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
  const { message } = App.useApp();

  useEffect(() => {
    if (visible && editData) {
      form.setFieldsValue({
        code: editData.code,
        name: editData.name,
        description: editData.description,
        defaultDuration: editData.defaultDuration,
        isActive: editData.isActive,
      });
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, editData, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const updatedData: ServiceType = {
        ...editData,
        ...values,
      } as ServiceType;

      onSuccess(updatedData);
      message.success(editData ? "Cập nhật loại dịch vụ thành công!" : "Thêm loại dịch vụ thành công!");
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
              name="name"
              rules={[
                { required: true, message: "Vui lòng nhập tên loại dịch vụ!" },
                { max: 100, message: "Tên loại dịch vụ không được quá 100 ký tự!" },
              ]}
            >
              <MemoizedInput placeholder="Nhập tên loại dịch vụ" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Mã loại dịch vụ"
              name="code"
              rules={[
                { required: true, message: "Vui lòng nhập mã loại dịch vụ!" },
                { max: 50, message: "Mã loại dịch vụ không được quá 50 ký tự!" },
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
            { max: 1000, message: "Mô tả không được quá 1000 ký tự!" },
          ]}
        >
          <MemoizedTextArea
            rows={3}
            placeholder="Nhập mô tả loại dịch vụ"
            maxLength={1000}
            showCount
          />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Thời gian mặc định (phút)"
              name="defaultDuration"
              rules={[
                { type: "number", min: 1, message: "Thời gian phải lớn hơn 0!" },
              ]}
            >
              <MemoizedInputNumber
                placeholder="Nhập thời gian mặc định"
                min={1}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Trạng thái"
              name="isActive"
              rules={[]}
            >
              <Select placeholder="Chọn trạng thái">
                {SERVICE_TYPE_STATUS_OPTIONS.map((status) => (
                  <Option key={status.value.toString()} value={status.value}>
                    {status.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

      </Form>
    </Modal>
  );
};

export default ServiceTypeEditModal;

