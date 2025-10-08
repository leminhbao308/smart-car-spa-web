import {BaseAuditEntity, BranchRef} from "@/lib/api";

export interface Warehouse extends BaseAuditEntity {
  id: string,
  branch: BranchRef,
  locked: boolean,
}
