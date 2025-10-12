"use client";
import React, { useState } from "react";
import { AdminTable } from "@/components/ui/Table";
import {
  useConfirmationModalContext,
  ProductDetailModal,
  ProductEditModal,
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
  Badge,
  Tooltip,
} from "antd";
import {
  FilterOutlined,
  ReloadOutlined,
  StarOutlined,
  ShoppingCartOutlined,
  BarcodeOutlined,
} from "@ant-design/icons";
import {
  useProducts,
  useUpdateProductStatus,
  useDeleteProduct,
} from "@/lib/api/hooks/useProductManagement";
import { useActiveProductTypes } from "@/lib/api/hooks/useProductManagement";
import { Product, ProductFilters } from "@/lib/api/types/product.types";

const { Search } = Input;
const { Option } = Select;

const ProductsPage = () => {
  const { showModal } = useConfirmationModalContext();


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
    brand: undefined,
  });

  // API hooks
  const { data: productsData, isLoading, refetch } = useProducts({
    page: currentPage - 1,
    size: pageSize,
    filters,
  });

  const products = productsData?.data?.content || [];
  const totalElements = productsData?.data?.totalElements || 0;

  const { data: productTypesData } = useActiveProductTypes();
  const productTypes = productTypesData || [];

  const updateStatusMutation = useUpdateProductStatus();
  const deleteMutation = useDeleteProduct();

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      searchText: undefined,
      productTypeId: undefined,
      is_active: undefined,
      isFeatured: undefined,
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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ position: "relative" }}>
            <div
              style={{
                width: 60,
                height: 60,
                backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                border: "2px solid #f0f0f0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}
            >
              <ShoppingCartOutlined style={{ fontSize: 20 }} />
            </div>
            {record.isFeatured && (
              <div
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  backgroundColor: "#faad14",
                  borderRadius: "50%",
                  width: 20,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                }}
              >
                <Tooltip title="Sản phẩm nổi bật">
                  <StarOutlined style={{ color: "#fff", fontSize: 10 }} />
                </Tooltip>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Thông tin sản phẩm",
      key: "product",
      width: 300,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>
            {record.productName}
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
      dataIndex: "productTypeName",
      key: "productTypeName",
      width: 150,
      render: (productTypeName: string) => <Tag color="blue">{productTypeName}</Tag>,
    },
    {
      title: "Đơn vị",
      dataIndex: "unitOfMeasure",
      key: "unitOfMeasure",
      width: 80,
      render: (unit: string) => <Tag color="green">{unit}</Tag>,
    },
    // {
    //   title: "Giá bán",
    //   dataIndex: "sellingPrice",
    //   key: "sellingPrice",
    //   width: 120,
    //   sorter: (a, b) => a.sellingPrice - b.sellingPrice,
    //   render: (price: number) => (
    //     <div style={{ fontWeight: 500, color: "#52c41a" }}>
    //       {formatCurrency(price)}
    //     </div>
    //   ),
    // },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      width: 120,
      render: (isActive: boolean, record: Product) => {
        if (record.is_deleted) {
          return (
            <Badge
              status="default"
              text="Đã xóa"
              style={{ color: "#999" }}
            />
          );
        }
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

  const handleToggleStatus = (record: Product) => {
    const action = record.isActive ? "tạm dừng" : "kích hoạt";
    showModal({
      title: record.isActive ? "Tạm dừng sản phẩm" : "Kích hoạt sản phẩm",
      content: `Bạn có chắc chắn muốn ${action} sản phẩm ${record.productName}?`,
      type: record.isActive ? "warning" : "success",
      onConfirm: async () => {
        try {
          await updateStatusMutation.mutateAsync({
            productId: record.productId,
            isActive: !record.isActive
          });
        } catch (error: unknown) {
          console.error("Failed to update status:", error);
        }
      },
    });
  };

  const handleDelete = (record: Product) => {
    showModal({
      title: "Xóa sản phẩm",
      content: `Bạn có chắc chắn muốn xóa sản phẩm ${record.productName}?`,
      type: "error",
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(record.productId);
        } catch (error: unknown) {
          console.error("Failed to delete:", error);
        }
      },
    });
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
                placeholder="Tên, SKU, thương hiệu..."
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
                value={filters.is_active}
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
                {productTypes.map(
                  (productType: {
                    productTypeId: string;
                    productTypeName: string;
                  }) => (
                    <Option
                      key={productType.productTypeId}
                      value={productType.productTypeId}
                    >
                      {productType.productTypeName}
                    </Option>
                  )
                )}
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
                Đặc điểm
              </label>
              <Select
                placeholder="Chọn đặc điểm"
                value={filters.isFeatured}
                onChange={(value) =>
                  setFilters({ ...filters, isFeatured: value })
                }
                allowClear
                style={{ width: "100%" }}
              >
                <Option value={true}>Sản phẩm nổi bật</Option>
                <Option value={false}>Sản phẩm thường</Option>
              </Select>
            </div>
          </Col>
        </Row>
      </Card>

      <AdminTable
        title="Quản lý sản phẩm"
        dataSource={products}
        columns={productColumns}
        loading={isLoading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onEditCondition={(record: Product) => !record.is_deleted}
        actions={[
          {
            key: "toggle-status",
            label: (record: Product) =>
              record.is_active ? "Tạm dừng" : "Kích hoạt",
            type: "default",
            danger: (record: Product) => record.is_active,
            onClick: handleToggleStatus,
            condition: (record: Product) => !record.is_deleted,
          },
          {
            key: "delete",
            label: "Xóa",
            type: "default",
            danger: true,
            onClick: handleDelete,
            condition: (record: Product) => !record.is_deleted,
          },
        ]}
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

      <ProductEditModal
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onSuccess={handleEditModalSuccess}
        editData={editData}
      />
    </div>
  );
};

export default ProductsPage;
