"use client";
import React, {useState, useEffect, useMemo} from "react";
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
  Spin,
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
  CUSTOMER_TYPE_OPTIONS,
} from "@/lib/api/types/promotion.types";
import {MemoizedInput, MemoizedTextArea, MemoizedInputNumber} from "@/components/ui/MemoizedComponents";
import {PromotionConditionsBuilder} from "@/components/ui/PromotionConditionsBuilder";
import {useBranches} from "@/lib/api/hooks/useBranches";
import {useServices} from "@/lib/api/hooks/useServices";
import {useProducts} from "@/lib/api/hooks/useProducts";
import {usePromotionType} from "@/lib/api/hooks/usePromotionType";
import {PromotionType} from "@/components/utils/data/promotion-types.data";
import {PromotionTypeInfo} from "@/lib/api";

const {Title, Text} = Typography;
const {Option} = Select;

// Promotion status options
const PROMOTION_STATUS_OPTIONS = [
  {
    value: "draft",
    label: "Nháp",
    color: "default",
    description: "Chưa kích hoạt",
  },
  {
    value: "scheduled",
    label: "Đã lên lịch",
    color: "blue",
    description: "Chờ đến ngày bắt đầu",
  },
  {
    value: "active",
    label: "Đang hoạt động",
    color: "green",
    description: "Đang áp dụng",
  },
  {
    value: "paused",
    label: "Tạm dừng",
    color: "orange",
    description: "Tạm thời không áp dụng",
  },
  {
    value: "expired",
    label: "Hết hạn",
    color: "red",
    description: "Đã kết thúc",
  },
];

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
  const [selectedType, setSelectedType] = useState<PromotionTypeInfo | undefined>();

  // Fetch data from APIs
  const {branches, loading: branchesLoading} = useBranches();
  const {data: servicesData, isLoading: servicesLoading} = useServices({size: 100});
  const {products, isLoading: productsLoading} = useProducts({size: 100});
  const {activePromotionTypes = [], isLoadingActive: promotionTypesLoading} = usePromotionType();

  const services = useMemo(() => {
    const data = servicesData?.data;
    return Array.isArray(data) ? data : (data?.content ?? []);
  }, [servicesData?.data]);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setIsViewMode(title.includes("Chi tiết"));
        setSelectedType(initialData.promotion_type);
        form.setFieldsValue({
          ...initialData,
          type: initialData.promotion_type?.promotionTypeId, // Use ID instead of object
          startDate: dayjs(initialData.start_at),
          endDate: dayjs(initialData.end_at),
        });
      } else {
        setIsViewMode(false);
        setSelectedType(undefined);
        form.resetFields();
        form.setFieldsValue({
          status: "draft",
          type: undefined, // Clear type
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

      // Validate dates
      if (values.endDate.isBefore(values.startDate)) {
        message.error("Ngày kết thúc phải sau ngày bắt đầu!");
        return;
      }

      const formattedData = {
        ...values,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
      };

      onOk(formattedData);
    } catch (error) {
      console.log("Validation failed:", error);
      message.error("Vui lòng kiểm tra lại thông tin!");
    }
  };

  const renderBasicInfo = () => (
    <Card
      title={
        <div style={{display: "flex", alignItems: "center", gap: 8}}>
          <GiftOutlined style={{color: "#1890ff"}}/>
          <span>Thông tin cơ bản</span>
        </div>
      }
      size="small"
      style={{marginBottom: 16}}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name"
            label="Tên chương trình"
            rules={[
              {required: true, message: "Vui lòng nhập tên chương trình!"},
              {min: 5, message: "Tên phải có ít nhất 5 ký tự!"},
              {max: 200, message: "Tên không được vượt quá 200 ký tự!"},
            ]}
          >
            <MemoizedInput
              placeholder="Nhập tên chương trình khuyến mãi"
              disabled={isViewMode}
              prefix={<GiftOutlined/>}
              showCount
              maxLength={200}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="code"
            label="Mã chương trình"
            rules={[
              {required: true, message: "Vui lòng nhập mã chương trình!"},
              {
                pattern: /^[A-Z0-9_-]+$/,
                message: "Mã chỉ được chứa chữ in hoa, số, gạch dưới và gạch ngang!",
              },
              {min: 3, message: "Mã phải có ít nhất 3 ký tự!"},
              {max: 50, message: "Mã không được vượt quá 50 ký tự!"},
            ]}
          >
            <MemoizedInput
              placeholder="Nhập mã chương trình (VD: SUMMER2024)"
              disabled={isViewMode}
              style={{textTransform: "uppercase"}}
              showCount
              maxLength={50}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="description"
        label="Mô tả"
        rules={[
          {required: true, message: "Vui lòng nhập mô tả!"},
          {min: 10, message: "Mô tả phải có ít nhất 10 ký tự!"},
          {max: 500, message: "Mô tả không được vượt quá 500 ký tự!"},
        ]}
      >
        <MemoizedTextArea
          rows={3}
          placeholder="Nhập mô tả về chương trình khuyến mãi"
          disabled={isViewMode}
          showCount
          maxLength={500}
        />
      </Form.Item>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="type"
            label={
              <span>
      Loại khuyến mãi{" "}
                <Tooltip title="Chọn hình thức giảm giá phù hợp">
        <InfoCircleOutlined/>
      </Tooltip>
    </span>
            }
            rules={[{required: true, message: "Vui lòng chọn loại khuyến mãi!"}]}
          >
            <Select
              placeholder="Chọn loại khuyến mãi"
              disabled={isViewMode}
              onChange={(value) => {
                // Find the full object for selectedType
                const selected = activePromotionTypes.find(t => t.promotionTypeId === value);
                setSelectedType(selected);
              }}
              loading={promotionTypesLoading}
              notFoundContent={promotionTypesLoading ? <Spin size="small"/> : "Không có loại khuyến mãi"}
            >
              {activePromotionTypes?.map((type) => (
                <Option key={type.promotionTypeId} value={type.promotionTypeId}>
                  <div>
                    <div style={{display: "flex", alignItems: "center", gap: 8}}>
                      <span>{type.typeName}</span>
                    </div>
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
            rules={[
              {required: true, message: "Vui lòng nhập giá trị khuyến mãi!"},
              {
                validator: (_, value) => {
                  if (!value || value <= 0) {
                    return Promise.reject("Giá trị phải lớn hơn 0!");
                  }
                  if (selectedType?.typeCode === "PERCENT_DISCOUNT" && value > 100) {
                    return Promise.reject("Phần trăm không được vượt quá 100%!");
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <MemoizedInputNumber
              min={0}
              max={selectedType?.typeCode === "PERCENT_DISCOUNT" ? 100 : undefined}
              placeholder="Nhập giá trị"
              disabled={isViewMode}
              style={{width: "100%"}}
              formatter={(value) =>
                selectedType?.typeCode === "FIXED_PRICE"
                  ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  : `${value}`
              }
              addonAfter={
                <Form.Item noStyle shouldUpdate>
                  {({getFieldValue}) => {
                    const type = getFieldValue("type");
                    if (type === "PERCENT_DISCOUNT") return "%";
                    if (type === "FIXED_PRICE") return "₫";
                    if (type === "FREE_PRODUCT") return "sản phẩm";
                    if (type === "BUY_X_GET_Y") return "sản phẩm";
                    return "";
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
            rules={[{required: true, message: "Vui lòng chọn trạng thái!"}]}
          >
            <Select placeholder="Chọn trạng thái" disabled={isViewMode}>
              {PROMOTION_STATUS_OPTIONS.map((status) => (
                <Option key={status.value} value={status.value}>
                  <div>
                    <Tag color={status.color}>{status.label}</Tag>
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
            rules={[{required: true, message: "Vui lòng chọn ngày bắt đầu!"}]}
          >
            <DatePicker
              style={{width: "100%"}}
              disabled={isViewMode}
              placeholder="Chọn ngày bắt đầu"
              format="DD/MM/YYYY"
              disabledDate={(current) => {
                return current && current < dayjs().startOf("day");
              }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="endDate"
            label="Ngày kết thúc"
            rules={[
              {required: true, message: "Vui lòng chọn ngày kết thúc!"},
              ({getFieldValue}) => ({
                validator(_, value) {
                  if (!value || !getFieldValue("startDate")) {
                    return Promise.resolve();
                  }
                  if (value.isBefore(getFieldValue("startDate"))) {
                    return Promise.reject("Ngày kết thúc phải sau ngày bắt đầu!");
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker
              style={{width: "100%"}}
              disabled={isViewMode}
              placeholder="Chọn ngày kết thúc"
              format="DD/MM/YYYY"
              disabledDate={(current) => {
                const startDate = form.getFieldValue("startDate");
                return current && startDate && current < startDate;
              }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="isPublic"
            label={
              <span>
                Công khai{" "}
                <Tooltip title="Hiển thị chương trình này cho khách hàng xem">
                  <InfoCircleOutlined/>
                </Tooltip>
              </span>
            }
            valuePropName="checked"
          >
            <Switch disabled={isViewMode} checkedChildren="Có" unCheckedChildren="Không"/>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="priority"
            label={
              <span>
                Độ ưu tiên{" "}
                <Tooltip title="Mức độ ưu tiên khi áp dụng (1-10, càng cao càng ưu tiên)">
                  <InfoCircleOutlined/>
                </Tooltip>
              </span>
            }
            rules={[
              {required: true, message: "Vui lòng nhập độ ưu tiên!"},
              {
                type: "number",
                min: 1,
                max: 10,
                message: "Độ ưu tiên phải từ 1 đến 10!",
              },
            ]}
          >
            <MemoizedInputNumber
              min={1}
              max={10}
              placeholder="1-10"
              disabled={isViewMode}
              style={{width: "100%"}}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="notes" label="Ghi chú">
        <MemoizedTextArea
          rows={2}
          placeholder="Nhập ghi chú nội bộ (không hiển thị cho khách hàng)"
          disabled={isViewMode}
          maxLength={300}
          showCount
        />
      </Form.Item>
    </Card>
  );

  const renderUsageLimit = () => (
    <Card
      title={
        <div style={{display: "flex", alignItems: "center", gap: 8}}>
          <UserOutlined style={{color: "#722ed1"}}/>
          <span>Giới hạn sử dụng</span>
        </div>
      }
      size="small"
      style={{marginBottom: 16}}
    >
      <Alert
        message="Để trống nếu không muốn giới hạn"
        type="info"
        showIcon
        style={{marginBottom: 16}}
      />
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="usageLimit"
            label={
              <span>
                Giới hạn sử dụng tổng{" "}
                <Tooltip title="Tổng số lần có thể sử dụng chương trình này">
                  <InfoCircleOutlined/>
                </Tooltip>
              </span>
            }
          >
            <MemoizedInputNumber
              min={1}
              placeholder="Nhập giới hạn tổng (để trống nếu không giới hạn)"
              disabled={isViewMode}
              style={{width: "100%"}}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="customerLimit"
            label={
              <span>
                Giới hạn mỗi khách hàng{" "}
                <Tooltip title="Số lần tối đa mỗi khách hàng có thể sử dụng">
                  <InfoCircleOutlined/>
                </Tooltip>
              </span>
            }
          >
            <MemoizedInputNumber
              min={1}
              placeholder="Nhập giới hạn khách hàng (để trống nếu không giới hạn)"
              disabled={isViewMode}
              style={{width: "100%"}}
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  const renderTargetAudience = () => (
    <Card
      title={
        <div style={{display: "flex", alignItems: "center", gap: 8}}>
          <StarOutlined style={{color: "#fa8c16"}}/>
          <span>Đối tượng áp dụng</span>
        </div>
      }
      size="small"
      style={{marginBottom: 16}}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name={["targetAudience", "customerTypes"]}
            label="Loại khách hàng"
            rules={[{required: true, message: "Vui lòng chọn loại khách hàng!"}]}
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
            rules={[{required: true, message: "Vui lòng chọn chi nhánh!"}]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn chi nhánh"
              disabled={isViewMode}
              allowClear
              loading={branchesLoading}
              notFoundContent={branchesLoading ? <Spin size="small"/> : "Không có dữ liệu"}
            >
              <Option value="all">Tất cả chi nhánh</Option>
              {branches.map((branch) => (
                <Option key={branch.branch_id} value={branch.branch_id}>
                  {branch.branch_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name={["targetAudience", "services"]}
            label="Dịch vụ áp dụng"
            rules={[{required: true, message: "Vui lòng chọn dịch vụ!"}]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn dịch vụ"
              disabled={isViewMode}
              allowClear
              loading={servicesLoading}
              notFoundContent={servicesLoading ? <Spin size="small"/> : "Không có dữ liệu"}
              showSearch
              optionFilterProp="children"
            >
              <Option value="all">Tất cả dịch vụ</Option>
              {services?.map((service: any) => (
                <Option key={service.service_id} value={service.service_id}>
                  {service.service_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name={["targetAudience", "products"]}
            label="Sản phẩm áp dụng"
            rules={[{required: true, message: "Vui lòng chọn sản phẩm!"}]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn sản phẩm"
              disabled={isViewMode}
              allowClear
              loading={productsLoading}
              notFoundContent={productsLoading ? <Spin size="small"/> : "Không có dữ liệu"}
              showSearch
              optionFilterProp="children"
            >
              <Option value="all">Tất cả sản phẩm</Option>
              {products.map((product) => (
                <Option key={product.product_id} value={product.product_id}>
                  {product.product_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  const renderConditions = () => (
    <Card
      title={
        <div style={{display: "flex", alignItems: "center", gap: 8}}>
          <InfoCircleOutlined style={{color: "#13c2c2"}}/>
          <span>Điều kiện áp dụng</span>
        </div>
      }
      size="small"
    >
      <Alert
        message="Thiết lập điều kiện để khách hàng được áp dụng khuyến mãi"
        type="info"
        showIcon
        style={{marginBottom: 16}}
      />
      <Form.Item name="conditions">
        <PromotionConditionsBuilder disabled={isViewMode} showPreview={true}/>
      </Form.Item>
    </Card>
  );

  const renderBenefitsAndTerms = () => (
    <Card
      title={
        <div style={{display: "flex", alignItems: "center", gap: 8}}>
          <ShoppingCartOutlined style={{color: "#52c41a"}}/>
          <span>Lợi ích và điều khoản</span>
        </div>
      }
      size="small"
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="benefits"
            label="Lợi ích"
            rules={[{required: true, message: "Vui lòng nhập ít nhất 1 lợi ích!"}]}
          >
            <Select
              mode="tags"
              placeholder="Nhập lợi ích và nhấn Enter để thêm"
              disabled={isViewMode}
              style={{width: "100%"}}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="terms"
            label="Điều khoản"
            rules={[{required: true, message: "Vui lòng nhập ít nhất 1 điều khoản!"}]}
          >
            <Select
              mode="tags"
              placeholder="Nhập điều khoản và nhấn Enter để thêm"
              disabled={isViewMode}
              style={{width: "100%"}}
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
      okText={isViewMode ? "Đóng" : initialData ? "Cập nhật" : "Thêm mới"}
      cancelText={isViewMode ? null : "Hủy"}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: "draft",
          type: undefined, // Keep as undefined
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
          },
        }}
      >
        <Tabs
          defaultActiveKey="basic"
          type="card"
          items={[
            {
              key: "basic",
              label: (
                <span>
                  <GiftOutlined/> Thông tin cơ bản
                </span>
              ),
              children: (
                <>
                  {renderBasicInfo()}
                  {renderUsageLimit()}
                </>
              ),
            },
            {
              key: "audience",
              label: (
                <span>
                  <StarOutlined/> Đối tượng áp dụng
                </span>
              ),
              children: renderTargetAudience(),
            },
            {
              key: "conditions",
              label: (
                <span>
                  <InfoCircleOutlined/> Điều kiện
                </span>
              ),
              children: renderConditions(),
            },
            {
              key: "benefits",
              label: (
                <span>
                  <ShoppingCartOutlined/> Lợi ích & Điều khoản
                </span>
              ),
              children: renderBenefitsAndTerms(),
            },
          ]}
        />
      </Form>
    </Modal>
  );
};

export default PromotionModal;
