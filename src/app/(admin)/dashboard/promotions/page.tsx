"use client";
import React, { useState, useMemo } from "react";
import {
  Tag,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Badge,
  Button,
  Space,
  Select,
  DatePicker,
  Input,
  Spin,
  Tooltip,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CalendarOutlined,
  GiftOutlined,
  UserOutlined,
  ClockCircleOutlined,
  FireOutlined,
  StarOutlined,
  SearchOutlined,
  FilterOutlined,
  CopyOutlined,
  EyeInvisibleOutlined,
  ReloadOutlined,
  DownloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import AdminTable from "@/components/ui/Table/AdminTable";
import PromotionModal from "@/components/ui/Modal/PromotionModal/PromotionModal";
import PromotionDetailModal from "@/components/ui/Modal/PromotionModal/PromotionDetailModal";
import { useConfirmationModalContext } from "@/components/ui/Modal";
import {
  Promotion,
  CreatePromotionRequest,
  UpdatePromotionRequest,
  PromotionFilterParam,
  getLineTypeLabel,
  getDiscountTypeIcon,
  isPromotionExpired,
  isPromotionActive,
  formatDiscountValue,
  getUsagePercentage,
  isPromotionAvailable,
} from "@/lib/api/types/promotion.types";
import {
  usePromotions,
  usePromotionManagement,
  usePromotionStatistics,
} from "@/lib/api/hooks/usePromotions";
import { formatDate } from "@/components/utils/helper/date.format.helper";
import dayjs from "dayjs";

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

const PromotionsPage = () => {
  // State management
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [viewingPromotion, setViewingPromotion] = useState<Promotion | null>(null);

  // Filters & Pagination
  const [filters, setFilters] = useState<PromotionFilterParam>({
    page: 0,
    size: 10,
    sort: "createdDate",
    direction: "DESC",
  });

  const { showModal } = useConfirmationModalContext();

  // API hooks
  const { data: promotionsData, isLoading, refetch } = usePromotions(filters);
  const { data: statistics } = usePromotionStatistics();

  const {
    createPromotion,
    updatePromotion,
    deletePromotion,
    restorePromotion,
    updatePromotionStatus,
    makePromotionVisible,
    makePromotionInvisible,
    duplicatePromotion,
    exportPromotions,
    isCreating,
    isUpdating,
    isDeleting,
    loading: managementLoading,
  } = usePromotionManagement();

  const promotions = useMemo(() => promotionsData?.content || [], [promotionsData?.content]);
  const totalElements = promotionsData?.totalElements || 0;
  const totalPages = promotionsData?.totalPages || 0;
  const currentPage = promotionsData?.currentPage || 0;

  // Table columns
  const columns = [
    {
      title: "Chương trình",
      dataIndex: "name",
      key: "name",
      width: 300,
      fixed: "left" as const,
      render: (text: string, record: Promotion) => (
        <div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
            <Text strong style={{ fontSize: 14 }}>
              {text}
            </Text>
            {record.is_stackable && (
              <Tag color="cyan" style={{ marginLeft: 8, fontSize: 11 }}>
                Kết hợp được
              </Tag>
            )}
          </div>
          {record.promotion_code && (
            <Tag color="blue" style={{ fontSize: 11 }}>
              {record.promotion_code}
            </Tag>
          )}
          {record.description && (
            <div style={{ marginTop: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.description}
              </Text>
            </div>
          )}
          {(record.start_at || record.end_at) && (
            <div style={{ marginTop: 4 }}>
              <Text style={{ fontSize: 11, color: "#8c8c8c" }}>
                <CalendarOutlined /> {record.start_at ? formatDate(record.start_at) : "N/A"} - {record.end_at ? formatDate(record.end_at) : "N/A"}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Loại KM",
      dataIndex: "promotion_type",
      key: "promotion_type",
      width: 150,
      render: (type: { promotion_type_name?: string }) => (
        <Tag color="purple">
          {type?.promotion_type_name || "Chưa phân loại"}
        </Tag>
      ),
    },
    {
      title: "Điều kiện",
      key: "promotion_lines",
      width: 250,
      render: (_: unknown, record: Promotion) => {
        const lines = record.promotion_lines || [];
        return (
          <div>
            {lines.slice(0, 2).map((line, index) => (
              <div key={index} style={{ marginBottom: 4 }}>
                <Tag color="geekblue" style={{ fontSize: 11 }}>
                  {getDiscountTypeIcon(line.discount_type)} {getLineTypeLabel(line.line_type)}
                </Tag>
                <Text style={{ fontSize: 11, marginLeft: 4 }}>
                  {formatDiscountValue(line.discount_type, line.discount_value)}
                </Text>
              </div>
            ))}
            {lines.length > 2 && (
              <Tag color="blue" style={{ fontSize: 11 }}>
                +{lines.length - 2} điều kiện
              </Tag>
            )}
            {lines.length === 0 && (
              <Text type="secondary" style={{ fontSize: 11 }}>
                Chưa có điều kiện
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 150,
      render: (_: unknown, record: Promotion) => {
        const expired = isPromotionExpired(record.end_at);
        const active = isPromotionActive(record);
        const available = isPromotionAvailable(record);

        return (
          <Space direction="vertical" size={2}>
            {expired ? (
              <Tag color="default">Đã hết hạn</Tag>
            ) : active ? (
              <Tag color="success" icon={<FireOutlined />}>
                Đang chạy
              </Tag>
            ) : record.is_active ? (
              <Tag color="processing">Đã lên lịch</Tag>
            ) : (
              <Tag color="error">Tạm dừng</Tag>
            )}
            {!available && !expired && (
              <Tag color="warning" style={{ fontSize: 10 }}>
                Hết lượt
              </Tag>
            )}
            {record.is_expired && (
              <Tag color="default" style={{ fontSize: 10 }}>
                <ClockCircleOutlined /> Hết hạn
              </Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: "Sử dụng",
      key: "usage",
      width: 180,
      render: (_: unknown, record: Promotion) => {
        const usagePercentage = getUsagePercentage(
          record.total_usage_count,
          record.usage_limit
        );

        return (
          <div>
            <div style={{ marginBottom: 4 }}>
              <Text style={{ fontSize: 12 }}>
                {record.total_usage_count || 0}/{record.usage_limit || "∞"} lần
              </Text>
            </div>
            {record.usage_limit && (
              <Progress
                percent={usagePercentage}
                strokeColor={
                  usagePercentage >= 90
                    ? "#f5222d"
                    : usagePercentage >= 70
                      ? "#fa8c16"
                      : "#52c41a"
                }
                size="small"
                showInfo={false}
              />
            )}
            {record.per_customer_limit && (
              <div style={{ marginTop: 4 }}>
                <Text style={{ fontSize: 11, color: "#8c8c8c" }}>
                  Giới hạn: {record.per_customer_limit}/khách
                </Text>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Độ ưu tiên",
      dataIndex: "priority",
      key: "priority",
      width: 120,
      align: "center" as const,
      render: (priority: number) => {
        const level =
          priority >= 8 ? "high" : priority >= 5 ? "medium" : "low";
        const color =
          level === "high"
            ? "#f5222d"
            : level === "medium"
              ? "#fa8c16"
              : "#52c41a";
        const label =
          level === "high" ? "Cao" : level === "medium" ? "Trung bình" : "Thấp";

        return (
          <div style={{ textAlign: "center" }}>
            <Badge count={priority} style={{ backgroundColor: color }} />
            <div style={{ marginTop: 4 }}>
              <Tag color={level === "high" ? "red" : level === "medium" ? "orange" : "green"}>
                {label}
              </Tag>
            </div>
          </div>
        );
      },
    },
    {
      title: "Chi nhánh",
      dataIndex: "branch",
      key: "branch",
      width: 120,
      render: (branch: { branchName?: string }) => (
        <Tag>{branch?.branchName || "Tất cả"}</Tag>
      ),
    },
  ];

  // Event handlers
  const handleViewDetail = (record: Promotion) => {
    setViewingPromotion(record);
    setDetailModalOpen(true);
  };

  const handleEdit = (record: Promotion) => {
    setEditingPromotion(record);
    setModalOpen(true);
  };

  const handleDelete = (record: Promotion) => {
    showModal({
      title: "Xác nhận xóa chương trình",
      content: `Bạn có chắc chắn muốn xóa chương trình "${record.name}"? Thao tác này có thể khôi phục.`,
      type: "error",
      onConfirm: async () => {
        try {
          await deletePromotion(record.promotion_id);
          refetch();
        } catch (error) {
          console.error("Delete failed:", error);
        }
      },
    });
  };

  const handleRestore = (record: Promotion) => {
    showModal({
      title: "Xác nhận khôi phục",
      content: `Bạn có muốn khôi phục chương trình "${record.name}"?`,
      type: "info",
      onConfirm: async () => {
        try {
          await restorePromotion(record.promotion_id);
          refetch();
        } catch (error) {
          console.error("Restore failed:", error);
        }
      },
    });
  };

  const handleToggleStatus = (record: Promotion) => {
    const newStatus = !record.is_active;
    showModal({
      title: `Xác nhận ${newStatus ? "kích hoạt" : "tạm dừng"}`,
      content: `Bạn có chắc chắn muốn ${newStatus ? "kích hoạt" : "tạm dừng"} chương trình "${record.name}"?`,
      type: newStatus ? "success" : "warning",
      onConfirm: async () => {
        try {
          await updatePromotionStatus({ id: record.promotion_id, isActive: newStatus });
          refetch();
        } catch (error) {
          console.error("Status update failed:", error);
        }
      },
    });
  };

  const handleToggleVisibility = (record: Promotion, visible: boolean) => {
    showModal({
      title: `Xác nhận ${visible ? "hiển thị" : "ẩn"}`,
      content: `Bạn có muốn ${visible ? "hiển thị" : "ẩn"} chương trình "${record.name}" với khách hàng?`,
      type: "info",
      onConfirm: async () => {
        try {
          if (visible) {
            await makePromotionVisible(record.promotion_id);
          } else {
            await makePromotionInvisible(record.promotion_id);
          }
          refetch();
        } catch (error) {
          console.error("Visibility update failed:", error);
        }
      },
    });
  };

  const handleDuplicate = (record: Promotion) => {
    const newName = `${record.name} (Copy)`;
    const newCode = `${record.promotion_code || "PROMO"}_COPY_${Date.now()}`;

    showModal({
      title: "Xác nhận sao chép",
      content: `Bạn có chắc chắn muốn sao chép chương trình "${record.name}"?`,
      type: "info",
      onConfirm: async () => {
        try {
          await duplicatePromotion({ id: record.promotion_id, newName, newCode });
          refetch();
        } catch (error) {
          console.error("Duplicate failed:", error);
        }
      },
    });
  };

  const handleExport = async () => {
    try {
      await exportPromotions(filters);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const actions = [
    {
      key: "view",
      label: "Xem chi tiết",
      icon: <EyeOutlined />,
      onClick: handleViewDetail,
    },
    {
      key: "edit",
      label: "Chỉnh sửa",
      icon: <EditOutlined />,
      onClick: handleEdit,
    },
    {
      key: "duplicate",
      label: "Sao chép",
      icon: <CopyOutlined />,
      onClick: handleDuplicate,
    },
    {
      key: "toggle",
      label: (record: Promotion) => record.is_active ? "Tạm dừng" : "Kích hoạt",
      icon: <EditOutlined />,
      onClick: handleToggleStatus,
    },
    {
      key: "visibility",
      label: "Đổi hiển thị",
      icon: <EyeInvisibleOutlined />,
      onClick: (record: Promotion) => handleToggleVisibility(record, !record.is_available),
    },
    {
      key: "restore",
      label: "Khôi phục",
      icon: <ReloadOutlined />,
      condition: (record: Promotion) => record.is_deleted && !record.is_active,
      onClick: handleRestore,
    },
    {
      key: "delete",
      label: "Xóa",
      icon: <DeleteOutlined />,
      danger: true,
      condition: (record: Promotion) =>
        !record.is_active || isPromotionExpired(record.end_at),
      onClick: handleDelete,
    },
  ];

  const handleAddNew = () => {
    setEditingPromotion(null);
    setModalOpen(true);
  };

  const handleModalOk = async (
    promotionData: CreatePromotionRequest | UpdatePromotionRequest
  ) => {
    try {
      if (editingPromotion) {
        await updatePromotion({
          id: editingPromotion.promotion_id,
          data: promotionData as UpdatePromotionRequest,
        });
      } else {
        await createPromotion(promotionData as CreatePromotionRequest);
      }
      setModalOpen(false);
      setEditingPromotion(null);
      refetch();
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setEditingPromotion(null);
  };

  const handleDetailModalClose = () => {
    setDetailModalOpen(false);
    setViewingPromotion(null);
  };

  // Filter handlers
  const handleFilterChange = (key: keyof PromotionFilterParam, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 0 }));
  };

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 0 }));
  };

  const handleDateRangeChange = (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  ) => {
    if (dates && dates[0] && dates[1]) {
      setFilters((prev) => ({
        ...prev,
        start_at_from: dates[0]?.format("YYYY-MM-DD"),
        end_at_to: dates[1]?.format("YYYY-MM-DD"),
        page: 0,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        start_at_from: undefined,
        end_at_to: undefined,
        page: 0,
      }));
    }
  };

  const clearFilters = () => {
    setFilters({
      page: 0,
      size: filters.size,
      sort: "createdDate",
      direction: "DESC",
    });
  };

  return (
    <div>
      {/* Header Actions */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              <GiftOutlined /> Quản lý chương trình khuyến mãi
            </Title>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleExport}
                loading={managementLoading}
              >
                Xuất Excel
              </Button>
              <Button
                icon={<UploadOutlined />}
                onClick={() => {/* TODO: Import modal */}}
              >
                Nhập Excel
              </Button>
              <Button
                type="primary"
                icon={<GiftOutlined />}
                onClick={handleAddNew}
              >
                Thêm chương trình mới
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Tìm kiếm theo tên, mã..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Trạng thái"
              value={filters.is_active}
              onChange={(value) => handleFilterChange("is_active", value)}
              allowClear
              style={{ width: "100%" }}
            >
              <Select.Option value={true}>
                <Tag color="success">Đang hoạt động</Tag>
              </Select.Option>
              <Select.Option value={false}>
                <Tag color="error">Tạm dừng</Tag>
              </Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Tình trạng"
              onChange={(value) => handleFilterChange(value, true)}
              allowClear
              style={{ width: "100%" }}
            >
              <Select.Option value="is_expired">Đã hết hạn</Select.Option>
              <Select.Option value="is_available">Khả dụng</Select.Option>
              <Select.Option value="is_starting_soon">Sắp bắt đầu</Select.Option>
              <Select.Option value="is_ending_soon">Sắp kết thúc</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              onChange={handleDateRangeChange}
              style={{ width: "100%" }}
              placeholder={["Từ ngày", "Đến ngày"]}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Space>
              <Button icon={<FilterOutlined />} onClick={clearFilters}>
                Xóa bộ lọc
              </Button>
              <Tooltip title="Làm mới">
                <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
              </Tooltip>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng chương trình"
              value={statistics?.totalPromotions || 0}
              valueStyle={{ color: "#1890ff" }}
              prefix={<GiftOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={statistics?.activePromotions || 0}
              valueStyle={{ color: "#52c41a" }}
              prefix={<FireOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Sắp diễn ra"
              value={statistics?.upcomingPromotions || 0}
              valueStyle={{ color: "#722ed1" }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đã hết hạn"
              value={statistics?.expiredPromotions || 0}
              valueStyle={{ color: "#8c8c8c" }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Tổng lượt sử dụng"
              value={statistics?.totalUsage || 0}
              valueStyle={{ color: "#13c2c2" }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Tổng giảm giá"
              value={statistics?.totalDiscountGiven || 0}
              valueStyle={{ color: "#eb2f96" }}
              prefix={<GiftOutlined />}
              suffix="₫"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Trung bình/đơn"
              value={
                statistics?.totalUsage
                  ? Math.round(
                    (statistics?.totalDiscountGiven || 0) / statistics.totalUsage
                  )
                  : 0
              }
              valueStyle={{ color: "#fa8c16" }}
              prefix={<StarOutlined />}
              suffix="₫"
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Spin spinning={isLoading || isDeleting}>
        <AdminTable
          title="Danh sách chương trình khuyến mãi"
          dataSource={promotions}
          columns={columns}
          actions={actions}
          loading={isLoading}
          rowKey="promotion_id"
          scroll={{ x: 1500 }}
          pagination={{
            current: currentPage + 1,
            pageSize: filters.size,
            total: totalElements,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            showTotal: (total: number, range: [number, number]) =>
              `${range[0]}-${range[1]} của ${total} chương trình`,
            onChange: (page: number, size: number) => {
              setFilters((prev) => ({
                ...prev,
                page: page - 1,
                size: size || 10,
              }));
            },
          }}
        />
      </Spin>

      {/* Modals */}
      <PromotionModal
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        initialData={editingPromotion}
        loading={isCreating || isUpdating}
        title={
          editingPromotion
            ? "Chỉnh sửa chương trình khuyến mãi"
            : "Thêm chương trình khuyến mãi mới"
        }
      />

      <PromotionDetailModal
        open={detailModalOpen}
        onCancel={handleDetailModalClose}
        promotion={viewingPromotion}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
};

export default PromotionsPage;
