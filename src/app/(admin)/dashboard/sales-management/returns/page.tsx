"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  DatePicker,
  Tag,
  Typography,
  Row,
  Col,
  Modal,
  Descriptions,
  Divider,
  Tooltip,
  Spin,
  Alert,
  Form,
  message,
  App,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  FilterOutlined,
  ReloadOutlined,
  UndoOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  useCreateReturn,
  useFullfilledOrders,
  useReturnedOrders,
} from "@/lib/api/hooks";
import {
  SaleOrderLineResponse,
  SaleOrderResponse,
  SaleReturnResponse,
} from "@/lib/api";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const ReturnsPage = () => {
  // Ant Design Message
  const { message } = App.useApp();

  // Data fetching hooks
  const {
    returnedOrders,
    loading: returnedLoading,
    error: returnedError,
    refetch: returnedRefetch,
  } = useReturnedOrders();
  const {
    fullfilledOrders,
    loading: fullfilledLoading,
    error: fullfilledError,
    refetch: fullfilledRefetch,
  } = useFullfilledOrders();
  const { mutate: createReturn, isPending: isCreatingReturn } =
    useCreateReturn();

  const [selectedOrder, setSelectedOrder] = useState<SaleReturnResponse | null>(
    null
  );
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<any>(null);
  const [form] = Form.useForm();
  const [selectedOrderForReturn, setSelectedOrderForReturn] =
    useState<SaleOrderResponse | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "FULFILLED":
        return "green";
      case "RETURNED":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    console.log(status);
    switch (status) {
      case "FULFILLED":
        return "Hoàn thành";
      case "RETURNED":
        return "Đã trả hàng";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "FULFILLED":
        return <CheckCircleOutlined />;
      case "RETURNED":
        return <CloseCircleOutlined />;
      default:
        return <UndoOutlined />;
    }
  };

  const calculateOrderTotal = (order: SaleOrderResponse) => {
    return order?.lines?.reduce((sum, line) => {
      // Only count non-free items
      if (line.is_free_item) {
        return sum;
      }
      return sum + line.quantity * Number(line.unit_price);
    }, 0);
  };

  // Calculate discount ratio from order
  const calculateDiscountRatio = (order: SaleOrderResponse): number => {
    if (
      order.original_amount &&
      order.final_amount &&
      order.original_amount > 0
    ) {
      return order.final_amount / order.original_amount;
    }
    return 1; // No discount
  };

  // Calculate return amount with discount applied
  const calculateReturnAmount = (order: SaleOrderResponse) => {
    const discountRatio = calculateDiscountRatio(order);
    return order.lines.reduce((sum, line) => {
      if (line.is_free_item) {
        return sum;
      }
      // Apply discount ratio to reflect actual price paid
      const actualPricePaid = line.quantity * line.unit_price * discountRatio;
      return sum + actualPricePaid;
    }, 0);
  };

  // Get discounted unit price for display
  const getDiscountedUnitPrice = (
    order: SaleOrderResponse,
    unitPrice: number
  ): number => {
    const discountRatio = calculateDiscountRatio(order);
    return unitPrice * discountRatio;
  };

  const filteredReturns = useMemo(() => {
    return returnedOrders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchText.toLowerCase()) ||
        (order.sales_order?.customer?.full_name &&
          order.sales_order?.customer.full_name
            .toLowerCase()
            .includes(searchText.toLowerCase())) ||
        (order.sales_order?.customer?.phone_number &&
          order.sales_order?.customer.phone_number.includes(searchText));

      const matchesStatus =
        statusFilter === "all" || order.sales_order.status === statusFilter;

      const matchesDate =
        !dateRange ||
        (dayjs(order.created_date).isAfter(dateRange[0]) &&
          dayjs(order.created_date).isBefore(dateRange[1]));

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [returnedOrders, searchText, statusFilter, dateRange]);

  const handleViewDetail = (order: SaleReturnResponse) => {
    setSelectedOrder(order);
    setIsDetailModalVisible(true);
  };

  const handleCreateReturn = () => {
    setSelectedOrderForReturn(null);
    form.resetFields();
    setIsCreateModalVisible(true);
  };

  const handleOrderSelect = (orderId: string) => {
    const order = fullfilledOrders.find((o) => o.id === orderId);
    setSelectedOrderForReturn(order || null);
  };

  const onFinishCreate = () => {
    if (!selectedOrderForReturn) {
      message.error("Vui lòng chọn đơn hàng");
      return;
    }

    createReturn(
      { orderId: selectedOrderForReturn.id, items: [] },
      {
        onSuccess: () => {
          setIsCreateModalVisible(false);
          setSelectedOrderForReturn(null);
          form.resetFields();
          returnedRefetch();
          fullfilledRefetch();
        },
      }
    );
  };

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
      width: 380,
      render: (text: string) => (
        <Text
          strong
          style={{ color: "#1890ff", fontFamily: "monospace" }}
        >
          {text}
        </Text>
      ),
    },
    {
      title: "Khách hàng",
      key: "customer",
      render: (_: any, record: SaleReturnResponse) => (
        <div>
          {record.sales_order?.customer ? (
            <>
              <div style={{ fontWeight: 500 }}>
                {record.sales_order?.customer.full_name}
              </div>
              <Text
                type="secondary"
                style={{ fontSize: "12px" }}
              >
                {record.sales_order?.customer.phone_number}
              </Text>
            </>
          ) : (
            <Text type="secondary">Khách lẻ</Text>
          )}
        </div>
      ),
    },
    {
      title: "Số tiền",
      key: "amount",
      width: 120,
      render: (_: any, record: SaleReturnResponse) => (
        <Text
          strong
          style={{ color: "#ff4d4f" }}
        >
          ₫{calculateOrderTotal(record.sales_order)?.toLocaleString()}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: ["sales_order", "status"],
      key: "status",
      width: 150,
      render: (status: string) => (
        <Tag
          color={getStatusColor(status)}
          icon={getStatusIcon(status)}
        >
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: "Chi nhánh",
      dataIndex: ["warehouse", "branch", "branch_name"],
      key: "branch",
      width: 250,
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_date",
      key: "created_date",
      width: 150,
      sorter: (a: SaleReturnResponse, b: SaleReturnResponse) =>
        dayjs(a.created_date).unix() - dayjs(b.created_date).unix(),
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
      defaultSortOrder: "descend",
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (_: any, record: SaleReturnResponse) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              size={"middle"}
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (returnedError || fullfilledError) {
    return (
      <div style={{ padding: "24px" }}>
        <Alert
          message="Lỗi tải dữ liệu"
          description="Không thể tải danh sách hoàn trả. Vui lòng thử lại."
          type="error"
          showIcon
          action={
            <Button
              size="small"
              onClick={() => {
                returnedRefetch();
                fullfilledRefetch();
              }}
            >
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <Spin spinning={returnedLoading || fullfilledLoading}>
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid #f0f0f0",
            flexShrink: 0,
          }}
        >
          <Title
            level={2}
            style={{ margin: 0, color: "rgba(0, 0, 0, 0.85)" }}
          >
            Hoàn trả hàng
          </Title>
          <Text
            type="secondary"
            style={{ fontSize: "16px" }}
          >
            Quản lý yêu cầu hoàn trả sản phẩm
          </Text>
        </div>

        {/* Filters */}
        <div style={{ padding: "0 24px 16px", flexShrink: 0 }}>
          <Card style={{ borderRadius: "12px" }}>
            <Row
              gutter={[16, 16]}
              align="middle"
            >
              <Col
                xs={24}
                sm={12}
                md={6}
              >
                <Input
                  placeholder="Tìm kiếm mã đơn hàng, khách hàng..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </Col>
              <Col
                xs={24}
                sm={12}
                md={4}
              >
                <Select
                  placeholder="Trạng thái"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  style={{ width: "100%" }}
                >
                  <Option value="all">Tất cả</Option>
                  <Option value="RETURNED">Đã trả hàng</Option>
                </Select>
              </Col>
              <Col
                xs={24}
                sm={12}
                md={6}
              >
                <RangePicker
                  style={{ width: "100%" }}
                  value={dateRange}
                  onChange={setDateRange}
                  placeholder={["Từ ngày", "Đến ngày"]}
                />
              </Col>
              <Col
                xs={24}
                sm={12}
                md={4}
              >
                <Space>
                  <Button icon={<FilterOutlined />}>Lọc</Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      setSearchText("");
                      setStatusFilter("all");
                      setDateRange(null);
                      returnedRefetch();
                      fullfilledRefetch();
                    }}
                    loading={returnedLoading || fullfilledLoading}
                  >
                    Làm mới
                  </Button>
                </Space>
              </Col>
              <Col
                xs={24}
                sm={12}
                md={4}
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateReturn}
                >
                  Tạo yêu cầu hoàn trả
                </Button>
              </Col>
            </Row>
          </Card>
        </div>

        {/* Table Content */}
        <div style={{ flex: 1, padding: "0 24px 24px", overflow: "hidden" }}>
          <Card style={{ borderRadius: "12px", height: "100%" }}>
            <Spin spinning={returnedLoading}>
              <Table
                dataSource={filteredReturns}
                columns={columns}
                rowKey="id"
                pagination={{
                  total: filteredReturns.length,
                  pageSize: 8,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} của ${total} yêu cầu hoàn trả`,
                }}
                scroll={{ x: 1200, y: "calc(100vh - 400px)" }}
                size="middle"
              />
            </Spin>
          </Card>
        </div>

        {/* Return Detail Modal */}
        <Modal
          title={
            <Space>
              <UndoOutlined />
              <span>Chi tiết hoàn trả</span>
            </Space>
          }
          open={isDetailModalVisible}
          onCancel={() => setIsDetailModalVisible(false)}
          footer={[
            <Button
              key="close"
              onClick={() => setIsDetailModalVisible(false)}
            >
              Đóng
            </Button>,
          ]}
          width={800}
        >
          {selectedOrder && (
            <div>
              <Descriptions
                column={2}
                bordered
              >
                <Descriptions.Item
                  label="Mã đơn hàng"
                  span={2}
                >
                  <Text
                    strong
                    code
                  >
                    {selectedOrder.id}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label="Người thực hiện hoàn trả"
                  span={2}
                >
                  {selectedOrder.created_by}
                </Descriptions.Item>
                <Descriptions.Item
                  label="Trạng thái"
                  span={1}
                >
                  <Tag
                    color={getStatusColor(selectedOrder.sales_order.status)}
                    icon={getStatusIcon(selectedOrder.sales_order.status)}
                  >
                    {getStatusText(selectedOrder.sales_order.status)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item
                  label="Ngày tạo"
                  span={1}
                >
                  {dayjs(selectedOrder.created_date).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
                <Descriptions.Item
                  label="Khách hàng"
                  span={1}
                >
                  {selectedOrder.sales_order.customer?.full_name || "Khách lẻ"}
                </Descriptions.Item>
                <Descriptions.Item
                  label="Số điện thoại"
                  span={1}
                >
                  {selectedOrder.sales_order.customer?.phone_number || "-"}
                </Descriptions.Item>
                <Descriptions.Item
                  label="Chi nhánh"
                  span={1}
                >
                  {selectedOrder.branch.branch_name}
                </Descriptions.Item>
                <Descriptions.Item
                  label="Số tiền hoàn trả"
                  span={2}
                >
                  <Text
                    strong
                    style={{ fontSize: "16px", color: "#ff4d4f" }}
                  >
                    ₫
                    {calculateOrderTotal(
                      selectedOrder.sales_order
                    ).toLocaleString()}
                  </Text>
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              <Title level={5}>Chi tiết sản phẩm hoàn trả</Title>
              <Table
                dataSource={selectedOrder.sales_order.lines}
                columns={[
                  {
                    title: "Mã SP",
                    dataIndex: ["product", "sku"],
                    key: "sku",
                    width: 80,
                  },
                  {
                    title: "Sản phẩm",
                    dataIndex: ["product", "product_name"],
                    key: "product_name",
                  },
                  {
                    title: "SL",
                    dataIndex: "quantity",
                    key: "quantity",
                    width: 80,
                  },
                  {
                    title: "Đơn giá",
                    dataIndex: "unit_price",
                    key: "unit_price",
                    width: 100,
                    render: (price: number, record: SaleOrderLineResponse) =>
                      record.is_free_item ? (
                        <Text
                          type="success"
                          strong
                        >
                          MIỄN PHÍ
                        </Text>
                      ) : (
                        `₫${Number(price).toLocaleString()}`
                      ),
                  },
                  {
                    title: "Thành tiền",
                    key: "total",
                    width: 120,
                    render: (_: any, record: SaleOrderLineResponse) =>
                      record.is_free_item ? (
                        <Text
                          type="success"
                          strong
                        >
                          ₫0
                        </Text>
                      ) : (
                        <Text strong>
                          ₫
                          {(
                            record.quantity * Number(record.unit_price)
                          ).toLocaleString()}
                        </Text>
                      ),
                  },
                ]}
                pagination={false}
                rowKey="id"
                size="small"
              />
            </div>
          )}
        </Modal>

        {/* Create Return Modal */}
        <Modal
          title="Tạo yêu cầu hoàn trả"
          open={isCreateModalVisible}
          onCancel={() => {
            setIsCreateModalVisible(false);
            setSelectedOrderForReturn(null);
            form.resetFields();
          }}
          onOk={onFinishCreate}
          confirmLoading={isCreatingReturn}
          width={900}
          okText="Tạo hoàn trả"
          cancelText="Hủy"
        >
          <Form
            form={form}
            layout="vertical"
          >
            <Form.Item
              label="Chọn đơn hàng"
              name="order_id"
              rules={[{ required: true, message: "Vui lòng chọn đơn hàng" }]}
            >
              <Select
                placeholder="Chọn đơn hàng đã hoàn thành"
                showSearch
                optionFilterProp="children"
                onChange={handleOrderSelect}
              >
                {fullfilledOrders.map((order) => (
                  <Option
                    key={order.id}
                    value={order.id}
                  >
                    {order.id.substring(0, 8)}... -{" "}
                    {order.customer?.full_name || "Khách lẻ"} - ₫
                    {calculateOrderTotal(order).toLocaleString()}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>

          {selectedOrderForReturn && (
            <>
              <Divider />
              <Title level={5}>Danh sách sản phẩm sẽ được trả toàn bộ</Title>
              <Alert
                message="Lưu ý"
                description="Tất cả sản phẩm trong đơn hàng sẽ được trả về kho. Hệ thống sẽ tự động hoàn trả toàn bộ đơn hàng."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <Table
                dataSource={selectedOrderForReturn.lines}
                columns={[
                  {
                    title: "Mã SP",
                    dataIndex: ["product", "sku"],
                    key: "sku",
                    width: 100,
                  },
                  {
                    title: "Sản phẩm",
                    dataIndex: ["product", "product_name"],
                    key: "product_name",
                  },
                  {
                    title: "Đơn giá",
                    dataIndex: "unit_price",
                    key: "unit_price",
                    width: 120,
                    render: (price: number, record: SaleOrderLineResponse) => {
                      if (record.is_free_item) {
                        return (
                          <Text
                            type="success"
                            strong
                          >
                            MIỄN PHÍ
                          </Text>
                        );
                      }

                      const discountedPrice = getDiscountedUnitPrice(
                        selectedOrderForReturn,
                        price
                      );
                      const hasDiscount =
                        selectedOrderForReturn.total_discount_amount &&
                        selectedOrderForReturn.total_discount_amount > 0;

                      return (
                        <div>
                          <div>₫{discountedPrice.toLocaleString()}</div>
                          {hasDiscount && (
                            <Text
                              type="secondary"
                              delete
                              style={{ fontSize: "11px" }}
                            >
                              ₫{price.toLocaleString()}
                            </Text>
                          )}
                        </div>
                      );
                    },
                  },
                  {
                    title: "Số lượng",
                    dataIndex: "quantity",
                    key: "quantity",
                    width: 100,
                    align: "center" as const,
                  },
                  {
                    title: "Thành tiền",
                    key: "total",
                    width: 130,
                    render: (_: unknown, record: SaleOrderLineResponse) => {
                      if (record.is_free_item) {
                        return (
                          <Text
                            type="success"
                            strong
                          >
                            ₫0
                          </Text>
                        );
                      }

                      const discountedPrice = getDiscountedUnitPrice(
                        selectedOrderForReturn,
                        record.unit_price
                      );
                      const lineTotal = record.quantity * discountedPrice;
                      const originalTotal =
                        record.quantity * Number(record.unit_price);
                      const hasDiscount =
                        selectedOrderForReturn.total_discount_amount &&
                        selectedOrderForReturn.total_discount_amount > 0;

                      return (
                        <div>
                          <Text
                            strong
                            style={{ color: "#ff4d4f" }}
                          >
                            ₫{lineTotal.toLocaleString()}
                          </Text>
                          {hasDiscount && (
                            <div>
                              <Text
                                type="secondary"
                                delete
                                style={{ fontSize: "11px" }}
                              >
                                ₫{originalTotal.toLocaleString()}
                              </Text>
                            </div>
                          )}
                        </div>
                      );
                    },
                  },
                ]}
                pagination={false}
                rowKey={(record) => record.product.product_id}
                size="small"
                scroll={{ y: 300 }}
              />

              <Divider />
              <div style={{ textAlign: "right" }}>
                <Text
                  strong
                  style={{ fontSize: 16 }}
                >
                  Tổng tiền hoàn trả:{" "}
                  <Text style={{ color: "#ff4d4f", fontSize: 18 }}>
                    ₫
                    {calculateReturnAmount(
                      selectedOrderForReturn
                    ).toLocaleString()}
                  </Text>
                </Text>
                {selectedOrderForReturn.total_discount_amount &&
                  selectedOrderForReturn.total_discount_amount > 0 && (
                    <div style={{ marginTop: 4 }}>
                      <Text
                        type="secondary"
                        style={{ fontSize: "12px" }}
                      >
                        (Giá gốc: ₫
                        {calculateOrderTotal(
                          selectedOrderForReturn
                        ).toLocaleString()}
                        )
                      </Text>
                    </div>
                  )}
              </div>
            </>
          )}
        </Modal>
      </div>
    </Spin>
  );
};

export default ReturnsPage;
