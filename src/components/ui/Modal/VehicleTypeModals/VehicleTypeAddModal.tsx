"use client";
import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { CreateVehicleTypeRequest } from "@/lib/api/types";
import { VehicleService } from "@/lib/api/services/vehicle.service";

interface VehicleTypeAddModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const VehicleTypeAddModal: React.FC<VehicleTypeAddModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: {
    typeName: string;
    typeCode: string;
    description: string;
  }) => {
    setLoading(true);
    try {
      const createData: CreateVehicleTypeRequest = {
        type_name: values.typeName,
        type_code: values.typeCode,
        description: values.description,
      };

      await VehicleService.createVehicleType(createData);
      message.success("Tạo loại xe thành công!");
      form.resetFields();
      onSuccess();
    } catch (error) {
      console.error("Create vehicle type error:", error);
      message.error("Tạo loại xe thất bại!");
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
      title="Thêm loại xe mới"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          typeName: "",
          typeCode: "",
          description: "",
        }}
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
              icon={<PlusOutlined />}
            >
              Tạo loại xe
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default VehicleTypeAddModal;