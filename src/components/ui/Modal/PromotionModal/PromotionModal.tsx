"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Select,
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
  Alert,
  Tooltip,
  Input,
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
  InfoCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  Promotion,
  CreatePromotionRequest,
  UpdatePromotionRequest,
  PROMOTION_TYPE_OPTIONS,
  PROMOTION_STATUS_OPTIONS,
  CUSTOMER_TYPE_OPTIONS,
  CUSTOMER_TIER_OPTIONS,
  getPromotionTypeLabel,
  getPromotionTypeIcon,
} from "@/lib/api/types/promotion.types";
import { MemoizedInput, MemoizedTextArea, MemoizedInputNumber } from "@/components/ui/MemoizedComponents";
import { PromotionConditionsBuilder } from "@/components/ui/PromotionConditionsBuilder";

const { Title, Text } = Typography;
const { Option } = Select;

interface PromotionModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (data: CreatePromotionRequest | UpdatePromotionRequest) => void;
  initialData?: Promotion | null;
  title?: string;
  loading?: boolean;
}

const PromotionModal: React.FC<PromotionModalProps> = ({
  open,
  onCancel,
  onOk,
  initialData,
  title = "Thêm chương trình khuyến mãi mới",
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [isViewMode, setIsViewMode] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("percentage");

  useEffect(() => {
    if (open) {
      if (initialData) {
        setIsViewMode(title.includes("Chi tiết"));
        setSelectedType(initialData.type);
        form.setFieldsValue({
          ...initialData,
          startDate: dayjs(initialData.startDate),
          endDate: dayjs(initialData.endDate),
        });
      } else {
        setIsViewMode(false);
        setSelectedType("percentage");
        form.resetFields();
        form.setFieldsValue({
          status: "draft",
          type: "percentage",
          isPublic: true,
          priority: 5,
          targetAudience: {
            customerTypes: ["all"],
            customerTiers: [],
            branches: ["all"],
            services: ["all"],
            products: ["all"],
            servicePackages: [],
          },
        });
      }
    }
  }, [open, initialData, form, title]);

  const handleOk = async () => {
    if (isViewMode) {
      onCancel();
      return;
    }

    try {
      const values = await form.validateFields();

      const formattedData = {
        ...values,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
      };

      onOk(formattedData);
    } catch (error) {
      console.log("Validation failed:", error);
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
            <MemoizedInput 
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
            <MemoizedInput 
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
              <MemoizedTextArea
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
            <Select 
              placeholder="Chọn loại khuyến mãi" 
              disabled={isViewMode}
              onChange={(value) => setSelectedType(value)}
            >
              {PROMOTION_TYPE_OPTIONS.map((type) => (
                <Option key={type.value} value={type.value}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {type.description}
                    </Text>
                  </div>
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
              <MemoizedInputNumber
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
                      if (type === 'buy_x_get_y') return 'sản phẩm';
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
              {PROMOTION_STATUS_OPTIONS.map((status) => (
                <Option key={status.value} value={status.value}>
                  <div>
                    <Tag color={status.color}>{status.label}</Tag>
                    <div style={{ marginTop: 4 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {status.description}
                      </Text>
                    </div>
                  </div>
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
              <MemoizedInputNumber
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
        <MemoizedTextArea 
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
            <MemoizedInputNumber 
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
            <MemoizedInputNumber 
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
              {CUSTOMER_TYPE_OPTIONS.map((type) => (
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

  const renderConditions = () => (
    <Card title={
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <InfoCircleOutlined style={{ color: '#13c2c2' }} />
        <span>Điều kiện áp dụng</span>
      </div>
    } size="small">
      <Form.Item name="conditions">
        <PromotionConditionsBuilder
          disabled={isViewMode}
          showPreview={true}
        />
      </Form.Item>
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
          status: "draft",
          type: "percentage",
          value: 0,
          isPublic: true,
          priority: 5,
          benefits: [],
          terms: [],
          conditions: [],
          targetAudience: {
            customerTypes: ["all"],
            customerTiers: [],
            branches: ["all"],
            services: ["all"],
            products: ["all"],
            servicePackages: [],
          }
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
              )
            },
            {
              key: "audience",
              label: "Đối tượng áp dụng",
              children: renderTargetAudience()
            },
            {
              key: "conditions",
              label: "Điều kiện áp dụng",
              children: renderConditions()
            },
            {
              key: "benefits",
              label: "Lợi ích & Điều khoản",
              children: renderBenefitsAndTerms()
            },
          ]}
        />
      </Form>
    </Modal>
  );
};

export default PromotionModal;
