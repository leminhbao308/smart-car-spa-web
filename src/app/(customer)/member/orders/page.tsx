"use client";

import React, { useState } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Select,
  DatePicker,
  Empty,
  Tooltip,
} from "antd";
import {
  EyeOutlined,
  CloseCircleOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/api";
import { useCustomerOrders } from "@/lib/api/hooks/useCustomerShop";
import type {
  CustomerOrder,
  CustomerOrderStatus,
} from "@/lib/api/types/customer-order.types";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

/**
 * Status color mapping
 */
const statusColorMap: Record<CustomerOrderStatus, string> = {
  PENDING: "orange",
  PAID: "blue",
  PROCESSING: "cyan",
  COMPLETED: "green",
  CANCELLED: "red",
  RETURNED: "purple",
};

/**
 * Status text mapping
 */
const statusTextMap: Record<CustomerOrderStatus, string> = {
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  PROCESSING: "Đang xử lý",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
  RETURNED: "Đã trả hàng",
};

/**
 * My Orders Page
 */
export default function MyOrdersPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Filters
  const [statusFilter, setStatusFilter] = useState<
    CustomerOrderStatus | undefined
  >();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  // Fetch orders
  const { orders, loading, totalElements, totalPages } = useCustomerOrders(
    user?.user_id || null,
    {
      status: statusFilter,
      page: currentPage,
      size: pageSize,
    }
  );

  // Filter orders by date range (client-side for now)
  const filteredOrders = React.useMemo(() => {
    if (!dateRange) return orders;

    return orders.filter((order) => {
      const orderDate = dayjs(order.orderDate);
      return (
        orderDate.isAfter(dateRange[0]) && orderDate.isBefore(dateRange[1])
      );
    });
  }, [orders, dateRange]);

  // Table columns
  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (orderNumber: string, record: CustomerOrder) => (
        <Button
          type="link"
          onClick={() => router.push(`/member/orders/${record.id}`)}
        >
          {orderNumber}
        </Button>
      ),
    },
    {
      title: "Ngày đặt",
      dataIndex: "orderDate",
      key: "orderDate",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Sản phẩm",
      key: "products",
      render: (_: unknown, record: CustomerOrder) => (
        <Space
          direction="vertical"
          size={0}
        >
          {record.lines.slice(0, 2).map((line) => (
            <Text
              key={line.id}
              ellipsis
              style={{ maxWidth: 200 }}
            >
              {line?.product?.product_name} x{line?.quantity}
            </Text>
          ))}
          {record.lines.length > 2 && (
            <Text
              type="secondary"
              style={{ fontSize: "12px" }}
            >
              +{record.lines.length - 2} sản phẩm khác
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "finalAmount",
      key: "finalAmount",
      align: "right" as const,
      render: (amount: number) => (
        <Text
          strong
          style={{ color: "#ff4d4f" }}
        >
          {amount.toLocaleString("vi-VN")}đ
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: CustomerOrderStatus) => (
        <Tag color={statusColorMap[status]}>{statusTextMap[status]}</Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "center" as const,
      render: (_: unknown, record: CustomerOrder) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => router.push(`/member/orders/${record.id}`)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleCancelOrder = (orderId: string) => {
    // TODO: Show cancel modal
    console.log("Cancel order:", orderId);
  };

  const handleRequestReturn = (orderId: string) => {
    // TODO: Navigate to return request page
    console.log("Request return:", orderId);
  };

  const handleResetFilters = () => {
    setStatusFilter(undefined);
    setDateRange(null);
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Đơn hàng của tôi</Title>
        <Text type="secondary">
          Quản lý và theo dõi tất cả đơn hàng của bạn
        </Text>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Space wrap>
          <Select
            placeholder="Tất cả trạng thái"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 200 }}
            allowClear
          >
            <Option value="PENDING">Chờ thanh toán</Option>
            <Option value="PAID">Đã thanh toán</Option>
            <Option value="PROCESSING">Đang xử lý</Option>
            <Option value="COMPLETED">Hoàn thành</Option>
            <Option value="CANCELLED">Đã hủy</Option>
            <Option value="RETURNED">Đã trả hàng</Option>
          </Select>

          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            format="DD/MM/YYYY"
            placeholder={["Từ ngày", "Đến ngày"]}
          />

          <Button onClick={handleResetFilters}>Xóa bộ lọc</Button>
        </Space>
      </Card>

      {/* Orders Table */}
      {filteredOrders.length === 0 && !loading ? (
        <Card>
          <Empty
            description="Bạn chưa có đơn hàng nào"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button
              type="primary"
              onClick={() => router.push("/products")}
            >
              Bắt đầu mua sắm
            </Button>
          </Empty>
        </Card>
      ) : (
        <Card>
          <Table
            dataSource={filteredOrders}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{
              current: currentPage + 1,
              pageSize,
              total: totalElements,
              onChange: (page) => setCurrentPage(page - 1),
              showSizeChanger: false,
              showTotal: (total) => `Tổng ${total} đơn hàng`,
            }}
          />
        </Card>
      )}
    </div>
  );
}
