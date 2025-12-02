// Shipping Types

export interface Province {
  code: string;
  name: string;
  englishName: string;
  administrativeLevel: string;
  decree: string;
}

export interface Commune {
  code: string;
  name: string;
  englishName: string;
  administrativeLevel: string;
  provinceCode: string;
  provinceName: string;
  decree: string;
}

export interface ProvinceResponse {
  requestId: string;
  provinces: Province[];
}

export interface CommuneResponse {
  requestId: string;
  communes: Commune[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
