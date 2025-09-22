// Mock data cho khách hàng
export const customersData = [
  {
    id: 1,
    customerCode: "KH001",
    fullName: "Nguyễn Văn An",
    email: "nguyenvanan@gmail.com",
    phone: "0123456789",
    address: "123 Đường Lê Lợi, Quận 1, TP.HCM",
    dateOfBirth: "1985-03-15",
    gender: "male",
    customerType: "vip",
    totalOrders: 25,
    totalSpent: 15000000,
    lastVisit: "2024-01-15 14:30:00",
    joinDate: "2022-05-10 09:00:00",
    status: "active",
    notes: "Khách hàng VIP, thường xuyên sử dụng dịch vụ cao cấp",
    vehicles: [
      { id: 1, brand: "Toyota", model: "Camry", year: 2020, licensePlate: "51A-12345" },
      { id: 2, brand: "Honda", model: "CR-V", year: 2021, licensePlate: "51B-67890" }
    ],
    preferredServices: ["Rửa xe cao cấp", "Đánh bóng", "Bảo dưỡng định kỳ"],
    hasAccount: false,
  },
  {
    id: 2,
    customerCode: "KH002",
    fullName: "Trần Thị Bình",
    email: "tranthibinh@yahoo.com",
    phone: "0987654321",
    address: "456 Đường Nguyễn Huệ, Quận 3, TP.HCM",
    dateOfBirth: "1990-07-22",
    gender: "female",
    customerType: "regular",
    totalOrders: 12,
    totalSpent: 3500000,
    lastVisit: "2024-01-12 10:15:00",
    joinDate: "2023-01-20 14:30:00",
    status: "active",
    notes: "Khách hàng thường xuyên, thích dịch vụ nhanh",
    vehicles: [
      { id: 3, brand: "Mazda", model: "CX-5", year: 2019, licensePlate: "51C-11111" }
    ],
    preferredServices: ["Rửa xe nhanh", "Hút bụi nội thất"],
    hasAccount: false,
  },
  {
    id: 3,
    customerCode: "KH003",
    fullName: "Lê Văn Cường",
    email: "levancuong@outlook.com",
    phone: "0369258147",
    address: "789 Đường Võ Văn Tần, Quận 3, TP.HCM",
    dateOfBirth: "1988-11-08",
    gender: "male",
    customerType: "premium",
    totalOrders: 18,
    totalSpent: 8500000,
    lastVisit: "2024-01-14 16:45:00",
    joinDate: "2022-08-15 11:20:00",
    status: "active",
    notes: "Khách hàng premium, quan tâm đến chất lượng dịch vụ",
    vehicles: [
      { id: 4, brand: "BMW", model: "X5", year: 2022, licensePlate: "51D-22222" },
      { id: 5, brand: "Mercedes", model: "C-Class", year: 2021, licensePlate: "51E-33333" }
    ],
    preferredServices: ["Rửa xe cao cấp", "Đánh bóng", "Bảo dưỡng", "Chăm sóc nội thất"],
    hasAccount: false,
  },
  {
    id: 4,
    customerCode: "KH004",
    fullName: "Phạm Thị Dung",
    email: "phamthidung@gmail.com",
    phone: "0527419630",
    address: "321 Đường Điện Biên Phủ, Quận Bình Thạnh, TP.HCM",
    dateOfBirth: "1992-04-12",
    gender: "female",
    customerType: "new",
    totalOrders: 3,
    totalSpent: 450000,
    lastVisit: "2024-01-10 13:20:00",
    joinDate: "2023-12-01 08:45:00",
    status: "active",
    notes: "Khách hàng mới, cần chăm sóc đặc biệt",
    vehicles: [
      { id: 6, brand: "Hyundai", model: "Tucson", year: 2023, licensePlate: "51F-44444" }
    ],
    preferredServices: ["Rửa xe cơ bản"],
    hasAccount: false,
  },
  {
    id: 5,
    customerCode: "KH005",
    fullName: "Hoàng Văn Em",
    email: "hoangvanem@hotmail.com",
    phone: "0741852963",
    address: "654 Đường Cách Mạng Tháng 8, Quận 10, TP.HCM",
    dateOfBirth: "1987-09-30",
    gender: "male",
    customerType: "regular",
    totalOrders: 8,
    totalSpent: 2200000,
    lastVisit: "2024-01-08 11:30:00",
    joinDate: "2023-06-15 16:00:00",
    status: "active",
    notes: "Khách hàng thường xuyên, thích gói dịch vụ combo",
    vehicles: [
      { id: 7, brand: "Ford", model: "Everest", year: 2020, licensePlate: "51G-55555" }
    ],
    preferredServices: ["Combo rửa xe", "Bảo dưỡng"],
    hasAccount: false,
  },
  {
    id: 6,
    customerCode: "KH006",
    fullName: "Vũ Thị Phương",
    email: "vuthiphuong@gmail.com",
    phone: "0963852741",
    address: "987 Đường Lý Tự Trọng, Quận 1, TP.HCM",
    dateOfBirth: "1995-12-05",
    gender: "female",
    customerType: "vip",
    totalOrders: 32,
    totalSpent: 18000000,
    lastVisit: "2024-01-15 09:15:00",
    joinDate: "2021-03-20 10:30:00",
    status: "active",
    notes: "Khách hàng VIP lâu năm, rất hài lòng với dịch vụ",
    vehicles: [
      { id: 8, brand: "Audi", model: "Q7", year: 2023, licensePlate: "51H-66666" },
      { id: 9, brand: "Lexus", model: "RX", year: 2022, licensePlate: "51I-77777" },
      { id: 10, brand: "Porsche", model: "Cayenne", year: 2021, licensePlate: "51K-88888" }
    ],
    preferredServices: ["Rửa xe cao cấp", "Đánh bóng", "Bảo dưỡng", "Chăm sóc nội thất", "Dịch vụ tại nhà"],
    hasAccount: false,
  },
  {
    id: 7,
    customerCode: "KH007",
    fullName: "Đặng Văn Giang",
    email: "dangvangiang@yahoo.com",
    phone: "0147258369",
    address: "147 Đường Trần Hưng Đạo, Quận 5, TP.HCM",
    dateOfBirth: "1983-06-18",
    gender: "male",
    customerType: "premium",
    totalOrders: 15,
    totalSpent: 7200000,
    lastVisit: "2024-01-13 15:45:00",
    joinDate: "2022-11-10 13:15:00",
    status: "active",
    notes: "Khách hàng premium, thích dịch vụ chuyên nghiệp",
    vehicles: [
      { id: 11, brand: "Volvo", model: "XC90", year: 2022, licensePlate: "51L-99999" }
    ],
    preferredServices: ["Rửa xe cao cấp", "Đánh bóng", "Bảo dưỡng"],
    hasAccount: false,
  },
  {
    id: 8,
    customerCode: "KH008",
    fullName: "Bùi Thị Hoa",
    email: "buithihoa@gmail.com",
    phone: "0852963741",
    address: "258 Đường Nguyễn Thị Minh Khai, Quận 3, TP.HCM",
    dateOfBirth: "1991-01-25",
    gender: "female",
    customerType: "regular",
    totalOrders: 6,
    totalSpent: 1800000,
    lastVisit: "2024-01-05 14:20:00",
    joinDate: "2023-08-25 09:30:00",
    status: "inactive",
    notes: "Khách hàng không hoạt động, cần liên hệ lại",
    vehicles: [
      { id: 12, brand: "Kia", model: "Sorento", year: 2021, licensePlate: "51M-00000" }
    ],
    preferredServices: ["Rửa xe cơ bản", "Hút bụi"],
    hasAccount: false,
  },
];

// Định nghĩa loại khách hàng
export const customerTypes = [
  { value: "vip", label: "VIP", color: "gold", description: "Khách hàng VIP" },
  { value: "premium", label: "Premium", color: "purple", description: "Khách hàng cao cấp" },
  { value: "regular", label: "Thường", color: "blue", description: "Khách hàng thường xuyên" },
  { value: "new", label: "Mới", color: "green", description: "Khách hàng mới" },
];

// Định nghĩa giới tính
export const genders = [
  { value: "male", label: "Nam", color: "blue" },
  { value: "female", label: "Nữ", color: "pink" },
];

// Định nghĩa trạng thái
export const customerStatuses = [
  { value: "active", label: "Hoạt động", color: "green" },
  { value: "inactive", label: "Không hoạt động", color: "red" },
];

// Định nghĩa dịch vụ ưa thích
export const preferredServices = [
  "Rửa xe cơ bản",
  "Rửa xe nhanh", 
  "Rửa xe cao cấp",
  "Đánh bóng",
  "Bảo dưỡng",
  "Bảo dưỡng định kỳ",
  "Hút bụi nội thất",
  "Chăm sóc nội thất",
  "Combo rửa xe",
  "Dịch vụ tại nhà",
];

// Định nghĩa hãng xe
export const vehicleBrands = [
  "Toyota", "Honda", "Mazda", "BMW", "Mercedes", "Audi", "Lexus", 
  "Porsche", "Volvo", "Hyundai", "Ford", "Kia", "Nissan", "Mitsubishi"
];
