"use client";
import React, { useState, useEffect } from "react";
import { Tag, Space, Typography, App } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  UserOutlined,
} from "@ant-design/icons";
import AdminTable from "@/components/ui/Table/AdminTable";
import { useConfirmationModalContext } from "@/components/ui/Modal";
import { useBranchesByCenter } from "@/lib/api/hooks/useBranchesByCenter";
import { useCenters } from "@/lib/api/hooks/useCenters";
import { BranchDisplay } from "@/lib/api/types/branch.types";
import {
  BranchDetailModal,
  BranchEditModal,
  BranchCreateModal,
} from "@/components/ui/Modal/BranchModal";

const { Text } = Typography;

const BranchesPage = () => {
  const { message } = App.useApp();
  const { centers } = useCenters();
  const centerId = centers.length > 0 ? centers[0].center_id : null;
  const { branches, loading, refreshBranches } = useBranchesByCenter(centerId);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedData, setSelectedData] = useState<BranchDisplay | null>(null);
  const [editData, setEditData] = useState<BranchDisplay | null>(null);
  const { showModal } = useConfirmationModalContext();

  // Mock pagination for now
  const pagination = {
    page: 0,
    size: 10,
    total_elements: branches.length,
    total_pages: 1,
    first: true,
    last: true,
    has_next: false,
    has_previous: false,
  };

  const columns = [
    {
      title: "Tên chi nhánh",
      dataIndex: "branch_name",
      key: "branch_name",
      width: 200,
      render: (text: string, record: BranchDisplay) => (
        <div>
          <Text strong style={{ fontSize: 14 }}>
            {text}
          </Text>
          <div style={{ marginTop: 4 }}>
            <Space size="small">
              <EnvironmentOutlined style={{ color: "#8c8c8c", fontSize: 12 }} />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.address}
              </Text>
            </Space>
          </div>
        </div>
      ),
    },
    {
      title: "Thông tin liên hệ",
      key: "contact",
      width: 180,
      render: (record: BranchDisplay) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <Space size="small">
              <PhoneOutlined style={{ color: "#1890ff", fontSize: 12 }} />
              <Text style={{ fontSize: 12 }}>{record.phone}</Text>
            </Space>
          </div>
          <div>
            <Space size="small">
              <MailOutlined style={{ color: "#52c41a", fontSize: 12 }} />
              <Text style={{ fontSize: 12 }}>{record.email}</Text>
            </Space>
          </div>
        </div>
      ),
    },
    {
      title: "Quản lý",
      key: "manager",
      width: 120,
      render: (record: BranchDisplay) => (
        <Space>
          <UserOutlined style={{ color: "#722ed1" }} />
          <Text>{record.manager_name}</Text>
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "operating_status",
      key: "operating_status",
      width: 120,
      render: (status: string) => (
        <Tag
          color={
            status === "ACTIVE"
              ? "green"
              : status === "INACTIVE"
              ? "red"
              : "orange"
          }
        >
          {status === "ACTIVE"
            ? "Hoạt động"
            : status === "INACTIVE"
            ? "Tạm dừng"
            : "Bảo trì"}
        </Tag>
      ),
    },
    {
      title: "Ngày thành lập",
      dataIndex: "established_date",
      key: "established_date",
      width: 120,
      render: (date: string) => (
        <Text type="secondary">
          {date ? new Date(date).toLocaleDateString() : "N/A"}
        </Text>
      ),
    },
    {
      title: "Khu vực dịch vụ",
      key: "service_slots",
      width: 150,
      render: (record: BranchDisplay) => (
        <div>
          <Text strong style={{ color: "#1890ff" }}>
            {record.service_slots || 0} slots
          </Text>
          <div style={{ fontSize: 11, color: "#8c8c8c" }}>Khu vực dịch vụ</div>
        </div>
      ),
    },
  ];

  // Handlers
  const handleView = (record: BranchDisplay) => {
    setSelectedData(record);
    setDetailModalVisible(true);
  };

  const handleEdit = (record: BranchDisplay) => {
    setEditData(record);
    setEditModalVisible(true);
  };

  const handleDelete = async (record: BranchDisplay) => {
    showModal({
      title: "Xác nhận xóa chi nhánh",
      content: `Bạn có chắc chắn muốn xóa chi nhánh "${record.branch_name}"? Hành động này không thể hoàn tác.`,
      type: "confirm",
      confirmText: "Xóa",
      cancelText: "Hủy",
      onConfirm: async () => {
        try {
          // TODO: Implement delete branch API
          message.success("Xóa chi nhánh thành công");
          await refreshBranches();
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Có lỗi xảy ra khi xóa chi nhánh";
          message.error(errorMessage);
        }
      },
    });
  };

  const handleCreateModalSuccess = async () => {
    try {
      await refreshBranches();
      message.success("Thêm chi nhánh thành công");
      setCreateModalVisible(false);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi thêm chi nhánh";
      message.error(errorMessage);
    }
  };

  const handleEditModalSuccess = async () => {
    try {
      await refreshBranches();
      message.success("Cập nhật chi nhánh thành công");
      setEditModalVisible(false);
      setEditData(null);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi cập nhật chi nhánh";
      message.error(errorMessage);
    }
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
  ];

  return (
    <div>
      <AdminTable
        title="Quản lý chi nhánh"
        dataSource={branches}
        columns={columns}
        actions={actions}
        onAdd={() => setCreateModalVisible(true)}
        addButtonText="Thêm chi nhánh mới"
        loading={loading}
        searchable={true}
        searchPlaceholder="Tìm kiếm chi nhánh theo tên, địa chỉ, số điện thoại..."
        searchFields={["branch_name", "address", "phone", "manager_name"]}
        pagination={{
          current: pagination.page + 1,
          pageSize: pagination.size,
          total: pagination.total_elements,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: number, range: [number, number]) =>
            `${range[0]}-${range[1]} của ${total} chi nhánh`,
        }}
      />

      {/* Modals */}
      <BranchCreateModal
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSuccess={handleCreateModalSuccess}
        centerId={centerId}
      />

      <BranchDetailModal
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        branch={selectedData}
      />

      <BranchEditModal
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditData(null);
        }}
        onSuccess={handleEditModalSuccess}
        branch={editData}
        centerId={centerId}
      />
    </div>
  );
};

export default BranchesPage;
