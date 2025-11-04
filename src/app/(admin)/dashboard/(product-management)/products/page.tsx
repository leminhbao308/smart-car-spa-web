"use client";
import React, { useMemo, useState } from "react";
import { AdminTable } from "@/components/ui/Table";
import { ProductDetailModal, ProductModal } from "@/components/ui/Modal";
import { ProductImageCell } from "@/components/ui/Table/ProductImageCell";
import { ColumnsType } from "antd/es/table";
import { Tag, Card, Row, Col, Select, Input, Button, Space, Badge } from "antd";
import {
  FilterOutlined,
  ReloadOutlined,
  BarcodeOutlined,
} from "@ant-design/icons";
import { useProducts } from "@/lib/api/hooks/useProductManagement";
import { useActiveProductTypes } from "@/lib/api/hooks/useProductManagement";
import { Product, ProductFilters } from "@/lib/api/types/product.types";

const { Search } = Input;
const { Option } = Select;

const ProductsPage = () => {
  // Modal states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedData, setSelectedData] = useState<Product | null>(null);
  const [editData, setEditData] = useState<Product | null>(null);

  // Pagination and filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<ProductFilters>({
    searchText: undefined,
    productTypeId: undefined,
    is_active: undefined,
    isFeatured: undefined,
    is_reward: undefined,
    brand: undefined,
  });

  // API hooks - get all data without filters
  const {
    data: productsData,
    isLoading,
    refetch,
  } = useProducts({
    page: 0,
    size: 1000, // Get all data for client-side filtering
  });

  // Apply client-side filtering
  const products = useMemo(() => {
    let filteredData = productsData?.data?.content || [];

    // Apply search filter
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filteredData = filteredData.filter(
        (product: Product) =>
          product.product_name?.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower) ||
          product.sku?.toLowerCase().includes(searchLower)
      );
    }

    // Apply brand filter
    if (filters.brand) {
      const brandLower = filters.brand.toLowerCase();
      filteredData = filteredData.filter((product: Product) =>
        product.brand?.toLowerCase().includes(brandLower)
      );
    }

    // Apply product type filter
    if (filters.productTypeId) {
      filteredData = filteredData.filter(
        (product: Product) => product.product_type_id === filters.productTypeId
      );
    }

    // Apply status filter
    if (filters.isActive !== undefined) {
      filteredData = filteredData.filter(
        (product: Product) => product.is_active === filters.isActive
      );
    }

    // Apply featured filter
    if (filters.isFeatured !== undefined) {
      filteredData = filteredData.filter(
        (product: Product) => product.is_featured === filters.isFeatured
      );
    }

    // Apply reward filter
    if (filters.isReward !== undefined) {
      filteredData = filteredData.filter(
        (product: Product) => product.is_reward === filters.isReward
      );
    }

    return filteredData;
  }, [
    productsData,
    filters.searchText,
    filters.brand,
    filters.productTypeId,
    filters.isActive,
    filters.isFeatured,
    filters.isReward,
  ]);

  // Client-side pagination for filtered data
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return products.slice(startIndex, endIndex);
  }, [products, currentPage, pageSize]);

  const totalElements = products.length;

  const { data: productTypesData } = useActiveProductTypes();
  const productTypes = productTypesData || [];

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      searchText: undefined,
      productTypeId: undefined,
      is_active: undefined,
      isFeatured: undefined,
      is_reward: undefined,
      brand: undefined,
    });
    setCurrentPage(1);
  };

  // Định nghĩa columns cho sản phẩm
  const productColumns: ColumnsType<Product> = [
    {
      title: "Hình ảnh",
      key: "image",
      width: 100,
      render: (_, record) => (
        <ProductImageCell
          productId={record.product_id}
          productName={record.product_name}
          isFeatured={record.is_featured}
        />
      ),
    },
    {
      title: "Thông tin sản phẩm",
      key: "product",
      width: 300,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>
            {record.product_name}
          </div>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>
            <BarcodeOutlined style={{ marginRight: 4 }} />
            {record.sku}
          </div>
          <div style={{ fontSize: 12, color: "#666" }}>
            {record.brand} - {record.model}
          </div>
        </div>
      ),
    },
    {
      title: "Loại sản phẩm",
      dataIndex: "product_type_name",
      key: "product_type_name",
      width: 150,
      render: (productTypeName: string) => (
        <Tag color="blue">{productTypeName}</Tag>
      ),
    },
    {
      title: "Đơn vị",
      dataIndex: "unit_of_measure",
      key: "unit_of_measure",
      width: 80,
      render: (unit: string) => <Tag color="green">{unit}</Tag>,
    },
    {
      title: "Phân loại",
      key: "product_tags",
      width: 150,
      render: (_: unknown, record: Product) => (
        <Space
          direction="vertical"
          size={4}
        >
          {record.is_featured && (
            <Tag
              color="orange"
              style={{ fontSize: 11 }}
            >
              Nổi bật
            </Tag>
          )}
          {record.is_reward && (
            <Tag
              color="purple"
              style={{ fontSize: 11 }}
            >
              Sản phẩm tặng
            </Tag>
          )}
          {!record.is_featured && !record.is_reward && (
            <Tag
              color="default"
              style={{ fontSize: 11 }}
            >
              Thường
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      width: 120,
      render: (isActive: boolean) => {
        return (
          <Badge
            status={isActive ? "success" : "error"}
            text={isActive ? "Hoạt động" : "Tạm dừng"}
          />
        );
      },
    },
  ];

  // Handlers
  const handleAdd = () => {
    setEditData(null);
    setEditModalVisible(true);
  };

  const handleEdit = (record: Product) => {
    setEditData(record);
    setEditModalVisible(true);
  };

  const handleView = (record: Product) => {
    setSelectedData(record);
    setDetailModalVisible(true);
  };

  const handleEditModalSuccess = () => {
    setEditModalVisible(false);
    setEditData(null);
    refetch();
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
          <Col
            xs={24}
            sm={12}
            md={6}
          >
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
                placeholder="Tên, SKU, thương hiệu..."
                value={filters.searchText}
                onChange={(e) =>
                  setFilters({ ...filters, searchText: e.target.value })
                }
                allowClear
              />
            </div>
          </Col>
          <Col
            xs={24}
            sm={12}
            md={6}
          >
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
                value={filters.isActive}
                onChange={(value) =>
                  setFilters({ ...filters, is_active: value })
                }
                allowClear
                style={{ width: "100%" }}
              >
                <Option value={true}>Hoạt động</Option>
                <Option value={false}>Tạm dừng</Option>
                <Option value="deleted">Đã xóa</Option>
              </Select>
            </div>
          </Col>
          <Col
            xs={24}
            sm={12}
            md={6}
          >
            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "#666",
                  marginBottom: 4,
                  display: "block",
                }}
              >
                Loại sản phẩm
              </label>
              <Select
                placeholder="Chọn loại sản phẩm"
                value={filters.productTypeId}
                onChange={(value) =>
                  setFilters({ ...filters, productTypeId: value })
                }
                allowClear
                style={{ width: "100%" }}
              >
                {productTypes.map((productType) => (
                  <Option
                    key={productType.product_type_id}
                    value={productType.product_type_id}
                  >
                    {productType.product_type_name}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>

          <Col
            xs={24}
            sm={12}
            md={6}
          >
            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "#666",
                  marginBottom: 4,
                  display: "block",
                }}
              >
                Sản phẩm nổi bật
              </label>
              <Select
                placeholder="Chọn trạng thái nổi bật"
                value={filters.isFeatured}
                onChange={(value) =>
                  setFilters({ ...filters, isFeatured: value })
                }
                allowClear
                style={{ width: "100%" }}
              >
                <Option value={true}>Nổi bật</Option>
                <Option value={false}>Không nổi bật</Option>
              </Select>
            </div>
          </Col>

          <Col
            xs={24}
            sm={12}
            md={6}
          >
            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "#666",
                  marginBottom: 4,
                  display: "block",
                }}
              >
                Loại sản phẩm
              </label>
              <Select
                placeholder="Chọn loại sản phẩm"
                value={filters.isReward}
                onChange={(value) =>
                  setFilters({ ...filters, is_reward: value })
                }
                allowClear
                style={{ width: "100%" }}
              >
                <Option value={false}>Sản phẩm bán</Option>
                <Option value={true}>Sản phẩm tặng</Option>
              </Select>
            </div>
          </Col>
        </Row>
      </Card>

      <AdminTable
        title="Quản lý sản phẩm"
        dataSource={paginatedProducts}
        columns={productColumns}
        loading={isLoading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        addButtonText="Thêm sản phẩm"
        searchable={false}
        scroll={{ x: 1400 }}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalElements,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: number, range: [number, number]) =>
            `${range[0]}-${range[1]} của ${total} sản phẩm`,
          onChange: (page: number, size: number) => {
            setCurrentPage(page);
            setPageSize(size);
          },
        }}
      />

      {/* Modals */}
      <ProductDetailModal
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        data={selectedData}
      />

      <ProductModal
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onSuccess={handleEditModalSuccess}
        editData={editData}
      />
    </div>
  );
};

export default ProductsPage;
