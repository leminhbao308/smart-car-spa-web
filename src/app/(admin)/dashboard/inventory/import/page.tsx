"use client";
import React, { useState, useEffect } from "react";
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
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import formatCurrency from "@/components/utils/helper/currency.format.helper";
import { PurchaseOrderService, CreatePORequest, PurchaseOrder } from "@/lib/api";
import {usePurchaseOrder} from "@/lib/api/hooks";

// Status mapping
const purchaseOrderStatuses = [
  { value: "DRAFT", label: "Nháp", color: "default" },
  { value: "PENDING_DELIVERY", label: "Chờ giao hàng", color: "orange" },
  { value: "RECEIVED", label: "Đã nhận hàng", color: "green" },
  { value: "CANCELLED", label: "Đã hủy", color: "red" },
];

const ImportInventoryPage = () => {
  const [data, setData] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PurchaseOrder | null>(null);
  const { showModal } = useConfirmationModalContext();
  const purchaseOrderHook = usePurchaseOrder();

  // Fetch all purchase orders on mount
  useEffect(() => {
    fetchAllPurchaseOrders();
  }, []);

  const fetchAllPurchaseOrders = async () => {
    setLoading(true);
    try {
      const orders = await PurchaseOrderService.getAllPurchaseOrders();
      setData(orders);
    } catch (error: any) {
      message.error(error?.message || "Không thể tải danh sách phiếu nhập");
    } finally {
      setLoading(false);
    }
  };

  // Định nghĩa columns
  const columns: ColumnsType<PurchaseOrder> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 100,
      ellipsis: true,
      render: (id: string) => (
        <div style={{ fontSize: 12 }}>{id.substring(0, 8)}...</div>
      ),
    },
    {
      title: "Chi nhánh",
      key: "branch",
      width: 150,
      render: (_, record) => record.branch?.branch_name || "N/A",
    },
    {
      title: "Kho",
      key: "warehouse",
      width: 120,
      render: (_, record) => record.warehouse?.id?.substring(0, 8) || "N/A",
    },
    {
      title: "Tổng số sản phẩm",
      key: "totalItems",
      width: 120,
      render: (_, record) => (
        <div>
          <Badge
            count={record.lines?.length || 0}
            style={{ backgroundColor: "#1890ff" }}
          />
          <span style={{ marginLeft: 8, fontSize: 12 }}> sản phẩm</span>
        </div>
      ),
    },
    {
      title: "Tổng số lượng",
      key: "totalQuantity",
      width: 120,
      render: (_, record) => {
        const total = record.lines?.reduce(
          (sum, line) => sum + (line.qty_ordered || 0),
          0
        );
        return <div style={{ fontWeight: 500 }}>{total}</div>;
      },
    },
    {
      title: "Tổng tiền",
      key: "totalAmount",
      width: 140,
      sorter: (a, b) => {
        const totalA = a.lines?.reduce(
          (sum, line) => sum + line.qty_ordered * line.unit_cost,
          0
        ) || 0;
        const totalB = b.lines?.reduce(
          (sum, line) => sum + line.qty_ordered * line.unit_cost,
          0
        ) || 0;
        return totalA - totalB;
      },
      render: (_, record) => {
        const total = record.lines?.reduce(
          (sum, line) => sum + line.qty_ordered * line.unit_cost,
          0
        );
        return (
          <div style={{ fontWeight: 500, color: "#52c41a" }}>
            {formatCurrency(total || 0)}
          </div>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status: string) => {
        const statusConfig = purchaseOrderStatuses.find((s) => s.value === status);
        return <Tag color={statusConfig?.color}>{statusConfig?.label}</Tag>;
      },
      filters: purchaseOrderStatuses.map((status) => ({
        text: status.label,
        value: status.value,
      })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Ngày dự kiến",
      dataIndex: "expected_at",
      key: "expected_at",
      width: 120,
      render: (date: string) => date ? new Date(date).toLocaleDateString("vi-VN") : "N/A",
      sorter: (a, b) =>
        new Date(a.expected_at).getTime() - new Date(b.expected_at).getTime(),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_date",
      key: "created_date",
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
      sorter: (a, b) =>
        new Date(a.created_date).getTime() - new Date(b.created_date).getTime(),
    },
    {
      title: "Người tạo",
      dataIndex: "created_by",
      key: "created_by",
      width: 120,
      ellipsis: true,
    },
  ];

  // Handlers
  const handleAdd = () => {
    setSelectedRecord(null);
    setEditModalVisible(true);
  };

  const handleEdit = (record: PurchaseOrder) => {
    // Không cho phép chỉnh sửa khi đã nhận hàng hoặc đã hủy
    if (record.status === "RECEIVED" || record.status === "CANCELLED") {
      message.warning("Không thể chỉnh sửa phiếu nhập đã nhận hàng hoặc đã hủy");
      return;
    }
    setSelectedRecord(record);
    setEditModalVisible(true);
  };

  const handleView = (record: PurchaseOrder) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  const handleSubmit = async (record: PurchaseOrder) => {
    if (record.status !== "DRAFT") {
      message.warning("Chỉ có thể gửi phiếu nhập ở trạng thái nháp");
      return;
    }

    showModal({
      title: "Gửi phiếu nhập",
      content: `Bạn có chắc chắn muốn gửi phiếu nhập này?`,
      type: "warning",
      onConfirm: async () => {
        setLoading(true);
        try {
          await purchaseOrderHook.submit(record.id);
          await fetchAllPurchaseOrders();
          message.success("Gửi phiếu nhập thành công");
        } catch (error: any) {
          message.error(error?.message || "Gửi phiếu nhập thất bại");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleReceive = async (record: PurchaseOrder) => {
    if (record.status !== "PENDING_DELIVERY") {
      message.warning("Chỉ có thể nhận hàng khi phiếu đang chờ giao");
      return;
    }

    showModal({
      title: "Nhận hàng",
      content: `Bạn có chắc chắn đã nhận đủ hàng theo phiếu nhập này?`,
      type: "warning",
      onConfirm: async () => {
        setLoading(true);
        try {
          await purchaseOrderHook.receive(record.id);
          await fetchAllPurchaseOrders();
          message.success("Nhận hàng thành công");
        } catch (error: any) {
          message.error(error?.message || "Nhận hàng thất bại");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleCancel = (record: PurchaseOrder) => {
    if (record.status === "RECEIVED") {
      message.warning("Không thể hủy phiếu nhập đã nhận hàng");
      return;
    }

    showModal({
      title: "Hủy phiếu nhập",
      content: `Bạn có chắc chắn muốn hủy phiếu nhập này?`,
      type: "error",
      onConfirm: async () => {
        setLoading(true);
        try {
          await purchaseOrderHook.cancel(record.id);
          await fetchAllPurchaseOrders();
          message.success("Hủy phiếu nhập thành công");
        } catch (error: any) {
          message.error(error?.message || "Hủy phiếu nhập thất bại");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Modal handlers
  const handleSaveImport = async (importData: CreatePORequest) => {
    setLoading(true);
    try {
      if (selectedRecord) {
        // Cập nhật: Cần API update (hiện tại chưa có trong service)
        message.warning("Chức năng cập nhật phiếu nhập chưa được hỗ trợ");
      } else {
        // Tạo phiếu nhập mới
        await purchaseOrderHook.createDraft(importData);
        await fetchAllPurchaseOrders();
        message.success("Tạo phiếu nhập thành công");
      }

      setEditModalVisible(false);
      setSelectedRecord(null);
    } catch (error: any) {
      message.error(error?.message || "Có lỗi xảy ra khi lưu phiếu nhập");
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
        loading={loading || purchaseOrderHook.loading}
        onAdd={handleAdd}
        onView={handleView}
        addButtonText="Tạo phiếu nhập"
        searchable={true}
        searchPlaceholder="Tìm kiếm phiếu nhập theo chi nhánh, người tạo..."
        searchFields={["branch.branch_name", "created_by"]}
        actions={[
          {
            key: "view",
            label: "Xem",
            type: "default",
            icon: <EyeOutlined />,
            onClick: handleView,
          },
          {
            key: "edit",
            label: "Chỉnh sửa",
            type: "default",
            icon: <EditOutlined />,
            onClick: handleEdit,
            condition: (record: PurchaseOrder) =>
              record.status === "DRAFT",
          },
          {
            key: "submit",
            label: "Gửi đơn",
            type: "primary",
            icon: <CheckCircleOutlined />,
            onClick: handleSubmit,
            condition: (record: PurchaseOrder) =>
              record.status === "DRAFT",
          },
          {
            key: "receive",
            label: "Nhận hàng",
            type: "primary",
            icon: <CheckCircleOutlined />,
            onClick: handleReceive,
            condition: (record: PurchaseOrder) =>
              record.status === "PENDING_DELIVERY",
          },
          {
            key: "cancel",
            label: "Hủy",
            type: "default",
            danger: true,
            icon: <ExclamationCircleOutlined />,
            onClick: handleCancel,
            condition: (record: PurchaseOrder) =>
              record.status !== "RECEIVED" && record.status !== "CANCELLED",
          },
        ]}
        scroll={{ x: 1400 }}
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
