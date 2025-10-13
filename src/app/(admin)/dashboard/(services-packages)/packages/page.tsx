"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AdminTable } from "@/components/ui/Table";
import { useConfirmationModalContext } from "@/components/ui/Modal";
import { ColumnsType } from "antd/es/table";
import { Tag, Card, Row, Col, Select, Input, Button, Space, App } from "antd";
import { FilterOutlined, ReloadOutlined } from "@ant-design/icons";
import { ServicePackage } from "@/lib/api/types/service-package.types";
import { servicePackageService } from "@/lib/api/services/service-package.service";
import { servicePackageTypeService } from "@/lib/api/services/service-package-type.service";
import { ServicePackageType } from "@/lib/api/types/service-package-type.types";
import formatCurrency from "@/components/utils/helper/currency.format.helper";

const { Search } = Input;
const { Option } = Select;

const ServicePackagesPage = () => {
  const { message } = App.useApp();
  const [packageData, setPackageData] = useState<ServicePackage[]>([]);
  const [packageTypes, setPackageTypes] = useState<ServicePackageType[]>([]);
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
  const [selectedData, setSelectedData] = useState<ServicePackage | null>(null);
  const [editData, setEditData] = useState<ServicePackage | null>(null);

  // Filter states
  const [filters, setFilters] = useState<{
    status?: string;
    packageType?: string;
    searchText?: string;
  }>({
    status: undefined,
    packageType: undefined,
    searchText: undefined,
  });

  // Load package types for filter
  const loadPackageTypes = useCallback(async () => {
    try {
      const response =
        await servicePackageTypeService.getActiveServicePackageTypes();
      setPackageTypes(response);
    } catch (error) {
      console.error("Error loading package types:", error);
    }
  }, []);

  // Load service packages data
  const loadServicePackages = useCallback(
    async (page: number = 0, size: number = 10) => {
      try {
        setLoading(true);
        const response = await servicePackageService.getAllServicePackages(
          page,
          size
        );

        // Check if data is array or object with content property
        const dataArray = Array.isArray(response.data)
          ? response.data
          : response.data?.content || [];

        // Add temporary hardcoded promotion data
        const packagesWithPromotion = dataArray.map((pkg: ServicePackage) => ({
          ...pkg,
          promotionId: "promo-001",
          promotionName: "Khuyến mãi mùa hè",
          promotionDiscount: 10, // 10% discount
        }));

        setPackageData(packagesWithPromotion);
        setPagination({
          current: 1,
          pageSize: size,
          total: Array.isArray(response.data)
            ? response.data.length
            : response.data?.totalElements || 0,
        });
      } catch (error) {
        message.error("Không thể tải danh sách gói dịch vụ");
        console.error("Error loading service packages:", error);
      } finally {
        setLoading(false);
      }
    },
    [message]
  );

  // Refresh data function
  const refreshData = async () => {
    try {
      await loadServicePackages(0, 100);
      setTableKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error refreshing data:", error);
      message.error("Không thể làm mới dữ liệu");
    }
  };

  useEffect(() => {
    loadPackageTypes();
    loadServicePackages();
  }, [loadPackageTypes, loadServicePackages]);

  // Helper function to calculate package price
  const calculatePackagePrice = (serviceCost: number): number => {
    return serviceCost;
  };

  // Helper function to get display price
  const getDisplayPrice = (
    packagePrice: number | null,
    serviceCost: number
  ): {
    price: number;
    isCalculated: boolean;
  } => {
    if (packagePrice !== null && packagePrice > 0) {
      return { price: packagePrice, isCalculated: false };
    }
    return {
      price: calculatePackagePrice(serviceCost),
      isCalculated: true,
    };
  };

  // Filtered data with client-side pagination
  const filteredData = useMemo(() => {
    let filtered = [...(packageData || [])];

    // Search filter
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.package_name.toLowerCase().includes(searchLower) ||
          item.package_url.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower) ||
          item.category_name.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(
        (item) => item.is_active === (filters.status === "active")
      );
    }

    // Package type filter
    if (filters.packageType) {
      filtered = filtered.filter(
        (item) => item.service_package_type_name === filters.packageType
      );
    }

    // Update pagination total when filters change
    setPagination((prev) => ({
      ...prev,
      total: filtered.length,
      current: 1, // Reset to first page when filters change
    }));

    return filtered;
  }, [packageData, filters]);

  // Paginated data for display
  const paginatedData = useMemo(() => {
    const startIndex = (pagination.current - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, pagination]);

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      searchText: undefined,
      status: undefined,
      packageType: undefined,
    });
  };

  // Định nghĩa columns cho gói dịch vụ
  const packageColumns: ColumnsType<ServicePackage> = [
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
      title: "Tên gói dịch vụ",
      key: "package",
      width: 300,
      render: (_: unknown, record: ServicePackage) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>
            {record.package_name}
          </div>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>
            {record.description}
          </div>
          <div style={{ fontSize: 11, color: "#999" }}>
            URL: {record.package_url}
          </div>
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
      title: "Loại gói",
      dataIndex: "service_package_type_name",
      key: "service_package_type_name",
      width: 120,
      render: (packageType: string) => (
        <Tag color="blue">{packageType || "N/A"}</Tag>
      ),
    },
    {
      title: "Giá gói",
      key: "pricing",
      width: 200,
      sorter: (a: ServicePackage, b: ServicePackage) => {
        const priceA = getDisplayPrice(a.package_price, a.service_cost).price;
        const priceB = getDisplayPrice(b.package_price, b.service_cost).price;
        return priceA - priceB;
      },
      render: (_: unknown, record: ServicePackage) => {
        const { price, isCalculated } = getDisplayPrice(
          record.package_price,
          record.service_cost
        );

        return (
          <div>
            <div
              style={{
                fontWeight: 500,
                color: isCalculated ? "#1890ff" : "#52c41a",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {formatCurrency(price)}
            </div>
          </div>
        );
      },
    },
    {
      title: "Thời gian",
      dataIndex: "total_duration",
      key: "total_duration",
      width: 100,
      sorter: (a: ServicePackage, b: ServicePackage) =>
        a.total_duration - b.total_duration,
      render: (duration: number) => (
        <div style={{ color: "#1890ff" }}>{duration} phút</div>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 120,
      render: (_: unknown, record: ServicePackage) => {
        if (record.is_deleted) {
          return <Tag color="default">Đã xóa</Tag>;
        }
        return (
          <Tag color={record.is_active ? "green" : "red"}>
            {record.is_active ? "Hoạt động" : "Không hoạt động"}
          </Tag>
        );
      },
      filters: [
        { text: "Hoạt động", value: "active" },
        { text: "Không hoạt động", value: "inactive" },
        { text: "Đã xóa", value: "deleted" },
      ],
      onFilter: (value: boolean | React.Key, record: ServicePackage) => {
        const stringValue = String(value);
        if (stringValue === "active")
          return record.is_active && !record.is_deleted;
        if (stringValue === "inactive")
          return !record.is_active && !record.is_deleted;
        if (stringValue === "deleted") return record.is_deleted || false;
        return true;
      },
    },
  ];

  // Handlers
  const handleAdd = () => {
    setEditData(null);
    setEditModalVisible(true);
  };

  const handleEdit = (record: ServicePackage) => {
    setEditData(record);
    setEditModalVisible(true);
  };

  const handleView = (record: ServicePackage) => {
    setSelectedData(record);
    setDetailModalVisible(true);
  };

  const handleEditModalSuccess = () => {
    setEditModalVisible(false);
    setEditData(null);
    loadServicePackages(0, 100);
    setTableKey((prev) => prev + 1);
  };

  const handleToggleStatus = (record: ServicePackage) => {
    const action = record.is_active ? "ngừng hoạt động" : "kích hoạt";
    showModal({
      title: record.is_active ? "Ngừng hoạt động" : "Kích hoạt",
      content: `Bạn có chắc chắn muốn ${action} gói dịch vụ ${record.package_name}?`,
      type: record.is_active ? "warning" : "success",
      onConfirm: async () => {
        try {
          await servicePackageService.updateServicePackageStatus(
            record.package_id,
            { is_active: !record.is_active }
          );
          message.success(`${action} gói dịch vụ thành công!`);
          loadServicePackages(0, 100);
        } catch (error) {
          message.error(`Có lỗi xảy ra khi ${action} gói dịch vụ`);
          console.error("Error updating package status:", error);
        }
      },
    });
  };

  // Handle pagination changes (client-side pagination)
  const handlePaginationChange = (page: number, pageSize?: number) => {
    console.log("Pagination changed:", { page, pageSize });
    setPagination({
      current: page,
      pageSize: pageSize || pagination.pageSize,
      total: filteredData.length,
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
                placeholder="Tên, URL gói dịch vụ..."
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
                Loại gói
              </label>
              <Select
                placeholder="Chọn loại gói"
                value={filters.packageType}
                onChange={(value) =>
                  setFilters({ ...filters, packageType: value })
                }
                allowClear
                style={{ width: "100%" }}
              >
                <Option value="MAINTENANCE">Bảo dưỡng</Option>
                <Option value="REPAIR">Sửa chữa</Option>
                <Option value="INSPECTION">Kiểm tra</Option>
                <Option value="CLEANING">Vệ sinh</Option>
                <Option value="CUSTOM">Tùy chỉnh</Option>
              </Select>
            </div>
          </Col>
        </Row>
      </Card>

      <AdminTable
        key={tableKey}
        title="Quản lý gói dịch vụ"
        dataSource={paginatedData}
        columns={packageColumns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onEditCondition={(record: ServicePackage) => !record.is_deleted}
        rowKey="package_id"
        actions={[
          {
            key: "toggle-status",
            label: (record: ServicePackage) =>
              record.is_active ? "Ngừng hoạt động" : "Kích hoạt",
            type: "default",
            danger: (record: ServicePackage) => record.is_active,
            onClick: handleToggleStatus,
            condition: (record: ServicePackage) => !record.is_deleted,
          },
        ]}
        onView={handleView}
        addButtonText="Thêm gói dịch vụ"
        searchable={false}
        scroll={{ x: 1200 }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: number, range: [number, number]) =>
            `${range[0]}-${range[1]} của ${total} gói dịch vụ`,
          onChange: handlePaginationChange,
        }}
      />
    </div>
  );
};

export default ServicePackagesPage;
