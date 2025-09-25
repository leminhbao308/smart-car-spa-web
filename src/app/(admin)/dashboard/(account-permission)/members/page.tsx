"use client";
import React, { useState, useEffect } from "react";
import { AdminTable } from "@/components/ui/Table";
import {
  useConfirmationModalContext,
  CustomerModal,
  CustomerDetailModal,
  CustomerVehiclesModal,
} from "@/components/ui/Modal";
import { ColumnsType } from "antd/es/table";
import { Tag, Avatar, message } from "antd";
import { CarOutlined, PhoneOutlined } from "@ant-design/icons";
import { UserManagementInfo } from "@/lib/api/types";
import { useUserManagement } from "@/lib/api/hooks/useUserManagement";
import { calculateAge } from "@/components/utils/helper/member.helper";

const MembersPage = () => {
  const { showModal } = useConfirmationModalContext();

  // User Management Hook
  const {
    users,
    pagination,
    isLoading,
    error,
    updateUserStatus,
    deleteUser,
    setFilters,
    goToPage,
    changePageSize,
    clearError,
    refreshUsers,
    searchUsers,
  } = useUserManagement();

  // Modal states
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [vehiclesModalVisible, setVehiclesModalVisible] = useState(false);
  const [detailData, setDetailData] = useState<UserManagementInfo | null>(null);
  const [editData, setEditData] = useState<UserManagementInfo | null>(null);

  // Fetch customers data (users with CUSTOMER role)
  useEffect(() => {
    // Set filter to only show CUSTOMER users
    setFilters({ userType: "CUSTOMER" });
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
      title: "Khách hàng",
      key: "customer",
      width: 300,
      render: (_, record: UserManagementInfo) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar size="large" style={{ backgroundColor: "#1890ff" }}>
            {record.full_name.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>
              {record.full_name}
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>
              {record.gender === "MALE" ? "Nam" : "Nữ"}
              {record.date_of_birth &&
                ` • ${calculateAge(record.date_of_birth)} tuổi`}
            </div>
            <div style={{ fontSize: 11, color: "#999" }}>{record.email}</div>
          </div>
        </div>
      ),
      sorter: (a, b) => a.full_name.localeCompare(b.full_name),
    },
    {
      title: "Liên hệ",
      key: "contact",
      width: 200,
      render: (_, record: UserManagementInfo) => (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginBottom: 2,
            }}
          >
            <PhoneOutlined style={{ fontSize: 12, color: "#666" }} />
            <span style={{ fontSize: 12 }}>{record.phone_number}</span>
          </div>
          <div style={{ fontSize: 11, color: "#666", lineHeight: 1.2 }}>
            {record.address && record.address.length > 30
              ? `${record.address.substring(0, 30)}...`
              : record.address || "Chưa cập nhật"}
          </div>
        </div>
      ),
    },
    {
      title: "Ngày sinh",
      dataIndex: "date_of_birth",
      key: "date_of_birth",
      width: 120,
      render: (date: string | null) => {
        if (!date) return "Chưa cập nhật";
        return new Date(date).toLocaleDateString("vi-VN");
      },
      sorter: (a, b) => {
        if (!a.date_of_birth && !b.date_of_birth) return 0;
        if (!a.date_of_birth) return 1;
        if (!b.date_of_birth) return -1;
        return (
          new Date(a.date_of_birth).getTime() -
          new Date(b.date_of_birth).getTime()
        );
      },
    },
    {
      title: "Hạng khách hàng",
      dataIndex: "customer_rank",
      key: "customer_rank",
      width: 120,
      render: (rank: string | null) => {
        if (!rank) return <Tag color="default">Chưa xếp hạng</Tag>;
        const rankColors: { [key: string]: string } = {
          BRONZE: "orange",
          SILVER: "gray",
          GOLD: "gold",
          PLATINUM: "blue",
        };
        return <Tag color={rankColors[rank] || "default"}>{rank}</Tag>;
      },
    },
    {
      title: "Điểm tích lũy",
      dataIndex: "accumulated_points",
      key: "accumulated_points",
      width: 120,
      render: (points: number | null) => (
        <span style={{ fontWeight: 500 }}>
          {points !== null ? points.toLocaleString() : "0"}
        </span>
      ),
      sorter: (a, b) =>
        (a.accumulated_points || 0) - (b.accumulated_points || 0),
    },
    {
      title: "Tổng đơn hàng",
      dataIndex: "total_orders",
      key: "total_orders",
      width: 120,
      render: (orders: number | null) => (
        <span>{orders !== null ? orders : "0"}</span>
      ),
      sorter: (a, b) => (a.total_orders || 0) - (b.total_orders || 0),
    },
    {
      title: "Tổng chi tiêu",
      dataIndex: "total_spent",
      key: "total_spent",
      width: 120,
      render: (spent: number | null) => (
        <span style={{ fontWeight: 500, color: "#52c41a" }}>
          {spent !== null ? `${spent.toLocaleString()} VNĐ` : "0 VNĐ"}
        </span>
      ),
      sorter: (a, b) => (a.total_spent || 0) - (b.total_spent || 0),
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
    setCustomerModalVisible(true);
  };

  const handleEdit = (record: UserManagementInfo) => {
    setEditData(record);
    setCustomerModalVisible(true);
  };

  const handleView = (record: UserManagementInfo) => {
    setDetailData(record);
    setDetailModalVisible(true);
  };

  const handleViewVehicles = (record: UserManagementInfo) => {
    setDetailData(record);
    setVehiclesModalVisible(true);
  };

  const handleToggleStatus = (record: UserManagementInfo) => {
    const action = record.is_active ? "vô hiệu hóa" : "kích hoạt";
    showModal({
      title: `${
        action === "vô hiệu hóa" ? "Vô hiệu hóa" : "Kích hoạt"
      } khách hàng`,
      content: `Bạn có chắc chắn muốn ${action} khách hàng ${record.full_name}?`,
      type: "warning",
      onConfirm: async () => {
        try {
          await updateUserStatus(record.user_id, !record.is_active);
          message.success(
            `Đã ${action} khách hàng ${record.full_name} thành công`
          );
        } catch {
          message.error(`Không thể ${action} khách hàng`);
        }
      },
    });
  };

  const handleDeleteUser = (record: UserManagementInfo) => {
    showModal({
      title: "Xóa khách hàng",
      content: `Bạn có chắc chắn muốn xóa khách hàng ${record.full_name}? Hành động này không thể hoàn tác.`,
      type: "error",
      onConfirm: async () => {
        try {
          await deleteUser(record.user_id);
          message.success(`Đã xóa khách hàng ${record.full_name} thành công`);
        } catch (error: unknown) {
          const errorMessage =
            error && typeof error === "object" && "message" in error
              ? (error as { message: string }).message
              : "Không thể xóa khách hàng";
          message.error(errorMessage);
        }
      },
    });
  };

  const handleCustomerModalSuccess = async () => {
    // Refresh the data after successful operation
    console.log("MembersPage: Refreshing data after modal success...");
    try {
      await refreshUsers();
      console.log("MembersPage: Data refreshed successfully");
    } catch (error) {
      console.error("MembersPage: Error refreshing data:", error);
    }
  };

  return (
    <>
      <AdminTable
        title="Quản lý khách hàng"
        dataSource={users}
        columns={columns}
        loading={isLoading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        addButtonText="Thêm khách hàng"
        searchable={true}
        searchPlaceholder="Tìm kiếm khách hàng theo tên, email, số điện thoại..."
        searchFields={["full_name", "email", "phone_number", "address"]}
        useServerSearch={true}
        onSearch={searchUsers}
        actions={[
          {
            key: "delete-user",
            label: "Xóa",
            type: "default",
            danger: true,
            onClick: handleDeleteUser,
            condition: (record: UserManagementInfo) => record.is_active,
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
            `${range[0]}-${range[1]} của ${total} khách hàng`,
          pageSizeOptions: ["10", "20", "50", "100"],
          onChange: (page: number, pageSize: number) => {
            console.log("Members Page: Pagination changed", { page, pageSize });
            if (pageSize !== pagination?.size) {
              changePageSize(pageSize || 10);
            } else {
              goToPage(page - 1);
            }
          },
          onShowSizeChange: (current: number, size: number) => {
            console.log("Members Page: Page size changed", { current, size });
            changePageSize(size);
          },
        }}
      />

      {/* Customer Modal */}
      <CustomerModal
        visible={customerModalVisible}
        onCancel={() => setCustomerModalVisible(false)}
        onSuccess={handleCustomerModalSuccess}
        editData={editData}
        title={editData ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}
      />

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        data={detailData}
      />

      {/* Customer Vehicles Modal */}
      <CustomerVehiclesModal
        visible={vehiclesModalVisible}
        onCancel={() => setVehiclesModalVisible(false)}
        customerData={detailData}
      />
    </>
  );
};

export default MembersPage;
