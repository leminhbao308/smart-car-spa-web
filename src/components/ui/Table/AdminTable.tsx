"use client";
import React, {useState, useMemo} from "react";
import {Card, Button, Typography, Input, DatePicker, Space} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type {ColumnsType} from "antd/es/table";
import type {Dayjs} from "dayjs";
import SafeTable from "./SafeTable";

const {Title} = Typography;
const {RangePicker} = DatePicker;

export interface AdminTableAction {
  key: string;
  label: string | ((record: any) => string);
  icon?: React.ReactNode | ((record: any) => React.ReactNode);
  type?: "primary" | "default" | "dashed" | "link" | "text";
  danger?: boolean | ((record: any) => boolean);
  onClick: (record: any) => void;
  condition?: (record: any) => boolean;
  fixed?: boolean;
}

export interface AdminTableProps {
  title?: string,
  dataSource: any[],
  columns: ColumnsType<any>,
  loading?: boolean,
  pagination?: boolean | object,
  actions?: AdminTableAction[],
  showAddButton?: boolean,
  addButtonText?: string,
  onAdd?: () => void,
  onEdit?: (record: any) => void,
  onEditCondition?: (record: any) => boolean,
  onDelete?: (record: any) => void,
  onView?: (record: any) => void,
  rowKey?: string,
  scroll?: { x?: number; y?: number },
  size?: "small" | "middle" | "large",
  bordered?: boolean,
  className?: string,
  searchable?: boolean,
  searchPlaceholder?: string,
  searchFields?: string[],
  onSearch?: (query: string) => void,
  useServerSearch?: boolean,
  showDateRangeFilter?: boolean,
  dateField?: string,
  onDateRangeChange?: (dates: [string, string] | null) => void,
  useServerDateFilter?: boolean,
  extraButtons?: React.JSX.Element[]
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
                                                 onEditCondition,
                                                 onDelete,
                                                 onView,
                                                 rowKey = "id",
                                                 scroll = {x: 800},
                                                 size = "middle",
                                                 bordered = true,
                                                 className = "",
                                                 searchable = true,
                                                 searchPlaceholder = "Tìm kiếm...",
                                                 searchFields = [],
                                                 onSearch,
                                                 useServerSearch = false,
                                                 showDateRangeFilter = false,
                                                 dateField = "created_date",
                                                 onDateRangeChange,
                                                 useServerDateFilter = false,
                                                 extraButtons
                                               }) => {
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  // Hàm kiểm tra xem một ngày có nằm trong khoảng không
  const isDateInRange = (dateStr: string, start: Dayjs, end: Dayjs): boolean => {
    const date = new Date(dateStr);
    const startDate = start.startOf('day').toDate();
    const endDate = end.endOf('day').toDate();
    return date >= startDate && date <= endDate;
  };

  // Lọc dữ liệu dựa trên tìm kiếm và date range
  const filteredData = useMemo(() => {
    let result = dataSource;

    // Lọc theo text search (client-side)
    if (!useServerSearch && searchText && searchable) {
      result = result.filter((item) => {
        if (searchFields.length > 0) {
          return searchFields.some((field) => {
            // Hỗ trợ nested fields như "product.productName"
            const fieldParts = field.split('.');
            let value = item;
            for (const part of fieldParts) {
              value = value?.[part];
              if (value === undefined) break;
            }
            return (
              value &&
              value.toString().toLowerCase().includes(searchText.toLowerCase())
            );
          });
        } else {
          return Object.values(item).some((value) => {
            return (
              value &&
              value.toString().toLowerCase().includes(searchText.toLowerCase())
            );
          });
        }
      });
    }

    // Lọc theo date range (client-side)
    if (!useServerDateFilter && dateRange && dateField && showDateRangeFilter) {
      const [start, end] = dateRange;
      result = result.filter((item) => {
        const dateValue = item[dateField];
        if (!dateValue) return false;
        return isDateInRange(dateValue, start, end);
      });
    }

    return result;
  }, [
    dataSource,
    searchText,
    searchable,
    searchFields,
    useServerSearch,
    dateRange,
    dateField,
    showDateRangeFilter,
    useServerDateFilter,
  ]);

  // Xử lý thay đổi date range
  const handleDateRangeChange = (dates: [Dayjs, Dayjs] | null) => {
    setDateRange(dates);
    if (useServerDateFilter && onDateRangeChange) {
      if (dates) {
        const [start, end] = dates;
        onDateRangeChange([
          start.startOf('day').toISOString(),
          end.endOf('day').toISOString(),
        ]);
      } else {
        onDateRangeChange(null);
      }
    }
  };

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
            icon={<EyeOutlined/>}
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
        render: (_, record) => {
          if (onEditCondition && !onEditCondition(record)) {
            return null;
          }
          return (
            <Button
              type="text"
              icon={<EditOutlined/>}
              onClick={() => onEdit(record)}
              size="small"
            />
          );
        },
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
            icon={<DeleteOutlined/>}
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
        fixed: action.fixed ? "right" : undefined,
        render: (_, record) => {
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
              icon={action.icon || (typeof action.icon === "function" ? undefined : undefined)}
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
      {(title || showAddButton || extraButtons) && (
        <div style={{marginBottom: 16}}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {title && (
              <Title level={4} style={{margin: 0}}>
                {title}
              </Title>
            )}
            {(showAddButton && onAdd || extraButtons) && (
              <div style={{display: "flex", gap: '8px', alignItems: 'center'}}>
                {showAddButton && onAdd && (
                  <Button type="primary" icon={<PlusOutlined/>} onClick={onAdd}>
                    {addButtonText}
                  </Button>
                )}
                {extraButtons}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Input và Date Range Picker */}
      {(searchable || showDateRangeFilter) && (
        <div style={{marginBottom: 16}}>
          <Space size="middle" wrap>
            {searchable && (
              <Input
                placeholder={searchPlaceholder}
                prefix={<SearchOutlined/>}
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  if (useServerSearch && onSearch) {
                    onSearch(e.target.value);
                  }
                }}
                allowClear
                style={{width: 300}}
              />
            )}
            {showDateRangeFilter && (
              <RangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
                placeholder={["Từ ngày", "Đến ngày"]}
                format="DD/MM/YYYY"
                style={{width: 280}}
              />
            )}
          </Space>
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
        style={{marginTop: 16}}
      />
    </Card>
  );
};

export default AdminTable;
