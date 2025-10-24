"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { AdminTable } from "@/components/ui/Table";
import { ServiceDetailModal, ServiceModal } from "@/components/ui/Modal";
import { ColumnsType } from "antd/es/table";
import { Tag, Card, Row, Col, Select, Input, Button, Space, App } from "antd";
import { FilterOutlined, ReloadOutlined } from "@ant-design/icons";
import { Service } from "@/lib/api/types/service.types";
import { ServiceService } from "@/lib/api/services/service.service";
import { useServiceTypes } from "@/lib/api/hooks/useServiceTypes";

const { Search } = Input;
const { Option } = Select;

const ServicesPage = () => {
  const { message } = App.useApp();
  const [serviceData, setServiceData] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableKey, setTableKey] = useState(0); // Force re-render table
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Get service types for mapping
  const { data: serviceTypesData } = useServiceTypes({});

  // Create service type mapping
  const serviceTypeMap = useMemo(() => {
    const map = new Map<string, string>();
    if (serviceTypesData?.data?.content) {
      serviceTypesData.data.content.forEach((type) => {
        map.set(type.service_type_id, type.name);
      });
    }
    return map;
  }, [serviceTypesData]);

  // Helper function to get service type name
  const getServiceTypeName = useCallback(
    (service: Service) => {
      return (
        service.service_type_name ||
        serviceTypeMap.get(service.service_type_id) ||
        "Không xác định"
      );
    },
    [serviceTypeMap]
  );

  // Modal states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedData, setSelectedData] = useState<Service | null>(null);
  const [editData, setEditData] = useState<Service | null>(null);

  // Filter states
  const [filters, setFilters] = useState<{
    status?: string;
    serviceType?: string;
    searchText?: string;
  }>({
    status: undefined,
    serviceType: undefined,
    searchText: undefined,
  });

  // Load services data
  const loadServices = useCallback(
    async (page: number = 0, size: number = 10) => {
      try {
        setLoading(true);
        const response = await ServiceService.getAllServices({ page, size });

        // Handle both Service[] and ServicePageResponse
        if (Array.isArray(response.data)) {
          // Direct array response
          setServiceData(response.data);
          setPagination({
            current: 1,
            pageSize: response.data.length,
            total: response.data.length,
          });
        } else {
          // Paginated response
          setServiceData(response.data.content || []);
          setPagination({
            current: response.data.number + 1,
            pageSize: response.data.size,
            total: response.data.totalElements,
          });
        }
      } catch (error) {
        message.error("Không thể tải danh sách dịch vụ");
        console.error("Error loading services:", error);
      } finally {
        setLoading(false);
      }
    },
    [message]
  );

  // Refresh data function
  const refreshData = async () => {
    try {
      await loadServices(pagination.current - 1, pagination.pageSize);
      setTableKey((prev) => prev + 1); // Force table re-render
    } catch (error) {
      console.error("Error refreshing data:", error);
      message.error("Không thể làm mới dữ liệu");
    }
  };

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  // Debug: Log serviceData changes
  useEffect(() => {
    console.log("Service data updated:", serviceData.length, "items");
  }, [serviceData]);

  // Filtered data
  const filteredData = useMemo(() => {
    let filtered = [...serviceData];

    // Search filter
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.service_name.toLowerCase().includes(searchLower) ||
          item.service_url.toLowerCase().includes(searchLower) ||
          (item.description &&
            item.description.toLowerCase().includes(searchLower)) ||
          (item.category_name &&
            item.category_name.toLowerCase().includes(searchLower)) ||
          getServiceTypeName(item).toLowerCase().includes(searchLower) ||
          (item.service_process?.name &&
            item.service_process.name.toLowerCase().includes(searchLower)) ||
          (item.service_process_name &&
            item.service_process_name.toLowerCase().includes(searchLower)) ||
          item.service_products?.some((sp) =>
            sp.product_info.product_name.toLowerCase().includes(searchLower)
          )
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(
        (item) => item.is_active === (filters.status === "active")
      );
    }

    // Service type filter
    if (filters.serviceType) {
      filtered = filtered.filter(
        (item) => item.service_type_id === filters.serviceType
      );
    }

    return filtered;
  }, [serviceData, filters, getServiceTypeName]);

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      status: undefined,
      serviceType: undefined,
      searchText: undefined,
    });
  };

  // Định nghĩa columns cho dịch vụ
  const serviceColumns: ColumnsType<Service> = [
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
      title: "Tên dịch vụ",
      key: "service_name",
      width: 280,
      render: (_, record) => (
        <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>
          {record.service_name}
        </div>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "category_name",
      key: "category_name",
      width: 120,
      render: (categoryName: string) => <Tag color="blue">{categoryName}</Tag>,
    },
    {
      title: "Thời gian ước tính",
      key: "estimated_duration",
      width: 120,
      sorter: (a, b) =>
        (a.service_process?.estimated_duration || a.estimated_duration || 0) -
        (b.service_process?.estimated_duration || b.estimated_duration || 0),
      render: (_, record) => (
        <div style={{ color: "#1890ff" }}>
          {record.service_process?.estimated_duration ||
            record.estimated_duration ||
            0}{" "}
          phút
        </div>
      ),
    },
    {
      title: "Loại dịch vụ",
      key: "service_type_name",
      width: 150,
      render: (_, record) => (
        <Tag color="purple">{getServiceTypeName(record)}</Tag>
      ),
    },
    {
      title: "Quy trình",
      key: "service_process",
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 12 }}>
            {record.service_process?.name ||
              record.service_process_name ||
              "Chưa có quy trình"}
          </div>
          <div style={{ fontSize: 11, color: "#666" }}>
            {record.service_process?.code || record.service_process_code || ""}
            {record.service_process?.process_steps?.length && (
              <span> • {record.service_process.process_steps.length} bước</span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Sản phẩm",
      key: "service_products",
      width: 100,
      render: (_, record) => (
        <div style={{ textAlign: "center" }}>
          <Tag color="green">
            {record.service_products?.length || 0} sản phẩm
          </Tag>
        </div>
      ),
    },

    {
      title: "Trạng thái",
      key: "status",
      width: 120,
      render: (_, record) => {
        if (record.audit?.is_deleted) {
          return <Tag color="default">Đã xóa</Tag>;
        }
        return (
          <div>
            <Tag color={record.is_active ? "green" : "red"}>
              {record.is_active ? "Hoạt động" : "Không hoạt động"}
            </Tag>
          </div>
        );
      },
      filters: [
        { text: "Hoạt động", value: "active" },
        { text: "Không hoạt động", value: "inactive" },
        { text: "Đã xóa", value: "deleted" },
      ],
      onFilter: (value, record) => {
        if (value === "active")
          return record.is_active && !record.audit?.is_deleted;
        if (value === "inactive")
          return !record.is_active && !record.audit?.is_deleted;
        if (value === "deleted") return record.audit?.is_deleted || false;
        return true;
      },
    },
  ];

  // Handlers
  const handleAdd = () => {
    setEditData(null);
    setEditModalVisible(true);
  };

  const handleEdit = (record: Service) => {
    setEditData(record);
    setEditModalVisible(true);
  };

  const handleView = (record: Service) => {
    setSelectedData(record);
    setDetailModalVisible(true);
  };

  const handleEditModalSuccess = () => {
    // ServiceModal đã xử lý create/update và hiển thị message
    // Chỉ cần đóng modal và refresh data
    setEditModalVisible(false);
    setEditData(null);
    // Refresh data
    loadServices(pagination.current - 1, pagination.pageSize);
    setTableKey((prev) => prev + 1); // Force table re-render
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
                placeholder="Tìm kiếm theo tên, URL, mô tả, danh mục, loại dịch vụ, quy trình, sản phẩm..."
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
                Loại dịch vụ
              </label>
              <Select
                placeholder="Chọn loại dịch vụ"
                value={filters.serviceType}
                onChange={(value) =>
                  setFilters({ ...filters, serviceType: value })
                }
                allowClear
                style={{ width: "100%" }}
                loading={!serviceTypesData}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  String(option?.children)
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {serviceTypesData?.data?.content?.map((type) => (
                  <Option
                    key={type.service_type_id}
                    value={type.service_type_id}
                  >
                    {type.name}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
        </Row>
      </Card>

      <AdminTable
        key={tableKey}
        title="Quản lý dịch vụ"
        dataSource={filteredData}
        columns={serviceColumns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onEditCondition={(record: Service) => !record.audit?.is_deleted}
        onView={handleView}
        addButtonText="Thêm dịch vụ"
        searchable={false}
        scroll={{ x: 2000 }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: number, range: [number, number]) =>
            `${range[0]}-${range[1]} của ${total} dịch vụ`,
          onChange: (page: number, pageSize?: number) => {
            loadServices(page - 1, pageSize || 10);
          },
        }}
      />

      {/* Modals */}
      <ServiceDetailModal
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        data={selectedData}
      />

      <ServiceModal
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onSuccess={handleEditModalSuccess}
        editData={editData || undefined}
      />
    </div>
  );
};

export default ServicesPage;
