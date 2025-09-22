export interface CenterInfo {
  id: number;
  name: string;
  logo: string;
  description: string;
  establishedYear: number;
  licenseNumber: string;
  taxCode: string;
  website: string;
  email: string;
  phone: string;
  hotline: string;
  address: {
    street: string;
    ward: string;
    district: string;
    city: string;
    country: string;
    postalCode: string;
  };
  businessHours: {
    weekdays: {
      open: string;
      close: string;
    };
    weekends: {
      open: string;
      close: string;
    };
    holidays: string;
  };
  services: string[];
  certifications: Array<{
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate: string;
    status: "active" | "expired" | "pending";
  }>;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    zalo?: string;
  };
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    branch: string;
  };
  statistics: {
    totalCustomers: number;
    totalVehicles: number;
    totalServices: number;
    totalRevenue: number;
    averageRating: number;
    totalReviews: number;
  };
  features: string[];
  awards: Array<{
    name: string;
    year: number;
    organization: string;
  }>;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export const centerInfoData: CenterInfo = {
  id: 1,
  name: "Smart Car Spa - Trung tâm chăm sóc xe hơi cao cấp",
  logo: "/images/logo-sider.png",
  description: "Smart Car Spa là trung tâm chăm sóc xe hơi hàng đầu tại Việt Nam, chuyên cung cấp các dịch vụ chăm sóc xe toàn diện với công nghệ hiện đại và đội ngũ kỹ thuật viên chuyên nghiệp.",
  establishedYear: 2018,
  licenseNumber: "0123456789",
  taxCode: "0123456789",
  website: "https://smartcarspa.vn",
  email: "info@smartcarspa.vn",
  phone: "028 1234 5678",
  hotline: "1900 1234",
  address: {
    street: "123 Đường Nguyễn Huệ",
    ward: "Phường Bến Nghé",
    district: "Quận 1",
    city: "TP. Hồ Chí Minh",
    country: "Việt Nam",
    postalCode: "700000"
  },
  businessHours: {
    weekdays: {
      open: "07:00",
      close: "19:00"
    },
    weekends: {
      open: "08:00",
      close: "18:00"
    },
    holidays: "Nghỉ lễ theo quy định của Nhà nước"
  },
  services: [
    "Rửa xe chuyên nghiệp",
    "Đánh bóng và phủ ceramic",
    "Bảo dưỡng định kỳ",
    "Sửa chữa và thay thế phụ tùng",
    "Kiểm tra và bảo dưỡng hệ thống điện",
    "Dịch vụ cứu hộ 24/7",
    "Bảo hiểm xe hơi",
    "Cho thuê xe"
  ],
  certifications: [
    {
      name: "ISO 9001:2015 - Hệ thống quản lý chất lượng",
      issuer: "Tổ chức chứng nhận quốc tế",
      issueDate: "2023-01-15",
      expiryDate: "2026-01-15",
      status: "active"
    },
    {
      name: "Chứng nhận dịch vụ chăm sóc xe hơi chuyên nghiệp",
      issuer: "Hiệp hội ô tô Việt Nam",
      issueDate: "2022-06-20",
      expiryDate: "2025-06-20",
      status: "active"
    },
    {
      name: "Giấy phép kinh doanh dịch vụ ô tô",
      issuer: "Sở Kế hoạch và Đầu tư TP.HCM",
      issueDate: "2018-03-10",
      expiryDate: "2028-03-10",
      status: "active"
    }
  ],
  socialMedia: {
    facebook: "https://facebook.com/smartcarspa",
    instagram: "https://instagram.com/smartcarspa",
    youtube: "https://youtube.com/smartcarspa",
    tiktok: "https://tiktok.com/@smartcarspa",
    zalo: "https://zalo.me/smartcarspa"
  },
  bankInfo: {
    bankName: "Ngân hàng TMCP Á Châu (ACB)",
    accountNumber: "1234567890",
    accountHolder: "CÔNG TY TNHH SMART CAR SPA",
    branch: "Chi nhánh TP.HCM"
  },
  statistics: {
    totalCustomers: 15420,
    totalVehicles: 12850,
    totalServices: 45680,
    totalRevenue: 12500000000,
    averageRating: 4.8,
    totalReviews: 3240
  },
  features: [
    "Công nghệ rửa xe không chạm",
    "Hệ thống lọc nước RO",
    "Sản phẩm chăm sóc xe cao cấp",
    "Kỹ thuật viên được đào tạo chuyên nghiệp",
    "Bảo hành dịch vụ 30 ngày",
    "Hỗ trợ khách hàng 24/7",
    "Thanh toán đa dạng",
    "Chương trình khách hàng thân thiết"
  ],
  awards: [
    {
      name: "Top 10 Trung tâm chăm sóc xe hơi tốt nhất TP.HCM",
      year: 2023,
      organization: "Tạp chí Ô tô Việt Nam"
    },
    {
      name: "Giải thưởng Dịch vụ xuất sắc",
      year: 2022,
      organization: "Hiệp hội Doanh nghiệp TP.HCM"
    },
    {
      name: "Chứng nhận Thương hiệu uy tín",
      year: 2021,
      organization: "Hội đồng Thương hiệu Việt Nam"
    }
  ],
  status: "active",
  createdAt: "2018-03-10T00:00:00.000Z",
  updatedAt: "2024-01-15T10:30:00.000Z"
};



export const centerStatuses = [
  { label: "Hoạt động", value: "active", color: "green" },
  { label: "Tạm dừng", value: "inactive", color: "red" }
];
