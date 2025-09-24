"use client";
import React, { useState } from "react";
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
  Statistic, 
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
  InfoCircleOutlined,
  PlusOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

interface ReturnRequest {
  id: string;
  returnNumber: string;
  originalInvoiceNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  totalAmount: number;
  returnAmount: number;
  status: string;
  reason: string;
  createdAt: string;
  updatedAt: string;
  staffName: string;
  branchName: string;
  items: ReturnItem[];
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
}

interface ReturnItem {
  id: string;
  productName: string;
  productCode: string;
  category: string;
  originalQuantity: number;
  returnQuantity: number;
  unitPrice: number;
  returnReason: string;
  condition: string;
  totalAmount: number;
  warranty?: string;
}

const ReturnsPage = () => {
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([
    {
      id: "1",
      returnNumber: "HT001",
      originalInvoiceNumber: "HD001",
      customerName: "Nguyễn Văn A",
      customerPhone: "0123456789",
      customerEmail: "nguyenvana@email.com",
      totalAmount: 450000,
      returnAmount: 450000,
      status: "pending",
      reason: "Sản phẩm lỗi",
      createdAt: "2024-01-15 14:30:00",
      updatedAt: "2024-01-15 14:30:00",
      staffName: "Nguyễn Thị B",
      branchName: "Chi nhánh Hà Nội",
      notes: "Khách hàng phản ánh sản phẩm bị lỗi sau 2 ngày sử dụng",
      items: [
        {
          id: "1",
          productName: "Dầu nhớt Castrol 5W-30",
          productCode: "SP001",
          category: "Dầu nhớt",
          originalQuantity: 2,
          returnQuantity: 1,
          unitPrice: 450000,
          returnReason: "Sản phẩm lỗi",
          condition: "Đã sử dụng",
          totalAmount: 450000,
          warranty: "12 tháng",
        },
      ],
    },
    {
      id: "2",
      returnNumber: "HT002",
      originalInvoiceNumber: "HD002",
      customerName: "Trần Thị C",
      customerPhone: "0987654321",
      totalAmount: 120000,
      returnAmount: 120000,
      status: "approved",
      reason: "Không phù hợp",
      createdAt: "2024-01-15 10:20:00",
      updatedAt: "2024-01-15 11:30:00",
      staffName: "Lê Văn D",
      branchName: "Chi nhánh TP.HCM",
      approvedBy: "Phạm Thị E",
      approvedAt: "2024-01-15 11:30:00",
      items: [
        {
          id: "1",
          productName: "Lọc gió động cơ",
          productCode: "SP002",
          category: "Phụ tùng",
          originalQuantity: 1,
          returnQuantity: 1,
          unitPrice: 120000,
          returnReason: "Không phù hợp",
          condition: "Chưa sử dụng",
          totalAmount: 120000,
          warranty: "6 tháng",
        },
      ],
    },
    {
      id: "3",
      returnNumber: "HT003",
      originalInvoiceNumber: "HD003",
      customerName: "Lê Văn F",
      customerPhone: "0369852147",
      totalAmount: 180000,
      returnAmount: 180000,
      status: "rejected",
      reason: "Thay đổi ý định",
      createdAt: "2024-01-14 16:45:00",
      updatedAt: "2024-01-14 17:20:00",
      staffName: "Phạm Thị G",
      branchName: "Chi nhánh Đà Nẵng",
      approvedBy: "Nguyễn Văn H",
      approvedAt: "2024-01-14 17:20:00",
      notes: "Khách hàng thay đổi ý định, không đủ điều kiện hoàn trả",
      items: [
        {
          id: "1",
          productName: "Nước làm mát",
          productCode: "SP003",
          category: "Chất lỏng",
          originalQuantity: 1,
          returnQuantity: 1,
          unitPrice: 180000,
          returnReason: "Thay đổi ý định",
          condition: "Đã sử dụng",
          totalAmount: 180000,
          warranty: "24 tháng",
        },
      ],
    },
  ]);

  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(
    null
  );
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<any>(null);
  const [form] = Form.useForm();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "orange";
      case "approved":
        return "green";
      case "rejected":
        return "red";
      case "completed":
        return "blue";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ duyệt";
      case "approved":
        return "Đã duyệt";
      case "rejected":
        return "Từ chối";
      case "completed":
        return "Hoàn thành";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <ClockCircleOutlined />;
      case "approved":
        return <CheckCircleOutlined />;
      case "rejected":
        return <CloseCircleOutlined />;
      case "completed":
        return <CheckCircleOutlined />;
      default:
        return <InfoCircleOutlined />;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "Chưa sử dụng":
        return "green";
      case "Đã sử dụng":
        return "orange";
      case "Hư hỏng":
        return "red";
      default:
        return "default";
    }
  };

  const getReturnReasonText = (reason: string) => {
    switch (reason) {
      case "Sản phẩm lỗi":
        return "Sản phẩm lỗi";
      case "Không phù hợp":
        return "Không phù hợp";
      case "Thay đổi ý định":
        return "Thay đổi ý định";
      case "Giao hàng sai":
        return "Giao hàng sai";
      case "Khác":
        return "Khác";
      default:
        return reason;
    }
  };

  const filteredReturns = returnRequests.filter((returnReq) => {
    const matchesSearch =
      returnReq.returnNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      returnReq.originalInvoiceNumber
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      returnReq.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
      returnReq.customerPhone.includes(searchText);

    const matchesStatus =
      statusFilter === "all" || returnReq.status === statusFilter;

    const matchesDate =
      !dateRange ||
      (dayjs(returnReq.createdAt).isAfter(dateRange[0]) &&
        dayjs(returnReq.createdAt).isBefore(dateRange[1]));

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleViewDetail = (returnReq: ReturnRequest) => {
    setSelectedReturn(returnReq);
    setIsDetailModalVisible(true);
  };

  const handleApprove = (returnReq: ReturnRequest) => {
    setReturnRequests((returns) =>
      returns.map((r) =>
        r.id === returnReq.id
          ? {
              ...r,
              status: "approved",
              updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
              approvedBy: "Admin User",
              approvedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            }
          : r
      )
    );
    message.success(`Duyệt yêu cầu hoàn trả ${returnReq.returnNumber}`);
  };

  const handleReject = (returnReq: ReturnRequest) => {
    setReturnRequests((returns) =>
      returns.map((r) =>
        r.id === returnReq.id
          ? {
              ...r,
              status: "rejected",
              updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
              approvedBy: "Admin User",
              approvedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            }
          : r
      )
    );
    message.success(`Từ chối yêu cầu hoàn trả ${returnReq.returnNumber}`);
  };

  const handleComplete = (returnReq: ReturnRequest) => {
    setReturnRequests((returns) =>
      returns.map((r) =>
        r.id === returnReq.id
          ? {
              ...r,
              status: "completed",
              updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            }
          : r
      )
    );
    message.success(`Hoàn thành xử lý hoàn trả ${returnReq.returnNumber}`);
  };

  const handleDelete = (returnReq: ReturnRequest) => {
    setReturnRequests((returns) =>
      returns.filter((r) => r.id !== returnReq.id)
    );
    message.success(`Xóa yêu cầu hoàn trả ${returnReq.returnNumber}`);
  };

  const handleCreateReturn = () => {
    setIsCreateModalVisible(true);
  };

  const onFinishCreate = (values: any) => {
    const newReturn: ReturnRequest = {
      id: (returnRequests.length + 1).toString(),
      returnNumber: `HT${String(returnRequests.length + 1).padStart(3, "0")}`,
      originalInvoiceNumber: values.originalInvoiceNumber,
      customerName: values.customerName,
      customerPhone: values.customerPhone,
      customerEmail: values.customerEmail,
      totalAmount: values.totalAmount,
      returnAmount: values.returnAmount,
      status: "pending",
      reason: values.reason,
      createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      staffName: "Current User",
      branchName: "Chi nhánh hiện tại",
      notes: values.notes,
      items: values.items || [],
    };

    setReturnRequests([...returnRequests, newReturn]);
    setIsCreateModalVisible(false);
    form.resetFields();
    message.success("Tạo yêu cầu hoàn trả thành công!");
  };

  const columns = [
    {
      title: "Mã hoàn trả",
      dataIndex: "returnNumber",
      key: "returnNumber",
      width: 120,
      render: (text: string) => (
        <Text strong style={{ color: "#1890ff" }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Hóa đơn gốc",
      dataIndex: "originalInvoiceNumber",
      key: "originalInvoiceNumber",
      width: 120,
      render: (text: string) => (
        <Text style={{ color: "#52c41a" }}>{text}</Text>
      ),
    },
    {
      title: "Khách hàng",
      key: "customer",
      render: (_: any, record: ReturnRequest) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.customerName}</div>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.customerPhone}
          </Text>
          {record.customerEmail && (
            <div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {record.customerEmail}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Lý do",
      dataIndex: "reason",
      key: "reason",
      width: 120,
      render: (reason: string) => getReturnReasonText(reason),
    },
    {
      title: "Số tiền hoàn trả",
      dataIndex: "returnAmount",
      key: "returnAmount",
      width: 120,
      render: (amount: number) => (
        <Text strong style={{ color: "#ff4d4f" }}>
          ₫{amount.toLocaleString()}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: "Nhân viên",
      dataIndex: "staffName",
      key: "staffName",
      width: 120,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 200,
      render: (_: any, record: ReturnRequest) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          {record.status === "pending" && (
            <>
              <Tooltip title="Duyệt">
                <Button
                  type="text"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleApprove(record)}
                  style={{ color: "#52c41a" }}
                />
              </Tooltip>
              <Tooltip title="Từ chối">
                <Button
                  type="text"
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleReject(record)}
                  style={{ color: "#ff4d4f" }}
                />
              </Tooltip>
            </>
          )}
          {record.status === "approved" && (
            <Tooltip title="Hoàn thành">
              <Button
                type="text"
                icon={<CheckCircleOutlined />}
                onClick={() => handleComplete(record)}
                style={{ color: "#1890ff" }}
              />
            </Tooltip>
          )}
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #f0f0f0", flexShrink: 0 }}>
        <Title level={2} style={{ margin: 0, color: "rgba(0, 0, 0, 0.85)" }}>
          Hoàn trả hàng
        </Title>
        <Text type="secondary" style={{ fontSize: "16px" }}>
          Quản lý yêu cầu hoàn trả sản phẩm
        </Text>
      </div>

      {/* Statistics Cards */}
      <div style={{ padding: "16px 24px", flexShrink: 0 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng yêu cầu"
                value={returnRequests.length}
                prefix={<UndoOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Chờ duyệt"
                value={
                  returnRequests.filter((r) => r.status === "pending").length
                }
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Đã duyệt"
                value={
                  returnRequests.filter((r) => r.status === "approved").length
                }
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng giá trị"
                value={returnRequests.reduce((sum, r) => sum + r.returnAmount, 0)}
                prefix="₫"
                precision={0}
                valueStyle={{ color: "#ff4d4f" }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Filters */}
      <div style={{ padding: "0 24px 16px", flexShrink: 0 }}>
        <Card style={{ borderRadius: "12px" }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="Tìm kiếm mã hoàn trả, khách hàng..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="Trạng thái"
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: "100%" }}
              >
                <Option value="all">Tất cả</Option>
                <Option value="pending">Chờ duyệt</Option>
                <Option value="approved">Đã duyệt</Option>
                <Option value="rejected">Từ chối</Option>
                <Option value="completed">Hoàn thành</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <RangePicker
                style={{ width: "100%" }}
                value={dateRange}
                onChange={setDateRange}
                placeholder={["Từ ngày", "Đến ngày"]}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Space>
                <Button icon={<FilterOutlined />}>Lọc</Button>
                <Button icon={<ReloadOutlined />}>Làm mới</Button>
              </Space>
            </Col>
            <Col xs={24} sm={12} md={4}>
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
            size="small"
          />
        </Card>
      </div>

      {/* Return Detail Modal */}
      <Modal
        title={
          <Space>
            <UndoOutlined />
            <span>
              Chi tiết yêu cầu hoàn trả {selectedReturn?.returnNumber}
            </span>
          </Space>
        }
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          selectedReturn?.status === "pending" && (
            <>
              <Button
                key="approve"
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => selectedReturn && handleApprove(selectedReturn)}
              >
                Duyệt
              </Button>
              <Button
                key="reject"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => selectedReturn && handleReject(selectedReturn)}
              >
                Từ chối
              </Button>
            </>
          ),
          selectedReturn?.status === "approved" && (
            <Button
              key="complete"
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => selectedReturn && handleComplete(selectedReturn)}
            >
              Hoàn thành
            </Button>
          ),
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedReturn && (
          <div>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Mã hoàn trả" span={1}>
                <Text strong>{selectedReturn.returnNumber}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Hóa đơn gốc" span={1}>
                <Text style={{ color: "#52c41a" }}>
                  {selectedReturn.originalInvoiceNumber}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng" span={1}>
                {selectedReturn.customerName}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại" span={1}>
                {selectedReturn.customerPhone}
              </Descriptions.Item>
              {selectedReturn.customerEmail && (
                <Descriptions.Item label="Email" span={2}>
                  {selectedReturn.customerEmail}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Lý do hoàn trả" span={1}>
                {getReturnReasonText(selectedReturn.reason)}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={1}>
                <Tag
                  color={getStatusColor(selectedReturn.status)}
                  icon={getStatusIcon(selectedReturn.status)}
                >
                  {getStatusText(selectedReturn.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Nhân viên" span={1}>
                {selectedReturn.staffName}
              </Descriptions.Item>
              <Descriptions.Item label="Chi nhánh" span={1}>
                {selectedReturn.branchName}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo" span={1}>
                {dayjs(selectedReturn.createdAt).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
              <Descriptions.Item label="Cập nhật cuối" span={1}>
                {dayjs(selectedReturn.updatedAt).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
              {selectedReturn.approvedBy && (
                <Descriptions.Item label="Người duyệt" span={1}>
                  {selectedReturn.approvedBy}
                </Descriptions.Item>
              )}
              {selectedReturn.approvedAt && (
                <Descriptions.Item label="Ngày duyệt" span={1}>
                  {dayjs(selectedReturn.approvedAt).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Số tiền hoàn trả" span={2}>
                <Text strong style={{ fontSize: "16px", color: "#ff4d4f" }}>
                  ₫{selectedReturn.returnAmount.toLocaleString()}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            {selectedReturn.notes && (
              <>
                <Divider />
                <div>
                  <Text strong>Ghi chú: </Text>
                  <Text>{selectedReturn.notes}</Text>
                </div>
              </>
            )}

            <Divider />

            <Title level={5}>Chi tiết sản phẩm hoàn trả</Title>
            <Table
              dataSource={selectedReturn.items}
              columns={[
                {
                  title: "Mã SP",
                  dataIndex: "productCode",
                  key: "productCode",
                  width: 80,
                },
                {
                  title: "Sản phẩm",
                  dataIndex: "productName",
                  key: "productName",
                },
                {
                  title: "Danh mục",
                  dataIndex: "category",
                  key: "category",
                  width: 100,
                },
                {
                  title: "SL gốc",
                  dataIndex: "originalQuantity",
                  key: "originalQuantity",
                  width: 80,
                },
                {
                  title: "SL trả",
                  dataIndex: "returnQuantity",
                  key: "returnQuantity",
                  width: 80,
                },
                {
                  title: "Đơn giá",
                  dataIndex: "unitPrice",
                  key: "unitPrice",
                  width: 100,
                  render: (price: number) => `₫${price.toLocaleString()}`,
                },
                {
                  title: "Lý do",
                  dataIndex: "returnReason",
                  key: "returnReason",
                  width: 120,
                  render: (reason: string) => getReturnReasonText(reason),
                },
                {
                  title: "Tình trạng",
                  dataIndex: "condition",
                  key: "condition",
                  width: 100,
                  render: (condition: string) => (
                    <Tag color={getConditionColor(condition)}>{condition}</Tag>
                  ),
                },
                {
                  title: "Thành tiền",
                  dataIndex: "totalAmount",
                  key: "totalAmount",
                  width: 120,
                  render: (price: number) => (
                    <Text strong>₫{price.toLocaleString()}</Text>
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
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={onFinishCreate}>
          <Form.Item
            label="Hóa đơn gốc"
            name="originalInvoiceNumber"
            rules={[
              { required: true, message: "Vui lòng nhập mã hóa đơn gốc" },
            ]}
          >
            <Input placeholder="Nhập mã hóa đơn gốc" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tên khách hàng"
                name="customerName"
                rules={[
                  { required: true, message: "Vui lòng nhập tên khách hàng" },
                ]}
              >
                <Input placeholder="Tên khách hàng" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Số điện thoại"
                name="customerPhone"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                ]}
              >
                <Input placeholder="Số điện thoại" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Email" name="customerEmail">
            <Input placeholder="Email (tùy chọn)" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Lý do hoàn trả"
                name="reason"
                rules={[
                  { required: true, message: "Vui lòng chọn lý do hoàn trả" },
                ]}
              >
                <Select placeholder="Chọn lý do">
                  <Option value="Sản phẩm lỗi">Sản phẩm lỗi</Option>
                  <Option value="Không phù hợp">Không phù hợp</Option>
                  <Option value="Thay đổi ý định">Thay đổi ý định</Option>
                  <Option value="Giao hàng sai">Giao hàng sai</Option>
                  <Option value="Khác">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Số tiền hoàn trả"
                name="returnAmount"
                rules={[
                  { required: true, message: "Vui lòng nhập số tiền hoàn trả" },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Số tiền hoàn trả"
                  formatter={(value) =>
                    `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value!.replace(/₫\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Ghi chú" name="notes">
            <TextArea rows={3} placeholder="Ghi chú thêm (tùy chọn)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReturnsPage;
