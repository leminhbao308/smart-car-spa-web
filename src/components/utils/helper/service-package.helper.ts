// Helper functions cho Service Package

export interface ServicePackageService {
  id: number;
  serviceName: string;
  totalPrice: number;
  quantity: number;
}

export interface ServicePackage {
  id: number;
  packageCode: string;
  packageName: string;
  description: string;
  services: ServicePackageService[];
  totalPrice: number; // Chỉ có totalPrice = tổng giá các dịch vụ
  status: string;
  targetCustomers: string[];
  validityPeriod: number;
  maxUsage: number;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Tính tổng giá của gói dịch vụ (tổng giá các dịch vụ)
 */
export const calculatePackageTotalPrice = (services: ServicePackageService[]): number => {
  return services.reduce((sum, service) => sum + (service.totalPrice * service.quantity), 0);
};

/**
 * Validate dữ liệu gói dịch vụ
 */
export const validateServicePackage = (packageData: Partial<ServicePackage>): string[] => {
  const errors: string[] = [];

  if (!packageData.packageCode?.trim()) {
    errors.push("Mã gói dịch vụ không được để trống");
  }

  if (!packageData.packageName?.trim()) {
    errors.push("Tên gói dịch vụ không được để trống");
  }

  if (!packageData.description?.trim()) {
    errors.push("Mô tả gói dịch vụ không được để trống");
  }

  if (!packageData.services || packageData.services.length === 0) {
    errors.push("Gói dịch vụ phải có ít nhất một dịch vụ");
  }

  if (!packageData.validityPeriod || packageData.validityPeriod <= 0) {
    errors.push("Thời gian hiệu lực phải lớn hơn 0");
  }

  if (!packageData.maxUsage || packageData.maxUsage <= 0) {
    errors.push("Số lần sử dụng tối đa phải lớn hơn 0");
  }

  if (!packageData.targetCustomers || packageData.targetCustomers.length === 0) {
    errors.push("Phải chọn ít nhất một nhóm khách hàng mục tiêu");
  }

  return errors;
};

/**
 * Tạo gói dịch vụ mới với dữ liệu mặc định
 */
export const createNewServicePackage = (): Partial<ServicePackage> => {
  return {
    packageCode: "",
    packageName: "",
    description: "",
    services: [],
    totalPrice: 0,
    status: "active",
    targetCustomers: [],
    validityPeriod: 30,
    maxUsage: 1,
    features: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Thêm dịch vụ vào gói
 */
export const addServiceToPackage = (
  packageData: ServicePackage,
  service: ServicePackageService
): ServicePackage => {
  const existingServiceIndex = packageData.services.findIndex(s => s.id === service.id);
  
  if (existingServiceIndex >= 0) {
    // Nếu dịch vụ đã tồn tại, tăng số lượng
    const updatedServices = [...packageData.services];
    updatedServices[existingServiceIndex] = {
      ...updatedServices[existingServiceIndex],
      quantity: updatedServices[existingServiceIndex].quantity + service.quantity
    };
    
    const newTotalPrice = calculatePackageTotalPrice(updatedServices);
    
    return {
      ...packageData,
      services: updatedServices,
      totalPrice: newTotalPrice,
      updatedAt: new Date().toISOString(),
    };
  } else {
    // Nếu dịch vụ chưa tồn tại, thêm mới
    const updatedServices = [...packageData.services, service];
    const newTotalPrice = calculatePackageTotalPrice(updatedServices);
    
    return {
      ...packageData,
      services: updatedServices,
      totalPrice: newTotalPrice,
      updatedAt: new Date().toISOString(),
    };
  }
};

/**
 * Xóa dịch vụ khỏi gói
 */
export const removeServiceFromPackage = (
  packageData: ServicePackage,
  serviceId: number
): ServicePackage => {
  const updatedServices = packageData.services.filter(s => s.id !== serviceId);
  const newTotalPrice = calculatePackageTotalPrice(updatedServices);
  
  return {
    ...packageData,
    services: updatedServices,
    totalPrice: newTotalPrice,
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Cập nhật số lượng dịch vụ trong gói
 */
export const updateServiceQuantityInPackage = (
  packageData: ServicePackage,
  serviceId: number,
  newQuantity: number
): ServicePackage => {
  if (newQuantity <= 0) {
    return removeServiceFromPackage(packageData, serviceId);
  }
  
  const updatedServices = packageData.services.map(s => 
    s.id === serviceId ? { ...s, quantity: newQuantity } : s
  );
  
  const newTotalPrice = calculatePackageTotalPrice(updatedServices);
  
  return {
    ...packageData,
    services: updatedServices,
    totalPrice: newTotalPrice,
    updatedAt: new Date().toISOString(),
  };
};


/**
 * Lọc gói dịch vụ theo trạng thái
 */
export const filterPackagesByStatus = (packages: ServicePackage[], status: string): ServicePackage[] => {
  if (!status) return packages;
  return packages.filter(pkg => pkg.status === status);
};

/**
 * Lọc gói dịch vụ theo khoảng giá
 */
export const filterPackagesByPriceRange = (
  packages: ServicePackage[], 
  minPrice: number, 
  maxPrice: number
): ServicePackage[] => {
  return packages.filter(pkg => pkg.totalPrice >= minPrice && pkg.totalPrice <= maxPrice);
};

/**
 * Lọc gói dịch vụ theo nhóm khách hàng mục tiêu
 */
export const filterPackagesByTargetCustomer = (
  packages: ServicePackage[], 
  targetCustomer: string
): ServicePackage[] => {
  if (!targetCustomer) return packages;
  return packages.filter(pkg => pkg.targetCustomers.includes(targetCustomer));
};

/**
 * Tìm kiếm gói dịch vụ theo từ khóa
 */
export const searchServicePackages = (packages: ServicePackage[], keyword: string): ServicePackage[] => {
  if (!keyword?.trim()) return packages;
  
  const searchLower = keyword.toLowerCase();
  return packages.filter(pkg =>
    pkg.packageName.toLowerCase().includes(searchLower) ||
    pkg.packageCode.toLowerCase().includes(searchLower) ||
    pkg.description.toLowerCase().includes(searchLower) ||
    pkg.services.some(service => service.serviceName.toLowerCase().includes(searchLower))
  );
};

/**
 * Sắp xếp gói dịch vụ theo tiêu chí
 */
export const sortServicePackages = (
  packages: ServicePackage[], 
  sortBy: string, 
  order: 'asc' | 'desc' = 'asc'
): ServicePackage[] => {
  const sorted = [...packages].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'price':
        aValue = a.totalPrice;
        bValue = b.totalPrice;
        break;
      case 'services':
        aValue = a.services.length;
        bValue = b.services.length;
        break;
      case 'validity':
        aValue = a.validityPeriod;
        bValue = b.validityPeriod;
        break;
      case 'name':
        aValue = a.packageName;
        bValue = b.packageName;
        break;
      case 'code':
        aValue = a.packageCode;
        bValue = b.packageCode;
        break;
      default:
        aValue = a.id;
        bValue = b.id;
    }
    
    if (typeof aValue === 'string') {
      return order === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return order === 'asc' ? aValue - bValue : bValue - aValue;
  });
  
  return sorted;
};

/**
 * Lấy thống kê gói dịch vụ
 */
export const getServicePackageStats = (packages: ServicePackage[]) => {
  const totalPackages = packages.length;
  const activePackages = packages.filter(p => p.status === 'active').length;
  const totalRevenue = packages.reduce((sum, p) => sum + p.totalPrice, 0);
  const avgPrice = totalPackages > 0 ? totalRevenue / totalPackages : 0;
  const totalServices = packages.reduce((sum, p) => sum + p.services.length, 0);
  
  return {
    totalPackages,
    activePackages,
    totalRevenue,
    avgPrice,
    totalServices,
  };
};

/**
 * Kiểm tra gói dịch vụ có hợp lệ không
 */
export const isPackageValid = (packageData: ServicePackage): boolean => {
  const errors = validateServicePackage(packageData);
  return errors.length === 0;
};

/**
 * Lấy danh sách dịch vụ duy nhất từ tất cả gói
 */
export const getUniqueServicesFromPackages = (packages: ServicePackage[]): ServicePackageService[] => {
  const serviceMap = new Map<number, ServicePackageService>();
  
  packages.forEach(pkg => {
    pkg.services.forEach(service => {
      if (!serviceMap.has(service.id)) {
        serviceMap.set(service.id, service);
      }
    });
  });
  
  return Array.from(serviceMap.values());
};

/**
 * Tính tổng số lần sử dụng tối đa của gói
 */
export const calculateTotalMaxUsage = (packageData: ServicePackage): number => {
  return packageData.services.reduce((sum, service) => sum + service.quantity, 0);
};
