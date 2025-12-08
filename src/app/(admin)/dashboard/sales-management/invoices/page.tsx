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
  Modal,
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
  FileExcelOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import {
  useConfirmSalesOrder,
  useCreateReturn,
  useFulfillSalesOrder,
  usePagedSalesOrders,
  useReturnedOrders,
  useCancelOrder,
} from "@/lib/api/hooks";
import { SaleOrderResponse, SaleReturnResponse } from "@/lib/api";
import { SalesOrderService } from "@/lib/api";
import { useGetPaymentLink } from "@/lib/api/hooks/usePayment";
import { useBranches } from "@/lib/api/hooks";
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
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("createdDate");
  const [sortDirection, setSortDirection] = useState<"ASC" | "DESC">("DESC");

  // Data fetching hooks
  const { orders, loading, refetch, totalElements, totalPages } =
    usePagedSalesOrders(currentPage, pageSize, sortBy, sortDirection);
  const confirmMutation = useConfirmSalesOrder();
  const fulfillMutation = useFulfillSalesOrder();
  const returnMutation = useCreateReturn();
  const cancelMutation = useCancelOrder();
  const { returnedOrders, refetch: returnedRefetch } = useReturnedOrders();
  const { branches, loading: branchesLoading } = useBranches({});

  // Modal states
  const [selectedOrder, setSelectedOrder] = useState<SaleOrderResponse | null>(
    null
  );
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isReturnModalVisible, setIsReturnModalVisible] = useState(false);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<any>(null);

  // Export states
  const [exportDateRange, setExportDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [exportBranch, setExportBranch] = useState<string | undefined>(undefined);
  const [exportLoading, setExportLoading] = useState(false);

  // Forms
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
      setPaymentOrderId(null);
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
        return "Chờ giao hàng";
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

  // Filter orders
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

  // Calculate functions
  const calculateTotal = (order: SaleOrderResponse) => {
    return order.lines.reduce((sum, line) => {
      if (line.is_free_item) {
        return sum;
      }
      return sum + line.quantity * line.unit_price;
    }, 0);
  };

  const calculateDiscountRatio = (order: SaleOrderResponse): number => {
    if (
      order.original_amount &&
      order.final_amount &&
      order.original_amount > 0
    ) {
      return order.final_amount / order.original_amount;
    }
    return 1;
  };

  const calculateReturnAmount = (order: SaleOrderResponse) => {
    const discountRatio = calculateDiscountRatio(order);
    return order.lines.reduce((sum, line) => {
      if (line.is_free_item) {
        return sum;
      }
      const actualPricePaid = line.quantity * line.unit_price * discountRatio;
      return sum + actualPricePaid;
    }, 0);
  };

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

      refetch();
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

      refetch();
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

      refetch();
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

      await returnedRefetch();

      setReturnResult(returnData);
      setIsResultModalVisible(true);

      message.success(
        `Tạo yêu cầu hoàn trả đơn hàng ${selectedOrder.id.substring(
          0,
          8
        )}... thành công`
      );

      refetch();
    } catch (error) {
      // Error handled by mutation or validation
    }
  };

  const handlePayment = (order: SaleOrderResponse) => {
    setPaymentOrderId(order.id);
    message.loading(
      `Đang tạo link thanh toán cho đơn hàng ${order.id.substring(0, 8)}...`
    );

    // refresh data
    refetch();
  };

  const handlePrint = (order: SaleOrderResponse) => {
    message.success(`In hóa đơn ${order.id.substring(0, 8)}...`);
  };

  const handleExport = (order: SaleOrderResponse) => {
    message.success(`Xuất hóa đơn ${order.id.substring(0, 8)}...`);
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

  // Export handlers
  const handleOpenExportModal = () => {
    const startOfMonth = dayjs().startOf("month");
    const endOfMonth = dayjs().endOf("month");
    setExportDateRange([startOfMonth, endOfMonth]);
    setExportBranch(undefined);
    setExportModalVisible(true);
  };

  const handleExportReport = async () => {
    if (!exportDateRange || !exportDateRange[0] || !exportDateRange[1]) {
      message.error("Vui lòng chọn khoảng thời gian");
      return;
    }

    setExportLoading(true);
    try {
      const fromDate = exportDateRange[0].format("YYYY-MM-DD");
      const toDate = exportDateRange[1].format("YYYY-MM-DD");

      await SalesOrderService.exportSalesReport(
        fromDate,
        toDate,
        exportBranch
      );

      message.success("Xuất báo cáo thành công");
      setExportModalVisible(false);
    } catch (error: any) {
      message.error(error?.message || "Có lỗi xảy ra khi xuất báo cáo");
    } finally {
      setExportLoading(false);
    }
  };

  const handleCloseExportModal = () => {
    setExportModalVisible(false);
    setExportDateRange(null);
    setExportBranch(undefined);
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
            md={3}
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
            md={6}
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
            sm={8}
            md={2}
          >
            <Button
              icon={<FilterOutlined />}
              onClick={handleResetFilters}
            >
              Xóa lọc
            </Button>
          </Col>
          <Col
            xs={24}
            sm={8}
            md={2}
          >
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
            >
              Làm mới
            </Button>
          </Col>
          <Col
            xs={24}
            sm={8}
            md={3}
          >
            <Button
              type="primary"
              icon={<FileExcelOutlined />}
              onClick={handleOpenExportModal}
              style={{
                backgroundColor: "#10b981",
                borderColor: "#10b981",
              }}
            >
              Xuất báo cáo
            </Button>
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
              current: currentPage + 1,
              pageSize: pageSize,
              total: totalElements,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} hóa đơn`,
              onChange: (page, size) => {
                setCurrentPage(page - 1);
                if (size !== pageSize) {
                  setPageSize(size);
                  setCurrentPage(0);
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

      {/* Modals */}
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

      <ReturnOrderResultModal
        visible={isResultModalVisible}
        returnData={returnResult}
        onClose={() => {
          setIsResultModalVisible(false);
          setReturnResult(null);
        }}
      />

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

      {/* Export Modal */}
      <Modal
        title={
          <Space>
            <FileExcelOutlined style={{ color: "#10b981" }} />
            <span>Xuất báo cáo bán hàng</span>
          </Space>
        }
        open={exportModalVisible}
        onCancel={handleCloseExportModal}
        footer={[
          <Button
            key="cancel"
            onClick={handleCloseExportModal}
          >
            Hủy
          </Button>,
          <Button
            key="export"
            type="primary"
            icon={<DownloadOutlined />}
            loading={exportLoading}
            onClick={handleExportReport}
            style={{ backgroundColor: "#10b981", borderColor: "#10b981" }}
          >
            Xuất Excel
          </Button>,
        ]}
        width={500}
      >
        <Space
          direction="vertical"
          style={{ width: "100%" }}
          size="large"
        >
          <div>
            <label
              style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
            >
              Khoảng thời gian <span style={{ color: "red" }}>*</span>
            </label>
            <RangePicker
              value={exportDateRange}
              onChange={(dates) => setExportDateRange(dates as [Dayjs, Dayjs])}
              format="DD/MM/YYYY"
              placeholder={["Từ ngày", "Đến ngày"]}
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label
              style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
            >
              Chi nhánh
            </label>
            <Select
              value={exportBranch}
              onChange={setExportBranch}
              placeholder="Chọn chi nhánh"
              allowClear
              style={{ width: "100%" }}
              loading={branchesLoading}
              options={branches.map((branch) => ({
                value: branch.branch_id,
                label: branch.branch_name,
              }))}
            />
            {!exportBranch && (
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                Để trống = xuất báo cáo toàn hệ thống
              </div>
            )}
          </div>

          <div
            style={{
              padding: 12,
              backgroundColor: "#f0f9ff",
              borderRadius: 6,
              border: "1px solid #bae6fd",
            }}
          >
            <div style={{ fontSize: 12, color: "#0369a1" }}>
              <strong>Lưu ý:</strong>
              <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
                <li>
                  Báo cáo sẽ bao gồm tất cả hóa đơn trong khoảng thời gian đã
                  chọn
                </li>
                <li>Nếu không chọn chi nhánh, sẽ xuất báo cáo toàn hệ thống</li>
                <li>File Excel sẽ được tải xuống tự động</li>
              </ul>
            </div>
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default InvoicesPage;
