"use client";
import React, { useState } from "react";
import {
  Modal,
  Form,
  Select,
  Button,
  Row,
  Col,
  message,
  Typography,
  Card} from "antd";
import {
  PlusOutlined} from "@ant-design/icons";
import { useVehicleBrandsDropdown, useVehicleTypesDropdown } from "@/lib/api/hooks";
import { CreateVehicleModelRequest } from "@/lib/api/types";
import { VehicleService } from "@/lib/api/services/vehicle.service";
import { MemoizedInput, MemoizedTextArea } from "@/components/ui/MemoizedComponents";

const { Title } = Typography;
const { Option } = Select;

interface VehicleModelAddModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const VehicleModelAddModal: React.FC<VehicleModelAddModalProps> = ({
  visible,
  onCancel,
  onSuccess}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  // Get brands and types for dropdowns
  const { dropdownData: brands, loading: brandsLoading } = useVehicleBrandsDropdown();
  const { dropdownData: types, loading: typesLoading } = useVehicleTypesDropdown();

  const handleSubmit = async (values: {
    model_name: string;
    model_code: string;
    brand_id: string;
    type_id: string;
    description: string;
  }) => {
    setLoading(true);
    try {
      const modelData: CreateVehicleModelRequest = {
        model_name: values.model_name,
        model_code: values.model_code,
        brand_id: values.brand_id,
        type_id: values.type_id,
        description: values.description};

      // Call API to create model
      await VehicleService.createVehicleModel(modelData);
      onSuccess();
      form.resetFields();
      onCancel();
    } catch (error) {
      console.log("Error creating model:", error);
      message.error("Có lỗi xảy ra khi thêm model xe!");
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
          <PlusOutlined style={{ color: "#1890ff" }} />
          <Title level={4} style={{ margin: 0 }}>
            Thêm model xe mới
          </Title>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{}}
      >
        <Card title="Thông tin cơ bản" size="small">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                label="Tên model"
                name="model_name"
                rules={[
                  { required: true, message: "Vui lòng nhập tên model!" },
                  { min: 2, message: "Tên model phải có ít nhất 2 ký tự!" },
                ]}
              >
                <MemoizedInput placeholder="Nhập tên model" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Mã model"
                name="model_code"
                rules={[
                  { required: true, message: "Vui lòng nhập mã model!" },
                  {
                    pattern: /^[A-Z0-9_]+$/,
                    message:
                      "Mã model chỉ được chứa chữ hoa, số và dấu gạch dưới!"},
                ]}
              >
                <MemoizedInput placeholder="VD: CAMRY, CRV" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Hãng xe"
                name="brand_id"
                rules={[
                  { required: true, message: "Vui lòng chọn hãng xe!" },
                ]}
              >
                <Select placeholder="Chọn hãng xe" loading={brandsLoading}>
                  {brands.map((brand) => (
                    <Option key={brand.brand_id} value={brand.brand_id}>
                      {brand.brand_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Loại xe"
                name="type_id"
                rules={[
                  { required: true, message: "Vui lòng chọn loại xe!" },
                ]}
              >
                <Select placeholder="Chọn loại xe" loading={typesLoading}>
                  {types.map((type) => (
                    <Option key={type.type_id} value={type.type_id}>
                      {type.type_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Mô tả"
                name="description"
                rules={[
                  { required: true, message: "Vui lòng nhập mô tả!" },
                  { min: 10, message: "Mô tả phải có ít nhất 10 ký tự!" },
                ]}
              >
                <MemoizedTextArea
                  rows={4}
                  placeholder="Nhập mô tả về model xe..."
                  showCount
                  maxLength={500}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <div style={{ textAlign: "right", marginTop: 24 }}>
          <Button onClick={handleCancel} style={{ marginRight: 8 }}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Thêm model xe
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default VehicleModelAddModal;
