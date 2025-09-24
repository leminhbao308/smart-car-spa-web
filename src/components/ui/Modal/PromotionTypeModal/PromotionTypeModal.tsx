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
} from "antd";
import { 
  GiftOutlined,
  PercentageOutlined,
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  PromotionType,
  discountTypes,
  promotionTypeStatuses,
} from "@/components/utils/data/promotion-types.data";

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

interface PromotionTypeModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (data: PromotionType) => void;
  initialData?: PromotionType | null;
  title?: string;
}

const PromotionTypeModal: React.FC<PromotionTypeModalProps> = ({
  open,
  onCancel,
  onOk,
  initialData,
  title = "Thêm loại khuyến mãi mới",
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
          validityStartDate: dayjs(initialData.validityPeriod.startDate),
          validityEndDate: dayjs(initialData.validityPeriod.endDate),
          validityIsActive: initialData.validityPeriod.isActive,
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

      const formattedData: PromotionType = {
        ...values,
        id: initialData?.id || Date.now(),
        validityPeriod: {
          startDate: values.validityStartDate.format("YYYY-MM-DD"),
          endDate: values.validityEndDate.format("YYYY-MM-DD"),
          isActive: values.validityIsActive,
        },
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Remove date fields from the data
      delete formattedData.validityStartDate;
      delete formattedData.validityEndDate;
      delete formattedData.validityIsActive;

      onOk(formattedData);
      message.success(
        initialData ? "Cập nhật loại khuyến mãi thành công!" : "Thêm loại khuyến mãi thành công!"
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
            label="Tên loại khuyến mãi"
            rules={[{ required: true, message: "Vui lòng nhập tên loại khuyến mãi!" }]}
          >
            <Input 
              placeholder="Nhập tên loại khuyến mãi" 
              disabled={isViewMode}
              prefix={<GiftOutlined />}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="code"
            label="Mã loại khuyến mãi"
            rules={[{ required: true, message: "Vui lòng nhập mã loại khuyến mãi!" }]}
          >
            <Input 
              placeholder="Nhập mã loại khuyến mãi" 
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
          placeholder="Nhập mô tả về loại khuyến mãi" 
          disabled={isViewMode}
        />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
          >
            <Select placeholder="Chọn trạng thái" disabled={isViewMode}>
              {promotionTypeStatuses.map((status) => (
                <Option key={status.value} value={status.value}>
                  <Tag color={status.color}>{status.label}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
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
        </Col>
      </Row>
    </Card>
  );

  const renderDiscountInfo = () => (
    <Card title={
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <PercentageOutlined style={{ color: '#52c41a' }} />
        <span>Thông tin giảm giá</span>
      </div>
    } size="small" style={{ marginBottom: 16 }}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="discountType"
            label="Loại giảm giá"
            rules={[{ required: true, message: "Vui lòng chọn loại giảm giá!" }]}
          >
            <Select placeholder="Chọn loại giảm giá" disabled={isViewMode}>
              {discountTypes.map((type) => (
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
        <Col span={12}>
          <Form.Item
            name="discountValue"
            label="Giá trị giảm"
            rules={[{ required: true, message: "Vui lòng nhập giá trị giảm!" }]}
          >
            <InputNumber 
              min={0}
              placeholder="Nhập giá trị giảm" 
              disabled={isViewMode}
              style={{ width: '100%' }}
              addonAfter={
                <Form.Item noStyle shouldUpdate>
                  {({ getFieldValue }) => {
                    const discountType = getFieldValue('discountType');
                    return discountType === 'percentage' ? '%' : '₫';
                  }}
                </Form.Item>
              }
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  const renderConditions = () => (
    <Card title={
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <ShoppingCartOutlined style={{ color: '#fa8c16' }} />
        <span>Điều kiện áp dụng</span>
      </div>
    } size="small" style={{ marginBottom: 16 }}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name={["conditions", "minAmount"]}
            label="Số tiền tối thiểu"
          >
            <InputNumber 
              min={0}
              placeholder="Nhập số tiền tối thiểu" 
              disabled={isViewMode}
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
              addonAfter="₫"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name={["conditions", "maxAmount"]}
            label="Số tiền tối đa được giảm"
          >
            <InputNumber 
              min={0}
              placeholder="Nhập số tiền tối đa" 
              disabled={isViewMode}
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
              addonAfter="₫"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name={["conditions", "minQuantity"]}
            label="Số lượng tối thiểu"
          >
            <InputNumber 
              min={1}
              placeholder="Nhập số lượng tối thiểu" 
              disabled={isViewMode}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name={["conditions", "maxQuantity"]}
            label="Số lượng tối đa"
          >
            <InputNumber 
              min={1}
              placeholder="Nhập số lượng tối đa" 
              disabled={isViewMode}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name={["conditions", "applicableServices"]}
            label="Dịch vụ áp dụng"
          >
            <Select 
              mode="multiple" 
              placeholder="Chọn dịch vụ" 
              disabled={isViewMode}
              allowClear
            >
              <Option value="Rửa xe">Rửa xe</Option>
              <Option value="Đánh bóng">Đánh bóng</Option>
              <Option value="Phủ ceramic">Phủ ceramic</Option>
              <Option value="Gói chăm sóc toàn diện">Gói chăm sóc toàn diện</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name={["conditions", "applicableProducts"]}
            label="Sản phẩm áp dụng"
          >
            <Select 
              mode="multiple" 
              placeholder="Chọn sản phẩm" 
              disabled={isViewMode}
              allowClear
            >
              <Option value="Shampoo">Shampoo</Option>
              <Option value="Wax">Wax</Option>
              <Option value="Ceramic">Ceramic</Option>
              <Option value="Tất cả sản phẩm">Tất cả sản phẩm</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name={["conditions", "applicablePackages"]}
            label="Gói dịch vụ áp dụng"
          >
            <Select 
              mode="multiple" 
              placeholder="Chọn gói dịch vụ" 
              disabled={isViewMode}
              allowClear
            >
              <Option value="Gói chăm sóc cao cấp">Gói chăm sóc cao cấp</Option>
              <Option value="Gói chăm sóc cơ bản">Gói chăm sóc cơ bản</Option>
              <Option value="Gói chăm sóc VIP">Gói chăm sóc VIP</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
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
        <Col span={8}>
          <Form.Item
            name={["usageLimit", "perCustomer"]}
            label="Số lần/Khách hàng"
          >
            <InputNumber 
              min={1}
              placeholder="Nhập số lần" 
              disabled={isViewMode}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name={["usageLimit", "totalUsage"]}
            label="Tổng số lần sử dụng"
          >
            <InputNumber 
              min={1}
              placeholder="Nhập tổng số lần" 
              disabled={isViewMode}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name={["usageLimit", "dailyLimit"]}
            label="Giới hạn/ngày"
          >
            <InputNumber 
              min={1}
              placeholder="Nhập giới hạn ngày" 
              disabled={isViewMode}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  const renderValidityPeriod = () => (
    <Card title={
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <CalendarOutlined style={{ color: '#13c2c2' }} />
        <span>Thời gian hiệu lực</span>
      </div>
    } size="small">
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="validityStartDate"
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
        <Col span={8}>
          <Form.Item
            name="validityEndDate"
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
        <Col span={8}>
          <Form.Item
            name="validityIsActive"
            label="Kích hoạt"
            valuePropName="checked"
          >
            <Switch 
              disabled={isViewMode}
              checkedChildren="Có"
              unCheckedChildren="Không"
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
          discountType: "percentage",
          discountValue: 0,
          validityIsActive: true,
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
                  {renderDiscountInfo()}
                </>
              ),
            },
            {
              key: "conditions",
              label: "Điều kiện áp dụng",
              children: renderConditions(),
            },
            {
              key: "usage",
              label: "Giới hạn sử dụng",
              children: renderUsageLimit(),
            },
            {
              key: "validity",
              label: "Thời gian hiệu lực",
              children: renderValidityPeriod(),
            },
          ]}
        />
      </Form>
    </Modal>
  );
};

export default PromotionTypeModal;
