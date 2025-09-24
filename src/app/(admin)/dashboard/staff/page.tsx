"use client";
import React, { useState } from "react";
import { AdminTable } from "@/components/ui/Table";
import { 
  useConfirmationModalContext,
  StaffModal,
  StaffDetailModal
} from "@/components/ui/Modal";
import { ColumnsType } from "antd/es/table";
import { Tag, Avatar } from "antd";
import { staffData } from "@/components/utils/data/staff.data";

const StaffPage = () => {
  const [data, setData] = useState(staffData);
  const [loading, setLoading] = useState(false);
  const { showModal } = useConfirmationModalContext();
  
  // Modal states
  const [staffModalVisible, setStaffModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
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
      title: "Nhân viên",
      key: "staff",
      width: 200,
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar size="small" style={{ backgroundColor: "#1890ff" }}>
            {record.name.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{record.name}</div>
            <div style={{ fontSize: 12, color: "#666" }}>{record.email}</div>
          </div>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
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
      filters: [
        { text: "Quản lý", value: "Quản lý" },
        { text: "Nhân viên", value: "Nhân viên" },
        { text: "Kỹ thuật viên", value: "Kỹ thuật viên" },
      ],
      onFilter: (value, record) => record.position === value,
    },
    {
      title: "Phòng ban",
      dataIndex: "department",
      key: "department",
      width: 120,
      filters: [
        { text: "Kỹ thuật", value: "Kỹ thuật" },
        { text: "Kinh doanh", value: "Kinh doanh" },
      ],
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
    },
  ];

  // Handlers
  const handleAdd = () => {
    setEditData(null);
    setStaffModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditData(record);
    setStaffModalVisible(true);
  };

  const handleDelete = (record: any) => {
    showModal({
      title: "Xóa nhân viên",
      content: `Bạn có chắc chắn muốn xóa nhân viên ${record.name}?`,
      type: "error",
      onConfirm: async () => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setData(data.filter((item) => item.id !== record.id));
        setLoading(false);
      },
    });
  };

  const handleView = (record: any) => {
    setDetailData(record);
    setDetailModalVisible(true);
  };

  const handleStaffModalSuccess = (staffData: any) => {
    if (editData) {
      // Update existing staff
      setData(prev => prev.map(item => 
        item.id === staffData.id ? { ...item, ...staffData } : item
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
        onDelete={handleDelete}
        onView={handleView}
        searchable={true}
        searchPlaceholder="Tìm kiếm nhân viên theo tên, email, chức vụ, phòng ban..."
        searchFields={["name", "email", "position", "department"]}
        scroll={{ x: 1000 }}
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
