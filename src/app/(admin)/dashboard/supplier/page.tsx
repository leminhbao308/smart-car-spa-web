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
  App,
} from "antd";
import {
  EditOutlined,
  EyeOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  BankOutlined,
  StarOutlined,
  ClockCircleOutlined,
  PoweroffOutlined,
} from "@ant-design/icons";
import AdminTable from "@/components/ui/Table/AdminTable";
import {
  useConfirmationModalContext,
  SupplierDetailModal,
  SupplierEditModal,
  SupplierCreateModal,
} from "@/components/ui/Modal";
import { useSuppliers, useToggleSupplierStatus } from "@/lib/api/hooks/useSuppliers";
import { Supplier } from "@/lib/api/types/supplier.types";
import { formatDate } from "@/components/utils/helper/date.format.helper";

const { Text } = Typography;

const SupplierPage = () => {
  const { message } = App.useApp();
  
  // React Query hooks
  const { data: suppliersData, isLoading } = useSuppliers({});
  const toggleSupplierStatusMutation = useToggleSupplierStatus();

  // Modal states
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedData, setSelectedData] = useState<Supplier | null>(null);
  const [editData, setEditData] = useState<Supplier | null>(null);
  const { showModal } = useConfirmationModalContext();

  // Extract data from query result
  const suppliers = useMemo(
    () => suppliersData?.data?.content || [],
    [suppliersData?.data?.content]
  );
  const pagination = useMemo(
    () =>
      suppliersData?.data
        ? {
            page: suppliersData.data.page,
            size: suppliersData.data.size,
            total_elements: suppliersData.data.total_elements,
            total_pages: suppliersData.data.total_pages,
            first: suppliersData.data.first,
            last: suppliersData.data.last,
            has_next: suppliersData.data.has_next,
            has_previous: suppliersData.data.has_previous,
          }
        : {
            page: 0,
            size: 10,
            total_elements: 0,
            total_pages: 0,
            first: true,
            last: true,
            has_next: false,
            has_previous: false,
          },
    [suppliersData?.data]
  );

  const columns = [
    {
      title: "Nhà cung cấp",
      dataIndex: "supplier_name",
      key: "supplier_name",
      width: 300,
      render: (text: string, record: Supplier) => (
        <div>
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 4 }}
          >
            <BankOutlined
              style={{ fontSize: 16, marginRight: 8, color: "#1890ff" }}
            />
            <Text strong style={{ fontSize: 14 }}>
              {text}
            </Text>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            ID: {record.supplier_id}
          </Text>
          <div style={{ marginTop: 4 }}>
            <Text style={{ fontSize: 11, color: "#8c8c8c" }}>
              {record.address}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Liên hệ",
      key: "contact",
      width: 200,
      render: (record: Supplier) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <PhoneOutlined style={{ marginRight: 4, color: "#1890ff" }} />
            <Text style={{ fontSize: 12 }}>{record.phone}</Text>
          </div>
          <div style={{ marginBottom: 4 }}>
            <MailOutlined style={{ marginRight: 4, color: "#52c41a" }} />
            <Text style={{ fontSize: 12 }}>{record.email}</Text>
          </div>
          <div style={{ marginBottom: 4 }}>
            <EnvironmentOutlined style={{ marginRight: 4, color: "#fa8c16" }} />
            <Text style={{ fontSize: 12 }}>{record.contact_person}</Text>
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
        <Text style={{ fontSize: 12 }}>{formatDate(date)}</Text>
      ),
    },
  ];

  // Handlers
  const handleView = (record: Supplier) => {
    setSelectedData(record);
    setDetailModalVisible(true);
  };

  const handleEdit = (record: Supplier) => {
    setEditData(record);
    setEditModalVisible(true);
  };

  const handleToggleStatus = async (record: Supplier) => {
    const newStatus = !record.is_active;
    const actionText = newStatus ? "kích hoạt" : "tạm dừng";
    
    showModal({
      title: `Xác nhận ${actionText} nhà cung cấp`,
      content: `Bạn có chắc chắn muốn ${actionText} nhà cung cấp "${record.supplier_name}"?`,
      type: "confirm",
      confirmText: newStatus ? "Kích hoạt" : "Tạm dừng",
      cancelText: "Hủy",
      onConfirm: async () => {
        try {
          await toggleSupplierStatusMutation.mutateAsync({
            supplierId: record.supplier_id,
            isActive: newStatus,
          });
          message.success(`${newStatus ? "Kích hoạt" : "Tạm dừng"} nhà cung cấp thành công`);
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : `Có lỗi xảy ra khi ${actionText} nhà cung cấp`;
          message.error(errorMessage);
        }
      },
    });
  };

  const handleCreateModalSuccess = () => {
    setCreateModalVisible(false);
  };

  const handleEditModalSuccess = () => {
    setEditModalVisible(false);
    setEditData(null);
  };

  const actions = [
    {
      key: "view",
      label: "Xem chi tiết",
      icon: <EyeOutlined />,
      onClick: handleView,
    },
    {
      key: "edit",
      label: "Chỉnh sửa",
      icon: <EditOutlined />,
      onClick: handleEdit,
    },
    {
      key: "toggle-status",
      label: (record: Supplier) => record.is_active ? "Tạm dừng" : "Kích hoạt",
      icon: <PoweroffOutlined />,
      danger: (record: Supplier) => record.is_active,
      onClick: handleToggleStatus,
    },
  ];

  // Statistics
  const statistics = useMemo(() => {
    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter((item) => item.is_active).length;
    const inactiveSuppliers = suppliers.filter(
      (item) => !item.is_active
    ).length;

    return {
      totalSuppliers,
      activeSuppliers,
      inactiveSuppliers,
    };
  }, [suppliers]);

  return (
    <div>
      {/* Thống kê tổng quan */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Tổng nhà cung cấp"
              value={statistics.totalSuppliers}
              valueStyle={{ color: "#1890ff" }}
              prefix={<BankOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={statistics.activeSuppliers}
              valueStyle={{ color: "#52c41a" }}
              prefix={<StarOutlined />}
            />
            <Progress
              percent={
                statistics.totalSuppliers > 0
                  ? Math.round(
                      (statistics.activeSuppliers / statistics.totalSuppliers) *
                        100
                    )
                  : 0
              }
              strokeColor="#52c41a"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Tạm dừng"
              value={statistics.inactiveSuppliers}
              valueStyle={{ color: "#fa8c16" }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <AdminTable
        title="Quản lý nhà cung cấp"
        dataSource={suppliers}
        columns={columns}
        actions={actions}
        onAdd={() => setCreateModalVisible(true)}
        addButtonText="Thêm nhà cung cấp mới"
        loading={isLoading}
        searchable={true}
        searchPlaceholder="Tìm kiếm nhà cung cấp theo tên, liên hệ..."
        searchFields={["supplier_name", "contact_person", "phone", "email"]}
        pagination={{
          current: pagination.page + 1,
          pageSize: pagination.size,
          total: pagination.total_elements,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: number, range: [number, number]) =>
            `${range[0]}-${range[1]} của ${total} nhà cung cấp`,
        }}
      />

      {/* Modals */}
      <SupplierCreateModal
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSuccess={handleCreateModalSuccess}
        loading={isLoading}
      />

      <SupplierDetailModal
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        onEdit={handleEdit}
        supplier={selectedData}
        loading={isLoading}
      />

      <SupplierEditModal
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onSuccess={handleEditModalSuccess}
        supplier={editData}
        loading={isLoading}
      />
    </div>
  );
};

export default SupplierPage;
