import {BaseAuditEntity, Branch, Product, Supplier, Warehouse} from "@/lib/api";

export interface PurchaseOrder extends BaseAuditEntity {
  id: string;
  branch: Branch;
  warehouse: Warehouse;
  lines: PurchaseOrderLine[];
}

export interface PurchaseOrderLine extends BaseAuditEntity {
  id: string;
  product: Product;
  supplier: Supplier;
  qty_ordered: number;
  unit_cost: number;
  lot_code: string | null;
  expiry_date: string | null;
}

export interface CreatePORequest {
  branch_id: string;
  warehouse_id: string;
  lines: CreatePOLineRequest[];
}

export interface CreatePOLineRequest {
  product_id: string;
  supplier_id: string;
  qty: number;
  unit_cost: number;
  lot_code?: string;
  expiry_date?: string;
}

export interface PurchaseHistory {
  peak_unit_cost: number;
  lines: PurchaseOrderLine[];
}
