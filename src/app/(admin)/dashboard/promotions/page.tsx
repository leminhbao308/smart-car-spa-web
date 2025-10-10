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
} from "@ant-design/icons";
import AdminTable from "@/components/ui/Table/AdminTable";
import PromotionModal from "@/components/ui/Modal/PromotionModal/PromotionModal";
import PromotionDetailModal from "@/components/ui/Modal/PromotionModal/PromotionDetailModal";
import { useConfirmationModalContext } from "@/components/ui/Modal";
import {
  Promotion,
  CreatePromotionRequest,
  UpdatePromotionRequest,
  PromotionType,
  PromotionStatus,
  PROMOTION_TYPE_OPTIONS,
  PROMOTION_STATUS_OPTIONS,
  getPromotionTypeLabel,
  getPromotionTypeIcon,
  getPromotionStatusLabel,
  getPromotionStatusColor,
  isPromotionExpired,
  isPromotionActive,
  formatPromotionValue,
  getUsagePercentage,
} from "@/lib/api/types/promotion.types";
import { usePromotions, usePromotionManagement } from "@/lib/api/hooks/usePromotions";
import { formatDate } from "@/components/utils/helper/date.format.helper";
import dayjs from "dayjs";

const { Text } = Typography;

const PromotionsPage = () => {
  // State management
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [viewingPromotion, setViewingPromotion] = useState<Promotion | null>(null);
  
  // Filters
  const [filters, setFilters] = useState({
    status: undefined as PromotionStatus | undefined,
    type: undefined as PromotionType | undefined,
    isPublic: undefined as boolean | undefined,
    search: "",
    dateRange: undefined as [dayjs.Dayjs, dayjs.Dayjs] | undefined,
  });
  
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
  });

  const { showModal } = useConfirmationModalContext();
  
  // API hooks
  const { data: promotionsResponse, isLoading, refetch } = usePromotions({
    page: pagination.page,
    size: pagination.size,
    filters: {
      status: filters.status ? [filters.status] : undefined,
      type: filters.type ? [filters.type] : undefined,
      isPublic: filters.isPublic,
      search: filters.search || undefined,
      startDate: filters.dateRange?.[0]?.format("YYYY-MM-DD"),
      endDate: filters.dateRange?.[1]?.format("YYYY-MM-DD"),
    },
  });

  const {
    createPromotion,
    updatePromotion,
    deletePromotion,
    updatePromotionStatus,
    duplicatePromotion,
    isCreating,
    isUpdating,
  } = usePromotionManagement();

  const promotions = useMemo(() => promotionsResponse?.data?.content || [], [promotionsResponse?.data?.content]);
  const totalElements = promotionsResponse?.data?.totalElements || 0;

  // Statistics calculation
  const statistics = useMemo(() => {
    const totalPromotions = totalElements;
    const activePromotions = promotions.filter(p => p.status === "active").length;
    const scheduledPromotions = promotions.filter(p => p.status === "scheduled").length;
    const expiredPromotions = promotions.filter(p => isPromotionExpired(p.endDate)).length;
    const publicPromotions = promotions.filter(p => p.isPublic).length;
    const totalUsage = promotions.reduce((sum, p) => sum + p.usedCount, 0);
    const totalCustomers = promotions.reduce((sum, p) => sum + p.customerUsedCount, 0);

    return {
      totalPromotions,
      activePromotions,
      scheduledPromotions,
      expiredPromotions,
      publicPromotions,
      totalUsage,
      totalCustomers,
    };
  }, [promotions, totalElements]);

  const columns = [
    {
      title: "Chương trình",
      dataIndex: "name",
      key: "name",
      width: 300,
      render: (text: string, record: Promotion) => (
        <div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 20, marginRight: 8 }}>
              {getPromotionTypeIcon(record.type)}
            </span>
            <Text strong style={{ fontSize: 14 }}>
              {text}
            </Text>
            {record.isPublic && (
              <Tag color="blue" style={{ marginLeft: 8 }}>
                Công khai
              </Tag>
            )}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.description}
          </Text>
          <div style={{ marginTop: 4 }}>
            <Text style={{ fontSize: 11, color: "#8c8c8c" }}>
              {formatDate(record.startDate)} - {formatDate(record.endDate)}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type: PromotionType) => (
        <Tag color="purple">
          {getPromotionTypeIcon(type)} {getPromotionTypeLabel(type)}
        </Tag>
      ),
    },
    {
      title: "Giá trị",
      dataIndex: "value",
      key: "value",
      width: 120,
      render: (value: number, record: Promotion) => (
        <div>
          <Text strong style={{ color: "#f5222d", fontSize: 14 }}>
            {formatPromotionValue(record.type, value)}
          </Text>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: PromotionStatus, record: Promotion) => {
        const isExpiredPromo = isPromotionExpired(record.endDate);
        const isActivePromo = isPromotionActive(record.startDate, record.endDate, status);

        let displayStatus = status;
        let displayColor = getPromotionStatusColor(status);

        if (isExpiredPromo && status === "active") {
          displayStatus = "expired";
          displayColor = "gray";
        }

        return (
          <div>
            <Tag color={displayColor}>{getPromotionStatusLabel(displayStatus)}</Tag>
            {isActivePromo && (
              <div style={{ marginTop: 4 }}>
                <Tag color="green">
                  <FireOutlined /> Đang chạy
                </Tag>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Sử dụng",
      dataIndex: "usage",
      key: "usage",
      width: 150,
      render: (_: unknown, record: Promotion) => {
        const usagePercentage = getUsagePercentage(record.usedCount, record.usageLimit);
        
        return (
          <div>
            <div style={{ marginBottom: 4 }}>
              <Text style={{ fontSize: 12 }}>
                {record.usedCount}/{record.usageLimit || "∞"} lần
              </Text>
            </div>
            <Progress
              percent={usagePercentage}
              strokeColor={usagePercentage >= 90 ? "#f5222d" : usagePercentage >= 70 ? "#fa8c16" : "#52c41a"}
              size="small"
            />
            <div style={{ marginTop: 4 }}>
              <Text style={{ fontSize: 11, color: "#8c8c8c" }}>
                {record.customerUsedCount}/{record.customerLimit || "∞"} khách hàng
              </Text>
            </div>
          </div>
        );
      },
    },
    {
      title: "Độ ưu tiên",
      dataIndex: "priority",
      key: "priority",
      width: 100,
      render: (priority: number) => (
        <div style={{ textAlign: "center" }}>
          <Badge
            count={priority}
            style={{
              backgroundColor:
                priority >= 8
                  ? "#f5222d"
                  : priority >= 6
                  ? "#fa8c16"
                  : "#52c41a",
            }}
          />
          <div style={{ marginTop: 4 }}>
            {priority >= 8 && <Tag color="red">Cao</Tag>}
            {priority >= 6 && priority < 8 && (
              <Tag color="orange">Trung bình</Tag>
            )}
            {priority < 6 && <Tag color="green">Thấp</Tag>}
          </div>
        </div>
      ),
    },
    {
      title: "Điều kiện",
      dataIndex: "conditions",
      key: "conditions",
      width: 200,
      render: (conditions: { description: string }[]) => (
        <div>
          {conditions.slice(0, 2).map((condition, index) => (
            <Tag key={index} style={{ marginBottom: 2 }}>
              {condition.description}
            </Tag>
          ))}
          {conditions.length > 2 && (
            <Tag color="blue">+{conditions.length - 2} điều kiện</Tag>
          )}
        </div>
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
      content: `Bạn có chắc chắn muốn xóa chương trình "${record.name}"?`,
      type: "error",
      onConfirm: async () => {
        try {
          await deletePromotion(record.id);
          refetch();
        } catch (error) {
          console.error("Delete failed:", error);
        }
      },
    });
  };

  const handleToggleStatus = (record: Promotion) => {
    const newStatus: PromotionStatus = record.status === "active" ? "inactive" : "active";
    showModal({
      title: `Xác nhận ${newStatus === "active" ? "kích hoạt" : "tạm dừng"}`,
      content: `Bạn có chắc chắn muốn ${newStatus === "active" ? "kích hoạt" : "tạm dừng"} chương trình "${record.name}"?`,
      type: newStatus === "active" ? "success" : "warning",
      onConfirm: async () => {
        try {
          await updatePromotionStatus({ id: record.id, status: newStatus });
          refetch();
        } catch (error) {
          console.error("Status update failed:", error);
        }
      },
    });
  };

  const handleDuplicate = (record: Promotion) => {
    const newName = `${record.name} (Copy)`;
    const newCode = `${record.code}_COPY_${Date.now()}`;
    
    showModal({
      title: "Xác nhận sao chép",
      content: `Bạn có chắc chắn muốn sao chép chương trình "${record.name}"?`,
      type: "info",
      onConfirm: async () => {
        try {
          await duplicatePromotion({ id: record.id, newName, newCode });
          refetch();
        } catch (error) {
          console.error("Duplicate failed:", error);
        }
      },
    });
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
      label: "Thay đổi trạng thái",
      icon: <EditOutlined />,
      onClick: handleToggleStatus,
    },
    {
      key: "delete",
      label: "Xóa",
      icon: <DeleteOutlined />,
      danger: true,
      condition: (record: Promotion) =>
        record.status === "inactive" || isPromotionExpired(record.endDate),
      onClick: handleDelete,
    },
  ];

  const handleAddNew = () => {
    setEditingPromotion(null);
    setModalOpen(true);
  };

  const handleModalOk = async (promotionData: CreatePromotionRequest | UpdatePromotionRequest) => {
    try {
      if (editingPromotion) {
        await updatePromotion({ id: editingPromotion.id, data: promotionData as UpdatePromotionRequest });
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
  const handleFilterChange = (key: string, value: unknown) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    const validDates = dates && dates[0] && dates[1] ? [dates[0], dates[1]] as [dayjs.Dayjs, dayjs.Dayjs] : undefined;
    setFilters(prev => ({ ...prev, dateRange: validDates }));
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const clearFilters = () => {
    setFilters({
      status: undefined,
      type: undefined,
      isPublic: undefined,
      search: "",
      dateRange: undefined,
    });
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  return (
    <div>
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
              value={filters.status}
              onChange={(value) => handleFilterChange("status", value)}
              allowClear
              style={{ width: "100%" }}
            >
              {PROMOTION_STATUS_OPTIONS.map((status) => (
                <Select.Option key={status.value} value={status.value}>
                  <Tag color={status.color}>{status.label}</Tag>
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Loại"
              value={filters.type}
              onChange={(value) => handleFilterChange("type", value)}
              allowClear
              style={{ width: "100%" }}
            >
              {PROMOTION_TYPE_OPTIONS.map((type) => (
                <Select.Option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Công khai"
              value={filters.isPublic}
              onChange={(value) => handleFilterChange("isPublic", value)}
              allowClear
              style={{ width: "100%" }}
            >
              <Select.Option value={true}>Công khai</Select.Option>
              <Select.Option value={false}>Riêng tư</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space>
              <DatePicker.RangePicker
                value={filters.dateRange}
                onChange={handleDateRangeChange}
                style={{ width: "100%" }}
              />
              <Button icon={<FilterOutlined />} onClick={clearFilters}>
                Xóa bộ lọc
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Thống kê tổng quan */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng chương trình"
              value={statistics.totalPromotions}
              valueStyle={{ color: "#1890ff" }}
              prefix={<GiftOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={statistics.activePromotions}
              valueStyle={{ color: "#52c41a" }}
              prefix={<FireOutlined />}
            />
            <Progress
              percent={statistics.totalPromotions > 0 ? Math.round((statistics.activePromotions / statistics.totalPromotions) * 100) : 0}
              strokeColor="#52c41a"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đã lên lịch"
              value={statistics.scheduledPromotions}
              valueStyle={{ color: "#722ed1" }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Công khai"
              value={statistics.publicPromotions}
              valueStyle={{ color: "#fa8c16" }}
              prefix={<StarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Thống kê bổ sung */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng lượt sử dụng"
              value={statistics.totalUsage}
              valueStyle={{ color: "#13c2c2" }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng khách hàng"
              value={statistics.totalCustomers}
              valueStyle={{ color: "#eb2f96" }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đã hết hạn"
              value={statistics.expiredPromotions}
              valueStyle={{ color: "#8c8c8c" }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tạm dừng"
              value={promotions.filter((item) => item.status === "inactive").length}
              valueStyle={{ color: "#f5222d" }}
              prefix={<DeleteOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Spin spinning={isLoading}>
        <AdminTable
          title="Quản lý chương trình khuyến mãi"
          dataSource={promotions}
          columns={columns}
          actions={actions}
          onAdd={handleAddNew}
          addButtonText="Thêm chương trình mới"
          loading={isLoading}
          pagination={{
            current: pagination.page + 1,
            pageSize: pagination.size,
            total: totalElements,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total: number, range: [number, number]) =>
              `${range[0]}-${range[1]} của ${total} chương trình`,
            onChange: (page: number, size: number) => {
              setPagination({ page: page - 1, size: size || 10 });
            },
          }}
        />
      </Spin>

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
