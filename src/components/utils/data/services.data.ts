// Mock data cho dịch vụ
export const servicesData = [
  {
    id: 1,
    serviceCode: "SV001",
    serviceName: "Rửa xe ngoài cơ bản",
    serviceTypeId: 1,
    serviceTypeName: "Làm sạch",
    description: "Dịch vụ rửa xe ngoài cơ bản với nước và xà phòng",
    // Cấu trúc mới: products + labor cost
    products: [
      {
        productId: 1,
        productCode: "SP001",
        productName: "Shampoo rửa xe cao cấp",
        quantity: 0.1, // 0.1 lít
        unitPrice: 250000,
        totalPrice: 25000
      }
    ],
    laborCost: 25000, // Tiền công
    totalPrice: 50000, // Tổng giá = products + labor cost
    duration: 30,
    status: "active",
    features: [
      "Rửa ngoài xe",
      "Lau khô",
      "Kiểm tra cơ bản"
    ],
    requirements: [
      "Xe không quá bẩn",
      "Thời gian rảnh 30 phút"
    ],
    notes: "Dịch vụ cơ bản phù hợp cho xe hàng ngày",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
  },
  {
    id: 2,
    serviceCode: "SV002",
    serviceName: "Rửa xe ngoài cao cấp",
    serviceTypeId: 1,
    serviceTypeName: "Làm sạch",
    description: "Dịch vụ rửa xe ngoài cao cấp với sản phẩm chuyên dụng",
    products: [
      {
        productId: 1,
        productCode: "SP001",
        productName: "Shampoo rửa xe cao cấp",
        quantity: 0.2,
        unitPrice: 250000,
        totalPrice: 50000
      },
      {
        productId: 2,
        productCode: "SP002",
        productName: "Wax đánh bóng xe",
        quantity: 0.1,
        unitPrice: 180000,
        totalPrice: 18000
      }
    ],
    laborCost: 32000,
    totalPrice: 100000,
    duration: 60,
    status: "active",
    features: [
      "Rửa ngoài xe",
      "Đánh bóng",
      "Phủ sáp bảo vệ",
      "Lau khô chuyên nghiệp"
    ],
    requirements: [
      "Xe cần làm sạch kỹ",
      "Thời gian rảnh 1 giờ"
    ],
    notes: "Dịch vụ cao cấp cho xe sang trọng",
    createdAt: "2024-01-16",
    updatedAt: "2024-01-21",
  },
  {
    id: 3,
    serviceCode: "SV003",
    serviceName: "Làm sạch nội thất",
    serviceTypeId: 1,
    serviceTypeName: "Làm sạch",
    description: "Dịch vụ làm sạch và vệ sinh nội thất xe",
    products: [
      {
        productId: 3,
        productCode: "SP003",
        productName: "Chất bảo vệ da nội thất",
        quantity: 0.05,
        unitPrice: 320000,
        totalPrice: 16000
      },
      {
        productId: 10,
        productCode: "SP010",
        productName: "Nước hoa xe cao cấp",
        quantity: 0.1,
        unitPrice: 95000,
        totalPrice: 9500
      }
    ],
    laborCost: 54500,
    totalPrice: 80000,
    duration: 45,
    status: "active",
    features: [
      "Hút bụi nội thất",
      "Làm sạch ghế",
      "Vệ sinh bảng điều khiển",
      "Khử mùi"
    ],
    requirements: [
      "Xe cần vệ sinh nội thất",
      "Thời gian rảnh 45 phút"
    ],
    notes: "Dịch vụ chuyên nghiệp cho nội thất",
    createdAt: "2024-01-17",
    updatedAt: "2024-01-22",
  },
  {
    id: 4,
    serviceCode: "SV004",
    serviceName: "Thay dầu nhớt",
    serviceTypeId: 2,
    serviceTypeName: "Bảo dưỡng",
    description: "Dịch vụ thay dầu nhớt động cơ",
    products: [
      {
        productId: 4,
        productCode: "SP004",
        productName: "Dầu động cơ 5W-30",
        quantity: 0.1,
        unitPrice: 450000,
        totalPrice: 45000
      }
    ],
    laborCost: 155000,
    totalPrice: 200000,
    duration: 30,
    status: "active",
    features: [
      "Thay dầu nhớt",
      "Thay lọc dầu",
      "Kiểm tra mức dầu",
      "Kiểm tra rò rỉ"
    ],
    requirements: [
      "Xe cần thay dầu định kỳ",
      "Thời gian rảnh 30 phút"
    ],
    notes: "Dịch vụ bảo dưỡng cơ bản",
    createdAt: "2024-01-18",
    updatedAt: "2024-01-23",
  },
  {
    id: 5,
    serviceCode: "SV005",
    serviceName: "Bảo dưỡng định kỳ",
    serviceTypeId: 2,
    serviceTypeName: "Bảo dưỡng",
    description: "Dịch vụ bảo dưỡng định kỳ toàn diện",
    products: [
      {
        productId: 4,
        productCode: "SP004",
        productName: "Dầu động cơ 5W-30",
        quantity: 0.2,
        unitPrice: 450000,
        totalPrice: 90000
      },
      {
        productId: 12,
        productCode: "SP012",
        productName: "Phụ gia nhiên liệu",
        quantity: 0.1,
        unitPrice: 120000,
        totalPrice: 12000
      }
    ],
    laborCost: 398000,
    totalPrice: 500000,
    duration: 120,
    status: "active",
    features: [
      "Kiểm tra toàn bộ hệ thống",
      "Thay dầu nhớt",
      "Kiểm tra phanh",
      "Kiểm tra lốp",
      "Kiểm tra ắc quy"
    ],
    requirements: [
      "Xe cần bảo dưỡng định kỳ",
      "Thời gian rảnh 2 giờ"
    ],
    notes: "Dịch vụ bảo dưỡng toàn diện",
    createdAt: "2024-01-19",
    updatedAt: "2024-01-24",
  },
  {
    id: 6,
    serviceCode: "SV006",
    serviceName: "Dán phim cách nhiệt",
    serviceTypeId: 3,
    serviceTypeName: "Làm đẹp",
    description: "Dịch vụ dán phim cách nhiệt cho xe",
    products: [
      {
        productId: 5,
        productCode: "SP005",
        productName: "Đèn LED trang trí nội thất",
        quantity: 1,
        unitPrice: 180000,
        totalPrice: 180000
      }
    ],
    laborCost: 620000,
    totalPrice: 800000,
    duration: 180,
    status: "active",
    features: [
      "Dán phim cách nhiệt",
      "Cắt phim chính xác",
      "Bảo hành 2 năm",
      "Tư vấn loại phim phù hợp"
    ],
    requirements: [
      "Xe cần dán phim cách nhiệt",
      "Thời gian rảnh 3 giờ"
    ],
    notes: "Dịch vụ chuyên nghiệp với bảo hành",
    createdAt: "2024-01-20",
    updatedAt: "2024-01-25",
  },
  {
    id: 7,
    serviceCode: "SV007",
    serviceName: "Kiểm định an toàn",
    serviceTypeId: 4,
    serviceTypeName: "Kiểm định",
    description: "Dịch vụ kiểm định an toàn xe",
    products: [],
    laborCost: 300000,
    totalPrice: 300000,
    duration: 60,
    status: "active",
    features: [
      "Kiểm tra hệ thống phanh",
      "Kiểm tra hệ thống lái",
      "Kiểm tra đèn",
      "Kiểm tra lốp",
      "Cấp giấy chứng nhận"
    ],
    requirements: [
      "Xe cần kiểm định",
      "Thời gian rảnh 1 giờ"
    ],
    notes: "Dịch vụ kiểm định chính thức",
    createdAt: "2024-01-21",
    updatedAt: "2024-01-26",
  },
  {
    id: 8,
    serviceCode: "SV008",
    serviceName: "Cứu hộ 24/7",
    serviceTypeId: 5,
    serviceTypeName: "Cứu hộ",
    description: "Dịch vụ cứu hộ khẩn cấp 24/7",
    products: [],
    laborCost: 200000,
    totalPrice: 200000,
    duration: 30,
    status: "active",
    features: [
      "Cứu hộ 24/7",
      "Thay lốp dự phòng",
      "Sạc ắc quy",
      "Kéo xe",
      "Hỗ trợ khẩn cấp"
    ],
    requirements: [
      "Xe gặp sự cố",
      "Liên hệ khẩn cấp"
    ],
    notes: "Dịch vụ cứu hộ khẩn cấp",
    createdAt: "2024-01-22",
    updatedAt: "2024-01-27",
  },
  {
    id: 9,
    serviceCode: "SV009",
    serviceName: "Dịch vụ VIP",
    serviceTypeId: 6,
    serviceTypeName: "Cao cấp",
    description: "Dịch vụ VIP với chăm sóc cá nhân",
    products: [
      {
        productId: 8,
        productCode: "SP008",
        productName: "Sản phẩm chăm sóc xe luxury",
        quantity: 0.1,
        unitPrice: 2500000,
        totalPrice: 250000
      },
      {
        productId: 2,
        productCode: "SP002",
        productName: "Wax đánh bóng xe",
        quantity: 0.2,
        unitPrice: 180000,
        totalPrice: 36000
      }
    ],
    laborCost: 714000,
    totalPrice: 1000000,
    duration: 240,
    status: "active",
    features: [
      "Chăm sóc cá nhân",
      "Bảo dưỡng chuyên sâu",
      "Tư vấn chuyên nghiệp",
      "Dịch vụ tại nhà",
      "Bảo hành cao cấp"
    ],
    requirements: [
      "Khách hàng VIP",
      "Thời gian rảnh 4 giờ"
    ],
    notes: "Dịch vụ cao cấp cho khách hàng VIP",
    createdAt: "2024-01-23",
    updatedAt: "2024-01-28",
  },
  {
    id: 10,
    serviceCode: "SV010",
    serviceName: "Tư vấn kỹ thuật",
    serviceTypeId: 7,
    serviceTypeName: "Tư vấn",
    description: "Dịch vụ tư vấn kỹ thuật chuyên nghiệp",
    products: [],
    laborCost: 100000,
    totalPrice: 100000,
    duration: 60,
    status: "suspended",
    features: [
      "Tư vấn kỹ thuật",
      "Hỗ trợ khách hàng",
      "Tư vấn bảo hiểm",
      "Hướng dẫn sử dụng"
    ],
    requirements: [
      "Khách hàng cần tư vấn",
      "Thời gian rảnh 1 giờ"
    ],
    notes: "Dịch vụ tư vấn chuyên nghiệp",
    createdAt: "2024-01-24",
    updatedAt: "2024-01-29",
  },
];

// Định nghĩa trạng thái dịch vụ
export const serviceStatuses = [
  { value: "active", label: "Hoạt động", color: "green" },
  { value: "inactive", label: "Không hoạt động", color: "red" },
  { value: "suspended", label: "Tạm ngừng", color: "volcano" },
  { value: "archived", label: "Lưu trữ", color: "gray" },
];
