"use client";

import React from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Typography,
  Space,
  Empty,
  InputNumber,
  Divider,
  Tag,
  Alert,
} from "antd";
import {
  DeleteOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

const { Title, Text } = Typography;

/**
 * Cart Item Component
 */
const CartItemCard: React.FC<{
  item: any;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}> = ({ item, onUpdateQuantity, onRemove }) => {
  const { product, quantity, unitPrice, subtotal } = item;
  const maxStock = product.availableStock || 999;

  return (
    <Card style={{ marginBottom: 16 }}>
      <Row
        gutter={16}
        align="middle"
      >
        {/* Product Image */}
        <Col
          xs={24}
          sm={6}
          md={4}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              paddingTop: "100%",
              overflow: "hidden",
              borderRadius: 8,
            }}
          >
            <Image
              src={product.mainImageUrl || "/images/placeholder-product.png"}
              alt={product.product_name}
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
        </Col>

        {/* Product Info */}
        <Col
          xs={24}
          sm={18}
          md={10}
        >
          <Space
            direction="vertical"
            size={4}
            style={{ width: "100%" }}
          >
            <Text
              strong
              style={{ fontSize: "16px" }}
            >
              {product.product_name}
            </Text>
            {product.sku && (
              <Text
                type="secondary"
                style={{ fontSize: "12px" }}
              >
                SKU: {product.sku}
              </Text>
            )}
            {product.brand && (
              <Text
                type="secondary"
                style={{ fontSize: "12px" }}
              >
                Thương hiệu: {product.brand}
              </Text>
            )}
            <Text style={{ fontSize: "14px", color: "#1890ff" }}>
              {unitPrice.toLocaleString("vi-VN")}đ / sản phẩm
            </Text>
          </Space>
        </Col>

        {/* Quantity Controls */}
        <Col
          xs={12}
          sm={12}
          md={5}
        >
          <Space
            direction="vertical"
            size={8}
            style={{ width: "100%" }}
          >
            <Text
              type="secondary"
              style={{ fontSize: "12px" }}
            >
              Số lượng:
            </Text>
            <InputNumber
              min={1}
              max={maxStock}
              value={quantity}
              onChange={(value) =>
                onUpdateQuantity(product.product_id, value || 1)
              }
              style={{ width: "100%" }}
            />
            {quantity >= maxStock && (
              <Text
                type="warning"
                style={{ fontSize: "11px" }}
              >
                Đã đạt tối đa
              </Text>
            )}
          </Space>
        </Col>

        {/* Subtotal & Remove */}
        <Col
          xs={12}
          sm={12}
          md={5}
        >
          <Space
            direction="vertical"
            size={8}
            style={{ width: "100%", textAlign: "right" }}
          >
            <Text
              strong
              style={{ fontSize: "18px", color: "#ff4d4f" }}
            >
              {subtotal.toLocaleString("vi-VN")}đ
            </Text>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => onRemove(product.product_id)}
              size="small"
            >
              Xóa
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

/**
 * Cart Summary Component
 */
const CartSummary: React.FC<{
  summary: any;
  onCheckout: () => void;
  onContinueShopping: () => void;
}> = ({ summary, onCheckout, onContinueShopping }) => {
  const {
    itemCount,
    subtotal,
    discountAmount,
    taxAmount,
    shippingAmount,
    totalAmount,
    appliedPromotions,
  } = summary;

  return (
    <Card title="Tóm tắt đơn hàng">
      <Space
        direction="vertical"
        size={16}
        style={{ width: "100%" }}
      >
        {/* Items Count */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text>Số sản phẩm:</Text>
          <Text strong>{itemCount}</Text>
        </div>

        {/* Subtotal */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text>Tạm tính:</Text>
          <Text
            strong
            style={{ fontSize: "16px" }}
          >
            {subtotal.toLocaleString("vi-VN")}đ
          </Text>
        </div>

        {/* Discounts */}
        {discountAmount > 0 && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text>Giảm giá:</Text>
              <Text
                strong
                style={{ color: "#52c41a" }}
              >
                -{discountAmount.toLocaleString("vi-VN")}đ
              </Text>
            </div>
            {appliedPromotions?.map((promo: any) => (
              <div
                key={promo.id}
                style={{ paddingLeft: 16 }}
              >
                <Tag color="green">{promo.name}</Tag>
              </div>
            ))}
          </>
        )}

        {/* Tax */}
        {taxAmount > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text>Thuế:</Text>
            <Text>{taxAmount.toLocaleString("vi-VN")}đ</Text>
          </div>
        )}

        <Divider style={{ margin: "8px 0" }} />

        {/* Total */}
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
            {totalAmount.toLocaleString("vi-VN")}đ
          </Title>
        </div>

        {/* Checkout Button */}
        <Button
          type="primary"
          size="large"
          block
          onClick={onCheckout}
          icon={<ShoppingCartOutlined />}
        >
          Tiến hành thanh toán
        </Button>

        {/* Continue Shopping */}
        <Button
          size="large"
          block
          onClick={onContinueShopping}
          icon={<ShoppingOutlined />}
        >
          Tiếp tục mua sắm
        </Button>
      </Space>
    </Card>
  );
};

/**
 * Shopping Cart Page
 */
export default function CartPage() {
  const router = useRouter();
  const { cart, cartSummary, updateQuantity, removeFromCart } = useCart();

  const handleCheckout = () => {
    // TODO: Check authentication before checkout
    router.push("/checkout");
  };

  const handleContinueShopping = () => {
    router.push("/products");
  };

  // Empty cart state
  if (cart.length === 0) {
    return (
      <div
        style={{
          padding: "48px 24px",
          maxWidth: "800px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Space
              direction="vertical"
              size={16}
            >
              <Title level={3}>Giỏ hàng của bạn đang trống</Title>
              <Text type="secondary">
                Hãy khám phá các sản phẩm tuyệt vời của chúng tôi!
              </Text>
            </Space>
          }
        >
          <Button
            type="primary"
            size="large"
            icon={<ShoppingOutlined />}
            onClick={() => router.push("/products")}
          >
            Xem sản phẩm
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Giỏ hàng của bạn</Title>
        <Text type="secondary">
          Bạn có {cartSummary.itemCount} sản phẩm trong giỏ hàng
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Left Column - Cart Items */}
        <Col
          xs={24}
          lg={16}
        >
          <Space
            direction="vertical"
            size={16}
            style={{ width: "100%" }}
          >
            {cart.map((item) => (
              <CartItemCard
                key={item.product.product_id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}
          </Space>
        </Col>

        {/* Right Column - Summary */}
        <Col
          xs={24}
          lg={8}
        >
          <div style={{ position: "sticky", top: 24 }}>
            <CartSummary
              summary={cartSummary}
              onCheckout={handleCheckout}
              onContinueShopping={handleContinueShopping}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
}
