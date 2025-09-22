// Mock data cho đặt lịch
export const bookingsData = [
  {
    id: 1,
    bookingCode: "BK001",
    customerId: 1,
    customerName: "Nguyễn Văn An",
    customerPhone: "0123456789",
    customerEmail: "nguyenvanan@gmail.com",
    vehicleId: 1,
    vehicleInfo: {
      licensePlate: "51A-12345",
      brand: "Toyota",
      model: "Camry",
      year: 2020,
      color: "Trắng"
    },
    serviceType: "full_service",
    serviceName: "Dịch vụ chăm sóc toàn diện",
    services: [
      { id: 1, name: "Rửa xe cao cấp", price: 200000, duration: 60 },
      { id: 2, name: "Đánh bóng", price: 300000, duration: 90 },
      { id: 3, name: "Bảo dưỡng định kỳ", price: 500000, duration: 120 },
      { id: 4, name: "Chăm sóc nội thất", price: 250000, duration: 45 }
    ],
    totalPrice: 1250000,
    estimatedDuration: 315, // minutes
    bookingDate: "2024-01-20",
    bookingTime: "09:00",
    preferredDate: "2024-01-20",
    preferredTime: "09:00",
    status: "confirmed",
    priority: "normal",
    notes: "Khách hàng VIP, cần chăm sóc đặc biệt",
    specialRequests: [
      "Sử dụng sản phẩm cao cấp",
      "Kiểm tra kỹ hệ thống phanh",
      "Gọi điện trước khi bắt đầu"
    ],
    assignedStaff: [
      { id: 1, name: "Trần Văn Minh", role: "Kỹ thuật viên chính" },
      { id: 2, name: "Lê Thị Hoa", role: "Chuyên viên chăm sóc" }
    ],
    branchId: 1,
    branchName: "Chi nhánh Quận 1",
    branchAddress: "123 Đường Lê Lợi, Quận 1, TP.HCM",
    branchPhone: "028-1234-5678",
    createdAt: "2024-01-15 10:30:00",
    updatedAt: "2024-01-15 14:20:00",
    confirmedAt: "2024-01-15 14:20:00",
    completedAt: null,
    cancelledAt: null,
    cancellationReason: null,
  },
  {
    id: 2,
    bookingCode: "BK002",
    customerId: 2,
    customerName: "Trần Thị Bình",
    customerPhone: "0987654321",
    customerEmail: "tranthibinh@yahoo.com",
    vehicleId: 3,
    vehicleInfo: {
      licensePlate: "51C-11111",
      brand: "Mazda",
      model: "CX-5",
      year: 2019,
      color: "Xám"
    },
    serviceType: "quick_wash",
    serviceName: "Rửa xe nhanh",
    services: [
      { id: 5, name: "Rửa xe nhanh", price: 100000, duration: 30 },
      { id: 6, name: "Hút bụi nội thất", price: 80000, duration: 20 }
    ],
    totalPrice: 180000,
    estimatedDuration: 50,
    bookingDate: "2024-01-18",
    bookingTime: "14:30",
    preferredDate: "2024-01-18",
    preferredTime: "14:30",
    status: "completed",
    priority: "normal",
    notes: "Khách hàng thường xuyên",
    specialRequests: [],
    assignedStaff: [
      { id: 3, name: "Phạm Văn Đức", role: "Kỹ thuật viên" }
    ],
    branchId: 2,
    branchName: "Chi nhánh Quận 3",
    branchAddress: "456 Đường Nguyễn Huệ, Quận 3, TP.HCM",
    branchPhone: "028-2345-6789",
    createdAt: "2024-01-17 16:45:00",
    updatedAt: "2024-01-18 15:30:00",
    confirmedAt: "2024-01-17 17:00:00",
    completedAt: "2024-01-18 15:30:00",
    cancelledAt: null,
    cancellationReason: null,
  },
  {
    id: 3,
    bookingCode: "BK003",
    customerId: 3,
    customerName: "Lê Văn Cường",
    customerPhone: "0369258147",
    customerEmail: "levancuong@outlook.com",
    vehicleId: 4,
    vehicleInfo: {
      licensePlate: "51D-22222",
      brand: "BMW",
      model: "X5",
      year: 2022,
      color: "Xanh dương"
    },
    serviceType: "premium_service",
    serviceName: "Dịch vụ cao cấp",
    services: [
      { id: 7, name: "Rửa xe cao cấp", price: 300000, duration: 90 },
      { id: 8, name: "Đánh bóng chuyên nghiệp", price: 500000, duration: 120 },
      { id: 9, name: "Bảo dưỡng cao cấp", price: 800000, duration: 180 },
      { id: 10, name: "Chăm sóc nội thất luxury", price: 400000, duration: 60 }
    ],
    totalPrice: 2000000,
    estimatedDuration: 450,
    bookingDate: "2024-01-22",
    bookingTime: "08:00",
    preferredDate: "2024-01-22",
    preferredTime: "08:00",
    status: "pending",
    priority: "high",
    notes: "Khách hàng premium, xe BMW X5",
    specialRequests: [
      "Sử dụng sản phẩm BMW chính hãng",
      "Kiểm tra toàn bộ hệ thống",
      "Báo cáo chi tiết tình trạng xe"
    ],
    assignedStaff: [
      { id: 1, name: "Trần Văn Minh", role: "Kỹ thuật viên chính" },
      { id: 4, name: "Nguyễn Thị Lan", role: "Chuyên viên cao cấp" }
    ],
    branchId: 1,
    branchName: "Chi nhánh Quận 1",
    branchAddress: "123 Đường Lê Lợi, Quận 1, TP.HCM",
    branchPhone: "028-1234-5678",
    createdAt: "2024-01-19 09:15:00",
    updatedAt: "2024-01-19 09:15:00",
    confirmedAt: null,
    completedAt: null,
    cancelledAt: null,
    cancellationReason: null,
  },
  {
    id: 4,
    bookingCode: "BK004",
    customerId: 4,
    customerName: "Phạm Thị Dung",
    customerPhone: "0527419630",
    customerEmail: "phamthidung@gmail.com",
    vehicleId: 6,
    vehicleInfo: {
      licensePlate: "51F-44444",
      brand: "Hyundai",
      model: "Tucson",
      year: 2023,
      color: "Trắng"
    },
    serviceType: "basic_wash",
    serviceName: "Rửa xe cơ bản",
    services: [
      { id: 11, name: "Rửa xe cơ bản", price: 80000, duration: 45 },
      { id: 12, name: "Lau kính", price: 50000, duration: 15 }
    ],
    totalPrice: 130000,
    estimatedDuration: 60,
    bookingDate: "2024-01-19",
    bookingTime: "10:00",
    preferredDate: "2024-01-19",
    preferredTime: "10:00",
    status: "cancelled",
    priority: "normal",
    notes: "Khách hàng mới",
    specialRequests: [],
    assignedStaff: [],
    branchId: 2,
    branchName: "Chi nhánh Quận 3",
    branchAddress: "456 Đường Nguyễn Huệ, Quận 3, TP.HCM",
    branchPhone: "028-2345-6789",
    createdAt: "2024-01-18 14:20:00",
    updatedAt: "2024-01-19 08:30:00",
    confirmedAt: "2024-01-18 14:30:00",
    completedAt: null,
    cancelledAt: "2024-01-19 08:30:00",
    cancellationReason: "Khách hàng thay đổi lịch trình",
  },
  {
    id: 5,
    bookingCode: "BK005",
    customerId: 5,
    customerName: "Hoàng Văn Em",
    customerPhone: "0741852963",
    customerEmail: "hoangvanem@hotmail.com",
    vehicleId: 7,
    vehicleInfo: {
      licensePlate: "51G-55555",
      brand: "Ford",
      model: "Everest",
      year: 2020,
      color: "Xám"
    },
    serviceType: "maintenance",
    serviceName: "Bảo dưỡng định kỳ",
    services: [
      { id: 13, name: "Thay dầu động cơ", price: 400000, duration: 60 },
      { id: 14, name: "Kiểm tra hệ thống", price: 200000, duration: 90 },
      { id: 15, name: "Rửa xe", price: 150000, duration: 45 }
    ],
    totalPrice: 750000,
    estimatedDuration: 195,
    bookingDate: "2024-01-21",
    bookingTime: "13:00",
    preferredDate: "2024-01-21",
    preferredTime: "13:00",
    status: "in_progress",
    priority: "normal",
    notes: "Bảo dưỡng định kỳ 6 tháng",
    specialRequests: [
      "Kiểm tra kỹ hệ thống phanh",
      "Thay lọc gió nếu cần"
    ],
    assignedStaff: [
      { id: 5, name: "Vũ Văn Tài", role: "Kỹ thuật viên" },
      { id: 6, name: "Đặng Thị Mai", role: "Chuyên viên rửa xe" }
    ],
    branchId: 1,
    branchName: "Chi nhánh Quận 1",
    branchAddress: "123 Đường Lê Lợi, Quận 1, TP.HCM",
    branchPhone: "028-1234-5678",
    createdAt: "2024-01-20 11:00:00",
    updatedAt: "2024-01-21 13:15:00",
    confirmedAt: "2024-01-20 11:30:00",
    completedAt: null,
    cancelledAt: null,
    cancellationReason: null,
  },
  {
    id: 6,
    bookingCode: "BK006",
    customerId: 6,
    customerName: "Vũ Thị Phương",
    customerPhone: "0963852741",
    customerEmail: "vuthiphuong@gmail.com",
    vehicleId: 8,
    vehicleInfo: {
      licensePlate: "51H-66666",
      brand: "Audi",
      model: "Q7",
      year: 2023,
      color: "Đen"
    },
    serviceType: "luxury_service",
    serviceName: "Dịch vụ luxury",
    services: [
      { id: 16, name: "Rửa xe luxury", price: 500000, duration: 120 },
      { id: 17, name: "Đánh bóng cao cấp", price: 800000, duration: 150 },
      { id: 18, name: "Bảo dưỡng luxury", price: 1200000, duration: 240 },
      { id: 19, name: "Chăm sóc nội thất luxury", price: 600000, duration: 90 }
    ],
    totalPrice: 3100000,
    estimatedDuration: 600,
    bookingDate: "2024-01-23",
    bookingTime: "07:00",
    preferredDate: "2024-01-23",
    preferredTime: "07:00",
    status: "confirmed",
    priority: "high",
    notes: "Khách hàng VIP, xe Audi Q7",
    specialRequests: [
      "Sử dụng sản phẩm Audi chính hãng",
      "Dịch vụ tại chỗ riêng",
      "Báo cáo chi tiết với hình ảnh"
    ],
    assignedStaff: [
      { id: 1, name: "Trần Văn Minh", role: "Kỹ thuật viên chính" },
      { id: 4, name: "Nguyễn Thị Lan", role: "Chuyên viên cao cấp" },
      { id: 7, name: "Bùi Văn Hùng", role: "Chuyên viên luxury" }
    ],
    branchId: 1,
    branchName: "Chi nhánh Quận 1",
    branchAddress: "123 Đường Lê Lợi, Quận 1, TP.HCM",
    branchPhone: "028-1234-5678",
    createdAt: "2024-01-20 15:30:00",
    updatedAt: "2024-01-20 16:00:00",
    confirmedAt: "2024-01-20 16:00:00",
    completedAt: null,
    cancelledAt: null,
    cancellationReason: null,
  },
];

// Định nghĩa loại dịch vụ
export const serviceTypes = [
  { value: "basic_wash", label: "Rửa xe cơ bản", color: "blue", icon: "🚿", duration: 60, price: 80000 },
  { value: "quick_wash", label: "Rửa xe nhanh", color: "green", icon: "⚡", duration: 30, price: 100000 },
  { value: "full_service", label: "Dịch vụ toàn diện", color: "purple", icon: "✨", duration: 300, price: 1200000 },
  { value: "premium_service", label: "Dịch vụ cao cấp", color: "gold", icon: "💎", duration: 450, price: 2000000 },
  { value: "luxury_service", label: "Dịch vụ luxury", color: "red", icon: "👑", duration: 600, price: 3000000 },
  { value: "maintenance", label: "Bảo dưỡng", color: "orange", icon: "🔧", duration: 180, price: 800000 },
];

// Định nghĩa trạng thái đặt lịch
export const bookingStatuses = [
  { value: "pending", label: "Chờ xác nhận", color: "orange", icon: "⏳" },
  { value: "confirmed", label: "Đã xác nhận", color: "blue", icon: "✅" },
  { value: "in_progress", label: "Đang thực hiện", color: "green", icon: "🔄" },
  { value: "completed", label: "Hoàn thành", color: "green", icon: "✔️" },
  { value: "cancelled", label: "Đã hủy", color: "red", icon: "❌" },
  { value: "no_show", label: "Không đến", color: "gray", icon: "🚫" },
];

// Định nghĩa mức độ ưu tiên
export const priorityLevels = [
  { value: "low", label: "Thấp", color: "gray", icon: "🔽" },
  { value: "normal", label: "Bình thường", color: "blue", icon: "➡️" },
  { value: "high", label: "Cao", color: "orange", icon: "🔼" },
  { value: "urgent", label: "Khẩn cấp", color: "red", icon: "🚨" },
];

// Định nghĩa chi nhánh
export const branches = [
  { id: 1, name: "Chi nhánh Quận 1", address: "123 Đường Lê Lợi, Quận 1, TP.HCM", phone: "028-1234-5678" },
  { id: 2, name: "Chi nhánh Quận 3", address: "456 Đường Nguyễn Huệ, Quận 3, TP.HCM", phone: "028-2345-6789" },
  { id: 3, name: "Chi nhánh Quận 7", address: "789 Đường Nguyễn Thị Thập, Quận 7, TP.HCM", phone: "028-3456-7890" },
];

// Định nghĩa nhân viên
export const staffMembers = [
  { id: 1, name: "Trần Văn Minh", role: "Kỹ thuật viên chính", branchId: 1, status: "active" },
  { id: 2, name: "Lê Thị Hoa", role: "Chuyên viên chăm sóc", branchId: 1, status: "active" },
  { id: 3, name: "Phạm Văn Đức", role: "Kỹ thuật viên", branchId: 2, status: "active" },
  { id: 4, name: "Nguyễn Thị Lan", role: "Chuyên viên cao cấp", branchId: 1, status: "active" },
  { id: 5, name: "Vũ Văn Tài", role: "Kỹ thuật viên", branchId: 1, status: "active" },
  { id: 6, name: "Đặng Thị Mai", role: "Chuyên viên rửa xe", branchId: 1, status: "active" },
  { id: 7, name: "Bùi Văn Hùng", role: "Chuyên viên luxury", branchId: 1, status: "active" },
];

// Định nghĩa dịch vụ
export const availableServices = [
  { id: 1, name: "Rửa xe cao cấp", price: 200000, duration: 60, category: "cleaning" },
  { id: 2, name: "Đánh bóng", price: 300000, duration: 90, category: "cleaning" },
  { id: 3, name: "Bảo dưỡng định kỳ", price: 500000, duration: 120, category: "maintenance" },
  { id: 4, name: "Chăm sóc nội thất", price: 250000, duration: 45, category: "interior" },
  { id: 5, name: "Rửa xe nhanh", price: 100000, duration: 30, category: "cleaning" },
  { id: 6, name: "Hút bụi nội thất", price: 80000, duration: 20, category: "interior" },
  { id: 7, name: "Rửa xe cao cấp", price: 300000, duration: 90, category: "cleaning" },
  { id: 8, name: "Đánh bóng chuyên nghiệp", price: 500000, duration: 120, category: "cleaning" },
  { id: 9, name: "Bảo dưỡng cao cấp", price: 800000, duration: 180, category: "maintenance" },
  { id: 10, name: "Chăm sóc nội thất luxury", price: 400000, duration: 60, category: "interior" },
  { id: 11, name: "Rửa xe cơ bản", price: 80000, duration: 45, category: "cleaning" },
  { id: 12, name: "Lau kính", price: 50000, duration: 15, category: "cleaning" },
  { id: 13, name: "Thay dầu động cơ", price: 400000, duration: 60, category: "maintenance" },
  { id: 14, name: "Kiểm tra hệ thống", price: 200000, duration: 90, category: "maintenance" },
  { id: 15, name: "Rửa xe", price: 150000, duration: 45, category: "cleaning" },
  { id: 16, name: "Rửa xe luxury", price: 500000, duration: 120, category: "cleaning" },
  { id: 17, name: "Đánh bóng cao cấp", price: 800000, duration: 150, category: "cleaning" },
  { id: 18, name: "Bảo dưỡng luxury", price: 1200000, duration: 240, category: "maintenance" },
  { id: 19, name: "Chăm sóc nội thất luxury", price: 600000, duration: 90, category: "interior" },
];
