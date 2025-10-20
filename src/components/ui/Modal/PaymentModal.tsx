import React from "react";
import {
  Modal,
  Space,
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Radio,
  InputNumber,
  Button,
  QRCode,
  Divider,
} from "antd";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  BankOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import type { UserManagementInfo } from "@/lib/api";
import type { CartSummary } from "@/lib/utils/promotion-calculator";

const { Text, Title } = Typography;

interface PaymentModalProps {
  isVisible: boolean;
  isCreatingOrder: boolean;
  paymentMethod: "CASH" | "BANK";
  receivedAmount: number;
  totalAmount: number;
  totalItems: number;
  selectedCustomer: UserManagementInfo | null;
  paymentQRCode: string | null;
  paymentUrl: string | null;
  orderCode: number | null;
  cartSummary?: CartSummary;
  onCancel: () => void;
  onPayment: () => void;
  onPaymentMethodChange: (method: "CASH" | "BANK") => void;
  onReceivedAmountChange: (amount: number) => void;
  onOpenPaymentLink: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isVisible,
  isCreatingOrder,
  paymentMethod,
  receivedAmount,
  totalAmount,
  totalItems,
  selectedCustomer,
  paymentQRCode,
  paymentUrl,
  orderCode,
  cartSummary,
  onCancel,
  onPayment,
  onPaymentMethodChange,
  onReceivedAmountChange,
  onOpenPaymentLink,
}) => {
  const getChange = () => {
    const finalAmount = cartSummary?.finalTotal || totalAmount;
    return Math.max(0, receivedAmount - finalAmount);
  };

  const getFinalAmount = () => {
    return cartSummary?.finalTotal || totalAmount;
  };

  const renderQRCodeView = () => (
    <div style={{ textAlign: "center" }}>
      <Title level={4}>Quét mã QR để thanh toán</Title>

      {paymentQRCode && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "24px",
            padding: "20px",
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
          }}
        >
          <QRCode
            value={paymentQRCode}
            size={280}
          />
        </div>
      )}

      <Card
        size="small"
        style={{ backgroundColor: "#e6f7ff", marginBottom: "16px" }}
      >
        <Space
          direction="vertical"
          style={{ width: "100%" }}
        >
          <Row justify="space-between">
            <Text strong>Mã đơn hàng:</Text>
            <Text>{orderCode}</Text>
          </Row>
          {cartSummary && cartSummary.totalDiscount > 0 && (
            <>
              <Row justify="space-between">
                <Text strong>Tổng tiền hàng:</Text>
                <Text>₫{cartSummary.subtotal.toLocaleString()}</Text>
              </Row>
              <Row justify="space-between">
                <Text
                  strong
                  style={{ color: "#52c41a" }}
                >
                  Giảm giá:
                </Text>
                <Text style={{ color: "#52c41a" }}>
                  -₫{cartSummary.totalDiscount.toLocaleString()}
                </Text>
              </Row>
            </>
          )}
          <Row justify="space-between">
            <Text strong>Số tiền thanh toán:</Text>
            <Text
              style={{ fontSize: "18px", color: "#1890ff", fontWeight: "bold" }}
            >
              ₫{getFinalAmount().toLocaleString()}
            </Text>
          </Row>
        </Space>
      </Card>

      <Text
        type="secondary"
        style={{ display: "block", marginBottom: "16px" }}
      >
        Sau khi thanh toán thành công, bạn sẽ được chuyển hướng tự động
      </Text>

      {paymentUrl && (
        <Button
          type="primary"
          size="large"
          icon={<BankOutlined />}
          onClick={onOpenPaymentLink}
          style={{ width: "100%" }}
        >
          Mở link thanh toán trong tab mới
        </Button>
      )}
    </div>
  );

  const renderPaymentForm = () => (
    <Space
      direction="vertical"
      style={{ width: "100%" }}
      size="large"
    >
      {/* Order Summary */}
      <Card
        size="small"
        style={{ backgroundColor: "#f5f5f5" }}
      >
        <Space
          direction="vertical"
          style={{ width: "100%" }}
          size="small"
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Statistic
                title="Tổng sản phẩm"
                value={totalItems}
                prefix={<ShoppingCartOutlined />}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Tổng tiền hàng"
                value={cartSummary?.subtotal || totalAmount}
                prefix="₫"
                valueStyle={{ color: "#595959" }}
              />
            </Col>
          </Row>

          {cartSummary && cartSummary.totalDiscount > 0 && (
            <>
              <Divider style={{ margin: "8px 0" }} />
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Card
                    size="small"
                    style={{
                      backgroundColor: "#f6ffed",
                      border: "1px solid #b7eb8f",
                    }}
                  >
                    <Space
                      direction="vertical"
                      style={{ width: "100%" }}
                      size={4}
                    >
                      <Row justify="space-between">
                        <Space>
                          <GiftOutlined style={{ color: "#52c41a" }} />
                          <Text
                            strong
                            style={{ color: "#52c41a" }}
                          >
                            Khuyến mãi:
                          </Text>
                        </Space>
                        <Text
                          strong
                          style={{ color: "#52c41a" }}
                        >
                          -₫{cartSummary.totalDiscount.toLocaleString()}
                        </Text>
                      </Row>
                      {cartSummary.appliedPromotions.map((promo) => (
                        <Row
                          key={promo.promotionId}
                          justify="space-between"
                          style={{ paddingLeft: 24 }}
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
                    </Space>
                  </Card>
                </Col>
              </Row>
              <Divider style={{ margin: "8px 0" }} />
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Statistic
                    title="Tổng thanh toán"
                    value={cartSummary.finalTotal}
                    prefix="₫"
                    valueStyle={{
                      color: "#1890ff",
                      fontSize: 24,
                      fontWeight: "bold",
                    }}
                  />
                </Col>
              </Row>
            </>
          )}
        </Space>
      </Card>

      {/* Customer Info */}
      <div>
        <Text
          strong
          style={{ display: "block", marginBottom: "8px" }}
        >
          Thông tin khách hàng:
        </Text>
        <Card size="small">
          <Row gutter={[8, 8]}>
            <Col span={8}>
              <Text type="secondary">Tên:</Text>
            </Col>
            <Col span={16}>
              <Text strong>{selectedCustomer?.full_name || "Khách lẻ"}</Text>
            </Col>
            <Col span={8}>
              <Text type="secondary">SĐT:</Text>
            </Col>
            <Col span={16}>
              <Text>{selectedCustomer?.phone_number || "N/A"}</Text>
            </Col>
          </Row>
        </Card>
      </div>

      {/* Payment Method */}
      <div>
        <Text
          strong
          style={{ display: "block", marginBottom: "8px" }}
        >
          Phương thức thanh toán:
        </Text>
        <Radio.Group
          value={paymentMethod}
          onChange={(e) => onPaymentMethodChange(e.target.value)}
          style={{ width: "100%" }}
        >
          <Space
            direction="vertical"
            style={{ width: "100%" }}
          >
            <Radio value="CASH">
              <Space>
                <DollarOutlined />
                <span>Tiền mặt</span>
              </Space>
            </Radio>
            <Radio value="BANK">
              <Space>
                <BankOutlined />
                <span>Chuyển khoản ngân hàng</span>
              </Space>
            </Radio>
          </Space>
        </Radio.Group>
      </div>

      {/* Cash Payment Details */}
      {paymentMethod === "CASH" && (
        <div>
          <Text
            strong
            style={{ display: "block", marginBottom: "8px" }}
          >
            Số tiền nhận:
          </Text>
          <InputNumber
            value={receivedAmount}
            onChange={(value) => onReceivedAmountChange(value || 0)}
            style={{ width: "100%" }}
            size="large"
            formatter={(value) =>
              `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => Number(value!.replace(/₫\s?|(,*)/g, ""))}
            min={0}
          />

          {receivedAmount >= totalAmount && receivedAmount > 0 && (
            <Card
              size="small"
              style={{
                marginTop: "12px",
                backgroundColor: "#f6ffed",
                borderColor: "#b7eb8f",
              }}
            >
              <Row
                justify="space-between"
                align="middle"
              >
                <Col>
                  <Text
                    strong
                    style={{ color: "#52c41a" }}
                  >
                    Tiền thừa:
                  </Text>
                </Col>
                <Col>
                  <Text
                    strong
                    style={{ color: "#52c41a", fontSize: "18px" }}
                  >
                    ₫{getChange().toLocaleString()}
                  </Text>
                </Col>
              </Row>
            </Card>
          )}

          {receivedAmount < totalAmount && receivedAmount > 0 && (
            <Card
              size="small"
              style={{
                marginTop: "12px",
                backgroundColor: "#fff2e8",
                borderColor: "#ffbb96",
              }}
            >
              <Row
                justify="space-between"
                align="middle"
              >
                <Col>
                  <Text
                    strong
                    style={{ color: "#fa8c16" }}
                  >
                    Còn thiếu:
                  </Text>
                </Col>
                <Col>
                  <Text
                    strong
                    style={{ color: "#fa8c16", fontSize: "18px" }}
                  >
                    ₫{(totalAmount - receivedAmount).toLocaleString()}
                  </Text>
                </Col>
              </Row>
            </Card>
          )}
        </div>
      )}

      {/* Bank Payment Info */}
      {paymentMethod === "BANK" && (
        <Card
          size="small"
          style={{ backgroundColor: "#e6f7ff" }}
        >
          <Space
            direction="vertical"
            style={{ width: "100%" }}
          >
            <Text strong>
              <BankOutlined /> Thanh toán qua ngân hàng
            </Text>
            <Text type="secondary">
              {`Sau khi nhấn "Xác nhận thanh toán", bạn sẽ nhận được mã QR để quét
              thanh toán`}
            </Text>
          </Space>
        </Card>
      )}
    </Space>
  );

  const renderFooter = () => {
    if (paymentQRCode || paymentUrl) {
      return (
        <Space>
          <Button onClick={onCancel}>Đóng</Button>
          {paymentUrl && (
            <Button
              type="primary"
              onClick={onOpenPaymentLink}
            >
              Mở link thanh toán
            </Button>
          )}
        </Space>
      );
    }

    return (
      <Space>
        <Button onClick={onCancel}>Hủy</Button>
        <Button
          type="primary"
          onClick={() => {
            console.log("🔧 PaymentModal: onPayment clicked", {
              paymentMethod,
              receivedAmount,
              totalAmount,
              isCreatingOrder
            });
            onPayment();
          }}
          loading={isCreatingOrder}
          disabled={paymentMethod === "CASH" && receivedAmount < totalAmount}
        >
          Xác nhận thanh toán
        </Button>
      </Space>
    );
  };

  return (
    <Modal
      title={
        <Space>
          <DollarOutlined />
          <span>Thanh toán</span>
        </Space>
      }
      open={isVisible}
      onCancel={onCancel}
      footer={renderFooter()}
      width={600}
    >
      {paymentQRCode || paymentUrl ? renderQRCodeView() : renderPaymentForm()}
    </Modal>
  );
};
