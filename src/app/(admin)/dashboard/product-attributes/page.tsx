"use client";
import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Badge,
  Typography,
  Divider,
  Popconfirm,
  message,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { AdminTable } from "@/components/ui/Table";
import { ProductAttributeModal } from "@/components/ui/Modal/ProductAttributeModals";
import {
  useProductAttributes,
  useUpdateProductAttributeStatus,
  useDeleteProductAttribute,
} from "@/lib/api/hooks/useProductManagement";
import { ProductAttribute, ProductAttributeFilters } from "@/lib/api/types/product.types";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const ProductAttributesPage: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<ProductAttribute | null>(null);
  const [filters, setFilters] = useState<ProductAttributeFilters>({
    is_active: true,
  });

  const { data: attributesData, isLoading, refetch } = useProductAttributes({
    page: 0,
    size: 10,
    filters,
  });

  const updateStatusMutation = useUpdateProductAttributeStatus();
  const deleteMutation = useDeleteProductAttribute();

  const attributes = attributesData?.data?.content || [];
  const totalElements = attributesData?.data?.totalElements || 0;

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

  const handleModalClose = () => {
    setModalVisible(false);
    setEditingAttribute(null);
  };

  const handleToggleStatus = async (record: ProductAttribute) => {
    try {
      await updateStatusMutation.mutateAsync({
        attributeId: record.attributeId,
        data: { is_active: !record.isActive },
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDelete = async (record: ProductAttribute) => {
    try {
      await deleteMutation.mutateAsync(record.attributeId);
    } catch (error) {
      console.error("Error deleting attribute:", error);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      is_active: true,
    });
  };

  const handleSearch = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      searchText: value,
    }));
  };

  const handleFilterChange = (key: keyof ProductAttributeFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
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

  const columns = [
    {
      title: "Mã thuộc tính",
      dataIndex: "attributeCode",
      key: "attributeCode",
      width: 150,
      render: (text: string) => <Text code>{text}</Text>,
    },
    {
      title: "Tên thuộc tính",
      dataIndex: "attributeName",
      key: "attributeName",
      width: 200,
      render: (text: string, record: ProductAttribute) => (
        <div>
          <Text strong>{text}</Text>
          {record.unit && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Đơn vị: {record.unit}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Loại dữ liệu",
      dataIndex: "dataType",
      key: "dataType",
      width: 120,
      render: (dataType: string) => (
        <Tag color={getDataTypeColor(dataType)}>
          {getDataTypeLabel(dataType)}
        </Tag>
      ),
    },
    {
      title: "Bắt buộc",
      dataIndex: "isRequired",
      key: "isRequired",
      width: 100,
      render: (isRequired: boolean) => (
        <Tag color={isRequired ? "red" : "default"}>
          {isRequired ? "Bắt buộc" : "Tùy chọn"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (isActive: boolean, record: ProductAttribute) => (
        <Badge
          status={record.isDeleted ? "default" : isActive ? "success" : "error"}
          text={
            record.isDeleted
              ? "Đã xóa"
              : isActive
                ? "Hoạt động"
                : "Tạm dừng"
          }
        />
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 150,
      render: (_: any, record: ProductAttribute) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
            title="Xem chi tiết"
          />
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Chỉnh sửa"
          />
          <Popconfirm
            title={`${record.isActive ? "Tạm dừng" : "Kích hoạt"} thuộc tính này?`}
            onConfirm={() => handleToggleStatus(record)}
            okText="Xác nhận"
            cancelText="Hủy"
          >
            <Button
              type="text"
              size="small"
              icon={<SettingOutlined />}
              title={record.isActive ? "Tạm dừng" : "Kích hoạt"}
            />
          </Popconfirm>
          <Popconfirm
            title="Xóa thuộc tính này?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDelete(record)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              title="Xóa"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              Quản lý thuộc tính sản phẩm
            </Title>
            <Text type="secondary">
              Quản lý các thuộc tính định nghĩa đặc tính của sản phẩm
            </Text>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              size="large"
            >
              Thêm thuộc tính
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Search
              placeholder="Tìm kiếm thuộc tính..."
              allowClear
              onSearch={handleSearch}
              style={{ width: "100%" }}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Loại dữ liệu"
              allowClear
              style={{ width: "100%" }}
              value={filters.dataType}
              onChange={(value) => handleFilterChange("dataType", value)}
            >
              <Option value="STRING">Chuỗi</Option>
              <Option value="NUMBER">Số</Option>
              <Option value="BOOLEAN">Boolean</Option>
              <Option value="DATE">Ngày</Option>
              <Option value="DECIMAL">Thập phân</Option>
              <Option value="INTEGER">Số nguyên</Option>
              <Option value="TEXT">Văn bản</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Bắt buộc"
              allowClear
              style={{ width: "100%" }}
              value={filters.isRequired}
              onChange={(value) => handleFilterChange("isRequired", value)}
            >
              <Option value={true}>Bắt buộc</Option>
              <Option value={false}>Tùy chọn</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Trạng thái"
              allowClear
              style={{ width: "100%" }}
              value={filters.is_active}
              onChange={(value) => handleFilterChange("is_active", value)}
            >
              <Option value={true}>Hoạt động</Option>
              <Option value={false}>Tạm dừng</Option>
              <Option value="deleted">Đã xóa</Option>
            </Select>
          </Col>
        </Row>
        <Divider style={{ margin: "16px 0" }} />
        <Row justify="space-between" align="middle">
          <Col>
            <Text type="secondary">
              Tổng cộng: <Text strong>{totalElements}</Text> thuộc tính
            </Text>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => refetch()}
                loading={isLoading}
              >
                Làm mới
              </Button>
              <Button onClick={handleResetFilters}>Đặt lại bộ lọc</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <AdminTable
          columns={columns}
          dataSource={attributes}
          loading={isLoading}
          pagination={{
            total: totalElements,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} thuộc tính`,
          }}
          rowKey="attributeId"
        />
      </Card>

      {/* Modal */}
      <ProductAttributeModal
        visible={modalVisible}
        onCancel={handleModalClose}
        editingAttribute={editingAttribute}
        onSuccess={() => {
          handleModalClose();
          refetch();
        }}
      />
    </div>
  );
};

export default ProductAttributesPage;
