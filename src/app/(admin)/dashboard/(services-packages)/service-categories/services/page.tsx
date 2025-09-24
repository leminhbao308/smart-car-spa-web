"use client";
import React, { useState, useMemo } from "react";
import { AdminTable } from "@/components/ui/Table";
import {
  useConfirmationModalContext,
  ServiceDetailModal,
  ServiceEditModal,
} from "@/components/ui/Modal";
import { ColumnsType } from "antd/es/table";
import { Tag, Card, Row, Col, Select, Input, Button, Space } from "antd";
import { FilterOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  servicesData,
  serviceStatuses,
} from "@/components/utils/data/services.data";
import { serviceTypesData } from "@/components/utils/data/service-types.data";
import formatCurrency from "@/components/utils/helper/currency.format.helper";

const { Search } = Input;
const { Option } = Select;

interface ServiceProduct {
  productId: number;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Service {
  id: number;
  serviceCode: string;
  serviceName: string;
  serviceTypeId: number;
  serviceTypeName: string;
  description: string;
  products: ServiceProduct[];
  laborCost: number;
  totalPrice: number;
  duration: number;
  status: string;
  features: string[];
  requirements: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const ServicesPage = () => {
  const [serviceData, setServiceData] = useState(servicesData);
  const [loading, setLoading] = useState(false);
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

  // Filtered data
  const filteredData = useMemo(() => {
    let filtered = [...serviceData];

    // Search filter
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.serviceName.toLowerCase().includes(searchLower) ||
          item.serviceCode.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((item) => item.status === filters.status);
    }

    // Service type filter
    if (filters.serviceType) {
      filtered = filtered.filter(
        (item) => item.serviceTypeName === filters.serviceType
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
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Mã dịch vụ",
      dataIndex: "serviceCode",
      key: "serviceCode",
      width: 120,
      sorter: (a, b) => a.serviceCode.localeCompare(b.serviceCode),
    },
    {
      title: "Tên dịch vụ",
      key: "service",
      width: 250,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>
            {record.serviceName}
          </div>
          <div style={{ fontSize: 12, color: "#666" }}>
            {record.description}
          </div>
        </div>
      ),
    },
    {
      title: "Loại dịch vụ",
      dataIndex: "serviceTypeName",
      key: "serviceTypeName",
      width: 120,
      render: (serviceTypeName: string) => (
        <Tag color="blue">{serviceTypeName}</Tag>
      ),
      filters: serviceTypesData.map((type) => ({
        text: type.serviceTypeName,
        value: type.serviceTypeName,
      })),
      onFilter: (value, record) => record.serviceTypeName === value,
    },
    {
      title: "Giá dịch vụ",
      key: "pricing",
      width: 200,
      sorter: (a, b) => a.totalPrice - b.totalPrice,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, color: "#52c41a", fontSize: 14 }}>
            {formatCurrency(record.totalPrice)}
          </div>
          <div style={{ fontSize: 11, color: "#666" }}>
            SP:{" "}
            {formatCurrency(
              record.products?.reduce(
                (sum: number, p: ServiceProduct) => sum + p.totalPrice,
                0
              ) || 0
            )}
          </div>
          <div style={{ fontSize: 11, color: "#666" }}>
            Công: {formatCurrency(record.laborCost || 0)}
          </div>
        </div>
      ),
    },
    {
      title: "Sản phẩm",
      key: "products",
      width: 120,
      render: (_, record) => (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 500, color: "#1890ff" }}>
            {record.products?.length || 0} SP
          </div>
          <div style={{ fontSize: 11, color: "#666" }}>
            {record.products?.length > 0
              ? record.products
                  .map((p: ServiceProduct) => p.productName)
                  .join(", ")
                  .substring(0, 20) + "..."
              : "Không có"}
          </div>
        </div>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "duration",
      key: "duration",
      width: 100,
      sorter: (a, b) => a.duration - b.duration,
      render: (duration: number) => (
        <div style={{ color: "#1890ff" }}>{duration} phút</div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => {
        const statusConfig = serviceStatuses.find((s) => s.value === status);
        return <Tag color={statusConfig?.color}>{statusConfig?.label}</Tag>;
      },
      filters: serviceStatuses.map((status) => ({
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

  const handleEdit = (record: Service) => {
    setEditData(record);
    setEditModalVisible(true);
  };

  const handleView = (record: Service) => {
    setSelectedData(record);
    setDetailModalVisible(true);
  };

  const handleEditModalSuccess = (data: Service) => {
    if (editData) {
      // Update existing service
      setServiceData(
        serviceData.map((item) => (item.id === data.id ? data : item))
      );
    } else {
      // Add new service
      const newService = {
        ...data,
        id: Math.max(...serviceData.map((s) => s.id)) + 1,
        createdAt: new Date().toISOString(),
      };
      setServiceData([...serviceData, newService]);
    }
    setEditModalVisible(false);
    setEditData(null);
  };

  const handleSuspendService = (record: Service) => {
    showModal({
      title: "Ngừng cung cấp",
      content: `Bạn có chắc chắn muốn ngừng cung cấp dịch vụ ${record.serviceName}?`,
      type: "warning",
      onConfirm: async () => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setServiceData(
          serviceData.map((item) =>
            item.id === record.id
              ? {
                  ...item,
                  status: "suspended",
                }
              : item
          )
        );
        setLoading(false);
      },
    });
  };

  const handleReactivate = (record: Service) => {
    showModal({
      title: "Kích hoạt lại",
      content: `Bạn có chắc chắn muốn kích hoạt lại dịch vụ ${record.serviceName}?`,
      type: "success",
      onConfirm: async () => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setServiceData(
          serviceData.map((item) =>
            item.id === record.id
              ? {
                  ...item,
                  status: "active",
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
                {serviceStatuses.map((status) => (
                  <Option key={status.value} value={status.value}>
                    {status.label}
                  </Option>
                ))}
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
                {serviceTypesData.map((type) => (
                  <Option
                    key={type.serviceTypeName}
                    value={type.serviceTypeName}
                  >
                    {type.serviceTypeName}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
        </Row>
      </Card>

      <AdminTable
        title="Quản lý dịch vụ"
        dataSource={filteredData}
        columns={serviceColumns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        actions={[
          {
            key: "suspend",
            label: (record: Service) =>
              record.status === "active" ? "Ngừng cung cấp" : "Kích hoạt lại",
            type: "default",
            danger: (record: Service) => record.status === "active",
            onClick: (record: Service) =>
              record.status === "active"
                ? handleSuspendService(record)
                : handleReactivate(record),
          },
        ]}
        onView={handleView}
        addButtonText="Thêm dịch vụ"
        searchable={false}
        scroll={{ x: 1600 }}
      />

      {/* Modals */}
      <ServiceDetailModal
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        data={selectedData}
      />

      <ServiceEditModal
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onSuccess={handleEditModalSuccess}
        editData={editData}
      />
    </div>
  );
};

export default ServicesPage;
