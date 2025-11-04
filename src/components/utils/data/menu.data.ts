import { MenuItem } from "@/components/layout/Header/customer.header";

export const menuItems: MenuItem[] = [
  { key: "booking", label: "Đặt lịch" },
  {
    key: "care",
    label: "Chăm sóc xe",
    children: [
      { key: "care1", label: "CHĂM SÓC XE VIP" },
      { key: "care2", label: "BẢO DƯỠNG NHANH OTO" },
      { key: "care3", label: "VỆ SINH NỘI THÂT" },
      { key: "care4", label: "VỆ SINH KHOANG MÁY" },
    ],
  },
  { key: "shop", label: "Sản phẩm" },
  { key: "toys", label: "Đồ chơi xe" },
  { key: "system", label: "Hệ thống" },
  { key: "aboutUs", label: "Về chúng tôi" },
];
