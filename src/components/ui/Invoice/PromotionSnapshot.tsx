import React from "react";
import { Card, Tag, Descriptions, Typography, Space, Divider } from "antd";
import {
  GiftOutlined,
  PercentageOutlined,
  TagOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

/**
 * Promotion Snapshot Formats
 *
 * === LEGACY FORMAT (Old orders - backward compatibility) ===
 * [{
 *   promotion_id: string,
 *   promotion_code?: string,  // or "code"
 *   name: string,
 *   description?: string
 * }]
 *
 * === NEW FORMAT (Current implementation) ===
 * [{
 *   promotion_id: string,
 *   code?: string,
 *   promotion_code?: string,
 *   name: string,
 *   description?: string,
 *   discount_lines?: [{
 *     line_type?: string,
 *     discount_type?: string,
 *     discount_value?: number,
 *     buy_qty?: number,
 *     get_qty?: number,
 *     free_product_name?: string,
 *     free_quantity?: number,
 *     max_discount_amount?: number,
 *     min_order_value?: number,
 *     min_quantity?: number
 *   }],
 *   priority?: number,
 *   is_stackable?: boolean,
 *   start_at?: string,
 *   end_at?: string,
 *   usage_limit?: number,
 *   per_customer_limit?: number,
 *   coupon_redeem_once?: boolean,
 *   branch?: {
 *     branch_id: string,
 *     branch_name: string,
 *     branch_url?: string
 *   } | null
 * }]
 */

interface PromotionLine {
  line_type?: string;
  target_id?: string; // Product ID, Category ID, or Service ID
  discount_type?: string;
  discount_value?: number;
  buy_qty?: number;
  get_qty?: number;
  free_product_name?: string;
  free_quantity?: number;
  max_discount_amount?: number;
  min_order_value?: number;
  min_quantity?: number;
}

// New snapshot format (full version)
interface PromotionSnapshotItem {
  promotion_id: string;
  code?: string;
  promotion_code?: string; // Alternative field name
  name: string;
  description?: string;
  discount_lines?: PromotionLine[]; // Optional for backward compatibility
  priority?: number;
  is_stackable?: boolean;
  start_at?: string;
  end_at?: string;
  usage_limit?: number;
  per_customer_limit?: number;
  coupon_redeem_once?: boolean;
  branch?: {
    branch_id: string;
    branch_name: string;
    branch_url?: string;
  } | null;
}

interface PromotionSnapshotProps {
  snapshotJson?: string;
  totalDiscountAmount?: number;
  discountPercentage?: number;
  originalAmount?: number;
  finalAmount?: number; // Final amount after discount
  orderLines?: Array<{
    // Order line data to filter applicable discount lines
    product?: {
      product_id: string;
      product_name: string;
    };
    quantity: number;
    is_free_item?: boolean;
  }>;
}

const PromotionSnapshot: React.FC<PromotionSnapshotProps> = ({
  snapshotJson,
  totalDiscountAmount,
  discountPercentage,
  originalAmount,
  finalAmount,
  orderLines = [],
}) => {
  // Parse snapshot JSON
  const promotions: PromotionSnapshotItem[] = React.useMemo(() => {
    if (!snapshotJson) return [];
    try {
      return JSON.parse(snapshotJson);
    } catch (error) {
      console.log("Failed to parse promotion snapshot:", error);
      return [];
    }
  }, [snapshotJson]);

  // Get product IDs from order lines
  const orderProductIds = React.useMemo(() => {
    return new Set(
      orderLines
        .filter((line) => line.product?.product_id)
        .map((line) => line.product!.product_id)
    );
  }, [orderLines]);

  // Filter discount lines that were actually applied in this order
  const filterApplicableLines = (
    lines: PromotionLine[] | undefined
  ): PromotionLine[] => {
    if (!lines || lines.length === 0) return [];

    return lines.filter((line) => {
      // For ALL type - always show
      if (line.line_type === "ALL") return true;

      // For PRODUCT type - check if product is in order
      if (line.line_type === "PRODUCT" && line.target_id) {
        return orderProductIds.has(line.target_id);
      }

      // For CATEGORY/SERVICE - show all (we don't have detailed matching logic here)
      return true;
    });
  };

  // Get product name from order lines
  const getProductName = (productId: string | undefined): string => {
    if (!productId) return "";
    const orderLine = orderLines.find(
      (line) => line.product?.product_id === productId
    );
    return orderLine?.product?.product_name || "";
  };

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
      variant="outlined"
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
          {promotions.map((promo, index) => {
            // Get code from either field (backward compatibility)
            const promoCode = promo.code || promo.promotion_code;

            // Filter discount lines to only show those applicable to this order
            const applicableLines = filterApplicableLines(promo.discount_lines);

            return (
              <Card
                key={promo.promotion_id || index}
                type="inner"
                size="small"
                title={
                  <Space>
                    {promoCode && (
                      <Tag
                        color="purple"
                        style={{ fontSize: "13px" }}
                      >
                        {promoCode}
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
                    {promo.priority !== undefined && (
                      <Tag
                        color="default"
                        style={{ fontSize: "11px" }}
                      >
                        Ưu tiên: {promo.priority}
                      </Tag>
                    )}
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

                {/* Discount Lines - Only show applicable lines */}
                {applicableLines.length > 0 ? (
                  applicableLines.map((line, lineIndex) => {
                    // Get actual product name from order if available
                    const targetProductName =
                      line.line_type === "PRODUCT" && line.target_id
                        ? getProductName(line.target_id)
                        : "";

                    return (
                      <div
                        key={`${promo.promotion_id}-line-${lineIndex}`}
                        style={{
                          padding: "8px 12px",
                          background: "#fafafa",
                          borderRadius: "6px",
                          marginBottom:
                            lineIndex < applicableLines.length - 1 ? 8 : 0,
                        }}
                      >
                        <Space
                          direction="vertical"
                          size={4}
                          style={{ width: "100%" }}
                        >
                          <Space>
                            <Tag
                              color={getDiscountTypeColor(
                                line.discount_type || ""
                              )}
                            >
                              {getDiscountTypeLabel(line.discount_type || "")}
                            </Tag>
                            <Text strong>
                              {formatDiscountDescription(line)}
                            </Text>
                          </Space>

                          {/* Conditions */}
                          <Space
                            direction="vertical"
                            size={2}
                          >
                            {/* Show target product name instead of generic "PRODUCT" */}
                            {targetProductName && (
                              <Text
                                type="secondary"
                                style={{ fontSize: "12px" }}
                              >
                                • Áp dụng cho:{" "}
                                <strong>{targetProductName}</strong>
                              </Text>
                            )}

                            {!targetProductName &&
                              line.line_type &&
                              line.line_type !== "ALL" && (
                                <Text
                                  type="secondary"
                                  style={{ fontSize: "12px" }}
                                >
                                  • Áp dụng cho: {line.line_type}
                                </Text>
                              )}

                            {line.min_order_value &&
                              line.min_order_value > 0 && (
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
                                • Số lượng tối thiểu: {line.min_quantity} sản
                                phẩm
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
                          </Space>
                        </Space>
                      </div>
                    );
                  })
                ) : (
                  // Fallback for legacy snapshots without discount_lines
                  <Text
                    type="secondary"
                    italic
                    style={{ fontSize: "12px" }}
                  >
                    Khuyến mãi đã được áp dụng (chi tiết không khả dụng cho đơn
                    hàng cũ)
                  </Text>
                )}
              </Card>
            );
          })}
        </Space>
      </div>
    </Card>
  );
};

export default PromotionSnapshot;
