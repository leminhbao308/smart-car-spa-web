"use client";
import React, { useState, useMemo } from "react";
import { AdminTable } from "@/components/ui/Table";
import { ProductTypeModal } from "@/components/ui/Modal/ProductTypeModals/ProductTypeModal";
import { ProductTypeDetailModal } from "@/components/ui/Modal/ProductTypeModals/ProductTypeDetailModal";
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
} from "antd";
import { FilterOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  useProductTypes,
} from "@/lib/api/hooks/useProductTypes";
import { ProductType } from "@/lib/api/types/product.types";

const { Search } = Input;
const { Option } = Select;

// Product Type Status Options
const PRODUCT_TYPE_STATUS_OPTIONS = [
  { value: true, label: "Hoạt động", color: "green" },
  { value: false, label: "Tạm dừng", color: "red" },
];

const ProductTypesPage: React.FC = () => {
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editingProductType, setEditingProductType] =
    useState<ProductType | null>(null);
  const [viewingProductType, setViewingProductType] =
    useState<ProductType | null>(null);

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

  // React Query hooks - get all data without filters
  const { data: productTypesData, isLoading } = useProductTypes({
    page: 0,
    size: 1000, // Get all data for client-side filtering
  });

  // Extract data from response and apply client-side filtering
  const productTypes = useMemo(() => {
    let filteredData = productTypesData?.data?.content || [];
    
    // Apply search filter
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filteredData = filteredData.filter((type: ProductType) =>
        type.product_type_name?.toLowerCase().includes(searchLower) ||
        type.product_type_code?.toLowerCase().includes(searchLower) ||
        type.description?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply status filter
    if (filters.status) {
      const isActive = filters.status === "true";
      filteredData = filteredData.filter((type: ProductType) => type.is_active === isActive);
    }
    
    return filteredData;
  }, [productTypesData, filters.searchText, filters.status]);

  // Client-side pagination for filtered data
  const paginatedProductTypes = useMemo(() => {
    const startIndex = (pagination.current - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return productTypes.slice(startIndex, endIndex);
  }, [productTypes, pagination.current, pagination.pageSize]);

  // Update pagination when filtered data changes
  React.useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      total: productTypes.length,
      current: 1, // Reset to first page when filters change
    }));
  }, [productTypes.length]);

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      status: undefined,
      searchText: undefined,
    });
  };

  // Định nghĩa columns cho loại sản phẩm
  const productTypeColumns: ColumnsType<ProductType> = [
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
      title: "Tên loại sản phẩm",
      key: "productType",
      width: 300,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>
            {record.product_type_name}
          </div>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>
            {record.product_type_code}
          </div>
          <div style={{ fontSize: 11, color: "#999", lineHeight: 1.3 }}>
            {record.description || "Không có mô tả"}
          </div>
        </div>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "category_name",
      key: "category_name",
      width: 150,
      render: (categoryName: string) => <Tag color="blue">{categoryName}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      width: 100,
      render: (isActive: boolean) => {
        const statusConfig = PRODUCT_TYPE_STATUS_OPTIONS.find(
          (s) => s.value === isActive
        );
        return <Tag color={statusConfig?.color}>{statusConfig?.label}</Tag>;
      },
      filters: PRODUCT_TYPE_STATUS_OPTIONS.map((status) => ({
        text: status.label,
        value: status.value.toString(),
      })),
      onFilter: (value, record) => record.is_active.toString() === value,
    },
  ];

  // Handlers
  const handleAdd = () => {
    setEditingProductType(null);
    setModalOpen(true);
  };

  const handleEdit = (record: ProductType) => {
    setEditingProductType(record);
    setModalOpen(true);
  };

  const handleView = (record: ProductType) => {
    setViewingProductType(record);
    setDetailModalOpen(true);
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
                placeholder="Tên, mã loại sản phẩm..."
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
                {PRODUCT_TYPE_STATUS_OPTIONS.map((status) => (
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
        title="Quản lý loại sản phẩm"
        dataSource={paginatedProductTypes}
        columns={productTypeColumns}
        loading={isLoading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        addButtonText="Thêm loại sản phẩm"
        searchable={false}
        scroll={{ x: 1200 }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: number, range: [number, number]) =>
            `${range[0]}-${range[1]} của ${total} loại sản phẩm`,
          onChange: (page: number, pageSize?: number) => {
            setPagination((prev) => ({
              ...prev,
              current: page,
              pageSize: pageSize || 10,
            }));
          },
        }}
      />

      <ProductTypeModal
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingProductType(null);
        }}
        onSuccess={() => {
          setModalOpen(false);
          setEditingProductType(null);
        }}
        initialData={editingProductType}
      />

      <ProductTypeDetailModal
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setViewingProductType(null);
        }}
        productType={viewingProductType}
      />
    </div>
  );
};

export default ProductTypesPage;
