"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  message,
} from "antd";
import { EditOutlined } from "@ant-design/icons";
import { VehicleType, UpdateVehicleTypeRequest } from "@/lib/api/types";
import { VehicleService } from "@/lib/api/services/vehicle.service";

interface VehicleTypeEditModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  typeData: VehicleType | null;
}

const VehicleTypeEditModal: React.FC<VehicleTypeEditModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  typeData,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && typeData) {
      form.setFieldsValue({
        typeName: typeData.type_name,
        typeCode: typeData.type_code,
        description: typeData.description,
      });
    }
  }, [visible, typeData, form]);

  const handleSubmit = async (values: {
    typeName: string;
    typeCode: string;
    description: string;
  }) => {
    if (!typeData) return;

    setLoading(true);
    try {
      const updateData: UpdateVehicleTypeRequest = {
        type_name: values.typeName,
        type_code: values.typeCode,
        description: values.description,
      };

      await VehicleService.updateVehicleType(typeData.type_id, updateData);
      message.success("Cập nhật loại xe thành công!");
      form.resetFields();
      onSuccess();
    } catch (error) {
      console.error("Update vehicle type error:", error);
      message.error("Cập nhật loại xe thất bại!");
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
      title="Chỉnh sửa loại xe"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          label="Tên loại xe"
          name="typeName"
          rules={[
            { required: true, message: "Vui lòng nhập tên loại xe!" },
            { min: 2, message: "Tên loại xe phải có ít nhất 2 ký tự!" },
            { max: 100, message: "Tên loại xe không được quá 100 ký tự!" },
          ]}
        >
          <Input placeholder="Nhập tên loại xe" />
        </Form.Item>

        <Form.Item
          label="Mã loại xe"
          name="typeCode"
          rules={[
            { required: true, message: "Vui lòng nhập mã loại xe!" },
            { min: 2, message: "Mã loại xe phải có ít nhất 2 ký tự!" },
            { max: 20, message: "Mã loại xe không được quá 20 ký tự!" },
            {
              pattern: /^[A-Z0-9_]+$/,
              message: "Mã loại xe chỉ được chứa chữ hoa, số và dấu gạch dưới!",
            },
          ]}
        >
          <Input placeholder="Nhập mã loại xe (VD: SEDAN, SUV)" />
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="description"
          rules={[
            { max: 500, message: "Mô tả không được quá 500 ký tự!" },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Nhập mô tả loại xe"
            showCount
            maxLength={500}
          />
        </Form.Item>

        <Form.Item className="mb-0">
          <div className="flex justify-end gap-2">
            <Button onClick={handleCancel} size="large">
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              icon={<EditOutlined />}
            >
              Cập nhật loại xe
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default VehicleTypeEditModal;