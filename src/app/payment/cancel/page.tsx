"use client";
import React, {useEffect, useState, Suspense} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {Card, Result, Button, Space, Typography, Alert, Descriptions, Spin} from "antd";
import {CloseCircleOutlined, HomeOutlined, ShoppingOutlined, ReloadOutlined} from "@ant-design/icons";
import {useCancelPayment, useVerifyPayment} from "@/lib/api/hooks";
import {message} from "antd";

const {Title, Text} = Typography;

const CancelPaymentContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCancelling, setIsCancelling] = useState(false);

  // Get params from URL
  const orderCode = searchParams.get("orderCode");
  const paymentId = searchParams.get("paymentId");
  const cancel = searchParams.get("cancel");

  // Hooks
  const {mutateAsync: cancelPayment} = useCancelPayment();
  const {data: paymentStatus} = useVerifyPayment(
    orderCode ? Number(orderCode) : null
  );

  useEffect(() => {
    // Auto cancel payment if paymentId is provided
    const handleCancelPayment = async () => {
      if (paymentId && cancel === "true" && !isCancelling) {
        setIsCancelling(true);
        try {
          await cancelPayment(paymentId);
          message.success("Đã hủy thanh toán");
        } catch (error: any) {
          console.log("Error cancelling payment:", error);
          // Don't show error message as user intentionally cancelled
        } finally {
          setIsCancelling(false);
        }
      }
    };

    handleCancelPayment();
  }, [paymentId, cancel, cancelPayment, isCancelling]);

  const handleBackToHome = () => {
    router.push("/");
  };

  const handleRetryPayment = () => {
    router.push("/pos");
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f0f2f5",
        padding: "20px",
      }}
    >
      <Card style={{width: "100%", maxWidth: 600}}>
        <Result
          status="warning"
          icon={<CloseCircleOutlined style={{color: "#faad14"}}/>}
          title="Thanh toán đã bị hủy"
          subTitle="Giao dịch của bạn đã bị hủy. Không có khoản tiền nào bị trừ."
          extra={[
            <Button
              type="primary"
              key="retry"
              icon={<ReloadOutlined/>}
              onClick={handleRetryPayment}
              size="large"
            >
              Thử lại thanh toán
            </Button>,
            <Button
              key="home"
              icon={<HomeOutlined/>}
              onClick={handleBackToHome}
              size="large"
            >
              Về trang chủ
            </Button>,
          ]}
        >
          <Space direction="vertical" style={{width: "100%", marginTop: "24px"}} size="large">
            <Alert
              message="Lưu ý"
              description="Đơn hàng của bạn đã được lưu lại. Bạn có thể quay lại và hoàn tất thanh toán bất cứ lúc nào."
              type="info"
              showIcon
            />

            {paymentStatus && (
              <Descriptions bordered column={1} size="small">
                {orderCode && (
                  <Descriptions.Item label="Mã đơn hàng">
                    <Text code>{orderCode}</Text>
                  </Descriptions.Item>
                )}
                {paymentStatus.sales_order_id && (
                  <Descriptions.Item label="Mã giao dịch">
                    <Text strong>{paymentStatus.sales_order_id}</Text>
                  </Descriptions.Item>
                )}
                {paymentStatus.amount && (
                  <Descriptions.Item label="Số tiền">
                    <Text strong style={{color: "#1890ff", fontSize: "16px"}}>
                      ₫{paymentStatus.amount?.toLocaleString()}
                    </Text>
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Trạng thái">
                  <Text strong style={{color: "#faad14"}}>
                    Đã hủy
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            )}

            <Alert
              message="Cần hỗ trợ?"
              description="Nếu bạn gặp bất kỳ vấn đề nào, vui lòng liên hệ bộ phận hỗ trợ khách hàng của chúng tôi."
              type="warning"
              showIcon
            />
          </Space>
        </Result>
      </Card>
    </div>
  );
};

const CancelPaymentPage = () => {
  return (
    <Suspense fallback={
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f0f2f5",
      }}>
        <Spin size="large" />
      </div>
    }>
      <CancelPaymentContent />
    </Suspense>
  );
};

export default CancelPaymentPage;
