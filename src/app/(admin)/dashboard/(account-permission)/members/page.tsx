"use client";
import React, { useState, useEffect } from "react";
import { AdminTable } from "@/components/ui/Table";
import { 
  useConfirmationModalContext,
  CustomerModal,
  CustomerDetailModal,
  CustomerVehiclesModal
} from "@/components/ui/Modal";
import { ColumnsType } from "antd/es/table";
import { Tag, Avatar, Badge, message } from "antd";
import { CarOutlined, PhoneOutlined } from "@ant-design/icons";
import { User } from "@/lib/api/types";
import { calculateAge } from "@/components/utils/helper/member.helper";

const MembersPage = () => {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { showModal } = useConfirmationModalContext();
  
  // Modal states
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [vehiclesModalVisible, setVehiclesModalVisible] = useState(false);
  const [detailData, setDetailData] = useState<User | null>(null);
  const [editData, setEditData] = useState<User | null>(null);

  // Fetch customers data (users with CUSTOMER role)
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await userService.getAllUsers();
      // Filter users with CUSTOMER role
      // const customerUsers = response.data.content.filter(user => user.role.role_code === "CUSTOMER");
      // setData(customerUsers);
      
      // Mock data based on API response - only customer users
      const mockCustomers: User[] = [
        {
          user_id: "37ba416e-d82a-4bf0-b389-4f763497749d",
          email: "leminhbao.iuh@gmail.com",
          full_name: "Lê Minh Bảo",
          phone_number: "0399405711",
          date_of_birth: "2003-01-31 00:00:00",
          gender: "MALE",
          address: "Gò Vấp, Hồ Chí Minh",
          avatar_url: null,
          is_active: true,
          role: {
            role_id: "94f2b37a-aca0-4cdd-90db-263e27d744a4",
            role_name: "Customer",
            role_code: "CUSTOMER",
            description: "Customer access"
          }
        },
        {
          user_id: "c1b01cf2-7d39-410f-8cdf-825beb89ab4e",
          email: "user01@scsms.com",
          full_name: "Customer User 01",
          phone_number: "0234567891",
          date_of_birth: null,
          gender: "MALE",
          address: null,
          avatar_url: null,
          is_active: true,
          role: {
            role_id: "94f2b37a-aca0-4cdd-90db-263e27d744a4",
            role_name: "Customer",
            role_code: "CUSTOMER",
            description: "Customer access"
          }
        },
        {
          user_id: "82dced5d-8e06-4403-bf48-c0f538c1c26f",
          email: "user02@scsms.com",
          full_name: "Customer User 02",
          phone_number: "0345678912",
          date_of_birth: null,
          gender: "MALE",
          address: null,
          avatar_url: null,
          is_active: true,
          role: {
            role_id: "94f2b37a-aca0-4cdd-90db-263e27d744a4",
            role_name: "Customer",
            role_code: "CUSTOMER",
            description: "Customer access"
          }
        }
      ];
      setData(mockCustomers);
    } catch (error) {
      message.error("Không thể tải danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  };

  // Định nghĩa columns
  const columns: ColumnsType<User> = [
    {
      title: "Khách hàng",
      key: "customer",
      width: 300,
      render: (_, record: User) => (
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
              {record.date_of_birth && ` • ${calculateAge(record.date_of_birth)} tuổi`}
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
      render: (_, record: User) => (
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
        return new Date(a.date_of_birth).getTime() - new Date(b.date_of_birth).getTime();
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
      onFilter: (value, record: User) => record.is_active === value,
    },
  ];

  // Handlers
  const handleAdd = () => {
    setEditData(null);
    setCustomerModalVisible(true);
  };

  const handleEdit = (record: User) => {
    setEditData(record);
    setCustomerModalVisible(true);
  };

  const handleView = (record: User) => {
    setDetailData(record);
    setDetailModalVisible(true);
  };

  const handleViewVehicles = (record: User) => {
    setDetailData(record);
    setVehiclesModalVisible(true);
  };

  const handleToggleStatus = (record: User) => {
    const action = record.is_active ? "vô hiệu hóa" : "kích hoạt";
    showModal({
      title: `${action === "vô hiệu hóa" ? "Vô hiệu hóa" : "Kích hoạt"} khách hàng`,
      content: `Bạn có chắc chắn muốn ${action} khách hàng ${record.full_name}?`,
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

  const handleCustomerModalSuccess = (customerData: User) => {
    if (editData) {
      // Update existing customer
      setData(prev => prev.map(item => 
        item.user_id === customerData.user_id ? { ...item, ...customerData } : item
      ));
    } else {
      // Add new customer
      setData(prev => [...prev, customerData]);
    }
  };

  return (
    <>
      <AdminTable
        title="Quản lý khách hàng"
        dataSource={data}
        columns={columns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        addButtonText="Thêm khách hàng"
        searchable={true}
        searchPlaceholder="Tìm kiếm khách hàng theo tên, email, số điện thoại..."
        searchFields={["full_name", "email", "phone_number", "address"]}
        actions={[
          {
            key: "view-vehicles",
            label: "Xem xe",
            type: "default",
            icon: <CarOutlined />,
            onClick: handleViewVehicles,
          },
          {
            key: "toggle-status",
            label: (record: User) =>
              record.is_active ? "Vô hiệu hóa" : "Kích hoạt",
            type: "default",
            danger: (record: User) => record.is_active,
            onClick: handleToggleStatus,
          },
        ]}
        scroll={{ x: 800 }}
        rowKey="user_id"
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
