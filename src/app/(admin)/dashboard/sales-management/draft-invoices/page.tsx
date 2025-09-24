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
  Popconfirm,
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
  SaveOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface DraftInvoice {
  id: string;
  draftNumber: string;
  customerName?: string;
  customerPhone?: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  staffName: string;
  branchName: string;
  items: DraftItem[];
  notes?: string;
  expiresAt: string;
}

interface DraftItem {
  id: string;
  productName: string;
  productCode: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

const DraftInvoicesPage = () => {
  const [draftInvoices, setDraftInvoices] = useState<DraftInvoice[]>([
    {
      id: "1",
      draftNumber: "HDT001",
      customerName: "Nguyễn Văn A",
      customerPhone: "0123456789",
      totalAmount: 1250000,
      status: "draft",
      createdAt: "2024-01-15 10:30:00",
      updatedAt: "2024-01-15 10:30:00",
      staffName: "Nguyễn Thị B",
      branchName: "Chi nhánh Hà Nội",
      notes: "Khách hàng cần tư vấn thêm",
      expiresAt: "2024-01-16 10:30:00",
      items: [
        {
          id: "1",
          productName: "Dầu nhớt Castrol 5W-30",
          productCode: "SP001",
          category: "Dầu nhớt",
          quantity: 2,
          unitPrice: 450000,
          totalPrice: 900000,
        },
        {
          id: "2",
          productName: "Lọc gió động cơ",
          productCode: "SP002",
          category: "Phụ tùng",
          quantity: 1,
          unitPrice: 120000,
          totalPrice: 120000,
        },
        {
          id: "3",
          productName: "Nước làm mát",
          productCode: "SP003",
          category: "Chất lỏng",
          quantity: 1,
          unitPrice: 180000,
          totalPrice: 180000,
        },
        {
          id: "4",
          productName: "Phí dịch vụ",
          productCode: "DV001",
          category: "Dịch vụ",
          quantity: 1,
          unitPrice: 50000,
          totalPrice: 50000,
        },
      ],
    },
    {
      id: "2",
      draftNumber: "HDT002",
      customerName: "Trần Thị C",
      customerPhone: "0987654321",
      totalAmount: 850000,
      status: "pending_payment",
      createdAt: "2024-01-15 14:20:00",
      updatedAt: "2024-01-15 14:25:00",
      staffName: "Lê Văn D",
      branchName: "Chi nhánh TP.HCM",
      expiresAt: "2024-01-16 14:20:00",
      items: [
        {
          id: "1",
          productName: "Phanh đĩa trước",
          productCode: "SP004",
          category: "Phụ tùng",
          quantity: 1,
          unitPrice: 850000,
          totalPrice: 850000,
        },
      ],
    },
    {
      id: "3",
      draftNumber: "HDT003",
      totalAmount: 315000,
      status: "expired",
      createdAt: "2024-01-14 16:45:00",
      updatedAt: "2024-01-14 16:45:00",
      staffName: "Phạm Thị F",
      branchName: "Chi nhánh Đà Nẵng",
      expiresAt: "2024-01-15 16:45:00",
      items: [
        {
          id: "1",
          productName: "Bugi NGK",
          productCode: "SP005",
          category: "Phụ tùng",
          quantity: 2,
          unitPrice: 95000,
          totalPrice: 190000,
        },
        {
          id: "2",
          productName: "Dầu phanh DOT 4",
          productCode: "SP006",
          category: "Chất lỏng",
          quantity: 1,
          unitPrice: 220000,
          totalPrice: 220000,
        },
        {
          id: "3",
          productName: "Phí dịch vụ",
          productCode: "DV001",
          category: "Dịch vụ",
          quantity: 1,
          unitPrice: 50000,
          totalPrice: 50000,
        },
      ],
    },
  ]);

  const [selectedDraft, setSelectedDraft] = useState<DraftInvoice | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<any>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "blue";
      case "pending_payment":
        return "orange";
      case "expired":
        return "red";
      case "completed":
        return "green";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "draft":
        return "Nháp";
      case "pending_payment":
        return "Chờ thanh toán";
      case "expired":
        return "Hết hạn";
      case "completed":
        return "Hoàn thành";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <FileTextOutlined />;
      case "pending_payment":
        return <ClockCircleOutlined />;
      case "expired":
        return <ExclamationCircleOutlined />;
      case "completed":
        return <CheckCircleOutlined />;
      default:
        return <FileTextOutlined />;
    }
  };

  const isExpired = (expiresAt: string) => {
    return dayjs().isAfter(dayjs(expiresAt));
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = dayjs();
    const expiry = dayjs(expiresAt);
    const diff = expiry.diff(now, "hour");

    if (diff <= 0) return "Đã hết hạn";
    if (diff < 24) return `Còn ${diff} giờ`;
    return `Còn ${Math.floor(diff / 24)} ngày`;
  };

  const filteredDrafts = draftInvoices.filter((draft) => {
    const matchesSearch =
      draft.draftNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      (draft.customerName &&
        draft.customerName.toLowerCase().includes(searchText.toLowerCase())) ||
      (draft.customerPhone && draft.customerPhone.includes(searchText));

    const matchesStatus =
      statusFilter === "all" || draft.status === statusFilter;

    const matchesDate =
      !dateRange ||
      (dayjs(draft.createdAt).isAfter(dateRange[0]) &&
        dayjs(draft.createdAt).isBefore(dateRange[1]));

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleViewDetail = (draft: DraftInvoice) => {
    setSelectedDraft(draft);
    setIsDetailModalVisible(true);
  };

  const handleEdit = (draft: DraftInvoice) => {
    message.info(`Chỉnh sửa hóa đơn tạm ${draft.draftNumber}`);
  };

  const handleComplete = (draft: DraftInvoice) => {
    setDraftInvoices((drafts) =>
      drafts.map((d) =>
        d.id === draft.id
          ? {
              ...d,
              status: "completed",
              updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            }
          : d
      )
    );
    message.success(`Hoàn thành hóa đơn tạm ${draft.draftNumber}`);
  };

  const handleDelete = (draft: DraftInvoice) => {
    setDraftInvoices((drafts) => drafts.filter((d) => d.id !== draft.id));
    message.success(`Xóa hóa đơn tạm ${draft.draftNumber}`);
  };

  const handleExtendExpiry = (draft: DraftInvoice) => {
    const newExpiry = dayjs().add(24, "hour").format("YYYY-MM-DD HH:mm:ss");
    setDraftInvoices((drafts) =>
      drafts.map((d) =>
        d.id === draft.id
          ? {
              ...d,
              expiresAt: newExpiry,
              updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            }
          : d
      )
    );
    message.success(`Gia hạn hóa đơn tạm ${draft.draftNumber}`);
  };

  const columns = [
    {
      title: "Mã hóa đơn tạm",
      dataIndex: "draftNumber",
      key: "draftNumber",
      width: 140,
      render: (text: string) => (
        <Text strong style={{ color: "#1890ff" }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Khách hàng",
      key: "customer",
      render: (_, record: DraftInvoice) => (
        <div>
          {record.customerName ? (
            <>
              <div style={{ fontWeight: 500 }}>{record.customerName}</div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {record.customerPhone}
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
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string, record: DraftInvoice) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: "Thời gian còn lại",
      dataIndex: "expiresAt",
      key: "expiresAt",
      width: 120,
      render: (expiresAt: string, record: DraftInvoice) => (
        <div>
          <Text
            style={{
              color: isExpired(expiresAt)
                ? "#ff4d4f"
                : dayjs(expiresAt).diff(dayjs(), "hour") < 2
                ? "#faad14"
                : "#52c41a",
            }}
          >
            {getTimeRemaining(expiresAt)}
          </Text>
          <div style={{ fontSize: "11px", color: "#999" }}>
            {dayjs(expiresAt).format("DD/MM HH:mm")}
          </div>
        </div>
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
      render: (_, record: DraftInvoice) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              disabled={record.status === "expired"}
            />
          </Tooltip>
          {record.status === "draft" && (
            <Tooltip title="Hoàn thành">
              <Button
                type="text"
                icon={<CheckCircleOutlined />}
                onClick={() => handleComplete(record)}
              />
            </Tooltip>
          )}
          {isExpired(record.expiresAt) && (
            <Tooltip title="Gia hạn">
              <Button
                type="text"
                icon={<ClockCircleOutlined />}
                onClick={() => handleExtendExpiry(record)}
              />
            </Tooltip>
          )}
          <Popconfirm
            title="Xóa hóa đơn tạm"
            description="Bạn có chắc chắn muốn xóa hóa đơn tạm này?"
            onConfirm={() => handleDelete(record)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Title level={2} style={{ margin: 0, color: "rgba(0, 0, 0, 0.85)" }}>
          Hóa đơn tạm
        </Title>
        <Text type="secondary" style={{ fontSize: "16px" }}>
          Quản lý hóa đơn chưa hoàn thành
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng hóa đơn tạm"
              value={draftInvoices.length}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đang chờ xử lý"
              value={
                draftInvoices.filter(
                  (d) => d.status === "draft" || d.status === "pending_payment"
                ).length
              }
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đã hết hạn"
              value={draftInvoices.filter((d) => d.status === "expired").length}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng giá trị"
              value={draftInvoices.reduce((sum, d) => sum + d.totalAmount, 0)}
              prefix="₫"
              precision={0}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ borderRadius: "12px", marginBottom: "24px" }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Tìm kiếm hóa đơn tạm, khách hàng..."
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
              <Option value="draft">Nháp</Option>
              <Option value="pending_payment">Chờ thanh toán</Option>
              <Option value="expired">Hết hạn</Option>
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
            <Button type="primary" icon={<SaveOutlined />}>
              Tạo hóa đơn tạm
            </Button>
          </Col>
        </Row>
      </Card>

      <Card style={{ borderRadius: "12px" }}>
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
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Draft Invoice Detail Modal */}
      <Modal
        title={
          <Space>
            <FileTextOutlined />
            <span>Chi tiết hóa đơn tạm {selectedDraft?.draftNumber}</span>
          </Space>
        }
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button
            key="edit"
            icon={<EditOutlined />}
            onClick={() => selectedDraft && handleEdit(selectedDraft)}
          >
            Chỉnh sửa
          </Button>,
          <Button
            key="complete"
            icon={<CheckCircleOutlined />}
            onClick={() => selectedDraft && handleComplete(selectedDraft)}
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
              <Descriptions.Item label="Mã hóa đơn tạm" span={1}>
                <Text strong>{selectedDraft.draftNumber}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={1}>
                <Tag
                  color={getStatusColor(selectedDraft.status)}
                  icon={getStatusIcon(selectedDraft.status)}
                >
                  {getStatusText(selectedDraft.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng" span={1}>
                {selectedDraft.customerName || "Khách lẻ"}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại" span={1}>
                {selectedDraft.customerPhone || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Nhân viên" span={1}>
                {selectedDraft.staffName}
              </Descriptions.Item>
              <Descriptions.Item label="Chi nhánh" span={1}>
                {selectedDraft.branchName}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo" span={1}>
                {dayjs(selectedDraft.createdAt).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
              <Descriptions.Item label="Hết hạn" span={1}>
                <Text
                  style={{
                    color: isExpired(selectedDraft.expiresAt)
                      ? "#ff4d4f"
                      : "#52c41a",
                  }}
                >
                  {dayjs(selectedDraft.expiresAt).format("DD/MM/YYYY HH:mm")}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền" span={2}>
                <Text strong style={{ fontSize: "16px", color: "#52c41a" }}>
                  ₫{selectedDraft.totalAmount.toLocaleString()}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            {selectedDraft.notes && (
              <>
                <Divider />
                <div>
                  <Text strong>Ghi chú: </Text>
                  <Text>{selectedDraft.notes}</Text>
                </div>
              </>
            )}

            <Divider />

            <Title level={5}>Chi tiết sản phẩm</Title>
            <Table
              dataSource={selectedDraft.items}
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
                  title: "SL",
                  dataIndex: "quantity",
                  key: "quantity",
                  width: 60,
                },
                {
                  title: "Đơn giá",
                  dataIndex: "unitPrice",
                  key: "unitPrice",
                  width: 100,
                  render: (price: number) => `₫${price.toLocaleString()}`,
                },
                {
                  title: "Thành tiền",
                  dataIndex: "totalPrice",
                  key: "totalPrice",
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
    </div>
  );
};

export default DraftInvoicesPage;
