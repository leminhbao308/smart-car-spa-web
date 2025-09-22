export interface CareStep {
  id: number;
  name: string;
  description: string;
  estimatedTime: number; // Thời gian ước tính (phút)
  requiredTools: string[]; // Dụng cụ cần thiết
  requiredMaterials: string[]; // Vật liệu cần thiết
  instructions: string[]; // Hướng dẫn thực hiện
  qualityChecklist: string[]; // Danh sách kiểm tra chất lượng
  safetyNotes: string[]; // Lưu ý an toàn
  isRequired: boolean; // Bước bắt buộc hay không
  order: number; // Thứ tự thực hiện
  category: "inspection" | "cleaning" | "maintenance" | "protection" | "final_check";
}

export interface CareProcess {
  id: number;
  name: string;
  description: string;
  category: "basic" | "premium" | "luxury" | "custom";
  estimatedDuration: number; // Tổng thời gian ước tính (phút)
  steps: CareStep[];
  targetVehicleTypes: string[]; // Loại xe áp dụng
  price: number; // Giá dịch vụ
  isActive: boolean;
  status?: "active" | "inactive" | "discontinued"; // Trạng thái quy trình
  createdAt: string;
  updatedAt: string;
}

export interface VehicleInCare {
  id: number;
  vehicleId: number;
  customerId: number;
  customerName: string;
  vehicleInfo: {
    brand: string;
    model: string;
    year: number;
    licensePlate: string;
    color: string;
    type: string;
  };
  careProcessId: number;
  careProcessName: string;
  startTime: string;
  estimatedEndTime: string;
  actualEndTime?: string;
  status: "in_progress" | "completed" | "paused" | "cancelled";
  currentStepId: number;
  currentStepName: string;
  progress: number; // Phần trăm hoàn thành
  assignedStaff: {
    id: number;
    name: string;
    role: string;
  }[];
  notes: string;
  priority: "low" | "medium" | "high" | "urgent";
}

export interface StepProgress {
  id: number;
  vehicleInCareId: number;
  stepId: number;
  stepName: string;
  status: "pending" | "in_progress" | "completed" | "skipped" | "paused";
  startTime?: string;
  endTime?: string;
  actualDuration?: number; // Thời gian thực tế (phút)
  staffId: number;
  staffName: string;
  rating?: number; // Đánh giá chất lượng (1-5)
  notes?: string;
  qualityChecklist: {
    item: string;
    checked: boolean;
    notes?: string;
  }[];
  mediaFiles: {
    id: number;
    type: "image" | "video";
    url: string;
    description?: string;
    uploadedAt: string;
  }[];
  issues: {
    id: number;
    description: string;
    severity: "low" | "medium" | "high";
    resolved: boolean;
    resolution?: string;
  }[];
}

export const stepCategories = [
  { value: "inspection", label: "Kiểm tra", icon: "🔍", color: "blue" },
  { value: "cleaning", label: "Làm sạch", icon: "🧽", color: "green" },
  { value: "maintenance", label: "Bảo dưỡng", icon: "🔧", color: "orange" },
  { value: "protection", label: "Bảo vệ", icon: "🛡️", color: "purple" },
  { value: "final_check", label: "Kiểm tra cuối", icon: "✅", color: "cyan" },
];

export const processCategories = [
  { value: "basic", label: "Cơ bản", icon: "⭐", color: "green" },
  { value: "premium", label: "Cao cấp", icon: "⭐⭐", color: "blue" },
  { value: "luxury", label: "Luxury", icon: "⭐⭐⭐", color: "purple" },
  { value: "custom", label: "Tùy chỉnh", icon: "🎯", color: "orange" },
];

export const vehicleTypes = [
  "Sedan",
  "SUV",
  "Hatchback",
  "Coupe",
  "Pickup",
  "Van",
  "Tất cả loại xe",
];

export const priorityLevels = [
  { value: "low", label: "Thấp", color: "green" },
  { value: "medium", label: "Trung bình", color: "blue" },
  { value: "high", label: "Cao", color: "orange" },
  { value: "urgent", label: "Khẩn cấp", color: "red" },
];

export const careProcessesData: CareProcess[] = [
  {
    id: 1,
    name: "Chăm sóc cơ bản",
    description: "Quy trình chăm sóc xe cơ bản với các bước làm sạch và kiểm tra",
    category: "basic",
    estimatedDuration: 120,
    price: 200000,
    isActive: true,
    status: "active",
    createdAt: "2024-01-01",
    updatedAt: "2024-06-01",
    targetVehicleTypes: ["Sedan", "Hatchback"],
    steps: [
      {
        id: 1,
        name: "Kiểm tra tổng quan",
        description: "Kiểm tra tình trạng tổng quan của xe",
        estimatedTime: 15,
        requiredTools: ["Đèn pin", "Găng tay"],
        requiredMaterials: ["Khăn lau"],
        instructions: [
          "Kiểm tra ngoại thất xe",
          "Ghi nhận các vết trầy xước",
          "Kiểm tra lốp xe",
          "Kiểm tra đèn xe"
        ],
        qualityChecklist: [
          "Không có vết trầy xước mới",
          "Lốp xe đủ áp suất",
          "Đèn xe hoạt động bình thường"
        ],
        safetyNotes: [
          "Đeo găng tay khi kiểm tra",
          "Cẩn thận với các bộ phận nóng"
        ],
        isRequired: true,
        order: 1,
        category: "inspection"
      },
      {
        id: 2,
        name: "Rửa xe ngoài",
        description: "Rửa sạch ngoại thất xe",
        estimatedTime: 30,
        requiredTools: ["Vòi nước", "Bàn chải", "Khăn lau"],
        requiredMaterials: ["Xà phòng rửa xe", "Nước"],
        instructions: [
          "Xịt nước làm ướt xe",
          "Thoa xà phòng",
          "Chà rửa từ trên xuống",
          "Xả sạch nước",
          "Lau khô xe"
        ],
        qualityChecklist: [
          "Xe sạch hoàn toàn",
          "Không còn bọt xà phòng",
          "Không có vết nước"
        ],
        safetyNotes: [
          "Không rửa xe dưới ánh nắng trực tiếp",
          "Sử dụng nước sạch"
        ],
        isRequired: true,
        order: 2,
        category: "cleaning"
      },
      {
        id: 3,
        name: "Làm sạch nội thất",
        description: "Vệ sinh và làm sạch nội thất xe",
        estimatedTime: 25,
        requiredTools: ["Máy hút bụi", "Khăn lau", "Bàn chải nhỏ"],
        requiredMaterials: ["Chất tẩy rửa nội thất", "Nước"],
        instructions: [
          "Hút bụi ghế và sàn xe",
          "Lau sạch bảng điều khiển",
          "Làm sạch cửa kính",
          "Vệ sinh các khe nhỏ"
        ],
        qualityChecklist: [
          "Nội thất sạch sẽ",
          "Không còn bụi bẩn",
          "Cửa kính trong suốt"
        ],
        safetyNotes: [
          "Tắt động cơ trước khi làm sạch",
          "Không để nước vào các thiết bị điện"
        ],
        isRequired: true,
        order: 3,
        category: "cleaning"
      },
      {
        id: 4,
        name: "Kiểm tra cuối",
        description: "Kiểm tra lại toàn bộ xe sau khi hoàn thành",
        estimatedTime: 10,
        requiredTools: ["Đèn pin"],
        requiredMaterials: [],
        instructions: [
          "Kiểm tra lại ngoại thất",
          "Kiểm tra nội thất",
          "Kiểm tra các thiết bị",
          "Ghi nhận kết quả"
        ],
        qualityChecklist: [
          "Xe sạch sẽ hoàn toàn",
          "Không có thiếu sót",
          "Chất lượng đạt yêu cầu"
        ],
        safetyNotes: [
          "Kiểm tra kỹ lưỡng",
          "Báo cáo ngay nếu có vấn đề"
        ],
        isRequired: true,
        order: 4,
        category: "final_check"
      }
    ]
  },
  {
    id: 2,
    name: "Chăm sóc cao cấp",
    description: "Quy trình chăm sóc xe cao cấp với đầy đủ các bước bảo vệ và chăm sóc",
    category: "premium",
    estimatedDuration: 180,
    price: 350000,
    isActive: true,
    status: "active",
    createdAt: "2024-01-01",
    updatedAt: "2024-06-01",
    targetVehicleTypes: ["Sedan", "SUV", "Hatchback"],
    steps: [
      {
        id: 5,
        name: "Kiểm tra chi tiết",
        description: "Kiểm tra chi tiết tình trạng xe",
        estimatedTime: 20,
        requiredTools: ["Đèn pin", "Găng tay", "Thước đo"],
        requiredMaterials: ["Khăn lau", "Bút ghi chú"],
        instructions: [
          "Kiểm tra ngoại thất chi tiết",
          "Đo độ dày sơn",
          "Kiểm tra các bộ phận cơ khí",
          "Ghi nhận tình trạng chi tiết"
        ],
        qualityChecklist: [
          "Độ dày sơn đạt tiêu chuẩn",
          "Không có hư hỏng cơ khí",
          "Tất cả bộ phận hoạt động tốt"
        ],
        safetyNotes: [
          "Sử dụng thiết bị đo chính xác",
          "Ghi chép đầy đủ thông tin"
        ],
        isRequired: true,
        order: 1,
        category: "inspection"
      },
      {
        id: 6,
        name: "Rửa xe chuyên nghiệp",
        description: "Rửa xe với quy trình chuyên nghiệp",
        estimatedTime: 45,
        requiredTools: ["Máy rửa áp lực", "Bàn chải chuyên dụng", "Khăn microfiber"],
        requiredMaterials: ["Xà phòng cao cấp", "Nước RO", "Chất bảo vệ"],
        instructions: [
          "Rửa xe với máy áp lực",
          "Sử dụng xà phòng cao cấp",
          "Chà rửa kỹ lưỡng",
          "Xả sạch với nước RO",
          "Lau khô với khăn microfiber"
        ],
        qualityChecklist: [
          "Xe sạch hoàn hảo",
          "Không có vết nước",
          "Bề mặt mịn màng"
        ],
        safetyNotes: [
          "Kiểm tra áp lực nước",
          "Không rửa quá gần bề mặt"
        ],
        isRequired: true,
        order: 2,
        category: "cleaning"
      },
      {
        id: 7,
        name: "Đánh bóng sơn",
        description: "Đánh bóng và bảo vệ lớp sơn xe",
        estimatedTime: 30,
        requiredTools: ["Máy đánh bóng", "Khăn đánh bóng"],
        requiredMaterials: ["Sáp đánh bóng", "Chất bảo vệ sơn"],
        instructions: [
          "Làm sạch bề mặt sơn",
          "Thoa sáp đánh bóng",
          "Đánh bóng với máy",
          "Lau sạch và kiểm tra"
        ],
        qualityChecklist: [
          "Sơn bóng đẹp",
          "Không có vết xước",
          "Bề mặt mịn màng"
        ],
        safetyNotes: [
          "Sử dụng máy đánh bóng đúng cách",
          "Không đánh bóng quá mạnh"
        ],
        isRequired: true,
        order: 3,
        category: "protection"
      },
      {
        id: 8,
        name: "Chăm sóc nội thất cao cấp",
        description: "Chăm sóc nội thất với sản phẩm cao cấp",
        estimatedTime: 35,
        requiredTools: ["Máy hút bụi chuyên dụng", "Khăn microfiber", "Bàn chải nhỏ"],
        requiredMaterials: ["Chất tẩy rửa cao cấp", "Chất bảo vệ da", "Nước RO"],
        instructions: [
          "Hút bụi kỹ lưỡng",
          "Làm sạch với chất tẩy cao cấp",
          "Bảo vệ da ghế",
          "Làm sạch cửa kính",
          "Vệ sinh các chi tiết nhỏ"
        ],
        qualityChecklist: [
          "Nội thất sạch hoàn hảo",
          "Da ghế được bảo vệ",
          "Cửa kính trong suốt"
        ],
        safetyNotes: [
          "Sử dụng sản phẩm phù hợp với từng loại vật liệu",
          "Không để nước vào thiết bị điện"
        ],
        isRequired: true,
        order: 4,
        category: "cleaning"
      },
      {
        id: 9,
        name: "Kiểm tra chất lượng",
        description: "Kiểm tra chất lượng toàn diện",
        estimatedTime: 15,
        requiredTools: ["Đèn pin", "Thước đo"],
        requiredMaterials: [],
        instructions: [
          "Kiểm tra toàn bộ ngoại thất",
          "Kiểm tra nội thất",
          "Kiểm tra các thiết bị",
          "Đánh giá chất lượng tổng thể"
        ],
        qualityChecklist: [
          "Chất lượng đạt tiêu chuẩn cao cấp",
          "Không có thiếu sót",
          "Xe sẵn sàng giao khách"
        ],
        safetyNotes: [
          "Kiểm tra kỹ lưỡng từng chi tiết",
          "Báo cáo ngay nếu có vấn đề"
        ],
        isRequired: true,
        order: 5,
        category: "final_check"
      }
    ]
  }
];

export const vehiclesInCareData: VehicleInCare[] = [
  {
    id: 1,
    vehicleId: 101,
    customerId: 201,
    customerName: "Nguyễn Văn A",
    vehicleInfo: {
      brand: "Toyota",
      model: "Camry",
      year: 2022,
      licensePlate: "30A-12345",
      color: "Trắng",
      type: "Sedan"
    },
    careProcessId: 1,
    careProcessName: "Chăm sóc cơ bản",
    startTime: "2024-06-20T08:00:00",
    estimatedEndTime: "2024-06-20T10:00:00",
    status: "in_progress",
    currentStepId: 2,
    currentStepName: "Rửa xe ngoài",
    progress: 35,
    assignedStaff: [
      { id: 1, name: "Trần Văn B", role: "Kỹ thuật viên" },
      { id: 2, name: "Lê Thị C", role: "Nhân viên hỗ trợ" }
    ],
    notes: "Khách hàng yêu cầu chăm sóc kỹ lưỡng",
    priority: "medium"
  },
  {
    id: 2,
    vehicleId: 102,
    customerId: 202,
    customerName: "Phạm Thị D",
    vehicleInfo: {
      brand: "Honda",
      model: "CR-V",
      year: 2021,
      licensePlate: "29B-67890",
      color: "Đen",
      type: "SUV"
    },
    careProcessId: 2,
    careProcessName: "Chăm sóc cao cấp",
    startTime: "2024-06-20T09:30:00",
    estimatedEndTime: "2024-06-20T12:30:00",
    status: "in_progress",
    currentStepId: 6,
    currentStepName: "Rửa xe chuyên nghiệp",
    progress: 25,
    assignedStaff: [
      { id: 3, name: "Võ Văn E", role: "Kỹ thuật viên cao cấp" }
    ],
    notes: "Xe có nhiều vết bẩn, cần chăm sóc đặc biệt",
    priority: "high"
  },
  {
    id: 3,
    vehicleId: 103,
    customerId: 203,
    customerName: "Hoàng Văn F",
    vehicleInfo: {
      brand: "Mazda",
      model: "CX-5",
      year: 2023,
      licensePlate: "51G-11111",
      color: "Xám",
      type: "SUV"
    },
    careProcessId: 1,
    careProcessName: "Chăm sóc cơ bản",
    startTime: "2024-06-20T10:00:00",
    estimatedEndTime: "2024-06-20T12:00:00",
    status: "completed",
    actualEndTime: "2024-06-20T11:45:00",
    currentStepId: 4,
    currentStepName: "Kiểm tra cuối",
    progress: 100,
    assignedStaff: [
      { id: 4, name: "Nguyễn Thị G", role: "Kỹ thuật viên" }
    ],
    notes: "Hoàn thành đúng hạn, chất lượng tốt",
    priority: "low"
  },
  {
    id: 4,
    vehicleId: 104,
    customerId: 204,
    customerName: "Lê Văn H",
    vehicleInfo: {
      brand: "BMW",
      model: "X3",
      year: 2022,
      licensePlate: "30H-22222",
      color: "Xanh dương",
      type: "SUV"
    },
    careProcessId: 2,
    careProcessName: "Chăm sóc cao cấp",
    startTime: "2024-06-20T14:00:00",
    estimatedEndTime: "2024-06-20T17:00:00",
    status: "in_progress",
    currentStepId: 8,
    currentStepName: "Đánh bóng sơn",
    progress: 40,
    assignedStaff: [
      { id: 5, name: "Phạm Văn I", role: "Kỹ thuật viên cao cấp" },
      { id: 6, name: "Trần Thị J", role: "Nhân viên hỗ trợ" }
    ],
    notes: "Xe BMW cần chăm sóc đặc biệt, khách hàng VIP",
    priority: "high"
  }
];

export const stepProgressData: StepProgress[] = [
  {
    id: 1,
    vehicleInCareId: 1,
    stepId: 1,
    stepName: "Kiểm tra tổng quan",
    status: "completed",
    startTime: "2024-06-20T08:00:00",
    endTime: "2024-06-20T08:15:00",
    actualDuration: 15,
    staffId: 1,
    staffName: "Trần Văn B",
    rating: 5,
    notes: "Xe trong tình trạng tốt, không có vết trầy xước mới",
    qualityChecklist: [
      { item: "Không có vết trầy xước mới", checked: true, notes: "Tốt" },
      { item: "Lốp xe đủ áp suất", checked: true, notes: "Áp suất 2.5 bar" },
      { item: "Đèn xe hoạt động bình thường", checked: true, notes: "Tất cả đèn OK" }
    ],
    mediaFiles: [
      {
        id: 1,
        type: "image",
        url: "/images/inspection-1.jpg",
        description: "Hình ảnh kiểm tra ngoại thất",
        uploadedAt: "2024-06-20T08:10:00"
      }
    ],
    issues: []
  },
  {
    id: 2,
    vehicleInCareId: 1,
    stepId: 2,
    stepName: "Rửa xe ngoài",
    status: "in_progress",
    startTime: "2024-06-20T08:15:00",
    staffId: 1,
    staffName: "Trần Văn B",
    qualityChecklist: [
      { item: "Xe sạch hoàn toàn", checked: false },
      { item: "Không còn bọt xà phòng", checked: false },
      { item: "Không có vết nước", checked: false }
    ],
    mediaFiles: [],
    issues: []
  },
  {
    id: 3,
    vehicleInCareId: 2,
    stepId: 5,
    stepName: "Kiểm tra chi tiết",
    status: "completed",
    startTime: "2024-06-20T09:30:00",
    endTime: "2024-06-20T09:50:00",
    actualDuration: 20,
    staffId: 3,
    staffName: "Võ Văn E",
    rating: 4,
    notes: "Xe có một số vết trầy nhỏ, cần chú ý khi rửa",
    qualityChecklist: [
      { item: "Độ dày sơn đạt tiêu chuẩn", checked: true, notes: "120-150μm" },
      { item: "Không có hư hỏng cơ khí", checked: true, notes: "Tốt" },
      { item: "Tất cả bộ phận hoạt động tốt", checked: true, notes: "OK" }
    ],
    mediaFiles: [
      {
        id: 2,
        type: "image",
        url: "/images/inspection-2.jpg",
        description: "Hình ảnh kiểm tra chi tiết",
        uploadedAt: "2024-06-20T09:45:00"
      }
    ],
    issues: [
      {
        id: 1,
        description: "Vết trầy nhỏ ở cánh cửa trái",
        severity: "low",
        resolved: false
      }
    ]
  },
  // Dữ liệu cho xe BMW X3 (ID: 4) - 5 bước
  {
    id: 4,
    vehicleInCareId: 4,
    stepId: 5,
    stepName: "Kiểm tra chi tiết",
    status: "completed",
    startTime: "2024-06-20T14:00:00",
    endTime: "2024-06-20T14:20:00",
    actualDuration: 20,
    staffId: 5,
    staffName: "Phạm Văn I",
    rating: 5,
    notes: "Xe BMW trong tình trạng tốt, sơn còn mới",
    qualityChecklist: [
      { item: "Độ dày sơn đạt tiêu chuẩn", checked: true, notes: "140μm" },
      { item: "Không có hư hỏng cơ khí", checked: true, notes: "Tốt" },
      { item: "Tất cả bộ phận hoạt động tốt", checked: true, notes: "OK" }
    ],
    mediaFiles: [
      {
        id: 3,
        type: "image",
        url: "/images/bmw-inspection-1.jpg",
        description: "Kiểm tra tổng quan BMW",
        uploadedAt: "2024-06-20T14:15:00"
      }
    ],
    issues: []
  },
  {
    id: 5,
    vehicleInCareId: 4,
    stepId: 6,
    stepName: "Rửa xe chuyên nghiệp",
    status: "completed",
    startTime: "2024-06-20T14:20:00",
    endTime: "2024-06-20T14:50:00",
    actualDuration: 30,
    staffId: 5,
    staffName: "Phạm Văn I",
    rating: 5,
    notes: "Rửa xe kỹ lưỡng, sử dụng sản phẩm cao cấp",
    qualityChecklist: [
      { item: "Xe sạch hoàn toàn", checked: true, notes: "Tốt" },
      { item: "Không còn bọt xà phòng", checked: true, notes: "OK" },
      { item: "Không có vết nước", checked: true, notes: "Tốt" }
    ],
    mediaFiles: [
      {
        id: 4,
        type: "image",
        url: "/images/bmw-wash-1.jpg",
        description: "Quá trình rửa xe",
        uploadedAt: "2024-06-20T14:45:00"
      }
    ],
    issues: []
  },
  {
    id: 6,
    vehicleInCareId: 4,
    stepId: 7,
    stepName: "Làm sạch nội thất",
    status: "in_progress",
    startTime: "2024-06-20T14:50:00",
    staffId: 6,
    staffName: "Trần Thị J",
    notes: "Đang làm sạch nội thất da cao cấp",
    qualityChecklist: [
      { item: "Ghế da sạch hoàn toàn", checked: false },
      { item: "Bảng điều khiển sạch", checked: false },
      { item: "Sàn xe sạch", checked: false }
    ],
    mediaFiles: [],
    issues: []
  },
  {
    id: 7,
    vehicleInCareId: 4,
    stepId: 8,
    stepName: "Đánh bóng sơn",
    status: "pending",
    staffId: 5,
    staffName: "Phạm Văn I",
    qualityChecklist: [
      { item: "Sơn bóng đều", checked: false },
      { item: "Không có vết xước", checked: false },
      { item: "Độ bóng đạt tiêu chuẩn", checked: false }
    ],
    mediaFiles: [],
    issues: []
  },
  {
    id: 8,
    vehicleInCareId: 4,
    stepId: 9,
    stepName: "Kiểm tra cuối và bàn giao",
    status: "pending",
    staffId: 5,
    staffName: "Phạm Văn I",
    qualityChecklist: [
      { item: "Tất cả bước hoàn thành", checked: false },
      { item: "Chất lượng đạt yêu cầu", checked: false },
      { item: "Xe sẵn sàng bàn giao", checked: false }
    ],
    mediaFiles: [],
    issues: []
  }
];
