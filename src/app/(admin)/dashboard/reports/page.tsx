"use client";
import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  DatePicker,
  Button,
  Space,
  Typography,
  Spin,
  message,
  Table,
  Tag,
} from "antd";
import {
  DollarOutlined,
  ShoppingOutlined,
  PercentageOutlined,
  DownloadOutlined,
  BarChartOutlined,
  InboxOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { reportService, SalesStats, InventoryStats } from "@/lib/api";
import formatCurrency from "@/components/utils/helper/currency.format.helper";
import dayjs, { Dayjs } from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const ReportsPage = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(30, "days"),
    dayjs(),
  ]);
  const [salesStats, setSalesStats] = useState<SalesStats | null>(null);
  const [inventoryStats, setInventoryStats] = useState<InventoryStats | null>(
    null
  );

  useEffect(() => {
    fetchReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);

      const fromDate = dateRange[0].format("YYYY-MM-DD");
      const toDate = dateRange[1].format("YYYY-MM-DD");

      const [salesRes, inventoryRes] = await Promise.all([
        reportService.getSalesStats(fromDate, toDate),
        reportService.getInventoryStats(),
      ]);

      console.log("Sales Response:", salesRes);
      console.log("Inventory Response:", inventoryRes);

      if (salesRes.success && salesRes.data) {
        console.log("Setting sales stats:", salesRes.data);
        setSalesStats(salesRes.data);
      }

      if (inventoryRes.success && inventoryRes.data) {
        console.log("Setting inventory stats:", inventoryRes.data);
        setInventoryStats(inventoryRes.data);
      }
    } catch (error: any) {
      console.error("Error fetching report data:", error);
      message.error(error.message || "Không thể tải dữ liệu báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (dates: any) => {
    if (dates?.[0] && dates?.[1]) {
      setDateRange([dates[0], dates[1]]);
    }
  };

  const handleExportSales = async () => {
    try {
      message.loading({ content: "Đang xuất báo cáo...", key: "export" });

      const fromDate = dateRange[0].format("YYYY-MM-DD");
      const toDate = dateRange[1].format("YYYY-MM-DD");

      const blob = await reportService.exportSalesReport(fromDate, toDate);

      // Create download link
      const url = globalThis.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sales-report-${fromDate}-${toDate}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      globalThis.URL.revokeObjectURL(url);

      message.success({ content: "Xuất báo cáo thành công!", key: "export" });
    } catch (error: any) {
      console.error("Error exporting sales report:", error);
      message.error({
        content: "Không thể xuất báo cáo",
        key: "export",
      });
    }
  };

  const handleExportInventory = async () => {
    try {
      message.loading({ content: "Đang xuất báo cáo...", key: "export" });

      const blob = await reportService.exportInventoryReport();

      // Create download link
      const url = globalThis.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `inventory-report-${dayjs().format("YYYY-MM-DD")}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      globalThis.URL.revokeObjectURL(url);

      message.success({ content: "Xuất báo cáo thành công!", key: "export" });
    } catch (error: any) {
      console.error("Error exporting inventory report:", error);
      message.error({
        content: "Không thể xuất báo cáo",
        key: "export",
      });
    }
  };

  const lowStockColumns = [
    {
      title: "Loại",
      dataIndex: "transactionType",
      key: "transactionType",
      width: 100,
      render: (type: string) => (
        <Tag color={type === "INBOUND" ? "green" : "red"}>
          {type === "INBOUND" ? "Nhập kho" : "Xuất kho"}
        </Tag>
      ),
    },
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: "SKU",
      dataIndex: "productSku",
      key: "productSku",
      width: 120,
    },
    {
      title: "Chi nhánh",
      dataIndex: "branchName",
      key: "branchName",
      width: 150,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      render: (qty: number) => <Text>{qty}</Text>,
    },
    {
      title: "Đơn giá",
      dataIndex: "unitPrice",
      key: "unitPrice",
      width: 120,
      render: (price: number) => <Text>{formatCurrency(price)}</Text>,
    },
    {
      title: "Tổng giá trị",
      dataIndex: "totalValue",
      key: "totalValue",
      width: 150,
      render: (value: number) => <Text strong>{formatCurrency(value)}</Text>,
    },
    {
      title: "Ngày giao dịch",
      dataIndex: "transactionDate",
      key: "transactionDate",
      width: 150,
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
  ];

  // Debug log
  console.log("Current salesStats:", salesStats);
  console.log("Current inventoryStats:", inventoryStats);

  return (
    <>
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Header */}
          <Row
            justify="space-between"
            align="middle"
            style={{ marginBottom: 24 }}
          >
            <Col>
              <Space>
                <BarChartOutlined style={{ color: "#1890ff", fontSize: 24 }} />
                <Title
                  level={2}
                  style={{ margin: 0 }}
                >
                  Báo cáo & Thống kê
                </Title>
              </Space>
            </Col>
            <Col>
              <Space>
                <RangePicker
                  value={dateRange}
                  onChange={handleDateChange}
                  format="DD/MM/YYYY"
                />
                <Button
                  type="primary"
                  onClick={fetchReportData}
                >
                  Làm mới
                </Button>
              </Space>
            </Col>
          </Row>

          {/* Sales Statistics */}
          <Title
            level={3}
            style={{ marginBottom: 16 }}
          >
            Thống kê bán hàng
          </Title>

          {/* Sales Summary Cards */}
          <Row
            gutter={[16, 16]}
            style={{ marginBottom: 24 }}
          >
            <Col
              xs={24}
              sm={12}
              lg={6}
            >
              <Card>
                <Statistic
                  title="Tổng doanh thu"
                  value={salesStats?.totalRevenue || 0}
                  prefix={<DollarOutlined />}
                  formatter={formatCurrency}
                  valueStyle={{ color: "#3f8600" }}
                />
              </Card>
            </Col>
            <Col
              xs={24}
              sm={12}
              lg={6}
            >
              <Card>
                <Statistic
                  title="Tổng lợi nhuận"
                  value={salesStats?.totalProfit || 0}
                  prefix={<DollarOutlined />}
                  formatter={formatCurrency}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col
              xs={24}
              sm={12}
              lg={6}
            >
              <Card>
                <Statistic
                  title="Số đơn hàng"
                  value={salesStats?.totalOrders || 0}
                  prefix={<ShoppingOutlined />}
                />
              </Card>
            </Col>
            <Col
              xs={24}
              sm={12}
              lg={6}
            >
              <Card>
                <Statistic
                  title="Tỷ suất lợi nhuận"
                  value={salesStats?.profitMargin || 0}
                  suffix="%"
                  prefix={<PercentageOutlined />}
                  precision={2}
                  valueStyle={{ color: "#cf1322" }}
                />
              </Card>
            </Col>
          </Row>

          {/* Sales Chart */}
          <Row
            gutter={[16, 16]}
            style={{ marginBottom: 24 }}
          >
            <Col span={24}>
              <Card
                title="Biểu đồ doanh thu theo ngày"
                extra={
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleExportSales}
                  >
                    Xuất Excel
                  </Button>
                }
              >
                <ResponsiveContainer
                  width="100%"
                  height={400}
                >
                  <LineChart data={salesStats?.dailySales || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => formatCurrency(value as number)}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8884d8"
                      name="Doanh thu"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#82ca9d"
                      name="Lợi nhuận"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          {/* Inventory Statistics */}
          <Title
            level={3}
            style={{ marginBottom: 16, marginTop: 32 }}
          >
            Thống kê kho hàng
          </Title>

          {/* Inventory Summary Cards */}
          <Row
            gutter={[16, 16]}
            style={{ marginBottom: 24 }}
          >
            <Col
              xs={24}
              sm={12}
              lg={6}
            >
              <Card>
                <Statistic
                  title="Tổng sản phẩm"
                  value={inventoryStats?.totalProducts || 0}
                  prefix={<InboxOutlined />}
                />
              </Card>
            </Col>
            <Col
              xs={24}
              sm={12}
              lg={6}
            >
              <Card>
                <Statistic
                  title="Tổng số lượng"
                  value={inventoryStats?.totalQuantity || 0}
                  prefix={<InboxOutlined />}
                />
              </Card>
            </Col>
            <Col
              xs={24}
              sm={12}
              lg={6}
            >
              <Card>
                <Statistic
                  title="Giá trị kho"
                  value={inventoryStats?.totalValue || 0}
                  prefix={<DollarOutlined />}
                  formatter={formatCurrency}
                  valueStyle={{ color: "#3f8600" }}
                />
              </Card>
            </Col>
            <Col
              xs={24}
              sm={12}
              lg={6}
            >
              <Card>
                <Statistic
                  title="Sản phẩm sắp hết"
                  value={inventoryStats?.lowStockCount || 0}
                  prefix={<WarningOutlined />}
                  valueStyle={{ color: "#cf1322" }}
                />
              </Card>
            </Col>
          </Row>

          {/* Inventory Transactions Table */}
          <Row
            gutter={[16, 16]}
            style={{ marginBottom: 24 }}
          >
            <Col span={24}>
              <Card
                title="Lịch sử nhập/xuất kho"
                extra={
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleExportInventory}
                  >
                    Xuất Excel
                  </Button>
                }
              >
                <Table
                  dataSource={inventoryStats?.recentTransactions || []}
                  columns={lowStockColumns}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 1200 }}
                />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default ReportsPage;
