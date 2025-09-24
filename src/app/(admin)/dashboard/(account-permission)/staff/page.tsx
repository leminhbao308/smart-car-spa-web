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
import { User } from "@/lib/api/types";

const StaffPage = () => {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { showModal } = useConfirmationModalContext();
  
  // Modal states
  const [staffModalVisible, setStaffModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailData, setDetailData] = useState<User | null>(null);
  const [editData, setEditData] = useState<User | null>(null);

  // Fetch staff data (users with non-customer roles)
  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await userService.getAllUsers();
      // Filter users with non-customer roles
      // const staffUsers = response.data.content.filter(user => user.role.role_code !== "CUSTOMER");
      // setData(staffUsers);
      
      // Mock data based on API response - only non-customer users
      const mockStaff: User[] = [
        {
          user_id: "8b93b075-b127-4d2d-9f64-0bb10dbb1652",
          email: "lehoangnam@demo.com",
          full_name: "Lê Hoàng Nam",
          phone_number: "0999999999",
          date_of_birth: "2003-01-31 00:00:00",
          gender: "MALE",
          address: "Gò Vấp, Hồ Chí Minh",
          avatar_url: null,
          is_active: true,
          role: {
            role_id: "8ed98905-0562-4dba-af32-27839d86a087",
            role_name: "Technician",
            role_code: "TECHNICIAN",
            description: "Service technician access"
          }
        },
        {
          user_id: "80becbc7-4824-4bc3-8fa8-18c7afa7695d",
          email: "technician@scsms.com",
          full_name: "Technician User",
          phone_number: "0567891234",
          date_of_birth: null,
          gender: "MALE",
          address: null,
          avatar_url: null,
          is_active: true,
          role: {
            role_id: "8ed98905-0562-4dba-af32-27839d86a087",
            role_name: "Technician",
            role_code: "TECHNICIAN",
            description: "Service technician access"
          }
        },
        {
          user_id: "1feab04b-9c51-4307-89ad-b6e359265fad",
          email: "cashier@scsms.com",
          full_name: "Cashier User",
          phone_number: "0678912345",
          date_of_birth: null,
          gender: "FEMALE",
          address: null,
          avatar_url: null,
          is_active: true,
          role: {
            role_id: "af686f51-4781-4fc2-8176-8ada13495db9",
            role_name: "Cashier",
            role_code: "CASHIER",
            description: "Sales and payment processing"
          }
        },
        {
          user_id: "089b67fb-1218-4e44-bba7-4e89f4488dce",
          email: "cs@scsms.com",
          full_name: "Customer Service User",
          phone_number: "0789123456",
          date_of_birth: null,
          gender: "FEMALE",
          address: null,
          avatar_url: null,
          is_active: true,
          role: {
            role_id: "6250fd0d-dbce-4d59-881c-005a43f6a039",
            role_name: "Customer Service",
            role_code: "CS",
            description: "Customer support access"
          }
        },
        {
          user_id: "b6d0701f-ed48-437b-afcd-fd9eb42dfe76",
          email: "ivm@scsms.com",
          full_name: "Iventory Manager User",
          phone_number: "0891234567",
          date_of_birth: null,
          gender: "FEMALE",
          address: null,
          avatar_url: null,
          is_active: true,
          role: {
            role_id: "10b82023-96c8-4d6e-8f35-d01d59663538",
            role_name: "Inventory Manager",
            role_code: "INV_MGR",
            description: "Inventory management access"
          }
        },
        {
          user_id: "018fe43d-30e6-4585-bffd-b8b70b50fb1a",
          email: "admin@scsms.com",
          full_name: "Admin User",
          phone_number: "0123456789",
          date_of_birth: null,
          gender: "MALE",
          address: null,
          avatar_url: null,
          is_active: true,
          role: {
            role_id: "91cc1277-709a-4312-98a2-db8c47d7efb1",
            role_name: "Administrator",
            role_code: "ADMIN",
            description: "Full system access"
          }
        },
        {
          user_id: "cde708cb-da78-458c-9e1b-72a2bd4aa2a4",
          email: "manager@scsms.com",
          full_name: "Manager User",
          phone_number: "0456789123",
          date_of_birth: null,
          gender: "MALE",
          address: null,
          avatar_url: null,
          is_active: true,
          role: {
            role_id: "eee6cddd-f7d8-463a-a2ca-c6784a4282d5",
            role_name: "Manager",
            role_code: "MANAGER",
            description: "Branch management access"
          }
        }
      ];
      setData(mockStaff);
    } catch (error) {
      message.error("Không thể tải danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  };

  // Định nghĩa columns
  const columns: ColumnsType<User> = [
    {
      title: "Nhân viên",
      key: "staff",
      width: 250,
      render: (_, record: User) => (
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
      render: (_, record: User) => (
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
      onFilter: (value, record: User) => record.role.role_code === value,
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
      onFilter: (value, record: User) => record.is_active === value,
    },
  ];

  // Handlers
  const handleAdd = () => {
    setEditData(null);
    setStaffModalVisible(true);
  };

  const handleEdit = (record: User) => {
    setEditData(record);
    setStaffModalVisible(true);
  };

  const handleView = (record: User) => {
    setDetailData(record);
    setDetailModalVisible(true);
  };

  const handleToggleStatus = (record: User) => {
    const action = record.is_active ? "vô hiệu hóa" : "kích hoạt";
    showModal({
      title: `${action === "vô hiệu hóa" ? "Vô hiệu hóa" : "Kích hoạt"} nhân viên`,
      content: `Bạn có chắc chắn muốn ${action} nhân viên ${record.full_name}?`,
      type: "warning",
      onConfirm: async () => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setData(prev => prev.map(item => 
          item.user_id === record.user_id 
            ? { ...item, is_active: !item.is_active }
            : item
        ));
        setLoading(false);
      },
    });
  };

  const handleStaffModalSuccess = (staffData: User) => {
    if (editData) {
      // Update existing staff
      setData(prev => prev.map(item => 
        item.user_id === staffData.user_id ? { ...item, ...staffData } : item
      ));
    } else {
      // Add new staff
      setData(prev => [...prev, staffData]);
    }
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
            label: (record: User) =>
              record.is_active ? "Vô hiệu hóa" : "Kích hoạt",
            type: "default",
            danger: (record: User) => record.is_active,
            onClick: handleToggleStatus,
          },
        ]}
        scroll={{ x: 1000 }}
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
