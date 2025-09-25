"use client";
import React, { useState, useEffect } from "react";
import { AdminTable } from "@/components/ui/Table";
import { 
  useConfirmationModalContext,
  StaffModal,
  StaffDetailModal
} from "@/components/ui/Modal";
import { ColumnsType } from "antd/es/table";
import { Tag, Avatar, message } from "antd";
import { UserManagementInfo, UserType } from "@/lib/api/types";
import { UserService } from "@/lib/api/services/user.service";

const StaffPage = () => {
  const [data, setData] = useState<UserManagementInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const { showModal } = useConfirmationModalContext();
  
  // Modal states
  const [staffModalVisible, setStaffModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailData, setDetailData] = useState<UserManagementInfo | null>(null);
  const [editData, setEditData] = useState<UserManagementInfo | null>(null);

  // Fetch staff data (users with non-customer roles)
  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      // Fetch employees using API
      const response = await UserService.getAllUsers({
        userType: "EMPLOYEE" as UserType,
        page: 0,
        size: 100, // Get all employees for now
        direction: "DESC",
        sort: "createdDate"
      });
      
      setData(response.data.content);
    } catch (error) {
      console.error("Error fetching staff:", error);
      message.error("Không thể tải danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  };

  // Định nghĩa columns
  const columns: ColumnsType<UserManagementInfo> = [
    {
      title: "Nhân viên",
      key: "staff",
      width: 250,
      render: (_, record: UserManagementInfo) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar size="large" style={{ backgroundColor: "#1890ff" }}>
            {record.full_name.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{record.full_name}</div>
            <div style={{ fontSize: 12, color: "#666" }}>{record.email}</div>
            <div style={{ fontSize: 11, color: "#999" }}>
              {record.gender === "MALE" ? "Nam" : "Nữ"}
              {record.date_of_birth && ` • ${new Date(record.date_of_birth).getFullYear()}`}
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
          <Tag color="blue">{record.role.role_name}</Tag>
          <div style={{ fontSize: 11, color: "#666", fontFamily: "monospace" }}>
            {record.role.role_code}
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
      onFilter: (value, record: UserManagementInfo) => record.role.role_code === value,
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      width: 200,
      ellipsis: true,
      render: (address: string | null) => address || "Chưa cập nhật",
    },
    {
      title: "Ngày tuyển dụng",
      dataIndex: "hired_at",
      key: "hired_at",
      width: 120,
      render: (hiredAt: string | null) => 
        hiredAt ? new Date(hiredAt).toLocaleDateString("vi-VN") : "Chưa cập nhật",
      sorter: (a, b) => {
        if (!a.hired_at && !b.hired_at) return 0;
        if (!a.hired_at) return 1;
        if (!b.hired_at) return -1;
        return new Date(a.hired_at).getTime() - new Date(b.hired_at).getTime();
      },
    },
    {
      title: "CMND/CCCD",
      dataIndex: "citizen_id",
      key: "citizen_id",
      width: 120,
      render: (citizenId: string | null) => citizenId || "Chưa cập nhật",
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
      onFilter: (value, record: UserManagementInfo) => record.is_active === value,
    },
  ];

  // Handlers
  const handleAdd = () => {
    setEditData(null);
    setStaffModalVisible(true);
  };

  const handleEdit = (record: UserManagementInfo) => {
    setEditData(record);
    setStaffModalVisible(true);
  };

  const handleView = (record: UserManagementInfo) => {
    setDetailData(record);
    setDetailModalVisible(true);
  };

  const handleToggleStatus = (record: UserManagementInfo) => {
    const action = record.is_active ? "vô hiệu hóa" : "kích hoạt";
    showModal({
      title: `${action === "vô hiệu hóa" ? "Vô hiệu hóa" : "Kích hoạt"} nhân viên`,
      content: `Bạn có chắc chắn muốn ${action} nhân viên ${record.full_name}?`,
      type: "warning",
      onConfirm: async () => {
        try {
          setLoading(true);
          await UserService.updateUserStatus(record.user_id, !record.is_active);
          setData(prev => prev.map(item => 
            item.user_id === record.user_id 
              ? { ...item, is_active: !item.is_active }
              : item
          ));
          message.success(`Đã ${action} nhân viên ${record.full_name} thành công!`);
        } catch (error) {
          console.error("Error updating user status:", error);
          message.error(`Không thể ${action} nhân viên ${record.full_name}`);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleStaffModalSuccess = () => {
    // Refresh the staff list after create/update
    fetchStaff();
  };

  return (
    <>
      <AdminTable
        title="Quản lý nhân viên"
        dataSource={data}
        columns={columns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        addButtonText="Thêm nhân viên"
        searchable={true}
        searchPlaceholder="Tìm kiếm nhân viên theo tên, email, số điện thoại..."
        searchFields={["full_name", "email", "phone_number"]}
        actions={[
          {
            key: "toggle-status",
            label: (record: UserManagementInfo) =>
              record.is_active ? "Vô hiệu hóa" : "Kích hoạt",
            type: "default",
            danger: (record: UserManagementInfo) => record.is_active,
            onClick: handleToggleStatus,
          },
        ]}
        scroll={{ x: 1200 }}
        rowKey="user_id"
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
