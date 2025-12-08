"use client";
import React, {useState, useCallback, useMemo} from "react";
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
  DatePicker,
  Spin,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {MemoizedInput, MemoizedInputNumber} from "@/components/ui/MemoizedComponents";
import {
  PromotionLine,
  CreatePromotionLineRequest,
  LineType,
  DiscountType,
  LINE_TYPE_OPTIONS,
  DISCOUNT_TYPE_OPTIONS,
  getLineTypeLabel,
  getDiscountTypeLabel,
  getDiscountTypeIcon,
  formatDiscountValue,
} from "@/lib/api/types/promotion.types";
import {useBranches} from "@/lib/api/hooks/useBranches";
import {useProducts} from "@/lib/api/hooks/useProducts";
import {useServices} from "@/lib/api/hooks/useServices";
import dayjs from "dayjs";

const {Title, Text} = Typography;
const {Option} = Select;

interface PromotionConditionsBuilderProps {
  value?: PromotionLine[];
  onChange?: (lines: PromotionLine[]) => void;
  disabled?: boolean;
  showPreview?: boolean;
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
  const [selectedLineType, setSelectedLineType] = useState<LineType | null>(null);

  // Fetch data from APIs
  const {branches, loading: branchesLoading} = useBranches();
  const {products, isLoading: productsLoading} = useProducts({size: 1000});
  const {data: servicesData, isLoading: servicesLoading} = useServices({size: 1000});

  const services = useMemo(() => {
    const data = servicesData?.data;
    return Array.isArray(data) ? data : (data?.content ?? []);
  }, [servicesData?.data]);

  // Transform data to options format
  const branchOptions = useMemo(() =>
      branches.map(branch => ({
        value: branch.branch_id,
        label: branch.branch_name,
      })),
    [branches]
  );

  const productOptions = useMemo(() =>
      products.map(product => ({
        value: product.product_id,
        label: `${product.product_name} - ${product.product_type_name}`,
        disabled: !product.is_active,
      })),
    [products]
  );

  const serviceOptions = useMemo(() =>
      services.map(service => ({
        value: service.service_id,
        label: `${service.service_name} - ${service.service_type_name}`,
        disabled: !service.is_active,
      })),
    [services]
  );

  // Free product options (only active products)
  const freeProductOptions = useMemo(() =>
      products
        .filter(product => product.is_active)
        .map(product => ({
          value: product.product_id,
          label: product.product_name,
        })),
    [products]
  );

  const getTargetOptions = useCallback((lineType: LineType) => {
    switch (lineType) {
      case LineType.SERVICE:
        return serviceOptions;
      case LineType.PRODUCT:
        return productOptions;
      case LineType.CATEGORY:
        // TODO: Implement category options when available
        return [];
      default:
        return [];
    }
  }, [serviceOptions, productOptions]);

  const getTargetName = useCallback((lineType: LineType, targetId?: string) => {
    if (!targetId) return null;

    switch (lineType) {
      case LineType.SERVICE:
        return services.find(s => s.service_id === targetId)?.service_name;
      case LineType.PRODUCT:
        return products.find(p => p.product_id === targetId)?.product_name;
      case LineType.CATEGORY:
        // TODO: Get category name
        return targetId;
      default:
        return targetId;
    }
  }, [services, products]);

  const handleAddLine = useCallback(async () => {
    try {
      const values = await form.validateFields();

      const newLine: PromotionLine = {
        promotion_line_id: `temp_${Date.now()}`,
        line_type: values.lineType,
        target_id: values.targetId,
        branch: values.branchId ? {
          branchId: values.branchId,
          branchName: branches.find(b => b.branch_id === values.branchId)?.branch_name || ''
        } : undefined,
        discount_type: values.discountType,
        discount_value: values.discountValue,
        max_discount_amount: values.maxDiscountAmount,
        min_order_value: values.minOrderValue,
        min_quantity: values.minQuantity,
        buy_qty: values.buyQty,
        get_qty: values.getQty,
        free_product: values.freeProductId ? {
          productId: values.freeProductId,
          productName: products.find(p => p.product_id === values.freeProductId)?.product_name || ''
        } : undefined,
        free_quantity: values.freeQuantity,
        start_at: values.startAt?.format('YYYY-MM-DD'),
        end_at: values.endAt?.format('YYYY-MM-DD'),
        line_priority: values.linePriority || 0,
        is_active: values.isActive !== false,
        created_at: new Date().toISOString(),
      };

      const newLines = [...value, newLine];
      onChange?.(newLines);

      form.resetFields();
      setShowForm(false);
      setEditingIndex(null);
      setSelectedLineType(null);
    } catch (error) {
      console.log("Validation failed:", error);
    }
  }, [form, value, onChange, branches, products]);

  const handleEditLine = useCallback(async () => {
    if (editingIndex === null) return;

    try {
      const values = await form.validateFields();

      const updatedLine: PromotionLine = {
        ...value[editingIndex],
        line_type: values.lineType,
        target_id: values.targetId,
        branch: values.branchId ? {
          branchId: values.branchId,
          branchName: branches.find(b => b.branch_id === values.branchId)?.branch_name || ''
        } : undefined,
        discount_type: values.discountType,
        discount_value: values.discountValue,
        max_discount_amount: values.maxDiscountAmount,
        min_order_value: values.minOrderValue,
        min_quantity: values.minQuantity,
        buy_qty: values.buyQty,
        get_qty: values.getQty,
        free_product: values.freeProductId ? {
          productId: values.freeProductId,
          productName: products.find(p => p.product_id === values.freeProductId)?.product_name || ''
        } : undefined,
        free_quantity: values.freeQuantity,
        start_at: values.startAt?.format('YYYY-MM-DD'),
        end_at: values.endAt?.format('YYYY-MM-DD'),
        line_priority: values.linePriority || 0,
        is_active: values.isActive !== false,
      };

      const newLines = [...value];
      newLines[editingIndex] = updatedLine;
      onChange?.(newLines);

      form.resetFields();
      setShowForm(false);
      setEditingIndex(null);
      setSelectedLineType(null);
    } catch (error) {
      console.log("Validation failed:", error);
    }
  }, [form, value, onChange, editingIndex, branches, products]);

  const handleDeleteLine = useCallback((index: number) => {
    const newLines = value.filter((_, i) => i !== index);
    onChange?.(newLines);
  }, [value, onChange]);

  const handleEditStart = useCallback((index: number) => {
    const line = value[index];
    form.setFieldsValue({
      lineType: line.line_type,
      targetId: line.target_id,
      branchId: line.branch?.branchId,
      discountType: line.discount_type,
      discountValue: line.discount_value,
      maxDiscountAmount: line.max_discount_amount,
      minOrderValue: line.min_order_value,
      minQuantity: line.min_quantity,
      buyQty: line.buy_qty,
      getQty: line.get_qty,
      freeProductId: line.free_product?.productId,
      freeQuantity: line.free_quantity,
      startAt: line.start_at ? dayjs(line.start_at) : undefined,
      endAt: line.end_at ? dayjs(line.end_at) : undefined,
      linePriority: line.line_priority,
      isActive: line.is_active,
    });
    setSelectedLineType(line.line_type);
    setEditingIndex(index);
    setShowForm(true);
  }, [form, value]);

  const handleCancel = useCallback(() => {
    form.resetFields();
    setShowForm(false);
    setEditingIndex(null);
    setSelectedLineType(null);
  }, [form]);

  const handleLineTypeChange = (lineType: LineType) => {
    setSelectedLineType(lineType);
    form.setFieldsValue({targetId: undefined});
  };

  const isLoading = branchesLoading || productsLoading || servicesLoading;

  const renderLineForm = () => (
    <Card
      title={
        <div style={{display: "flex", alignItems: "center", gap: 8}}>
          <InfoCircleOutlined style={{color: "#1890ff"}}/>
          <span>{editingIndex !== null ? "Chỉnh sửa điều kiện" : "Thêm điều kiện mới"}</span>
        </div>
      }
      size="small"
      style={{marginBottom: 16}}
    >
      <Spin spinning={isLoading} tip="Đang tải dữ liệu...">
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            isActive: true,
            linePriority: 0,
          }}
        >
          <Alert
            message="Thông tin cơ bản"
            description="Chọn loại áp dụng và cách thức giảm giá cho điều kiện này"
            type="info"
            showIcon
            style={{marginBottom: 16}}
          />

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="lineType"
                label="Áp dụng cho"
                rules={[{required: true, message: "Vui lòng chọn loại áp dụng!"}]}
                tooltip="Chọn đối tượng áp dụng khuyến mãi"
              >
                <Select
                  placeholder="Chọn loại áp dụng"
                  disabled={disabled}
                  onChange={handleLineTypeChange}
                >
                  {LINE_TYPE_OPTIONS.map((option) => (
                    <Option key={option.value} value={option.value}>
                      <div>
                        <div><strong>{option.label}</strong></div>
                        <Text type="secondary" style={{fontSize: 11}}>
                          {option.description}
                        </Text>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="discountType"
                label="Loại giảm giá"
                rules={[{required: true, message: "Vui lòng chọn loại giảm giá!"}]}
                tooltip="Chọn cách thức giảm giá"
              >
                <Select
                  placeholder="Chọn loại giảm giá"
                  disabled={disabled}
                >
                  {DISCOUNT_TYPE_OPTIONS.map((option) => (
                    <Option key={option.value} value={option.value}>
                      <div>
                        <div>
                          <span style={{marginRight: 8}}>{option.icon}</span>
                          <strong>{option.label}</strong>
                        </div>
                        <Text type="secondary" style={{fontSize: 11}}>
                          {option.description}
                        </Text>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item shouldUpdate={(prev, curr) => prev.lineType !== curr.lineType}>
            {({getFieldValue}) => {
              const lineType = getFieldValue("lineType");
              if (lineType && lineType !== LineType.ALL) {
                const options = getTargetOptions(lineType);
                const isLoadingOptions =
                  (lineType === LineType.SERVICE && servicesLoading) ||
                  (lineType === LineType.PRODUCT && productsLoading);

                return (
                  <Form.Item
                    name="targetId"
                    label={
                      lineType === LineType.SERVICE
                        ? "Dịch vụ"
                        : lineType === LineType.PRODUCT
                          ? "Sản phẩm"
                          : "Danh mục"
                    }
                    rules={[{required: true, message: "Vui lòng chọn đối tượng!"}]}
                  >
                    <Select
                      placeholder={`Chọn ${
                        lineType === LineType.SERVICE
                          ? "dịch vụ"
                          : lineType === LineType.PRODUCT
                            ? "sản phẩm"
                            : "danh mục"
                      }`}
                      disabled={disabled || isLoadingOptions}
                      showSearch
                      optionFilterProp="children"
                      loading={isLoadingOptions}
                      filterOption={(input, option) =>
                        String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {options.map((option) => (
                        <Option
                          key={option.value}
                          value={option.value}
                          label={option.label}
                          disabled={option.disabled}
                        >
                          <div>
                            <span>{option.label}</span>
                            {option.disabled && (
                              <Tag color="default" style={{marginLeft: 8, fontSize: 10}}>
                                Ngừng hoạt động
                              </Tag>
                            )}
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                );
              }
              return null;
            }}
          </Form.Item>

          <Form.Item
            name="branchId"
            label="Chi nhánh áp dụng"
            tooltip="Để trống nếu áp dụng cho tất cả chi nhánh"
          >
            <Select
              placeholder="Tất cả chi nhánh"
              disabled={disabled || branchesLoading}
              allowClear
              loading={branchesLoading}
              showSearch
              optionFilterProp="children"
            >
              {branchOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Divider orientation="left">Giá trị giảm giá</Divider>

          <Form.Item shouldUpdate={(prev, curr) => prev.discountType !== curr.discountType}>
            {({getFieldValue}) => {
              const discountType = getFieldValue("discountType");

              if (discountType === DiscountType.PERCENT) {
                return (
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="discountValue"
                        label="Phần trăm giảm"
                        rules={[
                          {required: true, message: "Vui lòng nhập phần trăm giảm!"},
                          {type: 'number', min: 0, max: 100, message: "Giá trị từ 0-100%"}
                        ]}
                      >
                        <MemoizedInputNumber
                          min={0}
                          max={100}
                          placeholder="Nhập % giảm"
                          disabled={disabled}
                          style={{width: "100%"}}
                          addonAfter="%"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="maxDiscountAmount"
                        label="Giảm tối đa"
                        tooltip="Số tiền giảm tối đa cho phần trăm"
                      >
                        <MemoizedInputNumber
                          min={0}
                          placeholder="Không giới hạn"
                          disabled={disabled}
                          style={{width: "100%"}}
                          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                          parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                          addonAfter="₫"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                );
              }

              if (discountType === DiscountType.AMOUNT) {
                return (
                  <Form.Item
                    name="discountValue"
                    label="Số tiền giảm"
                    rules={[{required: true, message: "Vui lòng nhập số tiền giảm!"}]}
                  >
                    <MemoizedInputNumber
                      min={0}
                      placeholder="Nhập số tiền giảm"
                      disabled={disabled}
                      style={{width: "100%"}}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                      addonAfter="₫"
                    />
                  </Form.Item>
                );
              }

              if (discountType === DiscountType.FREE_PRODUCT) {
                return (
                  <Row gutter={16}>
                    <Col span={16}>
                      <Form.Item
                        name="freeProductId"
                        label="Sản phẩm tặng"
                        rules={[{required: true, message: "Vui lòng chọn sản phẩm tặng!"}]}
                      >
                        <Select
                          placeholder="Chọn sản phẩm tặng"
                          disabled={disabled || productsLoading}
                          showSearch
                          loading={productsLoading}
                          optionFilterProp="children"
                        >
                          {freeProductOptions.map((option) => (
                            <Option key={option.value} value={option.value}>
                              {option.label}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="freeQuantity"
                        label="Số lượng"
                        rules={[{required: true, message: "Nhập số lượng!"}]}
                      >
                        <MemoizedInputNumber
                          min={1}
                          placeholder="SL"
                          disabled={disabled}
                          style={{width: "100%"}}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                );
              }

              if (discountType === DiscountType.BUY_X_GET_Y) {
                return (
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="buyQty"
                        label="Mua số lượng"
                        rules={[{required: true, message: "Nhập số lượng mua!"}]}
                      >
                        <MemoizedInputNumber
                          min={1}
                          placeholder="Mua X"
                          disabled={disabled}
                          style={{width: "100%"}}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="getQty"
                        label="Tặng số lượng"
                        rules={[{required: true, message: "Nhập số lượng tặng!"}]}
                      >
                        <MemoizedInputNumber
                          min={1}
                          placeholder="Tặng Y"
                          disabled={disabled}
                          style={{width: "100%"}}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                );
              }

              return null;
            }}
          </Form.Item>

          <Divider orientation="left">Điều kiện áp dụng</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="minOrderValue"
                label="Giá trị đơn tối thiểu"
                tooltip="Để trống nếu không giới hạn"
              >
                <MemoizedInputNumber
                  min={0}
                  placeholder="Không giới hạn"
                  disabled={disabled}
                  style={{width: "100%"}}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                  addonAfter="₫"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="minQuantity"
                label="Số lượng tối thiểu"
                tooltip="Để trống nếu không giới hạn"
              >
                <MemoizedInputNumber
                  min={0}
                  placeholder="Không giới hạn"
                  disabled={disabled}
                  style={{width: "100%"}}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Cài đặt nâng cao</Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="linePriority"
                label="Độ ưu tiên"
                tooltip="Số càng cao, ưu tiên càng cao (0-100)"
              >
                <MemoizedInputNumber
                  min={0}
                  max={100}
                  placeholder="0"
                  disabled={disabled}
                  style={{width: "100%"}}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="startAt"
                label="Bắt đầu"
                tooltip="Để trống nếu áp dụng theo khuyến mãi chính"
              >
                <DatePicker
                  placeholder="Chọn ngày"
                  disabled={disabled}
                  style={{width: "100%"}}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="endAt"
                label="Kết thúc"
                tooltip="Để trống nếu áp dụng theo khuyến mãi chính"
              >
                <DatePicker
                  placeholder="Chọn ngày"
                  disabled={disabled}
                  style={{width: "100%"}}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="isActive"
                label="Trạng thái"
                valuePropName="checked"
              >
                <Switch
                  disabled={disabled}
                  checkedChildren="Kích hoạt"
                  unCheckedChildren="Tạm dừng"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                onClick={editingIndex !== null ? handleEditLine : handleAddLine}
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
      </Spin>
    </Card>
  );

  const renderLinePreview = () => (
    <Card
      title={
        <div style={{display: "flex", alignItems: "center", gap: 8}}>
          <ExclamationCircleOutlined style={{color: "#fa8c16"}}/>
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
          {value.map((line, index) => (
            <div key={line.promotion_line_id || index} style={{marginBottom: 12}}>
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}>
                <div style={{flex: 1}}>
                  <Space size={4} wrap>
                    <Tag color={line.is_active ? "success" : "default"}>
                      {line.is_active ? "Hoạt động" : "Tạm dừng"}
                    </Tag>
                    <Tag color="blue">
                      {getDiscountTypeIcon(line.discount_type)} {getLineTypeLabel(line.line_type)}
                    </Tag>
                    {line.line_priority > 0 && (
                      <Tag color="orange">Ưu tiên: {line.line_priority}</Tag>
                    )}
                  </Space>

                  <div style={{marginTop: 8}}>
                    <Text strong style={{fontSize: 13}}>
                      {getDiscountTypeLabel(line.discount_type)}: {formatDiscountValue(line.discount_type, line.discount_value)}
                    </Text>
                  </div>

                  {line.target_id && line.line_type !== LineType.ALL && (
                    <div style={{marginTop: 4}}>
                      <Text type="secondary" style={{fontSize: 12}}>
                        Đối tượng: {getTargetName(line.line_type, line.target_id) || line.target_id}
                      </Text>
                    </div>
                  )}

                  {line.min_order_value && (
                    <div style={{marginTop: 4}}>
                      <Text type="secondary" style={{fontSize: 12}}>
                        Đơn tối thiểu: {line.min_order_value.toLocaleString()}₫
                      </Text>
                    </div>
                  )}

                  {line.min_quantity && (
                    <div style={{marginTop: 4}}>
                      <Text type="secondary" style={{fontSize: 12}}>
                        Số lượng tối thiểu: {line.min_quantity}
                      </Text>
                    </div>
                  )}

                  {line.max_discount_amount && (
                    <div style={{marginTop: 4}}>
                      <Text type="secondary" style={{fontSize: 12}}>
                        Giảm tối đa: {line.max_discount_amount.toLocaleString()}₫
                      </Text>
                    </div>
                  )}

                  {line.branch && (
                    <div style={{marginTop: 4}}>
                      <Tag color="cyan" style={{fontSize: 11}}>
                        {line.branch.branchName}
                      </Tag>
                    </div>
                  )}

                  {(line.start_at || line.end_at) && (
                    <div style={{marginTop: 4}}>
                      <Text type="secondary" style={{fontSize: 11}}>
                        {line.start_at && `Từ ${dayjs(line.start_at).format('DD/MM/YYYY')}`}
                        {line.start_at && line.end_at && ' - '}
                        {line.end_at && `đến ${dayjs(line.end_at).format('DD/MM/YYYY')}`}
                      </Text>
                    </div>
                  )}
                </div>

                {!disabled && (
                  <Space size="small">
                    <Tooltip title="Chỉnh sửa">
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined/>}
                        onClick={() => handleEditStart(index)}
                      />
                    </Tooltip>
                    <Popconfirm
                      title="Xác nhận xóa"
                      description="Bạn có chắc chắn muốn xóa điều kiện này?"
                      onConfirm={() => handleDeleteLine(index)}
                      okText="Xóa"
                      cancelText="Hủy"
                    >
                      <Tooltip title="Xóa">
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined/>}
                        />
                      </Tooltip>
                    </Popconfirm>
                  </Space>
                )}
              </div>
              {index < value.length - 1 && <Divider style={{margin: "12px 0"}}/>}
            </div>
          ))}
        </div>
      )}
    </Card>
  );

  return (
    <div>
      {showPreview && renderLinePreview()}

      {!disabled && (
        <div style={{marginTop: 16}}>
          {!showForm ? (
            <Button
              type="dashed"
              icon={<PlusOutlined/>}
              onClick={() => setShowForm(true)}
              style={{width: "100%"}}
              loading={isLoading}
            >
              Thêm điều kiện
            </Button>
          ) : (
            renderLineForm()
          )}
        </div>
      )}
    </div>
  );
};

export default PromotionConditionsBuilder;
