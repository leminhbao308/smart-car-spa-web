"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { App, message } from "antd";
import {
  CartItem,
  CartSummary,
  AppliedPromotion,
  CatalogProduct,
} from "@/lib/api/types/customer-order.types";
import { Product } from "@/lib/api";

/**
 * Cart Context Type
 */
interface CartContextType {
  // State
  cart: CartItem[];
  cartSummary: CartSummary;
  isLoading: boolean;

  // Actions
  addToCart: (product: CatalogProduct, quantity: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  applyPromotion: (promotionCode: string) => Promise<void>;
  removePromotion: (promotionId: string) => void;

  // Helpers
  getItemQuantity: (productId: string) => number;
  validateStock: () => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "scsms_shopping_cart";
const TAX_RATE = 0; // 0% tax for now, can be configured
const SHIPPING_COST = 0; // Free shipping for now

/**
 * Load cart from localStorage
 */
const loadCartFromStorage = (): CartItem[] => {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading cart from storage:", error);
  }
  return [];
};

/**
 * Save cart to localStorage
 */
const saveCartToStorage = (cart: CartItem[]) => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error("Error saving cart to storage:", error);
  }
};

/**
 * Cart Provider Component
 */
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { message } = App.useApp();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedPromotions, setAppliedPromotions] = useState<
    AppliedPromotion[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = loadCartFromStorage();
    setCart(savedCart);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    saveCartToStorage(cart);
  }, [cart]);

  /**
   * Calculate cart summary
   */
  const cartSummary: CartSummary = useMemo(() => {
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const discountAmount = appliedPromotions.reduce(
      (sum, promo) => sum + promo.discountAmount,
      0
    );
    const taxAmount = (subtotal - discountAmount) * TAX_RATE;
    const totalAmount = subtotal - discountAmount + taxAmount + SHIPPING_COST;

    return {
      items: cart,
      itemCount,
      subtotal,
      discountAmount,
      taxAmount,
      shippingAmount: SHIPPING_COST,
      totalAmount,
      appliedPromotions,
    };
  }, [cart, appliedPromotions]);

  /**
   * Add product to cart
   */
  const addToCart = useCallback((product: CatalogProduct, quantity: number) => {
    if (quantity <= 0) {
      message.error("Số lượng phải lớn hơn 0");
      return;
    }

    if (quantity > product.availableStock) {
      message.error(`Chỉ còn ${product.availableStock} sản phẩm trong kho`);
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.product.product_id === product.product_id
      );

      if (existingItem) {
        // Update quantity if item exists
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.availableStock) {
          message.error(`Chỉ còn ${product.availableStock} sản phẩm trong kho`);
          return prevCart;
        }

        message.success("Đã cập nhật số lượng trong giỏ hàng");
        return prevCart.map((item) =>
          item.product.product_id === product.product_id
            ? {
                ...item,
                quantity: newQuantity,
                subtotal:
                  newQuantity *
                  (product.pricing.salePrice || product.pricing.basePrice),
              }
            : item
        );
      }

      // Add new item
      const unitPrice = product.pricing.salePrice || product.pricing.basePrice;
      const newItem: CartItem = {
        product: {
          ...product,
          mainImageUrl: product.mainImageUrl, // Preserve image URL
        } as Product & { mainImageUrl?: string },
        quantity,
        unitPrice,
        subtotal: quantity * unitPrice,
      };

      message.success("Đã thêm vào giỏ hàng");
      return [...prevCart, newItem];
    });
  }, []);

  /**
   * Update item quantity
   */
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      message.error("Số lượng phải lớn hơn 0");
      return;
    }

    setCart((prevCart) => {
      const item = prevCart.find((i) => i.product.product_id === productId);
      if (!item) return prevCart;

      // TODO: Validate against available stock
      // For now, just update
      return prevCart.map((i) =>
        i.product.product_id === productId
          ? {
              ...i,
              quantity,
              subtotal: quantity * i.unitPrice,
            }
          : i
      );
    });
  }, []);

  /**
   * Remove item from cart
   */
  const removeFromCart = useCallback((productId: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.product.product_id !== productId)
    );
    message.success("Đã xóa khỏi giỏ hàng");
  }, []);

  /**
   * Clear cart
   */
  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedPromotions([]);
    message.success("Đã xóa giỏ hàng");
  }, []);

  /**
   * Apply promotion code
   */
  const applyPromotion = useCallback(async (promotionCode: string) => {
    setIsLoading(true);
    try {
      // TODO: Call API to validate and apply promotion
      // For now, show placeholder message
      message.info("Tính năng áp dụng mã giảm giá đang được phát triển");
    } catch (error: any) {
      message.error(error.message || "Không thể áp dụng mã giảm giá");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Remove promotion
   */
  const removePromotion = useCallback((promotionId: string) => {
    setAppliedPromotions((prev) =>
      prev.filter((promo) => promo.id !== promotionId)
    );
    message.success("Đã xóa mã giảm giá");
  }, []);

  /**
   * Get item quantity in cart
   */
  const getItemQuantity = useCallback(
    (productId: string) => {
      const item = cart.find((i) => i.product.product_id === productId);
      return item?.quantity || 0;
    },
    [cart]
  );

  /**
   * Validate stock availability before checkout
   */
  const validateStock = useCallback(async () => {
    // TODO: Call API to validate stock
    // For now, just check if cart is not empty
    if (cart.length === 0) {
      message.error("Giỏ hàng trống");
      return false;
    }
    return true;
  }, [cart]);

  const value: CartContextType = {
    cart,
    cartSummary,
    isLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyPromotion,
    removePromotion,
    getItemQuantity,
    validateStock,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

/**
 * Hook to use Cart Context
 */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
