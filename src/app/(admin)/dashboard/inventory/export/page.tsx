// "use client";
// import React, { useState } from "react";
// import { AdminTable } from "@/components/ui/Table";
// import { useConfirmationModalContext } from "@/components/ui/Modal";
// import { ColumnsType } from "antd/es/table";
// import { Tag, Badge } from "antd";
// import {
//   ExportOutlined,
//   CheckCircleOutlined, 
//   ExclamationCircleOutlined,
// } from "@ant-design/icons";
// import formatCurrency from "@/components/utils/helper/currency.format.helper";

// // Mock data cho phiếu xuất kho
// const exportData = [
//   {
//     id: 1,
//     exportCode: "XK001",
//     customerName: "Cửa hàng ô tô ABC",
//     totalAmount: 1800000,
//     totalItems: 8,
//     status: "completed",
//     exportDate: "2024-01-20",
//     exportedBy: "Nguyễn Văn A",
//     notes: "Xuất hàng cho khách hàng thường xuyên",
//     items: [
//       { productName: "Dầu động cơ 5W-30", quantity: 10, unitPrice: 250000, total: 2500000 },
//       { productName: "Lọc gió động cơ", quantity: 20, unitPrice: 180000, total: 3600000 },
//     ],
//   },
//   {
//     id: 2,
//     exportCode: "XK002",
//     customerName: "Xưởng sửa chữa XYZ",
//     totalAmount: 1200000,
//     totalItems: 5,
//     status: "pending",
//     exportDate: "2024-01-21",
//     exportedBy: "Trần Thị B",
//     notes: "Xuất hàng cho xưởng sửa chữa",
//     items: [
//       { productName: "Phanh đĩa trước", quantity: 2, unitPrice: 1200000, total: 2400000 },
//       { productName: "Má phanh trước", quantity: 4, unitPrice: 350000, total: 1400000 },
//     ],
//   },
//   {
//     id: 3,
//     exportCode: "XK003",
//     customerName: "Đại lý phụ tùng DEF",
//     totalAmount: 950000,
//     totalItems: 15,
//     status: "processing",
//     exportDate: "2024-01-22",
//     exportedBy: "Lê Văn C",
//     notes: "Xuất hàng cho đại lý",
//     items: [
//       { productName: "Bóng đèn LED", quantity: 50, unitPrice: 45000, total: 2250000 },
//       { productName: "Lốp xe 205/55R16", quantity: 2, unitPrice: 1800000, total: 3600000 },
//     ],
//   },
//   {
//     id: 4,
//     exportCode: "XK004",
//     customerName: "Cửa hàng điện tử GHI",
//     totalAmount: 320000,
//     totalItems: 20,
//     status: "completed",
//     exportDate: "2024-01-23",
//     exportedBy: "Phạm Thị D",
//     notes: "Xuất hàng điện tử",
//     items: [
//       { productName: "Dầu phanh DOT 4", quantity: 15, unitPrice: 120000, total: 1800000 },
//       { productName: "Lọc dầu động cơ", quantity: 25, unitPrice: 95000, total: 2375000 },
//     ],
//   },
//   {
//     id: 5,
//     exportCode: "XK005",
//     customerName: "Xưởng lốp xe JKL",
//     totalAmount: 4500000,
//     totalItems: 3,
//     status: "cancelled",
//     exportDate: "2024-01-24",
//     exportedBy: "Hoàng Văn E",
//     notes: "Hủy do khách hàng thay đổi ý định",
//     items: [
//       { productName: "Lốp xe 205/55R16", quantity: 4, unitPrice: 1800000, total: 7200000 },
//     ],
//   },
// ];

// const exportStatuses = [
//   { value: "pending", label: "Chờ xử lý", color: "orange" },
//   { value: "processing", label: "Đang xử lý", color: "blue" },
//   { value: "completed", label: "Hoàn thành", color: "green" },
//   { value: "cancelled", label: "Đã hủy", color: "red" },
// ];

// const ExportInventoryPage = () => {
//   const [data, setData] = useState(exportData);
//   const [loading, setLoading] = useState(false);
//   const { showModal } = useConfirmationModalContext();

//   // Định nghĩa columns
//   const columns: ColumnsType<any> = [
//     {
//       title: "ID",
//       dataIndex: "id",
//       key: "id",
//       width: 80,
//       sorter: (a, b) => a.id - b.id,
//     },
//     {
//       title: "Mã phiếu xuất",
//       dataIndex: "exportCode",
//       key: "exportCode",
//       width: 120,
//       sorter: (a, b) => a.exportCode.localeCompare(b.exportCode),
//     },
//     {
//       title: "Khách hàng",
//       dataIndex: "customerName",
//       key: "customerName",
//       width: 200,
//       ellipsis: true,
//     },
//     {
//       title: "Tổng tiền",
//       dataIndex: "totalAmount",
//       key: "totalAmount",
//       width: 120,
//       sorter: (a, b) => a.totalAmount - b.totalAmount,
//       render: (amount: number) => (
//         <div style={{ fontWeight: 500, color: "#52c41a" }}>
//           {formatCurrency(amount)}
//         </div>
//       ),
//     },
//     {
//       title: "Số lượng sản phẩm",
//       key: "items",
//       width: 120,
//       render: (_, record) => (
//         <div>
//           <Badge count={record.totalItems} style={{ backgroundColor: "#1890ff" }} />
//           <span style={{ marginLeft: 8, fontSize: 12 }}>sản phẩm</span>
//         </div>
//       ),
//     },
//     {
//       title: "Trạng thái",
//       dataIndex: "status",
//       key: "status",
//       width: 120,
//       render: (status: string) => {
//         const statusConfig = exportStatuses.find((s) => s.value === status);
//         return <Tag color={statusConfig?.color}>{statusConfig?.label}</Tag>;
//       },
//       filters: exportStatuses.map((status) => ({
//         text: status.label,
//         value: status.value,
//       })),
//       onFilter: (value, record) => record.status === value,
//     },
//     {
//       title: "Ngày xuất",
//       dataIndex: "exportDate",
//       key: "exportDate",
//       width: 120,
//       sorter: (a, b) => new Date(a.exportDate).getTime() - new Date(b.exportDate).getTime(),
//     },
//     {
//       title: "Người xuất",
//       dataIndex: "exportedBy",
//       key: "exportedBy",
//       width: 120,
//     },
//     {
//       title: "Ghi chú",
//       dataIndex: "notes",
//       key: "notes",
//       width: 200,
//       ellipsis: true,
//     },
//   ];

//   const handleDelete = (record: any) => {
//     showModal({
//       title: "Xóa phiếu xuất",
//       content: `Bạn có chắc chắn muốn xóa phiếu xuất ${record.exportCode}?`,
//       type: "error",
//       onConfirm: async () => {
//         setLoading(true);
//         await new Promise((resolve) => setTimeout(resolve, 1000));
//         setData(data.filter((item) => item.id !== record.id));
//         setLoading(false);
//       },
//     });
//   };

//   const handleViewItems = (record: any) => {
//     console.log("View export items:", record.items);
//   };

//   const handleApprove = (record: any) => {
//     showModal({
//       title: "Duyệt phiếu xuất",
//       content: `Bạn có chắc chắn muốn duyệt phiếu xuất ${record.exportCode}?`,
//       type: "warning",
//       onConfirm: async () => {
//         setLoading(true);
//         await new Promise((resolve) => setTimeout(resolve, 1000));
//         setData(
//           data.map((item) =>
//             item.id === record.id
//               ? { ...item, status: "completed" }
//               : item
//           )
//         );
//         setLoading(false);
//       },
//     });
//   };

//   const handleCancel = (record: any) => {
//     showModal({
//       title: "Hủy phiếu xuất",
//       content: `Bạn có chắc chắn muốn hủy phiếu xuất ${record.exportCode}?`,
//       type: "error",
//       onConfirm: async () => {
//         setLoading(true);
//         await new Promise((resolve) => setTimeout(resolve, 1000));
//         setData(
//           data.map((item) =>
//             item.id === record.id
//               ? { ...item, status: "cancelled" }
//               : item
//           )
//         );
//         setLoading(false);
//       },
//     });
//   };

//   return (
//     <AdminTable
//       title="Quản lý xuất kho"
//       dataSource={data}
//       columns={columns}
//       loading={loading}
//       onDelete={handleDelete}
//       addButtonText="Tạo phiếu xuất"
//       searchable={true}
//       searchPlaceholder="Tìm kiếm phiếu xuất theo mã, khách hàng..."
//       searchFields={["exportCode", "customerName", "exportedBy"]}
//       actions={[
//         {
//           key: "view-items",
//           label: "Xem chi tiết",
//           type: "default",
//           icon: <ExportOutlined />,
//           onClick: handleViewItems,
//         },
//         {
//           key: "approve",
//           label: "Duyệt",
//           type: "primary",
//           icon: <CheckCircleOutlined />,
//           onClick: handleApprove,
//           condition: (record: any) => record.status === "pending" || record.status === "processing",
//         },
//         {
//           key: "cancel",
//           label: "Hủy",
//           type: "default",
//           danger: true,
//           icon: <ExclamationCircleOutlined />,
//           onClick: handleCancel,
//           condition: (record: any) => record.status !== "completed" && record.status !== "cancelled",
//         },
//       ]}
//       scroll={{ x: 1200 }}
//     />
//   );
// };

// export default ExportInventoryPage;
