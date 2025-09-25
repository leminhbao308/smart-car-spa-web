"use client";
import React, { useState, useMemo } from "react";
import { Card, Button, Typography, Input } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import SafeTable from "./SafeTable";

const { Title } = Typography;

export interface AdminTableAction {
  key: string;
  label: string | ((record: any) => string);
  icon?: React.ReactNode;
  type?: "primary" | "default" | "dashed" | "link" | "text";
  danger?: boolean | ((record: any) => boolean);
  onClick: (record: any) => void;
  condition?: (record: any) => boolean;
}

export interface AdminTableProps {
  title?: string;
  dataSource: any[];
  columns: ColumnsType<any>;
  loading?: boolean;
  pagination?: boolean | object;
  actions?: AdminTableAction[];
  showAddButton?: boolean;
  addButtonText?: string;
  onAdd?: () => void;
  onEdit?: (record: any) => void;
  onDelete?: (record: any) => void;
  onView?: (record: any) => void;
  rowKey?: string;
  scroll?: { x?: number; y?: number };
  size?: "small" | "middle" | "large";
  bordered?: boolean;
  className?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchFields?: string[];
  onSearch?: (query: string) => void;
  useServerSearch?: boolean;
}

const AdminTable: React.FC<AdminTableProps> = ({
  title,
  dataSource,
  columns,
  loading = false,
  pagination = true,
  actions = [],
  showAddButton = true,
  addButtonText = "Thêm mới",
  onAdd,
  onEdit,
  onDelete,
  onView,
  rowKey = "id",
  scroll = { x: 800 },
  size = "middle",
  bordered = true,
  className = "",
  searchable = true,
  searchPlaceholder = "Tìm kiếm...",
  searchFields = [],
  onSearch,
  useServerSearch = false,
}) => {
  const [searchText, setSearchText] = useState("");

  // Lọc dữ liệu dựa trên tìm kiếm (chỉ khi sử dụng client-side search)
  const filteredData = useMemo(() => {
    if (useServerSearch || !searchText || !searchable) return dataSource;

    return dataSource.filter((item) => {
      if (searchFields.length > 0) {
        // Tìm kiếm trong các trường được chỉ định
        return searchFields.some((field) => {
          const value = item[field];
          return (
            value &&
            value.toString().toLowerCase().includes(searchText.toLowerCase())
          );
        });
      } else {
        // Tìm kiếm trong tất cả các trường
        return Object.values(item).some((value) => {
          return (
            value &&
            value.toString().toLowerCase().includes(searchText.toLowerCase())
          );
        });
      }
    });
  }, [dataSource, searchText, searchable, searchFields, useServerSearch]);

  // Tạo columns cho actions
  const getActionColumns = (): ColumnsType<any> => {
    const actionColumns: ColumnsType<any> = [];

    // Thêm các action mặc định nếu có
    if (onView) {
      actionColumns.push({
        title: "Xem",
        key: "view",
        width: 80,
        render: (_, record) => (
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => onView(record)}
            size="small"
          />
        ),
      });
    }

    if (onEdit) {
      actionColumns.push({
        title: "Sửa",
        key: "edit",
        width: 80,
        render: (_, record) => (
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            size="small"
          />
        ),
      });
    }

    if (onDelete) {
      actionColumns.push({
        title: "Xóa",
        key: "delete",
        width: 80,
        render: (_, record) => (
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record)}
            size="small"
          />
        ),
      });
    }

    // Thêm các action tùy chỉnh
    actions.forEach((action) => {
      actionColumns.push({
        title: typeof action.label === "string" ? action.label : "Action",
        key: action.key,
        width: 120,
        render: (_, record) => {
          // Kiểm tra condition nếu có
          if (action.condition && !action.condition(record)) {
            return null;
          }

          const label =
            typeof action.label === "function"
              ? action.label(record)
              : action.label;
          const danger =
            typeof action.danger === "function"
              ? action.danger(record)
              : action.danger;

          return (
            <Button
              type={action.type || "text"}
              danger={danger}
              icon={action.icon}
              onClick={() => action.onClick(record)}
              size="small"
            >
              {label}
            </Button>
          );
        },
      });
    });

    return actionColumns;
  };

  // Kết hợp columns với action columns
  const finalColumns = [
    ...columns,
    ...(actions.length > 0 || onView || onEdit || onDelete
      ? getActionColumns()
      : []),
  ];

  // Cấu hình pagination
  const paginationConfig =
    pagination === true
      ? {
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: number, range: [number, number]) =>
            `${range[0]}-${range[1]} của ${total} mục`,
          pageSizeOptions: ["10", "20", "50", "100"],
          defaultPageSize: 10,
        }
      : pagination;

  return (
    <Card className={className}>
      {/* Header với title và button thêm mới */}
      {(title || showAddButton) && (
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {title && (
              <Title level={4} style={{ margin: 0 }}>
                {title}
              </Title>
            )}
            {showAddButton && onAdd && (
              <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
                {addButtonText}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Search Input */}
      {searchable && (
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder={searchPlaceholder}
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              if (useServerSearch && onSearch) {
                onSearch(e.target.value);
              }
            }}
            allowClear
            style={{ maxWidth: 300 }}
          />
        </div>
      )}

      {/* Table */}
      <SafeTable
        columns={finalColumns}
        dataSource={filteredData}
        loading={loading}
        pagination={paginationConfig}
        rowKey={rowKey}
        scroll={scroll}
        size={size}
        bordered={bordered}
        style={{ marginTop: 16 }}
      />
    </Card>
  );
};

export default AdminTable;
