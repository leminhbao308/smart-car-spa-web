import React, { useState } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Switch,
  Popconfirm,
  Input,
  Select,
  Tooltip,
  Typography,
  Card,
  Row,
  Col,
  Badge,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FolderOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { CategoryTreeNode, Category } from "@/lib/api/types/category.types";
import {
  useCategoriesTree,
  useDeleteCategory,
  useUpdateCategoryStatus,
} from "@/lib/api/hooks/useCategory";

const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;

interface CategoryTreeTableProps {
  onEdit: (category: Category) => void;
  onAddSubCategory: (parentCategory: Category) => void;
  onAddRootCategory: () => void;
}

const CategoryTreeTable: React.FC<CategoryTreeTableProps> = ({
  onEdit,
  onAddSubCategory,
  onAddRootCategory,
}) => {
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const { treeData, isLoading } = useCategoriesTree();
  const deleteCategoryMutation = useDeleteCategory();
  const updateStatusMutation = useUpdateCategoryStatus();

  // Filter data based on search and filters
  const filteredData = React.useMemo(() => {
    let filtered = treeData;

    // Search filter
    if (searchText) {
      filtered = filtered.filter(
        (item) =>
          item.category_name.toLowerCase().includes(searchText.toLowerCase()) ||
          item.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== "ALL") {
      filtered = filtered.filter((item) => item.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== "ALL") {
      const isActive = statusFilter === "ACTIVE";
      filtered = filtered.filter((item) => item.is_active === isActive);
    }

    return filtered;
  }, [treeData, searchText, typeFilter, statusFilter]);

  const handleDelete = async (categoryId: string) => {
    try {
      await deleteCategoryMutation.mutateAsync(categoryId);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleToggleStatus = async (categoryId: string, isActive: boolean) => {
    try {
      await updateStatusMutation.mutateAsync({
        categoryId,
        isActive,
      });
    } catch (error) {
      console.error("Toggle status failed:", error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "PRODUCT":
        return "blue";
      case "SERVICE":
        return "green";
      default:
        return "default";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "PRODUCT":
        return "Sản phẩm";
      case "SERVICE":
        return "Dịch vụ";
      case "PRODUCT_SYS":
        return "Sản phẩm hệ thống";
      case "SERVICE_SYS":
        return "Dịch vụ hệ thống";
      case "PROMOTION_SYS":
        return "Khuyến mãi hệ thống";
      default:
        return "Khác";
    }
  };

  const columns: ColumnsType<CategoryTreeNode> = [
    {
      title: "Tên danh mục",
      dataIndex: "category_name",
      key: "category_name",
      width: "30%",
      render: (text: string, record: CategoryTreeNode) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {record.children && record.children.length > 0 ? (
            <FolderOpenOutlined style={{ color: "#1890ff" }} />
          ) : (
            <FolderOutlined style={{ color: "#8c8c8c" }} />
          )}
          <div>
            <Text strong>{text}</Text>
            {record.description && (
              <div>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {record.description}
                </Text>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "URL",
      dataIndex: "category_url",
      key: "category_url",
      width: "20%",
      render: (text: string) => (
        <Text code style={{ fontSize: "12px" }}>
          /{text}
        </Text>
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: "10%",
      render: (type: string) => (
        <Tag color={getTypeColor(type)}>{getTypeLabel(type)}</Tag>
      ),
    },
    {
      title: "Sub-categories",
      key: "subcategories_count",
      width: "10%",
      render: (_, record: CategoryTreeNode) => (
        <Badge
          count={record.subcategories?.length || 0}
          style={{ backgroundColor: "#52c41a" }}
        />
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      width: "10%",
      render: (isActive: boolean, record: CategoryTreeNode) => (
        <Switch
          checked={isActive}
          onChange={(checked) =>
            handleToggleStatus(record.category_id, checked)
          }
          loading={updateStatusMutation.isPending}
        />
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      width: "20%",
      render: (_, record: CategoryTreeNode) => (
        <Space size="small">
          <Tooltip title="Thêm sub-category">
            <Button
              type="text"
              icon={<PlusOutlined />}
              onClick={() => onAddSubCategory(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="Xóa danh mục"
            description="Bạn có chắc chắn muốn xóa danh mục này?"
            onConfirm={() => handleDelete(record.category_id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
                loading={deleteCategoryMutation.isPending}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      {/* Header với search và filters */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8}>
          <Search
            placeholder="Tìm kiếm danh mục..."
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
          />
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Select
            placeholder="Loại"
            value={typeFilter}
            onChange={setTypeFilter}
            style={{ width: "100%" }}
          >
            <Option value="ALL">Tất cả</Option>
            <Option value="PRODUCT">Sản phẩm</Option>
            <Option value="SERVICE">Dịch vụ</Option>
            <Option value="OTHER">Khác</Option>
          </Select>
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Select
            placeholder="Trạng thái"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: "100%" }}
          >
            <Option value="ALL">Tất cả</Option>
            <Option value="ACTIVE">Hoạt động</Option>
            <Option value="INACTIVE">Không hoạt động</Option>
          </Select>
        </Col>
        <Col xs={24} sm={24} md={8} style={{ textAlign: "right" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onAddRootCategory}
          >
            Thêm danh mục gốc
          </Button>
        </Col>
      </Row>

      {/* Tree Table */}
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="category_id"
        loading={isLoading}
        pagination={false}
        size="small"
        expandable={{
          defaultExpandAllRows: false,
          childrenColumnName: "children",
          expandRowByClick: false,
        }}
        scroll={{ x: 800 }}
      />
    </Card>
  );
};

export default CategoryTreeTable;
