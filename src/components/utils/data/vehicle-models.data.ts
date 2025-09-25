// Mock data cho model xe
export const vehicleModelsData = [
  {
    id: 1,
    modelCode: "CAMRY_2024",
    modelName: "Camry 2024",
    brandId: 1,
    brandName: "Toyota",
    typeId: 1,
    typeName: "Sedan",
    year: 2024,
    fuelType: "hybrid",
    engineSize: "2.5L",
    horsepower: 203,
    torque: 184,
    transmission: "CVT",
    drivetrain: "FWD",
    price: 1200000000,
    status: "active",
    description: "Sedan hạng trung với công nghệ hybrid tiên tiến",
    features: [
      "Toyota Safety Sense 2.5+",
      "Apple CarPlay/Android Auto",
      "Wireless Charging",
      "Premium Audio System",
      "Leather Seats"
    ],
    specifications: {
      length: 4885,
      width: 1840,
      height: 1445,
      wheelbase: 2825,
      curbWeight: 1570,
      fuelCapacity: 50,
      cargoVolume: 524
    },
    safety: {
      ncapRating: 5,
      airbags: 10,
      abs: true,
      esp: true,
      laneAssist: true,
      adaptiveCruise: true
    },
    performance: {
      acceleration: 8.1,
      topSpeed: 180,
      fuelEconomy: 5.1,
      co2Emissions: 118
    },
    averageRating: 4.5,
    totalReviews: 156,
    totalVehicles: 45,
    image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800",
    gallery: [
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800",
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800",
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800"
    ],
    createdAt: "2024-01-01 00:00:00",
    updatedAt: "2024-01-15 10:30:00",
  },
  {
    id: 2,
    modelCode: "CIVIC_2024",
    modelName: "Civic 2024",
    brandId: 2,
    brandName: "Honda",
    typeId: 1,
    typeName: "Sedan",
    year: 2024,
    fuelType: "gasoline",
    engineSize: "1.5L Turbo",
    horsepower: 180,
    torque: 240,
    transmission: "CVT",
    drivetrain: "FWD",
    price: 850000000,
    status: "active",
    description: "Sedan compact với động cơ turbo hiệu suất cao",
    features: [
      "Honda Sensing",
      "Apple CarPlay/Android Auto",
      "Wireless Charging",
      "HondaLink",
      "Remote Engine Start"
    ],
    specifications: {
      length: 4674,
      width: 1802,
      height: 1415,
      wheelbase: 2735,
      curbWeight: 1320,
      fuelCapacity: 46,
      cargoVolume: 428
    },
    safety: {
      ncapRating: 5,
      airbags: 8,
      abs: true,
      esp: true,
      laneAssist: true,
      adaptiveCruise: true
    },
    performance: {
      acceleration: 7.8,
      topSpeed: 200,
      fuelEconomy: 6.2,
      co2Emissions: 142
    },
    averageRating: 4.4,
    totalReviews: 203,
    totalVehicles: 38,
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800",
    gallery: [
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800",
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800"
    ],
    createdAt: "2024-01-01 00:00:00",
    updatedAt: "2024-01-15 10:30:00",
  },
  {
    id: 3,
    modelCode: "X5_2024",
    modelName: "X5 2024",
    brandId: 4,
    brandName: "BMW",
    typeId: 2,
    typeName: "SUV",
    year: 2024,
    fuelType: "gasoline",
    engineSize: "3.0L Turbo",
    horsepower: 335,
    torque: 450,
    transmission: "8-Speed Auto",
    drivetrain: "AWD",
    price: 2800000000,
    status: "active",
    description: "SUV cao cấp với hiệu suất và công nghệ vượt trội",
    features: [
      "BMW xDrive",
      "iDrive 8",
      "Apple CarPlay/Android Auto",
      "Wireless Charging",
      "Panoramic Sunroof",
      "Premium Sound System"
    ],
    specifications: {
      length: 4922,
      width: 2004,
      height: 1776,
      wheelbase: 2975,
      curbWeight: 2070,
      fuelCapacity: 83,
      cargoVolume: 650
    },
    safety: {
      ncapRating: 5,
      airbags: 12,
      abs: true,
      esp: true,
      laneAssist: true,
      adaptiveCruise: true
    },
    performance: {
      acceleration: 5.5,
      topSpeed: 250,
      fuelEconomy: 8.8,
      co2Emissions: 201
    },
    averageRating: 4.7,
    totalReviews: 89,
    totalVehicles: 28,
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
    gallery: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800"
    ],
    createdAt: "2024-01-01 00:00:00",
    updatedAt: "2024-01-15 10:30:00",
  }
];

// Định nghĩa trạng thái model xe
export const modelStatuses = [
  { value: "active", label: "Hoạt động", color: "green" },
  { value: "inactive", label: "Không hoạt động", color: "red" },
  { value: "discontinued", label: "Ngừng sản xuất", color: "gray" },
  { value: "upcoming", label: "Sắp ra mắt", color: "blue" },
  { value: "limited", label: "Sản xuất hạn chế", color: "orange" },
];

// Định nghĩa loại nhiên liệu
export const fuelTypes = [
  { 
    value: "gasoline", 
    label: "Xăng", 
    icon: "⛽",
    color: "red",
    description: "Động cơ xăng truyền thống"
  },
  { 
    value: "diesel", 
    label: "Diesel", 
    icon: "🛢️",
    color: "blue",
    description: "Động cơ diesel tiết kiệm nhiên liệu"
  },
  { 
    value: "hybrid", 
    label: "Hybrid", 
    icon: "🔋",
    color: "green",
    description: "Kết hợp xăng và điện"
  },
  { 
    value: "electric", 
    label: "Điện", 
    icon: "⚡",
    color: "purple",
    description: "Động cơ điện hoàn toàn"
  },
  { 
    value: "plug_in_hybrid", 
    label: "Plug-in Hybrid", 
    icon: "🔌",
    color: "cyan",
    description: "Hybrid có thể sạc điện"
  },
  { 
    value: "hydrogen", 
    label: "Hydrogen", 
    icon: "💧",
    color: "lime",
    description: "Nhiên liệu hydro"
  },
];

// Định nghĩa loại hộp số
export const transmissionTypes = [
  { value: "manual", label: "Số sàn", icon: "🔧" },
  { value: "automatic", label: "Số tự động", icon: "⚙️" },
  { value: "cvt", label: "CVT", icon: "🔄" },
  { value: "dct", label: "DCT", icon: "⚡" },
  { value: "semi_automatic", label: "Bán tự động", icon: "🎛️" },
];

// Định nghĩa hệ dẫn động
export const drivetrainTypes = [
  { value: "fwd", label: "Cầu trước (FWD)", icon: "⬆️" },
  { value: "rwd", label: "Cầu sau (RWD)", icon: "⬇️" },
  { value: "awd", label: "4 bánh toàn thời gian (AWD)", icon: "🔄" },
  { value: "4wd", label: "4 bánh (4WD)", icon: "🔀" },
];

// Định nghĩa phân khúc giá
export const priceSegments = [
  { 
    value: "budget", 
    label: "Bình dân", 
    color: "blue", 
    range: "Dưới 500 triệu",
    min: 0,
    max: 500000000
  },
  { 
    value: "mid", 
    label: "Trung bình", 
    color: "green", 
    range: "500 triệu - 1.5 tỷ",
    min: 500000000,
    max: 1500000000
  },
  { 
    value: "premium", 
    label: "Cao cấp", 
    color: "purple", 
    range: "1.5 tỷ - 3 tỷ",
    min: 1500000000,
    max: 3000000000
  },
  { 
    value: "luxury", 
    label: "Siêu sang", 
    color: "gold", 
    range: "Trên 3 tỷ",
    min: 3000000000,
    max: Infinity
  },
];

// Định nghĩa mức độ đánh giá
export const ratingLevels = [
  { value: 5, label: "Xuất sắc (5⭐)", color: "green" },
  { value: 4, label: "Tốt (4⭐)", color: "blue" },
  { value: 3, label: "Trung bình (3⭐)", color: "orange" },
  { value: 2, label: "Kém (2⭐)", color: "red" },
  { value: 1, label: "Rất kém (1⭐)", color: "red" },
];

// Định nghĩa năm sản xuất
export const yearRanges = [
  { value: "2020-2024", label: "2020-2024", color: "green" },
  { value: "2015-2019", label: "2015-2019", color: "blue" },
  { value: "2010-2014", label: "2010-2014", color: "orange" },
  { value: "2005-2009", label: "2005-2009", color: "red" },
  { value: "before_2005", label: "Trước 2005", color: "gray" },
];

// Định nghĩa kích thước động cơ
export const engineSizes = [
  { value: "1.0L", label: "1.0L", description: "Động cơ nhỏ" },
  { value: "1.2L", label: "1.2L", description: "Động cơ nhỏ" },
  { value: "1.4L", label: "1.4L", description: "Động cơ nhỏ" },
  { value: "1.5L", label: "1.5L", description: "Động cơ trung bình" },
  { value: "1.6L", label: "1.6L", description: "Động cơ trung bình" },
  { value: "1.8L", label: "1.8L", description: "Động cơ trung bình" },
  { value: "2.0L", label: "2.0L", description: "Động cơ lớn" },
  { value: "2.5L", label: "2.5L", description: "Động cơ lớn" },
  { value: "3.0L", label: "3.0L", description: "Động cơ rất lớn" },
  { value: "3.5L", label: "3.5L", description: "Động cơ rất lớn" },
  { value: "4.0L+", label: "4.0L+", description: "Động cơ siêu lớn" },
];

// Định nghĩa mức độ an toàn
export const safetyLevels = [
  { value: 5, label: "5 sao", color: "green", description: "An toàn tối đa" },
  { value: 4, label: "4 sao", color: "blue", description: "An toàn tốt" },
  { value: 3, label: "3 sao", color: "orange", description: "An toàn trung bình" },
  { value: 2, label: "2 sao", color: "red", description: "An toàn kém" },
  { value: 1, label: "1 sao", color: "red", description: "An toàn rất kém" },
];

// Định nghĩa tính năng nổi bật
export const featureCategories = [
  { value: "safety", label: "An toàn", icon: "🛡️" },
  { value: "comfort", label: "Tiện nghi", icon: "🛋️" },
  { value: "technology", label: "Công nghệ", icon: "📱" },
  { value: "performance", label: "Hiệu suất", icon: "🏎️" },
  { value: "efficiency", label: "Tiết kiệm", icon: "💰" },
  { value: "design", label: "Thiết kế", icon: "🎨" },
];

// Định nghĩa màu sắc phổ biến
export const popularColors = [
  { value: "white", label: "Trắng", color: "#FFFFFF", hex: "#FFFFFF" },
  { value: "black", label: "Đen", color: "#000000", hex: "#000000" },
  { value: "silver", label: "Bạc", color: "#C0C0C0", hex: "#C0C0C0" },
  { value: "gray", label: "Xám", color: "#808080", hex: "#808080" },
  { value: "red", label: "Đỏ", color: "#FF0000", hex: "#FF0000" },
  { value: "blue", label: "Xanh dương", color: "#0000FF", hex: "#0000FF" },
  { value: "green", label: "Xanh lá", color: "#008000", hex: "#008000" },
  { value: "brown", label: "Nâu", color: "#A52A2A", hex: "#A52A2A" },
  { value: "yellow", label: "Vàng", color: "#FFFF00", hex: "#FFFF00" },
  { value: "orange", label: "Cam", color: "#FFA500", hex: "#FFA500" },
];
