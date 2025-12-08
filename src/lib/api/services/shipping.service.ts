import axios from "axios";
import {
  Province,
  Commune,
  ProvinceResponse,
  CommuneResponse,
} from "../types/shipping.types";

const SHIPPING_API_BASE = "https://production.cas.so/address-kit/2025-07-01";

export class ShippingService {
  /**
   * Get all provinces/cities
   */
  static async getProvinces(): Promise<Province[]> {
    try {
      console.log("Fetching provinces...");

      const response = await axios.get<ProvinceResponse>(
        `${SHIPPING_API_BASE}/provinces`
      );

      console.log("Get provinces API response:", response.data);

      if (response.data && response.data.provinces) {
        return response.data.provinces;
      } else {
        throw new Error("Failed to fetch provinces");
      }
    } catch (error) {
      console.error("Get provinces error:", error);
      throw error;
    }
  }

  /**
   * Get communes/wards by province code
   */
  static async getCommunesByProvince(provinceCode: string): Promise<Commune[]> {
    try {
      console.log("Fetching communes for province:", provinceCode);

      const response = await axios.get<CommuneResponse>(
        `${SHIPPING_API_BASE}/provinces/${provinceCode}/communes`
      );

      console.log("Get communes API response:", response.data);

      if (response.data && response.data.communes) {
        return response.data.communes;
      } else {
        throw new Error("Failed to fetch communes");
      }
    } catch (error) {
      console.error("Get communes error:", error);
      throw error;
    }
  }

  /**
   * Get province name by code
   */
  static async getProvinceName(provinceCode: string): Promise<string> {
    try {
      const provinces = await this.getProvinces();
      const province = provinces.find((p) => p.code === provinceCode);
      return province?.name || "";
    } catch (error) {
      console.error("Get province name error:", error);
      return "";
    }
  }

  /**
   * Get commune name by code
   */
  static async getCommuneName(
    provinceCode: string,
    communeCode: string
  ): Promise<string> {
    try {
      const communes = await this.getCommunesByProvince(provinceCode);
      const commune = communes.find((c) => c.code === communeCode);
      return commune?.name || "";
    } catch (error) {
      console.error("Get commune name error:", error);
      return "";
    }
  }
}
