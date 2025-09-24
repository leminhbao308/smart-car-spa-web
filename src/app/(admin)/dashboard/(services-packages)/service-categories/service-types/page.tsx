"use client";
import React, { useState, useMemo } from "react";
import { AdminTable } from "@/components/ui/Table";
import {
  useConfirmationModalContext,
  ServiceTypeDetailModal,
  ServiceTypeEditModal,
} from "@/components/ui/Modal";
import { ColumnsType } from "antd/es/table";
import { Tag, Card, Row, Col, Select, Input, Button, Space } from "antd";
import { FilterOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  serviceTypesData,
  serviceTypeStatuses,
} from "@/components/utils/data/service-types.data";

const { Search } = Input;
const { Option } = Select;

const ServiceTypesPage = () => {
  const [serviceTypeData, setServiceTypeData] = useState(serviceTypesData);
  const [loading, setLoading] = useState(false);
  const { showModal } = useConfirmationModalContext();

  // Modal states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [editData, setEditData] = useState<any>(null);

  // Filter states
  const [filters, setFilters] = useState<{
    status?: string;
    searchText?: string;
  }>({
    status: undefined,
    searchText: undefined,
  });

  // Filtered data
  const filteredData = useMemo(() => {
    let filtered = [...serviceTypeData];

    // Search filter
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.serviceTypeName.toLowerCase().includes(searchLower) ||
          item.serviceTypeCode.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((item) => item.status === filters.status);
    }

    return filtered;
  }, [serviceTypeData, filters]);

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      status: undefined,
      searchText: undefined,
    });
  };

  // Định nghĩa columns cho loại dịch vụ
  const serviceTypeColumns: ColumnsType<any> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Icon",
      dataIndex: "icon",
      key: "icon",
      width: 80,
      render: (icon: string) => (
        <div
          style={{
            fontSize: 24,
            textAlign: "center",
            padding: "8px",
            backgroundColor: "#f5f5f5",
            borderRadius: "6px",
            width: "50px",
            height: "50px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
      ),
    },
    {
      title: "Tên loại dịch vụ",
      key: "serviceType",
      width: 300,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>
            {record.serviceTypeName}
          </div>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>
            {record.serviceTypeCode}
          </div>
          <div style={{ fontSize: 11, color: "#999", lineHeight: 1.3 }}>
            {record.description}
          </div>
        </div>
      ),
    },
    {
      title: "Dịch vụ",
      key: "services",
      width: 120,
      render: (_, record) => (
        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 500,
              color: "#1890ff",
              marginBottom: 2,
            }}
          >
            {record.totalServices}
          </div>
          <div style={{ fontSize: 12, color: "#666" }}>
            <span style={{ fontSize: 12 }}>Dịch vụ</span>
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => {
        const statusConfig = serviceTypeStatuses.find(
          (s) => s.value === status
        );
        return <Tag color={statusConfig?.color}>{statusConfig?.label}</Tag>;
      },
      filters: serviceTypeStatuses.map((status) => ({
        text: status.label,
        value: status.value,
      })),
      onFilter: (value, record) => record.status === value,
    },
  ];

  // Handlers
  const handleAdd = () => {
    setEditData(null);
    setEditModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditData(record);
    setEditModalVisible(true);
  };

  const handleView = (record: any) => {
    setSelectedData(record);
    setDetailModalVisible(true);
  };

  const handleEditModalSuccess = (data: any) => {
    if (editData) {
      // Update existing service type
      setServiceTypeData(
        serviceTypeData.map((item) => (item.id === data.id ? data : item))
      );
    } else {
      // Add new service type
      const newServiceType = {
        ...data,
        id: Math.max(...serviceTypeData.map((s) => s.id)) + 1,
        totalServices: 0,
        createdAt: new Date().toISOString(),
      };
      setServiceTypeData([...serviceTypeData, newServiceType]);
    }
    setEditModalVisible(false);
    setEditData(null);
  };

  const handleToggleStatus = (record: any) => {
    const action = record.status === "active" ? "vô hiệu hóa" : "kích hoạt";
    showModal({
      title: `${
        action === "vô hiệu hóa" ? "Vô hiệu hóa" : "Kích hoạt"
      } loại dịch vụ`,
      content: `Bạn có chắc chắn muốn ${action} loại dịch vụ ${record.serviceTypeName}?`,
      type: "warning",
      onConfirm: async () => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setServiceTypeData(
          serviceTypeData.map((item) =>
            item.id === record.id
              ? {
                  ...item,
                  status: item.status === "active" ? "inactive" : "active",
                }
              : item
          )
        );
        setLoading(false);
      },
    });
  };

  return (
    <div>
      {/* Advanced Filters */}
      <Card
        title={
          <Space>
            <FilterOutlined />
            Bộ lọc nâng cao
          </Space>
        }
        style={{ marginBottom: 16 }}
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={handleResetFilters}
            size="small"
          >
            Đặt lại
          </Button>
        }
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "#666",
                  marginBottom: 4,
                  display: "block",
                }}
              >
                Tìm kiếm
              </label>
              <Search
                placeholder="Tên, mã loại dịch vụ..."
                value={filters.searchText}
                onChange={(e) =>
                  setFilters({ ...filters, searchText: e.target.value })
                }
                allowClear
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "#666",
                  marginBottom: 4,
                  display: "block",
                }}
              >
                Trạng thái
              </label>
              <Select
                placeholder="Chọn trạng thái"
                value={filters.status}
                onChange={(value) => setFilters({ ...filters, status: value })}
                allowClear
                style={{ width: "100%" }}
              >
                {serviceTypeStatuses.map((status) => (
                  <Option key={status.value} value={status.value}>
                    {status.label}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
        </Row>
      </Card>

      <AdminTable
        title="Quản lý loại dịch vụ"
        dataSource={filteredData}
        columns={serviceTypeColumns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        addButtonText="Thêm loại dịch vụ"
        searchable={false}
        actions={[
          {
            key: "toggle-status",
            label: (record: any) =>
              record.status === "active" ? "Vô hiệu hóa" : "Kích hoạt",
            type: "default",
            danger: (record: any) => record.status === "active",
            onClick: handleToggleStatus,
          },
        ]}
        scroll={{ x: 1200 }}
      />

      {/* Modals */}
      <ServiceTypeDetailModal
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        data={selectedData}
      />

      <ServiceTypeEditModal
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onSuccess={handleEditModalSuccess}
        editData={editData}
      />
    </div>
  );
};

export default ServiceTypesPage;
