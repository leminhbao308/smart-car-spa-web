"use client";
import React, {useState, useEffect} from "react";
import {AdminTable} from "@/components/ui/Table";
import {useConfirmationModalContext} from "@/components/ui/Modal";
import {
  ImportDetailModal,
  ImportEditModal,
} from "@/components/ui/Modal/ImportModal";
import {ColumnsType} from "antd/es/table";
import {Tag, Badge, message, Modal, DatePicker, Select, Space, Button} from "antd";
import {
  EyeOutlined,
  PlusOutlined,
  FileExcelOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import formatCurrency from "@/components/utils/helper/currency.format.helper";
import {PurchaseOrderService, CreatePORequest, PurchaseOrder, BranchDisplay} from "@/lib/api";
import {useBranches, usePurchaseOrder} from "@/lib/api/hooks";
import dayjs, {Dayjs} from "dayjs";

const {RangePicker} = DatePicker;

// Status mapping - chỉ còn RECEIVED vì tạo là nhập ngay
const purchaseOrderStatuses = [
  {value: "RECEIVED", label: "Đã nhập kho", color: "green"},
];

const ImportInventoryPage = () => {
  const [data, setData] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PurchaseOrder | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

  // Export form states
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | undefined>(undefined);
  const {branches, loading: branchesLoading} = useBranches({});

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

  const handleOpenExportModal = () => {
    // Set default date range to current month
    const startOfMonth = dayjs().startOf('month');
    const endOfMonth = dayjs().endOf('month');
    setDateRange([startOfMonth, endOfMonth]);
    setSelectedBranch(undefined);
    setExportModalVisible(true);
  };

  const handleExportReport = async () => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      message.error("Vui lòng chọn khoảng thời gian");
      return;
    }

    setExportLoading(true);
    try {
      const fromDate = dateRange[0].format('YYYY-MM-DD');
      const toDate = dateRange[1].format('YYYY-MM-DD');

      await PurchaseOrderService.exportPurchaseReport(
        fromDate,
        toDate,
        selectedBranch
      );

      message.success("Xuất báo cáo thành công");
      setExportModalVisible(false);
    } catch (error: any) {
      message.error(error?.message || "Có lỗi xảy ra khi xuất báo cáo");
    } finally {
      setExportLoading(false);
    }
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

  const handleCloseExportModal = () => {
    setExportModalVisible(false);
    setDateRange(null);
    setSelectedBranch(undefined);
  };

  return (
    <>
      <AdminTable
        title="Quản lý nhập kho"
        dataSource={data}
        columns={columns}
        loading={loading || purchaseOrderHook.loading || branchesLoading}
        onAdd={handleAdd}
        onView={handleView}
        addButtonText="Nhập hàng"
        searchable={true}
        searchPlaceholder="Tìm kiếm phiếu nhập theo chi nhánh, người tạo..."
        searchFields={["branch.branch_name", "created_by"]}
        scroll={{x: 1200}}
        extraButtons={[
          <Button
            key="export"
            type="default"
            icon={<FileExcelOutlined/>}
            onClick={handleOpenExportModal}
            style={{
              backgroundColor: "#10b981",
              borderColor: "#10b981",
              color: "white",
            }}
          >
            Xuất báo cáo Excel
          </Button>
        ]}
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

      {/* Modal xuất báo cáo */}
      <Modal
        title={
          <Space>
            <FileExcelOutlined style={{color: "#10b981"}}/>
            <span>Xuất báo cáo nhập hàng</span>
          </Space>
        }
        open={exportModalVisible}
        onCancel={handleCloseExportModal}
        footer={[
          <Button key="cancel" onClick={handleCloseExportModal}>
            Hủy
          </Button>,
          <Button
            key="export"
            type="primary"
            icon={<DownloadOutlined/>}
            loading={exportLoading}
            onClick={handleExportReport}
            style={{backgroundColor: "#10b981", borderColor: "#10b981"}}
          >
            Xuất Excel
          </Button>
        ]}
        width={500}
      >
        <Space direction="vertical" style={{width: "100%"}} size="large">
          <div>
            <label style={{display: "block", marginBottom: 8, fontWeight: 500}}>
              Khoảng thời gian <span style={{color: "red"}}>*</span>
            </label>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs])}
              format="DD/MM/YYYY"
              placeholder={["Từ ngày", "Đến ngày"]}
              style={{width: "100%"}}
            />
          </div>

          <div>
            <label style={{display: "block", marginBottom: 8, fontWeight: 500}}>
              Chi nhánh
            </label>
            <Select
              value={selectedBranch}
              onChange={setSelectedBranch}
              placeholder="Chọn chi nhánh"
              allowClear
              style={{width: "100%"}}
              options={branches.map(branch => ({
                value: branch.branch_id,
                label: branch.branch_name
              }))}
            />
            {!selectedBranch && (
              <div style={{fontSize: 12, color: "#6b7280", marginTop: 4}}>
                Để trống = xuất báo cáo toàn hệ thống
              </div>
            )}
          </div>

          <div style={{
            padding: 12,
            backgroundColor: "#f0f9ff",
            borderRadius: 6,
            border: "1px solid #bae6fd"
          }}>
            <div style={{fontSize: 12, color: "#0369a1"}}>
              <strong>Lưu ý:</strong>
              <ul style={{marginTop: 8, marginBottom: 0, paddingLeft: 20}}>
                <li>Báo cáo sẽ bao gồm tất cả phiếu nhập trong khoảng thời gian đã chọn</li>
                <li>Nếu không chọn chi nhánh, sẽ xuất báo cáo toàn hệ thống</li>
                <li>File Excel sẽ được tải xuống tự động</li>
              </ul>
            </div>
          </div>
        </Space>
      </Modal>
    </>
  );
};

export default ImportInventoryPage;
