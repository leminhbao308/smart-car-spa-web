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
  Image,
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
} from "@/lib/api/hooks/useProducts";
import { productService } from "@/lib/api/services/product.service";
import { useCategories } from "@/lib/api/hooks/useCategory";
import { Product, ProductFilters } from "@/lib/api/types/product.types";
import formatCurrency from "@/components/utils/helper/currency.format.helper";
import { message } from "antd";

const { Search } = Input;
const { Option } = Select;

const ProductsPage = () => {
  const { showModal } = useConfirmationModalContext();

  // Helper function to extract error message
  const getErrorMessage = (error: unknown, defaultMessage: string): string => {
    if (error && typeof error === 'object' && 'response' in error) {
      const response = (error as { response?: { data?: { message?: string } } }).response;
      return response?.data?.message || defaultMessage;
    }
    return defaultMessage;
  };

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
    categoryId: undefined,
    is_active: undefined,
    isFeatured: undefined,
    isTrackable: undefined,
    isConsumable: undefined,
  });

  // API hooks
  const { products, totalElements, isLoading, refetch } = useProducts({
    page: currentPage,
    size: pageSize,
    filters,
  });

  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.data?.content || [];

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      searchText: undefined,
      categoryId: undefined,
      is_active: undefined,
      isFeatured: undefined,
      isTrackable: undefined,
      isConsumable: undefined,
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
            {record.imageUrls?.main ? (
              <Image
                src={record.imageUrls.main}
                alt={record.productName}
                width={60}
                height={60}
                style={{
                  borderRadius: 8,
                  objectFit: "cover",
                  border: "2px solid #f0f0f0",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                preview={{
                  mask: <div style={{ color: 'white', fontSize: 12 }}>Xem</div>
                }}
              />
            ) : (
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
            )}
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
      title: "Danh mục",
      dataIndex: "categoryName",
      key: "categoryName",
      width: 120,
      render: (categoryName: string) => <Tag color="blue">{categoryName}</Tag>,
    },
    {
      title: "Đơn vị",
      dataIndex: "unitOfMeasure",
      key: "unitOfMeasure",
      width: 80,
      render: (unit: string) => <Tag color="green">{unit}</Tag>,
    },
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
    const action = record.is_active ? "tạm dừng" : "kích hoạt";
    showModal({
      title: record.is_active ? "Tạm dừng sản phẩm" : "Kích hoạt sản phẩm",
      content: `Bạn có chắc chắn muốn ${action} sản phẩm ${record.productName}?`,
      type: record.is_active ? "warning" : "success",
      onConfirm: async () => {
        try {
          await productService.updateProductStatus(record.productId, {
            is_active: !record.is_active
          });
          message.success("Cập nhật trạng thái sản phẩm thành công!");
          refetch(); // Refresh data
        } catch (error: unknown) {
          message.error(getErrorMessage(error, "Có lỗi xảy ra khi cập nhật trạng thái"));
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
          await productService.deleteProduct(record.productId);
          message.success("Xóa sản phẩm thành công!");
          refetch(); // Refresh data
        } catch (error: unknown) {
          message.error(getErrorMessage(error, "Có lỗi xảy ra khi xóa sản phẩm"));
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
                Danh mục
              </label>
              <Select
                placeholder="Chọn danh mục"
                value={filters.categoryId}
                onChange={(value) =>
                  setFilters({ ...filters, categoryId: value })
                }
                allowClear
                style={{ width: "100%" }}
              >
                {categories.map(
                  (category: {
                    category_id: string;
                    category_name: string;
                  }) => (
                    <Option
                      key={category.category_id}
                      value={category.category_id}
                    >
                      {category.category_name}
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
