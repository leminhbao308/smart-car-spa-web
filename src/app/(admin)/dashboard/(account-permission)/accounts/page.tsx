"use client";
import React, { useState } from "react";
import { AdminTable } from "@/components/ui/Table";
import { 
  useConfirmationModalContext,
  StaffAccountModal,
  CustomerAccountModal,
  AccountDetailModal,
  EditAccountModal
} from "@/components/ui/Modal";
import { ColumnsType } from "antd/es/table";
import { Tag, Avatar, Tabs } from "antd";
import { departments } from "@/components/utils/data/user-accounts.data";
import { staffData as staffDataMock } from "@/components/utils/data/staff.data";
import { customersData as customersDataMock } from "@/components/utils/data/customers.data";

// Types
interface Staff {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  status: string;
  joinDate: string;
  hasAccount: boolean;
  gender: string;
  address: string;
  notes: string;
}

interface Customer {
  id: number;
  customerCode: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  customerType: string;
  totalOrders: number;
  totalSpent: number;
  lastVisit: string;
  joinDate: string;
  status: string;
  notes: string;
  vehicles: Array<{
    id: number;
    brand: string;
    model: string;
    year: number;
    licensePlate: string;
  }>;
  preferredServices: string[];
}

const AccountsPage = () => {
  const [activeTab, setActiveTab] = useState("staff");
  const [staffData, setStaffData] = useState(staffDataMock);
  const [customerData, setCustomerData] = useState(customersDataMock);
  const [loading, setLoading] = useState(false);
  const { showModal } = useConfirmationModalContext();

  // Modal states
  const [staffModalVisible, setStaffModalVisible] = useState(false);
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailData, setDetailData] = useState<Staff | Customer | null>(null);
  const [detailType, setDetailType] = useState<"staff" | "customer">("staff");
  const [editData, setEditData] = useState<Staff | Customer | null>(null);

  // Định nghĩa columns cho nhân viên
  const staffColumns: ColumnsType<Staff> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Tài khoản",
      key: "account",
      width: 200,
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar size="small" style={{ backgroundColor: "#1890ff" }}>
            {record.name.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{record.email}</div>
            <div style={{ fontSize: 12, color: "#666" }}>{record.phone}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Họ tên",
      dataIndex: "name",
      key: "name",
      width: 150,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      width: 130,
    },
    {
      title: "Chức vụ",
      dataIndex: "position",
      key: "position",
      width: 120,
      render: (position: string) => <Tag color="blue">{position}</Tag>,
    },
    {
      title: "Phòng ban",
      dataIndex: "department",
      key: "department",
      width: 120,
      filters: departments.map((dept) => ({
        text: dept.label,
        value: dept.value,
      })),
      onFilter: (value, record) => record.department === value,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status === "active" ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
      filters: [
        { text: "Hoạt động", value: "active" },
        { text: "Không hoạt động", value: "inactive" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Ngày vào làm",
      dataIndex: "joinDate",
      key: "joinDate",
      width: 120,
      sorter: (a, b) =>
        new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime(),
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
  ];

  // Định nghĩa columns cho khách hàng
  const customerColumns: ColumnsType<Customer> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Tài khoản",
      key: "account",
      width: 200,
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar size="small" style={{ backgroundColor: "#52c41a" }}>
            {record.fullName.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{record.email}</div>
            <div style={{ fontSize: 12, color: "#666" }}>{record.phone}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Mã KH",
      dataIndex: "customerCode",
      key: "customerCode",
      width: 100,
    },
    {
      title: "Họ tên",
      dataIndex: "fullName",
      key: "fullName",
      width: 150,
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      width: 130,
    },
    {
      title: "Loại KH",
      dataIndex: "customerType",
      key: "customerType",
      width: 100,
      render: (type: string) => {
        const typeConfig = {
          vip: { color: "gold", label: "VIP" },
          premium: { color: "purple", label: "Premium" },
          regular: { color: "blue", label: "Thường" },
          new: { color: "green", label: "Mới" },
        };
        const config = typeConfig[type as keyof typeof typeConfig];
        return <Tag color={config?.color}>{config?.label || type}</Tag>;
      },
    },
    {
      title: "Tổng đơn hàng",
      dataIndex: "totalOrders",
      key: "totalOrders",
      width: 120,
      sorter: (a, b) => a.totalOrders - b.totalOrders,
    },
    {
      title: "Tổng chi tiêu",
      dataIndex: "totalSpent",
      key: "totalSpent",
      width: 150,
      sorter: (a, b) => a.totalSpent - b.totalSpent,
      render: (amount: number) => 
        new Intl.NumberFormat('vi-VN', { 
          style: 'currency', 
          currency: 'VND' 
        }).format(amount),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status === "active" ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
      filters: [
        { text: "Hoạt động", value: "active" },
        { text: "Không hoạt động", value: "inactive" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Lần cuối",
      dataIndex: "lastVisit",
      key: "lastVisit",
      width: 150,
      sorter: (a, b) =>
        new Date(a.lastVisit).getTime() - new Date(b.lastVisit).getTime(),
      render: (date: string) => {
        const dateObj = new Date(date);
        return (
          <div>
            <div style={{ fontSize: 12 }}>
              {dateObj.toLocaleDateString("vi-VN")}
            </div>
            <div style={{ fontSize: 11, color: "#666" }}>
              {dateObj.toLocaleTimeString("vi-VN")}
            </div>
          </div>
        );
      },
    },
  ];

  // Handlers cho nhân viên
  const handleAddStaff = () => {
    setEditData(null);
    setStaffModalVisible(true);
  };

  const handleEditStaff = (record: Staff) => {
    setEditData(record);
    setDetailType("staff");
    setEditModalVisible(true);
  };

  // Removed handleDeleteStaff - only allow status updates

  const handleViewStaff = (record: Staff) => {
    setDetailData(record);
    setDetailType("staff");
    setDetailModalVisible(true);
  };

  const handleResetPasswordStaff = (record: Staff) => {
    showModal({
      title: "Đặt lại mật khẩu",
      content: `Bạn có chắc chắn muốn đặt lại mật khẩu cho tài khoản ${record.email}?`,
      type: "warning",
      onConfirm: async () => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setLoading(false);
        console.log("Password reset for:", record.email);
      },
    });
  };

  const handleToggleStatusStaff = (record: Staff) => {
    const action = record.status === "active" ? "vô hiệu hóa" : "kích hoạt";
    showModal({
      title: `${
        action === "vô hiệu hóa" ? "Vô hiệu hóa" : "Kích hoạt"
      } tài khoản`,
      content: `Bạn có chắc chắn muốn ${action} tài khoản ${record.email}?`,
      type: "warning",
      onConfirm: async () => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setStaffData(
          staffData.map((item) =>
            item.id === record.id
              ? {
                  ...item,
                  status: item.status === "active" ? "inactive" : "active",
                }
              : item
          )
        );
        setLoading(false);
      },
    });
  };

  // Handlers cho khách hàng
  const handleAddCustomer = () => {
    setEditData(null);
    setCustomerModalVisible(true);
  };

  const handleEditCustomer = (record: Customer) => {
    setEditData(record);
    setDetailType("customer");
    setEditModalVisible(true);
  };

  // Removed handleDeleteCustomer - only allow status updates

  const handleViewCustomer = (record: Customer) => {
    setDetailData(record);
    setDetailType("customer");
    setDetailModalVisible(true);
  };

  const handleResetPasswordCustomer = (record: Customer) => {
    showModal({
      title: "Đặt lại mật khẩu",
      content: `Bạn có chắc chắn muốn đặt lại mật khẩu cho tài khoản ${record.email}?`,
      type: "warning",
      onConfirm: async () => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setLoading(false);
        console.log("Password reset for:", record.email);
      },
    });
  };

  const handleToggleStatusCustomer = (record: Customer) => {
    const action = record.status === "active" ? "vô hiệu hóa" : "kích hoạt";
    showModal({
      title: `${
        action === "vô hiệu hóa" ? "Vô hiệu hóa" : "Kích hoạt"
      } tài khoản`,
      content: `Bạn có chắc chắn muốn ${action} tài khoản ${record.email}?`,
      type: "warning",
      onConfirm: async () => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setCustomerData(
          customerData.map((item) =>
            item.id === record.id
              ? {
                  ...item,
                  status: item.status === "active" ? "inactive" : "active",
                }
              : item
          )
        );
        setLoading(false);
      },
    });
  };

  // Modal success handlers
  const handleStaffModalSuccess = (data: Staff) => {
    if (editData) {
      // Update existing staff
      setStaffData(prev => prev.map(item => 
        item.id === editData.id ? { ...item, ...data } : item
      ));
    } else {
      // Add new staff
      setStaffData(prev => [...prev, { ...data, hasAccount: true }]);
    }
  };

  const handleCustomerModalSuccess = (data: Customer) => {
    if (editData) {
      // Update existing customer
      setCustomerData(prev => prev.map(item => 
        item.id === editData.id ? { ...item, ...data } : item
      ));
    } else {
      // Add new customer
      setCustomerData(prev => [...prev, { ...data, hasAccount: true }]);
    }
  };

  const handleEditModalSuccess = (data: Staff | Customer) => {
    if (detailType === "staff") {
      setStaffData(prev => prev.map(item => 
        item.id === data.id ? { ...item, ...data } : item
      ));
    } else {
      setCustomerData(prev => prev.map(item => 
        item.id === data.id ? { ...item, ...data } : item
      ));
    }
  };

  const tabItems = [
    {
      key: "staff",
      label: "Nhân viên",
      children: (
        <AdminTable
          title="Tài khoản nhân viên"
          dataSource={staffData}
          columns={staffColumns}
          loading={loading}
          onAdd={handleAddStaff}
          onEdit={handleEditStaff}
          onView={handleViewStaff}
          addButtonText="Thêm tài khoản nhân viên"
          searchable={true}
          searchPlaceholder="Tìm kiếm nhân viên theo tên, email, chức vụ..."
          searchFields={["name", "email", "position", "department"]}
          actions={[
            {
              key: "reset-password",
              label: "Đặt lại mật khẩu",
              type: "default",
              onClick: handleResetPasswordStaff,
            },
            {
              key: "toggle-status",
              label: (record: Staff) =>
                record.status === "active" ? "Vô hiệu hóa" : "Kích hoạt",
              type: "default",
              danger: (record: Staff) => record.status === "active",
              onClick: handleToggleStatusStaff,
            },
          ]}
          scroll={{ x: 1200 }}
        />
      ),
    },
    {
      key: "customer",
      label: "Khách hàng",
      children: (
        <AdminTable
          title="Tài khoản khách hàng"
          dataSource={customerData}
          columns={customerColumns}
          loading={loading}
          onAdd={handleAddCustomer}
          onEdit={handleEditCustomer}
          onView={handleViewCustomer}
          addButtonText="Thêm tài khoản khách hàng"
          searchable={true}
          searchPlaceholder="Tìm kiếm khách hàng theo tên, email, số điện thoại..."
          searchFields={["fullName", "email", "phone", "customerCode"]}
          actions={[
            {
              key: "reset-password",
              label: "Đặt lại mật khẩu",
              type: "default",
              onClick: handleResetPasswordCustomer,
            },
            {
              key: "toggle-status",
              label: (record: Customer) =>
                record.status === "active" ? "Vô hiệu hóa" : "Kích hoạt",
              type: "default",
              danger: (record: Customer) => record.status === "active",
              onClick: handleToggleStatusCustomer,
            },
          ]}
          scroll={{ x: 1400 }}
        />
      ),
    },
  ];

  return (
    <div>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
      />
      
      {/* Modals */}
      <StaffAccountModal
        visible={staffModalVisible}
        onCancel={() => setStaffModalVisible(false)}
        onSuccess={handleStaffModalSuccess}
        editData={editData}
      />
      
      <CustomerAccountModal
        visible={customerModalVisible}
        onCancel={() => setCustomerModalVisible(false)}
        onSuccess={handleCustomerModalSuccess}
        editData={editData}
      />
      
      <AccountDetailModal
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        data={detailData}
        type={detailType}
      />
      
      <EditAccountModal
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onSuccess={handleEditModalSuccess}
        data={editData}
        type={detailType}
      />
    </div>
  );
};

export default AccountsPage;
