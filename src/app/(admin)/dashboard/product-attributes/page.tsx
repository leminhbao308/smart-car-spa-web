"use client";
import React, { useState, useMemo } from "react";
import { AdminTable } from "@/components/ui/Table";
import ProductAttributeModal from "@/components/ui/Modal/ProductAttributeModals/ProductAttributeModal";
import { ColumnsType } from "antd/es/table";
import { Tag, Card, Row, Col, Select, Input, Button, Space, message } from "antd";
import { FilterOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  useProductAttributes,
  useUpdateProductAttributeStatus,
} from "@/lib/api/hooks/useProductAttributes";
import { ProductAttribute } from "@/lib/api/types/product.types";

const { Search } = Input;
const { Option } = Select;

// Product Attribute Status Options
const PRODUCT_ATTRIBUTE_STATUS_OPTIONS = [
  { value: true, label: "Hoạt động", color: "green" },
  { value: false, label: "Tạm dừng", color: "red" },
];

const ProductAttributesPage: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<ProductAttribute | null>(null);
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

  // React Query hooks
  const { data: attributesData, isLoading } = useProductAttributes({});
  const updateStatusMutation = useUpdateProductAttributeStatus();

  // Extract data from response
  const attributes = useMemo(() => {
    return attributesData?.data?.content || [];
  }, [attributesData]);

  // Update pagination when data changes
  React.useEffect(() => {
    if (attributesData?.data) {
      setPagination(prev => ({
        ...prev,
        total: attributesData.data.totalElements || 0,
      }));
    }
  }, [attributesData]);

  // Filtered data
  const filteredData = useMemo(() => {
    let filtered = [...attributes];

    // Search filter
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.attribute_name.toLowerCase().includes(searchLower) ||
          item.attribute_code.toLowerCase().includes(searchLower) ||
          (item.display_name && item.display_name.toLowerCase().includes(searchLower))
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((item) => item.is_active === (filters.status === "true"));
    }

    return filtered;
  }, [attributes, filters]);

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      status: undefined,
      searchText: undefined,
    });
  };

  const handleAdd = () => {
    setEditingAttribute(null);
    setModalVisible(true);
  };

  const handleEdit = (record: ProductAttribute) => {
    setEditingAttribute(record);
    setModalVisible(true);
  };

  const handleView = (record: ProductAttribute) => {
    setEditingAttribute(record);
    setModalVisible(true);
  };

  const handleToggleStatus = (record: ProductAttribute) => {
    const action = record.is_active ? "vô hiệu hóa" : "kích hoạt";
    // You can add confirmation modal here if needed
    updateStatusMutation.mutateAsync({
      attributeId: record.attribute_id,
      data: { is_active: !record.is_active },
    });
    message.success(`${action} thuộc tính thành công!`);
  };

  const getDataTypeColor = (dataType: string) => {
    const colors: Record<string, string> = {
      STRING: "blue",
      NUMBER: "green",
      BOOLEAN: "orange",
      DATE: "purple",
      DECIMAL: "cyan",
      INTEGER: "lime",
      TEXT: "magenta",
    };
    return colors[dataType] || "default";
  };

  const getDataTypeLabel = (dataType: string) => {
    const labels: Record<string, string> = {
      STRING: "Chuỗi",
      NUMBER: "Số",
      BOOLEAN: "Boolean",
      DATE: "Ngày",
      DECIMAL: "Thập phân",
      INTEGER: "Số nguyên",
      TEXT: "Văn bản",
    };
    return labels[dataType] || dataType;
  };

  // Định nghĩa columns cho thuộc tính sản phẩm
  const productAttributeColumns: ColumnsType<ProductAttribute> = [
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
      title: "Tên thuộc tính",
      key: "productAttribute",
      width: 300,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>
            {record.attribute_name}
          </div>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>
            {record.attribute_code}
          </div>
          {record.unit && (
            <div style={{ fontSize: 11, color: "#999", lineHeight: 1.3 }}>
              Đơn vị: {record.unit}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Loại dữ liệu",
      dataIndex: "data_type",
      key: "data_type",
      width: 120,
      render: (dataType: string) => (
        <Tag color={getDataTypeColor(dataType)}>
          {getDataTypeLabel(dataType)}
        </Tag>
      ),
    },
    {
      title: "Bắt buộc",
      dataIndex: "is_required",
      key: "is_required",
      width: 100,
      render: (isRequired: boolean) => (
        <Tag color={isRequired ? "red" : "default"}>
          {isRequired ? "Bắt buộc" : "Tùy chọn"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      width: 100,
      render: (isActive: boolean) => {
        const statusConfig = PRODUCT_ATTRIBUTE_STATUS_OPTIONS.find(
          (s) => s.value === isActive
        );
        return <Tag color={statusConfig?.color}>{statusConfig?.label}</Tag>;
      },
      filters: PRODUCT_ATTRIBUTE_STATUS_OPTIONS.map((status) => ({
        text: status.label,
        value: status.value.toString(),
      })),
      onFilter: (value, record) => record.is_active.toString() === value,
    },
  ];

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
                placeholder="Tên, mã thuộc tính..."
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
                {PRODUCT_ATTRIBUTE_STATUS_OPTIONS.map((status) => (
                  <Option key={status.value.toString()} value={status.value.toString()}>
                    {status.label}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
        </Row>
      </Card>

      <AdminTable
        title="Quản lý thuộc tính sản phẩm"
        dataSource={filteredData}
        columns={productAttributeColumns}
        loading={isLoading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        addButtonText="Thêm thuộc tính"
        searchable={false}
        actions={[
          {
            key: "toggle-status",
            label: (record: ProductAttribute) =>
              record.is_active ? "Vô hiệu hóa" : "Kích hoạt",
            type: "default",
            danger: (record: ProductAttribute) => record.is_active,
            onClick: handleToggleStatus,
          },
        ]}
        scroll={{ x: 1200 }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: number, range: [number, number]) =>
            `${range[0]}-${range[1]} của ${total} thuộc tính`,
          onChange: (page: number, pageSize?: number) => {
            setPagination(prev => ({
              ...prev,
              current: page,
              pageSize: pageSize || 10,
            }));
          },
        }}
      />

      <ProductAttributeModal
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingAttribute(null);
        }}
        editingAttribute={editingAttribute}
        onSuccess={() => {
          setModalVisible(false);
          setEditingAttribute(null);
        }}
      />
    </div>
  );
};

export default ProductAttributesPage;
