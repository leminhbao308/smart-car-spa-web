export interface CareSlot {
  id: number;
  name: string;
  type: "basic" | "premium" | "vip";
  status: "available" | "occupied" | "maintenance";
  currentVehicle?: string;
  estimatedCompletion?: string;
}

export interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  manager: string;
  status: "active" | "inactive" | "maintenance";
  openingHours: {
    weekdays: string;
    weekends: string;
  };
  services: string[];
  capacity: number;
  currentBookings: number;
  establishedDate: string;
  description: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  images?: string[];
  facilities: string[];
  certifications: string[];
  careSlots: CareSlot[];
  totalSlots: number;
  availableSlots: number;
}

export const branchStatuses = [
  { value: "active", label: "Hoạt động", color: "green" },
  { value: "inactive", label: "Ngừng hoạt động", color: "red" },
  { value: "maintenance", label: "Bảo trì", color: "orange" },
];

export const branchServices = [
  "Rửa xe chuyên nghiệp",
  "Đánh bóng và phủ ceramic",
  "Bảo dưỡng định kỳ",
  "Sửa chữa và thay thế phụ tùng",
  "Kiểm tra hệ thống điện",
  "Thay dầu và lọc",
  "Kiểm tra phanh",
  "Cân bằng lốp",
  "Sửa chữa điều hòa",
  "Kiểm tra khí thải",
];

export const branchFacilities = [
  "Bãi đỗ xe rộng rãi",
  "Khu chờ khách hàng",
  "WiFi miễn phí",
  "Cà phê và nước uống",
  "Khu vui chơi trẻ em",
  "Phòng tắm",
  "Khu vực hút thuốc",
  "Bãi rửa xe tự động",
  "Khu sửa chữa chuyên nghiệp",
  "Khu bảo dưỡng",
];

export const branchCertifications = [
  "ISO 9001:2015",
  "Chứng nhận chất lượng dịch vụ",
  "Giấy phép kinh doanh",
  "Chứng nhận môi trường",
  "Chứng nhận an toàn lao động",
  "Chứng nhận bảo hiểm",
];

export const branchesData: Branch[] = [
  {
    id: 1,
    name: "Chi nhánh Quận 1",
    address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    phone: "028 3822 1234",
    email: "q1@smartcarspa.com",
    manager: "Nguyễn Văn A",
    status: "active",
    openingHours: {
      weekdays: "07:00 - 20:00",
      weekends: "08:00 - 18:00",
    },
    services: [
      "Rửa xe chuyên nghiệp",
      "Đánh bóng và phủ ceramic",
      "Bảo dưỡng định kỳ",
      "Sửa chữa và thay thế phụ tùng",
    ],
    capacity: 50,
    currentBookings: 35,
    establishedDate: "2020-01-15",
    description: "Chi nhánh chính tại trung tâm thành phố, phục vụ đầy đủ các dịch vụ chăm sóc xe hơi cao cấp.",
    coordinates: {
      lat: 10.7769,
      lng: 106.7009,
    },
    facilities: [
      "Bãi đỗ xe rộng rãi",
      "Khu chờ khách hàng",
      "WiFi miễn phí",
      "Cà phê và nước uống",
      "Khu vui chơi trẻ em",
    ],
    certifications: [
      "ISO 9001:2015",
      "Chứng nhận chất lượng dịch vụ",
      "Giấy phép kinh doanh",
    ],
    careSlots: [
      { id: 1, name: "Slot A1", type: "basic", status: "occupied", currentVehicle: "30A-12345", estimatedCompletion: "14:30" },
      { id: 2, name: "Slot A2", type: "basic", status: "available" },
      { id: 3, name: "Slot A3", type: "basic", status: "occupied", currentVehicle: "51G-67890", estimatedCompletion: "15:00" },
      { id: 4, name: "Slot B1", type: "premium", status: "available" },
      { id: 5, name: "Slot B2", type: "premium", status: "occupied", currentVehicle: "29A-11111", estimatedCompletion: "16:00" },
      { id: 6, name: "Slot C1", type: "vip", status: "available" },
      { id: 7, name: "Slot C2", type: "vip", status: "maintenance" },
    ],
    totalSlots: 7,
    availableSlots: 3,
  },
  {
    id: 2,
    name: "Chi nhánh Quận 7",
    address: "456 Nguyễn Thị Thập, Quận 7, TP.HCM",
    phone: "028 3872 5678",
    email: "q7@smartcarspa.com",
    manager: "Trần Thị B",
    status: "active",
    openingHours: {
      weekdays: "07:30 - 19:30",
      weekends: "08:30 - 17:30",
    },
    services: [
      "Rửa xe chuyên nghiệp",
      "Bảo dưỡng định kỳ",
      "Kiểm tra hệ thống điện",
      "Thay dầu và lọc",
    ],
    capacity: 30,
    currentBookings: 22,
    establishedDate: "2021-03-20",
    description: "Chi nhánh mới tại khu vực phát triển, tập trung vào dịch vụ bảo dưỡng và sửa chữa.",
    coordinates: {
      lat: 10.7374,
      lng: 106.7223,
    },
    facilities: [
      "Bãi đỗ xe rộng rãi",
      "Khu chờ khách hàng",
      "WiFi miễn phí",
      "Khu sửa chữa chuyên nghiệp",
    ],
    certifications: [
      "Chứng nhận chất lượng dịch vụ",
      "Giấy phép kinh doanh",
      "Chứng nhận môi trường",
    ],
    careSlots: [
      { id: 8, name: "Slot A1", type: "basic", status: "available" },
      { id: 9, name: "Slot A2", type: "basic", status: "occupied", currentVehicle: "43A-22222", estimatedCompletion: "15:30" },
      { id: 10, name: "Slot A3", type: "basic", status: "available" },
      { id: 11, name: "Slot B1", type: "premium", status: "occupied", currentVehicle: "50H-33333", estimatedCompletion: "16:15" },
      { id: 12, name: "Slot B2", type: "premium", status: "available" },
    ],
    totalSlots: 5,
    availableSlots: 3,
  },
  {
    id: 3,
    name: "Chi nhánh Quận 2",
    address: "789 Đường Thủ Thiêm, Quận 2, TP.HCM",
    phone: "028 3890 9012",
    email: "q2@smartcarspa.com",
    manager: "Lê Văn C",
    status: "maintenance",
    openingHours: {
      weekdays: "08:00 - 18:00",
      weekends: "09:00 - 17:00",
    },
    services: [
      "Rửa xe chuyên nghiệp",
      "Đánh bóng và phủ ceramic",
      "Kiểm tra phanh",
      "Cân bằng lốp",
    ],
    capacity: 25,
    currentBookings: 0,
    establishedDate: "2022-06-10",
    description: "Chi nhánh đang trong quá trình bảo trì và nâng cấp hệ thống.",
    coordinates: {
      lat: 10.7872,
      lng: 106.7498,
    },
    facilities: [
      "Bãi đỗ xe rộng rãi",
      "Khu chờ khách hàng",
      "Bãi rửa xe tự động",
    ],
    certifications: [
      "Giấy phép kinh doanh",
      "Chứng nhận an toàn lao động",
    ],
    careSlots: [
      { id: 13, name: "Slot A1", type: "basic", status: "maintenance" },
      { id: 14, name: "Slot A2", type: "basic", status: "maintenance" },
      { id: 15, name: "Slot B1", type: "premium", status: "maintenance" },
    ],
    totalSlots: 3,
    availableSlots: 0,
  },
  {
    id: 4,
    name: "Chi nhánh Quận 10",
    address: "321 Lý Thái Tổ, Quận 10, TP.HCM",
    phone: "028 3865 3456",
    email: "q10@smartcarspa.com",
    manager: "Phạm Thị D",
    status: "inactive",
    openingHours: {
      weekdays: "07:00 - 20:00",
      weekends: "08:00 - 18:00",
    },
    services: [
      "Rửa xe chuyên nghiệp",
      "Bảo dưỡng định kỳ",
      "Sửa chữa điều hòa",
      "Kiểm tra khí thải",
    ],
    capacity: 40,
    currentBookings: 0,
    establishedDate: "2019-11-05",
    description: "Chi nhánh tạm thời ngừng hoạt động để cải tạo và mở rộng.",
    coordinates: {
      lat: 10.7720,
      lng: 106.6579,
    },
    facilities: [
      "Bãi đỗ xe rộng rãi",
      "Khu chờ khách hàng",
      "WiFi miễn phí",
      "Khu bảo dưỡng",
    ],
    certifications: [
      "ISO 9001:2015",
      "Giấy phép kinh doanh",
      "Chứng nhận bảo hiểm",
    ],
    careSlots: [],
    totalSlots: 0,
    availableSlots: 0,
  },
  {
    id: 5,
    name: "Chi nhánh Quận Bình Thạnh",
    address: "654 Xô Viết Nghệ Tĩnh, Quận Bình Thạnh, TP.HCM",
    phone: "028 3841 7890",
    email: "bt@smartcarspa.com",
    manager: "Võ Văn E",
    status: "active",
    openingHours: {
      weekdays: "07:00 - 20:00",
      weekends: "08:00 - 18:00",
    },
    services: [
      "Rửa xe chuyên nghiệp",
      "Đánh bóng và phủ ceramic",
      "Bảo dưỡng định kỳ",
      "Sửa chữa và thay thế phụ tùng",
      "Kiểm tra hệ thống điện",
      "Thay dầu và lọc",
    ],
    capacity: 45,
    currentBookings: 28,
    establishedDate: "2020-09-12",
    description: "Chi nhánh lớn với đầy đủ dịch vụ và tiện ích hiện đại.",
    coordinates: {
      lat: 10.8106,
      lng: 106.7091,
    },
    facilities: [
      "Bãi đỗ xe rộng rãi",
      "Khu chờ khách hàng",
      "WiFi miễn phí",
      "Cà phê và nước uống",
      "Khu vui chơi trẻ em",
      "Phòng tắm",
      "Khu sửa chữa chuyên nghiệp",
      "Khu bảo dưỡng",
    ],
    certifications: [
      "ISO 9001:2015",
      "Chứng nhận chất lượng dịch vụ",
      "Giấy phép kinh doanh",
      "Chứng nhận môi trường",
      "Chứng nhận an toàn lao động",
    ],
    careSlots: [
      { id: 16, name: "Slot A1", type: "basic", status: "available" },
      { id: 17, name: "Slot A2", type: "basic", status: "occupied", currentVehicle: "59A-44444", estimatedCompletion: "14:45" },
      { id: 18, name: "Slot A3", type: "basic", status: "available" },
      { id: 19, name: "Slot A4", type: "basic", status: "occupied", currentVehicle: "30B-55555", estimatedCompletion: "15:30" },
      { id: 20, name: "Slot B1", type: "premium", status: "available" },
      { id: 21, name: "Slot B2", type: "premium", status: "occupied", currentVehicle: "51C-66666", estimatedCompletion: "16:00" },
      { id: 22, name: "Slot B3", type: "premium", status: "available" },
      { id: 23, name: "Slot C1", type: "vip", status: "occupied", currentVehicle: "29D-77777", estimatedCompletion: "17:00" },
      { id: 24, name: "Slot C2", type: "vip", status: "available" },
    ],
    totalSlots: 9,
    availableSlots: 5,
  },
];
