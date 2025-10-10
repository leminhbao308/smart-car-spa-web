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
  Modal,
  Descriptions,
  Divider,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
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
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryTreeNode | null>(null);

  const { treeData, isLoading } = useCategoriesTree();
  const deleteCategoryMutation = useDeleteCategory();
  const updateStatusMutation = useUpdateCategoryStatus();

  // Debug: Log tree data structure
  React.useEffect(() => {
    if (treeData.length > 0) {
      console.log("Tree Data Structure:", treeData);
      console.log("First root category:", treeData[0]);
      if (treeData[0]?.children) {
        console.log("First root children:", treeData[0].children);
      }
    }
  }, [treeData]);

  // Filter data based on search and filters
  const filteredData = React.useMemo(() => {
    let filtered = treeData;

    // Helper function to filter tree recursively
    const filterTree = (nodes: CategoryTreeNode[]): CategoryTreeNode[] => {
      return nodes
        .map((node) => {
          // Check if current node matches filters
          const matchesSearch =
            !searchText ||
            node.category_name
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            node.description.toLowerCase().includes(searchText.toLowerCase());

          const matchesType =
            typeFilter === "ALL" || node.category_type === typeFilter;

          const matchesStatus =
            statusFilter === "ALL" ||
            (statusFilter === "ACTIVE" && node.is_active) ||
            (statusFilter === "INACTIVE" && !node.is_active);

          const nodeMatches = matchesSearch && matchesType && matchesStatus;

          // Filter children recursively
          const filteredChildren = node.children
            ? filterTree(node.children)
            : [];

          // Include node if it matches OR has matching children
          if (nodeMatches || filteredChildren.length > 0) {
            return {
              ...node,
              children: filteredChildren,
            };
          }

          return null;
        })
        .filter(Boolean) as CategoryTreeNode[];
    };

    // Apply filters recursively
    filtered = filterTree(filtered);

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

  // Handle expand/collapse when clicking on category name
  const handleCategoryNameClick = (record: CategoryTreeNode) => {
    if (record.children && record.children.length > 0) {
      const isExpanded = expandedRowKeys.includes(record.category_id);
      if (isExpanded) {
        // Collapse
        setExpandedRowKeys((prev) =>
          prev.filter((key) => key !== record.category_id)
        );
      } else {
        // Expand
        setExpandedRowKeys((prev) => [...prev, record.category_id]);
      }
    }
  };

  // Handle view category details
  const handleViewDetails = (record: CategoryTreeNode) => {
    setSelectedCategory(record);
    setDetailModalVisible(true);
  };

  // Handle close detail modal
  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedCategory(null);
  };


  const getTypeColor = (type: string) => {
    switch (type) {
      case "PRODUCT":
        return "blue";
      case "SERVICE":
        return "green";
      case "PROMOTION":
        return "orange";
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
      case "PROMOTION":
        return "Khuyến mãi";
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
      render: (text: string, record: CategoryTreeNode) => {
        const hasChildren = record.children && record.children.length > 0;
        const isExpanded = expandedRowKeys.includes(record.category_id);

        // Enhanced tree structure with visual hierarchy
        const getTreePrefix = () => {
          const levelIndent = record.level * 20; // 20px per level
          
          return (
            <div style={{ display: "flex", alignItems: "center" }}>
              {/* Level indentation */}
              <div style={{ width: levelIndent }} />
              
              {/* Expand/collapse icon or bullet */}
              <div
                style={{
                  width: 20,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "4px",
                  backgroundColor: hasChildren ? "#f0f0f0" : "transparent",
                  border: hasChildren ? "1px solid #d9d9d9" : "none",
                  cursor: hasChildren ? "pointer" : "default",
                  transition: "all 0.2s ease",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (hasChildren) {
                    handleCategoryNameClick(record);
                  }
                }}
              >
                {hasChildren ? (
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#1890ff",
                      fontWeight: "bold",
                      transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                      transition: "transform 0.2s ease",
                    }}
                  >
                    ▼
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: "8px",
                      color: "#8c8c8c",
                    }}
                  >
                    ●
                  </span>
                )}
              </div>
            </div>
          );
        };

        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 0",
              cursor: "pointer",
              borderRadius: "6px",
              transition: "background-color 0.2s ease",
              backgroundColor: "transparent",
              borderLeft: record.level > 0 ? `3px solid #e6f7ff` : "none",
              marginLeft: record.level > 0 ? "8px" : "0",
            }}
            onClick={() => handleCategoryNameClick(record)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f5f5f5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            {/* Tree structure prefix */}
            {getTreePrefix()}

            {/* Category name with enhanced styling */}
            <div style={{ flex: 1, marginLeft: "8px" }}>
              <div
                style={{
                  fontSize: record.level === 0 ? "15px" : "14px",
                  fontWeight: record.level === 0 ? "600" : "400",
                  color: record.level === 0 ? "#262626" : "#595959",
                  lineHeight: "1.4",
                }}
              >
                {text}
              </div>
              {record.description && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "#8c8c8c",
                    marginTop: "2px",
                    fontStyle: "italic",
                  }}
                >
                  {record.description}
                </div>
              )}
            </div>

          </div>
        );
      },
    },
    {
      title: "URL",
      dataIndex: "category_url",
      key: "category_url",
      width: "20%",
      render: (text: string) => (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Text code style={{ fontSize: "12px" }}>
            /{text}
          </Text>
        </div>
      ),
    },
    {
      title: "Loại",
      dataIndex: "category_type",
      key: "category_type",
      width: "10%",
      render: (type: string) => (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Tag color={getTypeColor(type)}>{getTypeLabel(type)}</Tag>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      width: "10%",
      render: (isActive: boolean, record: CategoryTreeNode) => (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Switch
            checked={isActive}
            onChange={(checked) =>
              handleToggleStatus(record.category_id, checked)
            }
            loading={updateStatusMutation.isPending}
          />
        </div>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      width: "20%",
      render: (_, record: CategoryTreeNode) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
              size="small"
            />
          </Tooltip>
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
    <div>
      <style jsx global>{`
        .ant-table-tbody > tr > td {
          padding: 12px 8px !important;
          border-bottom: 1px solid #f0f0f0 !important;
          vertical-align: middle !important;
          text-align: center !important;
        }
        .ant-table-thead > tr > th {
          background: #fafafa !important;
          border-bottom: 2px solid #d9d9d9 !important;
          font-weight: 600 !important;
          padding: 12px 8px !important;
          font-size: 14px !important;
          text-align: center !important;
        }
        .ant-table-tbody > tr:last-child > td {
          border-bottom: none !important;
        }
        .ant-table-tbody > tr:hover > td {
          background: #f8f9fa !important;
        }
        .ant-table-tbody > tr > td:first-child {
          padding-left: 16px !important;
          text-align: left !important;
        }
        .ant-table-tbody > tr > td:last-child {
          text-align: center !important;
        }
        /* Center content in action buttons */
        .ant-table-tbody > tr > td .ant-space {
          justify-content: center;
        }
        /* Center tags and switches */
        .ant-table-tbody > tr > td .ant-tag,
        .ant-table-tbody > tr > td .ant-switch {
          margin: 0 auto;
        }
      `}</style>
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
              <Option value="PROMOTION">Khuyến mãi</Option>
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
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={onAddRootCategory}
              >
                Thêm danh mục gốc
              </Button>
            </Space>
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
            expandedRowKeys: expandedRowKeys,
            onExpandedRowsChange: (keys) =>
              setExpandedRowKeys(keys as React.Key[]),
            defaultExpandAllRows: false,
            childrenColumnName: "children",
            expandRowByClick: false,
            indentSize: 0, // No default indentation
            expandIcon: () => null, // Hide default expand icon
            rowExpandable: (record) =>
              !!(record.children && record.children.length > 0),
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Category Detail Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <EyeOutlined style={{ color: "#1890ff" }} />
            <span>Chi tiết danh mục</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={handleCloseDetailModal}
        footer={[
          <Button key="close" onClick={handleCloseDetailModal}>
            Đóng
          </Button>,
        ]}
        width={800}
        centered
      >
        {selectedCategory && (
          <div>
            {/* Header Section */}
            <div style={{ marginBottom: "24px" }}>
              <Typography.Title level={4} style={{ margin: 0, color: "#262626" }}>
                {selectedCategory.category_name}
              </Typography.Title>
              <Typography.Text type="secondary" style={{ fontSize: "14px" }}>
                {selectedCategory.description || "Không có mô tả"}
              </Typography.Text>
            </div>

            <Divider />

            {/* Basic Information */}
            <Descriptions
              title="Thông tin cơ bản"
              bordered
              column={2}
              size="small"
              style={{ marginBottom: "24px" }}
            >
              <Descriptions.Item label="Mã danh mục" span={1}>
                <Tag color="blue">{selectedCategory.category_code}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="URL" span={1}>
                <Typography.Text code>{selectedCategory.category_url}</Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label="Loại" span={1}>
                <Tag color={getTypeColor(selectedCategory.category_type)}>
                  {getTypeLabel(selectedCategory.category_type)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={1}>
                <Tag color={selectedCategory.is_active ? "green" : "red"}>
                  {selectedCategory.is_active ? "Hoạt động" : "Không hoạt động"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Cấp độ" span={1}>
                <Tag color="purple">Level {selectedCategory.level}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Thứ tự" span={1}>
                <Typography.Text strong>{selectedCategory.sort_order}</Typography.Text>
              </Descriptions.Item>
            </Descriptions>

            {/* Hierarchy Information */}
            <Descriptions
              title="Thông tin phân cấp"
              bordered
              column={1}
              size="small"
              style={{ marginBottom: "24px" }}
            >
              <Descriptions.Item label="Danh mục cha">
                {selectedCategory.parent_category_id ? (
                  <Tag color="orange">Có danh mục cha</Tag>
                ) : (
                  <Tag color="green">Danh mục gốc</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Số lượng sub-categories">
                <Tag color="cyan">
                  {selectedCategory.children?.length || 0} danh mục con
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Breadcrumb">
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {selectedCategory.breadcrumb?.map((item, index) => (
                    <React.Fragment key={item.category_id}>
                      <Tag color="default">{item.category_name}</Tag>
                      {index < selectedCategory.breadcrumb.length - 1 && (
                        <span style={{ color: "#8c8c8c" }}>→</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </Descriptions.Item>
            </Descriptions>

            {/* System Information */}
            <Descriptions
              title="Thông tin hệ thống"
              bordered
              column={2}
              size="small"
            >
              <Descriptions.Item label="Ngày tạo" span={1}>
                {new Date(selectedCategory.created_date).toLocaleString("vi-VN")}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày cập nhật" span={1}>
                {new Date(selectedCategory.modified_date).toLocaleString("vi-VN")}
              </Descriptions.Item>
              <Descriptions.Item label="Người tạo" span={1}>
                <Typography.Text code>{selectedCategory.created_by}</Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label="Người cập nhật" span={1}>
                <Typography.Text code>{selectedCategory.modified_by}</Typography.Text>
              </Descriptions.Item>
            </Descriptions>

            {/* Sub-categories Preview */}
            {selectedCategory.children && selectedCategory.children.length > 0 && (
              <>
                <Divider />
                <div>
                  <Typography.Title level={5} style={{ marginBottom: "12px" }}>
                    Danh mục con ({selectedCategory.children.length})
                  </Typography.Title>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {selectedCategory.children.map((child) => (
                      <Tag key={child.category_id} color="blue">
                        {child.category_name}
                      </Tag>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CategoryTreeTable;
