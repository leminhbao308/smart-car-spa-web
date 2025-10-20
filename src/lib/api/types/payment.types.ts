import { SalesOrder } from "@/lib/api";

export interface InitiatePaymentRequest {
  sales_order_id: string;
  payment_method: "BANK" | "CASH";
  return_url?: string;
  cancel_url?: string;
}

export interface PaymentResponse {
  payment_id: string;
  sales_order_id: string;
  amount: number;
  payment_url?: string;
  order_code?: number;
  status: string;
  payment_method: "BANK" | "CASH";
  qr_code?: string;
  created_at: string;
}

export interface PaymentStatusResponse {
  payment_id: string;
  sales_order_id: string;
  status:
    | "PENDING"
    | "COMPLETED"
    | "FAILED"
    | "CANCELED"
    | "EXPIRED"
    | "REFUNDED";
  amount: number;
  transaction_id?: string;
  paid_at?: string;
  message: string;
}

export interface CreateAndPayRequest {
  branch_id: string;
  warehouse_id: string;
  customer_id?: string;
  promotion_ids?: string[];
  lines: Array<{
    product_id: string;
    qty: number;
    unit_price: number;
    is_free_item?: boolean;
    // Service item support
    service_id?: string;
    original_booking_id?: string;
    original_booking_code?: string;
  }>;
  payment_method: "BANK" | "CASH";
  return_url?: string;
  cancel_url?: string;
}

export interface CreateAndPayResponse {
  order: SalesOrder;
  payment: PaymentResponse;
}
