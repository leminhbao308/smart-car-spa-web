"use client";
import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Row,
  Col,
  Card,
  Typography,
  Space,
  Divider,
  Button,
  message,
  App,
} from "antd";
import {
  InfoCircleOutlined,
  SettingOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import {
  useCreateProductAttribute,
  useUpdateProductAttribute,
} from "@/lib/api/hooks/useProductManagement";
import { ProductAttribute } from "@/lib/api/types/product.types";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface ProductAttributeModalProps {
  visible: boolean;
  onCancel: () => void;
  editingAttribute?: ProductAttribute | null;
  onSuccess?: () => void;
}

const ProductAttributeModal: React.FC<ProductAttributeModalProps> = ({
  visible,
  onCancel,
  editingAttribute,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const isEditing = !!editingAttribute;

  const createMutation = useCreateProductAttribute();
  const updateMutation = useUpdateProductAttribute();

  const isLoading = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (visible) {
      if (editingAttribute) {
        form.setFieldsValue({
          attributeName: editingAttribute.attributeName,
          attributeCode: editingAttribute.attributeCode,
          unit: editingAttribute.unit,
          isRequired: editingAttribute.isRequired,
          dataType: editingAttribute.dataType,
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, editingAttribute, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (isEditing && editingAttribute) {
        await updateMutation.mutateAsync({
          attributeId: editingAttribute.attributeId,
          data: {
            attribute_name: values.attributeName,
            attribute_code: values.attributeCode,
            unit: values.unit,
            is_required: values.isRequired,
            data_type: values.dataType,
          },
        });
      } else {
        await createMutation.mutateAsync({
          attribute_name: values.attributeName,
          attribute_code: values.attributeCode,
          unit: values.unit,
          is_required: values.isRequired,
          data_type: values.dataType,
        });
      }
      
      onSuccess?.();
    } catch (error) {
      console.error("Error saving attribute:", error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const dataTypeOptions = [
    { value: "STRING", label: "Chuỗi (STRING)", description: "Dữ liệu văn bản ngắn" },
    { value: "TEXT", label: "Văn bản (TEXT)", description: "Dữ liệu văn bản dài" },
    { value: "NUMBER", label: "Số (NUMBER)", description: "Số thực" },
    { value: "INTEGER", label: "Số nguyên (INTEGER)", description: "Số nguyên" },
    { value: "DECIMAL", label: "Thập phân (DECIMAL)", description: "Số thập phân" },
    { value: "BOOLEAN", label: "Boolean (BOOLEAN)", description: "True/False" },
    { value: "DATE", label: "Ngày (DATE)", description: "Ngày tháng" },
  ];

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <SettingOutlined style={{ color: "#1890ff" }} />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {isEditing ? "Chỉnh sửa thuộc tính sản phẩm" : "Thêm thuộc tính sản phẩm"}
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {isEditing ? "Cập nhật thông tin thuộc tính" : "Tạo thuộc tính mới cho sản phẩm"}
            </Text>
          </div>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      width={800}
      footer={null}
      styles={{
        body: {
          padding: "24px",
          maxHeight: "70vh",
          overflowY: "auto",
        },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={handleOk}
      >
        <Row gutter={[24, 0]}>
          {/* Cột trái - Thông tin cơ bản */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <InfoCircleOutlined />
                  Thông tin cơ bản
                </Space>
              }
              size="small"
              style={{ height: "100%" }}
            >
              <Form.Item
                name="attributeName"
                label="Tên thuộc tính"
                rules={[
                  { required: true, message: "Vui lòng nhập tên thuộc tính" },
                  { max: 100, message: "Tên thuộc tính không được vượt quá 100 ký tự" },
                ]}
              >
                <Input placeholder="Ví dụ: Màu sắc, Kích thước, Trọng lượng" />
              </Form.Item>

              <Form.Item
                name="attributeCode"
                label="Mã thuộc tính"
                rules={[
                  { required: true, message: "Vui lòng nhập mã thuộc tính" },
                  { max: 50, message: "Mã thuộc tính không được vượt quá 50 ký tự" },
                  { pattern: /^[A-Z_]+$/, message: "Mã thuộc tính chỉ được chứa chữ hoa và dấu gạch dưới" },
                ]}
              >
                <Input placeholder="Ví dụ: COLOR, SIZE, WEIGHT" />
              </Form.Item>

              <Form.Item
                name="unit"
                label="Đơn vị"
                rules={[
                  { max: 20, message: "Đơn vị không được vượt quá 20 ký tự" },
                ]}
              >
                <Input placeholder="Ví dụ: kg, cm, lít, cái" />
              </Form.Item>
            </Card>
          </Col>

          {/* Cột phải - Cấu hình */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <SettingOutlined />
                  Cấu hình
                </Space>
              }
              size="small"
              style={{ height: "100%" }}
            >
              <Form.Item
                name="dataType"
                label="Loại dữ liệu"
                rules={[{ required: true, message: "Vui lòng chọn loại dữ liệu" }]}
                initialValue="STRING"
              >
                <Select placeholder="Chọn loại dữ liệu">
                  {dataTypeOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      <div>
                        <div>{option.label}</div>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {option.description}
                        </Text>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="isRequired"
                label="Bắt buộc"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch
                  checkedChildren="Bắt buộc"
                  unCheckedChildren="Tùy chọn"
                />
              </Form.Item>

              <Divider style={{ margin: "16px 0" }} />

              <div style={{ padding: "12px", backgroundColor: "#f6f8fa", borderRadius: 6 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <InfoCircleOutlined style={{ marginRight: 4 }} />
                  <strong>Lưu ý:</strong> Mã thuộc tính phải là duy nhất và không được trùng lặp.
                  Sử dụng chữ hoa và dấu gạch dưới để phân tách từ.
                </Text>
              </div>
            </Card>
          </Col>
        </Row>

        <Divider style={{ margin: "24px 0" }} />

        {/* Footer */}
        <Row justify="end" gutter={12}>
          <Col>
            <Button
              icon={<CloseOutlined />}
              onClick={handleCancel}
              disabled={isLoading}
            >
              Hủy
            </Button>
          </Col>
          <Col>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={isLoading}
            >
              {isEditing ? "Cập nhật" : "Tạo mới"}
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default ProductAttributeModal;
