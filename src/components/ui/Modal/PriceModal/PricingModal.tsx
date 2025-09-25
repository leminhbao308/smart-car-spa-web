"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Row,
  Col,
  Button,
  Space,
  Divider,
  Typography,
  message,
  Card,
  List,
  Tag,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  PricingItem,
  PriceRange,
  pricingCategories,
  pricingUnits,
  pricingStatuses,
} from "@/components/utils/data/pricing.data";

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

interface PricingModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (data: PricingItem) => void;
  initialData?: PricingItem | null;
  title?: string;
}

const PricingModal: React.FC<PricingModalProps> = ({
  open,
  onCancel,
  onOk,
  initialData,
  title = "Thêm dịch vụ mới",
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [priceRanges, setPriceRanges] = useState<PriceRange[]>([]);

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        ...initialData,
        priceRanges: initialData.priceRanges || [],
      });
      setPriceRanges(initialData.priceRanges || []);
    } else {
      form.resetFields();
      setPriceRanges([]);
    }
  }, [initialData, form]);

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const formattedData = {
        ...values,
        id: initialData?.id || Date.now(),
        priceRanges: priceRanges,
        createdAt:
          initialData?.createdAt || new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      };

      onOk(formattedData);
      message.success(
        initialData
          ? "Cập nhật dịch vụ thành công!"
          : "Thêm dịch vụ thành công!"
      );
      form.resetFields();
      setPriceRanges([]);
    } catch (error) {
      console.log("Validation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setPriceRanges([]);
    onCancel();
  };

  const addPriceRange = () => {
    const newRange: PriceRange = {
      id: Date.now(),
      name: "",
      minValue: 0,
      maxValue: 0,
      price: 0,
      description: "",
    };
    setPriceRanges([...priceRanges, newRange]);
  };

  const updatePriceRange = (
    index: number,
    field: keyof PriceRange,
    value: any
  ) => {
    const updatedRanges = [...priceRanges];
    updatedRanges[index] = { ...updatedRanges[index], [field]: value };
    setPriceRanges(updatedRanges);
  };

  const removePriceRange = (index: number) => {
    setPriceRanges(priceRanges.filter((_, i) => i !== index));
  };

  const addRequirement = () => {
    const currentRequirements = form.getFieldValue("requirements") || [];
    form.setFieldsValue({
      requirements: [...currentRequirements, ""],
    });
  };

  const removeRequirement = (index: number) => {
    const currentRequirements = form.getFieldValue("requirements") || [];
    const updatedRequirements = currentRequirements.filter(
      (_: any, i: number) => i !== index
    );
    form.setFieldsValue({
      requirements: updatedRequirements,
    });
  };

  const tabItems = [
    {
      key: "basic",
      label: "Thông tin cơ bản",
      children: (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="serviceName"
              label="Tên dịch vụ"
              rules={[
                { required: true, message: "Vui lòng nhập tên dịch vụ!" },
              ]}
            >
              <Input placeholder="Nhập tên dịch vụ" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="category"
              label="Danh mục"
              rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
            >
              <Select placeholder="Chọn danh mục">
                {pricingCategories.map((category) => (
                  <Option key={category.id} value={category.name}>
                    <Space>
                      <span style={{ fontSize: 16 }}>{category.icon}</span>
                      <span>{category.name}</span>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="description"
              label="Mô tả"
              rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
            >
              <TextArea rows={3} placeholder="Nhập mô tả dịch vụ" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="basePrice"
              label="Giá cơ bản (VNĐ)"
              rules={[{ required: true, message: "Vui lòng nhập giá cơ bản!" }]}
            >
              <InputNumber
                min={0}
                placeholder="Nhập giá cơ bản"
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="unit"
              label="Đơn vị"
              rules={[{ required: true, message: "Vui lòng chọn đơn vị!" }]}
            >
              <Select placeholder="Chọn đơn vị">
                {pricingUnits.map((unit) => (
                  <Option key={unit} value={unit}>
                    {unit}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="duration"
              label="Thời gian (phút)"
              rules={[{ required: true, message: "Vui lòng nhập thời gian!" }]}
            >
              <InputNumber
                min={1}
                placeholder="Nhập thời gian"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
            >
              <Select placeholder="Chọn trạng thái">
                {pricingStatuses.map((status) => (
                  <Option key={status.value} value={status.value}>
                    {status.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="notes" label="Ghi chú">
              <TextArea rows={2} placeholder="Nhập ghi chú (tùy chọn)" />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
    {
      key: "requirements",
      label: "Yêu cầu",
      children: (
        <div>
          <div
            style={{
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Title level={5} style={{ margin: 0 }}>
              Yêu cầu dịch vụ
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={addRequirement}
            >
              Thêm yêu cầu
            </Button>
          </div>

          <Form.List name="requirements">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card key={key} size="small" style={{ marginBottom: 8 }}>
                    <Row gutter={8} align="middle">
                      <Col span={22}>
                        <Form.Item
                          {...restField}
                          name={name}
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập yêu cầu!",
                            },
                          ]}
                        >
                          <Input placeholder="Nhập yêu cầu dịch vụ" />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                        />
                      </Col>
                    </Row>
                  </Card>
                ))}
                {fields.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: 20,
                      color: "#8c8c8c",
                    }}
                  >
                    <Text>
                      Chưa có yêu cầu nào. Click "Thêm yêu cầu" để bắt đầu.
                    </Text>
                  </div>
                )}
              </>
            )}
          </Form.List>
        </div>
      ),
    },
    {
      key: "pricing",
      label: "Bảng giá",
      children: (
        <div>
          <div
            style={{
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Title level={5} style={{ margin: 0 }}>
              Bảng giá theo loại
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={addPriceRange}
            >
              Thêm mức giá
            </Button>
          </div>

          <List
            dataSource={priceRanges}
            renderItem={(range, index) => (
              <List.Item key={range.id}>
                <Card
                  title={`Mức giá ${index + 1}`}
                  size="small"
                  extra={
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removePriceRange(index)}
                    />
                  }
                  style={{ width: "100%" }}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <div style={{ marginBottom: 8 }}>
                        <Text strong>Tên mức giá:</Text>
                        <Input
                          value={range.name}
                          onChange={(e) =>
                            updatePriceRange(index, "name", e.target.value)
                          }
                          placeholder="Nhập tên mức giá"
                          style={{ marginTop: 4 }}
                        />
                      </div>
                    </Col>
                    <Col span={6}>
                      <div style={{ marginBottom: 8 }}>
                        <Text strong>Giá trị tối thiểu:</Text>
                        <InputNumber
                          value={range.minValue}
                          onChange={(value) =>
                            updatePriceRange(index, "minValue", value || 0)
                          }
                          placeholder="Min"
                          style={{ width: "100%", marginTop: 4 }}
                          min={0}
                        />
                      </div>
                    </Col>
                    <Col span={6}>
                      <div style={{ marginBottom: 8 }}>
                        <Text strong>Giá trị tối đa:</Text>
                        <InputNumber
                          value={range.maxValue}
                          onChange={(value) =>
                            updatePriceRange(index, "maxValue", value || 0)
                          }
                          placeholder="Max"
                          style={{ width: "100%", marginTop: 4 }}
                          min={0}
                        />
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ marginBottom: 8 }}>
                        <Text strong>Giá (VNĐ):</Text>
                        <InputNumber
                          value={range.price}
                          onChange={(value) =>
                            updatePriceRange(index, "price", value || 0)
                          }
                          placeholder="Nhập giá"
                          style={{ width: "100%", marginTop: 4 }}
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                        />
                      </div>
                    </Col>
                    <Col span={16}>
                      <div style={{ marginBottom: 8 }}>
                        <Text strong>Mô tả:</Text>
                        <Input
                          value={range.description}
                          onChange={(e) =>
                            updatePriceRange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Nhập mô tả mức giá"
                          style={{ marginTop: 4 }}
                        />
                      </div>
                    </Col>
                  </Row>
                </Card>
              </List.Item>
            )}
          />

          {priceRanges.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: "#8c8c8c" }}>
              <Text>Chưa có mức giá nào. Click "Thêm mức giá" để bắt đầu.</Text>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <Modal
      title={title}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      width={1000}
      confirmLoading={loading}
      okText={initialData ? "Cập nhật" : "Thêm mới"}
      cancelText="Hủy"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: "active",
          requirements: [],
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <Space>
            {tabItems.map((tab) => (
              <Button
                key={tab.key}
                type={activeTab === tab.key ? "primary" : "default"}
                onClick={() => setActiveTab(tab.key)}
                size="small"
              >
                {tab.label}
              </Button>
            ))}
          </Space>
        </div>

        <Divider />

        {tabItems.find((tab) => tab.key === activeTab)?.children}
      </Form>
    </Modal>
  );
};

export default PricingModal;
