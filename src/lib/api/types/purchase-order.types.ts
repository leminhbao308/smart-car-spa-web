import { BaseAuditEntity, Branch, Product, Supplier } from "@/lib/api";

export interface PurchaseOrder extends BaseAuditEntity {
  id: string;
  branch: Branch;
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

// Excel Import/Export Types
export interface ExcelImportPreviewRow {
  product_code: string;
  product_name: string;
  supplier_name: string;
  quantity: number;
  unit_cost: number;
  lot_code?: string;
  expiry_date?: string;
}

export interface ExcelImportError {
  row: number;
  field: string;
  message: string;
}

export interface ExcelImportPreviewResponse {
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  errors: ExcelImportError[];
  preview_data: ExcelImportPreviewRow[];
}

export interface ConfirmImportRequest {
  branch_id: string;
  lines: Array<{
    product_code: string;
    supplier_name: string;
    quantity: number;
    unit_cost: number;
    lot_code?: string;
    expiry_date?: string;
  }>;
}
