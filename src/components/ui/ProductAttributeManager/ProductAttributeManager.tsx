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

// Extended interface to include id field
interface ProductAttributeValueWithId extends ProductAttributeValue {
  id?: string;
}

const { Option } = Select;
const { Text } = Typography;

interface ProductAttributeManagerProps {
  productId?: string;
  initialAttributeValues?: ProductAttributeValueWithId[];
  onChange?: (attributeValues: CreateProductAttributeValueRequest[]) => void;
  disabled?: boolean;
  isEditMode?: boolean; // Phân biệt giữa create và edit mode
}

interface AttributeFormData {
  attribute_id: string;
  value_text?: string;
  value_number?: number;
  operation?: 'DELETE'; // Chỉ sử dụng cho DELETE
  id?: string; // ID của attribute value hiện tại (nếu có)
}

const ProductAttributeManager: React.FC<ProductAttributeManagerProps> = ({
  productId,
  initialAttributeValues = [],
  onChange,
  disabled = false,
  isEditMode = false,
}) => {
  const [attributeForms, setAttributeForms] = useState<AttributeFormData[]>([]);
  const [availableAttributes, setAvailableAttributes] = useState<
    ProductAttributeInfoDto[]
  >([]);

  const { data: productAttributesData, isLoading: attributesLoading } =
    useActiveProductAttributes();

  // Load available attributes
  useEffect(() => {
    console.log("Loading available attributes", { 
      productAttributesData: productAttributesData?.data?.length,
      attributesLoading 
    });
    
    if (productAttributesData?.data) {
      setAvailableAttributes(productAttributesData.data);
    }
  }, [productAttributesData, attributesLoading]);

  // Initialize attribute forms from initial values
  useEffect(() => {
    console.log("useEffect initialAttributeValues called", { 
      initialAttributeValues: initialAttributeValues.length
    });
    
    if (initialAttributeValues.length > 0) {
      const forms = initialAttributeValues.map((attr) => ({
        attribute_id: attr.attribute_id,
        value_text: attr.value_text || undefined,
        value_number: attr.value_number || undefined,
        id: attr.id, // Keep the ID for tracking
      }));
      console.log("Setting forms from initial values:", forms.length);
      setAttributeForms(forms);
    }
    // Don't reset forms to [] when no initial values - let user add forms manually
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
    console.log("addAttributeForm called", { 
      availableAttributes: availableAttributes.length,
      disabled,
      isEditMode,
      currentForms: attributeForms.length
    });
    
    const newForm: AttributeFormData = {
      attribute_id: "",
      value_text: undefined,
      value_number: undefined,
    };
    const newForms = [...attributeForms, newForm];
    
    console.log("Before setAttributeForms:", { 
      oldForms: attributeForms.length, 
      newForms: newForms.length 
    });
    
    setAttributeForms(newForms);
    handleAttributeChange(newForms);
    
    console.log("After setAttributeForms, total forms:", newForms.length);
    
    // Force a re-render to see if state is preserved
    setTimeout(() => {
      console.log("After timeout, forms should still be:", newForms.length);
    }, 100);
  };

  // Remove attribute form
  const removeAttributeForm = (index: number) => {
    const attributeToRemove = attributeForms[index];
    
    // If it's already marked for deletion, remove it completely
    if (attributeToRemove.operation === 'DELETE') {
      const newForms = attributeForms.filter((_, i) => i !== index);
      setAttributeForms(newForms);
      handleAttributeChange(newForms);
    }
    // If it's an existing attribute (has ID) and in edit mode, mark it for deletion
    else if (attributeToRemove.id && isEditMode) {
      const newForms = [...attributeForms];
      newForms[index] = {
        ...attributeToRemove,
        operation: 'DELETE' as const,
      };
      setAttributeForms(newForms);
      handleAttributeChange(newForms);
    } else {
      // If it's a new attribute (no ID) or in create mode, just remove it
      const newForms = attributeForms.filter((_, i) => i !== index);
      setAttributeForms(newForms);
      handleAttributeChange(newForms);
    }
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
        id: newForms[index].id, // Keep existing ID
        operation: newForms[index].operation, // Keep existing operation (if DELETE)
      };
    } else {
      newForms[index] = { ...newForms[index], [field]: value };
    }

    setAttributeForms(newForms);
    handleAttributeChange(newForms);
  };

  // Handle attribute change and notify parent
  const handleAttributeChange = (forms: AttributeFormData[]) => {
    console.log("handleAttributeChange called", { 
      forms: forms.length, 
      productId, 
      onChange: !!onChange 
    });
    
    // Include all forms - let parent component decide what to do with them
    const allForms = forms;

    const attributeValues: CreateProductAttributeValueRequest[] =
      allForms.map((form) => ({
        product_id: productId || "",
        attribute_id: form.attribute_id,
        value_text: form.value_text || null,
        value_number: form.value_number || null,
        operation: form.operation, // Chỉ có khi là DELETE
        id: form.id, // Include ID for existing attributes
      }));

    console.log("Calling onChange with:", attributeValues);
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

  console.log("ProductAttributeManager render", {
    attributeForms: attributeForms.length,
    availableAttributes: availableAttributes.length,
    disabled,
    isEditMode,
    attributesLoading,
    productId,
    initialAttributeValues: initialAttributeValues.length,
    initialAttributeValuesRef: initialAttributeValues
  });

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
              onClick={() => {
                console.log("Button clicked!", { disabled, availableAttributes: availableAttributes.length });
                addAttributeForm();
              }}
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
            {isEditMode 
              ? "Chưa có thuộc tính nào. Nhấn \"Thêm thuộc tính\" để bắt đầu."
              : "Chưa có thuộc tính nào. Nhấn \"Thêm thuộc tính\" để thêm thuộc tính cho sản phẩm mới."
            }
          </p>
          {!isEditMode && (
            <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#666" }}>
              Bạn có thể thêm thuộc tính như màu sắc, kích thước, trọng lượng, v.v.
            </p>
          )}
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
                style={{ 
                  border: form.operation === 'DELETE' ? "1px solid #ff4d4f" : "1px solid #e8e8e8",
                  backgroundColor: form.operation === 'DELETE' ? "#fff2f0" : "white",
                  opacity: form.operation === 'DELETE' ? 0.7 : 1
                }}
                title={
                  <Space>
                    <Text strong style={{ color: form.operation === 'DELETE' ? "#ff4d4f" : "inherit" }}>
                      {attributeInfo
                        ? attributeInfo.attribute_name
                        : "Chọn thuộc tính"}
                    </Text>
                    {form.operation === 'DELETE' && (
                      <Tag color="red">SẼ XÓA</Tag>
                    )}
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
                      title={form.operation === 'DELETE' ? "Hủy xóa thuộc tính này?" : "Xóa thuộc tính này?"}
                      onConfirm={() => removeAttributeForm(index)}
                      okText={form.operation === 'DELETE' ? "Hủy xóa" : "Xóa"}
                      cancelText="Hủy"
                    >
                      <Button
                        type="text"
                        danger={form.operation !== 'DELETE'}
                        icon={<DeleteOutlined />}
                        size="small"
                        style={{ 
                          color: form.operation === 'DELETE' ? '#52c41a' : undefined 
                        }}
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
