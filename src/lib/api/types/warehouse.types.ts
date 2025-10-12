import {BaseAuditEntity, Branch} from "@/lib/api";

export interface Warehouse extends BaseAuditEntity {
  id: string,
  branch: Branch,
  locked: boolean,
}
