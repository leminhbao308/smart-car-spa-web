"use client";
import React, {useState, useMemo} from "react";
import {
  Tag,
  Typography,
  Card,
  Row,
  Col,
  Progress,
  Badge,
  Button,
  Space,
  Select,
  DatePicker,
  Input,
  Spin,
  Tooltip, App,
} from "antd";
import {
  EditOutlined,
  EyeOutlined,
  CalendarOutlined,
  GiftOutlined,
  ClockCircleOutlined,
  FireOutlined,
  SearchOutlined,
  FilterOutlined,
  CopyOutlined,
  ReloadOutlined,
  DownloadOutlined,
  UploadOutlined, DeleteOutlined,
} from "@ant-design/icons";
import AdminTable from "@/components/ui/Table/AdminTable";
import PromotionModal from "@/components/ui/Modal/PromotionModal/PromotionModal";
import {useConfirmationModalContext} from "@/components/ui/Modal";
import {
  Promotion,
  CreatePromotionRequest,
  UpdatePromotionRequest,
  PromotionFilterParam,
  isPromotionExpired,
  isPromotionActive,
  getUsagePercentage,
  isPromotionAvailable,
} from "@/lib/api/types/promotion.types";
import {
  usePromotions,
  usePromotionManagement,
} from "@/lib/api/hooks/usePromotions";
import {formatDate} from "@/components/utils/helper/date.format.helper";
import dayjs from "dayjs";

const {Text, Title} = Typography;
const {RangePicker} = DatePicker;

const PromotionsPage = () => {
  // Ant Design Message
  const {message} = App.useApp();

  // State management
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [viewingPromotion, setViewingPromotion] = useState<Promotion | null>(null);
  const [isViewMode, setisViewMode] = useState(false);

  // Filters & Pagination
  const [filters, setFilters] = useState<PromotionFilterParam>({
    page: 0,
    size: 10,
    sort: "createdDate",
    direction: "DESC",
  });

  const {showModal} = useConfirmationModalContext();

  // API hooks
  const {data: promotionsData, isLoading, refetch} = usePromotions(filters);

  const {
    createPromotion,
    updatePromotion,
    deletePromotion,
    exportPromotions,
    isCreating,
    isUpdating,
    isDeleting,
    loading: managementLoading,
  } = usePromotionManagement();

  const promotions = useMemo(() => promotionsData?.content || [], [promotionsData?.content]);
  const totalElements = promotionsData?.totalElements || 0;
  const currentPage = promotionsData?.currentPage || 0;

  // Table columns
  const columns = [
    {
      title: "Chương trình",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Promotion) => (
        <div>
          <div style={{display: "flex", alignItems: "center", marginBottom: 4}}>
            <Text strong style={{fontSize: 14}}>
              {text}
            </Text>
            {record.is_stackable && (
              <Tag color="cyan" style={{marginLeft: 8, fontSize: 11}}>
                Kết hợp được
              </Tag>
            )}
          </div>
          {record.promotion_code && (
            <Tag color="blue" style={{fontSize: 11}}>
              {record.promotion_code}
            </Tag>
          )}
          {record.description && (
            <div style={{marginTop: 4}}>
              <Text type="secondary" style={{fontSize: 12}}>
                {record.description}
              </Text>
            </div>
          )}
          {(record.start_at || record.end_at) && (
            <div style={{marginTop: 4}}>
              <Text style={{fontSize: 11, color: "#8c8c8c"}}>
                <CalendarOutlined/> {record.start_at ? formatDate(record.start_at) : "N/A"} - {record.end_at ? formatDate(record.end_at) : "N/A"}
              </Text>
            </div>
          )}
        </div>
      ),
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
              <Tag color="success" icon={<FireOutlined/>}>
                Đang chạy
              </Tag>
            ) : record.is_active ? (
              <Tag color="processing">Đã lên lịch</Tag>
            ) : (
              <Tag color="error">Tạm dừng</Tag>
            )}
            {!available && !expired && (
              <Tag color="warning" style={{fontSize: 10}}>
                Hết lượt
              </Tag>
            )}
            {record.is_expired && (
              <Tag color="default" style={{fontSize: 10}}>
                <ClockCircleOutlined/> Hết hạn
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
            <div style={{marginBottom: 4}}>
              <Text style={{fontSize: 12}}>
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
              <div style={{marginTop: 4}}>
                <Text style={{fontSize: 11, color: "#8c8c8c"}}>
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
          <div style={{textAlign: "center"}}>
            <Badge count={priority} style={{backgroundColor: color}}/>
            <div style={{marginTop: 4}}>
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
    {
      title: "Thao tác",
      key: "action",
      width: 250,
      render: (_, record: Promotion) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined/>}
            onClick={() => handleViewDetail(record)}
            size={"small"}
          >
            Xem
          </Button>
          <Button
            type="default"
            icon={<EditOutlined/>}
            onClick={() => handleEdit(record)}
            size={"small"}
          >
            Sửa
          </Button>
          <Button
            type="default"
            danger
            icon={<DeleteOutlined/>}
            onClick={() => handleDelete(record)}
            size={"small"}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  // Event handlers
  const handleViewDetail = (record: Promotion) => {
    setViewingPromotion(record);
    setModalOpen(true);
    setisViewMode(true);
  };

  const handleEdit = (record: Promotion) => {
    setEditingPromotion(record);
    setModalOpen(true);
  };

  const handleDelete = (record: Promotion) => {
    showModal({
      title: "Xác nhận xóa",
      content: `Bạn có chắc chắn muốn xóa chương trình khuyến mãi "${record.name}" không? Hành động này không thể hoàn tác.`,
      onConfirm: async () => {
        try {
          await deletePromotion(record.promotion_id);
        } catch (error) {
          message.error("Xóa thất bại. Vui lòng thử lại sau.", 1);
        } finally {
          await refetch();
        }
      },
    });
  }

  const handleExport = async () => {
    try {
      await exportPromotions(filters);
    } catch (error) {
      message.error("Xuất file thất bại. Vui lòng thử lại sau.", 1);
    }
  };

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
      message.error("Lưu chương trình thất bại. Vui lòng thử lại sau.", 1);
    }
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setEditingPromotion(null);
    setisViewMode(false);
  };

  // Filter handlers
  const handleFilterChange = (key: keyof PromotionFilterParam, value: unknown) => {
    setFilters((prev) => ({...prev, [key]: value, page: 0}));
  };

  const handleSearch = (value: string) => {
    setFilters((prev) => ({...prev, search: value, page: 0}));
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
      <Card style={{marginBottom: 16}}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{margin: 0}}>
              <GiftOutlined/> Quản lý chương trình khuyến mãi
            </Title>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<DownloadOutlined/>}
                onClick={handleExport}
                loading={managementLoading}
              >
                Xuất Excel
              </Button>
              <Button
                icon={<UploadOutlined/>}
                onClick={() => {/* TODO: Import modal */
                }}
              >
                Nhập Excel
              </Button>
              <Button
                type="primary"
                icon={<GiftOutlined/>}
                onClick={handleAddNew}
              >
                Thêm chương trình mới
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Filters */}
      <Card style={{marginBottom: 24}}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Tìm kiếm theo tên, mã..."
              prefix={<SearchOutlined/>}
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
              style={{width: "100%"}}
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
              style={{width: "100%"}}
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
              style={{width: "100%"}}
              placeholder={["Từ ngày", "Đến ngày"]}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Space>
              <Button icon={<FilterOutlined/>} onClick={clearFilters}>
                Xóa bộ lọc
              </Button>
              <Tooltip title="Làm mới">
                <Button icon={<ReloadOutlined/>} onClick={() => refetch()}/>
              </Tooltip>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Spin spinning={isLoading || isDeleting}>
        <AdminTable
          title="Danh sách chương trình khuyến mãi"
          dataSource={promotions}
          columns={columns}
          loading={isLoading}
          rowKey="promotion_id"
          scroll={{x: 1500}}
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
        initialData={isViewMode ? viewingPromotion : editingPromotion}
        loading={isCreating || isUpdating}
        title={
          isViewMode ? "Chi tiết chương trình khuyến mãi" : editingPromotion ? "Chỉnh sửa chương trình khuyến mãi" : "Thêm chương trình khuyến mãi mới"
        }
        isViewMode={isViewMode}
      />
    </div>
  );
};

export default PromotionsPage;
