/**
 * Customer-facing order types
 * Simplified versions of admin types for customer use
 */

import { UUID } from "node:crypto";
import { Branch, Product, UserManagementInfo } from "@/lib/api";

/**
 * Order status for customer view
 */
export type CustomerOrderStatus =
  | "PENDING" // CONFIRMED - waiting for payment/processing
  | "PAID" // CONFIRMED with payment completed
  | "PROCESSING" // Being prepared
  | "COMPLETED" // FULFILLED
  | "CANCELLED" // CANCELLED
  | "RETURNED"; // RETURNED/PARTIALLY_RETURNED

/**
 * Return request status
 */
export type ReturnRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "REFUNDED";

/**
 * Payment method
 */
export type PaymentMethod = "CASH" | "BANK";

/**
 * Shopping cart item
 */
export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number; // quantity * unitPrice
}

/**
 * Cart summary
 */
export interface CartSummary {
  items: CartItem[];
  itemCount: number; // Total number of items
  subtotal: number; // Sum of all item subtotals
  discountAmount: number; // Total discount from promotions
  taxAmount: number; // Tax if applicable
  shippingAmount: number; // Shipping cost if applicable
  totalAmount: number; // Final amount to pay
  appliedPromotions: AppliedPromotion[];
}

/**
 * Applied promotion info
 */
export interface AppliedPromotion {
  id: string;
  name: string;
  description?: string;
  discountAmount: number;
  discountPercentage?: number;
  freeItems?: {
    productId: string;
    productName: string;
    quantity: number;
  }[];
}

/**
 * Customer order line item
 */
export interface CustomerOrderLine {
  id: UUID;
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  isFreeItem?: boolean;
}

/**
 * Customer order (simplified from SaleOrderResponse)
 */
export interface CustomerOrder {
  id: UUID;
  orderNumber: string; // Display-friendly order number
  customer?: UserManagementInfo;
  branch: Branch;
  status: CustomerOrderStatus;
  lines: CustomerOrderLine[];

  // Amounts
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;

  // Promotion info
  appliedPromotions?: AppliedPromotion[];

  // Payment info
  paymentMethod?: PaymentMethod;
  paymentStatus?: "PENDING" | "COMPLETED" | "FAILED";
  paymentQrCode?: string; // PayOS QR code if BANK payment

  // Timestamps
  orderDate: string; // ISO date string
  paidDate?: string;
  completedDate?: string;
  cancelledDate?: string;

  // Cancellation
  cancellationReason?: string;

  // Tracking
  canCancel: boolean; // Can cancel if PENDING/PAID
  canReturn: boolean; // Can return if COMPLETED
}

/**
 * Return item request
 */
export interface ReturnItemRequest {
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  maxQuantity: number; // Max returnable quantity (purchased - already returned)
  unitPrice: number;
  refundAmount: number; // quantity * unitPrice
}

/**
 * Return request payload
 */
export interface CreateReturnRequest {
  orderId: string;
  items: {
    product_id: string;
    qty: number;
    unit_cost: number;
  }[];
  reason: string;
  description?: string;
  photos?: string[]; // Array of image URLs
}

/**
 * Return request response
 */
export interface ReturnRequest {
  id: string;
  returnNumber: string; // Display-friendly return number
  order: CustomerOrder;
  status: ReturnRequestStatus;
  items: ReturnItemRequest[];
  reason: string;
  description?: string;
  photos?: string[];

  // Refund info
  refundAmount: number;
  refundMethod?: PaymentMethod;
  refundStatus?: "PENDING" | "PROCESSED";

  // Admin response
  adminNotes?: string;

  // Timestamps
  requestDate: string; // ISO date string
  reviewedDate?: string;
  refundedDate?: string;
}

/**
 * Checkout form data
 */
export interface CheckoutFormData {
  // Shipping info
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  notes?: string;

  // Payment
  paymentMethod: PaymentMethod;

  // Use loyalty points
  useLoyaltyPoints?: boolean;
  loyaltyPointsToUse?: number;
}

/**
 * Create customer order request
 */
export interface CreateCustomerOrderRequest {
  branch_id: string;
  warehouse_id: string;
  customer_id?: string;
  lines: {
    product_id: string;
    qty: number;
    unit_price?: number;
  }[];
  payment_method: PaymentMethod;
  shipping_info?: {
    full_name: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    ward: string;
    notes?: string;
  };
}

/**
 * Product catalog item for customer view
 */
export interface CatalogProduct extends Product {
  mainImageUrl?: string;
  availableStock: number;
  isAvailable: boolean;
  pricing: {
    basePrice: number;
    salePrice?: number;
    discountPercentage?: number;
  };
}

/**
 * Order filter params
 */
export interface OrderFilterParams {
  status?: CustomerOrderStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}
