"use client";

import React from "react";
import {
  Card,
  Space,
  Badge,
  Button,
  Empty,
  Table,
  Divider,
  Row,
  Typography,
  InputNumber,
  Tag,
  Tooltip,
} from "antd";
import {
  ShoppingCartOutlined,
  ClearOutlined,
  MinusOutlined,
  PlusOutlined,
  DeleteOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import type { UserManagementInfo } from "@/lib/api";
import type { BranchDisplay } from "@/lib/api/types/branch.types";
import type { CartSummary } from "@/lib/utils/promotion-calculator";

const { Text, Title } = Typography;

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  total: number;
  categoryName: string;
  availableStock: number;
  maxQuantity: number;
  // Free item properties
  isFreeItem?: boolean; // Is this a gift/free product?
  linkedPromotionId?: string; // Which promotion provides this free item?
  linkedProductId?: string; // Which purchased product triggers this free item? (for BUY_X_GET_Y)
  // Booking item properties
  isBookingItem?: boolean; // Is this a booking item?
  bookingId?: string; // Booking ID for booking items
  bookingCode?: string; // Booking code for display
  customerName?: string; // Customer name for booking
  vehicleLicensePlate?: string; // Vehicle license plate for booking
  // Service item properties (NEW)
  isServiceItem?: boolean; // Is this a service item?
  serviceId?: string; // Service ID for service items
  serviceName?: string; // Service name for display
  serviceDescription?: string; // Service description
  estimatedDuration?: number; // Estimated duration in minutes
  // Booking context for service items
  originalBookingId?: string; // Original booking ID that this service belongs to
  originalBookingCode?: string; // Original booking code for display
}

interface CartSectionProps {
  cart: CartItem[];
  selectedCustomer: UserManagementInfo | null;
  selectedBranch: BranchDisplay | null;
  isCreatingOrder: boolean;
  cartSummary?: CartSummary;
  selectedPromotionsCount?: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  onOpenPromotions?: () => void;
}

const CartSection: React.FC<CartSectionProps> = ({
  cart,
  selectedCustomer,
  selectedBranch,
  isCreatingOrder,
  cartSummary,
  selectedPromotionsCount = 0,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  onOpenPromotions,
}) => {
  // Calculation Functions
  const getTotalItems = () => {
    // Only count purchased items, not free items
    return cart
      .filter((item) => !item.isFreeItem)
      .reduce((total, item) => total + item.quantity, 0);
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + item.total, 0);
  };

  const getTotalAmount = () => {
    return getSubtotal();
  };

  // Cart Table Columns
  const cartColumns = [
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      ellipsis: true,
      render: (name: string, record: CartItem) => (
        <Space direction="vertical" size={2}>
          <Space>
            <Text>{name}</Text>
            {record.isFreeItem && <Tag color="green">TẶNG</Tag>}
            {record.isServiceItem && <Tag color="blue">DỊCH VỤ</Tag>}
            {record.isBookingItem && <Tag color="orange">BOOKING</Tag>}
          </Space>
          {record.isServiceItem && record.originalBookingCode && (
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Từ booking: {record.originalBookingCode}
            </Text>
          )}
          {record.isServiceItem && record.estimatedDuration && (
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Thời gian: {record.estimatedDuration} phút
            </Text>
          )}
          {record.customerName && (
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Khách: {record.customerName}
            </Text>
          )}
          {record.vehicleLicensePlate && (
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Xe: {record.vehicleLicensePlate}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      width: 120,
      render: (price: number, record: CartItem) =>
        record.isFreeItem ? (
          <Tooltip title="Sản phẩm tặng không tính tiền">
            <Text
              delete
              type="secondary"
              style={{ color: "#999" }}
            >
              ₫{price.toLocaleString()}
            </Text>
          </Tooltip>
        ) : (
          <Text
            strong
            style={{ color: "#1890ff" }}
          >
            ₫{price.toLocaleString()}
          </Text>
        ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 150,
      render: (quantity: number, record: CartItem) =>
        record.isFreeItem ? (
          // Free items: show quantity but disable controls
          <Tooltip title="Số lượng tặng tự động tính theo điều kiện khuyến mãi">
            <Space>
              <Button
                size="small"
                icon={<MinusOutlined />}
                disabled
              />
              <InputNumber
                size="small"
                value={quantity}
                disabled
                style={{ width: 60 }}
              />
              <Button
                size="small"
                icon={<PlusOutlined />}
                disabled
              />
            </Space>
          </Tooltip>
        ) : record.isServiceItem ? (
          // Service items: fixed quantity = 1, no controls
          <Tooltip title="Dịch vụ có số lượng cố định">
            <Space>
              <Button
                size="small"
                icon={<MinusOutlined />}
                disabled
              />
              <InputNumber
                size="small"
                value={quantity}
                disabled
                style={{ width: 60 }}
              />
              <Button
                size="small"
                icon={<PlusOutlined />}
                disabled
              />
            </Space>
          </Tooltip>
        ) : (
          // Regular items: normal controls
          <Space>
            <Button
              size="small"
              icon={<MinusOutlined />}
              onClick={() => onUpdateQuantity(record.productId, quantity - 1)}
              disabled={quantity <= 1}
            />
            <InputNumber
              size="small"
              value={quantity}
              min={1}
              max={record.maxQuantity}
              style={{ width: 60 }}
              onChange={(value) =>
                onUpdateQuantity(record.productId, value || 1)
              }
            />
            <Button
              size="small"
              icon={<PlusOutlined />}
              onClick={() => onUpdateQuantity(record.productId, quantity + 1)}
              disabled={quantity >= record.maxQuantity}
            />
          </Space>
        ),
    },
    {
      title: "Thành tiền",
      dataIndex: "total",
      key: "total",
      width: 120,
      render: (total: number, record: CartItem) =>
        record.isFreeItem ? (
          <Tag color="success">MIỄN PHÍ</Tag>
        ) : (
          <Text strong>₫{total.toLocaleString()}</Text>
        ),
    },
    {
      title: "",
      key: "action",
      width: 50,
      render: (_: unknown, record: CartItem) =>
        record.isFreeItem ? (
          <Tooltip title="Sản phẩm tặng sẽ tự động bị xóa khi bỏ khuyến mãi">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              disabled
            />
          </Tooltip>
        ) : (
          <Tooltip title={record.isServiceItem ? "Xóa dịch vụ khỏi giỏ hàng" : "Xóa sản phẩm khỏi giỏ hàng"}>
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onRemoveItem(record.productId)}
            />
          </Tooltip>
        ),
    },
  ];

  return (
    <Card
      title={
        <Space>
          <ShoppingCartOutlined />
          <span>Giỏ hàng</span>
          <Badge
            count={getTotalItems()}
            showZero
            color="#1890ff"
          />
        </Space>
      }
      extra={
        <Space>
          {onOpenPromotions && (
            <Button
              size="small"
              type="primary"
              ghost
              icon={<GiftOutlined />}
              onClick={onOpenPromotions}
            >
              Khuyến mãi
              {selectedPromotionsCount > 0 && (
                <Badge
                  count={selectedPromotionsCount}
                  offset={[10, -2]}
                  style={{ backgroundColor: "#52c41a" }}
                />
              )}
            </Button>
          )}
          {cart.length > 0 && (
            <Button
              size="small"
              danger
              icon={<ClearOutlined />}
              onClick={onClearCart}
            >
              Xóa tất cả
            </Button>
          )}
        </Space>
      }
      style={{ height: "100%", borderRadius: "12px" }}
      styles={{
        body: {
          height: "calc(100% - 57px)",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {cart.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Giỏ hàng trống"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        />
      ) : (
        <>
          <div style={{ flex: 1, overflow: "auto", marginBottom: "16px" }}>
            <Table
              dataSource={cart}
              columns={cartColumns}
              pagination={false}
              size="small"
              rowKey="productId"
            />
          </div>

          <Divider style={{ margin: "12px 0" }} />

          <div style={{ marginBottom: "16px" }}>
            <Row
              justify="space-between"
              style={{ marginBottom: "8px" }}
            >
              <Text>Tổng sản phẩm:</Text>
              <Text strong>{getTotalItems()}</Text>
            </Row>
            <Row
              justify="space-between"
              style={{ marginBottom: "8px" }}
            >
              <Text>Khách hàng:</Text>
              <Text>{selectedCustomer?.full_name || "Khách lẻ"}</Text>
            </Row>
            <Row
              justify="space-between"
              style={{ marginBottom: "8px" }}
            >
              <Text>Chi nhánh:</Text>
              <Text>{selectedBranch?.branch_name || "Chưa chọn"}</Text>
            </Row>

            <Divider style={{ margin: "8px 0" }} />

            <Row
              justify="space-between"
              style={{ marginBottom: "4px" }}
            >
              <Text>Tạm tính:</Text>
              <Text>₫{getSubtotal().toLocaleString()}</Text>
            </Row>

            {cartSummary && cartSummary.totalDiscount > 0 && (
              <>
                <Row
                  justify="space-between"
                  style={{ marginBottom: "4px" }}
                >
                  <Text style={{ color: "#52c41a" }}>Giảm giá:</Text>
                  <Text style={{ color: "#52c41a" }}>
                    -₫{cartSummary.totalDiscount.toLocaleString()}
                  </Text>
                </Row>
                {cartSummary.appliedPromotions.length > 0 && (
                  <div style={{ marginLeft: 16, marginBottom: 8 }}>
                    {cartSummary.appliedPromotions.map((promo) => (
                      <Row
                        key={promo.promotionId}
                        justify="space-between"
                        style={{ marginBottom: 2 }}
                      >
                        <Text
                          type="secondary"
                          style={{ fontSize: 12 }}
                        >
                          • {promo.promotionName}
                        </Text>
                        <Text
                          type="secondary"
                          style={{ fontSize: 12 }}
                        >
                          -₫{promo.discountAmount.toLocaleString()}
                        </Text>
                      </Row>
                    ))}
                  </div>
                )}
              </>
            )}

            <Row justify="space-between">
              <Title
                level={4}
                style={{ margin: 0 }}
              >
                Tổng cộng:
              </Title>
              <Title
                level={4}
                style={{ margin: 0, color: "#1890ff" }}
              >
                ₫
                {(cartSummary?.finalTotal || getTotalAmount()).toLocaleString()}
              </Title>
            </Row>
          </div>

          <Space
            direction="vertical"
            style={{ width: "100%" }}
          >
            <Button
              type="primary"
              size="large"
              icon={<ShoppingCartOutlined />}
              onClick={onCheckout}
              disabled={cart.length === 0 || !selectedBranch}
              loading={isCreatingOrder}
              style={{ width: "100%" }}
            >
              Thanh toán
            </Button>
          </Space>
        </>
      )}
    </Card>
  );
};

export default CartSection;
