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