import {UUID} from "node:crypto";
import api from "../axios";
import {Warehouse} from "@/lib/api/types/warehouse.types";

export const WarehouseService = {
  getWarehouseByBranchId: async (branchId: string): Promise<Warehouse> => {
    const response = await api.get(`/warehouses/by-branch/${branchId}`);
    return response.data.data;
  },

  getWarehouseById: async (warehouseId: string): Promise<Warehouse> => {
    const response = await api.get(`/warehouses/${warehouseId}`);
    return response.data.data;
  },

  getAllWarehouses: async (): Promise<Warehouse[]> => {
    const response = await api.get(`/warehouses/get-all`);
    return response.data.data;
  }
};
