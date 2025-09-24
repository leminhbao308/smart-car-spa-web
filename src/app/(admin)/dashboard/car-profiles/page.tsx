"use client";
import React, { useState, useMemo } from "react";
import { AdminTable } from "@/components/ui/Table";
import {
  useConfirmationModalContext,
  CarProfileModal,
  CarDetailModal,
  ServiceHistoryModal,
  OwnerDetailModal,
  ScheduleServiceModal,
} from "@/components/ui/Modal";
import { ColumnsType } from "antd/es/table";
import {
  Tag,
  Card,
  Row,
  Col,
  Select, 
  Space,
  Button,
} from "antd";
import {
  CarOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  ToolOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  carProfilesData,
  vehicleTypes,
  vehicleStatuses,
  vehicleBrands,
  vehicleColors,
  engineTypes,
  transmissions,
} from "@/components/utils/data/car-profiles.data";
import formatCurrency from "@/components/utils/helper/currency.format.helper";
import {
  calculateVehicleAge,
  getDaysUntilService,
  getTotalServiceCost,
} from "@/components/utils/helper/vehicle.warranty.helper";
import dayjs from "dayjs";

const CarProfilesPage = () => {
  const [data, setData] = useState(carProfilesData);
  const [loading, setLoading] = useState(false);
  const { showModal } = useConfirmationModalContext();

  // Modal states
  const [carModalVisible, setCarModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [serviceHistoryModalVisible, setServiceHistoryModalVisible] =
    useState(false);
  const [ownerDetailModalVisible, setOwnerDetailModalVisible] = useState(false);
  const [scheduleServiceModalVisible, setScheduleServiceModalVisible] =
    useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [editData, setEditData] = useState<any>(null);

  // Filter states
  const [filters, setFilters] = useState<{
    status?: string;
    vehicleType?: string;
    brand?: string;
    color?: string;
    engineType?: string;
    transmission?: string;
    yearFrom?: number | null;
    yearTo?: number | null;
    mileageFrom?: number | null;
    mileageTo?: number | null;
    insuranceExpiryFrom?: string;
    insuranceExpiryTo?: string;
  }>({
    status: undefined,
    vehicleType: undefined,
    brand: undefined,
    color: undefined,
    engineType: undefined,
    transmission: undefined,
    yearFrom: undefined,
    yearTo: undefined,
    mileageFrom: undefined,
    mileageTo: undefined,
    insuranceExpiryFrom: undefined,
    insuranceExpiryTo: undefined,
  });

  // Filtered data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Status filter
      if (filters.status && item.status !== filters.status) return false;

      // Vehicle type filter
      if (filters.vehicleType && item.vehicleType !== filters.vehicleType)
        return false;

      // Brand filter
      if (filters.brand && item.brand !== filters.brand) return false;

      // Color filter
      if (filters.color && item.color !== filters.color) return false;

      // Engine type filter
      if (filters.engineType && item.engineType !== filters.engineType)
        return false;

      // Transmission filter
      if (filters.transmission && item.transmission !== filters.transmission)
        return false;

      // Year range filter
      if (filters.yearFrom && item.year < filters.yearFrom) return false;
      if (filters.yearTo && item.year > filters.yearTo) return false;

      // Mileage range filter
      if (filters.mileageFrom && item.mileage < filters.mileageFrom)
        return false;
      if (filters.mileageTo && item.mileage > filters.mileageTo) return false;

      // Insurance expiry range filter
      if (filters.insuranceExpiryFrom) {
        const itemDate = dayjs(item.insuranceExpiry);
        const filterDate = dayjs(filters.insuranceExpiryFrom);
        if (itemDate.isBefore(filterDate)) return false;
      }
      if (filters.insuranceExpiryTo) {
        const itemDate = dayjs(item.insuranceExpiry);
        const filterDate = dayjs(filters.insuranceExpiryTo);
        if (itemDate.isAfter(filterDate)) return false;
      }

      return true;
    });
  }, [data, filters]);

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      status: undefined,
      vehicleType: undefined,
      brand: undefined,
      color: undefined,
      engineType: undefined,
      transmission: undefined,
      yearFrom: undefined,
      yearTo: undefined,
      mileageFrom: undefined,
      mileageTo: undefined,
      insuranceExpiryFrom: undefined,
      insuranceExpiryTo: undefined,
    });
  };

  // Định nghĩa columns
  const columns: ColumnsType<any> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Mã Xe",
      dataIndex: "vehicleCode",
      key: "vehicleCode",
      width: 100,
      render: (code: string) => (
        <span style={{ fontFamily: "monospace", fontWeight: 500 }}>{code}</span>
      ),
    },
    {
      title: "Biển số",
      dataIndex: "licensePlate",
      key: "licensePlate",
      width: 120,
      render: (plate: string) => (
        <span
          style={{
            fontFamily: "monospace",
            fontWeight: 600,
            fontSize: 14,
            color: "#1890ff",
          }}
        >
          {plate}
        </span>
      ),
    },
    {
      title: "Thông tin xe",
      key: "vehicleInfo",
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>
            {record.brand} {record.model}
          </div>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>
            Năm: {record.year} ({calculateVehicleAge(record.year)} tuổi)
          </div>
          <div style={{ fontSize: 12, color: "#666" }}>
            {record.color} • {record.engineCapacity}
          </div>
        </div>
      ),
    },
    {
      title: "Loại xe",
      dataIndex: "vehicleType",
      key: "vehicleType",
      width: 100,
      render: (type: string) => {
        const typeConfig = vehicleTypes.find((t) => t.value === type);
        return (
          <Tag color={typeConfig?.color} icon={typeConfig?.icon}>
            {typeConfig?.label}
          </Tag>
        );
      },
      filters: vehicleTypes.map((type) => ({
        text: type.label,
        value: type.value,
      })),
      onFilter: (value, record) => record.vehicleType === value,
    },
    {
      title: "Động cơ",
      key: "engine",
      width: 120,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: 12, fontWeight: 500 }}>
            {record.engineType}
          </div>
          <div style={{ fontSize: 11, color: "#666" }}>
            {record.transmission}
          </div>
        </div>
      ),
    },
    {
      title: "Số km",
      dataIndex: "mileage",
      key: "mileage",
      width: 100,
      sorter: (a, b) => a.mileage - b.mileage,
      render: (mileage: number) => (
        <span style={{ fontWeight: 500 }}>{mileage.toLocaleString()} km</span>
      ),
    },
    {
      title: "Chủ xe",
      key: "owner",
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 13 }}>
            {record.customerName}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#666",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <PhoneOutlined style={{ fontSize: 10 }} />
            {record.customerPhone}
          </div>
        </div>
      ),
    },
    {
      title: "Bảo dưỡng",
      key: "maintenance",
      width: 150,
      render: (_, record) => {
        const daysUntilService = getDaysUntilService(record.nextServiceDate);
        const totalCost = getTotalServiceCost(record.serviceHistory);

        return (
          <div>
            <div style={{ fontSize: 12, marginBottom: 2 }}>
              <CalendarOutlined style={{ marginRight: 4 }} />
              {daysUntilService > 0 ? `${daysUntilService} ngày` : "Quá hạn"}
            </div>
            <div style={{ fontSize: 11, color: "#666" }}>
              Tổng: {formatCurrency(totalCost)}
            </div>
            <div style={{ fontSize: 10, color: "#999" }}>
              {record.serviceHistory.length} lần
            </div>
          </div>
        );
      },
    },
    {
      title: "Bảo hiểm",
      dataIndex: "insuranceExpiry",
      key: "insuranceExpiry",
      width: 120,
      sorter: (a, b) =>
        new Date(a.insuranceExpiry).getTime() -
        new Date(b.insuranceExpiry).getTime(),
      render: (date: string) => {
        const expiryDate = new Date(date);
        const today = new Date();
        const diffDays = Math.ceil(
          (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        return (
          <div>
            <div style={{ fontSize: 12 }}>
              {expiryDate.toLocaleDateString("vi-VN")}
            </div>
            <div
              style={{
                fontSize: 11,
                color:
                  diffDays < 30
                    ? "#ff4d4f"
                    : diffDays < 90
                    ? "#faad14"
                    : "#52c41a",
              }}
            >
              {diffDays > 0 ? `${diffDays} ngày` : "Hết hạn"}
            </div>
          </div>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => {
        const statusConfig = vehicleStatuses.find((s) => s.value === status);
        return <Tag color={statusConfig?.color}>{statusConfig?.label}</Tag>;
      },
      filters: vehicleStatuses.map((status) => ({
        text: status.label,
        value: status.value,
      })),
      onFilter: (value, record) => record.status === value,
    },
  ];

  // Handlers
  const handleAdd = () => {
    setEditData(null);
    setCarModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditData(record);
    setCarModalVisible(true);
  };

  const handleView = (record: any) => {
    setSelectedData(record);
    setDetailModalVisible(true);
  };

  const handleViewServiceHistory = (record: any) => {
    setSelectedData(record);
    setServiceHistoryModalVisible(true);
  };

  const handleViewOwner = (record: any) => {
    // Create customer data from vehicle record
    const customerData = {
      id: record.customerId,
      customerCode: `KH${record.customerId.toString().padStart(3, "0")}`,
      fullName: record.customerName,
      email: record.customerEmail,
      phone: record.customerPhone,
      address: "Chưa cập nhật",
      dateOfBirth: "1990-01-01",
      gender: "male",
      customerType: "regular",
      totalOrders: 5,
      totalSpent: 15000000,
      lastVisit: new Date().toISOString(),
      joinDate: "2023-01-01",
      status: "active",
      notes: "Khách hàng thường xuyên",
      vehicles: [
        {
          id: record.id,
          brand: record.brand,
          model: record.model,
          year: record.year,
          licensePlate: record.licensePlate,
          status: record.status,
        },
      ],
      preferredServices: ["Bảo dưỡng định kỳ", "Rửa xe"],
    };
    setSelectedData(customerData);
    setOwnerDetailModalVisible(true);
  };

  const handleScheduleService = (record: any) => {
    setSelectedData(record);
    setScheduleServiceModalVisible(true);
  };

  const handleUpdateStatus = (record: any) => {
    const currentStatus = record.status;
    const newStatus = currentStatus === "active" ? "maintenance" : "active";

    showModal({
      title: "Cập nhật trạng thái",
      content: `Cập nhật trạng thái xe ${record.licensePlate} từ "${currentStatus}" thành "${newStatus}"?`,
      type: "warning",
      onConfirm: async () => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setData(
          data.map((item) =>
            item.id === record.id ? { ...item, status: newStatus } : item
          )
        );
        setLoading(false);
      },
    });
  };

  // Modal success handlers
  const handleCarModalSuccess = (data: any) => {
    if (editData) {
      // Update existing vehicle
      setData((prev) =>
        prev.map((item) =>
          item.id === editData.id ? { ...item, ...data } : item
        )
      );
    } else {
      // Add new vehicle
      setData((prev) => [...prev, { ...data, id: Date.now() }]);
    }
  };

  const handleScheduleServiceSuccess = (data: any) => {
    console.log("Service scheduled:", data);
    // TODO: Update vehicle's next service date
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
          <Col xs={24} sm={12} md={8} lg={6}>
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
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, status: value }))
                }
                allowClear
                style={{ width: "100%" }}
              >
                {vehicleStatuses.map((status) => (
                  <Select.Option key={status.value} value={status.value}>
                    <Tag color={status.color}>{status.label}</Tag>
                  </Select.Option>
                ))}
              </Select>
            </div>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "#666",
                  marginBottom: 4,
                  display: "block",
                }}
              >
                Loại xe
              </label>
              <Select
                placeholder="Chọn loại xe"
                value={filters.vehicleType}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, vehicleType: value }))
                }
                allowClear
                style={{ width: "100%" }}
              >
                {vehicleTypes.map((type) => (
                  <Select.Option key={type.value} value={type.value}>
                    <Tag color={type.color} icon={type.icon}>
                      {type.label}
                    </Tag>
                  </Select.Option>
                ))}
              </Select>
            </div>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "#666",
                  marginBottom: 4,
                  display: "block",
                }}
              >
                Hãng xe
              </label>
              <Select
                placeholder="Chọn hãng xe"
                value={filters.brand}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, brand: value }))
                }
                allowClear
                style={{ width: "100%" }}
                showSearch
                filterOption={(input, option) =>
                  String(option?.children)
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {vehicleBrands.map((brand) => (
                  <Select.Option key={brand} value={brand}>
                    {brand}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "#666",
                  marginBottom: 4,
                  display: "block",
                }}
              >
                Màu sắc
              </label>
              <Select
                placeholder="Chọn màu"
                value={filters.color}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, color: value }))
                }
                allowClear
                style={{ width: "100%" }}
              >
                {vehicleColors.map((color) => (
                  <Select.Option key={color} value={color}>
                    {color}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "#666",
                  marginBottom: 4,
                  display: "block",
                }}
              >
                Loại động cơ
              </label>
              <Select
                placeholder="Chọn động cơ"
                value={filters.engineType}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, engineType: value }))
                }
                allowClear
                style={{ width: "100%" }}
              >
                {engineTypes.map((engine) => (
                  <Select.Option key={engine.value} value={engine.value}>
                    <Tag color={engine.color}>{engine.label}</Tag>
                  </Select.Option>
                ))}
              </Select>
            </div>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "#666",
                  marginBottom: 4,
                  display: "block",
                }}
              >
                Hộp số
              </label>
              <Select
                placeholder="Chọn hộp số"
                value={filters.transmission}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, transmission: value }))
                }
                allowClear
                style={{ width: "100%" }}
              >
                {transmissions.map((trans) => (
                  <Select.Option key={trans.value} value={trans.value}>
                    <Tag color={trans.color}>{trans.label}</Tag>
                  </Select.Option>
                ))}
              </Select>
            </div>
          </Col>
        </Row>
      </Card>

      <AdminTable
        title="Quản lý hồ sơ xe"
        dataSource={filteredData}
        columns={columns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        addButtonText="Thêm hồ sơ xe"
        actions={[
          {
            key: "view-service-history",
            label: "Lịch sử bảo dưỡng",
            type: "default",
            icon: <ToolOutlined />,
            onClick: handleViewServiceHistory,
          },
          {
            key: "view-owner",
            label: "Xem chủ xe",
            type: "default",
            icon: <CarOutlined />,
            onClick: handleViewOwner,
          },
          {
            key: "schedule-service",
            label: "Đặt lịch bảo dưỡng",
            type: "primary",
            icon: <CalendarOutlined />,
            onClick: handleScheduleService,
          },
          {
            key: "update-status",
            label: (record: any) =>
              record.status === "active" ? "Đưa vào bảo dưỡng" : "Kích hoạt",
            type: "default",
            danger: (record: any) => record.status === "active",
            onClick: handleUpdateStatus,
          },
        ]}
        searchable={true}
        searchPlaceholder="Tìm kiếm hồ sơ xe theo biển số, chủ xe, hãng xe..."
        searchFields={[
          "licensePlate",
          "customerName",
          "brand",
          "model",
          "vehicleCode",
        ]}
        scroll={{ x: 1600 }}
      />

      {/* Modals */}
      <CarProfileModal
        visible={carModalVisible}
        onCancel={() => setCarModalVisible(false)}
        onSuccess={handleCarModalSuccess}
        editData={editData}
      />

      <CarDetailModal
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        data={selectedData}
      />

      <ServiceHistoryModal
        visible={serviceHistoryModalVisible}
        onCancel={() => setServiceHistoryModalVisible(false)}
        data={selectedData?.serviceHistory || []}
        vehicleInfo={
          selectedData
            ? {
                licensePlate: selectedData.licensePlate,
                brand: selectedData.brand,
                model: selectedData.model,
              }
            : undefined
        }
      />

      <OwnerDetailModal
        visible={ownerDetailModalVisible}
        onCancel={() => setOwnerDetailModalVisible(false)}
        data={selectedData}
      />

      <ScheduleServiceModal
        visible={scheduleServiceModalVisible}
        onCancel={() => setScheduleServiceModalVisible(false)}
        onSuccess={handleScheduleServiceSuccess}
        vehicleData={selectedData}
      />
    </div>
  );
};

export default CarProfilesPage;
