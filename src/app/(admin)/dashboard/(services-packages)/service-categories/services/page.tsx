"use client";
import React, { useState, useMemo, useEffect } from "react";
import { AdminTable } from "@/components/ui/Table";
import {
  useConfirmationModalContext,
  ServiceDetailModal,
  ServiceModal,
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
import {
  FilterOutlined,
  ReloadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  Service,
  SERVICE_TYPE_OPTIONS,
} from "@/lib/api/types/service.types";
import { ServiceService } from "@/lib/api/services/service.service";
import formatCurrency from "@/components/utils/helper/currency.format.helper";

const { Search } = Input;
const { Option } = Select;

const ServicesPage = () => {
  const [serviceData, setServiceData] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableKey, setTableKey] = useState(0); // Force re-render table
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const { showModal } = useConfirmationModalContext();

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
  const loadServices = async (page: number = 0, size: number = 10) => {
    try {
      setLoading(true);
      console.log("Loading services...", { page, size });
      const response = await ServiceService.getAllServices({ page, size });
      console.log("Services loaded:", response.data.content?.length, "items");
      setServiceData(response.data.content);
      setPagination({
        current: response.data.number + 1,
        pageSize: response.data.size,
        total: response.data.totalElements,
      });
    } catch (error) {
      message.error("Không thể tải danh sách dịch vụ");
      console.error("Error loading services:", error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data function
  const refreshData = async () => {
    try {
      console.log("Refreshing data...", {
        current: pagination.current,
        pageSize: pagination.pageSize,
      });
      await loadServices(pagination.current - 1, pagination.pageSize);
      setTableKey((prev) => prev + 1); // Force table re-render
      console.log("Data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      message.error("Không thể làm mới dữ liệu");
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

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
          item.serviceName.toLowerCase().includes(searchLower) ||
          item.serviceUrl.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower) ||
          item.categoryName.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(
        (item) => item.isActive === (filters.status === "active")
      );
    }

    // Service type filter
    if (filters.serviceType) {
      filtered = filtered.filter(
        (item) => item.serviceTypeId === filters.serviceType
      );
    }

    return filtered;
  }, [serviceData, filters]);

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
      key: "service",
      width: 280,
      render: (_, record) => (
        <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>
          {record.serviceName}
        </div>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "categoryName",
      key: "categoryName",
      width: 120,
      render: (categoryName: string) => <Tag color="blue">{categoryName}</Tag>,
    },
    {
      title: "Giá dịch vụ",
      key: "pricing",
      width: 200,
      sorter: (a, b) => a.basePrice - b.basePrice,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, color: "#52c41a", fontSize: 14 }}>
            {formatCurrency(record.basePrice)}
          </div>
        </div>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "standardDuration",
      key: "standardDuration",
      width: 100,
      sorter: (a, b) => a.standardDuration - b.standardDuration,
      render: (duration: number) => (
        <div style={{ color: "#1890ff" }}>{duration} phút</div>
      ),
    },

    {
      title: "Trạng thái",
      key: "status",
      width: 120,
      render: (_, record) => {
        if (record.is_deleted) {
          return <Tag color="default">Đã xóa</Tag>;
        }
        return (
          <div>
            <Tag color={record.isActive ? "green" : "red"}>
              {record.isActive ? "Hoạt động" : "Không hoạt động"}
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
        if (value === "active") return record.isActive && !record.is_deleted;
        if (value === "inactive") return !record.isActive && !record.is_deleted;
        if (value === "deleted") return record.is_deleted || false;
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

  const handleToggleStatus = (record: Service) => {
    const action = record.isActive ? "ngừng hoạt động" : "kích hoạt";
    showModal({
      title: record.isActive ? "Ngừng hoạt động" : "Kích hoạt",
      content: `Bạn có chắc chắn muốn ${action} dịch vụ ${record.serviceName}?`,
      type: record.isActive ? "warning" : "success",
      onConfirm: async () => {
        // Optimistic update - update UI immediately
        setServiceData((prevData) =>
          prevData.map((service) =>
            service.serviceId === record.serviceId
              ? { ...service, isActive: !record.isActive }
              : service
          )
        );

        try {
          console.log("Updating service status...", {
            serviceId: record.serviceId,
            newStatus: !record.isActive,
          });
          await ServiceService.updateServiceStatus(
            record.serviceId,
            {
              is_active: !record.isActive,
            }
          );
          message.success(`${action} dịch vụ thành công!`);
          console.log("Service status updated successfully");
        } catch (error) {
          // Revert optimistic update on error
          setServiceData((prevData) =>
            prevData.map((service) =>
              service.serviceId === record.serviceId
                ? { ...service, isActive: record.isActive }
                : service
            )
          );
          message.error(`Có lỗi xảy ra khi ${action} dịch vụ`);
          console.error("Error updating service status:", error);
        }
      },
    });
  };

  const handleDelete = (record: Service) => {
    showModal({
      title: "Xóa dịch vụ",
      content: `Bạn có chắc chắn muốn xóa dịch vụ ${record.serviceName}? Hành động này không thể hoàn tác.`,
      type: "error",
      onConfirm: async () => {
        try {
          await ServiceService.deleteService(record.serviceId);
          message.success("Xóa dịch vụ thành công!");

          // Update the service as deleted in local state immediately
          setServiceData((prevData) =>
            prevData.map((service) =>
              service.serviceId === record.serviceId
                ? { ...service, is_deleted: true }
                : service
            )
          );

          console.log("Service marked as deleted in local state:", {
            serviceId: record.serviceId,
            serviceName: record.serviceName,
            is_deleted: true,
          });
        } catch (error) {
          message.error("Có lỗi xảy ra khi xóa dịch vụ");
          console.error("Error deleting service:", error);
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
                placeholder="Tên, mã dịch vụ..."
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
              >
                {SERVICE_TYPE_OPTIONS.map((type) => (
                  <Option key={type.value} value={type.value}>
                    {type.label}
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
        onEditCondition={(record: Service) => !record.is_deleted}
        actions={[
          {
            key: "toggle-status",
            label: (record: Service) =>
              record.isActive ? "Ngừng hoạt động" : "Kích hoạt",
            type: "default",
            danger: (record: Service) => record.isActive,
            onClick: handleToggleStatus,
            condition: (record: Service) => !record.is_deleted,
          },
          {
            key: "delete",
            label: "Xóa",
            type: "default",
            danger: true,
            icon: <DeleteOutlined />,
            onClick: handleDelete,
            condition: (record: Service) => !record.is_deleted,
          },
        ]}
        onView={handleView}
        addButtonText="Thêm dịch vụ"
        searchable={false}
        scroll={{ x: 1720 }}
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
