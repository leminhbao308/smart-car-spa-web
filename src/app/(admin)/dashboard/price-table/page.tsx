"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Tag,
  Space,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Select,
  Input,
  Button,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ShopOutlined,
  CalendarOutlined,
  DollarOutlined,
  HistoryOutlined,
  FilterOutlined,
  ReloadOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import AdminTable from "@/components/ui/Table/AdminTable";
import {
  PriceTableEditModal,
  PriceTableDetailModal,
} from "@/components/ui/Modal";
import { useConfirmationModalContext } from "@/components/ui/Modal";
import {
  priceTablesData,
  branchesData,
  PriceTable,
  PRICE_TABLE_STATUSES,
  getBranchById,
} from "@/components/utils/data/price-table.data";

const { Text } = Typography;
const { Option } = Select;

const PriceTablePage = () => {
  const [data, setData] = useState<PriceTable[]>(priceTablesData);
  const [filteredData, setFilteredData] =
    useState<PriceTable[]>(priceTablesData);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<PriceTable | null>(null);
  const [viewingTable, setViewingTable] = useState<PriceTable | null>(null);
  const { showModal } = useConfirmationModalContext();

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<number | string>("");
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    undefined
  );
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  // Apply filters
  const applyFilters = useCallback(() => {
    let filtered = data;

    // Search filter
    if (searchText) {
      filtered = filtered.filter(
        (table) =>
          table.name.toLowerCase().includes(searchText.toLowerCase()) ||
          table.code.toLowerCase().includes(searchText.toLowerCase()) ||
          table.description?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Branch filter
    if (selectedBranch !== "") {
      filtered = filtered.filter((table) => table.branchId === selectedBranch);
    }

    // Status filter
    if (selectedStatus) {
      filtered = filtered.filter((table) => table.status === selectedStatus);
    }

    // Date range filter
    if (dateRange) {
      filtered = filtered.filter((table) => {
        const tableDate = new Date(table.effectiveDate);
        const startDate = new Date(dateRange[0]);
        const endDate = new Date(dateRange[1]);
        return tableDate >= startDate && tableDate <= endDate;
      });
    }

    setFilteredData(filtered);
  }, [data, searchText, selectedBranch, selectedStatus, dateRange]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const columns = [
    {
      title: "Bảng giá",
      dataIndex: "name",
      key: "name",
      width: 300,
      render: (text: string, record: PriceTable) => (
        <div style={{ padding: "8px 0" }}>
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 8 }}
          >
            <Text strong style={{ fontSize: 16, color: "#1890ff" }}>
              {text}
            </Text>
            {record.isDefault && (
              <Tag
                color="gold"
                style={{ marginLeft: 12, fontSize: 11, fontWeight: 500 }}
              >
                Mặc định
              </Tag>
            )}
          </div>
          <div style={{ marginBottom: 6 }}>
            <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>
              Mã: {record.code}
            </Text>
          </div>
          <Text type="secondary" style={{ fontSize: 12, lineHeight: 1.4 }}>
            {record.description}
          </Text>
        </div>
      ),
    },
    {
      title: "Chi nhánh",
      dataIndex: "branchId",
      key: "branchId",
      width: 200,
      render: (branchId: number | null) => {
        if (branchId === null) {
          return (
            <div style={{ padding: "8px 0" }}>
              <Space>
                <ShopOutlined style={{ color: "#52c41a", fontSize: 16 }} />
                <Text strong style={{ fontSize: 14, color: "#52c41a" }}>
                  Toàn hệ thống
                </Text>
              </Space>
            </div>
          );
        }
        const branch = getBranchById(branchId);
        return (
          <div style={{ padding: "8px 0" }}>
            <Space direction="vertical" size={4}>
              <Space>
                <ShopOutlined style={{ color: "#1890ff", fontSize: 16 }} />
                <Text strong style={{ fontSize: 14 }}>
                  {branch?.name}
                </Text>
              </Space>
            </Space>
          </div>
        );
      },
    },
    {
      title: "Ngày hiệu lực",
      dataIndex: "effectiveDate",
      key: "effectiveDate",
      width: 140,
      render: (date: string) => (
        <div style={{ padding: "8px 0" }}>
          <Space>
            <CalendarOutlined style={{ color: "#fa8c16", fontSize: 16 }} />
            <Text style={{ fontSize: 14, fontWeight: 500 }}>{date}</Text>
          </Space>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status: string) => {
        const statusInfo = PRICE_TABLE_STATUSES.find((s) => s.value === status);
        return (
          <div style={{ padding: "8px 0" }}>
            <Tag
              color={statusInfo?.color}
              style={{
                fontSize: 12,
                fontWeight: 500,
                padding: "4px 12px",
                borderRadius: 6,
              }}
            >
              {statusInfo?.label}
            </Tag>
          </div>
        );
      },
    },
  ];

  const actions = [
    {
      key: "view",
      label: "Xem chi tiết",
      icon: <EyeOutlined />,
      onClick: (record: PriceTable) => {
        setViewingTable(record);
        setDetailModalOpen(true);
      },
    },
    {
      key: "edit",
      label: "Chỉnh sửa",
      icon: <EditOutlined />,
      onClick: (record: PriceTable) => {
        setEditingTable(record);
        setModalOpen(true);
      },
    },
    {
      key: "deactivate",
      label: "Ngừng áp dụng",
      icon: <DeleteOutlined />,
      danger: true,
      condition: (record: PriceTable) => record.status === "active",
      onClick: (record: PriceTable) => {
        showModal({
          title: "Xác nhận ngừng áp dụng",
          content: `Bạn có chắc chắn muốn ngừng áp dụng bảng giá "${record.name}"?`,
          type: "warning",
          onConfirm: () => {
            setData(
              data.map((item) =>
                item.id === record.id
                  ? { ...item, status: "inactive" as const }
                  : item
              )
            );
          },
        });
      },
    },
    {
      key: "activate",
      label: "Kích hoạt",
      icon: <EditOutlined />,
      condition: (record: PriceTable) => record.status === "inactive",
      onClick: (record: PriceTable) => {
        showModal({
          title: "Xác nhận kích hoạt",
          content: `Bạn có chắc chắn muốn kích hoạt bảng giá "${record.name}"?`,
          type: "success",
          onConfirm: () => {
            setData(
              data.map((item) =>
                item.id === record.id
                  ? { ...item, status: "active" as const }
                  : item
              )
            );
          },
        });
      },
    },
  ];

  const handleAddNew = () => {
    setEditingTable(null);
    setModalOpen(true);
  };

  const handleModalOk = (tableData: PriceTable) => {
    if (editingTable) {
      // Cập nhật bảng giá
      setData(
        data.map((item) =>
          item.id === editingTable.id
            ? { ...tableData, id: editingTable.id }
            : item
        )
      );
    } else {
      // Thêm bảng giá mới
      setData([...data, tableData]);
    }
    setModalOpen(false);
    setEditingTable(null);
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setEditingTable(null);
  };

  const handleDetailModalCancel = () => {
    setDetailModalOpen(false);
    setViewingTable(null);
  };

  const handleResetFilters = () => {
    setSearchText("");
    setSelectedBranch("");
    setSelectedStatus(undefined);
    setDateRange(null);
  };

  // Statistics
  const totalTables = data.length;
  const activeTables = data.filter((t) => t.status === "active").length;
  const totalServices = data.reduce((sum, t) => sum + t.services.length, 0);
  const totalProducts = data.reduce((sum, t) => sum + t.products.length, 0);
  const totalServicePackages = data.reduce(
    (sum, t) => sum + t.servicePackages.length,
    0
  );
  const totalDiscountPrograms = data.reduce(
    (sum, t) => sum + t.discountPrograms.length,
    0
  );

  return (
    <div>
      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={4}>
          <Card>
            <Statistic
              title="Tổng bảng giá"
              value={totalTables}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Đang áp dụng"
              value={activeTables}
              prefix={<ShopOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Dịch vụ"
              value={totalServices}
              prefix={<HistoryOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Sản phẩm"
              value={totalProducts}
              prefix={<ShopOutlined />}
              valueStyle={{ color: "#13c2c2" }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Gói dịch vụ"
              value={totalServicePackages}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Chương trình giảm giá"
              value={totalDiscountPrograms}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#eb2f96" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card title="Bộ lọc" style={{ marginBottom: 24 }} size="small">
        <Row gutter={[16, 8]}>
          <Col span={6}>
            <Input
              placeholder="Tìm kiếm bảng giá..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<FilterOutlined />}
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="Chọn chi nhánh"
              value={selectedBranch}
              onChange={setSelectedBranch}
              allowClear
              style={{ width: "100%" }}
            >
              <Option value="">Toàn hệ thống</Option>
              {branchesData.map((branch) => (
                <Option key={branch.id} value={branch.id}>
                  {branch.name} ({branch.code})
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Select
              placeholder="Chọn trạng thái"
              value={selectedStatus}
              onChange={setSelectedStatus}
              allowClear
              style={{ width: "100%" }}
            >
              {PRICE_TABLE_STATUSES.map((status) => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={handleResetFilters}>
                Xóa bộ lọc
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Card
        title={
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            width: "100%"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <DollarOutlined style={{ color: "#1890ff", fontSize: 18 }} />
              <span style={{ fontSize: 16, fontWeight: 600 }}>
                Quản lý bảng giá
              </span>
            </div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAddNew}
            >
              Thêm bảng giá mới
            </Button>
          </div>
        }
        style={{
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          borderRadius: 8,
        }}
      >
        <AdminTable
          dataSource={filteredData}
          columns={columns}
          actions={actions}
          showAddButton={false}
          searchable={false}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total: number, range: [number, number]) =>
              `${range[0]}-${range[1]} của ${total} bảng giá`,
            style: { marginTop: 16 },
          }}
        />
      </Card>

      {/* Modals */}
      <PriceTableEditModal
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        initialData={editingTable}
        title={editingTable ? "Chỉnh sửa bảng giá" : "Thêm bảng giá mới"}
      />

      <PriceTableDetailModal
        open={detailModalOpen}
        onCancel={handleDetailModalCancel}
        priceTable={viewingTable}
      />
    </div>
  );
};

export default PriceTablePage;
