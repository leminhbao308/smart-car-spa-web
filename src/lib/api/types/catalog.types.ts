import {BaseAuditEntity, BasePaginationResponse, ApiResponse} from './common.types';
import {Product} from "@/lib/api";
import {InventoryView} from "@/lib/api/types/inventory.types";

export interface CatalogItem extends BaseAuditEntity {
  product: Product;
  price: number;
  inventory: InventoryView;
}

export interface CatalogData extends BaseAuditEntity {
  items: CatalogItem[];
}
