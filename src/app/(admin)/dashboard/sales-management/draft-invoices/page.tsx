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
  Popconfirm,
  Spin,
  Alert,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  FilterOutlined,
  ReloadOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {useConfirmSalesOrder, useFulfillSalesOrder, useSalesOrders} from "@/lib/api/hooks";
import {SaleOrderLineResponse, SaleOrderResponse} from "@/lib/api";

const {Title, Text} = Typography;
const {RangePicker} = DatePicker;
const {Option} = Select;

const DraftInvoicesPage = () => {
  const {orders, loading, error, refetch} = useSalesOrders();
  const {mutate: confirmOrder, isPending: isConfirming} = useConfirmSalesOrder();
  const {mutate: fulfillOrder, isPending: isFulfilling} = useFulfillSalesOrder();

  const [selectedDraft, setSelectedDraft] = useState<SaleOrderResponse | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<any>(null);

  // Filter only draft orders
  const draftOrders = useMemo(() => {
    return orders.filter(order => order.status === "DRAFT");
  }, [orders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "blue";
      case "CONFIRMED":
        return "orange";
      case "FULFILLED":
        return "green";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "Nháp";
      case "CONFIRMED":
        return "Đã xác nhận";
      case "FULFILLED":
        return "Hoàn thành";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <FileTextOutlined/>;
      case "CONFIRMED":
        return <ClockCircleOutlined/>;
      case "FULFILLED":
        return <CheckCircleOutlined/>;
      default:
        return <FileTextOutlined/>;
    }
  };

  const calculateOrderTotal = (order: SaleOrderResponse) => {
    return order.lines.reduce((sum: number, line) =>
      sum + (line.quantity * Number(line.unit_price)), 0
    );
  };

  const filteredDrafts = useMemo(() => {
    return draftOrders.filter((draft) => {
      const matchesSearch =
        draft.id.toLowerCase().includes(searchText.toLowerCase()) ||
        (draft.customer?.full_name &&
          draft.customer.full_name.toLowerCase().includes(searchText.toLowerCase())) ||
        (draft.customer?.phone_number && draft.customer.phone_number.includes(searchText));

      const matchesStatus = statusFilter === "all" || draft.status === statusFilter;

      const matchesDate =
        !dateRange ||
        (dayjs(draft.created_date).isAfter(dateRange[0]) &&
          dayjs(draft.created_date).isBefore(dateRange[1]));

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [draftOrders, searchText, statusFilter, dateRange]);

  const statistics = useMemo(() => {
    const totalDrafts = draftOrders.length;
    const totalValue = draftOrders.reduce((sum, draft) => sum + calculateOrderTotal(draft), 0);

    return {totalDrafts, totalValue};
  }, [draftOrders]);

  const handleViewDetail = (draft: SaleOrderResponse) => {
    setSelectedDraft(draft);
    setIsDetailModalVisible(true);
  };

  const handleComplete = (draft: SaleOrderResponse) => {
    // First confirm, then fulfill
    confirmOrder(draft.id, {
      onSuccess: (confirmedOrder) => {
        fulfillOrder(confirmedOrder.id);
      }
    });
  };

  const columns = [
    {
      title: "Mã hóa đơn tạm",
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
      title: "Tổng tiền",
      key: "totalAmount",
      width: 120,
      render: (_: any, record: SaleOrderResponse) => (
        <Text strong style={{color: "#52c41a"}}>
          ₫{calculateOrderTotal(record).toLocaleString()}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
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
      width: 200,
      render: (_: any, record: SaleOrderResponse) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined/>}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Hoàn thành">
            <Button
              type="text"
              icon={<CheckCircleOutlined/>}
              onClick={() => handleComplete(record)}
              loading={isConfirming || isFulfilling}
              style={{color: "#52c41a"}}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa hóa đơn tạm"
            description="Bạn có chắc chắn muốn xóa hóa đơn tạm này?"
            onConfirm={() => {
              // TODO: Implement delete functionality
            }}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button type="text" danger icon={<DeleteOutlined/>}/>
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (error) {
    return (
      <div style={{padding: "24px"}}>
        <Alert
          message="Lỗi tải dữ liệu"
          description="Không thể tải danh sách hóa đơn tạm. Vui lòng thử lại."
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
    <div style={{padding: "24px"}}>
      <div style={{marginBottom: "24px"}}>
        <Title level={2} style={{margin: 0, color: "rgba(0, 0, 0, 0.85)"}}>
          Hóa đơn tạm
        </Title>
        <Text type="secondary" style={{fontSize: "16px"}}>
          Quản lý hóa đơn chưa hoàn thành
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{marginBottom: "24px"}}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng hóa đơn tạm"
              value={statistics.totalDrafts}
              prefix={<FileTextOutlined/>}
              valueStyle={{color: "#1890ff"}}
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
              valueStyle={{color: "#52c41a"}}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{borderRadius: "12px", marginBottom: "24px"}}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Tìm kiếm hóa đơn tạm, khách hàng..."
              prefix={<SearchOutlined/>}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
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
        </Row>
      </Card>

      <Card style={{borderRadius: "12px"}}>
        <Spin spinning={loading}>
          <Table
            dataSource={filteredDrafts}
            columns={columns}
            rowKey="id"
            pagination={{
              total: filteredDrafts.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} hóa đơn tạm`,
            }}
            scroll={{x: 1200}}
          />
        </Spin>
      </Card>

      {/* Draft Invoice Detail Modal */}
      <Modal
        title={
          <Space>
            <FileTextOutlined/>
            <span>Chi tiết hóa đơn tạm</span>
          </Space>
        }
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button
            key="complete"
            type="primary"
            icon={<CheckCircleOutlined/>}
            onClick={() => {
              if (selectedDraft) {
                handleComplete(selectedDraft);
                setIsDetailModalVisible(false);
              }
            }}
            loading={isConfirming || isFulfilling}
          >
            Hoàn thành
          </Button>,
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedDraft && (
          <div>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Mã hóa đơn tạm" span={2}>
                <Text strong code>{selectedDraft.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={1}>
                <Tag
                  color={getStatusColor(selectedDraft.status)}
                  icon={getStatusIcon(selectedDraft.status)}
                >
                  {getStatusText(selectedDraft.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo" span={1}>
                {dayjs(selectedDraft.created_date).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng" span={1}>
                {selectedDraft.customer?.full_name || "Khách lẻ"}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại" span={1}>
                {selectedDraft.customer?.phone_number || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Chi nhánh" span={1}>
                {selectedDraft.branch.branch_name}
              </Descriptions.Item>
              <Descriptions.Item label="Kho hàng" span={1}>
                {selectedDraft.warehouse.branch.branch_name}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền" span={2}>
                <Text strong style={{fontSize: "16px", color: "#52c41a"}}>
                  ₫{calculateOrderTotal(selectedDraft).toLocaleString()}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            <Divider/>

            <Title level={5}>Chi tiết sản phẩm</Title>
            <Table
              dataSource={selectedDraft.lines}
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
                  width: 60,
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
                  key: "total_price",
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
    </div>
  );
};

export default DraftInvoicesPage;
