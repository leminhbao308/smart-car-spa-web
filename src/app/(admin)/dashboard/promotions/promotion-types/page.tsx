"use client";
import React, { useState } from "react";
import {
  Tag,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Space,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  GiftOutlined,
  PercentageOutlined,
  DollarOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import AdminTable from "@/components/ui/Table/AdminTable";
import PromotionTypeModal from "@/components/ui/Modal/PromotionTypeModal/PromotionTypeModal";
import { useConfirmationModalContext } from "@/components/ui/Modal";
import {
  promotionTypesData,
  PromotionType,
} from "@/components/utils/data/promotion-types.data";
import { formatDate } from "@/components/utils/helper/date.format.helper";

const { Text } = Typography;

const PromotionTypesPage = () => {
  const [data, setData] = useState<PromotionType[]>(promotionTypesData);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromotionType, setEditingPromotionType] = useState<PromotionType | null>(null);
  const [viewingPromotionType, setViewingPromotionType] = useState<PromotionType | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const { showModal } = useConfirmationModalContext();

  const columns = [
    {
      title: "Loại khuyến mãi",
      dataIndex: "name",
      key: "name",
      width: 300,
      render: (text: string, record: PromotionType) => (
        <div>
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 4 }}
          >
            <GiftOutlined style={{ fontSize: 16, marginRight: 8, color: "#1890ff" }} />
            <Text strong style={{ fontSize: 14 }}>
              {text}
            </Text>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Mã: {record.code}
          </Text>
          <div style={{ marginTop: 4 }}>
            <Text style={{ fontSize: 11, color: "#8c8c8c" }}>
              {record.description}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Loại giảm giá",
      dataIndex: "discountType",
      key: "discountType",
      width: 150,
      render: (discountType: string) => (
        <Tag color={discountType === "percentage" ? "blue" : "green"}>
          {discountType === "percentage" ? "Phần trăm" : "Số tiền"}
        </Tag>
      ),
    },
    {
      title: "Giá trị giảm",
      dataIndex: "discountValue",
      key: "discountValue",
      width: 120,
      render: (value: number, record: PromotionType) => (
        <div style={{ textAlign: "center" }}>
          <Text strong style={{ fontSize: 14, color: "#52c41a" }}>
            {record.discountType === "percentage" ? `${value}%` : `${value.toLocaleString()} ₫`}
          </Text>
        </div>
      ),
    },
    {
      title: "Điều kiện áp dụng",
      dataIndex: "conditions",
      key: "conditions",
      width: 200,
      render: (conditions: any) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <Text style={{ fontSize: 12 }}>
              Tối thiểu: {conditions.minAmount ? `${conditions.minAmount.toLocaleString()} ₫` : "Không"}
            </Text>
          </div>
          <div>
            <Text style={{ fontSize: 12 }}>
              Tối đa: {conditions.maxAmount ? `${conditions.maxAmount.toLocaleString()} ₫` : "Không giới hạn"}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status === "active" ? "Hoạt động" : "Tạm dừng"}
        </Tag>
      ),
    },
  ];

  const actions = [
    {
      key: "view",
      label: "Xem chi tiết",
      icon: <EyeOutlined />,
      onClick: (record: PromotionType) => {
        setViewingPromotionType(record);
        setModalMode('view');
        setModalOpen(true);
      },
    },
    {
      key: "edit",
      label: "Chỉnh sửa",
      icon: <EditOutlined />,
      onClick: (record: PromotionType) => {
        setEditingPromotionType(record);
        setModalMode('edit');
        setModalOpen(true);
      },
    },
    {
      key: "deactivate",
      label: "Tạm dừng",
      icon: <DeleteOutlined />,
      danger: true,
      condition: (record: PromotionType) => record.status === "active",
      onClick: (record: PromotionType) => {
        showModal({
          title: "Xác nhận tạm dừng",
          content: `Bạn có chắc chắn muốn tạm dừng loại khuyến mãi "${record.name}"?`,
          type: "warning",
          onConfirm: () => {
            setData(
              data.map((item) =>
                item.id === record.id
                  ? { ...item, status: "inactive" as const }
                  : item
              )
            );
          },
        });
      },
    },
    {
      key: "activate",
      label: "Kích hoạt",
      icon: <EditOutlined />,
      condition: (record: PromotionType) => record.status === "inactive",
      onClick: (record: PromotionType) => {
        showModal({
          title: "Xác nhận kích hoạt",
          content: `Bạn có chắc chắn muốn kích hoạt loại khuyến mãi "${record.name}"?`,
          type: "success",
          onConfirm: () => {
            setData(
              data.map((item) =>
                item.id === record.id
                  ? { ...item, status: "active" as const }
                  : item
              )
            );
          },
        });
      },
    },
  ];

  const handleAddNew = () => {
    setEditingPromotionType(null);
    setViewingPromotionType(null);
    setModalMode('add');
    setModalOpen(true);
  };

  const handleModalOk = (promotionTypeData: PromotionType) => {
    if (modalMode === 'edit' && editingPromotionType) {
      setData(
        data.map((item) =>
          item.id === editingPromotionType.id
            ? { ...promotionTypeData, id: editingPromotionType.id }
            : item
        )
      );
    } else if (modalMode === 'add') {
      setData([...data, promotionTypeData]);
    }
    setModalOpen(false);
    setEditingPromotionType(null);
    setViewingPromotionType(null);
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setEditingPromotionType(null);
    setViewingPromotionType(null);
  };

  // Thống kê tổng quan
  const totalTypes = data.length;
  const activeTypes = data.filter((item) => item.status === "active").length;
  const inactiveTypes = data.filter((item) => item.status === "inactive").length;
  const percentageTypes = data.filter((item) => item.discountType === "percentage").length;
  const amountTypes = data.filter((item) => item.discountType === "amount").length;

  return (
    <div>
      {/* Thống kê tổng quan */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng loại khuyến mãi"
              value={totalTypes}
              valueStyle={{ color: "#1890ff" }}
              prefix={<GiftOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={activeTypes}
              valueStyle={{ color: "#52c41a" }}
              prefix={<PercentageOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tạm dừng"
              value={inactiveTypes}
              valueStyle={{ color: "#fa8c16" }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Giảm theo %"
              value={percentageTypes}
              valueStyle={{ color: "#722ed1" }}
              prefix={<DollarOutlined />}
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
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <GiftOutlined style={{ color: "#1890ff", fontSize: 18 }} />
              <span style={{ fontSize: 16, fontWeight: 600 }}>
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
              <EditOutlined />
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
          dataSource={data}
          columns={columns}
          actions={actions}
          showAddButton={false}
          searchable={true}
          searchPlaceholder="Tìm kiếm loại khuyến mãi theo tên, mã..."
          searchFields={["name", "code", "description"]}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total: number, range: [number, number]) =>
              `${range[0]}-${range[1]} của ${total} loại khuyến mãi`,
          }}
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
