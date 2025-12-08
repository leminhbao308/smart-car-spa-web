export interface CustomerPoints {
  id: number;
  customerId: number;
  customerName: string;
  customerPhone: string;
  totalPoints: number;
  availablePoints: number;
  usedPoints: number;
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  joinDate: string;
  lastTransactionDate: string;
  totalSpent: number;
  totalTransactions: number;
}

export interface PointsTransaction {
  id: number;
  customerId: number;
  customerName: string;
  type: "earn" | "redeem" | "expire" | "adjustment";
  points: number;
  description: string;
  orderId?: number;
  transactionDate: string;
  expiryDate?: string;
  status: "active" | "expired" | "used";
}

export interface PointsRule {
  id: number;
  name: string;
  description: string;
  type: "earn_rate" | "tier_benefit" | "bonus_points" | "redemption_rate";
  value: number;
  conditions: {
    minOrderValue?: number;
    maxOrderValue?: number;
    applicableCategories?: string[];
    applicableServices?: number[];
    customerTier?: string[];
    validFrom?: string;
    validTo?: string;
  };
  isActive: boolean;
  priority: number;
}

export const customerTiers = [
  { value: "bronze", label: "Đồng", color: "#cd7f32", minPoints: 0, maxPoints: 999 },
  { value: "silver", label: "Bạc", color: "#c0c0c0", minPoints: 1000, maxPoints: 4999 },
  { value: "gold", label: "Vàng", color: "#ffd700", minPoints: 5000, maxPoints: 14999 },
  { value: "platinum", label: "Bạch kim", color: "#e5e4e2", minPoints: 15000, maxPoints: 49999 },
  { value: "diamond", label: "Kim cương", color: "#b9f2ff", minPoints: 50000, maxPoints: 999999 },
];

export const pointsRules: PointsRule[] = [
  {
    id: 1,
    name: "Tích điểm cơ bản",
    description: "Tích 1 điểm cho mỗi 1,000 VNĐ chi tiêu",
    type: "earn_rate",
    value: 0.001, // 1 điểm / 1000 VNĐ
    conditions: {
      minOrderValue: 0,
    },
    isActive: true,
    priority: 1,
  },
  {
    id: 2,
    name: "Bonus khách hàng mới",
    description: "Tặng 500 điểm cho khách hàng mới",
    type: "bonus_points",
    value: 500,
    conditions: {
      customerTier: ["bronze"],
    },
    isActive: true,
    priority: 2,
  },
  {
    id: 3,
    name: "Ưu đãi khách VIP",
    description: "Khách hàng Vàng trở lên tích điểm x2",
    type: "earn_rate",
    value: 0.002, // 2 điểm / 1000 VNĐ
    conditions: {
      customerTier: ["gold", "platinum", "diamond"],
    },
    isActive: true,
    priority: 3,
  },
  {
    id: 4,
    name: "Bonus cuối tuần",
    description: "Tích điểm x1.5 vào cuối tuần",
    type: "earn_rate",
    value: 0.0015, // 1.5 điểm / 1000 VNĐ
    conditions: {
      validFrom: "2024-01-01",
      validTo: "2024-12-31",
    },
    isActive: true,
    priority: 4,
  },
];

export const redemptionRates = [
  { tier: "bronze", rate: 1000, label: "1,000 điểm = 10,000 VNĐ" },
  { tier: "silver", rate: 950, label: "950 điểm = 10,000 VNĐ" },
  { tier: "gold", rate: 900, label: "900 điểm = 10,000 VNĐ" },
  { tier: "platinum", rate: 850, label: "850 điểm = 10,000 VNĐ" },
  { tier: "diamond", rate: 800, label: "800 điểm = 10,000 VNĐ" },
];

export const customerPointsData: CustomerPoints[] = [
  {
    id: 1,
    customerId: 101,
    customerName: "Nguyễn Văn A",
    customerPhone: "0901234567",
    totalPoints: 2500,
    availablePoints: 2500,
    usedPoints: 0,
    tier: "silver",
    joinDate: "2024-01-15",
    lastTransactionDate: "2024-06-20",
    totalSpent: 2500000,
    totalTransactions: 15,
  },
  {
    id: 2,
    customerId: 102,
    customerName: "Trần Thị B",
    customerPhone: "0901234568",
    totalPoints: 8500,
    availablePoints: 7500,
    usedPoints: 1000,
    tier: "gold",
    joinDate: "2023-08-10",
    lastTransactionDate: "2024-06-19",
    totalSpent: 8500000,
    totalTransactions: 45,
  },
  {
    id: 3,
    customerId: 103,
    customerName: "Lê Văn C",
    customerPhone: "0901234569",
    totalPoints: 15000,
    availablePoints: 12000,
    usedPoints: 3000,
    tier: "platinum",
    joinDate: "2023-03-05",
    lastTransactionDate: "2024-06-18",
    totalSpent: 15000000,
    totalTransactions: 78,
  },
  {
    id: 4,
    customerId: 104,
    customerName: "Phạm Thị D",
    customerPhone: "0901234570",
    totalPoints: 500,
    availablePoints: 500,
    usedPoints: 0,
    tier: "bronze",
    joinDate: "2024-06-01",
    lastTransactionDate: "2024-06-15",
    totalSpent: 500000,
    totalTransactions: 2,
  },
  {
    id: 5,
    customerId: 105,
    customerName: "Võ Văn E",
    customerPhone: "0901234571",
    totalPoints: 25000,
    availablePoints: 20000,
    usedPoints: 5000,
    tier: "diamond",
    joinDate: "2022-12-01",
    lastTransactionDate: "2024-06-17",
    totalSpent: 25000000,
    totalTransactions: 120,
  },
];

export const pointsTransactionData: PointsTransaction[] = [
  {
    id: 1,
    customerId: 101,
    customerName: "Nguyễn Văn A",
    type: "earn",
    points: 500,
    description: "Tích điểm từ đơn hàng #1001",
    orderId: 1001,
    transactionDate: "2024-06-20T10:30:00",
    expiryDate: "2025-06-20T10:30:00",
    status: "active",
  },
  {
    id: 2,
    customerId: 102,
    customerName: "Trần Thị B",
    type: "redeem",
    points: -1000,
    description: "Sử dụng điểm thanh toán đơn hàng #1002",
    orderId: 1002,
    transactionDate: "2024-06-19T14:20:00",
    status: "used",
  },
  {
    id: 3,
    customerId: 103,
    customerName: "Lê Văn C",
    type: "earn",
    points: 1200,
    description: "Tích điểm từ đơn hàng #1003 (VIP x2)",
    orderId: 1003,
    transactionDate: "2024-06-18T09:15:00",
    expiryDate: "2025-06-18T09:15:00",
    status: "active",
  },
  {
    id: 4,
    customerId: 104,
    customerName: "Phạm Thị D",
    type: "earn",
    points: 500,
    description: "Bonus khách hàng mới",
    transactionDate: "2024-06-01T08:00:00",
    expiryDate: "2025-06-01T08:00:00",
    status: "active",
  },
  {
    id: 5,
    customerId: 105,
    customerName: "Võ Văn E",
    type: "redeem",
    points: -5000,
    description: "Sử dụng điểm thanh toán đơn hàng #1005",
    orderId: 1005,
    transactionDate: "2024-06-17T16:45:00",
    status: "used",
  },
];

// Helper functions
export const getCustomerTier = (points: number): string => {
  const tier = customerTiers.find(t => points >= t.minPoints && points <= t.maxPoints);
  return tier?.value || "bronze";
};

export const getTierInfo = (tier: string) => {
  return customerTiers.find(t => t.value === tier);
};

export const calculatePointsToEarn = (amount: number, customerTier: string): number => {
  const baseRule = pointsRules.find(r => r.type === "earn_rate" && r.conditions.customerTier?.includes(customerTier));
  const rate = baseRule?.value || 0.001;
  return Math.floor(amount * rate);
};

export const calculatePointsToRedeem = (amount: number, customerTier: string): number => {
  const redemptionRate = redemptionRates.find(r => r.tier === customerTier);
  const rate = redemptionRate?.rate || 1000;
  return Math.floor(amount / 10 * rate); // 10,000 VNĐ = 1,000 điểm (cơ bản)
};

export const getMaxRedeemableAmount = (availablePoints: number, customerTier: string): number => {
  const redemptionRate = redemptionRates.find(r => r.tier === customerTier);
  const rate = redemptionRate?.rate || 1000;
  return Math.floor(availablePoints / rate * 10); // Chuyển đổi ngược lại
};
