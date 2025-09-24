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
  DatePicker,
  Switch,
  Tabs,
  Tag,
  TimePicker,
} from "antd";
import { 
  GiftOutlined,
  PercentageOutlined,
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  StarOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  Promotion,
  promotionTypes,
  promotionStatuses,
  customerTypes,
  conditionTypes,
} from "@/components/utils/data/promotions.data";

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

interface PromotionModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (data: Promotion) => void;
  initialData?: Promotion | null;
  title?: string;
}

const PromotionModal: React.FC<PromotionModalProps> = ({
  open,
  onCancel,
  onOk,
  initialData,
  title = "Thêm chương trình khuyến mãi mới",
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);

  useEffect(() => {
    if (open) {
    if (initialData) {
        setIsViewMode(title.includes("Chi tiết"));
      form.setFieldsValue({
        ...initialData,
          startDate: dayjs(initialData.startDate),
          endDate: dayjs(initialData.endDate),
        });
    } else {
        setIsViewMode(false);
      form.resetFields();
      }
    }
  }, [open, initialData, form, title]);

  const handleOk = async () => {
    if (isViewMode) {
      onCancel();
      return;
    }

    try {
      setLoading(true);
      const values = await form.validateFields();

      const formattedData: Promotion = {
        ...values,
        id: initialData?.id || Date.now(),
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
        usedCount: initialData?.usedCount || 0,
        customerUsedCount: initialData?.customerUsedCount || 0,
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Remove date fields from the data
      delete formattedData.startDate;
      delete formattedData.endDate;

      onOk(formattedData);
      message.success(
        initialData ? "Cập nhật chương trình khuyến mãi thành công!" : "Thêm chương trình khuyến mãi thành công!"
      );
    } catch (error) {
      console.error("Validation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderBasicInfo = () => (
    <Card title={
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <GiftOutlined style={{ color: '#1890ff' }} />
        <span>Thông tin cơ bản</span>
      </div>
    } size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Tên chương trình"
            rules={[{ required: true, message: "Vui lòng nhập tên chương trình!" }]}
          >
            <Input 
              placeholder="Nhập tên chương trình khuyến mãi" 
              disabled={isViewMode}
              prefix={<GiftOutlined />}
            />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
            name="code"
            label="Mã chương trình"
            rules={[{ required: true, message: "Vui lòng nhập mã chương trình!" }]}
          >
            <Input 
              placeholder="Nhập mã chương trình" 
              disabled={isViewMode}
            />
            </Form.Item>
          </Col>
      </Row>
      
            <Form.Item
              name="description"
              label="Mô tả"
              rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
            >
              <TextArea
                rows={3}
          placeholder="Nhập mô tả về chương trình khuyến mãi" 
          disabled={isViewMode}
        />
      </Form.Item>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="type"
            label="Loại khuyến mãi"
            rules={[{ required: true, message: "Vui lòng chọn loại khuyến mãi!" }]}
          >
            <Select placeholder="Chọn loại khuyến mãi" disabled={isViewMode}>
              {promotionTypes.map((type) => (
                <Option key={type.value} value={type.value}>
                  <Space>
                    <span>{type.icon}</span>
                    {type.label}
                  </Space>
                </Option>
              ))}
            </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="value"
              label="Giá trị khuyến mãi"
            rules={[{ required: true, message: "Vui lòng nhập giá trị khuyến mãi!" }]}
            >
              <InputNumber
                min={0}
                placeholder="Nhập giá trị"
              disabled={isViewMode}
              style={{ width: '100%' }}
              addonAfter={
                <Form.Item noStyle shouldUpdate>
                  {({ getFieldValue }) => {
                    const type = getFieldValue('type');
                    if (type === 'percentage') return '%';
                    if (type === 'fixed') return '₫';
                    if (type === 'gift') return 'sản phẩm';
                    return '';
                  }}
            </Form.Item>
              }
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
            >
            <Select placeholder="Chọn trạng thái" disabled={isViewMode}>
                {promotionStatuses.map((status) => (
                  <Option key={status.value} value={status.value}>
                  <Tag color={status.color}>{status.label}</Tag>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="startDate"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu!" }]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              disabled={isViewMode}
              placeholder="Chọn ngày bắt đầu"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="endDate"
            label="Ngày kết thúc"
            rules={[{ required: true, message: "Vui lòng chọn ngày kết thúc!" }]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              disabled={isViewMode}
              placeholder="Chọn ngày kết thúc"
              />
            </Form.Item>
          </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="isPublic"
            label="Công khai"
            valuePropName="checked"
          >
            <Switch 
              disabled={isViewMode}
              checkedChildren="Có"
              unCheckedChildren="Không"
              />
            </Form.Item>
          </Col>
        <Col span={12}>
            <Form.Item
              name="priority"
              label="Độ ưu tiên"
              rules={[{ required: true, message: "Vui lòng nhập độ ưu tiên!" }]}
            >
              <InputNumber
                min={1}
                max={10}
                placeholder="1-10"
              disabled={isViewMode}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="notes"
        label="Ghi chú"
      >
        <TextArea 
          rows={2} 
          placeholder="Nhập ghi chú" 
          disabled={isViewMode}
        />
      </Form.Item>
    </Card>
  );

  const renderUsageLimit = () => (
    <Card title={
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <UserOutlined style={{ color: '#722ed1' }} />
        <span>Giới hạn sử dụng</span>
      </div>
    } size="small" style={{ marginBottom: 16 }}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="usageLimit"
            label="Giới hạn sử dụng tổng"
          >
            <InputNumber 
              min={1}
              placeholder="Nhập giới hạn tổng" 
              disabled={isViewMode}
              style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        <Col span={12}>
            <Form.Item
            name="customerLimit"
            label="Giới hạn khách hàng"
          >
            <InputNumber 
              min={1}
              placeholder="Nhập giới hạn khách hàng" 
              disabled={isViewMode}
              style={{ width: '100%' }}
            />
            </Form.Item>
          </Col>
        </Row>
    </Card>
  );

  const renderTargetAudience = () => (
    <Card title={
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <StarOutlined style={{ color: '#fa8c16' }} />
        <span>Đối tượng áp dụng</span>
      </div>
    } size="small" style={{ marginBottom: 16 }}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name={["targetAudience", "customerTypes"]}
            label="Loại khách hàng"
          >
            <Select 
              mode="multiple" 
              placeholder="Chọn loại khách hàng" 
              disabled={isViewMode}
              allowClear
            >
              {customerTypes.map((type) => (
                            <Option key={type.value} value={type.value}>
                  {type.label}
                            </Option>
                          ))}
                        </Select>
          </Form.Item>
                    </Col>
        <Col span={12}>
          <Form.Item
            name={["targetAudience", "branches"]}
            label="Chi nhánh áp dụng"
          >
            <Select 
              mode="multiple" 
              placeholder="Chọn chi nhánh" 
              disabled={isViewMode}
              allowClear
            >
              <Option value="all">Tất cả chi nhánh</Option>
              <Option value="branch_1">Chi nhánh 1</Option>
              <Option value="branch_2">Chi nhánh 2</Option>
              <Option value="branch_3">Chi nhánh 3</Option>
            </Select>
          </Form.Item>
                    </Col>
                  </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name={["targetAudience", "services"]}
            label="Dịch vụ áp dụng"
          >
            <Select 
              mode="multiple" 
              placeholder="Chọn dịch vụ" 
              disabled={isViewMode}
              allowClear
            >
              <Option value="all">Tất cả dịch vụ</Option>
              <Option value="wash">Rửa xe</Option>
              <Option value="polish">Đánh bóng</Option>
              <Option value="ceramic">Phủ ceramic</Option>
              <Option value="combo">Gói chăm sóc toàn diện</Option>
            </Select>
          </Form.Item>
                    </Col>
        <Col span={12}>
          <Form.Item
            name={["targetAudience", "products"]}
            label="Sản phẩm áp dụng"
          >
            <Select 
              mode="multiple" 
              placeholder="Chọn sản phẩm" 
              disabled={isViewMode}
              allowClear
            >
              <Option value="all">Tất cả sản phẩm</Option>
              <Option value="shampoo">Shampoo</Option>
              <Option value="wax">Wax</Option>
              <Option value="ceramic">Ceramic</Option>
              <Option value="care_products">Sản phẩm chăm sóc</Option>
            </Select>
          </Form.Item>
                    </Col>
                  </Row>
                </Card>
  );

  const renderBenefitsAndTerms = () => (
    <Card title={
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <ShoppingCartOutlined style={{ color: '#52c41a' }} />
        <span>Lợi ích và điều khoản</span>
            </div>
    } size="small">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="benefits"
            label="Lợi ích"
            rules={[{ required: true, message: "Vui lòng nhập ít nhất 1 lợi ích!" }]}
          >
            <Select 
              mode="tags" 
              placeholder="Nhập lợi ích (Enter để thêm)" 
              disabled={isViewMode}
              style={{ width: '100%' }}
            />
          </Form.Item>
                    </Col>
        <Col span={12}>
          <Form.Item
            name="terms"
            label="Điều khoản"
            rules={[{ required: true, message: "Vui lòng nhập ít nhất 1 điều khoản!" }]}
          >
            <Select 
              mode="tags" 
              placeholder="Nhập điều khoản (Enter để thêm)" 
              disabled={isViewMode}
              style={{ width: '100%' }}
            />
          </Form.Item>
                    </Col>
                  </Row>
                </Card>
  );

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      width={1000}
      okText={isViewMode ? "Đóng" : (initialData ? "Cập nhật" : "Thêm mới")}
      cancelText="Hủy"
      confirmLoading={loading}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: "active",
          type: "percentage",
          value: 0,
          isPublic: true,
          priority: 5,
          benefits: [],
          terms: [],
          targetAudience: {
            customerTypes: ["all"],
            branches: ["all"],
            services: ["all"],
            products: ["all"],
          },
        }}
      >
        <Tabs 
          defaultActiveKey="basic" 
          type="card"
          items={[
            {
              key: "basic",
              label: "Thông tin cơ bản",
              children: (
                <>
                  {renderBasicInfo()}
                  {renderUsageLimit()}
                </>
              ),
            },
            {
              key: "audience",
              label: "Đối tượng áp dụng",
              children: renderTargetAudience(),
            },
            {
              key: "benefits",
              label: "Lợi ích & Điều khoản",
              children: renderBenefitsAndTerms(),
            },
          ]}
        />
      </Form>
    </Modal>
  );
};

export default PromotionModal;