"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Form,
  Input,
  Typography,
  Space,
  Divider,
  Alert,
  Table,
  Tag,
  App,
} from "antd";
import {
  ShoppingCartOutlined,
  EnvironmentOutlined,
  CreditCardOutlined,
  ArrowLeftOutlined,
  GiftOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import { useAuth, CatalogService } from "@/lib/api";
import { useBranches } from "@/lib/api/hooks/useBranches";
import { useCreateAndPay } from "@/lib/api/hooks/usePayment";
import { useActivePromotions } from "@/lib/api/hooks/usePromotions";
import type { CheckoutFormData } from "@/lib/api/types/customer-order.types";
import type { Promotion } from "@/lib/api/types/promotion.types";
import type { BranchDisplay } from "@/lib/api/types/branch.types";
import PromotionModal from "@/components/ui/Modal/PosModal/PromotionModal";
import {
  calculateTotalDiscounts,
  isPromotionApplicable,
} from "@/lib/utils/promotion-calculator";
import { recalculateAllFreeItems } from "@/lib/utils/free-item-manager";
import type { CartItem } from "@/components/ui/Pos/CartSection";

const { Title, Text } = Typography;

export default function CheckoutPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const { isAuthenticated, user } = useAuth();
  const { cart: rawCart, clearCart } = useCart();
  const { mutateAsync: createAndPay, isPending: isCreatingOrder } =
    useCreateAndPay();

  const { branches } = useBranches();
  const [selectedBranch, setSelectedBranch] = useState<BranchDisplay | null>(
    null
  );
  const [isCheckoutComplete, setIsCheckoutComplete] = useState(false);

  // Check inventory for all branches and select the best one
  useEffect(() => {
    const checkInventoryAndSelectBranch = async () => {
      if (!branches || branches.length === 0 || rawCart.length === 0) return;

      // Reset selected branch when dependencies change
      if (selectedBranch) return; // Already selected, don't recheck

      console.log("🔍 Checking inventory across branches...");

      try {
        // Check each branch's catalog to find one with sufficient stock
        for (const branch of branches) {
          try {
            console.log(`📦 Checking branch: ${branch.branch_name}`);
            const catalog = await CatalogService.getForSaleCatalogs(
              branch.branch_id
            );

            if (!catalog?.items) {
              console.log(
                `  ⚠️ No catalog items for branch ${branch.branch_name}`
              );
              continue;
            }

            // Build inventory map for this branch
            const inventoryMap = new Map<string, number>();
            for (const item of catalog.items) {
              inventoryMap.set(
                item.product.product_id,
                item.inventory?.available || 0
              );
            }

            console.log(
              `  📊 Inventory map:`,
              Object.fromEntries(inventoryMap)
            );

            // Check if this branch has enough stock for all cart items
            let hasAllStock = true;
            for (const cartItem of rawCart) {
              const availableStock = inventoryMap.get(
                cartItem.product.product_id
              );
              const needed = cartItem.quantity;

              console.log(
                `  🛒 ${
                  cartItem.product.product_name
                }: need ${needed}, available ${availableStock || 0}`
              );

              if (availableStock === undefined || availableStock < needed) {
                hasAllStock = false;
                break;
              }
            }

            if (hasAllStock) {
              console.log(`  ✅ Branch ${branch.branch_name} has all items!`);
              setSelectedBranch(branch);
              message.success(
                `Đã tìm thấy chi nhánh có đủ hàng: ${branch.branch_name}`
              );
              return; // Found a suitable branch, stop searching
            } else {
              console.log(
                `  ❌ Branch ${branch.branch_name} missing some items`
              );
            }
          } catch (error) {
            console.error(
              `❌ Error checking branch ${branch.branch_id}:`,
              error
            );
            continue;
          }
        }

        // No branch has all items in stock - select first branch as fallback
        console.log("⚠️ No branch has all items, using fallback");
        if (branches.length > 0) {
          setSelectedBranch(branches[0]);
          message.warning(
            "Một số sản phẩm có thể không đủ hàng tại thời điểm này. Chúng tôi sẽ liên hệ để xác nhận đơn hàng và thời gian giao hàng.",
            5 // Show for 5 seconds
          );
        }
      } catch (error) {
        console.error("❌ Error checking inventory:", error);
        // Fallback to first branch
        if (branches.length > 0) {
          setSelectedBranch(branches[0]);
        }
      }
    };

    checkInventoryAndSelectBranch();
  }, [branches, rawCart, message, selectedBranch]);

  const { data: promotionsData } = useActivePromotions({});
  const [selectedPromotions, setSelectedPromotions] = useState<Promotion[]>([]);
  const [isPromotionModalVisible, setIsPromotionModalVisible] = useState(false);

  const baseCart: CartItem[] = useMemo(() => {
    return rawCart.map((item) => ({
      productId: item.product.product_id,
      productName: item.product.product_name,
      price: item.unitPrice,
      quantity: item.quantity,
      total: item.subtotal,
      categoryName: item.product.product_type_name || "Sản phẩm",
      availableStock: 999,
      maxQuantity: 999,
      isFreeItem: false,
      grantedByPromotionId: undefined,
    }));
  }, [rawCart]);

  const productLookup = useMemo(() => {
    const map = new Map();
    for (const item of rawCart) {
      map.set(item.product.product_id, {
        name: item.product.product_name,
        price: item.unitPrice,
        stock: 999,
        category: item.product.product_type_name || "Sản phẩm",
      });
    }
    return map;
  }, [rawCart]);

  // Cart with free items from promotions
  const cart: CartItem[] = useMemo(() => {
    return recalculateAllFreeItems(baseCart, selectedPromotions, productLookup);
  }, [baseCart, selectedPromotions, productLookup]);

  const availablePromotions = useMemo(() => {
    return promotionsData?.content || [];
  }, [promotionsData]);

  const cartSummary = useMemo(() => {
    const summary = calculateTotalDiscounts(selectedPromotions, cart);
    return {
      subtotal: Number(summary.subtotal) || 0,
      totalDiscount: Number(summary.totalDiscount) || 0,
      finalTotal: Number(summary.finalTotal) || 0,
      appliedPromotions: summary.appliedPromotions || [],
    };
  }, [selectedPromotions, cart]);

  const handleTogglePromotion = useCallback(
    (promotion: Promotion) => {
      setSelectedPromotions((prev) => {
        const isSelected = prev.some(
          (p) => p.promotion_id === promotion.promotion_id
        );
        if (isSelected) {
          message.success(`Đã bỏ chọn khuyến mãi "${promotion.name}"`);
          return prev.filter((p) => p.promotion_id !== promotion.promotion_id);
        } else {
          if (!isPromotionApplicable(promotion, baseCart)) {
            message.warning(
              "Khuyến mãi này không áp dụng cho đơn hàng hiện tại"
            );
            return prev;
          }
          message.success(`Đã áp dụng khuyến mãi "${promotion.name}"`);
          return [...prev, promotion];
        }
      });
    },
    [baseCart, message]
  );

  useEffect(() => {
    if (selectedPromotions.length === 0) return;
    const nonApplicablePromotions = selectedPromotions.filter(
      (promo) => !isPromotionApplicable(promo, baseCart)
    );
    if (nonApplicablePromotions.length > 0) {
      setSelectedPromotions((prev) =>
        prev.filter((promo) => isPromotionApplicable(promo, baseCart))
      );
      for (const promo of nonApplicablePromotions) {
        message.warning(
          `Khuyến mãi "${promo.name}" không còn áp dụng và đã bị bỏ chọn`
        );
      }
    }
  }, [baseCart, selectedPromotions, message]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login?redirect=/checkout");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    // Don't redirect if checkout is complete (payment in progress)
    if (cart.length === 0 && !isCheckoutComplete) {
      router.push("/products");
    }
  }, [cart.length, router, isCheckoutComplete]);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        fullName: user.full_name || "",
        phone: user.email || "",
      });
    }
  }, [user, form]);

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      render: (_: unknown, record: CartItem) => (
        <Space
          direction="vertical"
          size={0}
        >
          <Text strong>
            {record.productName}
            {record.isFreeItem && (
              <Tag
                color="success"
                style={{ marginLeft: 8 }}
              >
                Tặng
              </Tag>
            )}
          </Text>
          <Text
            type="secondary"
            style={{ fontSize: "12px" }}
          >
            {record.categoryName}
          </Text>
        </Space>
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      align: "right" as const,
      render: (price: number, record: CartItem) =>
        record.isFreeItem ? (
          <Text
            type="secondary"
            delete
          >
            {(price || 0).toLocaleString("vi-VN")}đ
          </Text>
        ) : (
          `${(price || 0).toLocaleString("vi-VN")}đ`
        ),
    },
    {
      title: "SL",
      dataIndex: "quantity",
      key: "quantity",
      align: "center" as const,
      width: 60,
    },
    {
      title: "Thành tiền",
      dataIndex: "total",
      key: "total",
      align: "right" as const,
      render: (total: number, record: CartItem) =>
        record.isFreeItem ? (
          <Tag color="success">Miễn phí</Tag>
        ) : (
          <Text strong>{(total || 0).toLocaleString("vi-VN")}đ</Text>
        ),
    },
  ];

  const handleSubmit = async (values: CheckoutFormData) => {
    try {
      if (!selectedBranch) {
        message.error("Không tìm thấy chi nhánh có sẵn hàng");
        return;
      }
      if (!user?.user_id) {
        message.error("Không tìm thấy thông tin người dùng");
        return;
      }
      // Prepare full promotion snapshot
      const promotionSnapshot = selectedPromotions.map((promo) => ({
        promotion_id: promo.promotion_id,
        code: promo.promotion_code,
        name: promo.name,
        description: promo.description,
        start_at: promo.start_at,
        end_at: promo.end_at,
        usage_limit: promo.usage_limit,
        per_customer_limit: promo.per_customer_limit,
        priority: promo.priority,
        is_stackable: promo.is_stackable,
        coupon_redeem_once: promo.coupon_redeem_once,
        branch: promo.branch
          ? {
              branch_id: promo.branch.branch_id,
              branch_name: promo.branch.branch_name,
              branch_url: promo.branch.branch_url,
            }
          : null,
        discount_lines: promo.promotion_lines.map((line) => ({
          promotion_line_id: line.promotion_line_id,
          line_type: line.line_type,
          target_id: line.target_id,
          discount_type: line.discount_type,
          discount_value: line.discount_value,
          max_discount_amount: line.max_discount_amount,
          min_order_value: line.min_order_value,
          min_quantity: line.min_quantity,
          buy_qty: line.buy_qty,
          get_qty: line.get_qty,
          free_product_name: line.free_product?.product_name,
          free_quantity: line.free_quantity,
          line_priority: line.line_priority,
          is_active: line.is_active,
        })),
      }));

      const baseUrl = globalThis.location?.origin || "";

      const orderPayload = {
        branch_id: selectedBranch.branch_id,
        warehouse_id: selectedBranch.branch_id,
        customer_id: user.user_id,
        promotion_ids: selectedPromotions.map((p) => p.promotion_id),
        promotion_snapshot: JSON.stringify(promotionSnapshot),
        original_amount: cartSummary?.subtotal || 0,
        total_discount_amount: cartSummary?.totalDiscount || 0,
        final_amount: cartSummary?.finalTotal || 0,
        discount_percentage:
          cartSummary?.subtotal && cartSummary.subtotal > 0
            ? (cartSummary.totalDiscount / cartSummary.subtotal) * 100
            : 0,
        // Shipping address - use customer's address
        shipping_full_name: values.fullName,
        shipping_phone: values.phone,
        shipping_address: values.address || "",
        shipping_ward: values.ward || "",
        shipping_district: values.district || "",
        shipping_city: values.city || "",
        shipping_notes: values.notes || "",
        lines: cart.map((item) => ({
          product_id: item.productId,
          qty: item.quantity,
          unit_price: item.price,
          is_free_item: item.isFreeItem || false,
        })),
        payment_method: "BANK" as const,
        return_url: `${baseUrl}/payment/success`,
        cancel_url: `${baseUrl}/payment/cancel`,
      };
      const result = await createAndPay(orderPayload);
      console.log("✅ Create-and-pay result:", result);
      console.log("📦 Order ID:", result?.order?.id);
      console.log("💳 Payment URL:", result?.payment?.payment_url);

      // Mark checkout as complete to prevent redirect to products
      setIsCheckoutComplete(true);
      clearCart();

      // Redirect to PayOS payment page
      if (result?.payment?.payment_url) {
        console.log("🔀 Redirecting to PayOS:", result.payment.payment_url);
        // Use globalThis.location.href for external redirect to PayOS
        globalThis.location.href = result.payment.payment_url;
      } else {
        console.log("⚠️ No payment URL, redirecting to success page");
        router.push(`/checkout/success?orderId=${result.order.id}`);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      message.error("Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại");
    }
  };

  if (!isAuthenticated || cart.length === 0) {
    return null;
  }

  // Show alert if no branch has been selected yet
  if (!selectedBranch) {
    return (
      <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/cart")}
          style={{ marginBottom: 16 }}
        >
          Quay lại giỏ hàng
        </Button>
        <Card style={{ marginTop: 24 }}>
          <Space
            direction="vertical"
            size={16}
            style={{ width: "100%", textAlign: "center" }}
          >
            <div style={{ fontSize: "48px" }}>⏳</div>
            <Title level={3}>Đang kiểm tra tồn kho...</Title>
            <Text type="secondary">
              Chúng tôi đang tìm chi nhánh có đủ hàng cho đơn hàng của bạn
            </Text>
          </Space>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/cart")}
          style={{ marginBottom: 16 }}
        >
          Quay lại giỏ hàng
        </Button>
        <Title level={2}>Thanh toán</Title>
        <Text type="secondary">Hoàn tất đơn hàng của bạn</Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Row gutter={[24, 24]}>
          <Col
            xs={24}
            lg={14}
          >
            <Space
              direction="vertical"
              size={24}
              style={{ width: "100%" }}
            >
              <Card
                title={
                  <>
                    <EnvironmentOutlined /> Địa chỉ giao hàng
                  </>
                }
              >
                <Alert
                  message="Vui lòng nhập đầy đủ địa chỉ để chúng tôi giao hàng chính xác"
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      label="Họ và tên người nhận"
                      name="fullName"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập họ và tên người nhận",
                        },
                      ]}
                    >
                      <Input
                        placeholder="Nguyễn Văn A"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      label="Số điện thoại"
                      name="phone_number"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập số điện thoại",
                        },
                        {
                          pattern: /^\d{10,11}$/,
                          message: "Số điện thoại không hợp lệ",
                        },
                      ]}
                    >
                      <Input
                        placeholder="0901234567"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      label="Địa chỉ cụ thể"
                      name="address"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập địa chỉ cụ thể",
                        },
                      ]}
                    >
                      <Input
                        placeholder="Số nhà, tên đường"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  <Col
                    xs={24}
                    md={8}
                  >
                    <Form.Item
                      label="Phường/Xã"
                      name="ward"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập phường/xã",
                        },
                      ]}
                    >
                      <Input
                        placeholder="Phường 1"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  <Col
                    xs={24}
                    md={8}
                  >
                    <Form.Item
                      label="Quận/Huyện"
                      name="district"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập quận/huyện",
                        },
                      ]}
                    >
                      <Input
                        placeholder="Quận 1"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  <Col
                    xs={24}
                    md={8}
                  >
                    <Form.Item
                      label="Tỉnh/Thành phố"
                      name="city"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập tỉnh/thành phố",
                        },
                      ]}
                    >
                      <Input
                        placeholder="TP. Hồ Chí Minh"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      label="Ghi chú"
                      name="notes"
                    >
                      <Input.TextArea
                        placeholder="Ghi chú cho đơn hàng (tùy chọn)"
                        rows={3}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              <Card
                title={
                  <>
                    <CreditCardOutlined /> Phương thức thanh toán & Giao hàng
                  </>
                }
              >
                <Space
                  direction="vertical"
                  size={12}
                  style={{ width: "100%" }}
                >
                  <Alert
                    message={
                      <Space
                        direction="vertical"
                        size={4}
                      >
                        <Text strong>Chuyển khoản ngân hàng / QR Code</Text>
                        <Text
                          type="secondary"
                          style={{ fontSize: "12px" }}
                        >
                          Thanh toán qua PayOS với mã QR. Bạn sẽ được chuyển đến
                          trang thanh toán sau khi đặt hàng.
                        </Text>
                      </Space>
                    }
                    type="info"
                    showIcon
                    icon={<BankOutlined />}
                  />
                  <Alert
                    message={
                      <Space
                        direction="vertical"
                        size={4}
                      >
                        <Text strong>🚚 Giao hàng tận nơi</Text>
                        <Text
                          type="secondary"
                          style={{ fontSize: "12px" }}
                        >
                          Hàng sẽ được giao đến địa chỉ bạn đã nhập trong thời
                          gian sớm nhất. Phí vận chuyển: Miễn phí.
                        </Text>
                      </Space>
                    }
                    type="success"
                    showIcon
                  />
                </Space>
              </Card>
            </Space>
          </Col>

          <Col
            xs={24}
            lg={10}
          >
            <div style={{ position: "sticky", top: 24 }}>
              <Card title="Đơn hàng của bạn">
                <Space
                  direction="vertical"
                  size={16}
                  style={{ width: "100%" }}
                >
                  <Button
                    icon={<GiftOutlined />}
                    onClick={() => setIsPromotionModalVisible(true)}
                    block
                    size="large"
                    style={{ marginBottom: 8 }}
                  >
                    Chọn khuyến mãi ({selectedPromotions.length})
                  </Button>

                  {selectedPromotions.length > 0 && (
                    <div>
                      <Text
                        strong
                        style={{ marginBottom: 8, display: "block" }}
                      >
                        Khuyến mãi đã áp dụng:
                      </Text>
                      <Space
                        direction="vertical"
                        size={4}
                        style={{ width: "100%" }}
                      >
                        {selectedPromotions.map((promo) => (
                          <Tag
                            key={promo.promotion_id}
                            color="success"
                            closable
                            onClose={() => handleTogglePromotion(promo)}
                          >
                            {promo.name}
                          </Tag>
                        ))}
                      </Space>
                    </div>
                  )}

                  <Table
                    dataSource={cart}
                    columns={columns}
                    pagination={false}
                    size="small"
                    rowKey={(item) =>
                      item.isFreeItem && item.linkedPromotionId
                        ? `${item.productId}-free-${item.linkedPromotionId}`
                        : item.productId
                    }
                  />

                  <Divider style={{ margin: "8px 0" }} />

                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Text>Tạm tính:</Text>
                    <Text strong>
                      {cartSummary.subtotal.toLocaleString("vi-VN")}đ
                    </Text>
                  </div>

                  {cartSummary.totalDiscount > 0 && (
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
                        -{cartSummary.totalDiscount.toLocaleString("vi-VN")}đ
                      </Text>
                    </div>
                  )}

                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Text>Phí vận chuyển:</Text>
                    <Tag color="success">Miễn phí</Tag>
                  </div>

                  <Divider style={{ margin: "8px 0" }} />

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
                      {cartSummary.finalTotal.toLocaleString("vi-VN")}đ
                    </Title>
                  </div>

                  <Button
                    type="primary"
                    size="large"
                    block
                    htmlType="submit"
                    loading={isCreatingOrder}
                    icon={<ShoppingCartOutlined />}
                  >
                    Thanh toán
                  </Button>

                  <Text
                    type="secondary"
                    style={{
                      fontSize: "12px",
                      textAlign: "center",
                      display: "block",
                    }}
                  >
                    Bằng cách đặt hàng, bạn đồng ý với Điều khoản sử dụng của
                    chúng tôi
                  </Text>
                </Space>
              </Card>
            </div>
          </Col>
        </Row>
      </Form>

      <PromotionModal
        isVisible={isPromotionModalVisible}
        promotions={availablePromotions}
        selectedPromotions={selectedPromotions}
        cart={cart}
        productLookup={productLookup}
        selectedBranch={selectedBranch}
        onTogglePromotion={handleTogglePromotion}
        onCancel={() => setIsPromotionModalVisible(false)}
      />
    </div>
  );
}
