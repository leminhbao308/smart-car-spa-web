"use client";
import React, { useState, useMemo } from "react";
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
  DatePicker,
  InputNumber,
} from "antd";
import { FilterOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  productsData,
  productStatuses,
} from "@/components/utils/data/products.data";
import { productCategoriesData } from "@/components/utils/data/product-categories.data";
import formatCurrency from "@/components/utils/helper/currency.format.helper";
import dayjs from "dayjs";

const { Search } = Input;
const { Option } = Select;

const ProductsPage = () => {
  const [productData, setProductData] = useState(productsData);
  const [loading, setLoading] = useState(false);
  const { showModal } = useConfirmationModalContext();

  // Modal states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [editData, setEditData] = useState<any>(null);

  // Filter states
  const [filters, setFilters] = useState<{
    status?: string;
    category?: string;
    searchText?: string;
  }>({
    status: undefined,
    category: undefined,
    searchText: undefined,
  });

  // Filtered data
  const filteredData = useMemo(() => {
    let filtered = [...productData];

    // Search filter
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.productCode.toLowerCase().includes(searchLower) ||
          item.brand.toLowerCase().includes(searchLower) ||
          item.categoryName.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((item) => item.status === filters.status);
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(
        (item) => item.categoryName === filters.category
      );
    }

    return filtered;
  }, [productData, filters]);

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      status: undefined,
      category: undefined,
      searchText: undefined,
    });
  };

  // Định nghĩa columns cho sản phẩm
  const productColumns: ColumnsType<any> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Mã sản phẩm",
      dataIndex: "productCode",
      key: "productCode",
      width: 120,
      sorter: (a, b) => a.productCode.localeCompare(b.productCode),
    },
    {
      title: "Tên sản phẩm",
      key: "product",
      width: 250,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>
            {record.name}
          </div>
          <div style={{ fontSize: 12, color: "#666" }}>{record.brand}</div>
        </div>
      ),
    },
    {
      title: "Loại sản phẩm",
      dataIndex: "categoryName",
      key: "categoryName",
      width: 120,
      render: (categoryName: string) => <Tag color="blue">{categoryName}</Tag>,
      filters: productCategoriesData.map((cat) => ({
        text: cat.categoryName,
        value: cat.categoryName,
      })),
      onFilter: (value, record) => record.categoryName === value,
    },
    {
      title: "Đơn vị",
      dataIndex: "unit",
      key: "unit",
      width: 80,
      render: (unit: string) => <Tag color="green">{unit}</Tag>,
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      key: "price",
      width: 120,
      sorter: (a, b) => a.price - b.price,
      render: (price: number) => (
        <div style={{ fontWeight: 500, color: "#52c41a" }}>
          {formatCurrency(price)}
        </div>
      ),
    },
    {
      title: "Tồn kho",
      key: "stock",
      width: 120,
      render: (_, record) => {
        const stockStatus =
          record.stock <= record.minStock
            ? "low"
            : record.stock >= record.maxStock
            ? "high"
            : "normal";
        const statusColor =
          stockStatus === "low"
            ? "#f5222d"
            : stockStatus === "high"
            ? "#fa8c16"
            : "#52c41a";
        return (
          <div>
            <div
              style={{ fontWeight: 500, marginBottom: 2, color: statusColor }}
            >
              {record.stock} {record.unit}
            </div>
            <div style={{ fontSize: 11, color: "#666" }}>
              Min: {record.minStock} | Max: {record.maxStock}
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
        const statusConfig = productStatuses.find((s) => s.value === status);
        return <Tag color={statusConfig?.color}>{statusConfig?.label}</Tag>;
      },
      filters: productStatuses.map((status) => ({
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

  const handleEdit = (record: any) => {
    setEditData(record);
    setEditModalVisible(true);
  };

  const handleSuspendSupply = (record: any) => {
    showModal({
      title: "Ngừng cung cấp",
      content: `Bạn có chắc chắn muốn ngừng cung cấp sản phẩm ${record.name}?`,
      type: "warning",
      onConfirm: async () => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setProductData(
          productData.map((item) =>
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

  const handleReactivate = (record: any) => {
    showModal({
      title: "Kích hoạt lại",
      content: `Bạn có chắc chắn muốn kích hoạt lại sản phẩm ${record.name}?`,
      type: "success",
      onConfirm: async () => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setProductData(
          productData.map((item) =>
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

  const handleView = (record: any) => {
    setSelectedData(record);
    setDetailModalVisible(true);
  };

  const handleEditModalSuccess = (data: any) => {
    if (editData) {
      // Update existing product
      setProductData(
        productData.map((item) => (item.id === data.id ? data : item))
      );
    } else {
      // Add new product
      const newProduct = {
        ...data,
        id: Math.max(...productData.map((p) => p.id)) + 1,
        createdAt: new Date().toISOString(),
      };
      setProductData([...productData, newProduct]);
    }
    setEditModalVisible(false);
    setEditData(null);
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
                placeholder="Tên, mã, thương hiệu..."
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
                {productStatuses.map((status) => (
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
                Loại sản phẩm
              </label>
              <Select
                placeholder="Chọn loại sản phẩm"
                value={filters.category}
                onChange={(value) =>
                  setFilters({ ...filters, category: value })
                }
                allowClear
                style={{ width: "100%" }}
              >
                {productCategoriesData.map((category) => (
                  <Option
                    key={category.categoryName}
                    value={category.categoryName}
                  >
                    {category.categoryName}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
        </Row>
      </Card>

      <AdminTable
        title="Quản lý sản phẩm"
        dataSource={filteredData}
        columns={productColumns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        actions={[
          {
            key: "suspend",
            label: (record: any) =>
              record.status === "active" ? "Ngừng cung cấp" : "Kích hoạt lại",
            type: "default",
            danger: (record: any) => record.status === "active",
            onClick: (record: any) =>
              record.status === "active"
                ? handleSuspendSupply(record)
                : handleReactivate(record),
          },
        ]}
        onView={handleView}
        addButtonText="Thêm sản phẩm"
        searchable={false}
        scroll={{ x: 1400 }}
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
