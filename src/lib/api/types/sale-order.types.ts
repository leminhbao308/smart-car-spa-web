import {BaseAuditEntity, Branch, BranchRef, Product, ProductRef, UserManagementInfo, WarehouseRef} from "@/lib/api";
import {UUID} from "node:crypto";
import {Warehouse} from "@/lib/api/types/warehouse.types";


export interface SalesOrderLineInput extends BaseAuditEntity {
  product: ProductRef;
  qty: number;
  unitPrice?: number;
}

export interface SalesOrderInput extends BaseAuditEntity {
  branch: BranchRef;
  warehouse: WarehouseRef;
  lines: SalesOrderLineInput[];
}

export interface SalesOrderLine {
  id: UUID;
  product: ProductRef;
  quantity: number;
  unitPrice: number;
}

export interface SalesOrder {
  id: UUID;
  status: "DRAFT" | "CONFIRMED" | "FULFILLED" | string;
  branch: BranchRef;
  warehouse: WarehouseRef;
  lines: SalesOrderLine[];
}

export interface CreateSORequest {
  branch_id: string;
  warehouse_id: string;
  customer_id?: string;
  lines: CreateSOLine[];
}

export interface CreateSOLine {
  product_id: string;
  qty: number;
  unit_price?: number;
}

export interface CreateReturnRequest {
  items: ReturnItem[];
}

export interface ReturnItem {
  product_id: string;
  qty: number;
  unit_cost: number;
}

export interface SaleOrderResponse extends BaseAuditEntity {
  id: UUID;
  customer?: UserManagementInfo;
  branch: Branch;
  warehouse: Warehouse;
  status: "DRAFT" | "CONFIRMED" | "FULFILLED" | "PARTIALLY_RETURNED" | "RETURNED" | "CANCELLED";
  lines: SaleOrderLineResponse[];
}

export interface SaleOrderLineResponse extends BaseAuditEntity {
  id: UUID;
  product: Product;
  quantity: number;
  unit_price: number;
}
