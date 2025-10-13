"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { AdminTable } from "@/components/ui/Table";
import {
  useConfirmationModalContext,
  ServicePackageTypeDetailModal,
  ServicePackageTypeModal,
} from "@/components/ui/Modal";
import { ColumnsType } from "antd/es/table";
import { Tag, Card, Row, Col, Select, Input, Button, Space, App } from "antd";
import { FilterOutlined, ReloadOutlined } from "@ant-design/icons";
import { ServicePackageType } from "@/lib/api/types/service-package-type.types";
import { servicePackageTypeService } from "@/lib/api/services/service-package-type.service";

const { Search } = Input;
const { Option } = Select;

const ServicePackageTypesPage = () => {
  const { message } = App.useApp();
  const [packageTypeData, setPackageTypeData] = useState<ServicePackageType[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [tableKey, setTableKey] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const { showModal } = useConfirmationModalContext();

  // Modal states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedData, setSelectedData] = useState<ServicePackageType | null>(
    null
  );
  const [editData, setEditData] = useState<ServicePackageType | null>(null);

  // Filter states
  const [filters, setFilters] = useState<{
    status?: string;
    customerType?: string;
    searchText?: string;
  }>({
    status: undefined,
    customerType: undefined,
    searchText: undefined,
  });

  // Load package types data
  const loadPackageTypes = useCallback(
    async (page: number = 0, size: number = 10) => {
      try {
        setLoading(true);
        console.log("Loading service package types...", { page, size });
        const response =
          await servicePackageTypeService.getAllServicePackageTypes({
            page,
            size,
          });

        console.log(
          "Service package types loaded:",
          response.data?.content?.length,
          "items"
        );
        setPackageTypeData(response.data?.content || []);
        setPagination({
          current: (response.data?.number || 0) + 1,
          pageSize: response.data?.size || 10,
          total: response.data?.totalElements || 0,
        });
      } catch (error) {
        message.error("Không thể tải danh sách loại gói dịch vụ");
        console.error("Error loading service package types:", error);
      } finally {
        setLoading(false);
      }
    },
    [message]
  );

  // Refresh data function
  const refreshData = async () => {
    try {
      console.log("Refreshing data...");
      await loadPackageTypes(pagination.current - 1, pagination.pageSize);
      setTableKey((prev) => prev + 1);
      console.log("Data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      message.error("Không thể làm mới dữ liệu");
    }
  };

  useEffect(() => {
    loadPackageTypes();
  }, [loadPackageTypes]);

  // Filtered data
  const filteredData = useMemo(() => {
    let filtered = [...packageTypeData];

    // Search filter
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.code.toLowerCase().includes(searchLower) ||
          item.name.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower) ||
          item.applicable_customer_type?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(
        (item) => item.is_active === (filters.status === "active")
      );
    }

    // Customer type filter
    if (filters.customerType) {
      filtered = filtered.filter(
        (item) => item.applicable_customer_type === filters.customerType
      );
    }

    return filtered;
  }, [packageTypeData, filters]);

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      status: undefined,
      customerType: undefined,
      searchText: undefined,
    });
  };

  // Định nghĩa columns cho loại gói dịch vụ
  const packageTypeColumns: ColumnsType<ServicePackageType> = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center",
      render: (_, __, index) => {
        const currentPage = pagination?.current || 1;
        const pageSize = pagination?.pageSize || 10;
        return (currentPage - 1) * pageSize + index + 1;
      },
    },
    {
      title: "Mã loại",
      dataIndex: "code",
      key: "code",
      width: 120,
      render: (code: string) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 14 }}>{code}</div>
        </div>
      ),
    },
    {
      title: "Tên loại gói",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (name: string) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>
            {name}
          </div>
        </div>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 150,
      render: (value: string, record: ServicePackageType) => (
        <div style={{ fontSize: 12, color: "#666" }}>{record.description}</div>
      ),
    },
    {
      title: "Loại khách hàng",
      dataIndex: "applicable_customer_type",
      key: "applicable_customer_type",
      width: 150,
      render: (customerType: string) => <Tag color="green">{customerType}</Tag>,
    },
    {
      title: "Trạng thái",
      key: "isActive",
      width: 120,
      render: (_, record: ServicePackageType) => (
        <div>
          <Tag color={record.is_active ? "green" : "red"}>
            {record.is_active ? "Hoạt động" : "Không hoạt động"}
          </Tag>
        </div>
      ),
      filters: [
        { text: "Hoạt động", value: "active" },
        { text: "Không hoạt động", value: "inactive" },
      ],
      onFilter: (value, record) => {
        return record.is_active === (value === "active");
      },
    },
  ];

  // Handlers
  const handleAdd = () => {
    setEditData(null);
    setEditModalVisible(true);
  };

  const handleEdit = (record: ServicePackageType) => {
    setEditData(record);
    setEditModalVisible(true);
  };

  const handleView = (record: ServicePackageType) => {
    setSelectedData(record);
    setDetailModalVisible(true);
  };

  const handleEditModalSuccess = () => {
    setEditModalVisible(false);
    setEditData(null);
    loadPackageTypes(pagination.current - 1, pagination.pageSize);
    setTableKey((prev) => prev + 1);
  };

  const handleToggleStatus = (record: ServicePackageType) => {
    const action = record.is_active ? "ngừng hoạt động" : "kích hoạt";
    showModal({
      title: record.is_active ? "Ngừng hoạt động" : "Kích hoạt",
      content: `Bạn có chắc chắn muốn ${action} loại gói dịch vụ ${record.name}?`,
      type: record.is_active ? "warning" : "success",
      onConfirm: async () => {
        try {
          await servicePackageTypeService.updateServicePackageTypeStatus(
            record.service_package_type_id,
            { is_active: !record.is_active }
          );
          message.success(`${action} loại gói dịch vụ thành công!`);
          loadPackageTypes(pagination.current - 1, pagination.pageSize);
        } catch (error) {
          message.error(`Có lỗi xảy ra khi ${action} loại gói dịch vụ`);
          console.error("Error updating package type status:", error);
        }
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
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={refreshData}
              size="small"
              loading={loading}
            >
              Làm mới
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleResetFilters}
              size="small"
            >
              Đặt lại
            </Button>
          </Space>
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
                placeholder="Mã, tên loại gói..."
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
                <Option value="active">Hoạt động</Option>
                <Option value="inactive">Không hoạt động</Option>
              </Select>
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
                Loại khách hàng
              </label>
              <Select
                placeholder="Chọn loại khách hàng"
                value={filters.customerType}
                onChange={(value) =>
                  setFilters({ ...filters, customerType: value })
                }
                allowClear
                style={{ width: "100%" }}
              >
                <Option value="INDIVIDUAL">Cá nhân</Option>
                <Option value="ENTERPRISE">Doanh nghiệp</Option>
                <Option value="ALL">Tất cả</Option>
              </Select>
            </div>
          </Col>
        </Row>
      </Card>

      <AdminTable
        key={tableKey}
        title="Quản lý loại gói dịch vụ"
        dataSource={filteredData}
        columns={packageTypeColumns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        actions={[
          {
            key: "toggle-status",
            label: (record: ServicePackageType) =>
              record.is_active ? "Ngừng hoạt động" : "Kích hoạt",
            type: "default",
            danger: (record: ServicePackageType) => record.is_active,
            onClick: handleToggleStatus,
          },
        ]}
        onView={handleView}
        addButtonText="Thêm loại gói dịch vụ"
        searchable={false}
        scroll={{ x: 1200 }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: number, range: [number, number]) =>
            `${range[0]}-${range[1]} của ${total} loại gói dịch vụ`,
          onChange: (page: number, pageSize?: number) => {
            loadPackageTypes(page - 1, pageSize || 10);
          },
        }}
      />

      {/* Modals */}
      <ServicePackageTypeDetailModal
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        data={selectedData}
      />

      <ServicePackageTypeModal
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onSuccess={handleEditModalSuccess}
        editData={editData || undefined}
      />
    </div>
  );
};

export default ServicePackageTypesPage;
