"use client";
import React, { useState, useEffect } from "react";
import { AdminTable } from "@/components/ui/Table";
import {
  useConfirmationModalContext,
  StaffModal,
  StaffDetailModal,
} from "@/components/ui/Modal";
import { ColumnsType } from "antd/es/table";
import { Tag, Avatar, message } from "antd";
import { UserManagementInfo } from "@/lib/api/types";
import { useUserManagement } from "@/lib/api/hooks/useUserManagement";

const StaffPage = () => {
  const { showModal } = useConfirmationModalContext();

  // User Management Hook
  const {
    users,
    pagination,
    isLoading,
    error,
    deleteUser,
    setFilters,
    goToPage,
    changePageSize,
    clearError,
    refreshUsers,
    searchUsers,
  } = useUserManagement();

  // Modal states
  const [staffModalVisible, setStaffModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailData, setDetailData] = useState<UserManagementInfo | null>(null);
  const [editData, setEditData] = useState<UserManagementInfo | null>(null);

  // Fetch staff data (users with EMPLOYEE role)
  useEffect(() => {
    // Set filter to only show EMPLOYEE users
    setFilters({ userType: "EMPLOYEE" });
  }, [setFilters]);

  // Handle error display
  useEffect(() => {
    if (error) {
      message.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Định nghĩa columns
  const columns: ColumnsType<UserManagementInfo> = [
    {
      title: "Tên nhân viên",
      key: "staff",
      width: 250,
      render: (_, record: UserManagementInfo) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar size="large" style={{ backgroundColor: "#1890ff" }}>
            {record.full_name.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>
              {record.full_name}
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>{record.email}</div>
            <div style={{ fontSize: 11, color: "#999" }}>
              {record.gender === "MALE" ? "Nam" : "Nữ"}
              {record.date_of_birth &&
                ` • ${new Date(record.date_of_birth).getFullYear()}`}
            </div>
          </div>
        </div>
      ),
      sorter: (a, b) => a.full_name.localeCompare(b.full_name),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone_number",
      key: "phone_number",
      width: 130,
    },
    {
      title: "Vai trò",
      key: "role",
      width: 150,
      render: (_, record: UserManagementInfo) => (
        <div>
          <Tag color="blue">{record?.role?.role_name}</Tag>
          <div style={{ fontSize: 11, color: "#666", fontFamily: "monospace" }}>
            {record?.role?.role_code}
          </div>
        </div>
      ),
      filters: [
        { text: "Administrator", value: "ADMIN" },
        { text: "Manager", value: "MANAGER" },
        { text: "Technician", value: "TECHNICIAN" },
        { text: "Cashier", value: "CASHIER" },
        { text: "Customer Service", value: "CS" },
        { text: "Inventory Manager", value: "INV_MGR" },
      ],
      onFilter: (value, record: UserManagementInfo) =>
        record.role.role_code === value,
    },

    {
      title: "Ngày tuyển dụng",
      dataIndex: "hired_at",
      key: "hired_at",
      width: 120,
      render: (hiredAt: string | null) =>
        hiredAt
          ? new Date(hiredAt).toLocaleDateString("vi-VN")
          : "Chưa cập nhật",
      sorter: (a, b) => {
        if (!a.hired_at && !b.hired_at) return 0;
        if (!a.hired_at) return 1;
        if (!b.hired_at) return -1;
        return new Date(a.hired_at).getTime() - new Date(b.hired_at).getTime();
      },
    },

    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
      filters: [
        { text: "Hoạt động", value: true },
        { text: "Không hoạt động", value: false },
      ],
      onFilter: (value, record: UserManagementInfo) =>
        record.is_active === value,
    },
  ];

  // Handlers
  const handleAdd = () => {
    setEditData(null);
    setStaffModalVisible(true);
  };

  const handleEdit = (record: UserManagementInfo) => {
    if (record.is_deleted) {
      message.warning("Không thể chỉnh sửa nhân viên đã bị xóa!");
      return;
    }
    setEditData(record);
    setStaffModalVisible(true);
  };

  const handleView = (record: UserManagementInfo) => {
    setDetailData(record);
    setDetailModalVisible(true);
  };

  const handleDeleteUser = (record: UserManagementInfo) => {
    showModal({
      title: "Xóa nhân viên",
      content: `Bạn có chắc chắn muốn xóa nhân viên ${record.full_name}? Hành động này không thể hoàn tác.`,
      type: "error",
      onConfirm: async () => {
        try {
          await deleteUser(record.user_id);
          message.success(`Đã xóa nhân viên ${record.full_name} thành công`);
        } catch (error: unknown) {
          const errorMessage =
            error && typeof error === "object" && "message" in error
              ? (error as { message: string }).message
              : "Không thể xóa nhân viên";
          message.error(errorMessage);
        }
      },
    });
  };

  const handleStaffModalSuccess = async () => {
    // Refresh the data after successful operation
    try {
      await refreshUsers();
    } catch (error) {
      console.log("StaffPage: Error refreshing data:", error);
    }
  };

  return (
    <>
      <AdminTable
        title="Quản lý nhân viên"
        dataSource={users}
        columns={columns}
        loading={isLoading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onEditCondition={(record: UserManagementInfo) => !record.is_deleted}
        onView={handleView}
        addButtonText="Thêm nhân viên"
        searchable={true}
        searchPlaceholder="Tìm kiếm nhân viên theo tên, email, số điện thoại..."
        searchFields={["full_name", "email", "phone_number"]}
        useServerSearch={true}
        onSearch={searchUsers}
        actions={[
          {
            key: "delete-user",
            label: "Xóa",
            type: "default",
            danger: true,
            onClick: handleDeleteUser,
            condition: (record: UserManagementInfo) =>
              record.is_active && !record.is_deleted,
          },
        ]}
        scroll={{ x: 1200 }}
        rowKey="user_id"
        pagination={{
          current: pagination?.page ? pagination.page + 1 : 1,
          pageSize: pagination?.size || 10,
          total: pagination?.total_elements || 0,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: number, range: [number, number]) =>
            `${range[0]}-${range[1]} của ${total} nhân viên`,
          pageSizeOptions: ["10", "20", "50", "100"],
          onChange: (page: number, pageSize: number) => {
            if (pageSize !== pagination?.size) {
              changePageSize(pageSize || 10);
            } else {
              goToPage(page - 1);
            }
          },
          onShowSizeChange: (current: number, size: number) => {
            changePageSize(size);
          },
        }}
      />

      {/* Staff Modal */}
      <StaffModal
        visible={staffModalVisible}
        onCancel={() => setStaffModalVisible(false)}
        onSuccess={handleStaffModalSuccess}
        editData={editData}
        title={editData ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
      />

      {/* Staff Detail Modal */}
      <StaffDetailModal
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        data={detailData}
      />
    </>
  );
};

export default StaffPage;
