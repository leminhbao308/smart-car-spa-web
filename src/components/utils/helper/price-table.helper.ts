import { 
  PriceTable, 
  PriceTableService, 
  PriceTableProduct, 
  PriceTableServicePackage, 
  VehicleTypePricing,
  DiscountProgram,
  PriceHistory 
} from "@/components/utils/data/price-table.data";

/**
 * Tính toán giá cuối cùng cho dịch vụ
 */
export const calculateServiceFinalPrice = (
  basePrice: number, 
  discountPercentage: number
): number => {
  return basePrice * (1 - discountPercentage / 100);
};

/**
 * Tính toán giá cuối cùng cho sản phẩm
 */
export const calculateProductFinalPrice = (
  basePrice: number, 
  discountPercentage: number
): number => {
  return basePrice * (1 - discountPercentage / 100);
};

/**
 * Tính toán giá cuối cùng cho gói dịch vụ
 */
export const calculateServicePackageFinalPrice = (
  basePrice: number, 
  discountPercentage: number
): number => {
  return basePrice * (1 - discountPercentage / 100);
};

/**
 * Tính toán giá theo loại xe
 */
export const calculatePriceByVehicleType = (
  basePrice: number, 
  multiplier: number
): number => {
  return basePrice * multiplier;
};

/**
 * Áp dụng chương trình giảm giá
 */
export const applyDiscountProgram = (
  price: number, 
  discountProgram: DiscountProgram
): number => {
  if (discountProgram.type === "percentage") {
    return price * (1 - discountProgram.value / 100);
  } else {
    return Math.max(0, price - discountProgram.value);
  }
};

/**
 * Kiểm tra xem chương trình giảm giá có áp dụng được không
 */
export const isDiscountProgramApplicable = (
  discountProgram: DiscountProgram,
  serviceId?: number,
  productId?: number,
  packageId?: number
): boolean => {
  switch (discountProgram.applicableTo) {
    case "all":
      return true;
    case "services":
      return serviceId ? discountProgram.applicableServices.includes(serviceId) : false;
    case "products":
      return productId ? discountProgram.applicableProducts.includes(productId) : false;
    case "packages":
      return packageId ? discountProgram.applicablePackages.includes(packageId) : false;
    case "custom":
      return false; // Cần logic tùy chỉnh
    default:
      return false;
  }
};

/**
 * Tính tổng giá trị bảng giá
 */
export const calculatePriceTableTotal = (priceTable: PriceTable): number => {
  const servicesTotal = priceTable.services.reduce(
    (sum, service) => sum + service.finalPrice, 
    0
  );
  const productsTotal = priceTable.products.reduce(
    (sum, product) => sum + product.finalPrice, 
    0
  );
  const packagesTotal = priceTable.servicePackages.reduce(
    (sum, pkg) => sum + pkg.finalPrice, 
    0
  );
  
  return servicesTotal + productsTotal + packagesTotal;
};

/**
 * Lấy bảng giá mặc định
 */
export const getDefaultPriceTable = (priceTables: PriceTable[]): PriceTable | undefined => {
  return priceTables.find(table => table.isDefault && table.status === "active");
};

/**
 * Lấy bảng giá theo chi nhánh
 */
export const getPriceTableByBranch = (
  priceTables: PriceTable[], 
  branchId: number | null
): PriceTable[] => {
  return priceTables.filter(table => table.branchId === branchId);
};

/**
 * Lấy bảng giá đang hoạt động
 */
export const getActivePriceTables = (priceTables: PriceTable[]): PriceTable[] => {
  return priceTables.filter(table => table.status === "active");
};

/**
 * Kiểm tra xem bảng giá có hiệu lực không
 */
export const isPriceTableEffective = (priceTable: PriceTable): boolean => {
  const now = new Date();
  const effectiveDate = new Date(priceTable.effectiveDate);
  const expiryDate = priceTable.expiryDate ? new Date(priceTable.expiryDate) : null;
  
  return now >= effectiveDate && (!expiryDate || now <= expiryDate);
};

/**
 * Tạo lịch sử thay đổi giá
 */
export const createPriceHistory = (
  priceTableId: number,
  serviceId: number,
  oldPrice: number,
  newPrice: number,
  changeReason: string,
  createdBy: string
): PriceHistory => {
  const changeType = newPrice > oldPrice ? "increase" : newPrice < oldPrice ? "decrease" : "new";
  
  return {
    id: Date.now(),
    priceTableId,
    serviceId,
    oldPrice,
    newPrice,
    changeType,
    changeReason,
    effectiveDate: new Date().toISOString().split("T")[0],
    createdBy,
    createdAt: new Date().toISOString(),
  };
};

/**
 * Validate bảng giá
 */
export const validatePriceTable = (priceTable: Partial<PriceTable>): string[] => {
  const errors: string[] = [];

  if (!priceTable.name?.trim()) {
    errors.push("Tên bảng giá không được để trống");
  }
  
  if (!priceTable.code?.trim()) {
    errors.push("Mã bảng giá không được để trống");
  }
  
  if (!priceTable.effectiveDate) {
    errors.push("Ngày hiệu lực không được để trống");
  }
  
  if (priceTable.expiryDate && priceTable.effectiveDate) {
    const effectiveDate = new Date(priceTable.effectiveDate);
    const expiryDate = new Date(priceTable.expiryDate);
    
    if (expiryDate <= effectiveDate) {
      errors.push("Ngày hết hạn phải sau ngày hiệu lực");
    }
  }
  
  if (!priceTable.services || priceTable.services.length === 0) {
    if (!priceTable.products || priceTable.products.length === 0) {
      if (!priceTable.servicePackages || priceTable.servicePackages.length === 0) {
        errors.push("Bảng giá phải có ít nhất một dịch vụ, sản phẩm hoặc gói dịch vụ");
      }
    }
  }

  return errors;
};

/**
 * Tạo bảng giá mới với giá trị mặc định
 */
export const createNewPriceTable = (): Partial<PriceTable> => {
  return {
    name: "",
    code: "",
    description: "",
    branchId: null,
    status: "active",
    effectiveDate: new Date().toISOString().split("T")[0],
    isDefault: false,
    services: [],
    products: [],
    servicePackages: [],
    vehicleTypes: [],
    discountPrograms: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin",
    updatedBy: "admin",
  };
};

/**
 * Sao chép bảng giá
 */
export const duplicatePriceTable = (priceTable: PriceTable): PriceTable => {
  return {
    ...priceTable,
    id: Date.now(),
    name: `${priceTable.name} (Bản sao)`,
    code: `${priceTable.code}-COPY`,
    status: "draft",
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin",
    updatedBy: "admin",
  };
};

/**
 * Sắp xếp bảng giá
 */
export const sortPriceTables = (
  priceTables: PriceTable[], 
  sortBy: string, 
  sortOrder: "asc" | "desc"
): PriceTable[] => {
  return [...priceTables].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case "name":
        aValue = a.name;
        bValue = b.name;
        break;
      case "code":
        aValue = a.code;
        bValue = b.code;
        break;
      case "effectiveDate":
        aValue = new Date(a.effectiveDate);
        bValue = new Date(b.effectiveDate);
        break;
      case "status":
        aValue = a.status;
        bValue = b.status;
        break;
      case "totalValue":
        aValue = calculatePriceTableTotal(a);
        bValue = calculatePriceTableTotal(b);
        break;
      default:
        aValue = a.name;
        bValue = b.name;
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });
};

/**
 * Lọc bảng giá theo điều kiện
 */
export const filterPriceTables = (
  priceTables: PriceTable[],
  filters: {
    searchText?: string;
    branchId?: number | null;
    status?: string;
    dateRange?: [string, string];
  }
): PriceTable[] => {
  return priceTables.filter(table => {
    // Tìm kiếm theo tên hoặc mã
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      if (!table.name.toLowerCase().includes(searchLower) && 
          !table.code.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Lọc theo chi nhánh
    if (filters.branchId !== undefined) {
      if (table.branchId !== filters.branchId) {
        return false;
      }
    }

    // Lọc theo trạng thái
    if (filters.status) {
      if (table.status !== filters.status) {
        return false;
      }
    }

    // Lọc theo khoảng thời gian
    if (filters.dateRange) {
      const [startDate, endDate] = filters.dateRange;
      const tableDate = new Date(table.effectiveDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (tableDate < start || tableDate > end) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Lấy thống kê bảng giá
 */
export const getPriceTableStats = (priceTables: PriceTable[]) => {
  const totalTables = priceTables.length;
  const activeTables = priceTables.filter(t => t.status === "active").length;
  const draftTables = priceTables.filter(t => t.status === "draft").length;
  const inactiveTables = priceTables.filter(t => t.status === "inactive").length;
  
  const totalServices = priceTables.reduce((sum, t) => sum + t.services.length, 0);
  const totalProducts = priceTables.reduce((sum, t) => sum + t.products.length, 0);
  const totalServicePackages = priceTables.reduce((sum, t) => sum + t.servicePackages.length, 0);
  const totalDiscountPrograms = priceTables.reduce((sum, t) => sum + t.discountPrograms.length, 0);
  
  const totalValue = priceTables.reduce((sum, t) => sum + calculatePriceTableTotal(t), 0);
  
  return {
    totalTables,
    activeTables,
    draftTables,
    inactiveTables,
    totalServices,
    totalProducts,
    totalServicePackages,
    totalDiscountPrograms,
    totalValue,
  };
};
