"use client";
import React, {useState} from "react";
import {
  Tag,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Spin,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  GiftOutlined,
  CheckCircleOutlined,
  PauseCircleOutlined,
} from "@ant-design/icons";
import AdminTable from "@/components/ui/Table/AdminTable";
import PromotionTypeModal from "@/components/ui/Modal/PromotionTypeModal/PromotionTypeModal";
import {useConfirmationModalContext} from "@/components/ui/Modal";
import {PromotionTypeInfo} from "@/lib/api";
import {formatDate} from "@/components/utils/helper/date.format.helper";
import {usePromotionType} from "@/lib/api/hooks";

const {Text} = Typography;

const PromotionTypesPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromotionType, setEditingPromotionType] = useState<PromotionTypeInfo | null>(null);
  const [viewingPromotionType, setViewingPromotionType] = useState<PromotionTypeInfo | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const {showModal} = useConfirmationModalContext();

  const {
    promotionTypes,
    totalElements,
    totalPages,
    currentPage,
    pageSize,
    statistics,
    isLoadingList,
    isLoadingStats,
    isDeleting,
    createPromotionType,
    updatePromotionType,
    deletePromotionType,
    togglePromotionTypeStatus,
    changePage,
    changePageSize,
    searchByKeyword,
  } = usePromotionType();

  const columns = [
    {
      title: "Loại khuyến mãi",
      dataIndex: "typeName",
      key: "typeName",
      width: 300,
      render: (text: string, record: PromotionTypeInfo) => (
        <div>
          <div
            style={{display: "flex", alignItems: "center", marginBottom: 4}}
          >
            <GiftOutlined style={{fontSize: 16, marginRight: 8, color: "#1890ff"}}/>
            <Text strong style={{fontSize: 14}}>
              {text}
            </Text>
          </div>
          <Text type="secondary" style={{fontSize: 12}}>
            Mã: {record.typeCode}
          </Text>
          <div style={{marginTop: 4}}>
            <Text style={{fontSize: 11, color: "#8c8c8c"}}>
              {record.description}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      width: 120,
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Hoạt động" : "Tạm dừng"}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_date",
      key: "created_date",
      width: 150,
      render: (date: string) => (
        <Text style={{fontSize: 12}}>
          {formatDate(date)}
        </Text>
      ),
    },
    {
      title: "Cập nhật cuối",
      dataIndex: "modified_date",
      key: "modified_date",
      width: 150,
      render: (date: string) => (
        <Text style={{fontSize: 12}}>
          {formatDate(date)}
        </Text>
      ),
    },
  ];

  const actions = [
    {
      key: "view",
      label: "Xem chi tiết",
      icon: <EyeOutlined/>,
      onClick: (record: PromotionTypeInfo) => {
        setViewingPromotionType(record);
        setModalMode('view');
        setModalOpen(true);
      },
    },
    {
      key: "edit",
      label: "Chỉnh sửa",
      icon: <EditOutlined/>,
      onClick: (record: PromotionTypeInfo) => {
        setEditingPromotionType(record);
        setModalMode('edit');
        setModalOpen(true);
      },
    },
    {
      key: "deactivate",
      label: (record: PromotionTypeInfo) => record.is_active ? "Tạm dừng" : "Kích hoạt",
      icon: (record: PromotionTypeInfo) =>
        record.is_active ? <PauseCircleOutlined/> : <CheckCircleOutlined/>,
      danger: (record: PromotionTypeInfo) => record.is_active,
      onClick: (record: PromotionTypeInfo) => {
        showModal({
          title: record.is_active ? "Xác nhận tạm dừng" : "Xác nhận kích hoạt",
          content: `Bạn có chắc chắn muốn ${record.is_active ? "tạm dừng" : "kích hoạt"} loại khuyến mãi "${record.typeName}"?`,
          type: record.is_active ? "warning" : "success",
          onConfirm: async () => {
            await togglePromotionTypeStatus(record.promotionTypeId, record.is_active);
          },
        });
      },
    }
  ];

  const handleAddNew = () => {
    setEditingPromotionType(null);
    setViewingPromotionType(null);
    setModalMode('add');
    setModalOpen(true);
  };

  const handleModalOk = async (promotionTypeData: PromotionTypeInfo) => {
    try {
      if (modalMode === 'edit' && editingPromotionType) {
        await updatePromotionType(editingPromotionType.promotionTypeId, {
          typeCode: promotionTypeData.typeCode,
          typeName: promotionTypeData.typeName,
          description: promotionTypeData.description,
        });
      } else if (modalMode === 'add') {
        await createPromotionType({
          typeCode: promotionTypeData.typeCode,
          typeName: promotionTypeData.typeName,
          description: promotionTypeData.description,
        });
      }
      setModalOpen(false);
      setEditingPromotionType(null);
      setViewingPromotionType(null);
    } catch (error) {
      console.error("Error saving promotion type:", error);
    }
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setEditingPromotionType(null);
    setViewingPromotionType(null);
  };

  const handleSearch = (value: string) => {
    searchByKeyword(value);
  };

  const handlePageChange = (page: number, size: number) => {
    if (size !== pageSize) {
      changePageSize(size);
    } else {
      changePage(page - 1);
    }
  };

  if (isLoadingList || isLoadingStats) {
    return (
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px'}}>
        <Spin size="large" tip="Đang tải dữ liệu..."/>
      </div>
    );
  }

  return (
    <div>
      {/* Thống kê tổng quan */}
      <Row gutter={[16, 16]} style={{marginBottom: 24}}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng loại khuyến mãi"
              value={statistics?.totalPromotionTypes || 0}
              valueStyle={{color: "#1890ff"}}
              prefix={<GiftOutlined/>}
              loading={isLoadingStats}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={statistics?.activePromotionTypes || 0}
              valueStyle={{color: "#52c41a"}}
              prefix={<CheckCircleOutlined/>}
              loading={isLoadingStats}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tạm dừng"
              value={statistics?.inactivePromotionTypes || 0}
              valueStyle={{color: "#fa8c16"}}
              prefix={<PauseCircleOutlined/>}
              loading={isLoadingStats}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table */}
      <Card
        title={
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%"
          }}>
            <div style={{display: "flex", alignItems: "center", gap: 8}}>
              <GiftOutlined style={{color: "#1890ff", fontSize: 18}}/>
              <span style={{fontSize: 16, fontWeight: 600}}>
                Quản lý loại khuyến mãi
              </span>
            </div>
            <button
              type="button"
              onClick={handleAddNew}
              style={{
                background: "#1890ff",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "8px 16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <EditOutlined/>
              Thêm loại khuyến mãi mới
            </button>
          </div>
        }
        style={{
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          borderRadius: 8,
        }}
      >
        <AdminTable
          dataSource={promotionTypes}
          columns={columns}
          actions={actions}
          showAddButton={false}
          searchable={true}
          searchPlaceholder="Tìm kiếm loại khuyến mãi theo tên, mã..."
          onSearch={handleSearch}
          pagination={{
            current: currentPage + 1,
            pageSize: pageSize,
            total: totalElements,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total: number, range: [number, number]) =>
              `${range[0]}-${range[1]} của ${total} loại khuyến mãi`,
            onChange: handlePageChange,
          }}
          loading={isLoadingList || isDeleting}
        />
      </Card>

      <PromotionTypeModal
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        initialData={modalMode === 'view' ? viewingPromotionType : editingPromotionType}
        title={
          modalMode === 'view'
            ? "Chi tiết loại khuyến mãi"
            : modalMode === 'edit'
              ? "Chỉnh sửa loại khuyến mãi"
              : "Thêm loại khuyến mãi mới"
        }
      />
    </div>
  );
};

export default PromotionTypesPage;
