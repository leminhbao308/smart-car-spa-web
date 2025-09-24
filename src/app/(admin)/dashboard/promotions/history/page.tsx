"use client";
import React, { useState } from "react";
import {
  Tag,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Space,
  DatePicker,
  Select,
  Button,
} from "antd";
import {
  HistoryOutlined,
  UserOutlined,
  GiftOutlined,
  CalendarOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import AdminTable from "@/components/ui/Table/AdminTable";
import { formatDate } from "@/components/utils/helper/date.format.helper";
import formatCurrency from "@/components/utils/helper/currency.format.helper";

const { Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Mock data for promotion history
interface PromotionHistory {
  id: number;
  promotionName: string;
  promotionCode: string;
  customerName: string;
  customerPhone: string;
  orderId: string;
  orderAmount: number;
  discountAmount: number;
  finalAmount: number;
  usedDate: string;
  branch: string;
  status: "success" | "failed" | "cancelled";
  notes?: string;
}

const promotionHistoryData: PromotionHistory[] = [
  {
    id: 1,
    promotionName: "Giảm giá 20% cho khách hàng mới",
    promotionCode: "NEW_CUSTOMER_20",
    customerName: "Nguyễn Văn A",
    customerPhone: "0123456789",
    orderId: "ORD-2024-001",
    orderAmount: 800000,
    discountAmount: 160000,
    finalAmount: 640000,
    usedDate: "2024-06-15 10:30:00",
    branch: "Chi nhánh 1",
    status: "success",
    notes: "Khách hàng mới lần đầu sử dụng",
  },
  {
    id: 2,
    promotionName: "Combo rửa xe + đánh bóng giảm 15%",
    promotionCode: "COMBO_WASH_POLISH",
    customerName: "Trần Thị B",
    customerPhone: "0987654321",
    orderId: "ORD-2024-002",
    orderAmount: 1200000,
    discountAmount: 180000,
    finalAmount: 1020000,
    usedDate: "2024-06-15 14:20:00",
    branch: "Chi nhánh 2",
    status: "success",
  },
  {
    id: 3,
    promotionName: "Tặng kèm sản phẩm chăm sóc",
    promotionCode: "FREE_CARE_PRODUCT",
    customerName: "Lê Văn C",
    customerPhone: "0369852147",
    orderId: "ORD-2024-003",
    orderAmount: 1500000,
    discountAmount: 0,
    finalAmount: 1500000,
    usedDate: "2024-06-14 16:45:00",
    branch: "Chi nhánh 1",
    status: "success",
    notes: "Tặng kèm 1 chai wax cao cấp",
  },
  {
    id: 4,
    promotionName: "Giảm 100,000 ₫ cho đơn hàng lớn",
    promotionCode: "BIG_ORDER_100K",
    customerName: "Phạm Thị D",
    customerPhone: "0741258963",
    orderId: "ORD-2024-004",
    orderAmount: 2500000,
    discountAmount: 100000,
    finalAmount: 2400000,
    usedDate: "2024-06-14 11:15:00",
    branch: "Chi nhánh 3",
    status: "success",
  },
  {
    id: 5,
    promotionName: "Khuyến mãi cuối tuần",
    promotionCode: "WEEKEND_SPECIAL",
    customerName: "Hoàng Văn E",
    customerPhone: "0852369741",
    orderId: "ORD-2024-005",
    orderAmount: 500000,
    discountAmount: 50000,
    finalAmount: 450000,
    usedDate: "2024-06-13 09:30:00",
    branch: "Chi nhánh 2",
    status: "failed",
    notes: "Khuyến mãi đã hết hạn",
  },
];

const PromotionHistoryPage = () => {
  const [data, setData] = useState<PromotionHistory[]>(promotionHistoryData);
  const [filteredData, setFilteredData] = useState<PromotionHistory[]>(promotionHistoryData);
  const [dateRange, setDateRange] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [branchFilter, setBranchFilter] = useState<string>("all");

  const columns = [
    {
      title: "Thông tin khuyến mãi",
      dataIndex: "promotionName",
      key: "promotionName",
      width: 250,
      render: (text: string, record: PromotionHistory) => (
        <div>
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 4 }}
          >
            <GiftOutlined style={{ fontSize: 16, marginRight: 8, color: "#1890ff" }} />
            <Text strong style={{ fontSize: 14 }}>
              {text}
            </Text>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Mã: {record.promotionCode}
          </Text>
        </div>
      ),
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
      width: 200,
      render: (text: string, record: PromotionHistory) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <UserOutlined style={{ marginRight: 4, color: "#1890ff" }} />
            <Text strong style={{ fontSize: 14 }}>
              {text}
            </Text>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.customerPhone}
          </Text>
        </div>
      ),
    },
    {
      title: "Đơn hàng",
      dataIndex: "orderId",
      key: "orderId",
      width: 150,
      render: (text: string, record: PromotionHistory) => (
        <div>
          <Text strong style={{ fontSize: 14, color: "#52c41a" }}>
            {text}
          </Text>
          <div style={{ marginTop: 4 }}>
            <Text style={{ fontSize: 12 }}>
              Tổng: {formatCurrency(record.orderAmount)}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Giảm giá",
      dataIndex: "discountAmount",
      key: "discountAmount",
      width: 120,
      render: (amount: number, record: PromotionHistory) => (
        <div style={{ textAlign: "center" }}>
          <Text strong style={{ fontSize: 14, color: "#f5222d" }}>
            -{formatCurrency(amount)}
          </Text>
          <div style={{ marginTop: 4 }}>
            <Text style={{ fontSize: 12, color: "#52c41a" }}>
              Còn: {formatCurrency(record.finalAmount)}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Thời gian sử dụng",
      dataIndex: "usedDate",
      key: "usedDate",
      width: 180,
      render: (date: string) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <CalendarOutlined style={{ marginRight: 4, color: "#fa8c16" }} />
            <Text style={{ fontSize: 12 }}>
              {formatDate(date.split(' ')[0])}
            </Text>
          </div>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {date.split(' ')[1]}
          </Text>
        </div>
      ),
    },
    {
      title: "Chi nhánh",
      dataIndex: "branch",
      key: "branch",
      width: 120,
      render: (branch: string) => (
        <Tag color="blue">{branch}</Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => {
        const statusConfig = {
          success: { color: "green", text: "Thành công" },
          failed: { color: "red", text: "Thất bại" },
          cancelled: { color: "orange", text: "Đã hủy" },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  ];

  const handleFilter = () => {
    let filtered = [...data];

    // Filter by date range
    if (dateRange && dateRange.length === 2) {
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');
      filtered = filtered.filter(item => {
        const itemDate = item.usedDate.split(' ')[0];
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Filter by branch
    if (branchFilter !== "all") {
      filtered = filtered.filter(item => item.branch === branchFilter);
    }

    setFilteredData(filtered);
  };

  const handleReset = () => {
    setDateRange(null);
    setStatusFilter("all");
    setBranchFilter("all");
    setFilteredData(data);
  };

  // Thống kê tổng quan
  const totalUsage = filteredData.length;
  const successUsage = filteredData.filter(item => item.status === "success").length;
  const failedUsage = filteredData.filter(item => item.status === "failed").length;
  const totalDiscount = filteredData.reduce((sum, item) => sum + item.discountAmount, 0);
  const totalRevenue = filteredData.reduce((sum, item) => sum + item.finalAmount, 0);

  return (
    <div>
      {/* Bộ lọc */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} lg={6}>
            <div>
              <Text strong style={{ marginBottom: 8, display: "block" }}>
                Khoảng thời gian:
              </Text>
              <RangePicker
                style={{ width: "100%" }}
                value={dateRange}
                onChange={setDateRange}
                placeholder={["Từ ngày", "Đến ngày"]}
              />
            </div>
          </Col>
          <Col xs={24} sm={8} lg={6}>
            <div>
              <Text strong style={{ marginBottom: 8, display: "block" }}>
                Trạng thái:
              </Text>
              <Select
                style={{ width: "100%" }}
                value={statusFilter}
                onChange={setStatusFilter}
              >
                <Option value="all">Tất cả</Option>
                <Option value="success">Thành công</Option>
                <Option value="failed">Thất bại</Option>
                <Option value="cancelled">Đã hủy</Option>
              </Select>
            </div>
          </Col>
          <Col xs={24} sm={8} lg={6}>
            <div>
              <Text strong style={{ marginBottom: 8, display: "block" }}>
                Chi nhánh:
              </Text>
              <Select
                style={{ width: "100%" }}
                value={branchFilter}
                onChange={setBranchFilter}
              >
                <Option value="all">Tất cả</Option>
                <Option value="Chi nhánh 1">Chi nhánh 1</Option>
                <Option value="Chi nhánh 2">Chi nhánh 2</Option>
                <Option value="Chi nhánh 3">Chi nhánh 3</Option>
              </Select>
            </div>
          </Col>
          <Col xs={24} sm={24} lg={6}>
            <Space>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleFilter}
              >
                Lọc
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReset}
              >
                Reset
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Thống kê tổng quan */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng lượt sử dụng"
              value={totalUsage}
              valueStyle={{ color: "#1890ff" }}
              prefix={<HistoryOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Thành công"
              value={successUsage}
              valueStyle={{ color: "#52c41a" }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng giảm giá"
              value={totalDiscount}
              valueStyle={{ color: "#f5222d" }}
              prefix={<GiftOutlined />}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Doanh thu thực"
              value={totalRevenue}
              valueStyle={{ color: "#722ed1" }}
              prefix={<CalendarOutlined />}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table */}
      <Card
        title={
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 8
          }}>
            <HistoryOutlined style={{ color: "#1890ff", fontSize: 18 }} />
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              Lịch sử sử dụng khuyến mãi
            </span>
          </div>
        }
        style={{
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          borderRadius: 8,
        }}
      >
        <AdminTable
          dataSource={filteredData}
          columns={columns}
          actions={[]}
          showAddButton={false}
          searchable={true}
          searchPlaceholder="Tìm kiếm theo tên khách hàng, mã khuyến mãi, đơn hàng..."
          searchFields={["customerName", "customerPhone", "promotionCode", "promotionName", "orderId"]}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total: number, range: [number, number]) =>
              `${range[0]}-${range[1]} của ${total} lượt sử dụng`,
          }}
        />
      </Card>
    </div>
  );
};

export default PromotionHistoryPage;
