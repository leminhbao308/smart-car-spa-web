"use client";
import React, { useState, useMemo } from "react";
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
  Tooltip,
  Spin,
  Empty,
  App,
  Form,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  PrinterOutlined,
  FilterOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  UndoOutlined,
  CreditCardOutlined,
  GiftOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  useConfirmSalesOrder,
  useCreateReturn,
  useFulfillSalesOrder,
  usePagedSalesOrders,
  useReturnedOrders,
  useCancelOrder,
} from "@/lib/api/hooks";
import { SaleOrderResponse, SaleReturnResponse } from "@/lib/api";
import { useGetPaymentLink } from "@/lib/api/hooks/usePayment";
import ReturnOrderResultModal from "@/components/ui/ReturnOrderResult/ReturnOrderResultModal";
import InvoiceDetailModal from "@/components/ui/Invoice/InvoiceDetailModal";
import ReturnOrderModal from "@/components/ui/Invoice/ReturnOrderModal";
import CancelOrderModal from "@/components/ui/Invoice/CancelOrderModal";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const InvoicesPage = () => {
  // Ant Design Message
  const { message } = App.useApp();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0); // Backend uses 0-based index
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("createdDate");
  const [sortDirection, setSortDirection] = useState<"ASC" | "DESC">("DESC");

  // Data fetching hooks with pagination
  const { orders, loading, refetch, totalElements, totalPages } =
    usePagedSalesOrders(currentPage, pageSize, sortBy, sortDirection);
  const confirmMutation = useConfirmSalesOrder();
  const fulfillMutation = useFulfillSalesOrder();
  const returnMutation = useCreateReturn();
  const cancelMutation = useCancelOrder();
  const { returnedOrders, refetch: returnedRefetch } = useReturnedOrders();

  const [selectedOrder, setSelectedOrder] = useState<SaleOrderResponse | null>(
    null
  );
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isReturnModalVisible, setIsReturnModalVisible] = useState(false);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<any>(null);
  const [returnForm] = Form.useForm();
  const [cancelForm] = Form.useForm();
  const [returnResult, setReturnResult] = useState<SaleReturnResponse | null>(
    null
  );
  const [isResultModalVisible, setIsResultModalVisible] = useState(false);

  // Get payment link
  const { data: paymentLink, isLoading: isLoadingPaymentLink } =
    useGetPaymentLink(paymentOrderId);

  // Open payment link in new tab when available
  React.useEffect(() => {
    if (paymentLink && paymentOrderId) {
      window.open(paymentLink, "_blank");
      setPaymentOrderId(null); // Reset after opening
      message.success("Đã mở link thanh toán trong tab mới");
    }
  }, [paymentLink, paymentOrderId]);

  // Status utilities
  const getStatusColor = (status: string) => {
    switch (status) {
      case "FULFILLED":
        return "green";
      case "CONFIRMED":
        return "blue";
      case "DRAFT":
        return "orange";
      case "RETURNED":
        return "volcano";
      case "CANCELLED":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "FULFILLED":
        return "Hoàn thành";
      case "CONFIRMED":
        return "Chờ thanh toán";
      case "DRAFT":
        return "Nháp";
      case "RETURNED":
        return "Đã hoàn trả";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  // Filter orders (now done client-side on current page only)
  const filteredOrders = useMemo(() => {
    return orders.filter((order: SaleOrderResponse) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchText.toLowerCase()) ||
        order.customer?.full_name
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        order.customer?.phone_number.includes(searchText) ||
        order.branch.branch_name
          .toLowerCase()
          .includes(searchText.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      const matchesDate =
        !dateRange ||
        (dayjs(order.created_date).isAfter(dateRange[0]) &&
          dayjs(order.created_date).isBefore(dateRange[1]));

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, searchText, statusFilter, dateRange]);

  // Calculate total amount (exclude free items)
  const calculateTotal = (order: SaleOrderResponse) => {
    return order.lines.reduce((sum, line) => {
      // Only count non-free items
      if (line.is_free_item) {
        return sum;
      }
      return sum + line.quantity * line.unit_price;
    }, 0);
  };

  // Calculate discount ratio for return (same logic as backend)
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

  // Calculate return amount with discount applied (what customer actually paid)
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

  // Calculate discounted unit price for display
  const getDiscountedUnitPrice = (
    order: SaleOrderResponse,
    unitPrice: number
  ): number => {
    const discountRatio = calculateDiscountRatio(order);
    return unitPrice * discountRatio;
  };

  // Action handlers
  const handleViewDetail = (order: SaleOrderResponse) => {
    setSelectedOrder(order);
    setIsDetailModalVisible(true);
  };

  const handleConfirmOrder = async (order: SaleOrderResponse) => {
    try {
      await confirmMutation.mutateAsync(order.id);
      message.success(
        `Xác nhận đơn hàng ${order.id.substring(0, 8)}... thành công`
      );
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleFulfillOrder = async (order: SaleOrderResponse) => {
    try {
      await fulfillMutation.mutateAsync(order.id);
      message.success(
        `Hoàn thành đơn hàng ${order.id.substring(0, 8)}... thành công`
      );
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleOpenReturnModal = (order: SaleOrderResponse) => {
    setSelectedOrder(order);
    returnForm.setFieldsValue({ reason: "Hoàn trả hàng" });
    setIsReturnModalVisible(true);
  };

  const handleOpenCancelModal = (order: SaleOrderResponse) => {
    setSelectedOrder(order);
    cancelForm.resetFields();
    setIsCancelModalVisible(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedOrder) return;

    try {
      const values = await cancelForm.validateFields();
      await cancelMutation.mutateAsync({
        orderId: selectedOrder.id,
        cancellationReason: values.cancellation_reason,
      });
      setIsCancelModalVisible(false);
      setSelectedOrder(null);
      cancelForm.resetFields();
      message.success(
        `Hủy đơn hàng ${selectedOrder.id.substring(0, 8)}... thành công`
      );
    } catch (error) {
      // Error handled by mutation or validation
    }
  };

  const handleConfirmReturn = async () => {
    if (!selectedOrder) return;

    try {
      const values = await returnForm.validateFields();
      const returnData = await returnMutation.mutateAsync({
        orderId: selectedOrder.id,
        items: [],
        reason: values.reason,
      });
      setIsReturnModalVisible(false);
      setSelectedOrder(null);
      returnForm.resetFields();

      // Refetch to get updated data
      await returnedRefetch();

      // Show result modal with returned data immediately
      setReturnResult(returnData);
      setIsResultModalVisible(true);

      message.success(
        `Tạo yêu cầu hoàn trả đơn hàng ${selectedOrder.id.substring(
          0,
          8
        )}... thành công`
      );
    } catch (error) {
      // Error handled by mutation or validation
    }
  };

  const handlePayment = (order: SaleOrderResponse) => {
    setPaymentOrderId(order.id);
    message.loading(
      `Đang tạo link thanh toán cho đơn hàng ${order.id.substring(0, 8)}...`
    );
  };

  const handlePrint = (order: SaleOrderResponse) => {
    message.success(`In hóa đơn ${order.id.substring(0, 8)}...`);
    // Implement print logic
  };

  const handleExport = (order: SaleOrderResponse) => {
    message.success(`Xuất hóa đơn ${order.id.substring(0, 8)}...`);
    // Implement export logic
  };

  const handleRefresh = () => {
    refetch();
    message.success("Đã làm mới dữ liệu");
  };

  const handleResetFilters = () => {
    setSearchText("");
    setStatusFilter("all");
    setDateRange(null);
  };

  // Table columns
  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
      width: 180,
      render: (text: string) => (
        <Text
          strong
          style={{ color: "#1890ff", fontSize: "12px" }}
          ellipsis={{ tooltip: text }}
        >
          {text}
        </Text>
      ),
    },
    {
      title: "Khách hàng",
      key: "customer",
      width: 180,
      render: (_: any, record: SaleOrderResponse) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.customer?.full_name || "Khách lẻ"}
          </div>
          {record.customer?.phone_number && (
            <Text
              type="secondary"
              style={{ fontSize: "12px" }}
            >
              {record.customer.phone_number}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Chi nhánh",
      dataIndex: ["branch", "branch_name"],
      key: "branch",
      width: 150,
    },
    {
      title: "Khuyến mãi",
      key: "promotions",
      width: 150,
      render: (_: unknown, record: SaleOrderResponse) => {
        if (!record.promotion_snapshot) {
          return <Text type="secondary">-</Text>;
        }
        try {
          const promos = JSON.parse(record.promotion_snapshot);
          if (promos.length === 0) return <Text type="secondary">-</Text>;

          return (
            <Space
              direction="vertical"
              size={2}
            >
              {promos.slice(0, 2).map((p: any, idx: number) => {
                // Support both old and new snapshot formats
                const displayText =
                  p.code || p.promotion_code || p.name || "Khuyến mãi";
                return (
                  <Tag
                    key={`promo-${p.promotion_id || idx}`}
                    color="purple"
                    style={{ fontSize: "11px", margin: 0 }}
                  >
                    {displayText}
                  </Tag>
                );
              })}
              {promos.length > 2 && (
                <Text
                  type="secondary"
                  style={{ fontSize: "11px" }}
                >
                  +{promos.length - 2} khác
                </Text>
              )}
            </Space>
          );
        } catch (error) {
          console.log("Error parsing promotion snapshot:", error);
          return <Text type="secondary">-</Text>;
        }
      },
    },
    {
      title: "Tổng tiền gốc",
      key: "original_amount",
      width: 120,
      render: (_: unknown, record: SaleOrderResponse) => {
        const hasDiscount =
          record.total_discount_amount && record.total_discount_amount > 0;

        if (!hasDiscount) {
          return <Text type="secondary">-</Text>;
        }

        const originalAmount =
          record.original_amount ||
          calculateTotal(record) + (record.total_discount_amount || 0);

        return (
          <Text style={{ fontSize: "13px" }}>
            ₫{originalAmount.toLocaleString()}
          </Text>
        );
      },
    },
    {
      title: "Giảm giá",
      key: "discount",
      width: 110,
      render: (_: unknown, record: SaleOrderResponse) => {
        const hasDiscount =
          record.total_discount_amount && record.total_discount_amount > 0;

        if (!hasDiscount) {
          return <Text type="secondary">-</Text>;
        }

        return (
          <Tag
            color="red"
            icon={<GiftOutlined />}
            style={{ fontSize: "11px" }}
          >
            -₫{record.total_discount_amount?.toLocaleString()}
          </Tag>
        );
      },
    },
    {
      title: "Tổng thanh toán",
      key: "total",
      width: 130,
      render: (_: unknown, record: SaleOrderResponse) => {
        // Use final_amount from database if available, otherwise calculate
        const total = record.final_amount ?? calculateTotal(record);
        const hasDiscount =
          record.total_discount_amount && record.total_discount_amount > 0;

        return (
          <Text
            strong
            style={{
              color: hasDiscount ? "#52c41a" : "#1890ff",
              fontSize: "14px",
            }}
          >
            ₫{total.toLocaleString()}
          </Text>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "Cập nhật mới nhất",
      dataIndex: "modified_date",
      key: "modified_date",
      width: 150,
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 160,
      fixed: "right" as const,
      render: (_: any, record: SaleOrderResponse) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>

          {record.status === "DRAFT" && (
            <Tooltip title="Xác nhận">
              <Button
                type="text"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleConfirmOrder(record)}
                loading={confirmMutation.isPending}
              />
            </Tooltip>
          )}

          {record.status === "CONFIRMED" && (
            <>
              <Tooltip title="Thanh toán">
                <Button
                  type="text"
                  size="middle"
                  icon={<CreditCardOutlined />}
                  style={{ color: "#1890ff" }}
                  onClick={() => handlePayment(record)}
                  loading={isLoadingPaymentLink && paymentOrderId === record.id}
                />
              </Tooltip>
              <Tooltip title="Hoàn thành">
                <Button
                  type="text"
                  size="middle"
                  icon={<CheckCircleOutlined />}
                  style={{ color: "#52c41a" }}
                  onClick={() => handleFulfillOrder(record)}
                  loading={fulfillMutation.isPending}
                />
              </Tooltip>
              <Tooltip title="Hủy đơn hàng">
                <Button
                  type="text"
                  size="middle"
                  icon={<CloseCircleOutlined />}
                  danger
                  onClick={() => handleOpenCancelModal(record)}
                  loading={cancelMutation.isPending}
                />
              </Tooltip>
            </>
          )}

          {record.status === "FULFILLED" && (
            <>
              <Tooltip title="Tạo hóa đơn trả">
                <Button
                  type="text"
                  size="middle"
                  icon={<UndoOutlined />}
                  danger
                  onClick={() => handleOpenReturnModal(record)}
                  loading={returnMutation.isPending}
                />
              </Tooltip>
              <Tooltip title="Hủy đơn hàng">
                <Button
                  type="text"
                  size="middle"
                  icon={<CloseCircleOutlined />}
                  danger
                  onClick={() => handleOpenCancelModal(record)}
                  loading={cancelMutation.isPending}
                />
              </Tooltip>
            </>
          )}

          {record.status !== "CANCELLED" && (
            <Tooltip title="In hóa đơn">
              <Button
                type="text"
                size="middle"
                icon={<PrinterOutlined />}
                onClick={() => handlePrint(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Title
          level={2}
          style={{ margin: 0, color: "rgba(0, 0, 0, 0.85)" }}
        >
          Quản lý hóa đơn
        </Title>
        <Text
          type="secondary"
          style={{ fontSize: "16px" }}
        >
          Danh sách hóa đơn bán hàng
        </Text>
      </div>

      {/* Filters */}
      <Card style={{ borderRadius: "12px", marginBottom: "24px" }}>
        <Row
          gutter={[16, 16]}
          align="middle"
        >
          <Col
            xs={24}
            sm={12}
            md={8}
          >
            <Input
              placeholder="Tìm kiếm đơn hàng, khách hàng, chi nhánh..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col
            xs={24}
            sm={12}
            md={5}
          >
            <Select
              placeholder="Trạng thái"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: "100%" }}
            >
              <Option value="all">Tất cả</Option>
              <Option value="DRAFT">Nháp</Option>
              <Option value="CONFIRMED">Đã xác nhận</Option>
              <Option value="FULFILLED">Hoàn thành</Option>
              <Option value="RETURNED">Đã hoàn trả</Option>
              <Option value="CANCELLED">Đã hủy</Option>
            </Select>
          </Col>
          <Col
            xs={24}
            sm={12}
            md={7}
          >
            <RangePicker
              style={{ width: "100%" }}
              value={dateRange}
              onChange={setDateRange}
              placeholder={["Từ ngày", "Đến ngày"]}
              format="DD/MM/YYYY"
            />
          </Col>
          <Col
            xs={24}
            sm={12}
            md={4}
          >
            <Space>
              <Button
                icon={<FilterOutlined />}
                onClick={handleResetFilters}
              >
                Xóa lọc
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={loading}
              >
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card style={{ borderRadius: "12px" }}>
        <Spin spinning={loading}>
          <Table
            dataSource={filteredOrders}
            columns={columns}
            rowKey="id"
            pagination={{
              current: currentPage + 1, // Ant Design uses 1-based index, backend uses 0-based
              pageSize: pageSize,
              total: totalElements,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} hóa đơn`,
              onChange: (page, size) => {
                setCurrentPage(page - 1); // Convert to 0-based index for backend
                if (size !== pageSize) {
                  setPageSize(size);
                  setCurrentPage(0); // Reset to first page when page size changes
                }
              },
            }}
            scroll={{ x: 1200 }}
            locale={{
              emptyText: (
                <Empty
                  description="Không có dữ liệu"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ),
            }}
            size={"middle"}
          />
        </Spin>
      </Card>

      {/* Detail Modal */}
      <InvoiceDetailModal
        visible={isDetailModalVisible}
        order={selectedOrder}
        onClose={() => setIsDetailModalVisible(false)}
        onPrint={handlePrint}
        onExport={handleExport}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        calculateTotal={calculateTotal}
      />

      {/* Return Confirmation Modal */}
      <ReturnOrderModal
        visible={isReturnModalVisible}
        order={selectedOrder}
        form={returnForm}
        loading={returnMutation.isPending}
        onClose={() => {
          setIsReturnModalVisible(false);
          setSelectedOrder(null);
          returnForm.resetFields();
        }}
        onConfirm={handleConfirmReturn}
        calculateTotal={calculateTotal}
        calculateReturnAmount={calculateReturnAmount}
        getDiscountedUnitPrice={getDiscountedUnitPrice}
      />

      {/* Return Result Modal */}
      <ReturnOrderResultModal
        visible={isResultModalVisible}
        returnData={returnResult}
        onClose={() => {
          setIsResultModalVisible(false);
          setReturnResult(null);
        }}
      />

      {/* Cancel Order Modal */}
      <CancelOrderModal
        visible={isCancelModalVisible}
        order={selectedOrder}
        form={cancelForm}
        loading={cancelMutation.isPending}
        onClose={() => {
          setIsCancelModalVisible(false);
          setSelectedOrder(null);
          cancelForm.resetFields();
        }}
        onConfirm={handleConfirmCancel}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        calculateTotal={calculateTotal}
      />
    </div>
  );
};

export default InvoicesPage;
