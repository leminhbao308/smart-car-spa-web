/**
 * Report Service
 * Handles API calls for reports and analytics
 */

import apiClient from "../axios";
import { ApiResponse } from "../types/common.types";

/**
 * Daily sales data point
 */
export interface DailySales {
  date: string;
  revenue: number;
  profit: number;
  orderCount: number;
}

/**
 * Top product data
 */
export interface TopProduct {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
  profit: number;
}

/**
 * Top service data
 */
export interface TopService {
  serviceId: string;
  serviceName: string;
  bookingCount: number;
  revenue: number;
}

/**
 * Sales statistics
 */
export interface SalesStats {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  totalOrders: number;
  totalProducts: number;
  averageOrderValue: number;
  profitMargin: number;
  dailySales: DailySales[];
  topProducts: TopProduct[];
  topServices: TopService[];
}

/**
 * Product stock data
 */
export interface ProductStock {
  productId: string;
  productName: string;
  quantity: number;
  minStockLevel: number;
  value: number;
  status: string;
}

/**
 * Inventory transaction data
 */
export interface InventoryTransaction {
  id: string;
  transactionType: "INBOUND" | "OUTBOUND";
  productName: string;
  productSku: string;
  branchName: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  transactionDate: string;
  referenceType: string;
  referenceCode: string;
}

/**
 * Inventory statistics
 */
export interface InventoryStats {
  totalProducts: number;
  totalQuantity: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  lowStockProducts: ProductStock[];
  topValueProducts: ProductStock[];
  recentTransactions: InventoryTransaction[];
}

/**
 * Report Service Class
 */
class ReportService {
  private readonly baseURL = "/reports";

  /**
   * Get sales statistics
   */
  async getSalesStats(
    fromDate: string,
    toDate: string,
    branchId?: string
  ): Promise<ApiResponse<SalesStats>> {
    const params: any = { fromDate, toDate };
    if (branchId) params.branchId = branchId;

    const response = await apiClient.get<ApiResponse<SalesStats>>(
      `${this.baseURL}/sales/stats`,
      { params }
    );
    return response.data;
  }

  /**
   * Get inventory statistics
   */
  async getInventoryStats(
    branchId?: string
  ): Promise<ApiResponse<InventoryStats>> {
    const params: any = {};
    if (branchId) params.branchId = branchId;

    const response = await apiClient.get<ApiResponse<InventoryStats>>(
      `${this.baseURL}/inventory/stats`,
      { params }
    );
    return response.data;
  }

  /**
   * Export sales report to Excel
   */
  async exportSalesReport(
    fromDate: string,
    toDate: string,
    branchId?: string
  ): Promise<Blob> {
    const params: any = { fromDate, toDate };
    if (branchId) params.branchId = branchId;

    const response = await apiClient.get(`${this.baseURL}/sales/export`, {
      params,
      responseType: "blob",
    });
    return response.data;
  }

  /**
   * Export inventory report to Excel
   */
  async exportInventoryReport(branchId?: string): Promise<Blob> {
    const params: any = {};
    if (branchId) params.branchId = branchId;

    const response = await apiClient.get(`${this.baseURL}/inventory/export`, {
      params,
      responseType: "blob",
    });
    return response.data;
  }
}

export const reportService = new ReportService();
