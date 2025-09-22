export interface DashboardStats {
  totalCustomers: number;
  totalVehicles: number;
  totalBookings: number;
  totalRevenue: number;
  monthlyGrowth: {
    customers: number;
    vehicles: number;
    bookings: number;
    revenue: number;
  };
  todayStats: {
    newCustomers: number;
    newBookings: number;
    completedServices: number;
    pendingBookings: number;
  };
}

export interface RecentActivity {
  id: number;
  type: "booking" | "customer" | "service" | "payment";
  title: string;
  description: string;
  time: string;
  status: "success" | "warning" | "error" | "info";
  user?: string;
  amount?: number;
}

export interface TopService {
  id: number;
  name: string;
  bookings: number;
  revenue: number;
  growth: number;
  icon: string;
}

export interface RevenueChart {
  month: string;
  revenue: number;
  bookings: number;
  customers: number;
}

export interface BookingStatus {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export const dashboardStats: DashboardStats = {
  totalCustomers: 15420,
  totalVehicles: 12850,
  totalBookings: 45680,
  totalRevenue: 12500000000,
  monthlyGrowth: {
    customers: 12.5,
    vehicles: 8.3,
    bookings: 15.2,
    revenue: 18.7,
  },
  todayStats: {
    newCustomers: 24,
    newBookings: 18,
    completedServices: 35,
    pendingBookings: 12,
  },
};

export const recentActivities: RecentActivity[] = [
  {
    id: 1,
    type: "booking",
    title: "Đặt lịch mới",
    description: "Khách hàng Nguyễn Văn A đặt lịch rửa xe",
    time: "5 phút trước",
    status: "success",
    user: "Nguyễn Văn A",
    amount: 150000,
  },
  {
    id: 2,
    type: "service",
    title: "Hoàn thành dịch vụ",
    description: "Dịch vụ đánh bóng xe cho khách hàng Trần Thị B",
    time: "15 phút trước",
    status: "info",
    user: "Trần Thị B",
    amount: 500000,
  },
  {
    id: 3,
    type: "customer",
    title: "Khách hàng mới",
    description: "Đăng ký tài khoản mới - Lê Văn C",
    time: "30 phút trước",
    status: "success",
    user: "Lê Văn C",
  },
  {
    id: 4,
    type: "payment",
    title: "Thanh toán thành công",
    description: "Thanh toán dịch vụ bảo dưỡng xe",
    time: "1 giờ trước",
    status: "success",
    user: "Phạm Thị D",
    amount: 800000,
  },
  {
    id: 5,
    type: "booking",
    title: "Hủy lịch đặt",
    description: "Khách hàng Võ Văn E hủy lịch đặt",
    time: "2 giờ trước",
    status: "warning",
    user: "Võ Văn E",
  },
  {
    id: 6,
    type: "service",
    title: "Dịch vụ đang thực hiện",
    description: "Đang thực hiện dịch vụ sửa chữa xe",
    time: "3 giờ trước",
    status: "info",
    user: "Đặng Thị F",
    amount: 1200000,
  },
];

export const topServices: TopService[] = [
  {
    id: 1,
    name: "Rửa xe chuyên nghiệp",
    bookings: 1250,
    revenue: 187500000,
    growth: 15.2,
    icon: "🚗",
  },
  {
    id: 2,
    name: "Đánh bóng và phủ ceramic",
    bookings: 890,
    revenue: 445000000,
    growth: 22.8,
    icon: "✨",
  },
  {
    id: 3,
    name: "Bảo dưỡng định kỳ",
    bookings: 650,
    revenue: 325000000,
    growth: 8.5,
    icon: "🔧",
  },
  {
    id: 4,
    name: "Sửa chữa và thay thế phụ tùng",
    bookings: 420,
    revenue: 210000000,
    growth: 12.3,
    icon: "⚙️",
  },
  {
    id: 5,
    name: "Kiểm tra hệ thống điện",
    bookings: 380,
    revenue: 190000000,
    growth: 18.7,
    icon: "⚡",
  },
];

export const revenueChartData: RevenueChart[] = [
  { month: "Tháng 1", revenue: 850000000, bookings: 1200, customers: 980 },
  { month: "Tháng 2", revenue: 920000000, bookings: 1350, customers: 1100 },
  { month: "Tháng 3", revenue: 1050000000, bookings: 1480, customers: 1250 },
  { month: "Tháng 4", revenue: 1180000000, bookings: 1620, customers: 1380 },
  { month: "Tháng 5", revenue: 1320000000, bookings: 1750, customers: 1520 },
  { month: "Tháng 6", revenue: 1450000000, bookings: 1890, customers: 1650 },
  { month: "Tháng 7", revenue: 1580000000, bookings: 2020, customers: 1780 },
  { month: "Tháng 8", revenue: 1720000000, bookings: 2150, customers: 1920 },
  { month: "Tháng 9", revenue: 1850000000, bookings: 2280, customers: 2050 },
  { month: "Tháng 10", revenue: 1980000000, bookings: 2410, customers: 2180 },
  { month: "Tháng 11", revenue: 2110000000, bookings: 2540, customers: 2310 },
  { month: "Tháng 12", revenue: 2250000000, bookings: 2670, customers: 2440 },
];

export const bookingStatusData: BookingStatus[] = [
  { status: "Hoàn thành", count: 2850, percentage: 65.2, color: "#52c41a" },
  { status: "Đang thực hiện", count: 890, percentage: 20.3, color: "#1890ff" },
  { status: "Chờ xác nhận", count: 420, percentage: 9.6, color: "#faad14" },
  { status: "Đã hủy", count: 210, percentage: 4.8, color: "#ff4d4f" },
];

export const quickActions = [
  {
    id: 1,
    title: "Đặt lịch mới",
    description: "Tạo lịch đặt dịch vụ cho khách hàng",
    icon: "📅",
    color: "#1890ff",
    path: "/dashboard/bookings",
  },
  {
    id: 2,
    title: "Thêm khách hàng",
    description: "Đăng ký khách hàng mới",
    icon: "👤",
    color: "#52c41a",
    path: "/dashboard/members",
  },
  {
    id: 3,
    title: "Quản lý nhân viên",
    description: "Thêm hoặc chỉnh sửa thông tin nhân viên",
    icon: "👥",
    color: "#722ed1",
    path: "/dashboard/staff",
  },
  {
    id: 4,
    title: "Báo cáo doanh thu",
    description: "Xem báo cáo chi tiết về doanh thu",
    icon: "📊",
    color: "#fa8c16",
    path: "/dashboard/reports",
  },
];

export const upcomingBookings = [
  {
    id: 1,
    customerName: "Nguyễn Văn A",
    service: "Rửa xe chuyên nghiệp",
    time: "09:00",
    date: "Hôm nay",
    status: "confirmed",
    vehicle: "Toyota Camry 2020",
  },
  {
    id: 2,
    customerName: "Trần Thị B",
    service: "Đánh bóng và phủ ceramic",
    time: "10:30",
    date: "Hôm nay",
    status: "pending",
    vehicle: "Honda Civic 2021",
  },
  {
    id: 3,
    customerName: "Lê Văn C",
    service: "Bảo dưỡng định kỳ",
    time: "14:00",
    date: "Hôm nay",
    status: "confirmed",
    vehicle: "Mazda CX-5 2022",
  },
  {
    id: 4,
    customerName: "Phạm Thị D",
    service: "Sửa chữa hệ thống điện",
    time: "16:30",
    date: "Hôm nay",
    status: "in_progress",
    vehicle: "BMW X3 2021",
  },
  {
    id: 5,
    customerName: "Võ Văn E",
    service: "Thay thế phụ tùng",
    time: "08:00",
    date: "Ngày mai",
    status: "confirmed",
    vehicle: "Mercedes C-Class 2020",
  },
];
