"use client";
import React, {useState, useMemo} from "react";
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
  message,
  Tooltip,
  Spin,
  Empty,
  Alert, App,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  PrinterOutlined,
  DownloadOutlined,
  FilterOutlined,
  ReloadOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  UndoOutlined,
  ExclamationCircleOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {useConfirmSalesOrder, useCreateReturn, useFulfillSalesOrder, useSalesOrders} from "@/lib/api/hooks";
import {SaleOrderLineResponse, SaleOrderResponse} from "@/lib/api";
import {useGetPaymentLink} from "@/lib/api/hooks/usePayment";

const {Title, Text} = Typography;
const {RangePicker} = DatePicker;
const {Option} = Select;

const InvoicesPage = () => {
  // Ant Design Message
  const { message } = App.useApp();

  // Data fetching hooks
  const {orders, loading, refetch} = useSalesOrders();
  const confirmMutation = useConfirmSalesOrder();
  const fulfillMutation = useFulfillSalesOrder();
  const returnMutation = useCreateReturn();

  const [selectedOrder, setSelectedOrder] = useState<SaleOrderResponse | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isReturnModalVisible, setIsReturnModalVisible] = useState(false);
  const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<any>(null);

  // Get payment link
  const {data: paymentLink, isLoading: isLoadingPaymentLink} = useGetPaymentLink(paymentOrderId);

  // Open payment link in new tab when available
  React.useEffect(() => {
    if (paymentLink && paymentOrderId) {
      window.open(paymentLink, '_blank');
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

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchText.toLowerCase()) ||
        order.customer?.full_name.toLowerCase().includes(searchText.toLowerCase()) ||
        order.customer?.phone_number.includes(searchText) ||
        order.branch.branch_name.toLowerCase().includes(searchText.toLowerCase());

      const matchesStatus = statusFilter === "all" || order.status === statusFilter;

      const matchesDate = !dateRange || (
        dayjs(order.created_date).isAfter(dateRange[0]) &&
        dayjs(order.created_date).isBefore(dateRange[1])
      );

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, searchText, statusFilter, dateRange]);

  // Calculate total amount
  const calculateTotal = (order: SaleOrderResponse) => {
    return order.lines.reduce((sum, line) => sum + (line.quantity * line.unit_price), 0);
  };

  // Action handlers
  const handleViewDetail = (order: SaleOrderResponse) => {
    setSelectedOrder(order);
    setIsDetailModalVisible(true);
  };

  const handleConfirmOrder = async (order: SaleOrderResponse) => {
    try {
      await confirmMutation.mutateAsync(order.id);
      message.success(`Xác nhận đơn hàng ${order.id.substring(0, 8)}... thành công`);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleFulfillOrder = async (order: SaleOrderResponse) => {
    try {
      await fulfillMutation.mutateAsync(order.id);
      message.success(`Hoàn thành đơn hàng ${order.id.substring(0, 8)}... thành công`);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleOpenReturnModal = (order: SaleOrderResponse) => {
    setSelectedOrder(order);
    setIsReturnModalVisible(true);
  };

  const handleConfirmReturn = async () => {
    if (!selectedOrder) return;

    try {
      await returnMutation.mutateAsync({
        orderId: selectedOrder.id,
        items: []
      });
      setIsReturnModalVisible(false);
      setSelectedOrder(null);
      message.success(`Tạo yêu cầu hoàn trả đơn hàng ${selectedOrder.id.substring(0, 8)}... thành công`);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handlePayment = (order: SaleOrderResponse) => {
    setPaymentOrderId(order.id);
    message.loading(`Đang tạo link thanh toán cho đơn hàng ${order.id.substring(0, 8)}...`);
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
        <Text strong style={{color: "#1890ff", fontSize: "12px"}} ellipsis={{tooltip: text}}>
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
          <div style={{fontWeight: 500}}>
            {record.customer?.full_name || "Khách lẻ"}
          </div>
          {record.customer?.phone_number && (
            <Text type="secondary" style={{fontSize: "12px"}}>
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
      title: "Tổng tiền",
      key: "total",
      width: 130,
      render: (_: any, record: SaleOrderResponse) => (
        <Text strong style={{color: "#52c41a"}}>
          ₫{calculateTotal(record).toLocaleString()}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_date",
      key: "created_date",
      width: 150,
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      fixed: "right" as const,
      render: (_: any, record: SaleOrderResponse) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined/>}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>

          {record.status === "DRAFT" && (
            <Tooltip title="Xác nhận">
              <Button
                type="text"
                size="small"
                icon={<CheckCircleOutlined/>}
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
                  icon={<CreditCardOutlined/>}
                  style={{color: "#1890ff"}}
                  onClick={() => handlePayment(record)}
                  loading={isLoadingPaymentLink && paymentOrderId === record.id}
                />
              </Tooltip>
              <Tooltip title="Hoàn thành">
                <Button
                  type="text"
                  size="middle"
                  icon={<CheckCircleOutlined/>}
                  style={{color: "#52c41a"}}
                  onClick={() => handleFulfillOrder(record)}
                  loading={fulfillMutation.isPending}
                />
              </Tooltip>
            </>
          )}

          {record.status === "FULFILLED" && (
            <Tooltip title="Hoàn trả toàn bộ">
              <Button
                type="text"
                size="middle"
                icon={<UndoOutlined/>}
                danger
                onClick={() => handleOpenReturnModal(record)}
                loading={returnMutation.isPending}
              />
            </Tooltip>
          )}

          <Tooltip title="In hóa đơn">
            <Button
              type="text"
              size="middle"
              icon={<PrinterOutlined/>}
              onClick={() => handlePrint(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{padding: "24px"}}>
      <div style={{marginBottom: "24px"}}>
        <Title level={2} style={{margin: 0, color: "rgba(0, 0, 0, 0.85)"}}>
          Quản lý hóa đơn
        </Title>
        <Text type="secondary" style={{fontSize: "16px"}}>
          Danh sách hóa đơn bán hàng
        </Text>
      </div>

      {/* Filters */}
      <Card style={{borderRadius: "12px", marginBottom: "24px"}}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm kiếm đơn hàng, khách hàng, chi nhánh..."
              prefix={<SearchOutlined/>}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              placeholder="Trạng thái"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{width: "100%"}}
            >
              <Option value="all">Tất cả</Option>
              <Option value="DRAFT">Nháp</Option>
              <Option value="CONFIRMED">Đã xác nhận</Option>
              <Option value="FULFILLED">Hoàn thành</Option>
              <Option value="RETURNED">Đã hoàn trả</Option>
              <Option value="CANCELLED">Đã hủy</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={7}>
            <RangePicker
              style={{width: "100%"}}
              value={dateRange}
              onChange={setDateRange}
              placeholder={["Từ ngày", "Đến ngày"]}
              format="DD/MM/YYYY"
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Space>
              <Button
                icon={<FilterOutlined/>}
                onClick={handleResetFilters}
              >
                Xóa lọc
              </Button>
              <Button
                icon={<ReloadOutlined/>}
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
      <Card style={{borderRadius: "12px"}}>
        <Spin spinning={loading}>
          <Table
            dataSource={filteredOrders}
            columns={columns}
            rowKey="id"
            pagination={{
              total: filteredOrders.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} hóa đơn`,
            }}
            scroll={{x: 1200}}
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
      <Modal
        title={
          <Space>
            <FileTextOutlined/>
            <span>Chi tiết hóa đơn</span>
          </Space>
        }
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button
            key="print"
            icon={<PrinterOutlined/>}
            onClick={() => selectedOrder && handlePrint(selectedOrder)}
          >
            In hóa đơn
          </Button>,
          <Button
            key="export"
            icon={<DownloadOutlined/>}
            onClick={() => selectedOrder && handleExport(selectedOrder)}
          >
            Xuất file
          </Button>,
          <Button key="close" type="primary" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={900}
      >
        {selectedOrder && (
          <div>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Mã đơn hàng" span={2}>
                <Text strong copyable>{selectedOrder.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo" span={1}>
                {dayjs(selectedOrder.created_date).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
              <Descriptions.Item label="Người tạo" span={1}>
                {selectedOrder.created_by}
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng" span={1}>
                {selectedOrder.customer?.full_name || "Khách lẻ"}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại" span={1}>
                {selectedOrder.customer?.phone_number || ""}
              </Descriptions.Item>
              <Descriptions.Item label="Chi nhánh" span={1}>
                {selectedOrder.branch.branch_name}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={1}>
                {selectedOrder.branch.address}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={1}>
                <Tag color={getStatusColor(selectedOrder.status)}>
                  {getStatusText(selectedOrder.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền" span={2}>
                <Text strong style={{fontSize: "18px", color: "#52c41a"}}>
                  ₫{calculateTotal(selectedOrder).toLocaleString()}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            <Divider/>

            <Title level={5}>Chi tiết sản phẩm</Title>
            <Table
              dataSource={selectedOrder.lines}
              columns={[
                {
                  title: "Sản phẩm",
                  dataIndex: ["product", "product_name"],
                  key: "product_name",
                },
                {
                  title: "Mã SP",
                  dataIndex: ["product", "sku"],
                  key: "sku",
                  width: 120,
                },
                {
                  title: "Số lượng",
                  dataIndex: "quantity",
                  key: "quantity",
                  width: 100,
                  align: "center" as const,
                },
                {
                  title: "Đơn giá",
                  dataIndex: "unit_price",
                  key: "unit_price",
                  width: 130,
                  render: (price: number) => `₫${price.toLocaleString()}`
                },
                {
                  title: "Thành tiền",
                  key: "total",
                  width: 140,
                  render: (_: any, record: SaleOrderLineResponse) => (
                    <Text strong>
                      ₫{(record.quantity * record.unit_price).toLocaleString()}
                    </Text>
                  )
                },
              ]}
              pagination={false}
              rowKey="id"
              size="small"
            />
          </div>
        )}
      </Modal>

      {/* Return Confirmation Modal */}
      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined style={{color: "#faad14"}}/>
            <span>Xác nhận hoàn trả đơn hàng</span>
          </Space>
        }
        open={isReturnModalVisible}
        onCancel={() => {
          setIsReturnModalVisible(false);
          setSelectedOrder(null);
        }}
        onOk={handleConfirmReturn}
        confirmLoading={returnMutation.isPending}
        okText="Xác nhận hoàn trả"
        cancelText="Hủy"
        okButtonProps={{danger: true}}
        width={700}
      >
        {selectedOrder && (
          <div>
            <Alert
              message="Cảnh báo"
              description="Bạn sắp hoàn trả TOÀN BỘ đơn hàng này. Tất cả sản phẩm sẽ được trả về kho và không thể hoàn tác."
              type="warning"
              showIcon
              style={{marginBottom: 16}}
            />

            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Mã đơn hàng">
                <Text strong code>{selectedOrder.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">
                {selectedOrder.customer?.full_name || "Khách lẻ"}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {selectedOrder.customer?.phone_number || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền hoàn trả">
                <Text strong style={{fontSize: "16px", color: "#ff4d4f"}}>
                  ₫{calculateTotal(selectedOrder).toLocaleString()}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            <Divider/>

            <Title level={5}>Danh sách sản phẩm sẽ được hoàn trả</Title>
            <Table
              dataSource={selectedOrder.lines}
              columns={[
                {
                  title: "Sản phẩm",
                  dataIndex: ["product", "product_name"],
                  key: "product_name",
                },
                {
                  title: "Mã SP",
                  dataIndex: ["product", "sku"],
                  key: "sku",
                  width: 100,
                },
                {
                  title: "Số lượng",
                  dataIndex: "quantity",
                  key: "quantity",
                  width: 100,
                  align: "center" as const,
                },
                {
                  title: "Đơn giá",
                  dataIndex: "unit_price",
                  key: "unit_price",
                  width: 120,
                  render: (price: number) => `₫${price.toLocaleString()}`
                },
                {
                  title: "Thành tiền",
                  key: "total",
                  width: 130,
                  render: (_: any, record: SaleOrderLineResponse) => (
                    <Text strong style={{color: "#ff4d4f"}}>
                      ₫{(record.quantity * record.unit_price).toLocaleString()}
                    </Text>
                  )
                },
              ]}
              pagination={false}
              rowKey="id"
              size="small"
              scroll={{y: 200}}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InvoicesPage;
