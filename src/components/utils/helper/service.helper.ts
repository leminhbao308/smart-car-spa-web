// Helper functions cho Service

export interface ServiceProduct {
  productId: number;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Service {
  id: number;
  serviceCode: string;
  serviceName: string;
  serviceTypeId: number;
  serviceTypeName: string;
  description: string;
  products: ServiceProduct[];
  laborCost: number;
  totalPrice: number;
  duration: number;
  status: string;
  features: string[];
  requirements: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Tính tổng giá sản phẩm trong dịch vụ
 */
export const calculateProductsTotal = (products: ServiceProduct[]): number => {
  return products.reduce((sum, product) => sum + product.totalPrice, 0);
};

/**
 * Tính tổng giá dịch vụ (sản phẩm + lao động)
 */
export const calculateServiceTotal = (products: ServiceProduct[], laborCost: number): number => {
  return calculateProductsTotal(products) + laborCost;
};

/**
 * Tính lại tổng giá cho một sản phẩm
 */
export const calculateProductTotal = (quantity: number, unitPrice: number): number => {
  return quantity * unitPrice;
};

/**
 * Validate dữ liệu dịch vụ
 */
export const validateService = (service: Partial<Service>): string[] => {
  const errors: string[] = [];

  if (!service.serviceCode?.trim()) {
    errors.push("Mã dịch vụ không được để trống");
  }

  if (!service.serviceName?.trim()) {
    errors.push("Tên dịch vụ không được để trống");
  }

  if (!service.description?.trim()) {
    errors.push("Mô tả dịch vụ không được để trống");
  }

  if (!service.duration || service.duration <= 0) {
    errors.push("Thời gian thực hiện phải lớn hơn 0");
  }

  if (service.laborCost === undefined || service.laborCost < 0) {
    errors.push("Chi phí lao động không được âm");
  }

  if (service.products && service.products.length > 0) {
    service.products.forEach((product, index) => {
      if (!product.productId) {
        errors.push(`Sản phẩm thứ ${index + 1}: Chưa chọn sản phẩm`);
      }
      if (!product.quantity || product.quantity <= 0) {
        errors.push(`Sản phẩm thứ ${index + 1}: Số lượng phải lớn hơn 0`);
      }
    });
  }

  return errors;
};

/**
 * Tạo dịch vụ mới với dữ liệu mặc định
 */
export const createNewService = (): Partial<Service> => {
  return {
    serviceCode: "",
    serviceName: "",
    serviceTypeId: 1,
    serviceTypeName: "",
    description: "",
    products: [],
    laborCost: 0,
    totalPrice: 0,
    duration: 30,
    status: "active",
    features: [],
    requirements: [],
    notes: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Tạo sản phẩm dịch vụ mới
 */
export const createNewServiceProduct = (): ServiceProduct => {
  return {
    productId: 0,
    productCode: "",
    productName: "",
    quantity: 0,
    unitPrice: 0,
    totalPrice: 0,
  };
};

/**
 * Cập nhật thông tin sản phẩm từ dữ liệu sản phẩm gốc
 */
export const updateProductFromData = (
  serviceProduct: ServiceProduct,
  productData: any
): ServiceProduct => {
  return {
    ...serviceProduct,
    productCode: productData.productCode,
    productName: productData.name,
    unitPrice: productData.price,
    totalPrice: serviceProduct.quantity * productData.price,
  };
};

/**
 * Lọc dịch vụ theo trạng thái
 */
export const filterServicesByStatus = (services: Service[], status: string): Service[] => {
  if (!status) return services;
  return services.filter(service => service.status === status);
};

/**
 * Lọc dịch vụ theo loại dịch vụ
 */
export const filterServicesByType = (services: Service[], serviceTypeName: string): Service[] => {
  if (!serviceTypeName) return services;
  return services.filter(service => service.serviceTypeName === serviceTypeName);
};

/**
 * Tìm kiếm dịch vụ theo từ khóa
 */
export const searchServices = (services: Service[], keyword: string): Service[] => {
  if (!keyword?.trim()) return services;
  
  const searchLower = keyword.toLowerCase();
  return services.filter(service =>
    service.serviceName.toLowerCase().includes(searchLower) ||
    service.serviceCode.toLowerCase().includes(searchLower) ||
    service.description.toLowerCase().includes(searchLower)
  );
};

/**
 * Sắp xếp dịch vụ theo tiêu chí
 */
export const sortServices = (services: Service[], sortBy: string, order: 'asc' | 'desc' = 'asc'): Service[] => {
  const sorted = [...services].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'price':
        aValue = a.totalPrice;
        bValue = b.totalPrice;
        break;
      case 'duration':
        aValue = a.duration;
        bValue = b.duration;
        break;
      case 'name':
        aValue = a.serviceName;
        bValue = b.serviceName;
        break;
      case 'code':
        aValue = a.serviceCode;
        bValue = b.serviceCode;
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
 * Lấy thống kê dịch vụ
 */
export const getServiceStats = (services: Service[]) => {
  const totalServices = services.length;
  const activeServices = services.filter(s => s.status === 'active').length;
  const totalRevenue = services.reduce((sum, s) => sum + s.totalPrice, 0);
  const avgPrice = totalServices > 0 ? totalRevenue / totalServices : 0;
  
  return {
    totalServices,
    activeServices,
    totalRevenue,
    avgPrice,
  };
};
