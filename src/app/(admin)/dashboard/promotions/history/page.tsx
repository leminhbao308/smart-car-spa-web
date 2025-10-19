"use client";
import React, { useState, useEffect, useMemo } from "react";
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
  Spin,
  Alert,
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
import { usePromotionUsageHistory } from "@/lib/api/hooks";
import dayjs, { Dayjs } from "dayjs";

const { Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface PromotionHistory {
  promotion_name: string;
  promotion_code: string;
  customer_name: string;
  customer_phone: string;
  order_id: string;
  order_amount: number;
  discount_amount: number;
  final_amount: number;
  used_date: string;
  branch_name: string;
  status: "FULFILLED" | "RETURNED" | "CANCELLED";
  notes?: string;
}

const PromotionHistoryPage = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );
  const [branchFilter, setBranchFilter] = useState<string | undefined>(
    undefined
  );

  // Build query params
  const queryParams = useMemo(() => {
    const params: Record<string, unknown> = {
      page,
      size: pageSize,
      sort: "usedDate",
      direction: "DESC",
    };

    if (statusFilter && statusFilter !== "all") {
      params.status = statusFilter;
    }

    if (branchFilter && branchFilter !== "all") {
      params.branch_name = branchFilter;
    }

    if (dateRange) {
      params.from_date = dateRange[0].toISOString();
      params.to_date = dateRange[1].toISOString();
    }

    return params;
  }, [page, pageSize, statusFilter, branchFilter, dateRange]);

  // Fetch data using hook
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = usePromotionUsageHistory(queryParams);

  const data = response?.content || [];
  const totalElements = response?.totalElements || 0;

  const columns = [
    {
      title: "Thông tin khuyến mãi",
      dataIndex: "promotion_name",
      key: "promotion_name",
      width: 250,
      render: (text: string, record: PromotionHistory) => (
        <div>
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 4 }}
          >
            <GiftOutlined
              style={{ fontSize: 16, marginRight: 8, color: "#1890ff" }}
            />
            <Text
              strong
              style={{ fontSize: 14 }}
            >
              {text}
            </Text>
          </div>
          <Text
            type="secondary"
            style={{ fontSize: 12 }}
          >
            Mã: {record.promotion_code}
          </Text>
        </div>
      ),
    },
    {
      title: "Khách hàng",
      dataIndex: "customer_name",
      key: "customer_name",
      width: 200,
      render: (text: string, record: PromotionHistory) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <UserOutlined style={{ marginRight: 4, color: "#1890ff" }} />
            <Text
              strong
              style={{ fontSize: 14 }}
            >
              {text}
            </Text>
          </div>
          <Text
            type="secondary"
            style={{ fontSize: 12 }}
          >
            {record.customer_phone}
          </Text>
        </div>
      ),
    },
    {
      title: "Đơn hàng",
      dataIndex: "order_id",
      key: "order_id",
      width: 150,
      render: (text: string, record: PromotionHistory) => (
        <div>
          <Text
            strong
            style={{ fontSize: 14, color: "#52c41a" }}
          >
            {text.substring(0, 8)}...
          </Text>
          <div style={{ marginTop: 4 }}>
            <Text style={{ fontSize: 12 }}>
              Tổng: {formatCurrency(record.order_amount)}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Giảm giá",
      dataIndex: "discount_amount",
      key: "discount_amount",
      width: 120,
      render: (amount: number, record: PromotionHistory) => (
        <div style={{ textAlign: "center" }}>
          <Text
            strong
            style={{ fontSize: 14, color: "#f5222d" }}
          >
            -{formatCurrency(amount)}
          </Text>
          <div style={{ marginTop: 4 }}>
            <Text style={{ fontSize: 12, color: "#52c41a" }}>
              Còn: {formatCurrency(record.final_amount)}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Thời gian sử dụng",
      dataIndex: "used_date",
      key: "used_date",
      width: 180,
      render: (date: string) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <CalendarOutlined style={{ marginRight: 4, color: "#fa8c16" }} />
            <Text style={{ fontSize: 12 }}>
              {formatDate(date.split("T")[0])}
            </Text>
          </div>
          <Text
            type="secondary"
            style={{ fontSize: 11 }}
          >
            {new Date(date).toLocaleTimeString()}
          </Text>
        </div>
      ),
    },
    {
      title: "Chi nhánh",
      dataIndex: "branch_name",
      key: "branch_name",
      width: 120,
      render: (branch: string) => <Tag color="blue">{branch}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: "FULFILLED" | "RETURNED" | "CANCELLED") => {
        const statusConfig = {
          FULFILLED: { color: "green", text: "Hoàn thành" },
          RETURNED: { color: "red", text: "Đã trả hàng" },
          CANCELLED: { color: "orange", text: "Đã hủy" },
        };
        const config = statusConfig[status];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  ];

  const handleFilter = () => {
    // Trigger refetch with updated params
    setPage(0); // Reset to first page
    refetch();
  };

  const handleReset = () => {
    setDateRange(null);
    setStatusFilter(undefined);
    setBranchFilter(undefined);
    setPage(0);
    refetch();
  };

  // Thống kê tổng quan (tính từ data hiện tại)
  const totalUsage = data.length;
  const successUsage = data.filter(
    (item) => item.status === "FULFILLED"
  ).length;
  const returnedUsage = data.filter(
    (item) => item.status === "RETURNED"
  ).length;
  const totalDiscount = data.reduce(
    (sum, item) => sum + item.discount_amount,
    0
  );
  const totalRevenue = data.reduce((sum, item) => sum + item.final_amount, 0);

  return (
    <div>
      {/* Bộ lọc */}
      <Card style={{ marginBottom: 24 }}>
        <Row
          gutter={[16, 16]}
          align="middle"
        >
          <Col
            xs={24}
            sm={8}
            lg={6}
          >
            <div>
              <Text
                strong
                style={{ marginBottom: 8, display: "block" }}
              >
                Khoảng thời gian:
              </Text>
              <RangePicker
                style={{ width: "100%" }}
                value={dateRange}
                onChange={(dates) =>
                  setDateRange(dates as [Dayjs, Dayjs] | null)
                }
                placeholder={["Từ ngày", "Đến ngày"]}
              />
            </div>
          </Col>
          <Col
            xs={24}
            sm={8}
            lg={6}
          >
            <div>
              <Text
                strong
                style={{ marginBottom: 8, display: "block" }}
              >
                Trạng thái:
              </Text>
              <Select
                style={{ width: "100%" }}
                value={statusFilter || "all"}
                onChange={(value) =>
                  setStatusFilter(value === "all" ? undefined : value)
                }
              >
                <Option value="all">Tất cả</Option>
                <Option value="FULFILLED">Hoàn thành</Option>
                <Option value="RETURNED">Đã trả hàng</Option>
                <Option value="CANCELLED">Đã hủy</Option>
              </Select>
            </div>
          </Col>
          <Col
            xs={24}
            sm={8}
            lg={6}
          >
            <div>
              <Text
                strong
                style={{ marginBottom: 8, display: "block" }}
              >
                Chi nhánh:
              </Text>
              <Select
                style={{ width: "100%" }}
                value={branchFilter || "all"}
                onChange={(value) =>
                  setBranchFilter(value === "all" ? undefined : value)
                }
              >
                <Option value="all">Tất cả</Option>
              </Select>
            </div>
          </Col>
          <Col
            xs={24}
            sm={24}
            lg={6}
          >
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
              title="Tổng lượt sử dụng"
              value={totalUsage}
              valueStyle={{ color: "#1890ff" }}
              prefix={<HistoryOutlined />}
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
              title="Thành công"
              value={successUsage}
              valueStyle={{ color: "#52c41a" }}
              prefix={<UserOutlined />}
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
              title="Tổng giảm giá"
              value={totalDiscount}
              valueStyle={{ color: "#f5222d" }}
              prefix={<GiftOutlined />}
              formatter={(value) => formatCurrency(Number(value))}
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
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
        <Spin spinning={isLoading}>
          {error && (
            <Alert
              message="Lỗi tải dữ liệu"
              description="Không thể tải lịch sử sử dụng khuyến mãi. Vui lòng thử lại."
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
              action={
                <Button
                  size="small"
                  onClick={() => refetch()}
                >
                  Thử lại
                </Button>
              }
            />
          )}
          <AdminTable
            dataSource={data}
            columns={columns}
            actions={[]}
            showAddButton={false}
            searchable={true}
            searchPlaceholder="Tìm kiếm theo tên khách hàng, mã khuyến mãi, đơn hàng..."
            searchFields={[
              "customer_name",
              "customer_phone",
              "promotion_code",
              "promotion_name",
              "order_id",
            ]}
            pagination={{
              current: page + 1,
              pageSize: pageSize,
              total: totalElements,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total: number, range: [number, number]) =>
                `${range[0]}-${range[1]} của ${total} lượt sử dụng`,
              onChange: (newPage: number, newPageSize: number) => {
                setPage(newPage - 1);
                if (newPageSize !== pageSize) {
                  setPageSize(newPageSize);
                }
              },
            }}
          />
        </Spin>
      </Card>
    </div>
  );
};

export default PromotionHistoryPage;
