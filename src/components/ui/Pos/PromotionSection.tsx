"use client";

import React, { useMemo } from "react";
import { Space, Tag, Empty, List, Typography, Tooltip, Alert } from "antd";
import { CheckCircleOutlined, PercentageOutlined } from "@ant-design/icons";
import type { Promotion } from "@/lib/api/types/promotion.types";
import type { BranchDisplay } from "@/lib/api/types/branch.types";
import type { CartItem } from "./CartSection";
import { isPromotionApplicable } from "@/lib/utils/promotion-calculator";

const { Text } = Typography;

interface PromotionSectionProps {
  promotions: Promotion[];
  selectedPromotions: Promotion[];
  cart: CartItem[];
  productLookup: Map<
    string,
    { name: string; price: number; stock: number; category: string }
  >;
  selectedBranch: BranchDisplay | null;
  onTogglePromotion: (promotion: Promotion) => void;
}

const PromotionSection: React.FC<PromotionSectionProps> = ({
  promotions,
  selectedPromotions,
  cart,
  productLookup,
  selectedBranch,
  onTogglePromotion,
}) => {
  // Check applicability for each promotion
  const promotionsWithStatus = useMemo(() => {
    console.log("🔍 Processing promotions:", {
      totalPromotions: promotions.length,
      cartItems: cart.length,
      promotions: promotions,
      cart: cart,
    });

    return promotions.map((promo) => {
      const applicable = isPromotionApplicable(promo, cart);
      console.log(`   Promotion "${promo.name}" applicable:`, applicable);
      return {
        ...promo,
        _isApplicable: applicable,
      };
    });
  }, [promotions, cart]);

  // If no branch selected, show warning
  if (!selectedBranch) {
    return (
      <Alert
        message="Vui lòng chọn chi nhánh"
        description="Bạn cần chọn chi nhánh trước khi chọn khuyến mãi."
        type="warning"
        showIcon
      />
    );
  }

  const isSelected = (promotion: Promotion) => {
    return selectedPromotions.some(
      (p) => p.promotion_id === promotion.promotion_id
    );
  };

  const getPromotionStatusColor = (promotion: Promotion) => {
    const now = new Date();
    const endDate = promotion.end_at ? new Date(promotion.end_at) : null;

    if (endDate && now > endDate) return "red";
    if (!isPromotionApplicable(promotion, cart)) return "default";
    return "green";
  };

  const getPromotionStatusText = (promotion: Promotion) => {
    const now = new Date();
    const endDate = promotion.end_at ? new Date(promotion.end_at) : null;

    if (endDate && now > endDate) return "Hết hạn";
    if (!isPromotionApplicable(promotion, cart)) return "Không áp dụng";
    return "Có thể áp dụng";
  };

  const getNotApplicableReason = (promotion: Promotion): string => {
    if (cart.length === 0) {
      return "Giỏ hàng trống. Thêm sản phẩm để áp dụng khuyến mãi.";
    }

    const now = new Date();
    if (promotion.start_at && now < new Date(promotion.start_at)) {
      return "Khuyến mãi chưa bắt đầu";
    }
    if (promotion.end_at && now > new Date(promotion.end_at)) {
      return "Khuyến mãi đã hết hạn";
    }

    // Check usage limit
    if (
      promotion.usage_limit &&
      promotion.total_usage_count !== undefined &&
      promotion.total_usage_count >= promotion.usage_limit
    ) {
      return "Khuyến mãi đã hết lượt sử dụng";
    }

    // Calculate cart total for order-level checks
    const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);

    // Check each promotion line for detailed reason
    const reasons: string[] = [];

    for (const line of promotion.promotion_lines) {
      // Check line active status
      if (line.is_active === false) continue;

      // Check line time validity
      if (line.start_at && now < new Date(line.start_at)) continue;
      if (line.end_at && now > new Date(line.end_at)) continue;

      // Check if line can be applied to any cart item
      let lineApplicable = false;

      for (const item of cart) {
        // Skip if product doesn't match target
        if (line.target_id && item.productId !== line.target_id) continue;

        // Check minimum quantity
        if (
          line.min_quantity !== undefined &&
          line.min_quantity !== null &&
          item.quantity < line.min_quantity
        ) {
          const productInfo = productLookup.get(item.productId);
          const productName = productInfo?.name || "Sản phẩm";
          reasons.push(
            `${productName}: Cần mua tối thiểu ${line.min_quantity} sản phẩm (hiện có ${item.quantity})`
          );
          continue;
        }

        // Check minimum order value
        if (
          line.min_order_value !== undefined &&
          line.min_order_value !== null
        ) {
          if (line.line_type === "ALL") {
            // Order-level: check total cart value
            if (cartTotal < line.min_order_value) {
              const remaining = line.min_order_value - cartTotal;
              reasons.push(
                `Cần mua thêm ${remaining.toLocaleString(
                  "vi-VN"
                )}₫ để đạt giá trị đơn tối thiểu ${line.min_order_value.toLocaleString(
                  "vi-VN"
                )}₫`
              );
              continue;
            }
          } else {
            // Item-level: check item total
            const itemTotal = item.price * item.quantity;
            if (itemTotal < line.min_order_value) {
              const productInfo = productLookup.get(item.productId);
              const productName = productInfo?.name || "Sản phẩm";
              const remaining = line.min_order_value - itemTotal;
              reasons.push(
                `${productName}: Cần mua thêm ${remaining.toLocaleString(
                  "vi-VN"
                )}₫ để đạt ${line.min_order_value.toLocaleString("vi-VN")}₫`
              );
              continue;
            }
          }
        }

        // If we reach here, this line is applicable
        lineApplicable = true;
        break;
      }

      if (lineApplicable) {
        // At least one line is applicable, so promotion should work
        return ""; // No reason - it's actually applicable
      }
    }

    // If we have specific reasons, return the first one
    if (reasons.length > 0) {
      return reasons[0];
    }

    // Generic fallback
    return "Giỏ hàng chưa có sản phẩm phù hợp với điều kiện khuyến mãi";
  };

  return (
    <>
      {promotionsWithStatus.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Không có khuyến mãi"
        />
      ) : (
        <List
          dataSource={promotionsWithStatus}
          renderItem={(item) => {
            const promotion = item as typeof item & { _isApplicable: boolean };
            const selected = isSelected(promotion);
            const isApplicable = promotion._isApplicable;

            // Determine background color
            let backgroundColor = "#fff";
            if (selected) {
              backgroundColor = "#f6ffed";
            } else if (!isApplicable) {
              backgroundColor = "#f5f5f5";
            }

            return (
              <List.Item
                key={promotion.promotion_id}
                style={{
                  padding: "12px",
                  marginBottom: "8px",
                  border: selected ? "2px solid #52c41a" : "1px solid #f0f0f0",
                  borderRadius: "8px",
                  cursor: isApplicable ? "pointer" : "not-allowed",
                  backgroundColor,
                  opacity: isApplicable ? 1 : 0.6,
                }}
                onClick={() => isApplicable && onTogglePromotion(promotion)}
              >
                <List.Item.Meta
                  avatar={
                    selected ? (
                      <CheckCircleOutlined
                        style={{ fontSize: 24, color: "#52c41a" }}
                      />
                    ) : (
                      <PercentageOutlined
                        style={{ fontSize: 24, color: "#1890ff" }}
                      />
                    )
                  }
                  title={
                    <Space
                      direction="vertical"
                      size={4}
                      style={{ width: "100%" }}
                    >
                      <Space>
                        <Text strong>{promotion.name}</Text>
                        {promotion.promotion_code && (
                          <Tag color="blue">{promotion.promotion_code}</Tag>
                        )}
                      </Space>
                      <Space size={4}>
                        <Tooltip
                          title={
                            isApplicable
                              ? undefined
                              : getNotApplicableReason(promotion)
                          }
                        >
                          <Tag color={getPromotionStatusColor(promotion)}>
                            {getPromotionStatusText(promotion)}
                          </Tag>
                        </Tooltip>
                        {promotion.is_stackable && (
                          <Tooltip title="Có thể cộng dồn với khuyến mãi khác">
                            <Tag color="orange">Cộng dồn</Tag>
                          </Tooltip>
                        )}
                        <Tag>Ưu tiên: {promotion.priority}</Tag>
                        {promotion.usage_limit !== null &&
                          promotion.usage_limit !== undefined && (
                            <Tooltip
                              title={`Đã sử dụng ${
                                promotion.total_usage_count || 0
                              } / ${promotion.usage_limit} lần`}
                            >
                              <Tag>
                                Đã dùng: {promotion.total_usage_count || 0} /{" "}
                                {promotion.usage_limit}
                              </Tag>
                            </Tooltip>
                          )}
                        {(!promotion.usage_limit ||
                          promotion.usage_limit === 0) && (
                          <Tag color="cyan">Không giới hạn</Tag>
                        )}
                      </Space>
                    </Space>
                  }
                  description={
                    <Space
                      direction="vertical"
                      size={4}
                      style={{ width: "100%" }}
                    >
                      {promotion.description && (
                        <Text
                          type="secondary"
                          style={{ fontSize: 12 }}
                          ellipsis={{ rows: 2 }}
                        >
                          {promotion.description}
                        </Text>
                      )}

                      {/* Display promotion validity period */}
                      <div style={{ marginTop: 4 }}>
                        {promotion.start_at && (
                          <Text
                            type="secondary"
                            style={{ fontSize: 11 }}
                          >
                            Bắt đầu:{" "}
                            {new Date(promotion.start_at).toLocaleDateString(
                              "vi-VN",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            )}
                          </Text>
                        )}
                        {promotion.start_at && promotion.end_at && (
                          <Text
                            type="secondary"
                            style={{ fontSize: 11, margin: "0 4px" }}
                          >
                            -
                          </Text>
                        )}
                        {promotion.end_at && (
                          <Text
                            type="secondary"
                            style={{ fontSize: 11 }}
                          >
                            Kết thúc:{" "}
                            {new Date(promotion.end_at).toLocaleDateString(
                              "vi-VN",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            )}
                          </Text>
                        )}
                      </div>

                      {promotion.promotion_lines.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          {promotion.promotion_lines
                            .slice(0, 2)
                            .map((line, idx) => {
                              // Get product name if target_id exists
                              let productName = "";

                              if (line.target_id) {
                                const product = productLookup.get(
                                  line.target_id
                                );
                                productName = product
                                  ? product.name
                                  : `Sản phẩm (${line.target_id})`;
                              } else if (line.line_type === "ALL") {
                                productName = "Tất cả sản phẩm";
                              } else {
                                productName = line.line_type;
                              }

                              return (
                                <div key={line.promotion_line_id || idx}>
                                  <Text style={{ fontSize: 12 }}>
                                    • {productName}
                                    {line.discount_type === "PERCENT" &&
                                      ` - Giảm ${line.discount_value}%`}
                                    {line.discount_type === "AMOUNT" &&
                                      ` - Giảm ${line.discount_value?.toLocaleString()}đ`}
                                    {/* BUY_X_GET_Y: Show buy quantity and get quantity */}
                                    {line.discount_type === "BUY_X_GET_Y" && (
                                      <>
                                        {` - Mua ${line.buy_qty || 0} tặng ${
                                          line.get_qty || 0
                                        }`}
                                        {line.free_product && (
                                          <>
                                            {" (Tặng: "}
                                            {productLookup.get(
                                              line.free_product.product_id
                                            )?.name ||
                                              line.free_product.product_name ||
                                              "sản phẩm"}
                                            {")"}
                                          </>
                                        )}
                                      </>
                                    )}
                                    {/* FREE_PRODUCT: Show free product and quantity */}
                                    {line.discount_type === "FREE_PRODUCT" &&
                                      line.free_product && (
                                        <>
                                          {` - Tặng ${
                                            line.free_quantity || 1
                                          }x `}
                                          {productLookup.get(
                                            line.free_product.product_id
                                          )?.name ||
                                            line.free_product.product_name ||
                                            "sản phẩm"}
                                        </>
                                      )}
                                    {line.min_quantity &&
                                      ` (Tối thiểu ${line.min_quantity} sản phẩm)`}
                                  </Text>
                                </div>
                              );
                            })}
                          {promotion.promotion_lines.length > 2 && (
                            <Text
                              type="secondary"
                              style={{ fontSize: 12 }}
                            >
                              ... và {promotion.promotion_lines.length - 2} điều
                              kiện khác
                            </Text>
                          )}
                        </div>
                      )}
                    </Space>
                  }
                />
              </List.Item>
            );
          }}
        />
      )}
    </>
  );
};

export default PromotionSection;
