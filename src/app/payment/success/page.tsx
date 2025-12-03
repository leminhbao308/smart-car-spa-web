"use client";
import React, {useEffect, useState, Suspense} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {Card, Result, Button, Spin, Space, Typography, Descriptions} from "antd";
import {CheckCircleOutlined, HomeOutlined, ShoppingOutlined} from "@ant-design/icons";
import {useVerifyPayment} from "@/lib/api/hooks";

const {Title, Text} = Typography;

const SuccessPaymentContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);

  // Get order code from URL params
  const orderCode = searchParams.get("orderCode");
  const status = searchParams.get("status");

  // Use verify payment hook
  const {data: paymentStatus, isLoading, error} = useVerifyPayment(
    orderCode ? Number(orderCode) : null
  );

  useEffect(() => {
    if (!isLoading) {
      setIsVerifying(false);
    }
  }, [isLoading]);

  const handleBackToHome = () => {
    router.push("/");
  };

  // Show loading state
  if (isVerifying || isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f0f2f5",
        }}
      >
        <Card style={{width: 400, textAlign: "center"}}>
          <Space direction="vertical" size="large" style={{width: "100%"}}>
            <Spin size="large"/>
            <Title level={4}>Đang xác minh thanh toán...</Title>
            <Text type="secondary">Vui lòng đợi trong giây lát</Text>
          </Space>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error || !paymentStatus) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f0f2f5",
        }}
      >
        <Card style={{width: 500}}>
          <Result
            status="error"
            title="Không thể xác minh thanh toán"
            subTitle="Vui lòng liên hệ bộ phận hỗ trợ nếu bạn đã thanh toán thành công"
            extra={[
              <Button type="primary" key="home" onClick={handleBackToHome}>
                Về trang chủ
              </Button>,
            ]}
          />
        </Card>
      </div>
    );
  }

  // Show success state
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
          status="success"
          icon={<CheckCircleOutlined style={{color: "#52c41a"}}/>}
          title="Thanh toán thành công!"
          subTitle={paymentStatus.message || "Đơn hàng của bạn đã được xử lý thành công"}
          extra={[
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
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Mã thanh toán">
              <Text strong>{paymentStatus.payment_id}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Mã đơn hàng">
              <Text strong>{paymentStatus.sales_order_id}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Số tiền">
              <Text strong style={{color: "#1890ff", fontSize: "16px"}}>
                ₫{paymentStatus.amount?.toLocaleString()}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Text strong style={{color: "#52c41a"}}>
                {paymentStatus.status === "COMPLETED" ? "Hoàn thành" : paymentStatus.status}
              </Text>
            </Descriptions.Item>
            {paymentStatus.transaction_id && (
              <Descriptions.Item label="Mã giao dịch">
                <Text code>{paymentStatus.transaction_id}</Text>
              </Descriptions.Item>
            )}
            {paymentStatus.paid_at && (
              <Descriptions.Item label="Thời gian thanh toán">
                {new Date(paymentStatus.paid_at).toLocaleString("vi-VN")}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Result>
      </Card>
    </div>
  );
};

const SuccessPaymentPage = () => {
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
      <SuccessPaymentContent />
    </Suspense>
  );
};

export default SuccessPaymentPage;
