"use client";
import React, { useState, useMemo } from "react";
import { AdminTable } from "@/components/ui/Table";
import {
  useConfirmationModalContext,
  ServiceTypeDetailModal,
  ServiceTypeEditModal,
} from "@/components/ui/Modal";
import { ColumnsType } from "antd/es/table";
import { Tag, Card, Row, Col, Select, Input, Button, Space, message } from "antd";
import { FilterOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  ServiceType,
  SERVICE_TYPE_STATUS_OPTIONS,
} from "@/lib/api/types/service-type.types";
import {
  useServiceTypes,
  useCreateServiceType,
  useUpdateServiceType,
  useUpdateServiceTypeStatus,
} from "@/lib/api/hooks/useServiceTypes";

const { Search } = Input;
const { Option } = Select;

const ServiceTypesPage = () => {
  const { showModal } = useConfirmationModalContext();

  // React Query hooks
  const { data: serviceTypesData, isLoading } = useServiceTypes({});
  const createServiceTypeMutation = useCreateServiceType();
  const updateServiceTypeMutation = useUpdateServiceType();
  const updateServiceTypeStatusMutation = useUpdateServiceTypeStatus();

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
      setPagination(prev => ({
        ...prev,
        total: serviceTypesData.data.totalElements || 0,
      }));
    }
  }, [serviceTypesData]);

  // Filtered data
  const filteredData = useMemo(() => {
    let filtered = [...serviceTypes];

    // Search filter
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.code.toLowerCase().includes(searchLower) ||
          (item.description && item.description.toLowerCase().includes(searchLower))
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((item) => item.isActive === (filters.status === "active"));
    }

    return filtered;
  }, [serviceTypes, filters]);

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      status: undefined,
      searchText: undefined,
    });
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
      key: "serviceType",
      width: 300,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>
            {record.name}
          </div>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>
            {record.code}
          </div>
          <div style={{ fontSize: 11, color: "#999", lineHeight: 1.3 }}>
            {record.description}
          </div>
        </div>
      ),
    },
    {
      title: "Thời gian mặc định",
      dataIndex: "defaultDuration",
      key: "defaultDuration",
      width: 120,
      render: (duration: number) => (
        <div style={{ color: "#1890ff" }}>
          {duration ? `${duration} phút` : "Không xác định"}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
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
      onFilter: (value, record) => record.isActive === value,
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
          serviceTypeId: editData.serviceTypeId,
          data: {
            code: data.code,
            name: data.name,
            description: data.description,
            defaultDuration: data.defaultDuration,
            isActive: data.isActive,
          },
        });
        message.success("Cập nhật loại dịch vụ thành công!");
      } else {
        // Add new service type
        await createServiceTypeMutation.mutateAsync({
          code: data.code,
          name: data.name,
          description: data.description,
          defaultDuration: data.defaultDuration,
          isActive: data.isActive,
        });
        message.success("Thêm loại dịch vụ thành công!");
      }
      setEditModalVisible(false);
      setEditData(null);
    } catch (error) {
      message.error("Có lỗi xảy ra khi lưu loại dịch vụ");
      console.error("Error saving service type:", error);
    }
  };

  const handleToggleStatus = (record: ServiceType) => {
    const action = record.isActive ? "vô hiệu hóa" : "kích hoạt";
    showModal({
      title: `${
        action === "vô hiệu hóa" ? "Vô hiệu hóa" : "Kích hoạt"
      } loại dịch vụ`,
      content: `Bạn có chắc chắn muốn ${action} loại dịch vụ ${record.name}?`,
      type: "warning",
      onConfirm: async () => {
        try {
          await updateServiceTypeStatusMutation.mutateAsync({
            serviceTypeId: record.serviceTypeId,
            isActive: !record.isActive,
          });
          message.success(`${action} loại dịch vụ thành công!`);
        } catch (error) {
          message.error(`Có lỗi xảy ra khi ${action} loại dịch vụ`);
          console.error("Error updating service type status:", error);
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
                {SERVICE_TYPE_STATUS_OPTIONS.map((status) => (
                  <Option key={status.value.toString()} value={status.value.toString()}>
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
        actions={[
          {
            key: "toggle-status",
            label: (record: ServiceType) =>
              record.isActive ? "Vô hiệu hóa" : "Kích hoạt",
            type: "default",
            danger: (record: ServiceType) => record.isActive,
            onClick: handleToggleStatus,
          },
        ]}
        scroll={{ x: 1200 }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: number, range: [number, number]) =>
            `${range[0]}-${range[1]} của ${total} loại dịch vụ`,
          onChange: (page: number, pageSize?: number) => {
            setPagination(prev => ({
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
