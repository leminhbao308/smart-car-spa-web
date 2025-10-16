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
  Typography,
  message,
  Card,
  DatePicker,
  Switch,
  Tabs,
  Tag,
  Alert,
  Tooltip,
  Table, App,
} from "antd";
import {
  GiftOutlined,
  PercentageOutlined,
  UserOutlined,
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  EditOutlined, CopyOutlined, EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  Promotion,
  CreatePromotionRequest,
  UpdatePromotionRequest,
  CreatePromotionLineRequest,
  LineType,
  DiscountType,
  LINE_TYPE_OPTIONS,
  DISCOUNT_TYPE_OPTIONS,
} from "@/lib/api";
import {MemoizedInput, MemoizedTextArea, MemoizedInputNumber} from "@/components/ui/MemoizedComponents";
import {useBranches} from "@/lib/api/hooks/useBranches";
import {useServices} from "@/lib/api/hooks/useServices";
import {useProducts} from "@/lib/api/hooks/useProducts";
import {useCategories} from "@/lib/api/hooks";
import {Service} from "@/lib/api";

const {Option} = Select;
const {Text} = Typography;

interface PromotionModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (data: CreatePromotionRequest | UpdatePromotionRequest) => void;
  initialData?: Promotion | null;
  title?: string;
  loading?: boolean;
  isViewMode?: boolean;
}

const PromotionModal: React.FC<PromotionModalProps> = ({
                                                         open,
                                                         onCancel,
                                                         onOk,
                                                         initialData,
                                                         title = "Thêm chương trình khuyến mãi mới",
                                                         loading = false,
                                                         isViewMode = false,
                                                       }) => {
  // Ant Design Message
  const {message} = App.useApp();
  const [form] = Form.useForm();
  const [promotionLines, setPromotionLines] = useState<CreatePromotionLineRequest[]>([]);
  const [editingLineIndex, setEditingLineIndex] = useState<number | null>(null);
  const [lineForm] = Form.useForm();

  // Fetch data from APIs
  const {branches, loading: branchesLoading} = useBranches();
  const {data: servicesData, isLoading: servicesLoading} = useServices({size: 100});
  const {products, isLoading: productsLoading} = useProducts({size: 100});
  const {data: categories, isLoading: categoriesLoading} = useCategories(0, 999);

  const services = useMemo(() => {
    const data = servicesData?.data;
    return Array.isArray(data) ? data : (data?.content ?? []);
  }, [servicesData?.data]);

  useEffect(() => {
    if (open) {
      if (initialData) {
        // Convert promotion_lines to editable format
        const lines = initialData.promotion_lines?.map(line => ({
          line_type: line.line_type,
          target_id: line.target_id,
          branch_id: line.branch?.branch_id,
          discount_type: line.discount_type,
          discount_value: line.discount_value,
          max_discount_amount: line.max_discount_amount,
          min_order_value: line.min_order_value,
          min_quantity: line.min_quantity,
          buy_qty: line.buy_qty,
          get_qty: line.get_qty,
          free_product_id: line.free_product?.product_id,
          free_quantity: line.free_quantity,
          start_at: line.start_at,
          end_at: line.end_at,
          line_priority: line.line_priority,
          is_active: line.is_active,
        })) || [];

        setPromotionLines(lines);

        form.setFieldsValue({
          promotion_code: initialData.promotion_code,
          name: initialData.name,
          description: initialData.description,
          start_at: initialData.start_at ? dayjs(initialData.start_at) : undefined,
          end_at: initialData.end_at ? dayjs(initialData.end_at) : undefined,
          usage_limit: initialData.usage_limit,
          per_customer_limit: initialData.per_customer_limit,
          priority: initialData.priority,
          is_stackable: initialData.is_stackable,
          coupon_redeem_once: initialData.coupon_redeem_once,
          branch_id: initialData.branch?.branch_id,
          is_active: initialData.is_active,
        });
      } else {
        setPromotionLines([]);
        form.resetFields();
        form.setFieldsValue({
          priority: 5,
          is_stackable: false,
          coupon_redeem_once: false,
          is_active: true,
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
      if (values.end_at && values.start_at && values.end_at.isBefore(values.start_at)) {
        message.error("Ngày kết thúc phải sau ngày bắt đầu!");
        return;
      }

      // Validate promotion lines
      if (promotionLines.length === 0) {
        message.error("Vui lòng thêm ít nhất một dòng khuyến mãi!");
        return;
      }

      const formattedData: CreatePromotionRequest | UpdatePromotionRequest = {
        promotion_code: values.promotion_code,
        name: values.name,
        description: values.description,
        start_at: values.start_at?.startOf('day').toISOString(),
        end_at: values.end_at?.startOf('day').toISOString(),
        usage_limit: values.usage_limit,
        per_customer_limit: values.per_customer_limit,
        priority: values.priority,
        is_stackable: values.is_stackable,
        coupon_redeem_once: values.coupon_redeem_once,
        branch_id: values.branch_id,
        promotion_lines: promotionLines,
        is_active: values.is_active ?? true,
      };

      onOk(formattedData);
    } catch (error) {
      console.log("Validation failed:", error);
      message.error("Vui lòng kiểm tra lại thông tin!");
    }
  };

  const handleAddLine = async () => {
    try {
      const values = await lineForm.validateFields();

      if (editingLineIndex !== null) {
        // Update existing line
        const newLines = [...promotionLines];
        newLines[editingLineIndex] = {
          ...values,
          start_at: values.start_at?.startOf('day').toISOString(),
          end_at: values.end_at?.startOf('day').toISOString(),
        };
        setPromotionLines(newLines);
        setEditingLineIndex(null);
        message.success("Cập nhật dòng khuyến mãi thành công!");
      } else {
        // Add new line
        const newLine: CreatePromotionLineRequest = {
          ...values,
          start_at: values.start_at?.startOf('day').toISOString(),
          end_at: values.end_at?.startOf('day').toISOString(),
          line_priority: promotionLines.length + 1,
          is_active: true,
        };
        setPromotionLines([...promotionLines, newLine]);
        message.success("Thêm dòng khuyến mãi thành công!");
      }

      lineForm.resetFields();
    } catch (error) {
      console.log("Line validation failed:", error);
    }
  };

  const handleEditLine = (index: number) => {
    const line = promotionLines[index];
    setEditingLineIndex(index);
    lineForm.setFieldsValue({
      ...line,
      start_at: line.start_at ? dayjs(line.start_at) : undefined,
      end_at: line.end_at ? dayjs(line.end_at) : undefined,
    });
  };

  const handleCopyLine = (index: number) => {
    const lineToCopy = promotionLines[index];
    const newLine = {
      ...lineToCopy,
      line_priority: promotionLines.length + 1,
    };
    setPromotionLines([...promotionLines, newLine]);
    message.success('Sao chép dòng khuyến mãi thành công!');
  };

  const handleDeleteLine = (index: number) => {
    const newLines = promotionLines.filter((_, i) => i !== index);
    setPromotionLines(newLines);
    message.success("Xóa dòng khuyến mãi thành công!");
  };

  const lineColumns = [
    {
      title: "Loại áp dụng",
      dataIndex: "line_type",
      key: "line_type",
      render: (type: LineType) => {
        const option = LINE_TYPE_OPTIONS.find(o => o.value === type);
        return <Tag color="blue">{option?.label}</Tag>;
      },
    },
    {
      title: "Đối tượng",
      dataIndex: "target_id",
      key: "target_id",
      render: (targetId: string, record: CreatePromotionLineRequest) => {
        if (record.line_type === LineType.ALL) return <Text type="secondary">Tất cả</Text>;
        if (record.line_type === LineType.PRODUCT) {
          const product = products.find(p => p.product_id === targetId);
          return product?.product_name || targetId;
        }
        if (record.line_type === LineType.SERVICE) {
          const service = services.find(s => s.service_id === targetId);
          return service?.service_name || targetId;
        }
        return targetId || <Text type="secondary">Chưa chọn</Text>;
      },
    },
    {
      title: "Loại giảm giá",
      dataIndex: "discount_type",
      key: "discount_type",
      render: (type: DiscountType) => {
        const option = DISCOUNT_TYPE_OPTIONS.find(o => o.value === type);
        return (
          <Space>
            <span>{option?.icon}</span>
            <span>{option?.label}</span>
          </Space>
        );
      },
    },
    {
      title: "Giá trị",
      dataIndex: "discount_value",
      key: "discount_value",
      render: (value: number, record: CreatePromotionLineRequest) => {
        if (record.discount_type === DiscountType.PERCENT) return `${value}%`;
        if (record.discount_type === DiscountType.AMOUNT) return `${value?.toLocaleString()} ₫`;
        return value || "-";
      },
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, __: any, index: number) => (
        <Space>
          {isViewMode &&
              <Button
                  type="link"
                  icon={<EyeOutlined/>}
                  onClick={() => handleEditLine(index)}
              >
                  Xem
              </Button>
          }

          {!isViewMode &&
              <>
                  <Button
                      type="link"
                      icon={<EditOutlined/>}
                      onClick={() => handleEditLine(index)}
                      disabled={isViewMode}
                  >
                      Sửa
                  </Button>
                  <Button
                      type="link"
                      icon={<CopyOutlined/>}
                      onClick={() => handleCopyLine(index)}
                      disabled={isViewMode}
                  >
                      Sao chép
                  </Button>
                  <Button
                      type="link"
                      danger
                      icon={<DeleteOutlined/>}
                      onClick={() => handleDeleteLine(index)}
                      disabled={isViewMode}
                  >
                      Xóa
                  </Button>
              </>
          }
        </Space>
      ),
    },
  ];

  const renderBasicInfo = () => (
    <Card
      title={
        <Row gutter={16}>
          <Col span={24}>
            <Row align={"middle"} style={{gap: 8}}>
              {`Trạng thái`}

              {isViewMode && initialData && (
                <Tag color={initialData.is_active ? "green" : "red"}>
                  {initialData.is_active ? "Đang hoạt động" : "Đã ngừng"}
                </Tag>
              )}

              {!isViewMode && initialData && (
                <Form.Item
                  name="is_active"
                  valuePropName="checked"
                  style={{marginBottom: 0}}
                >
                  <Switch
                    checkedChildren="Đang hoạt động"
                    unCheckedChildren="Đã ngừng"
                    defaultChecked={initialData.is_active}
                  />
                </Form.Item>
              )}
            </Row>
          </Col>
        </Row>
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
            name="promotion_code"
            label={
              <span>
                Mã khuyến mãi{" "}
                <Tooltip title="Để trống nếu không cần mã coupon">
                  <InfoCircleOutlined/>
                </Tooltip>
              </span>
            }
            rules={[
              {
                pattern: /^[A-Z0-9_-]+$/,
                message: "Mã chỉ được chứa chữ in hoa, số, gạch dưới và gạch ngang!",
              },
              {max: 50, message: "Mã không được vượt quá 50 ký tự!"},
            ]}
          >
            <MemoizedInput
              placeholder="Nhập mã coupon (VD: SUMMER2024)"
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
            name="start_at"
            label="Ngày bắt đầu"
          >
            <DatePicker
              style={{width: "100%"}}
              disabled={isViewMode}
              placeholder="Chọn ngày bắt đầu"
              format="DD/MM/YYYY"
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="end_at"
            label="Ngày kết thúc"
          >
            <DatePicker
              style={{width: "100%"}}
              disabled={isViewMode}
              placeholder="Chọn ngày kết thúc"
              format="DD/MM/YYYY"
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="branch_id"
            label={
              <span>
                Chi nhánh{" "}
                <Tooltip title="Để trống nếu áp dụng cho tất cả chi nhánh">
                  <InfoCircleOutlined/>
                </Tooltip>
              </span>
            }
          >
            <Select
              placeholder="Chọn chi nhánh"
              disabled={isViewMode}
              allowClear
              loading={branchesLoading}
              showSearch
              optionFilterProp="children"
            >
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
        <Col span={8}>
          <Form.Item
            name="priority"
            label={
              <span>
                Độ ưu tiên{" "}
                <Tooltip title="Số thấp = ưu tiên cao hơn (1-10)">
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
        <Col span={8}>
          <Form.Item
            name="is_stackable"
            label={
              <span>
                Cộng dồn với KM khác{" "}
                <Tooltip title="Cho phép sử dụng kết hợp với khuyến mãi khác">
                  <InfoCircleOutlined/>
                </Tooltip>
              </span>
            }
            valuePropName="checked"
          >
            <Switch disabled={isViewMode} checkedChildren="Có" unCheckedChildren="Không"/>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="coupon_redeem_once"
            label={
              <span>
                Mã dùng 1 lần{" "}
                <Tooltip title="Mã coupon chỉ được sử dụng một lần">
                  <InfoCircleOutlined/>
                </Tooltip>
              </span>
            }
            valuePropName="checked"
          >
            <Switch disabled={isViewMode} checkedChildren="Có" unCheckedChildren="Không"/>
          </Form.Item>
        </Col>
      </Row>
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
      {!isViewMode && <Alert
          message="Để trống nếu không muốn giới hạn"
          type="info"
          showIcon
          style={{marginBottom: 16}}
      />}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="usage_limit"
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
              placeholder="Nhập giới hạn tổng"
              disabled={isViewMode}
              style={{width: "100%"}}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="per_customer_limit"
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
              placeholder="Nhập giới hạn khách hàng"
              disabled={isViewMode}
              style={{width: "100%"}}
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  const renderPromotionLines = () => {
    return (
      <Card
        title={
          <div style={{display: "flex", alignItems: "center", gap: 8}}>
            <PercentageOutlined style={{color: "#52c41a"}}/>
            <span>Dòng khuyến mãi</span>
          </div>
        }
        size="small"
      >
        {!isViewMode && <Alert
            message="Mỗi dòng khuyến mãi xác định cách thức giảm giá cho sản phẩm/dịch vụ cụ thể"
            type="info"
            showIcon
            style={{marginBottom: 16}}
        />}


        <Card size="small" style={{marginBottom: 16, background: "#fafafa"}}>
          <Form form={lineForm} layout="vertical" disabled={isViewMode}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="line_type"
                  label="Loại áp dụng"
                  rules={[{required: true, message: "Vui lòng chọn loại!"}]}
                >
                  <Select placeholder="Chọn loại áp dụng"
                          onChange={() => lineForm.setFieldsValue({target_id: undefined})}
                  >
                    {LINE_TYPE_OPTIONS.map((opt) => (
                      <Option key={opt.value} value={opt.value}>
                        {`${opt.label} - ${opt.description}`}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item noStyle shouldUpdate={(prev, curr) => prev.line_type !== curr.line_type}>
                  {({getFieldValue}) => {
                    const lineType = getFieldValue("line_type");
                    if (lineType === LineType.ALL) return null;

                    return (
                      <Form.Item
                        name="target_id"
                        label="Đối tượng cụ thể"
                        rules={[{required: lineType !== LineType.ALL, message: "Vui lòng chọn đối tượng!"}]}
                      >
                        {lineType === LineType.PRODUCT && (
                          <Select
                            placeholder="Chọn sản phẩm"
                            loading={productsLoading}
                            showSearch
                            optionFilterProp="children"
                          >
                            {products.map((product) => (
                              <Option key={product.product_id} value={product.product_id}>
                                {product.product_name}
                              </Option>
                            ))}
                          </Select>
                        )}
                        {lineType === LineType.SERVICE && (
                          <Select
                            placeholder="Chọn dịch vụ"
                            loading={servicesLoading}
                            showSearch
                            optionFilterProp="children"
                          >
                            {services.map((service: Service) => (
                              <Option key={service.service_id} value={service.service_id}>
                                {service.service_name}
                              </Option>
                            ))}
                          </Select>
                        )}
                        {lineType === LineType.CATEGORY && (
                          <Select
                            placeholder="Chọn danh mục"
                            loading={categoriesLoading}
                            showSearch
                            optionFilterProp="children"
                          >
                            {categories?.data.content.map((category) => (
                              <Option key={category.category_id} value={category.category_id}>
                                {category.category_name}
                              </Option>
                            ))}
                          </Select>
                        )}
                      </Form.Item>
                    );
                  }}
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="discount_type"
                  label="Loại giảm giá"
                  rules={[{required: true, message: "Vui lòng chọn loại giảm giá!"}]}
                >
                  <Select placeholder="Chọn loại giảm giá"
                          onChange={() => lineForm.setFieldValue("discount_value", undefined)}
                  >
                    {DISCOUNT_TYPE_OPTIONS.map((opt) => (
                      <Option key={opt.value} value={opt.value}>
                        <Space>
                          <span>{opt.icon}</span>
                          <span>{opt.label}</span>
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={16}>
                <Form.Item noStyle shouldUpdate={(prev, curr) => prev.discount_type !== curr.discount_type}>
                  {({getFieldValue}) => {
                    const discountType = getFieldValue("discount_type");

                    return (
                      <Row gutter={16}>
                        {(discountType && (discountType === DiscountType.PERCENT || discountType === DiscountType.AMOUNT)) && (
                          <>
                            <Col span={12}>
                              <Form.Item
                                name="discount_value"
                                label="Giá trị giảm"
                                rules={[
                                  {required: true, message: "Vui lòng nhập giá trị!"},
                                  {
                                    validator: (_, value) => {
                                      if (discountType === DiscountType.PERCENT && value > 100) {
                                        return Promise.reject("Phần trăm không được vượt quá 100%!");
                                      }
                                      return Promise.resolve();
                                    },
                                  },
                                ]}
                              >
                                <MemoizedInputNumber
                                  min={0}
                                  max={discountType === DiscountType.PERCENT ? 100 : undefined}
                                  placeholder="Nhập giá trị"
                                  style={{width: "100%"}}
                                  addonAfter={discountType === DiscountType.PERCENT ? "%" : "₫"}
                                />
                              </Form.Item>
                            </Col>

                            {discountType === DiscountType.PERCENT && (
                              <Col span={12}>
                                <Form.Item
                                  name="max_discount_amount"
                                  label="Giảm tối đa"
                                >
                                  <MemoizedInputNumber
                                    min={0}
                                    placeholder="Giới hạn giảm tối đa"
                                    style={{width: "100%"}}
                                    addonAfter="₫"
                                  />
                                </Form.Item>
                              </Col>
                            )}
                          </>
                        )}

                        {discountType === DiscountType.BUY_X_GET_Y && (
                          <>
                            <Col span={12}>
                              <Form.Item
                                name="buy_qty"
                                label="Mua số lượng"
                                rules={[{required: true, message: "Nhập số lượng mua!"}]}
                              >
                                <MemoizedInputNumber
                                  min={1}
                                  placeholder="Số lượng"
                                  style={{width: "100%"}}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item
                                name="get_qty"
                                label="Tặng số lượng"
                                rules={[{required: true, message: "Nhập số lượng tặng!"}]}
                              >
                                <MemoizedInputNumber
                                  min={1}
                                  placeholder="Số lượng"
                                  style={{width: "100%"}}
                                />
                              </Form.Item>
                            </Col>
                          </>
                        )}

                        {discountType === DiscountType.FREE_PRODUCT && (
                          <>
                            <Col span={12}>
                              <Form.Item
                                name="free_product_id"
                                label="Sản phẩm tặng"
                                rules={[{required: true, message: "Chọn sản phẩm tặng!"}]}
                              >
                                <Select
                                  placeholder="Chọn sản phẩm tặng"
                                  loading={productsLoading}
                                  showSearch
                                  optionFilterProp="children"
                                >
                                  {products.map((product) => (
                                    <Option key={product.product_id} value={product.product_id}>
                                      {product.product_name}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item
                                name="free_quantity"
                                label="Số lượng tặng"
                                rules={[{required: true, message: "Nhập số lượng!"}]}
                              >
                                <MemoizedInputNumber
                                  min={1}
                                  placeholder="Số lượng"
                                  style={{width: "100%"}}
                                />
                              </Form.Item>
                            </Col>
                          </>
                        )}
                      </Row>
                    );
                  }}
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="min_order_value" label="Giá trị đơn tối thiểu">
                  <MemoizedInputNumber
                    min={0}
                    placeholder="Giá trị đơn hàng tối thiểu"
                    style={{width: "100%"}}
                    addonAfter="₫"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="min_quantity" label="Số lượng tối thiểu">
                  <MemoizedInputNumber
                    min={1}
                    placeholder="Số lượng tối thiểu"
                    style={{width: "100%"}}
                  />
                </Form.Item>
              </Col>
            </Row>

            {!isViewMode &&
                <Button
                    type="primary"
                    icon={editingLineIndex !== null ? <EditOutlined/> : <PlusOutlined/>}
                    onClick={handleAddLine}
                    style={{width: "100%"}}
                >
                  {editingLineIndex !== null ? "Cập nhật dòng" : "Thêm dòng khuyến mãi"}
                </Button>
            }
          </Form>
        </Card>

        <Table
          dataSource={promotionLines}
          columns={lineColumns}
          rowKey={(_, index) => `line-${index}`}
          pagination={false}
          locale={{emptyText: "Chưa có dòng khuyến mãi nào"}}
          size="small"
          scroll={{x: "max-content", y: 200}}
        />
      </Card>
    );
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      width={1200}
      okText={isViewMode ? "Đóng" : initialData ? "Cập nhật" : "Thêm mới"}
      cancelText={isViewMode ? null : "Hủy"}
      confirmLoading={loading}
      destroyOnHidden={true}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          priority: 5,
          is_stackable: false,
          coupon_redeem_once: false,
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
              key: "lines",
              label: (
                <span>
                  <PercentageOutlined/> Thông tin khuyến mãi
                  {promotionLines.length > 0 && (
                    <Tag color="blue" style={{marginLeft: 8}}>
                      {promotionLines.length}
                    </Tag>
                  )}
                </span>
              ),
              children: renderPromotionLines(),
            },
          ]}
        />
      </Form>
    </Modal>
  );
};

export default PromotionModal;
