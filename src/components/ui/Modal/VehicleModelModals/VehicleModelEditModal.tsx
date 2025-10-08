"use client";
import React, { useState, useEffect } from "react";
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
  EditOutlined} from "@ant-design/icons";
import { useVehicleBrandsDropdown, useVehicleTypesDropdown } from "@/lib/api/hooks";
import { useVehicleModels } from "@/lib/api/hooks/useVehicleModels";
import { UpdateVehicleModelRequest, VehicleModel } from "@/lib/api/types";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface VehicleModelEditModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  modelData: VehicleModel | null;
}

const VehicleModelEditModal: React.FC<VehicleModelEditModalProps> = ({
  visible,
  onClose,
  onSuccess,
  modelData}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  // Get brands and types for dropdowns
  const { dropdownData: brands, loading: brandsLoading } = useVehicleBrandsDropdown();
  const { dropdownData: types, loading: typesLoading } = useVehicleTypesDropdown();
  const { updateModel } = useVehicleModels();

  // Set form values when modelData changes
  useEffect(() => {
    if (visible && modelData) {
      form.setFieldsValue({
        model_name: modelData.model_name,
        model_code: modelData.model_code,
        brand_id: modelData.brand_id,
        type_id: modelData.type_id,
        description: modelData.description});
    }
  }, [visible, modelData, form]);

  const handleSubmit = async (values: {
    model_name: string;
    model_code: string;
    brand_id: string;
    type_id: string;
    description: string;
  }) => {
    if (!modelData) return;
    
    setLoading(true);
    try {
      const updateData: UpdateVehicleModelRequest = {
        model_name: values.model_name,
        model_code: values.model_code,
        brand_id: values.brand_id,
        type_id: values.type_id,
        description: values.description};

      // Call API to update model
      await updateModel(modelData.model_id, updateData);
      onSuccess();
      form.resetFields();
      onClose();
    } catch (error) {
      console.error("Error updating model:", error);
      message.error("Có lỗi xảy ra khi cập nhật model xe!");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <EditOutlined style={{ color: "#1890ff" }} />
          <Title level={4} style={{ margin: 0 }}>
            Chỉnh sửa model xe
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
            Cập nhật model xe
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default VehicleModelEditModal;
