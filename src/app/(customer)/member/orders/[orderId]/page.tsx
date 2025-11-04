"use client";

import React from "react";
import {
  Card,
  Button,
  Space,
  Typography,
  Tag,
  Divider,
  Descriptions,
  Table,
  Timeline,
  Spin,
  Alert,
  Breadcrumb,
} from "antd";
import {
  ArrowLeftOutlined,
  PrinterOutlined,
  HomeOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import {
  useOrderDetail,
} from "@/lib/api/hooks/useCustomerShop";
import type {
  CustomerOrderStatus,
  CustomerOrderLine,
} from "@/lib/api/types/customer-order.types";
import dayjs from "dayjs";

const { Title, Text } = Typography;

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
 * Order Detail Page
 */
export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  // Fetch order details
  const { order, loading } = useOrderDetail(orderId);

  // Handle print
  const handlePrint = () => {
    globalThis.print();
  };

  // Loading state
  if (loading) {
    return (
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
    );
  }

  // Order not found
  if (!order) {
    return (
      <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
        <Alert
          message="Không tìm thấy đơn hàng"
          description="Đơn hàng không tồn tại hoặc đã bị xóa."
          type="error"
          showIcon
          action={
            <Button
              type="primary"
              onClick={() => router.push("/member/orders")}
            >
              Quay về danh sách
            </Button>
          }
        />
      </div>
    );
  }

  // Table columns for items
  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "product",
      key: "product",
      render: (_: unknown, record: CustomerOrderLine) => (
        <Space
          direction="vertical"
          size={0}
        >
          <Text strong>{record.product.product_name}</Text>
          {record.product.sku && (
            <Text
              type="secondary"
              style={{ fontSize: "12px" }}
            >
              SKU: {record.product.sku}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "unitPrice",
      key: "unitPrice",
      align: "right" as const,
      render: (price: number) => `${price.toLocaleString("vi-VN")}đ`,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      align: "center" as const,
    },
    {
      title: "Thành tiền",
      dataIndex: "subtotal",
      key: "subtotal",
      align: "right" as const,
      render: (subtotal: number, record: CustomerOrderLine) => (
        <Space
          direction="vertical"
          size={0}
          style={{ alignItems: "flex-end" }}
        >
          <Text strong>{subtotal.toLocaleString("vi-VN")}đ</Text>
          {record.isFreeItem && (
            <Tag
              color="green"
              style={{ margin: 0 }}
            >
              Quà tặng
            </Tag>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Breadcrumb */}
      <Breadcrumb
        style={{ marginBottom: 24 }}
        items={[
          {
            href: "/",
            title: <HomeOutlined />,
          },
          {
            href: "/member/orders",
            title: (
              <>
                <ShoppingOutlined />
                <span>Đơn hàng của tôi</span>
              </>
            ),
          },
          {
            title: order.orderNumber,
          },
        ]}
      />

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/member/orders")}
          style={{ marginBottom: 16 }}
        >
          Quay lại
        </Button>

        <Space
          style={{
            width: "100%",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <div>
            <Title
              level={2}
              style={{ marginBottom: 8 }}
            >
              Chi tiết đơn hàng #{order.orderNumber}
            </Title>
            <Space>
              <Text type="secondary">
                Đặt ngày: {dayjs(order.orderDate).format("DD/MM/YYYY HH:mm")}
              </Text>
              <Tag color={statusColorMap[order.status]}>
                {statusTextMap[order.status]}
              </Tag>
            </Space>
          </div>
        </Space>
      </div>

      {/* Order Timeline */}
      <Card
        title="Trạng thái đơn hàng"
        style={{ marginBottom: 24 }}
      >
        <Timeline
          items={[
            {
              color: "green",
              children: (
                <div>
                  <Text strong>Đơn hàng đã được tạo</Text>
                  <br />
                  <Text type="secondary">
                    {dayjs(order.orderDate).format("DD/MM/YYYY HH:mm")}
                  </Text>
                </div>
              ),
            },
            ...(order.paidDate
              ? [
                  {
                    color: "blue",
                    children: (
                      <div>
                        <Text strong>Đã thanh toán</Text>
                        <br />
                        <Text type="secondary">
                          {dayjs(order.paidDate).format("DD/MM/YYYY HH:mm")}
                        </Text>
                      </div>
                    ),
                  },
                ]
              : []),
            ...(order.completedDate
              ? [
                  {
                    color: "green",
                    children: (
                      <div>
                        <Text strong>Đã hoàn thành</Text>
                        <br />
                        <Text type="secondary">
                          {dayjs(order.completedDate).format(
                            "DD/MM/YYYY HH:mm"
                          )}
                        </Text>
                      </div>
                    ),
                  },
                ]
              : []),
            ...(order.cancelledDate
              ? [
                  {
                    color: "red",
                    children: (
                      <div>
                        <Text strong>Đã hủy</Text>
                        <br />
                        <Text type="secondary">
                          {dayjs(order.cancelledDate).format(
                            "DD/MM/YYYY HH:mm"
                          )}
                        </Text>
                        {order.cancellationReason && (
                          <>
                            <br />
                            <Text type="secondary">
                              Lý do: {order.cancellationReason}
                            </Text>
                          </>
                        )}
                      </div>
                    ),
                  },
                ]
              : []),
          ]}
        />
      </Card>

      {/* Order Items */}
      <Card
        title="Sản phẩm"
        style={{ marginBottom: 24 }}
      >
        <Table
          dataSource={order.lines}
          columns={columns}
          pagination={false}
          rowKey="id"
        />
      </Card>

      {/* Order Summary */}
      <Card
        title="Thanh toán"
        style={{ marginBottom: 24 }}
      >
        <Space
          direction="vertical"
          size={16}
          style={{ width: "100%" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Text>Tạm tính:</Text>
            <Text strong>{order.originalAmount.toLocaleString("vi-VN")}đ</Text>
          </div>

          {order.discountAmount > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Text>Giảm giá:</Text>
              <Text
                strong
                style={{ color: "#52c41a" }}
              >
                -{order.discountAmount.toLocaleString("vi-VN")}đ
              </Text>
            </div>
          )}

          {order.appliedPromotions && order.appliedPromotions.length > 0 && (
            <div style={{ paddingLeft: 16 }}>
              {order.appliedPromotions.map((promo) => (
                <Tag
                  key={promo.id}
                  color="green"
                >
                  {promo.name}
                </Tag>
              ))}
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Text>Phí vận chuyển:</Text>
            <Tag color="success">Miễn phí</Tag>
          </div>

          <Divider style={{ margin: 0 }} />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              strong
              style={{ fontSize: "16px" }}
            >
              Tổng cộng:
            </Text>
            <Title
              level={3}
              style={{ margin: 0, color: "#ff4d4f" }}
            >
              {order.finalAmount.toLocaleString("vi-VN")}đ
            </Title>
          </div>

          <Divider style={{ margin: 0 }} />

          {/* Payment Info */}
          <Descriptions
            column={1}
            size="small"
          >
            <Descriptions.Item label="Phương thức thanh toán">
              {order.paymentMethod === "BANK"
                ? "Chuyển khoản ngân hàng"
                : "Thanh toán khi nhận hàng"}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái thanh toán">
              {order.paymentStatus === "COMPLETED" ? (
                <Tag color="success">Đã thanh toán</Tag>
              ) : (
                <Tag color="warning">Chưa thanh toán</Tag>
              )}
            </Descriptions.Item>
          </Descriptions>
        </Space>
      </Card>

      {/* Customer Info */}
      {order.customer && (
        <Card title="Thông tin khách hàng">
          <Descriptions
            column={1}
            size="small"
          >
            <Descriptions.Item label="Họ tên">
              {order.customer.full_name}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {order.customer.email}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}
    </div>
  );
}
