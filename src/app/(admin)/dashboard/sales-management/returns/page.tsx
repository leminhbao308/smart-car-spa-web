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
  Tooltip,
  Statistic,
  Spin,
  Alert,
  Form,
  InputNumber,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  DeleteOutlined,
  FilterOutlined,
  ReloadOutlined,
  UndoOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {useCreateReturn, useSalesOrders} from "@/lib/api/hooks";
import {CreateReturnRequest, ReturnItem, SaleOrderLineResponse, SaleOrderResponse} from "@/lib/api";

const {Title, Text} = Typography;
const {RangePicker} = DatePicker;
const {Option} = Select;
const {TextArea} = Input;

const ReturnsPage = () => {
  const {orders, loading, error, refetch} = useSalesOrders();
  const {mutate: createReturn, isPending: isCreatingReturn} = useCreateReturn();

  const [selectedOrder, setSelectedOrder] = useState<SaleOrderResponse | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<any>(null);
  const [form] = Form.useForm();

  // Filter orders that have returns (PARTIALLY_RETURNED or RETURNED status)
  const returnedOrders = useMemo(() => {
    return orders.filter(order =>
      order.status === "PARTIALLY_RETURNED" ||
      order.status === "RETURNED"
    );
  }, [orders]);

  // Filter fulfilled orders that can be returned
  const returnableOrders = useMemo(() => {
    return orders.filter(order => order.status === "FULFILLED");
  }, [orders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "FULFILLED":
        return "green";
      case "PARTIALLY_RETURNED":
        return "orange";
      case "RETURNED":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "FULFILLED":
        return "Hoàn thành";
      case "PARTIALLY_RETURNED":
        return "Trả hàng 1 phần";
      case "RETURNED":
        return "Đã trả hàng";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "FULFILLED":
        return <CheckCircleOutlined/>;
      case "PARTIALLY_RETURNED":
        return <ClockCircleOutlined/>;
      case "RETURNED":
        return <CloseCircleOutlined/>;
      default:
        return <UndoOutlined/>;
    }
  };

  const calculateOrderTotal = (order: SaleOrderResponse) => {
    return order.lines.reduce((sum, line) =>
      sum + (line.quantity * Number(line.unit_price)), 0
    );
  };

  const filteredReturns = useMemo(() => {
    return returnedOrders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchText.toLowerCase()) ||
        (order.customer?.full_name &&
          order.customer.full_name.toLowerCase().includes(searchText.toLowerCase())) ||
        (order.customer?.phone_number &&
          order.customer.phone_number.includes(searchText));

      const matchesStatus = statusFilter === "all" || order.status === statusFilter;

      const matchesDate =
        !dateRange ||
        (dayjs(order.created_date).isAfter(dateRange[0]) &&
          dayjs(order.created_date).isBefore(dateRange[1]));

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [returnedOrders, searchText, statusFilter, dateRange]);

  const statistics = useMemo(() => {
    const totalReturns = returnedOrders.length;
    const partialReturns = returnedOrders.filter(o => o.status === "PARTIALLY_RETURNED").length;
    const fullReturns = returnedOrders.filter(o => o.status === "RETURNED").length;
    const totalValue = returnedOrders.reduce((sum, order) =>
      sum + calculateOrderTotal(order), 0
    );

    return {totalReturns, partialReturns, fullReturns, totalValue};
  }, [returnedOrders]);

  const handleViewDetail = (order: SaleOrderResponse) => {
    setSelectedOrder(order);
    setIsDetailModalVisible(true);
  };

  const handleCreateReturn = () => {
    setIsCreateModalVisible(true);
  };

  const onFinishCreate = (values: CreateReturnRequest) => {
    const items = values.items.map((item: ReturnItem) => ({
      product_id: item.product_id,
      qty: item.qty,
      unit_cost: item.unit_cost || 0,
    }));

    createReturn(
      {orderId: values.order_id, items},
      {
        onSuccess: () => {
          setIsCreateModalVisible(false);
          form.resetFields();
        },
      }
    );
  };

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
      width: 180,
      render: (text: string) => (
        <Text strong style={{color: "#1890ff", fontFamily: "monospace"}}>
          {text.substring(0, 8)}...
        </Text>
      ),
    },
    {
      title: "Khách hàng",
      key: "customer",
      render: (_: any, record: SaleOrderResponse) => (
        <div>
          {record.customer ? (
            <>
              <div style={{fontWeight: 500}}>{record.customer.full_name}</div>
              <Text type="secondary" style={{fontSize: "12px"}}>
                {record.customer.phone_number}
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
      render: (_: any, record: SaleOrderResponse) => (
        <Text strong style={{color: "#ff4d4f"}}>
          ₫{calculateOrderTotal(record).toLocaleString()}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status: string) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: "Chi nhánh",
      dataIndex: ["branch", "branch_name"],
      key: "branch",
      width: 150,
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
      width: 150,
      render: (_: any, record: SaleOrderResponse) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined/>}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (error) {
    return (
      <div style={{padding: "24px"}}>
        <Alert
          message="Lỗi tải dữ liệu"
          description="Không thể tải danh sách hoàn trả. Vui lòng thử lại."
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => refetch()}>
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden"}}>
      {/* Header */}
      <div style={{padding: "16px 24px", borderBottom: "1px solid #f0f0f0", flexShrink: 0}}>
        <Title level={2} style={{margin: 0, color: "rgba(0, 0, 0, 0.85)"}}>
          Hoàn trả hàng
        </Title>
        <Text type="secondary" style={{fontSize: "16px"}}>
          Quản lý yêu cầu hoàn trả sản phẩm
        </Text>
      </div>

      {/* Statistics Cards */}
      <div style={{padding: "16px 24px", flexShrink: 0}}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng yêu cầu"
                value={statistics.totalReturns}
                prefix={<UndoOutlined/>}
                valueStyle={{color: "#1890ff"}}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Trả hàng 1 phần"
                value={statistics.partialReturns}
                prefix={<ClockCircleOutlined/>}
                valueStyle={{color: "#faad14"}}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Đã trả hàng"
                value={statistics.fullReturns}
                prefix={<CheckCircleOutlined/>}
                valueStyle={{color: "#ff4d4f"}}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng giá trị"
                value={statistics.totalValue}
                prefix="₫"
                precision={0}
                valueStyle={{color: "#ff4d4f"}}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Filters */}
      <div style={{padding: "0 24px 16px", flexShrink: 0}}>
        <Card style={{borderRadius: "12px"}}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="Tìm kiếm mã đơn hàng, khách hàng..."
                prefix={<SearchOutlined/>}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="Trạng thái"
                value={statusFilter}
                onChange={setStatusFilter}
                style={{width: "100%"}}
              >
                <Option value="all">Tất cả</Option>
                <Option value="PARTIALLY_RETURNED">Trả hàng 1 phần</Option>
                <Option value="RETURNED">Đã trả hàng</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <RangePicker
                style={{width: "100%"}}
                value={dateRange}
                onChange={setDateRange}
                placeholder={["Từ ngày", "Đến ngày"]}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Space>
                <Button icon={<FilterOutlined/>}>Lọc</Button>
                <Button
                  icon={<ReloadOutlined/>}
                  onClick={() => refetch()}
                  loading={loading}
                >
                  Làm mới
                </Button>
              </Space>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Button
                type="primary"
                icon={<PlusOutlined/>}
                onClick={handleCreateReturn}
              >
                Tạo yêu cầu hoàn trả
              </Button>
            </Col>
          </Row>
        </Card>
      </div>

      {/* Table Content */}
      <div style={{flex: 1, padding: "0 24px 24px", overflow: "hidden"}}>
        <Card style={{borderRadius: "12px", height: "100%"}}>
          <Spin spinning={loading}>
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
              scroll={{x: 1200, y: "calc(100vh - 400px)"}}
              size="small"
            />
          </Spin>
        </Card>
      </div>

      {/* Return Detail Modal */}
      <Modal
        title={
          <Space>
            <UndoOutlined/>
            <span>Chi tiết hoàn trả</span>
          </Space>
        }
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedOrder && (
          <div>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Mã đơn hàng" span={2}>
                <Text strong code>{selectedOrder.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={1}>
                <Tag
                  color={getStatusColor(selectedOrder.status)}
                  icon={getStatusIcon(selectedOrder.status)}
                >
                  {getStatusText(selectedOrder.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo" span={1}>
                {dayjs(selectedOrder.created_date).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng" span={1}>
                {selectedOrder.customer?.full_name || "Khách lẻ"}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại" span={1}>
                {selectedOrder.customer?.phone_number || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Chi nhánh" span={1}>
                {selectedOrder.branch.branch_name}
              </Descriptions.Item>
              <Descriptions.Item label="Kho hàng" span={1}>
                {selectedOrder.warehouse.branch.branch_name}
              </Descriptions.Item>
              <Descriptions.Item label="Số tiền hoàn trả" span={2}>
                <Text strong style={{fontSize: "16px", color: "#ff4d4f"}}>
                  ₫{calculateOrderTotal(selectedOrder).toLocaleString()}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            <Divider/>

            <Title level={5}>Chi tiết sản phẩm hoàn trả</Title>
            <Table
              dataSource={selectedOrder.lines}
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
                  render: (price: number) => `₫${Number(price).toLocaleString()}`,
                },
                {
                  title: "Thành tiền",
                  key: "total",
                  width: 120,
                  render: (_: any, record: SaleOrderLineResponse) => (
                    <Text strong>
                      ₫{(record.quantity * Number(record.unit_price)).toLocaleString()}
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
        onCancel={() => setIsCreateModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={isCreatingReturn}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={onFinishCreate}>
          <Form.Item
            label="Chọn đơn hàng"
            name="order_id"
            rules={[
              {required: true, message: "Vui lòng chọn đơn hàng"},
            ]}
          >
            <Select
              placeholder="Chọn đơn hàng đã hoàn thành"
              showSearch
              optionFilterProp="children"
            >
              {returnableOrders.map(order => (
                <Option key={order.id} value={order.id}>
                  {order.id.substring(0, 8)}... - {order.customer?.full_name || "Khách lẻ"} - ₫{calculateOrderTotal(order).toLocaleString()}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Alert
            message="Lưu ý"
            description="Chức năng hoàn trả sẽ tạo yêu cầu hoàn trả cho toàn bộ đơn hàng. Vui lòng liên hệ quản trị viên nếu cần hoàn trả một phần."
            type="info"
            showIcon
            style={{marginBottom: 16}}
          />
        </Form>
      </Modal>
    </div>
  );
};

export default ReturnsPage;
