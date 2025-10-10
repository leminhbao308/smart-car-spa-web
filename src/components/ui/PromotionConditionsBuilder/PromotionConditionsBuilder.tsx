"use client";
import React, { useState, useCallback } from "react";
import {
  Card,
  Form,
  Select,
  InputNumber,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Tag,
  Popconfirm,
  Divider,
  Alert,
  Tooltip,
  Switch,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  PromotionCondition,
  ConditionType,
  CONDITION_TYPE_OPTIONS,
} from "@/lib/api/types/promotion.types";
import { MemoizedInput, MemoizedInputNumber } from "@/components/ui/MemoizedComponents";

const { Title, Text } = Typography;
const { Option } = Select;

interface PromotionConditionsBuilderProps {
  value?: PromotionCondition[];
  onChange?: (conditions: PromotionCondition[]) => void;
  disabled?: boolean;
  showPreview?: boolean;
}

interface ConditionFormData {
  type: ConditionType;
  description: string;
  value?: number;
  target?: string[];
  operator?: string;
  isRequired: boolean;
}

const PromotionConditionsBuilder: React.FC<PromotionConditionsBuilderProps> = ({
  value = [],
  onChange,
  disabled = false,
  showPreview = true,
}) => {
  const [form] = Form.useForm();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Mock data for dropdowns (in real app, these would come from API)
  const serviceOptions = [
    { value: "wash", label: "Rửa xe" },
    { value: "polish", label: "Đánh bóng" },
    { value: "ceramic", label: "Phủ ceramic" },
    { value: "combo", label: "Gói chăm sóc toàn diện" },
  ];

  const productOptions = [
    { value: "shampoo", label: "Shampoo" },
    { value: "wax", label: "Wax" },
    { value: "ceramic", label: "Ceramic" },
    { value: "care_products", label: "Sản phẩm chăm sóc" },
  ];

  const customerTypeOptions = [
    { value: "new_customer", label: "Khách hàng mới" },
    { value: "vip", label: "Khách hàng VIP" },
    { value: "regular", label: "Khách hàng thường" },
    { value: "premium", label: "Khách hàng Premium" },
  ];

  const branchOptions = [
    { value: "branch_1", label: "Chi nhánh 1" },
    { value: "branch_2", label: "Chi nhánh 2" },
    { value: "branch_3", label: "Chi nhánh 3" },
  ];

  const dayOfWeekOptions = [
    { value: "monday", label: "Thứ 2" },
    { value: "tuesday", label: "Thứ 3" },
    { value: "wednesday", label: "Thứ 4" },
    { value: "thursday", label: "Thứ 5" },
    { value: "friday", label: "Thứ 6" },
    { value: "saturday", label: "Thứ 7" },
    { value: "sunday", label: "Chủ nhật" },
  ];

  const paymentMethodOptions = [
    { value: "cash", label: "Tiền mặt" },
    { value: "card", label: "Thẻ" },
    { value: "bank_transfer", label: "Chuyển khoản" },
    { value: "wallet", label: "Ví điện tử" },
  ];

  const getConditionOptions = (type: ConditionType) => {
    switch (type) {
      case "specific_service":
        return serviceOptions;
      case "specific_product":
        return productOptions;
      case "customer_type":
        return customerTypeOptions;
      case "branch_location":
        return branchOptions;
      case "day_of_week":
        return dayOfWeekOptions;
      case "payment_method":
        return paymentMethodOptions;
      default:
        return [];
    }
  };

  const getOperatorOptions = (type: ConditionType) => {
    switch (type) {
      case "min_amount":
      case "min_quantity":
        return [
          { value: "greater_equal", label: "Lớn hơn hoặc bằng" },
          { value: "greater_than", label: "Lớn hơn" },
          { value: "equals", label: "Bằng" },
        ];
      case "specific_service":
      case "specific_product":
      case "customer_type":
      case "branch_location":
      case "day_of_week":
      case "payment_method":
        return [
          { value: "in", label: "Trong danh sách" },
          { value: "not_in", label: "Không trong danh sách" },
          { value: "equals", label: "Bằng" },
        ];
      default:
        return [{ value: "equals", label: "Bằng" }];
    }
  };

  const generateConditionDescription = (condition: ConditionFormData): string => {
    const typeLabel = CONDITION_TYPE_OPTIONS.find(opt => opt.value === condition.type)?.label || condition.type;
    
    switch (condition.type) {
      case "min_amount":
        return `Đơn hàng ${condition.operator === "greater_equal" ? "tối thiểu" : condition.operator === "greater_than" ? "lớn hơn" : "bằng"} ${condition.value?.toLocaleString()} ₫`;
      case "min_quantity":
        return `Số lượng ${condition.operator === "greater_equal" ? "tối thiểu" : condition.operator === "greater_than" ? "lớn hơn" : "bằng"} ${condition.value}`;
      case "specific_service":
        const serviceLabels = condition.target?.map(t => serviceOptions.find(s => s.value === t)?.label).filter(Boolean);
        return `Dịch vụ: ${serviceLabels?.join(", ") || "Chưa chọn"}`;
      case "specific_product":
        const productLabels = condition.target?.map(t => productOptions.find(p => p.value === t)?.label).filter(Boolean);
        return `Sản phẩm: ${productLabels?.join(", ") || "Chưa chọn"}`;
      case "customer_type":
        const customerLabels = condition.target?.map(t => customerTypeOptions.find(c => c.value === t)?.label).filter(Boolean);
        return `Loại khách hàng: ${customerLabels?.join(", ") || "Chưa chọn"}`;
      case "branch_location":
        const branchLabels = condition.target?.map(t => branchOptions.find(b => b.value === t)?.label).filter(Boolean);
        return `Chi nhánh: ${branchLabels?.join(", ") || "Chưa chọn"}`;
      case "day_of_week":
        const dayLabels = condition.target?.map(t => dayOfWeekOptions.find(d => d.value === t)?.label).filter(Boolean);
        return `Ngày trong tuần: ${dayLabels?.join(", ") || "Chưa chọn"}`;
      case "payment_method":
        const paymentLabels = condition.target?.map(t => paymentMethodOptions.find(p => p.value === t)?.label).filter(Boolean);
        return `Phương thức thanh toán: ${paymentLabels?.join(", ") || "Chưa chọn"}`;
      default:
        return condition.description || typeLabel;
    }
  };

  const handleAddCondition = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const newCondition: PromotionCondition = {
        id: `condition_${Date.now()}`,
        type: values.type,
        description: generateConditionDescription(values),
        value: values.value,
        target: values.target,
        operator: values.operator || "equals",
        isRequired: values.isRequired || false,
      };

      const newConditions = [...value, newCondition];
      onChange?.(newConditions);
      
      form.resetFields();
      setShowForm(false);
      setEditingIndex(null);
    } catch (error) {
      console.log("Validation failed:", error);
    }
  }, [form, value, onChange]);

  const handleEditCondition = useCallback(async () => {
    if (editingIndex === null) return;

    try {
      const values = await form.validateFields();
      const updatedCondition: PromotionCondition = {
        ...value[editingIndex],
        type: values.type,
        description: generateConditionDescription(values),
        value: values.value,
        target: values.target,
        operator: values.operator || "equals",
        isRequired: values.isRequired || false,
      };

      const newConditions = [...value];
      newConditions[editingIndex] = updatedCondition;
      onChange?.(newConditions);
      
      form.resetFields();
      setShowForm(false);
      setEditingIndex(null);
    } catch (error) {
      console.log("Validation failed:", error);
    }
  }, [form, value, onChange, editingIndex]);

  const handleDeleteCondition = useCallback((index: number) => {
    const newConditions = value.filter((_, i) => i !== index);
    onChange?.(newConditions);
  }, [value, onChange]);

  const handleEditStart = useCallback((index: number) => {
    const condition = value[index];
    form.setFieldsValue({
      type: condition.type,
      description: condition.description,
      value: condition.value,
      target: condition.target,
      operator: condition.operator,
      isRequired: condition.isRequired,
    });
    setEditingIndex(index);
    setShowForm(true);
  }, [form, value]);

  const handleCancel = useCallback(() => {
    form.resetFields();
    setShowForm(false);
    setEditingIndex(null);
  }, [form]);

  const renderConditionForm = () => (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <InfoCircleOutlined style={{ color: "#1890ff" }} />
          <span>{editingIndex !== null ? "Chỉnh sửa điều kiện" : "Thêm điều kiện mới"}</span>
        </div>
      }
      size="small"
      style={{ marginBottom: 16 }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          isRequired: false,
          operator: "equals",
        }}
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="type"
              label="Loại điều kiện"
              rules={[{ required: true, message: "Vui lòng chọn loại điều kiện!" }]}
            >
              <Select
                placeholder="Chọn loại điều kiện"
                disabled={disabled}
                onChange={() => {
                  form.setFieldsValue({ target: undefined, value: undefined });
                }}
              >
                {CONDITION_TYPE_OPTIONS.map((option) => (
                  <Option key={option.value} value={option.value}>
                    <div>
                      <div>{option.label}</div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {option.description}
                      </Text>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="operator"
              label="Toán tử"
              rules={[{ required: true, message: "Vui lòng chọn toán tử!" }]}
            >
              <Select placeholder="Chọn toán tử" disabled={disabled}>
                {getOperatorOptions(form.getFieldValue("type")).map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="isRequired"
              label="Bắt buộc"
              valuePropName="checked"
            >
              <Switch
                disabled={disabled}
                checkedChildren="Có"
                unCheckedChildren="Không"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}>
          {({ getFieldValue }) => {
            const type = getFieldValue("type");
            
            if (type === "min_amount" || type === "min_quantity") {
              return (
                <Form.Item
                  name="value"
                  label={type === "min_amount" ? "Số tiền" : "Số lượng"}
                  rules={[{ required: true, message: `Vui lòng nhập ${type === "min_amount" ? "số tiền" : "số lượng"}!` }]}
                >
                  <MemoizedInputNumber
                    min={0}
                    placeholder={`Nhập ${type === "min_amount" ? "số tiền" : "số lượng"}`}
                    disabled={disabled}
                    style={{ width: "100%" }}
                    formatter={type === "min_amount" ? (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : undefined}
                    parser={type === "min_amount" ? (value) => value!.replace(/\$\s?|(,*)/g, "") : undefined}
                    addonAfter={type === "min_amount" ? "₫" : undefined}
                  />
                </Form.Item>
              );
            }

            if (["specific_service", "specific_product", "customer_type", "branch_location", "day_of_week", "payment_method"].includes(type)) {
              return (
                <Form.Item
                  name="target"
                  label="Đối tượng áp dụng"
                  rules={[{ required: true, message: "Vui lòng chọn đối tượng áp dụng!" }]}
                >
                  <Select
                    mode="multiple"
                    placeholder="Chọn đối tượng áp dụng"
                    disabled={disabled}
                    allowClear
                  >
                    {getConditionOptions(type).map((option) => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              );
            }

            return (
              <Form.Item
                name="description"
                label="Mô tả"
                rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
              >
                <MemoizedInput
                  placeholder="Nhập mô tả điều kiện"
                  disabled={disabled}
                />
              </Form.Item>
            );
          }}
        </Form.Item>

        <Form.Item>
          <Space>
            <Button
              type="primary"
              onClick={editingIndex !== null ? handleEditCondition : handleAddCondition}
              disabled={disabled}
            >
              {editingIndex !== null ? "Cập nhật" : "Thêm điều kiện"}
            </Button>
            <Button onClick={handleCancel} disabled={disabled}>
              Hủy
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );

  const renderConditionPreview = () => (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ExclamationCircleOutlined style={{ color: "#fa8c16" }} />
          <span>Điều kiện áp dụng ({value.length})</span>
        </div>
      }
      size="small"
    >
      {value.length === 0 ? (
        <Alert
          message="Chưa có điều kiện nào"
          description="Nhấn 'Thêm điều kiện' để tạo điều kiện áp dụng cho chương trình khuyến mãi."
          type="info"
          showIcon
        />
      ) : (
        <div>
          {value.map((condition, index) => (
            <div key={condition.id} style={{ marginBottom: 8 }}>
              <Tag
                color={condition.isRequired ? "red" : "blue"}
                style={{ marginBottom: 4 }}
              >
                {condition.isRequired ? "Bắt buộc" : "Tùy chọn"}
              </Tag>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Text>{condition.description}</Text>
                {!disabled && (
                  <Space size="small">
                    <Tooltip title="Chỉnh sửa">
                      <Button
                        type="text"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => handleEditStart(index)}
                      />
                    </Tooltip>
                    <Popconfirm
                      title="Xác nhận xóa"
                      description="Bạn có chắc chắn muốn xóa điều kiện này?"
                      onConfirm={() => handleDeleteCondition(index)}
                      okText="Xóa"
                      cancelText="Hủy"
                    >
                      <Tooltip title="Xóa">
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                        />
                      </Tooltip>
                    </Popconfirm>
                  </Space>
                )}
              </div>
              {index < value.length - 1 && <Divider style={{ margin: "8px 0" }} />}
            </div>
          ))}
        </div>
      )}
    </Card>
  );

  return (
    <div>
      {showPreview && renderConditionPreview()}
      
      {!disabled && (
        <div style={{ marginTop: 16 }}>
          {!showForm ? (
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => setShowForm(true)}
              style={{ width: "100%" }}
            >
              Thêm điều kiện
            </Button>
          ) : (
            renderConditionForm()
          )}
        </div>
      )}
    </div>
  );
};

export default PromotionConditionsBuilder;
