import {CatalogData} from "@/lib/api/types/catalog.types";
import api from "../axios";

export const CatalogService = {
  getForSaleCatalogs: async (warehouseId: string): Promise<CatalogData> => {
    const response = await api.get(`/catalogs/for-sale?branchId=${warehouseId}`);
    return response.data.data;
  }
}
