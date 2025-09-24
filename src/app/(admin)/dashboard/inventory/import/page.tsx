"use client";
import React, { useState } from "react";
import { AdminTable } from "@/components/ui/Table";
import { useConfirmationModalContext } from "@/components/ui/Modal";
import {
  ImportDetailModal,
  ImportEditModal,
} from "@/components/ui/Modal/ImportModal";
import { ColumnsType } from "antd/es/table";
import { Tag, Badge, message } from "antd";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  EditOutlined,
} from "@ant-design/icons";
import formatCurrency from "@/components/utils/helper/currency.format.helper";

// Interface cho phiếu nhập kho
interface ImportItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface ImportRecord {
  id: number;
  importCode: string;
  supplierName: string;
  totalAmount: number;
  totalItems: number;
  status: string;
  importDate: string;
  receivedBy: string;
  notes: string;
  items: ImportItem[];
}

// Mock data cho phiếu nhập kho
const importData = [
  {
    id: 1,
    importCode: "NK001",
    supplierName: "Công ty TNHH Dầu nhớt ABC",
    totalAmount: 2500000,
    totalItems: 15,
    status: "completed",
    importDate: "2024-01-20",
    receivedBy: "Nguyễn Văn A",
    notes: "Nhập hàng định kỳ tháng 1",
    items: [
      {
        productName: "Dầu động cơ 5W-30",
        quantity: 20,
        unitPrice: 180000,
        total: 3600000,
      },
      {
        productName: "Lọc gió động cơ",
        quantity: 50,
        unitPrice: 120000,
        total: 6000000,
      },
    ],
  },
  {
    id: 2,
    importCode: "NK002",
    supplierName: "Nhà cung cấp phụ tùng XYZ",
    totalAmount: 1800000,
    totalItems: 8,
    status: "pending",
    importDate: "2024-01-21",
    receivedBy: "Trần Thị B",
    notes: "Nhập hàng bổ sung",
    items: [
      {
        productName: "Phanh đĩa trước",
        quantity: 10,
        unitPrice: 800000,
        total: 8000000,
      },
      {
        productName: "Má phanh trước",
        quantity: 20,
        unitPrice: 250000,
        total: 5000000,
      },
    ],
  },
  {
    id: 3,
    importCode: "NK003",
    supplierName: "Công ty phụ tùng DEF",
    totalAmount: 3200000,
    totalItems: 12,
    status: "processing",
    importDate: "2024-01-22",
    receivedBy: "Lê Văn C",
    notes: "Nhập hàng khẩn cấp",
    items: [
      {
        productName: "Bóng đèn LED",
        quantity: 100,
        unitPrice: 30000,
        total: 3000000,
      },
      {
        productName: "Lốp xe 205/55R16",
        quantity: 8,
        unitPrice: 1200000,
        total: 9600000,
      },
    ],
  },
  {
    id: 4,
    importCode: "NK004",
    supplierName: "Nhà cung cấp điện tử GHI",
    totalAmount: 950000,
    totalItems: 25,
    status: "completed",
    importDate: "2024-01-23",
    receivedBy: "Phạm Thị D",
    notes: "Nhập hàng điện tử",
    items: [
      {
        productName: "Dầu phanh DOT 4",
        quantity: 30,
        unitPrice: 80000,
        total: 2400000,
      },
      {
        productName: "Lọc dầu động cơ",
        quantity: 40,
        unitPrice: 65000,
        total: 2600000,
      },
    ],
  },
  {
    id: 5,
    importCode: "NK005",
    supplierName: "Công ty lốp xe JKL",
    totalAmount: 4500000,
    totalItems: 6,
    status: "cancelled",
    importDate: "2024-01-24",
    receivedBy: "Hoàng Văn E",
    notes: "Hủy do chất lượng không đạt",
    items: [
      {
        productName: "Lốp xe 205/55R16",
        quantity: 10,
        unitPrice: 1200000,
        total: 12000000,
      },
    ],
  },
];

const importStatuses = [
  { value: "pending", label: "Chờ xử lý", color: "orange" },
  { value: "processing", label: "Đang xử lý", color: "blue" },
  { value: "completed", label: "Hoàn thành", color: "green" },
  { value: "cancelled", label: "Đã hủy", color: "red" },
];

const ImportInventoryPage = () => {
  const [data, setData] = useState(importData);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ImportRecord | null>(
    null
  );
  const { showModal } = useConfirmationModalContext();

  // Định nghĩa columns
  const columns: ColumnsType<ImportRecord> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Mã phiếu nhập",
      dataIndex: "importCode",
      key: "importCode",
      width: 120,
      sorter: (a, b) => a.importCode.localeCompare(b.importCode),
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "supplierName",
      key: "supplierName",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 120,
      sorter: (a, b) => a.totalAmount - b.totalAmount,
      render: (amount: number) => (
        <div style={{ fontWeight: 500, color: "#52c41a" }}>
          {formatCurrency(amount)}
        </div>
      ),
    },
    {
      title: "Số lượng sản phẩm",
      key: "items",
      width: 120,
      render: (_, record) => (
        <div>
          <Badge
            count={record.totalItems}
            style={{ backgroundColor: "#1890ff" }}
          />
          <span style={{ marginLeft: 8, fontSize: 12 }}>sản phẩm</span>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => {
        const statusConfig = importStatuses.find((s) => s.value === status);
        return <Tag color={statusConfig?.color}>{statusConfig?.label}</Tag>;
      },
      filters: importStatuses.map((status) => ({
        text: status.label,
        value: status.value,
      })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Ngày nhập",
      dataIndex: "importDate",
      key: "importDate",
      width: 120,
      sorter: (a, b) =>
        new Date(a.importDate).getTime() - new Date(b.importDate).getTime(),
    },
    {
      title: "Người nhận",
      dataIndex: "receivedBy",
      key: "receivedBy",
      width: 120,
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      width: 200,
      ellipsis: true,
    },
  ];

  // Handlers
  const handleAdd = () => {
    setSelectedRecord(null);
    setEditModalVisible(true);
  };

  const handleEdit = (record: ImportRecord) => {
    // Không cho phép chỉnh sửa khi phiếu nhập đã duyệt hoặc đã hủy
    if (record.status === "completed" || record.status === "cancelled") {
      message.warning("Không thể chỉnh sửa phiếu nhập đã duyệt hoặc đã hủy");
      return;
    }
    setSelectedRecord(record);
    setEditModalVisible(true);
  };

  const handleView = (record: ImportRecord) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  const handleApprove = (record: ImportRecord) => {
    showModal({
      title: "Duyệt phiếu nhập",
      content: `Bạn có chắc chắn muốn duyệt phiếu nhập ${record.importCode}?`,
      type: "warning",
      onConfirm: async () => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setData(
          data.map((item) =>
            item.id === record.id ? { ...item, status: "completed" } : item
          )
        );
        setLoading(false);
      },
    });
  };

  const handleCancel = (record: ImportRecord) => {
    showModal({
      title: "Hủy phiếu nhập",
      content: `Bạn có chắc chắn muốn hủy phiếu nhập ${record.importCode}?`,
      type: "error",
      onConfirm: async () => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setData(
          data.map((item) =>
            item.id === record.id ? { ...item, status: "cancelled" } : item
          )
        );
        setLoading(false);
        message.success("Hủy phiếu nhập thành công");
      },
    });
  };

  // Modal handlers
  const handleSaveImport = async (importData: Partial<ImportRecord>) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (selectedRecord) {
        // Cập nhật phiếu nhập hiện có
        setData(
          data.map((item) =>
            item.id === selectedRecord.id
              ? { ...item, ...importData, status: "pending" }
              : item
          )
        );
        message.success("Cập nhật phiếu nhập thành công");
      } else {
        // Tạo phiếu nhập mới
        const newImport: ImportRecord = {
          id: Math.max(...data.map((item) => item.id)) + 1,
          importCode: importData.importCode || "",
          supplierName: importData.supplierName || "",
          totalAmount: importData.totalAmount || 0,
          totalItems: importData.totalItems || 0,
          status: "pending",
          importDate: importData.importDate || "",
          receivedBy: importData.receivedBy || "",
          notes: importData.notes || "",
          items: importData.items || [],
        };
        setData([newImport, ...data]);
        message.success("Tạo phiếu nhập thành công");
      }

      setEditModalVisible(false);
      setSelectedRecord(null);
    } catch {
      message.error("Có lỗi xảy ra khi lưu phiếu nhập");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedRecord(null);
  };

  const handleCloseEditModal = () => {
    setEditModalVisible(false);
    setSelectedRecord(null);
  };

  return (
    <>
      <AdminTable
        title="Quản lý nhập kho"
        dataSource={data}
        columns={columns}
        loading={loading}
        onAdd={handleAdd}
        onView={handleView}
        addButtonText="Tạo phiếu nhập"
        searchable={true}
        searchPlaceholder="Tìm kiếm phiếu nhập theo mã, nhà cung cấp..."
        searchFields={["importCode", "supplierName", "receivedBy"]}
        actions={[
          {
            key: "edit",
            label: "Chỉnh sửa",
            type: "default",
            icon: <EditOutlined />,
            onClick: handleEdit,
            condition: (record: ImportRecord) =>
              record.status !== "completed" && record.status !== "cancelled",
          },
          {
            key: "approve",
            label: "Duyệt",
            type: "primary",
            icon: <CheckCircleOutlined />,
            onClick: handleApprove,
            condition: (record: ImportRecord) =>
              record.status === "pending" || record.status === "processing",
          },
          {
            key: "cancel",
            label: "Hủy",
            type: "default",
            danger: true,
            icon: <ExclamationCircleOutlined />,
            onClick: handleCancel,
            condition: (record: ImportRecord) =>
              record.status !== "completed" && record.status !== "cancelled",
          },
        ]}
        scroll={{ x: 1200 }}
      />

      {/* Modal xem chi tiết */}
      <ImportDetailModal
        visible={detailModalVisible}
        onClose={handleCloseDetailModal}
        record={selectedRecord}
      />

      {/* Modal chỉnh sửa/tạo mới */}
      <ImportEditModal
        visible={editModalVisible}
        onClose={handleCloseEditModal}
        onSave={handleSaveImport}
        record={selectedRecord}
        loading={loading}
      />
    </>
  );
};

export default ImportInventoryPage;
