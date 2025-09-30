"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Tag,
  Card,
  Row,
  Col,
  Input,
  Select,
  Button,
  Space,
  message,
  Tooltip,
} from "antd";
import {
  DeleteOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import AdminTable from "@/components/ui/Table/AdminTable";
import {
  ServicePackageModal,
  ServicePackageDetailModal,
} from "@/components/ui/Modal";
import { useConfirmationModalContext } from "@/components/ui/Modal";
import { servicePackageService } from "@/lib/api/services/service-package.service";
import {
  ServicePackage,
  SERVICE_PACKAGE_TYPE_OPTIONS,
} from "@/lib/api/types/service-package.types";
import formatCurrency from "@/components/utils/helper/currency.format.helper";

const { Option } = Select;

// Helper function to calculate package price
const calculatePackagePrice = (
  serviceCost: number,
  productCost: number
): number => {
  return serviceCost + productCost;
};

// Helper function to get display price
const getDisplayPrice = (
  packagePrice: number | null,
  serviceCost: number,
  productCost: number
): {
  price: number;
  isCalculated: boolean;
} => {
  if (packagePrice !== null && packagePrice > 0) {
    return { price: packagePrice, isCalculated: false };
  }
  return {
    price: calculatePackagePrice(serviceCost, productCost),
    isCalculated: true,
  };
};

const ServicePackagesPage = () => {
  const [data, setData] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableKey, setTableKey] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(
    null
  );
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingPackage, setViewingPackage] = useState<ServicePackage | null>(
    null
  );
  const { showModal } = useConfirmationModalContext();

  // Filter states
  const [filters, setFilters] = useState<{
    searchText?: string;
    status?: string;
    packageType?: string;
  }>({
    searchText: undefined,
    status: undefined,
    packageType: undefined,
  });

  // Load service packages data
  const loadServicePackages = async (page: number = 0, size: number = 10) => {
    try {
      setLoading(true);
      console.log("Loading service packages...", { page, size });
      const response = await servicePackageService.getAllServicePackages(
        page,
        size
      );
      console.log("Service packages loaded:", response.data?.length, "items");

      // New API structure: data is directly an array
      setData(response.data || []);

      // Since the new API doesn't provide pagination info, we'll handle it client-side
      setPagination({
        current: 1,
        pageSize: size,
        total: response.data?.length || 0,
      });
    } catch (error: unknown) {
      console.error("Error loading service packages:", error);

      let errorMessage = "Không thể tải danh sách gói dịch vụ";
      if (error && typeof error === "object" && "message" in error) {
        const errorObj = error as { message: string };
        errorMessage = errorObj.message;
      }

      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data function
  const refreshData = async () => {
    try {
      console.log("Refreshing data...");
      await loadServicePackages(0, 100); // Load all data for client-side pagination
      setTableKey((prev) => prev + 1); // Force table re-render
      console.log("Data refreshed successfully");
    } catch (error: unknown) {
      console.error("Error refreshing data:", error);

      let errorMessage = "Không thể làm mới dữ liệu";
      if (error && typeof error === "object" && "message" in error) {
        const errorObj = error as { message: string };
        errorMessage = errorObj.message;
      }

      message.error(errorMessage);
    }
  };

  useEffect(() => {
    loadServicePackages(0, 100); // Load all data for client-side pagination
  }, []);

  // Debug: Log data changes
  useEffect(() => {
    console.log("Service package data updated:", data.length, "items");
  }, [data]);

  // Handle pagination changes (client-side pagination)
  const handlePaginationChange = (page: number, pageSize?: number) => {
    console.log("Pagination changed:", { page, pageSize });
    setPagination({
      current: page,
      pageSize: pageSize || pagination.pageSize,
      total: data.length,
    });
  };

  // Filtered data with client-side pagination
  const filteredData = useMemo(() => {
    let filtered = [...(data || [])];

    // Search filter
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.packageName.toLowerCase().includes(searchLower) ||
          item.packageUrl.toLowerCase().includes(searchLower) ||
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

    // Package type filter
    if (filters.packageType) {
      filtered = filtered.filter(
        (item) => item.packageType === filters.packageType
      );
    }

    // Update pagination total when filters change
    setPagination((prev) => ({
      ...prev,
      total: filtered.length,
      current: 1, // Reset to first page when filters change
    }));

    return filtered;
  }, [data, filters]);

  // Paginated data for display
  const paginatedData = useMemo(() => {
    const startIndex = (pagination.current - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, pagination.current, pagination.pageSize]);

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      searchText: undefined,
      status: undefined,
      packageType: undefined,
    });
  };

  const columns = [
    {
      title: "Tên gói dịch vụ",
      key: "package",
      width: 300,
      render: (_: unknown, record: ServicePackage) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>
            {record.packageName}
          </div>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>
            {record.description}
          </div>
          <div style={{ fontSize: 11, color: "#999" }}>
            URL: {record.packageUrl}
          </div>
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
      title: "Giá gói",
      key: "pricing",
      width: 200,
      sorter: (a: ServicePackage, b: ServicePackage) => {
        const priceA = getDisplayPrice(
          a.packagePrice,
          a.serviceCost,
          a.productCost
        ).price;
        const priceB = getDisplayPrice(
          b.packagePrice,
          b.serviceCost,
          b.productCost
        ).price;
        return priceA - priceB;
      },
      render: (_: unknown, record: ServicePackage) => {
        const { price, isCalculated } = getDisplayPrice(
          record.packagePrice,
          record.serviceCost,
          record.productCost
        );
        const totalCost = record.serviceCost + record.productCost;

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
              {isCalculated && (
                <Tooltip title="Giá được tính tự động từ tổng chi phí dịch vụ và sản phẩm">
                  <span
                    style={{
                      fontSize: 10,
                      color: "#1890ff",
                      background: "#e6f7ff",
                      padding: "1px 4px",
                      borderRadius: 2,
                      cursor: "help",
                    }}
                  >
                    Tự động
                  </span>
                </Tooltip>
              )}
            </div>
            <div style={{ fontSize: 11, color: "#666" }}>
              DV: {formatCurrency(record.serviceCost)}
            </div>
            <div style={{ fontSize: 11, color: "#666" }}>
              SP: {formatCurrency(record.productCost)}
            </div>
            <div style={{ fontSize: 10, color: "#999", marginTop: 2 }}>
              Tổng: {formatCurrency(totalCost)}
              {isCalculated && price === totalCost && (
                <span style={{ color: "#52c41a", marginLeft: 4 }}>✓</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "Thời gian",
      dataIndex: "totalDuration",
      key: "totalDuration",
      width: 100,
      sorter: (a: ServicePackage, b: ServicePackage) =>
        a.totalDuration - b.totalDuration,
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
          <Tag color={record.isActive ? "green" : "red"}>
            {record.isActive ? "Hoạt động" : "Không hoạt động"}
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
          return record.isActive && !record.is_deleted;
        if (stringValue === "inactive")
          return !record.isActive && !record.is_deleted;
        if (stringValue === "deleted") return record.is_deleted || false;
        return true;
      },
    },
  ];

  // Handlers
  const handleAdd = () => {
    setEditingPackage(null);
    setModalOpen(true);
  };

  const handleEdit = (record: ServicePackage) => {
    setEditingPackage(record);
    setModalOpen(true);
  };

  const handleView = (record: ServicePackage) => {
    setViewingPackage(record);
    setViewModalOpen(true);
  };

  const handleToggleStatus = (record: ServicePackage) => {
    const action = record.isActive ? "ngừng hoạt động" : "kích hoạt";
    showModal({
      title: record.isActive ? "Ngừng hoạt động" : "Kích hoạt",
      content: `Bạn có chắc chắn muốn ${action} gói dịch vụ ${record.packageName}?`,
      type: record.isActive ? "warning" : "success",
      onConfirm: async () => {
        // Optimistic update - update UI immediately
        setData((prevData) =>
          prevData.map((pkg) =>
            pkg.packageId === record.packageId
              ? { ...pkg, isActive: !record.isActive }
              : pkg
          )
        );

        try {
          console.log("Updating service package status...", {
            packageId: record.packageId,
            newStatus: !record.isActive,
          });
          const updatedPackage =
            await servicePackageService.updateServicePackageStatus(
              record.packageId,
              {
                is_active: !record.isActive,
              }
            );
          message.success(`${action} gói dịch vụ thành công!`);
          console.log(
            "Service package status updated successfully",
            updatedPackage
          );

          // Update with the actual response data if available
          if (updatedPackage && updatedPackage.isActive !== undefined) {
            setData((prevData) =>
              prevData.map((pkg) =>
                pkg.packageId === record.packageId
                  ? { ...pkg, isActive: updatedPackage.isActive }
                  : pkg
              )
            );
          }
        } catch (error: unknown) {
          // Revert optimistic update on error
          setData((prevData) =>
            prevData.map((pkg) =>
              pkg.packageId === record.packageId
                ? { ...pkg, isActive: record.isActive }
                : pkg
            )
          );

          let errorMessage = `Có lỗi xảy ra khi ${action} gói dịch vụ`;
          if (error && typeof error === "object" && "message" in error) {
            const errorObj = error as { message: string };
            errorMessage = errorObj.message;
          }

          message.error(errorMessage);
          console.error("Error updating service package status:", error);
        }
      },
    });
  };

  const handleDelete = (record: ServicePackage) => {
    showModal({
      title: "Xóa gói dịch vụ",
      content: `Bạn có chắc chắn muốn xóa gói dịch vụ ${record.packageName}? Hành động này không thể hoàn tác.`,
      type: "error",
      onConfirm: async () => {
        try {
          await servicePackageService.deleteServicePackage(record.packageId);
          message.success("Xóa gói dịch vụ thành công!");

          // Update the service package as deleted in local state immediately
          setData((prevData) =>
            prevData.map((pkg) =>
              pkg.packageId === record.packageId
                ? { ...pkg, is_deleted: true }
                : pkg
            )
          );

          console.log("Service package marked as deleted in local state:", {
            packageId: record.packageId,
            packageName: record.packageName,
            is_deleted: true,
          });
        } catch (error: unknown) {
          console.error("Error deleting service package:", error);

          let errorMessage = "Có lỗi xảy ra khi xóa gói dịch vụ";
          if (error && typeof error === "object" && "message" in error) {
            const errorObj = error as { message: string };
            errorMessage = errorObj.message;
          }

          message.error(errorMessage);
        }
      },
    });
  };

  const handleModalOk = async (packageData: unknown) => {
    try {
      // Type assertion for packageData
      const data = packageData as {
        packageName: string;
        packageUrl: string;
        categoryId: string;
        description: string;
        packageType: string;
        imageUrls: string;
        packageProducts?: {
          productId: string;
          quantity: number;
          unitPrice: number;
          notes?: string;
          isRequired: boolean;
        }[];
        packageServices?: {
          serviceId: string;
          quantity: number;
          unitPrice: number;
          notes?: string;
          isRequired: boolean;
        }[];
      };

      if (editingPackage) {
        // Update existing service package
        await servicePackageService.updateServicePackage(
          editingPackage.packageId,
          {
            package_name: data.packageName,
            package_url: data.packageUrl,
            category_id: data.categoryId,
            description: data.description,
            package_type: data.packageType as
              | "MAINTENANCE"
              | "REPAIR"
              | "INSPECTION"
              | "CLEANING"
              | "CUSTOM",
            image_urls: data.imageUrls,
            package_products: data.packageProducts || [],
            package_services: data.packageServices || [],
          }
        );
        message.success("Cập nhật gói dịch vụ thành công!");
      } else {
        // Add new service package
        await servicePackageService.createServicePackage({
          package_name: data.packageName,
          package_url: data.packageUrl,
          category_id: data.categoryId,
          description: data.description,
          package_type: data.packageType as
            | "MAINTENANCE"
            | "REPAIR"
            | "INSPECTION"
            | "CLEANING"
            | "CUSTOM",
          image_urls: data.imageUrls,
          package_products: data.packageProducts || [],
          package_services: data.packageServices || [],
        });
        message.success("Thêm gói dịch vụ thành công!");
      }

      // Close modal and refresh data after successful API call
      setModalOpen(false);
      setEditingPackage(null);
      // Refresh data immediately after successful API call
      await loadServicePackages(0, 100); // Load all data for client-side pagination
      setTableKey((prev) => prev + 1); // Force table re-render
    } catch (error: unknown) {
      console.error("Error saving service package:", error);

      let errorMessage = "Có lỗi xảy ra khi lưu gói dịch vụ";
      if (error && typeof error === "object" && "message" in error) {
        const errorObj = error as { message: string };
        errorMessage = errorObj.message;
      }

      message.error(errorMessage);
    }
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setEditingPackage(null);
  };

  const handleViewModalCancel = () => {
    setViewModalOpen(false);
    setViewingPackage(null);
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
              <Input
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
                {SERVICE_PACKAGE_TYPE_OPTIONS.map((type) => (
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
        title="Quản lý gói dịch vụ"
        dataSource={paginatedData}
        columns={columns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onEditCondition={(record: ServicePackage) => !record.is_deleted}
        rowKey="packageId"
        actions={[
          {
            key: "toggle-status",
            label: (record: ServicePackage) =>
              record.isActive ? "Ngừng hoạt động" : "Kích hoạt",
            type: "default",
            danger: (record: ServicePackage) => record.isActive,
            onClick: handleToggleStatus,
            condition: (record: ServicePackage) => !record.is_deleted,
          },
          {
            key: "delete",
            label: "Xóa",
            type: "default",
            danger: true,
            icon: <DeleteOutlined />,
            onClick: handleDelete,
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

      <ServicePackageModal
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        initialData={editingPackage}
        title={
          editingPackage ? "Chỉnh sửa gói dịch vụ" : "Thêm gói dịch vụ mới"
        }
      />

      <ServicePackageDetailModal
        open={viewModalOpen}
        onCancel={handleViewModalCancel}
        data={viewingPackage}
      />
    </div>
  );
};

export default ServicePackagesPage;
