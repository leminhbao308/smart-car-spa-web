import type { CartItem } from "@/components/ui/Pos/CartSection";
import type { Promotion, PromotionLine } from "@/lib/api/types/promotion.types";
import { DiscountType, LineType } from "@/lib/api/types/promotion.types";

export interface PromotionDiscount {
  promotionId: string;
  promotionName: string;
  promotionCode?: string;
  discountAmount: number;
  lineDiscounts: {
    lineId: string;
    productId: string;
    productName: string;
    discountAmount: number;
    discountType: DiscountType;
    freeItems?: {
      productId: string;
      productName: string;
      quantity: number;
    };
  }[];
}

export interface CartSummary {
  subtotal: number;
  totalDiscount: number;
  finalTotal: number;
  appliedPromotions: PromotionDiscount[];
}

/**
 * Check if a promotion line is applicable to a cart item
 */
export const isPromotionLineApplicable = (
  line: PromotionLine,
  item: CartItem,
  cartTotal: number
): boolean => {
  // Check if line is active - only skip if explicitly set to false
  if (line.is_active === false) return false;

  // Check time validity
  const now = new Date();
  if (line.start_at && now < new Date(line.start_at)) return false;
  if (line.end_at && now > new Date(line.end_at)) return false;

  // Check line type
  if (line.line_type === LineType.ALL) {
    // Applies to all products
  } else if (line.line_type === LineType.PRODUCT) {
    // Check if product matches
    if (line.target_id !== item.productId) return false;
  } else if (line.line_type === LineType.CATEGORY) {
    // Check if category matches (would need category info in cart item)
    // For now, skip category check
  }

  // Check minimum quantity requirement
  // This applies to the specific item's quantity
  if (line.min_quantity !== undefined && line.min_quantity !== null) {
    if (item.quantity < line.min_quantity) {
      return false;
    }
  }

  // Check minimum order value requirement
  // For item-level promotions: check the item's total (price × quantity)
  // For order-level promotions (LineType.ALL): check the entire cart total
  if (line.min_order_value !== undefined && line.min_order_value !== null) {
    if (line.line_type === LineType.ALL) {
      // Order-level: check total cart value
      if (cartTotal < line.min_order_value) {
        return false;
      }
    } else {
      // Item-level: check this item's total value
      const itemTotal = item.price * item.quantity;
      if (itemTotal < line.min_order_value) {
        return false;
      }
    }
  }

  // Additional validation for BUY_X_GET_Y
  if (line.discount_type === DiscountType.BUY_X_GET_Y) {
    if (!line.buy_qty || line.buy_qty <= 0) return false;
    if (!line.get_qty || line.get_qty <= 0) return false;
    // Check if customer has bought enough to qualify
    if (item.quantity < line.buy_qty) return false;
  }

  return true;
};

/**
 * Calculate discount for a single promotion line on a cart item
 * Note: FREE_PRODUCT and BUY_X_GET_Y are handled by free-item-manager.ts
 * This only calculates monetary discounts (PERCENT, AMOUNT)
 *
 * IMPORTANT: For LineType.ALL with max_discount_amount, the max is applied at the
 * promotion level (in calculatePromotionDiscount), not per-item.
 */
export const calculateLineDiscount = (
  line: PromotionLine,
  item: CartItem
): number => {
  // Skip free items - they already have 0 total
  if (item.isFreeItem) return 0;

  let discount = 0;
  const itemTotal = item.price * item.quantity;

  switch (line.discount_type) {
    case DiscountType.PERCENT:
      // Calculate percentage discount
      discount = (itemTotal * (line.discount_value || 0)) / 100;

      // Apply max discount limit ONLY for item-level promotions (PRODUCT, CATEGORY)
      // Order-level promotions (ALL) apply max at the promotion level instead
      if (
        line.line_type !== LineType.ALL &&
        line.max_discount_amount !== undefined &&
        line.max_discount_amount !== null
      ) {
        if (discount > line.max_discount_amount) {
          discount = line.max_discount_amount;
        }
      }
      break;

    case DiscountType.AMOUNT:
      // Fixed amount discount - cannot exceed item total
      discount = Math.min(line.discount_value || 0, itemTotal);
      break;

    case DiscountType.BUY_X_GET_Y:
    case DiscountType.FREE_PRODUCT:
      // These are handled by adding free items to cart via free-item-manager.ts
      // No monetary discount needed here
      break;

    default:
      break;
  }

  // Ensure discount is never negative and doesn't exceed item total
  return Math.max(0, Math.min(discount, itemTotal));
};

/**
 * Check if a promotion is applicable to the current cart
 */
export const isPromotionApplicable = (
  promotion: Promotion,
  cart: CartItem[]
): boolean => {
  // Check if promotion is active
  if (!promotion.is_active) return false;

  // Check time validity
  const now = new Date();
  if (promotion.start_at && now < new Date(promotion.start_at)) return false;
  if (promotion.end_at && now > new Date(promotion.end_at)) return false;

  // Check usage limit
  if (
    promotion.usage_limit &&
    promotion.total_usage_count !== undefined &&
    promotion.total_usage_count >= promotion.usage_limit
  ) {
    return false;
  }

  // Check if any promotion line is applicable to any cart item
  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);
  const hasApplicableLine = promotion.promotion_lines.some((line) =>
    cart.some((item) => isPromotionLineApplicable(line, item, cartTotal))
  );

  return hasApplicableLine;
};

/**
 * Calculate total discount from a single promotion
 */
export const calculatePromotionDiscount = (
  promotion: Promotion,
  cart: CartItem[]
): PromotionDiscount => {
  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);
  const lineDiscounts: PromotionDiscount["lineDiscounts"] = [];
  let totalDiscount = 0;

  // Sort promotion lines by priority (lower number = higher priority)
  const sortedLines = [...promotion.promotion_lines].sort(
    (a, b) => a.line_priority - b.line_priority
  );

  // Calculate discount for each applicable line
  for (const line of sortedLines) {
    let lineTotal = 0;
    const tempLineDiscounts: PromotionDiscount["lineDiscounts"] = [];

    for (const item of cart) {
      if (isPromotionLineApplicable(line, item, cartTotal)) {
        const discount = calculateLineDiscount(line, item);

        if (discount > 0) {
          lineTotal += discount;
          tempLineDiscounts.push({
            lineId: line.promotion_line_id || "",
            productId: item.productId,
            productName: item.productName,
            discountAmount: discount,
            discountType: line.discount_type,
            freeItems:
              line.discount_type === DiscountType.FREE_PRODUCT &&
              line.free_product
                ? {
                    productId: line.free_product.product_id,
                    productName: line.free_product.product_name,
                    quantity: line.free_quantity || 0,
                  }
                : undefined,
          });
        }
      }
    }

    // Apply max_discount_amount at line level for order-level promotions (LineType.ALL)
    // This ensures the TOTAL discount from this line doesn't exceed the limit
    if (
      line.line_type === LineType.ALL &&
      line.max_discount_amount !== undefined &&
      line.max_discount_amount !== null &&
      lineTotal > line.max_discount_amount
    ) {
      // Proportionally reduce each item's discount to fit within the max
      const ratio = line.max_discount_amount / lineTotal;
      for (const ld of tempLineDiscounts) {
        ld.discountAmount = Math.floor(ld.discountAmount * ratio);
      }
      lineTotal = line.max_discount_amount;
    }

    // Add line discounts to total
    totalDiscount += lineTotal;
    lineDiscounts.push(...tempLineDiscounts);
  }

  return {
    promotionId: promotion.promotion_id,
    promotionName: promotion.name,
    promotionCode: promotion.promotion_code,
    discountAmount: totalDiscount,
    lineDiscounts,
  };
};

/**
 * Calculate total discounts from multiple promotions
 * Handles stackable and non-stackable promotions
 */
export const calculateTotalDiscounts = (
  promotions: Promotion[],
  cart: CartItem[]
): CartSummary => {
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);

  if (promotions.length === 0) {
    return {
      subtotal,
      totalDiscount: 0,
      finalTotal: subtotal,
      appliedPromotions: [],
    };
  }

  // Sort promotions by priority (lower number = higher priority)
  const sortedPromotions = [...promotions].sort(
    (a, b) => a.priority - b.priority
  );

  const appliedPromotions: PromotionDiscount[] = [];
  let totalDiscount = 0;

  // Check if all promotions are stackable
  const allStackable = sortedPromotions.every((p) => p.is_stackable);

  if (allStackable) {
    // Apply all promotions
    for (const promotion of sortedPromotions) {
      const promoDiscount = calculatePromotionDiscount(promotion, cart);
      if (promoDiscount.discountAmount > 0) {
        appliedPromotions.push(promoDiscount);
        totalDiscount += promoDiscount.discountAmount;
      }
    }
  } else {
    // Apply only the first non-stackable promotion with highest priority
    // or stack stackable promotions until we hit a non-stackable one
    for (const promotion of sortedPromotions) {
      const promoDiscount = calculatePromotionDiscount(promotion, cart);

      if (promoDiscount.discountAmount > 0) {
        appliedPromotions.push(promoDiscount);
        totalDiscount += promoDiscount.discountAmount;

        // If this promotion is not stackable, stop here
        if (!promotion.is_stackable) {
          break;
        }
      }
    }
  }

  // Ensure discount doesn't exceed subtotal
  totalDiscount = Math.min(totalDiscount, subtotal);

  return {
    subtotal,
    totalDiscount,
    finalTotal: subtotal - totalDiscount,
    appliedPromotions,
  };
};

/**
 * Format discount for display
 */
export const formatDiscount = (discount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(discount);
};

/**
 * Get discount type label
 */
export const getDiscountTypeLabel = (type: DiscountType): string => {
  switch (type) {
    case DiscountType.PERCENT:
      return "Giảm %";
    case DiscountType.AMOUNT:
      return "Giảm tiền";
    case DiscountType.BUY_X_GET_Y:
      return "Mua X tặng Y";
    case DiscountType.FREE_PRODUCT:
      return "Tặng sản phẩm";
    default:
      return type;
  }
};
