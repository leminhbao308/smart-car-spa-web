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
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  PrinterOutlined,
  DownloadOutlined,
  FilterOutlined,
  ReloadOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  staffName: string;
  items: InvoiceItem[];
}

interface InvoiceItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: "1",
      invoiceNumber: "HD001",
      customerName: "Nguyễn Văn A",
      customerPhone: "0123456789",
      totalAmount: 1250000,
      paymentMethod: "cash",
      status: "completed",
      createdAt: "2024-01-15 10:30:00",
      staffName: "Nguyễn Thị B",
      items: [
        { id: "1", productName: "Dầu nhớt Castrol 5W-30", quantity: 2, unitPrice: 450000, totalPrice: 900000 },
        { id: "2", productName: "Lọc gió động cơ", quantity: 1, unitPrice: 120000, totalPrice: 120000 },
        { id: "3", productName: "Nước làm mát", quantity: 1, unitPrice: 180000, totalPrice: 180000 },
        { id: "4", productName: "Phí dịch vụ", quantity: 1, unitPrice: 50000, totalPrice: 50000 },
      ]
    },
    {
      id: "2",
      invoiceNumber: "HD002",
      customerName: "Trần Thị C",
      customerPhone: "0987654321",
      totalAmount: 850000,
      paymentMethod: "card",
      status: "completed",
      createdAt: "2024-01-15 14:20:00",
      staffName: "Lê Văn D",
      items: [
        { id: "1", productName: "Phanh đĩa trước", quantity: 1, unitPrice: 850000, totalPrice: 850000 },
      ]
    },
    {
      id: "3",
      invoiceNumber: "HD003",
      customerName: "Lê Văn E",
      customerPhone: "0369852147",
      totalAmount: 315000,
      paymentMethod: "transfer",
      status: "pending",
      createdAt: "2024-01-15 16:45:00",
      staffName: "Phạm Thị F",
      items: [
        { id: "1", productName: "Bugi NGK", quantity: 2, unitPrice: 95000, totalPrice: 190000 },
        { id: "2", productName: "Dầu phanh DOT 4", quantity: 1, unitPrice: 220000, totalPrice: 220000 },
        { id: "3", productName: "Phí dịch vụ", quantity: 1, unitPrice: 50000, totalPrice: 50000 },
      ]
    },
  ]);

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [dateRange, setDateRange] = useState<any>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "green";
      case "pending": return "orange";
      case "cancelled": return "red";
      default: return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "Hoàn thành";
      case "pending": return "Chờ xử lý";
      case "cancelled": return "Đã hủy";
      default: return status;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case "cash": return "Tiền mặt";
      case "card": return "Thẻ";
      case "transfer": return "Chuyển khoản";
      default: return method;
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
      invoice.customerPhone.includes(searchText);
    
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    const matchesPayment = paymentMethodFilter === "all" || invoice.paymentMethod === paymentMethodFilter;
    
    const matchesDate = !dateRange || (
      dayjs(invoice.createdAt).isAfter(dateRange[0]) &&
      dayjs(invoice.createdAt).isBefore(dateRange[1])
    );

    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  });

  const handleViewDetail = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailModalVisible(true);
  };

  const handlePrint = (invoice: Invoice) => {
    message.success(`In hóa đơn ${invoice.invoiceNumber}`);
  };

  const handleExport = (invoice: Invoice) => {
    message.success(`Xuất hóa đơn ${invoice.invoiceNumber}`);
  };

  const columns = [
    {
      title: "Mã hóa đơn",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
      width: 120,
      render: (text: string) => (
        <Text strong style={{ color: "#1890ff" }}>{text}</Text>
      ),
    },
    {
      title: "Khách hàng",
      key: "customer",
      render: (_, record: Invoice) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.customerName}</div>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.customerPhone}
          </Text>
        </div>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 120,
      render: (amount: number) => (
        <Text strong style={{ color: "#52c41a" }}>
          ₫{amount.toLocaleString()}
        </Text>
      ),
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 100,
      render: (method: string) => getPaymentMethodText(method),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
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
      width: 150,
      render: (_, record: Invoice) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="In hóa đơn">
            <Button
              type="text"
              icon={<PrinterOutlined />}
              onClick={() => handlePrint(record)}
            />
          </Tooltip>
          <Tooltip title="Xuất file">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => handleExport(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Title level={2} style={{ margin: 0, color: "rgba(0, 0, 0, 0.85)" }}>
          Quản lý hóa đơn
        </Title>
        <Text type="secondary" style={{ fontSize: "16px" }}>
          Danh sách hóa đơn bán hàng
        </Text>
      </div>

      <Card style={{ borderRadius: "12px", marginBottom: "24px" }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Tìm kiếm hóa đơn, khách hàng..."
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
              <Option value="completed">Hoàn thành</Option>
              <Option value="pending">Chờ xử lý</Option>
              <Option value="cancelled">Đã hủy</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Thanh toán"
              value={paymentMethodFilter}
              onChange={setPaymentMethodFilter}
              style={{ width: "100%" }}
            >
              <Option value="all">Tất cả</Option>
              <Option value="cash">Tiền mặt</Option>
              <Option value="card">Thẻ</Option>
              <Option value="transfer">Chuyển khoản</Option>
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
              <Button icon={<FilterOutlined />}>
                Lọc
              </Button>
              <Button icon={<ReloadOutlined />}>
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card style={{ borderRadius: "12px" }}>
        <Table
          dataSource={filteredInvoices}
          columns={columns}
          rowKey="id"
          pagination={{
            total: filteredInvoices.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} hóa đơn`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Invoice Detail Modal */}
      <Modal
        title={
          <Space>
            <FileTextOutlined />
            <span>Chi tiết hóa đơn {selectedInvoice?.invoiceNumber}</span>
          </Space>
        }
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="print" icon={<PrinterOutlined />} onClick={() => selectedInvoice && handlePrint(selectedInvoice)}>
            In hóa đơn
          </Button>,
          <Button key="export" icon={<DownloadOutlined />} onClick={() => selectedInvoice && handleExport(selectedInvoice)}>
            Xuất file
          </Button>,
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedInvoice && (
          <div>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Mã hóa đơn" span={1}>
                <Text strong>{selectedInvoice.invoiceNumber}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo" span={1}>
                {dayjs(selectedInvoice.createdAt).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng" span={1}>
                {selectedInvoice.customerName}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại" span={1}>
                {selectedInvoice.customerPhone}
              </Descriptions.Item>
              <Descriptions.Item label="Nhân viên" span={1}>
                {selectedInvoice.staffName}
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán" span={1}>
                {getPaymentMethodText(selectedInvoice.paymentMethod)}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={1}>
                <Tag color={getStatusColor(selectedInvoice.status)}>
                  {getStatusText(selectedInvoice.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền" span={1}>
                <Text strong style={{ fontSize: "16px", color: "#52c41a" }}>
                  ₫{selectedInvoice.totalAmount.toLocaleString()}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={5}>Chi tiết sản phẩm</Title>
            <Table
              dataSource={selectedInvoice.items}
              columns={[
                { title: "Sản phẩm", dataIndex: "productName", key: "productName" },
                { title: "Số lượng", dataIndex: "quantity", key: "quantity", width: 100 },
                { 
                  title: "Đơn giá", 
                  dataIndex: "unitPrice", 
                  key: "unitPrice", 
                  width: 120,
                  render: (price: number) => `₫${price.toLocaleString()}`
                },
                { 
                  title: "Thành tiền", 
                  dataIndex: "totalPrice", 
                  key: "totalPrice", 
                  width: 120,
                  render: (price: number) => (
                    <Text strong>₫{price.toLocaleString()}</Text>
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
    </div>
  );
};

export default InvoicesPage;
