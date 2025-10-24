import api from '../axios';
import {CreateAndPayRequest, CreateAndPayResponse, InitiatePaymentRequest, PaymentStatusResponse} from "@/lib/api";

export const PaymentService = {
  /**
   * Initiate payment for a sales order
   */
  async initiatePayment(request: InitiatePaymentRequest): Promise<PaymentResponse> {
    const response = await api.post('/payment/initiate', request);
    return response.data.data;
  },

  /**
   * Verify payment status
   */
  async verifyPayment(orderCode: number): Promise<PaymentStatusResponse> {
    console.log(`🔍 PaymentService.verifyPayment: Calling /payment/verify/${orderCode}`);
    try {
      const response = await api.get(`/payment/verify/${orderCode}`);
      console.log(`📊 PaymentService.verifyPayment: API response:`, response.data);
      return response.data.data;
    } catch (error) {
      console.error(`❌ PaymentService.verifyPayment: API error:`, error);
      throw error;
    }
  },

  /**
   * Complete direct payment (Cash, Bank Transfer)
   */
  async completePayment(paymentId: string, transactionId?: string): Promise<PaymentStatusResponse> {
    const response = await api.post(`/payment/complete/${paymentId}`, null, {
      params: { transactionId }
    });
    return response.data.data;
  },

  /**
   * Cancel payment
   */
  async cancelPayment(paymentId: string): Promise<PaymentStatusResponse> {
    const response = await api.post(`/payment/cancel/${paymentId}`);
    return response.data.data;
  },

  /**
   * Get payment by sales order ID
   */
  async getPaymentBySalesOrder(salesOrderId: string): Promise<PaymentStatusResponse> {
    const response = await api.get(`/payment/sales-order/${salesOrderId}`);
    return response.data.data;
  },

  /**
   * Create order and initiate payment (Combined)
   */
  async createAndPay(request: CreateAndPayRequest): Promise<CreateAndPayResponse> {
    const response = await api.post('/so/create-and-pay', request);
    return response.data.data;
  },

  async getPaymentLink(saleOrderId: string): Promise<string> {
    const response = await api.get(`/payment/payment-link/${saleOrderId}`);
    return response.data.data;
  }
};
