"use client";
import React, { useState, useMemo } from "react";
import { AdminTable } from "@/components/ui/Table";
import {
  ServiceTypeDetailModal,
  ServiceTypeEditModal,
} from "@/components/ui/Modal";
import { ColumnsType } from "antd/es/table";
import {
  Tag,
  Card,
  Row,
  Col,
  Select,
  Input,
  Button,
  Space,
  message,
} from "antd";
import { FilterOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  ServiceType,
  SERVICE_TYPE_STATUS_OPTIONS,
} from "@/lib/api/types/service-type.types";
import {
  useServiceTypes,
  useCreateServiceType,
  useUpdateServiceType,
} from "@/lib/api/hooks/useServiceTypes";

const { Search } = Input;
const { Option } = Select;

const ServiceTypesPage = () => {
  // React Query hooks
  const { data: serviceTypesData, isLoading } = useServiceTypes({});
  const createServiceTypeMutation = useCreateServiceType();
  const updateServiceTypeMutation = useUpdateServiceType();

  // Modal states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedData, setSelectedData] = useState<ServiceType | null>(null);
  const [editData, setEditData] = useState<ServiceType | null>(null);

  // Filter states
  const [filters, setFilters] = useState<{
    status?: string;
    searchText?: string;
  }>({
    status: undefined,
    searchText: undefined,
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Extract data from response
  const serviceTypes = useMemo(() => {
    return serviceTypesData?.data?.content || [];
  }, [serviceTypesData]);

  // Update pagination when data changes
  React.useEffect(() => {
    if (serviceTypesData?.data) {
      setPagination((prev) => ({
        ...prev,
        total: serviceTypesData.data.totalElements || 0,
      }));
    }
  }, [serviceTypesData]);

  // Reset pagination when filters change
  React.useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  }, [filters]);

  // Filtered data - simple UI filtering
  const filteredData = useMemo(() => {
    let filtered = [...serviceTypes];

    // Search filter
    if (filters.searchText?.trim()) {
      const searchLower = filters.searchText.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        // Search in name
        const nameMatch = item.name.toLowerCase().includes(searchLower);
        // Search in code
        const codeMatch = item.code.toLowerCase().includes(searchLower);
        // Search in display_name if exists
        const displayNameMatch =
          item.display_name?.toLowerCase().includes(searchLower) || false;
        // Search in description if exists
        const descriptionMatch =
          item.description?.toLowerCase().includes(searchLower) || false;

        return nameMatch || codeMatch || displayNameMatch || descriptionMatch;
      });
    }

    // Status filter
    if (filters.status) {
      const isActive = filters.status === "true";
      filtered = filtered.filter((item) => item.is_active === isActive);
    }

    return filtered;
  }, [serviceTypes, filters.searchText, filters.status]);

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      status: undefined,
      searchText: undefined,
    });
  };

  // Get active filters count for display
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchText?.trim()) count++;
    if (filters.status) count++;
    return count;
  };

  // Định nghĩa columns cho loại dịch vụ
  const serviceTypeColumns: ColumnsType<ServiceType> = [
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
      title: "Tên loại dịch vụ",
      key: "name",
      width: 350,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>
            {record.name}
          </div>
          {record.display_name && (
            <div style={{ fontSize: 12, color: "#1890ff", marginBottom: 2 }}>
              Hiển thị: {record.display_name}
            </div>
          )}
          <div style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>
            Mã: {record.code}
          </div>
          {record.description && (
            <div style={{ fontSize: 11, color: "#999", lineHeight: 1.3 }}>
              {record.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      width: 100,
      render: (isActive: boolean) => {
        const statusConfig = SERVICE_TYPE_STATUS_OPTIONS.find(
          (s) => s.value === isActive
        );
        return <Tag color={statusConfig?.color}>{statusConfig?.label}</Tag>;
      },
      filters: SERVICE_TYPE_STATUS_OPTIONS.map((status) => ({
        text: status.label,
        value: status.value,
      })),
      onFilter: (value, record) => record.is_active === value,
    },
  ];

  // Handlers
  const handleAdd = () => {
    setEditData(null);
    setEditModalVisible(true);
  };

  const handleEdit = (record: ServiceType) => {
    setEditData(record);
    setEditModalVisible(true);
  };

  const handleView = (record: ServiceType) => {
    setSelectedData(record);
    setDetailModalVisible(true);
  };

  const handleEditModalSuccess = async (data: ServiceType) => {
    try {
      if (editData) {
        // Update existing service type
        await updateServiceTypeMutation.mutateAsync({
          serviceTypeId: editData.service_type_id,
          data: {
            code: data.code,
            name: data.name,
            display_name: data.display_name,
            description: data.description,
            is_active: data.is_active,
          },
        });
        message.success("Cập nhật loại dịch vụ thành công!");
      } else {
        // Add new service type
        await createServiceTypeMutation.mutateAsync({
          code: data.code,
          name: data.name,
          display_name: data.display_name,
          description: data.description,
          is_active: data.is_active,
        });
        message.success("Thêm loại dịch vụ thành công!");
      }
      setEditModalVisible(false);
      setEditData(null);
    } catch (error) {
      message.error("Có lỗi xảy ra khi lưu loại dịch vụ");
      console.log("Error saving service type:", error);
    }
  };

  return (
    <div>
      {/* Advanced Filters */}
      <Card
        title={
          <Space>
            <FilterOutlined />
            Bộ lọc nâng cao
            {getActiveFiltersCount() > 0 && (
              <Tag color="blue" style={{ marginLeft: 8 }}>
                {getActiveFiltersCount()} bộ lọc đang hoạt động
              </Tag>
            )}
          </Space>
        }
        style={{ marginBottom: 16 }}
        extra={
          <Space>
            {getActiveFiltersCount() > 0 && (
              <Button
                icon={<ReloadOutlined />}
                onClick={handleResetFilters}
                size="small"
                type="primary"
                ghost
              >
                Xóa bộ lọc ({getActiveFiltersCount()})
              </Button>
            )}
            <Button
              icon={<ReloadOutlined />}
              onClick={() => window.location.reload()}
              size="small"
            >
              Làm mới
            </Button>
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
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
                placeholder="Tìm kiếm theo tên, mã, tên hiển thị, mô tả..."
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
                {SERVICE_TYPE_STATUS_OPTIONS.map((status) => (
                  <Option
                    key={status.value.toString()}
                    value={status.value.toString()}
                  >
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
        loading={isLoading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        addButtonText="Thêm loại dịch vụ"
        searchable={false}
        scroll={{ x: 1300 }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: filteredData.length, // Use filtered data length for pagination
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: number, range: [number, number]) => {
            const filteredCount = filteredData.length;
            const originalCount = serviceTypes.length;
            if (filteredCount === originalCount) {
              return `${range[0]}-${range[1]} của ${total} loại dịch vụ`;
            } else {
              return `${range[0]}-${range[1]} của ${filteredCount} loại dịch vụ (từ ${originalCount} tổng cộng)`;
            }
          },
          onChange: (page: number, pageSize?: number) => {
            setPagination((prev) => ({
              ...prev,
              current: page,
              pageSize: pageSize || 10,
            }));
          },
        }}
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
