"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  Select,
  Button,
  Space,
  Row,
  Col,
  Typography,
  Tag,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import {
  MemoizedInput,
  MemoizedInputNumber,
} from "@/components/ui/MemoizedComponents";
import { useActiveProductAttributes } from "@/lib/api/hooks/useProductAttributes";
import {
  ProductAttributeValue,
  CreateProductAttributeValueRequest,
} from "@/lib/api/types/product.types";
import { ProductAttributeInfoDto } from "@/lib/api/types/product-attribute.types";

const { Option } = Select;
const { Text } = Typography;

interface ProductAttributeManagerProps {
  productId?: string;
  initialAttributeValues?: ProductAttributeValue[];
  onChange?: (attributeValues: CreateProductAttributeValueRequest[]) => void;
  disabled?: boolean;
}

interface AttributeFormData {
  attribute_id: string;
  value_text?: string;
  value_number?: number;
}

const ProductAttributeManager: React.FC<ProductAttributeManagerProps> = ({
  productId,
  initialAttributeValues = [],
  onChange,
  disabled = false,
}) => {
  const [attributeForms, setAttributeForms] = useState<AttributeFormData[]>([]);
  const [availableAttributes, setAvailableAttributes] = useState<
    ProductAttributeInfoDto[]
  >([]);

  const { data: productAttributesData, isLoading: attributesLoading } =
    useActiveProductAttributes();

  // Load available attributes
  useEffect(() => {
    if (productAttributesData?.data) {
      setAvailableAttributes(productAttributesData.data);
    }
  }, [productAttributesData]);

  // Initialize attribute forms from initial values
  useEffect(() => {
    if (initialAttributeValues.length > 0) {
      const forms = initialAttributeValues.map((attr) => ({
        attribute_id: attr.attribute_id,
        value_text: attr.value_text || undefined,
        value_number: attr.value_number || undefined,
      }));
      setAttributeForms(forms);
    } else {
      // Reset forms when no initial values
      setAttributeForms([]);
    }
  }, [initialAttributeValues]);

  // Get available attributes that are not already selected
  const getAvailableAttributes = (currentIndex: number) => {
    const selectedAttributeIds = attributeForms
      .filter((_, index) => index !== currentIndex)
      .map((form) => form.attribute_id)
      .filter(Boolean);

    return availableAttributes.filter(
      (attr) => !selectedAttributeIds.includes(attr.attribute_id)
    );
  };

  // Get attribute info by ID
  const getAttributeInfo = (attributeId: string) => {
    return availableAttributes.find(
      (attr) => attr.attribute_id === attributeId
    );
  };

  // Add new attribute form
  const addAttributeForm = () => {
    const newForm: AttributeFormData = {
      attribute_id: "",
      value_text: undefined,
      value_number: undefined,
    };
    const newForms = [...attributeForms, newForm];
    setAttributeForms(newForms);
    handleAttributeChange(newForms);
  };

  // Remove attribute form
  const removeAttributeForm = (index: number) => {
    const newForms = attributeForms.filter((_, i) => i !== index);
    setAttributeForms(newForms);
    handleAttributeChange(newForms);
  };

  // Clear all forms
  const clearAllForms = () => {
    setAttributeForms([]);
    handleAttributeChange([]);
  };

  // Update attribute form
  const updateAttributeForm = (
    index: number,
    field: keyof AttributeFormData,
    value: string | number | undefined
  ) => {
    const newForms = [...attributeForms];
    
    // Clear value fields when attribute changes
    if (field === "attribute_id") {
      newForms[index] = {
        attribute_id: value as string,
        value_text: undefined,
        value_number: undefined,
      };
    } else {
      newForms[index] = { ...newForms[index], [field]: value };
    }

    setAttributeForms(newForms);
    handleAttributeChange(newForms);
  };

  // Handle attribute change and notify parent
  const handleAttributeChange = (forms: AttributeFormData[]) => {
    const validForms = forms.filter(
      (form) =>
        form.attribute_id &&
        (form.value_text !== undefined || form.value_number !== undefined)
    );

    const attributeValues: CreateProductAttributeValueRequest[] =
      validForms.map((form) => ({
        product_id: productId || "",
        attribute_id: form.attribute_id,
        value_text: form.value_text || null,
        value_number: form.value_number || null,
      }));

    onChange?.(attributeValues);
  };

  // Render value input based on data type
  const renderValueInput = (attributeId: string, index: number) => {
    const attributeInfo = getAttributeInfo(attributeId);
    if (!attributeInfo) {
      return (
        <MemoizedInput placeholder="Chọn thuộc tính trước" disabled={true} />
      );
    }

    const { data_type, unit, attribute_name } = attributeInfo;
    const placeholder = `Nhập ${attribute_name.toLowerCase()}${
      unit ? ` (${unit})` : ""
    }`;

    switch (data_type) {
      case "STRING":
      case "TEXT":
        return (
          <MemoizedInput
            placeholder={placeholder}
            value={attributeForms[index]?.value_text || ""}
            onChange={(e) =>
              updateAttributeForm(index, "value_text", e.target.value)
            }
            disabled={disabled}
          />
        );
      case "NUMBER":
      case "INTEGER":
      case "DECIMAL":
        return (
          <MemoizedInputNumber
            placeholder={placeholder}
            value={attributeForms[index]?.value_number}
            onChange={(value) =>
              updateAttributeForm(index, "value_number", value || undefined)
            }
            disabled={disabled}
            style={{ width: "100%" }}
            min={0}
          />
        );
      case "BOOLEAN":
        return (
          <Select
            placeholder={`Chọn ${attribute_name.toLowerCase()}`}
            value={attributeForms[index]?.value_text}
            onChange={(value) =>
              updateAttributeForm(index, "value_text", value)
            }
            disabled={disabled}
            style={{ width: "100%" }}
            allowClear
          >
            <Option value="true">Có</Option>
            <Option value="false">Không</Option>
          </Select>
        );
      case "DATE":
        return (
          <MemoizedInput
            type="date"
            placeholder={`Chọn ${attribute_name.toLowerCase()}`}
            value={attributeForms[index]?.value_text || ""}
            onChange={(e) =>
              updateAttributeForm(index, "value_text", e.target.value)
            }
            disabled={disabled}
          />
        );
      default:
        return (
          <MemoizedInput
            placeholder={placeholder}
            value={attributeForms[index]?.value_text || ""}
            onChange={(e) =>
              updateAttributeForm(index, "value_text", e.target.value)
            }
            disabled={disabled}
          />
        );
    }
  };

  return (
    <Card
      title={
        <Space>
          <InfoCircleOutlined style={{ color: "#722ed1" }} />
          <span>Thuộc tính sản phẩm</span>
        </Space>
      }
      size="small"
      style={{
        marginBottom: 16,
        border: "1px solid #f0f0f0",
        borderRadius: 8,
      }}
      extra={
        !disabled && (
          <Space>
            {attributeForms.length > 0 && (
              <Button
                type="text"
                danger
                onClick={clearAllForms}
                size="small"
              >
                Xóa tất cả
              </Button>
            )}
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={addAttributeForm}
              size="small"
            >
              Thêm thuộc tính
            </Button>
          </Space>
        )
      }
    >
      {attributeForms.length === 0 ? (
        <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
          <InfoCircleOutlined style={{ fontSize: 24, marginBottom: 8 }} />
          <p style={{ margin: 0 }}>
            Chưa có thuộc tính nào. Nhấn &quot;Thêm thuộc tính&quot; để bắt đầu.
          </p>
        </div>
      ) : (
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          {attributeForms.map((form, index) => {
            const attributeInfo = getAttributeInfo(form.attribute_id);
            const availableAttrs = getAvailableAttributes(index);

            return (
              <Card
                key={index}
                size="small"
                style={{ border: "1px solid #e8e8e8" }}
                title={
                  <Space>
                    <Text strong>
                      {attributeInfo
                        ? attributeInfo.attribute_name
                        : "Chọn thuộc tính"}
                    </Text>
                    {attributeInfo && (
                      <Tag color="blue">{attributeInfo.data_type}</Tag>
                    )}
                    {attributeInfo?.unit && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        ({attributeInfo.unit})
                      </Text>
                    )}
                  </Space>
                }
                extra={
                  !disabled && (
                    <Popconfirm
                      title="Xóa thuộc tính này?"
                      onConfirm={() => removeAttributeForm(index)}
                      okText="Xóa"
                      cancelText="Hủy"
                    >
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                      />
                    </Popconfirm>
                  )
                }
              >
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <div style={{ marginBottom: 8 }}>
                      <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                        Thuộc tính <span style={{ color: 'red' }}>*</span>
                      </label>
                      <Select
                        placeholder="Chọn thuộc tính"
                        value={form.attribute_id}
                        onChange={(value) =>
                          updateAttributeForm(index, "attribute_id", value)
                        }
                        disabled={disabled}
                        loading={attributesLoading}
                        style={{ width: "100%" }}
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          String(option?.children || "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                      >
                        {availableAttrs.map((attr) => (
                          <Option
                            key={attr.attribute_id}
                            value={attr.attribute_id}
                          >
                            {attr.attribute_name}
                            {attr.unit ? ` (${attr.unit})` : ""}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div style={{ marginBottom: 8 }}>
                      <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                        Giá trị <span style={{ color: 'red' }}>*</span>
                      </label>
                      {renderValueInput(form.attribute_id, index)}
                    </div>
                  </Col>
                </Row>
              </Card>
            );
          })}
        </Space>
      )}
    </Card>
  );
};

export default ProductAttributeManager;
