"use client";
import React, {useState, useEffect} from "react";
import {AdminTable} from "@/components/ui/Table";
import {useConfirmationModalContext} from "@/components/ui/Modal";
import {
  ImportDetailModal,
  ImportEditModal,
} from "@/components/ui/Modal/ImportModal";
import {ColumnsType} from "antd/es/table";
import {Tag, Badge, message} from "antd";
import {
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import formatCurrency from "@/components/utils/helper/currency.format.helper";
import {PurchaseOrderService, CreatePORequest, PurchaseOrder} from "@/lib/api";
import {usePurchaseOrder} from "@/lib/api/hooks";

// Status mapping - chỉ còn RECEIVED vì tạo là nhập ngay
const purchaseOrderStatuses = [
  {value: "RECEIVED", label: "Đã nhập kho", color: "green"},
];

const ImportInventoryPage = () => {
  const [data, setData] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PurchaseOrder | null>(null);
  const {showModal} = useConfirmationModalContext();
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
        <div style={{fontSize: 12}}>{id.substring(0, 8)}...</div>
      ),
    },
    {
      title: "Chi nhánh",
      key: "branch",
      width: 150,
      render: (_, record) => record.branch?.branch_name || "N/A",
    },
    {
      title: "Tổng loại sản phẩm",
      key: "totalItems",
      width: 120,
      render: (_, record) => (
        <div>
          <Badge
            count={record.lines?.length || 0}
            style={{backgroundColor: "#1890ff"}}
          />
          <span style={{marginLeft: 8, fontSize: 12}}> sản phẩm</span>
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
        return <div style={{fontWeight: 500}}>{total}</div>;
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
          <div style={{fontWeight: 500, color: "#52c41a"}}>
            {formatCurrency(total || 0)}
          </div>
        );
      },
    },
    {
      title: "Ngày nhập",
      dataIndex: "created_date",
      key: "created_date",
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
      sorter: (a, b) =>
        new Date(a.created_date).getTime() - new Date(b.created_date).getTime(),
      defaultSortOrder: "descend",
    },
  ];

  // Handlers
  const handleAdd = () => {
    setSelectedRecord(null);
    setEditModalVisible(true);
  };

  const handleView = (record: PurchaseOrder) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  // Modal handlers
  const handleSaveImport = async (importData: CreatePORequest) => {
    setLoading(true);
    try {
      // Tạo phiếu nhập mới - nhập hàng ngay lập tức
      await purchaseOrderHook.createPO(importData);
      await fetchAllPurchaseOrders();
      message.success("Nhập hàng thành công");
      setEditModalVisible(false);
      setSelectedRecord(null);
    } catch (error: any) {
      message.error(error?.message || "Có lỗi xảy ra khi nhập hàng");
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
        addButtonText="Nhập hàng"
        searchable={true}
        searchPlaceholder="Tìm kiếm phiếu nhập theo chi nhánh, người tạo..."
        searchFields={["branch.branch_name", "created_by"]}
        actions={[
          {
            key: "viewDetail",
            label: "Xem chi tiết",
            type: "link",
            icon: <EyeOutlined/>,
            onClick: handleView,
          },
        ]}
        scroll={{x: 1200}}
      />

      {/* Modal xem chi tiết */}
      <ImportDetailModal
        visible={detailModalVisible}
        onClose={handleCloseDetailModal}
        record={selectedRecord}
      />

      {/* Modal nhập hàng mới */}
      <ImportEditModal
        visible={editModalVisible}
        onClose={handleCloseEditModal}
        onSave={handleSaveImport}
        record={null}
        loading={loading}
      />
    </>
  );
};

export default ImportInventoryPage;
