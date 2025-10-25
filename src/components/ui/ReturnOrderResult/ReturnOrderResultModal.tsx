"use client";
import React from "react";
import {
  Modal,
  Result,
  Descriptions,
  Typography,
  Space,
  Button,
  Divider,
  Table,
  Tag,
  Alert,
  Tabs,
} from "antd";
import {
  CheckCircleOutlined,
  UndoOutlined,
  PrinterOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { SaleReturnResponse } from "@/lib/api";
import PromotionSnapshot from "@/components/ui/Invoice/PromotionSnapshot";

const { Text } = Typography;

interface ReturnOrderResultModalProps {
  visible: boolean;
  returnData: SaleReturnResponse | null;
  onClose: () => void;
  onPrint?: () => void;
}

const ReturnOrderResultModal: React.FC<ReturnOrderResultModalProps> = ({
  visible,
  returnData,
  onClose,
  onPrint,
}) => {
  if (!returnData) return null;

  // Calculate discount ratio from order (same logic as backend)
  const calculateDiscountRatio = (): number => {
    if (
      returnData.sales_order.original_amount &&
      returnData.sales_order.final_amount &&
      returnData.sales_order.original_amount > 0
    ) {
      return (
        returnData.sales_order.final_amount /
        returnData.sales_order.original_amount
      );
    }
    return 1; // No discount
  };

  // Calculate discounted unit price for display
  const getDiscountedUnitPrice = (unitPrice: number): number => {
    const discountRatio = calculateDiscountRatio();
    return unitPrice * discountRatio;
  };

  // Calculate original total (before discount)
  const calculateOriginalTotal = () => {
    return returnData.sales_order.lines.reduce((sum, line) => {
      if (line.is_free_item) return sum;
      return sum + line.quantity * line.unit_price;
    }, 0);
  };

  // Calculate return amount with discount applied (what customer actually paid)
  const calculateReturnTotal = () => {
    const discountRatio = calculateDiscountRatio();
    return returnData.sales_order.lines.reduce((sum, line) => {
      if (line.is_free_item) return sum;
      // Apply discount ratio to reflect actual price paid
      const actualPricePaid = line.quantity * line.unit_price * discountRatio;
      return sum + actualPricePaid;
    }, 0);
  };

  const hasDiscount =
    returnData.sales_order.total_discount_amount &&
    returnData.sales_order.total_discount_amount > 0;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={[
        onPrint && (
          <Button
            key="print"
            icon={<PrinterOutlined />}
            onClick={onPrint}
          >
            In phiếu hoàn trả
          </Button>
        ),
        <Button
          key="close"
          type="primary"
          onClick={onClose}
        >
          Đóng
        </Button>,
      ]}
      width={700}
      centered
    >
      <Result
        status="success"
        icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
        title={
          <Space
            direction="vertical"
            size={0}
          >
            <Text
              strong
              style={{ fontSize: 20 }}
            >
              Hoàn trả đơn hàng thành công!
            </Text>
          </Space>
        }
        subTitle={
          <Space
            direction="vertical"
            style={{ marginTop: 16 }}
            size={8}
          >
            <Text>
              Mã phiếu hoàn trả:{" "}
              <Text
                strong
                underline
                copyable
              >
                {returnData.id}
              </Text>
            </Text>
            <Text type="secondary">
              {dayjs(returnData.created_date).format("DD/MM/YYYY HH:mm:ss")}
            </Text>
          </Space>
        }
      />

      {/* Thông tin chung */}
      <Descriptions
        column={1}
        bordered
        size="small"
      >
        <Descriptions.Item label="Mã đơn hàng gốc">
          <Text
            strong
            underline
            copyable
          >
            {returnData.sales_order.id}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label="Khách hàng">
          {returnData.sales_order.customer?.full_name || "Khách lẻ"}
        </Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">
          {returnData.sales_order.customer?.phone_number || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Chi nhánh">
          {returnData.branch.branch_name}
        </Descriptions.Item>
        <Descriptions.Item label="Người thực hiện">
          {returnData.created_by}
        </Descriptions.Item>

        {/* Pricing with Discount */}
        {hasDiscount ? (
          <>
            <Descriptions.Item label="Tổng tiền gốc">
              <Text style={{ fontSize: 14 }}>
                ₫{calculateOriginalTotal().toLocaleString()}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Giảm giá">
              <Tag
                color="red"
                icon={<GiftOutlined />}
              >
                -₫
                {returnData.sales_order.total_discount_amount?.toLocaleString()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tiền hoàn trả">
              <Space
                direction="vertical"
                size={2}
              >
                <Text
                  strong
                  style={{ fontSize: 16, color: "#52c41a" }}
                >
                  ₫{calculateReturnTotal().toLocaleString()}
                </Text>
                <Text
                  type="secondary"
                  style={{ fontSize: 11 }}
                >
                  (Số tiền khách đã thanh toán)
                </Text>
              </Space>
            </Descriptions.Item>
          </>
        ) : (
          <Descriptions.Item label="Tổng tiền hoàn trả">
            <Text
              strong
              style={{ fontSize: 16, color: "#ff4d4f" }}
            >
              ₫{calculateReturnTotal().toLocaleString()}
            </Text>
          </Descriptions.Item>
        )}
      </Descriptions>

      <Divider />

      {/* Tabs cho sản phẩm, khuyến mãi và lý do */}
      <Tabs
        defaultActiveKey="products"
        items={[
          {
            key: "products",
            label: "Sản phẩm",
            children: (
              <>
                {hasDiscount && (
                  <Alert
                    message="Lưu ý"
                    description="Giá hiển thị là giá sau khi áp dụng khuyến mãi (giá khách đã thanh toán thực tế)"
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                )}
                <Table
                  dataSource={returnData.sales_order.lines}
                  columns={[
                    {
                      title: "Sản phẩm",
                      dataIndex: ["product", "product_name"],
                      key: "product_name",
                    },
                    {
                      title: "Mã SP",
                      dataIndex: ["product", "sku"],
                      key: "sku",
                      width: 100,
                    },
                    {
                      title: "Số lượng",
                      dataIndex: "quantity",
                      key: "quantity",
                      width: 100,
                      align: "center" as const,
                    },
                    {
                      title: "Đơn giá",
                      dataIndex: "unit_price",
                      key: "unit_price",
                      width: 130,
                      render: (price: number, record) => {
                        if (record.is_free_item) {
                          return (
                            <Text
                              type="success"
                              strong
                            >
                              MIỄN PHÍ
                            </Text>
                          );
                        }

                        if (!hasDiscount) {
                          return `₫${price.toLocaleString()}`;
                        }

                        const discountedPrice = getDiscountedUnitPrice(price);
                        return (
                          <div>
                            <div>₫{discountedPrice.toLocaleString()}</div>
                            <Text
                              type="secondary"
                              delete
                              style={{ fontSize: "11px" }}
                            >
                              ₫{price.toLocaleString()}
                            </Text>
                          </div>
                        );
                      },
                    },
                    {
                      title: "Thành tiền",
                      key: "total",
                      width: 150,
                      align: "right" as const,
                      render: (_, record) => {
                        if (record.is_free_item) {
                          return (
                            <Text
                              type="success"
                              strong
                            >
                              ₫0
                            </Text>
                          );
                        }

                        if (!hasDiscount) {
                          return (
                            <Text
                              strong
                              style={{ color: "#ff4d4f" }}
                            >
                              ₫
                              {(
                                record.quantity * record.unit_price
                              ).toLocaleString()}
                            </Text>
                          );
                        }

                        const discountedPrice = getDiscountedUnitPrice(
                          record.unit_price
                        );
                        const lineTotal = record.quantity * discountedPrice;
                        const originalTotal =
                          record.quantity * record.unit_price;

                        return (
                          <div>
                            <Text
                              strong
                              style={{ color: "#52c41a" }}
                            >
                              ₫{lineTotal.toLocaleString()}
                            </Text>
                            <div>
                              <Text
                                type="secondary"
                                delete
                                style={{ fontSize: "11px" }}
                              >
                                ₫{originalTotal.toLocaleString()}
                              </Text>
                            </div>
                          </div>
                        );
                      },
                    },
                  ]}
                  pagination={false}
                  rowKey={(record) => record.id}
                  size="small"
                  scroll={{ y: 200 }}
                />
              </>
            ),
          },
          {
            key: "promotions",
            label: "Khuyến mãi",
            children: (
              <PromotionSnapshot
                snapshotJson={returnData.sales_order.promotion_snapshot}
                totalDiscountAmount={
                  returnData.sales_order.total_discount_amount
                }
                discountPercentage={returnData.sales_order.discount_percentage}
                originalAmount={returnData.sales_order.original_amount}
                finalAmount={
                  returnData.sales_order.final_amount ?? calculateReturnTotal()
                }
                orderLines={returnData.sales_order.lines}
              />
            ),
          },
          {
            key: "reason",
            label: "Lý do trả hàng",
            children: (
              <Alert
                message="Lý do hoàn trả"
                description={
                  <Text
                    style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                  >
                    {returnData.reason || "Không có lý do"}
                  </Text>
                }
                type="info"
                showIcon
              />
            ),
          },
        ]}
      />
    </Modal>
  );
};

export default ReturnOrderResultModal;
