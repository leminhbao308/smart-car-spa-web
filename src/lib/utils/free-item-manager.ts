import type { CartItem } from "@/components/ui/Pos/CartSection";
import type { Promotion } from "@/lib/api/types/promotion.types";
import { DiscountType } from "@/lib/api/types/promotion.types";
import { isPromotionLineApplicable } from "./promotion-calculator";

export interface FreeItemToAdd {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  linkedPromotionId: string;
  linkedProductId?: string; // For BUY_X_GET_Y, track which product triggers this
  categoryName: string;
  availableStock: number;
}

/**
 * Calculate free items to add from a promotion
 */
export const calculateFreeItems = (
  promotion: Promotion,
  cart: CartItem[],
  productLookup: Map<
    string,
    { name: string; price: number; stock: number; category: string }
  >
): FreeItemToAdd[] => {
  const freeItems: FreeItemToAdd[] = [];
  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);

  console.log(`🎁 Calculating free items for promotion: ${promotion.name}`, {
    totalLines: promotion.promotion_lines.length,
    promotionLines: promotion.promotion_lines,
    cart: cart,
  });

  // Process each promotion line
  for (const line of promotion.promotion_lines) {
    console.log(`  📋 Processing line ${line.promotion_line_id}:`, {
      lineType: line.line_type,
      discountType: line.discount_type,
      targetId: line.target_id,
      isActive: line.is_active,
    });

    // Only skip if explicitly set to false (null or undefined means active)
    if (line.is_active === false) {
      console.log(
        `     Line ${line.promotion_line_id} is not active, skipping`
      );
      continue;
    }

    // Handle FREE_PRODUCT type
    if (line.discount_type === DiscountType.FREE_PRODUCT && line.free_product) {
      console.log(`    🎁 FREE_PRODUCT line detected`, {
        freeProductId: line.free_product.product_id,
        freeQuantity: line.free_quantity,
      });

      // Track if we've already added this free product for this line
      let freeItemAdded = false;

      // Check if any cart item makes this line applicable
      for (const cartItem of cart) {
        if (freeItemAdded) break; // Only apply once per promotion line

        console.log(`      🔍 Checking cart item ${cartItem.productName}`, {
          productId: cartItem.productId,
          quantity: cartItem.quantity,
        });

        if (isPromotionLineApplicable(line, cartItem, cartTotal)) {
          console.log(`      ✅ Line is applicable to ${cartItem.productName}`);

          const freeProductId = line.free_product.product_id;
          const freeQuantity = line.free_quantity || 1;

          const productInfo = productLookup.get(freeProductId);
          if (!productInfo) {
            console.warn(
              `      ❌ Free product ${freeProductId} not found in catalog`
            );
            continue;
          }

          // Check if we have enough stock
          const availableStock = productInfo.stock;
          if (availableStock <= 0) {
            console.warn(
              `      ❌ Free product ${productInfo.name} out of stock`
            );
            continue;
          }

          const actualQuantity = Math.min(freeQuantity, availableStock);

          console.log(
            `      ➕ Adding free item: ${productInfo.name} x${actualQuantity}`
          );

          freeItems.push({
            productId: freeProductId,
            productName: productInfo.name,
            quantity: actualQuantity,
            price: productInfo.price,
            linkedPromotionId: promotion.promotion_id,
            categoryName: productInfo.category,
            availableStock,
          });

          freeItemAdded = true; // Mark as added
        } else {
          console.log(
            `      ❌ Line NOT applicable to ${cartItem.productName}`
          );
        }
      }
    }

    // Handle BUY_X_GET_Y type
    if (line.discount_type === DiscountType.BUY_X_GET_Y) {
      console.log(`     BUY_X_GET_Y line detected`, {
        buyQty: line.buy_qty,
        getQty: line.get_qty,
      });

      for (const cartItem of cart) {
        console.log(`      🔍 Checking cart item ${cartItem.productName}`, {
          productId: cartItem.productId,
          quantity: cartItem.quantity,
        });

        if (isPromotionLineApplicable(line, cartItem, cartTotal)) {
          console.log(`      ✅ Line is applicable to ${cartItem.productName}`);

          const buyQty = line.buy_qty || 0;
          const getQty = line.get_qty || 0;

          if (buyQty > 0 && getQty > 0) {
            // Calculate how many sets of "buy X" the customer has
            const sets = Math.floor(cartItem.quantity / buyQty);
            console.log(
              `      📊 Customer has ${sets} sets (quantity: ${cartItem.quantity}, buyQty: ${buyQty})`
            );

            if (sets > 0) {
              // Customer gets getQty * sets items free
              const totalFreeQty = getQty * sets;

              // For BUY_X_GET_Y, the free product is usually the same product
              // But it could be a different product if free_product is specified
              const freeProductId =
                line.free_product?.product_id || cartItem.productId;

              const productInfo = productLookup.get(freeProductId);
              if (!productInfo) {
                console.warn(
                  `      ❌ Free product ${freeProductId} not found`
                );
                continue;
              }

              // Check available stock
              const currentFreeInCart = cart
                .filter(
                  (item) => item.productId === freeProductId && item.isFreeItem
                )
                .reduce((sum, item) => sum + item.quantity, 0);

              const availableStock = productInfo.stock - currentFreeInCart;

              if (availableStock <= 0) {
                console.warn(
                  `      ❌ No stock available for free item ${productInfo.name}`
                );
                continue;
              }

              const actualQuantity = Math.min(totalFreeQty, availableStock);

              console.log(
                `      ➕ Adding free item: ${productInfo.name} x${actualQuantity} (${sets} sets)`
              );

              freeItems.push({
                productId: freeProductId,
                productName: productInfo.name,
                quantity: actualQuantity,
                price: productInfo.price,
                linkedPromotionId: promotion.promotion_id,
                linkedProductId: cartItem.productId,
                categoryName: productInfo.category,
                availableStock,
              });
            }
          }
        } else {
          console.log(
            `      ❌ Line NOT applicable to ${cartItem.productName}`
          );
        }
      }
    }
  }

  console.log(`🎁 Total free items calculated: ${freeItems.length}`, freeItems);

  return freeItems;
};

/**
 * Add free items to cart
 */
export const addFreeItemsToCart = (
  cart: CartItem[],
  freeItems: FreeItemToAdd[]
): CartItem[] => {
  const newCart = [...cart];

  for (const freeItem of freeItems) {
    // Check if this exact free item already exists in cart
    const existingIndex = newCart.findIndex(
      (item) =>
        item.productId === freeItem.productId &&
        item.isFreeItem &&
        item.linkedPromotionId === freeItem.linkedPromotionId &&
        item.linkedProductId === freeItem.linkedProductId
    );

    if (existingIndex >= 0) {
      // Update quantity if already exists
      newCart[existingIndex] = {
        ...newCart[existingIndex],
        quantity: freeItem.quantity,
        total: 0, // Free items have 0 total
      };
    } else {
      // Add as new item
      newCart.push({
        productId: freeItem.productId,
        productName: freeItem.productName,
        price: freeItem.price,
        quantity: freeItem.quantity,
        total: 0, // Free items don't contribute to total
        categoryName: freeItem.categoryName,
        availableStock: freeItem.availableStock,
        maxQuantity: freeItem.availableStock,
        isFreeItem: true,
        linkedPromotionId: freeItem.linkedPromotionId,
        linkedProductId: freeItem.linkedProductId,
      });
    }
  }

  return newCart;
};

/**
 * Remove free items linked to a specific promotion
 */
export const removeFreeItemsByPromotion = (
  cart: CartItem[],
  promotionId: string
): CartItem[] => {
  return cart.filter(
    (item) => !(item.isFreeItem && item.linkedPromotionId === promotionId)
  );
};

/**
 * Remove free items linked to a specific product (for when quantity changes)
 */
export const updateFreeItemsForProduct = (
  cart: CartItem[],
  productId: string,
  promotions: Promotion[],
  productLookup: Map<
    string,
    { name: string; price: number; stock: number; category: string }
  >
): CartItem[] => {
  // Remove all free items linked to this product
  let updatedCart = cart.filter(
    (item) => !(item.isFreeItem && item.linkedProductId === productId)
  );

  // Recalculate free items for active promotions
  for (const promotion of promotions) {
    const freeItems = calculateFreeItems(promotion, updatedCart, productLookup);
    updatedCart = addFreeItemsToCart(updatedCart, freeItems);
  }

  return updatedCart;
};

/**
 * Get all free items in cart
 */
export const getFreeItems = (cart: CartItem[]): CartItem[] => {
  return cart.filter((item) => item.isFreeItem);
};

/**
 * Get purchased (non-free) items in cart
 */
export const getPurchasedItems = (cart: CartItem[]): CartItem[] => {
  return cart.filter((item) => !item.isFreeItem);
};

/**
 * Recalculate all free items based on current cart and promotions
 */
export const recalculateAllFreeItems = (
  cart: CartItem[],
  promotions: Promotion[],
  productLookup: Map<
    string,
    { name: string; price: number; stock: number; category: string }
  >
): CartItem[] => {
  // Remove all free items
  let updatedCart = cart.filter((item) => !item.isFreeItem);

  // Add free items for each active promotion
  for (const promotion of promotions) {
    const freeItems = calculateFreeItems(promotion, updatedCart, productLookup);
    updatedCart = addFreeItemsToCart(updatedCart, freeItems);
  }

  return updatedCart;
};
