"use client";

import React, { useEffect, useState, Suspense } from "react";
import {
  Result,
  Button,
  Card,
  Typography,
  Space,
  Divider,
  Alert,
  Spin,
  QRCode,
} from "antd";
import {
  CheckCircleOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import { useOrderDetail } from "@/lib/api/hooks/useCustomerShop";
import { useVerifyPayment } from "@/lib/api/hooks/usePayment";

const { Title, Text, Paragraph } = Typography;

/**
 * Order Success Content Component
 */
function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const paymentLink = searchParams.get("paymentLink");

  const [orderCode, setOrderCode] = useState<number | null>(null);

  // Fetch order details
  const { order, loading: orderLoading } = useOrderDetail(orderId);

  // Extract orderCode from paymentLink if exists
  useEffect(() => {
    if (paymentLink) {
      try {
        const url = new URL(decodeURIComponent(paymentLink));
        const code = url.searchParams.get("orderCode");
        if (code) {
          setOrderCode(parseInt(code));
        }
      } catch (e) {
        console.error("Error parsing payment link:", e);
      }
    }
  }, [paymentLink]);

  // Poll payment status if BANK payment
  const {
    data: paymentStatus,
    isLoading: isVerifying,
    refetch,
  } = useVerifyPayment(orderCode, {
    enabled: !!orderCode && order?.paymentMethod === "BANK",
    refetchInterval: 3000, // Poll every 3 seconds
  });

  // Check if payment is completed
  const isPaymentCompleted =
    paymentStatus?.status === "COMPLETED" ||
    (paymentStatus?.status === "PENDING" && paymentStatus?.transaction_id);

  // Stop polling when completed
  useEffect(() => {
    if (isPaymentCompleted) {
      // Payment completed, could refresh order details
      console.log("Payment completed!");
    }
  }, [isPaymentCompleted]);

  const handleCopyOrderId = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId);
    }
  };

  if (orderLoading) {
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

  if (!order) {
    return (
      <Result
        status="error"
        title="Không tìm thấy đơn hàng"
        subTitle="Đơn hàng không tồn tại hoặc đã bị xóa"
        extra={
          <Button
            type="primary"
            onClick={() => router.push("/products")}
          >
            Quay về cửa hàng
          </Button>
        }
      />
    );
  }

  const isBankPayment = order.paymentMethod === "BANK";

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      {/* Success Result */}
      <Result
        status="success"
        icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
        title={
          <Title
            level={2}
            style={{ margin: 0 }}
          >
            Đặt hàng thành công!
          </Title>
        }
        subTitle={
          <Space
            direction="vertical"
            size={8}
          >
            <Text>
              Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được tiếp nhận.
            </Text>
            <Space>
              <Text strong>Mã đơn hàng:</Text>
              <Text copyable={{ text: orderId || "", icon: <CopyOutlined /> }}>
                {order.orderNumber}
              </Text>
            </Space>
          </Space>
        }
      />

      {/* Payment Info for BANK */}
      {isBankPayment && paymentLink && (
        <Card style={{ marginBottom: 24 }}>
          <Space
            direction="vertical"
            size={16}
            style={{ width: "100%" }}
          >
            <div style={{ textAlign: "center" }}>
              <Title level={4}>Thanh toán qua QR Code</Title>
              {isPaymentCompleted ? (
                <Alert
                  message="Thanh toán thành công!"
                  description="Đơn hàng của bạn đã được thanh toán thành công."
                  type="success"
                  showIcon
                />
              ) : (
                <>
                  <Paragraph type="secondary">
                    Quét mã QR bên dưới để hoàn tất thanh toán
                  </Paragraph>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginBottom: 16,
                    }}
                  >
                    <QRCode
                      value={decodeURIComponent(paymentLink)}
                      size={200}
                      status={isVerifying ? "loading" : "active"}
                    />
                  </div>

                  <Alert
                    message="Đang chờ thanh toán..."
                    description="Hệ thống sẽ tự động xác nhận khi bạn hoàn tất thanh toán"
                    type="info"
                    showIcon
                  />

                  <Button
                    type="link"
                    href={decodeURIComponent(paymentLink)}
                    target="_blank"
                    style={{ marginTop: 8 }}
                  >
                    Mở link thanh toán trong tab mới
                  </Button>
                </>
              )}
            </div>
          </Space>
        </Card>
      )}

      {/* Payment Info for CASH */}
      {!isBankPayment && (
        <Card style={{ marginBottom: 24 }}>
          <Alert
            message="Thanh toán khi nhận hàng"
            description="Bạn đã chọn thanh toán bằng tiền mặt khi nhận hàng. Vui lòng chuẩn bị số tiền chính xác khi nhận hàng."
            type="info"
            showIcon
          />
        </Card>
      )}

      {/* Order Summary */}
      <Card
        title="Thông tin đơn hàng"
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
              alignItems: "center",
            }}
          >
            <Text>Số lượng sản phẩm:</Text>
            <Text strong>{order.lines.length}</Text>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text>Tổng tiền:</Text>
            <Text
              strong
              style={{ fontSize: "18px", color: "#ff4d4f" }}
            >
              {order.finalAmount.toLocaleString("vi-VN")}đ
            </Text>
          </div>

          <Divider style={{ margin: 0 }} />

          <div>
            <Text
              type="secondary"
              style={{ fontSize: "12px" }}
            >
              Trạng thái đơn hàng: <strong>{order.status}</strong>
            </Text>
          </div>
        </Space>
      </Card>

      {/* Next Steps */}
      <Card title="Bước tiếp theo">
        <Space
          direction="vertical"
          size={12}
          style={{ width: "100%" }}
        >
          <Paragraph>
            • Bạn sẽ nhận được email xác nhận đơn hàng trong vài phút tới
          </Paragraph>
          {isBankPayment && !isPaymentCompleted && (
            <Paragraph>
              • Vui lòng hoàn tất thanh toán để chúng tôi có thể xử lý đơn hàng
            </Paragraph>
          )}
          <Paragraph>
            • Theo dõi đơn hàng của bạn trong mục "Đơn hàng của tôi"
          </Paragraph>
          <Paragraph>
            • Liên hệ với chúng tôi nếu bạn có bất kỳ câu hỏi nào
          </Paragraph>
        </Space>
      </Card>

      {/* Action Buttons */}
      <div
        style={{
          marginTop: 24,
          display: "flex",
          gap: 16,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Button
          type="primary"
          size="large"
          icon={<FileTextOutlined />}
          onClick={() => router.push(`/member/orders/${orderId}`)}
        >
          Xem chi tiết đơn hàng
        </Button>

        <Button
          size="large"
          icon={<ShoppingOutlined />}
          onClick={() => router.push("/products")}
        >
          Tiếp tục mua sắm
        </Button>
      </div>
    </div>
  );
}

/**
 * Order Success Page with Suspense
 */
export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
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
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
