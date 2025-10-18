import React from "react";
import { Card, Tag, Descriptions, Typography, Space, Divider } from "antd";
import {
  GiftOutlined,
  PercentageOutlined,
  TagOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

interface PromotionLine {
  line_type: string;
  discount_type: string;
  discount_value?: number;
  buy_qty?: number;
  get_qty?: number;
  free_product_name?: string;
  free_quantity?: number;
  max_discount_amount?: number;
  min_order_value?: number;
  min_quantity?: number;
}

interface PromotionSnapshotItem {
  promotion_id: string;
  code: string;
  name: string;
  description?: string;
  discount_lines: PromotionLine[];
  priority: number;
  is_stackable: boolean;
}

interface PromotionSnapshotProps {
  snapshotJson?: string;
  totalDiscountAmount?: number;
  discountPercentage?: number;
  originalAmount?: number;
  finalAmount?: number; // Final amount after discount
}

const PromotionSnapshot: React.FC<PromotionSnapshotProps> = ({
  snapshotJson,
  totalDiscountAmount,
  discountPercentage,
  originalAmount,
  finalAmount,
}) => {
  // Parse snapshot JSON
  const promotions: PromotionSnapshotItem[] = React.useMemo(() => {
    if (!snapshotJson) return [];
    try {
      return JSON.parse(snapshotJson);
    } catch (error) {
      console.error("Failed to parse promotion snapshot:", error);
      return [];
    }
  }, [snapshotJson]);

  // Helper functions
  const getDiscountTypeLabel = (type: string): string => {
    switch (type) {
      case "PERCENT":
        return "Giảm %";
      case "AMOUNT":
        return "Giảm tiền";
      case "BUY_X_GET_Y":
        return "Mua X tặng Y";
      case "FREE_PRODUCT":
        return "Tặng sản phẩm";
      case "FIXED_PRICE":
        return "Giá cố định";
      default:
        return type;
    }
  };

  const getDiscountTypeColor = (type: string): string => {
    switch (type) {
      case "PERCENT":
        return "blue";
      case "AMOUNT":
        return "green";
      case "BUY_X_GET_Y":
        return "purple";
      case "FREE_PRODUCT":
        return "orange";
      case "FIXED_PRICE":
        return "cyan";
      default:
        return "default";
    }
  };

  const formatDiscountDescription = (line: PromotionLine): string => {
    switch (line.discount_type) {
      case "PERCENT": {
        const percentDesc = `Giảm ${line.discount_value}%`;
        if (line.max_discount_amount && line.max_discount_amount > 0) {
          return `${percentDesc} (tối đa ₫${line.max_discount_amount.toLocaleString()})`;
        }
        return percentDesc;
      }
      case "AMOUNT":
        return `Giảm ₫${line.discount_value?.toLocaleString()}`;
      case "BUY_X_GET_Y":
        return `Mua ${line.buy_qty} tặng ${line.get_qty}`;
      case "FREE_PRODUCT":
        return `Tặng ${line.free_product_name} x${line.free_quantity}`;
      case "FIXED_PRICE":
        return `Giá cố định ₫${line.discount_value?.toLocaleString()}`;
      default:
        return "";
    }
  };

  if (promotions.length === 0) {
    return null;
  }

  return (
    <Card
      title={
        <Space>
          <GiftOutlined style={{ color: "#ff4d4f" }} />
          <span>Thông tin khuyến mãi đã áp dụng</span>
        </Space>
      }
      style={{ marginTop: 16 }}
      bordered={false}
    >
      {/* Summary */}
      {(totalDiscountAmount !== undefined ||
        discountPercentage !== undefined) && (
        <>
          <Descriptions
            column={3}
            bordered
            size="small"
            style={{ marginBottom: 16 }}
          >
            {totalDiscountAmount !== undefined && totalDiscountAmount > 0 && (
              <Descriptions.Item
                label="Tổng tiền gốc"
                span={1}
              >
                <Text strong>
                  ₫
                  {(
                    originalAmount ||
                    (finalAmount === undefined
                      ? totalDiscountAmount
                      : finalAmount + totalDiscountAmount)
                  ).toLocaleString()}
                </Text>
              </Descriptions.Item>
            )}
            {totalDiscountAmount !== undefined && (
              <Descriptions.Item
                label="Tổng giảm giá"
                span={1}
              >
                <Text
                  strong
                  style={{ color: "#ff4d4f" }}
                >
                  -₫{totalDiscountAmount.toLocaleString()}
                </Text>
              </Descriptions.Item>
            )}
            {discountPercentage !== undefined && discountPercentage > 0 && (
              <Descriptions.Item
                label="% Giảm giá"
                span={1}
              >
                <Tag
                  icon={<PercentageOutlined />}
                  color="red"
                >
                  {discountPercentage.toFixed(2)}%
                </Tag>
              </Descriptions.Item>
            )}
          </Descriptions>
          <Divider style={{ margin: "12px 0" }} />
        </>
      )}

      {/* Promotion Details */}
      <div>
        <Title
          level={5}
          style={{ marginBottom: 12 }}
        >
          <TagOutlined /> Danh sách khuyến mãi ({promotions.length})
        </Title>
        <Space
          direction="vertical"
          style={{ width: "100%" }}
          size="middle"
        >
          {promotions.map((promo, index) => (
            <Card
              key={promo.promotion_id || index}
              type="inner"
              size="small"
              title={
                <Space>
                  {promo.code && (
                    <Tag
                      color="purple"
                      style={{ fontSize: "13px" }}
                    >
                      {promo.code}
                    </Tag>
                  )}
                  <Text strong>{promo.name}</Text>
                  {promo.is_stackable && (
                    <Tag
                      color="blue"
                      style={{ fontSize: "11px" }}
                    >
                      Cộng dồn
                    </Tag>
                  )}
                  <Tag
                    color="default"
                    style={{ fontSize: "11px" }}
                  >
                    Ưu tiên: {promo.priority}
                  </Tag>
                </Space>
              }
            >
              {promo.description && (
                <Text
                  type="secondary"
                  style={{ display: "block", marginBottom: 8 }}
                >
                  {promo.description}
                </Text>
              )}

              {/* Discount Lines */}
              {promo.discount_lines.map((line, lineIndex) => (
                <div
                  key={lineIndex}
                  style={{
                    padding: "8px 12px",
                    background: "#fafafa",
                    borderRadius: "6px",
                    marginBottom:
                      lineIndex < promo.discount_lines.length - 1 ? 8 : 0,
                  }}
                >
                  <Space
                    direction="vertical"
                    size={4}
                    style={{ width: "100%" }}
                  >
                    <Space>
                      <Tag color={getDiscountTypeColor(line.discount_type)}>
                        {getDiscountTypeLabel(line.discount_type)}
                      </Tag>
                      <Text strong>{formatDiscountDescription(line)}</Text>
                    </Space>

                    {/* Conditions */}
                    <Space
                      direction="vertical"
                      size={2}
                    >
                      {line.min_order_value && line.min_order_value > 0 && (
                        <Text
                          type="secondary"
                          style={{ fontSize: "12px" }}
                        >
                          • Đơn hàng tối thiểu: ₫
                          {line.min_order_value.toLocaleString()}
                        </Text>
                      )}

                      {line.min_quantity && line.min_quantity > 0 && (
                        <Text
                          type="secondary"
                          style={{ fontSize: "12px" }}
                        >
                          • Số lượng tối thiểu: {line.min_quantity} sản phẩm
                        </Text>
                      )}

                      {line.max_discount_amount &&
                        line.max_discount_amount > 0 &&
                        line.discount_type === "PERCENT" && (
                          <Text
                            type="secondary"
                            style={{ fontSize: "12px", color: "#ff4d4f" }}
                          >
                            • Giảm tối đa: ₫
                            {line.max_discount_amount.toLocaleString()}
                          </Text>
                        )}

                      {line.line_type && line.line_type !== "ALL" && (
                        <Text
                          type="secondary"
                          style={{ fontSize: "12px" }}
                        >
                          • Áp dụng cho: {line.line_type}
                        </Text>
                      )}
                    </Space>
                  </Space>
                </div>
              ))}
            </Card>
          ))}
        </Space>
      </div>
    </Card>
  );
};

export default PromotionSnapshot;
