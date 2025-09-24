"use client";
import React, { useState } from "react";
import { AdminTable } from "@/components/ui/Table";
import { 
  useConfirmationModalContext,
  CustomerModal,
  CustomerDetailModal,
  CustomerVehiclesModal
} from "@/components/ui/Modal";
import { ColumnsType } from "antd/es/table";
import { Tag, Avatar, Badge } from "antd";
import { CarOutlined, PhoneOutlined } from "@ant-design/icons";
import {
  customersData,
  customerTypes,
  customerStatuses,
} from "@/components/utils/data/customers.data";
import formatCurrency from "@/components/utils/helper/currency.format.helper";
import { calculateAge } from "@/components/utils/helper/member.helper";

const MembersPage = () => {
  const [data, setData] = useState(customersData);
  const [loading, setLoading] = useState(false);
  const { showModal } = useConfirmationModalContext();
  
  // Modal states
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [vehiclesModalVisible, setVehiclesModalVisible] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);
  const [editData, setEditData] = useState<any>(null);

  // Định nghĩa columns
  const columns: ColumnsType<any> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Mã KH",
      dataIndex: "customerCode",
      key: "customerCode",
      width: 100,
      render: (code: string) => (
        <span style={{ fontFamily: "monospace", fontWeight: 500 }}>{code}</span>
      ),
    },
    {
      title: "Khách hàng",
      key: "customer",
      width: 250,
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar size="large" style={{ backgroundColor: "#1890ff" }}>
            {record.fullName.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>
              {record.fullName}
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>
              {record.gender === "male" ? "Nam" : "Nữ"},{" "}
              {calculateAge(record.dateOfBirth)} tuổi
            </div>
            <div style={{ fontSize: 11, color: "#999" }}>{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Liên hệ",
      key: "contact",
      width: 180,
      render: (_, record) => (
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
            <span style={{ fontSize: 12 }}>{record.phone}</span>
          </div>
          <div style={{ fontSize: 11, color: "#666", lineHeight: 1.2 }}>
            {record.address.length > 30
              ? `${record.address.substring(0, 30)}...`
              : record.address}
          </div>
        </div>
      ),
    },
    {
      title: "Loại KH",
      dataIndex: "customerType",
      key: "customerType",
      width: 100,
      render: (type: string) => {
        const typeConfig = customerTypes.find((t) => t.value === type);
        return <Tag color={typeConfig?.color}>{typeConfig?.label}</Tag>;
      },
      filters: customerTypes.map((type) => ({
        text: type.label,
        value: type.value,
      })),
      onFilter: (value, record) => record.customerType === value,
    },
    {
      title: "Xe",
      dataIndex: "vehicles",
      key: "vehicles",
      width: 120,
      render: (vehicles: any[]) => (
        <div>
          <Badge
            count={vehicles.length}
            style={{ backgroundColor: "#52c41a" }}
          />
          <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>
            {vehicles.length > 0 ? vehicles[0].brand : "Chưa có xe"}
          </div>
        </div>
      ),
    },
    {
      title: "Đơn hàng",
      dataIndex: "totalOrders",
      key: "totalOrders",
      width: 100,
      sorter: (a, b) => a.totalOrders - b.totalOrders,
      render: (count: number) => (
        <span style={{ fontWeight: 500, color: "#1890ff" }}>{count}</span>
      ),
    },
    {
      title: "Tổng chi tiêu",
      dataIndex: "totalSpent",
      key: "totalSpent",
      width: 150,
      sorter: (a, b) => a.totalSpent - b.totalSpent,
      render: (amount: number) => (
        <span style={{ fontWeight: 500, color: "#52c41a" }}>
          {formatCurrency(amount)}
        </span>
      ),
    },
    {
      title: "Lần cuối",
      dataIndex: "lastVisit",
      key: "lastVisit",
      width: 120,
      sorter: (a, b) =>
        new Date(a.lastVisit).getTime() - new Date(b.lastVisit).getTime(),
      render: (date: string) => {
        const dateObj = new Date(date);
        const now = new Date();
        const diffDays = Math.floor(
          (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24)
        );

        return (
          <div>
            <div style={{ fontSize: 12 }}>
              {dateObj.toLocaleDateString("vi-VN")}
            </div>
            <div
              style={{
                fontSize: 11,
                color:
                  diffDays > 30
                    ? "#ff4d4f"
                    : diffDays > 7
                    ? "#faad14"
                    : "#52c41a",
              }}
            >
              {diffDays === 0
                ? "Hôm nay"
                : diffDays === 1
                ? "1 ngày trước"
                : `${diffDays} ngày trước`}
            </div>
          </div>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => {
        const statusConfig = customerStatuses.find((s) => s.value === status);
        return <Tag color={statusConfig?.color}>{statusConfig?.label}</Tag>;
      },
      filters: customerStatuses.map((status) => ({
        text: status.label,
        value: status.value,
      })),
      onFilter: (value, record) => record.status === value,
    },
  ];

  // Handlers
  const handleAdd = () => {
    setEditData(null);
    setCustomerModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditData(record);
    setCustomerModalVisible(true);
  };


  const handleView = (record: any) => {
    setDetailData(record);
    setDetailModalVisible(true);
  };

  const handleViewVehicles = (record: any) => {
    setDetailData(record);
    setVehiclesModalVisible(true);
  };



  const handleToggleStatus = (record: any) => {
    const action = record.status === "active" ? "vô hiệu hóa" : "kích hoạt";
    showModal({
      title: `${
        action === "vô hiệu hóa" ? "Vô hiệu hóa" : "Kích hoạt"
      } khách hàng`,
      content: `Bạn có chắc chắn muốn ${action} khách hàng ${record.fullName}?`,
      type: "warning",
      onConfirm: async () => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setData(
          data.map((item) =>
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

  const handleCustomerModalSuccess = (customerData: any) => {
    if (editData) {
      // Update existing customer
      setData(prev => prev.map(item => 
        item.id === customerData.id ? { ...item, ...customerData } : item
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
        searchPlaceholder="Tìm kiếm khách hàng theo tên, email, số điện thoại, mã KH..."
        searchFields={["fullName", "email", "phone", "customerCode", "address"]}
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
            label: (record: any) =>
              record.status === "active" ? "Vô hiệu hóa" : "Kích hoạt",
            type: "default",
            danger: (record: any) => record.status === "active",
            onClick: handleToggleStatus,
          },
        ]}
        scroll={{ x: 1400 }}
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
