"use client";
import React, { useState, useMemo } from "react";
import { AdminTable } from "@/components/ui/Table";
import {
  useConfirmationModalContext,
  ProductCategoryDetailModal,
  ProductCategoryEditModal,
} from "@/components/ui/Modal";
import { ColumnsType } from "antd/es/table";
import { Tag, Badge, Card, Row, Col, Select, Input, Button, Space } from "antd";
import { FilterOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  productCategoriesData,
  categoryStatuses,
} from "@/components/utils/data/product-categories.data";
import { getCategoryColorProduct } from "@/components/utils/helper/category.color.helper";

const { Search } = Input;
const { Option } = Select;

const ProductCategoriesPage = () => {
  const [categoryData, setCategoryData] = useState(productCategoriesData);
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
    searchText?: string;
  }>({
    status: undefined,
    searchText: undefined,
  });

  // Filtered data
  const filteredData = useMemo(() => {
    let filtered = [...categoryData];

    // Search filter
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.categoryName.toLowerCase().includes(searchLower) ||
          item.categoryCode.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((item) => item.status === filters.status);
    }

    return filtered;
  }, [categoryData, filters]);

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      status: undefined,
      searchText: undefined,
    });
  };

  // Định nghĩa columns cho loại sản phẩm
  const categoryColumns: ColumnsType<any> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Icon",
      dataIndex: "icon",
      key: "icon",
      width: 80,
      render: (icon: string, record: any) => (
        <div
          style={{
            fontSize: 32,
            textAlign: "center",
            padding: "8px",
            backgroundColor: "#f0f0f0",
            borderRadius: "8px",
            border: `2px solid ${getCategoryColorProduct(record.color)}`,
          }}
        >
          {icon}
        </div>
      ),
    },
    {
      title: "Tên loại sản phẩm",
      key: "category",
      width: 300,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>
            {record.categoryName}
          </div>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>
            {record.categoryCode}
          </div>
          <div style={{ fontSize: 11, color: "#999", lineHeight: 1.3 }}>
            {record.description}
          </div>
        </div>
      ),
    },
    {
      title: "Sản phẩm",
      key: "products",
      width: 120,
      render: (_, record) => (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Badge
              count={record.totalProducts}
              style={{ backgroundColor: "#1890ff" }}
            />
            <span style={{ fontSize: 12 }}>Sản phẩm</span>
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => {
        const statusConfig = categoryStatuses.find((s) => s.value === status);
        return <Tag color={statusConfig?.color}>{statusConfig?.label}</Tag>;
      },
      filters: categoryStatuses.map((status) => ({
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

  const handleView = (record: any) => {
    setSelectedData(record);
    setDetailModalVisible(true);
  };

  const handleEditModalSuccess = (data: any) => {
    if (editData) {
      // Update existing category
      setCategoryData(
        categoryData.map((item) => (item.id === data.id ? data : item))
      );
    } else {
      // Add new category
      const newCategory = {
        ...data,
        id: Math.max(...categoryData.map((c) => c.id)) + 1,
        totalProducts: 0,
        createdAt: new Date().toISOString(),
      };
      setCategoryData([...categoryData, newCategory]);
    }
    setEditModalVisible(false);
    setEditData(null);
  };

  const handleToggleStatus = (record: any) => {
    const action = record.status === "active" ? "vô hiệu hóa" : "kích hoạt";
    showModal({
      title: `${
        action === "vô hiệu hóa" ? "Vô hiệu hóa" : "Kích hoạt"
      } danh mục`,
      content: `Bạn có chắc chắn muốn ${action} danh mục ${record.categoryName}?`,
      type: "warning",
      onConfirm: async () => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setCategoryData(
          categoryData.map((item) =>
            item.id === record.id
              ? {
                  ...item,
                  status: item.status === "active" ? "inactive" : "active",
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
                placeholder="Tên, mã, mô tả..."
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
                {categoryStatuses.map((status) => (
                  <Option key={status.value} value={status.value}>
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
        dataSource={filteredData}
        columns={categoryColumns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        addButtonText="Thêm loại sản phẩm"
        searchable={false}
        actions={[
          {
            key: "toggle-status",
            label: (record: any) =>
              record.status === "active" ? "Vô hiệu hóa" : "Kích hoạt",
            type: "default",
            danger: (record: any) => record.status === "active",
            onClick: handleToggleStatus,
          },
        ]}
        scroll={{ x: 1600 }}
      />

      {/* Modals */}
      <ProductCategoryDetailModal
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        data={selectedData}
      />

      <ProductCategoryEditModal
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onSuccess={handleEditModalSuccess}
        editData={editData}
      />
    </div>
  );
};

export default ProductCategoriesPage;
