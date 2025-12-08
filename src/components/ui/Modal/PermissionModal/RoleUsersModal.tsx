"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Table,
  Tag,
  Avatar,
  Typography,
  Space,
  Button,
  Select,
  Card,
  Badge} from "antd";
import {
  UserOutlined,
  SearchOutlined,
  TeamOutlined,
  SafetyOutlined} from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import { MemoizedInput, MemoizedTextArea, MemoizedInputNumber } from "@/components/ui/MemoizedComponents";

const { Title, Text } = Typography;
const { Option } = Select;

interface RoleUsersModalProps {
  visible: boolean;
  onCancel: () => void;
  roleData: any;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  position?: string;
  department?: string;
  status: string;
  lastLogin: string;
  createdAt: string;
}

const RoleUsersModal: React.FC<RoleUsersModalProps> = ({
  visible,
  onCancel,
  roleData}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock data for users with this role
  const mockUsers: User[] = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      email: "nguyenvana@example.com",
      phone: "0123456789",
      position: "Quản lý",
      department: "Kỹ thuật",
      status: "active",
      lastLogin: "2024-01-15 14:30:00",
      createdAt: "2023-01-15 08:00:00"},
    {
      id: 2,
      name: "Trần Thị B",
      email: "tranthib@example.com",
      phone: "0987654321",
      position: "Nhân viên",
      department: "Kinh doanh",
      status: "active",
      lastLogin: "2024-01-14 16:45:00",
      createdAt: "2023-02-20 10:30:00"},
    {
      id: 3,
      name: "Lê Văn C",
      email: "levanc@example.com",
      phone: "0369852147",
      position: "Trưởng phòng",
      department: "Kỹ thuật",
      status: "inactive",
      lastLogin: "2024-01-10 09:15:00",
      createdAt: "2023-03-10 14:20:00"},
  ];

  useEffect(() => {
    if (visible && roleData) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setUsers(mockUsers);
        setLoading(false);
      }, 1000);
    }
  }, [visible, roleData]);

  const columns: ColumnsType<User> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id},
    {
      title: "Người dùng",
      key: "user",
      width: 200,
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar
            size="small"
            style={{ backgroundColor: "#1890ff" }}
            icon={<UserOutlined />}
          />
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{record.name}</div>
            <div style={{ fontSize: 12, color: "#666" }}>{record.email}</div>
          </div>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name)},
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      width: 130},
    {
      title: "Chức vụ",
      dataIndex: "position",
      key: "position",
      width: 120,
      render: (position: string) => position ? <Tag color="blue">{position}</Tag> : "-"},
    {
      title: "Phòng ban",
      dataIndex: "department",
      key: "department",
      width: 120,
      render: (department: string) => department ? <Tag color="green">{department}</Tag> : "-"},
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
      onFilter: (value, record) => record.status === value},
    {
      title: "Đăng nhập cuối",
      dataIndex: "lastLogin",
      key: "lastLogin",
      width: 150,
      sorter: (a, b) => new Date(a.lastLogin).getTime() - new Date(b.lastLogin).getTime(),
      render: (date: string) => new Date(date).toLocaleString("vi-VN")},
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN")},
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!roleData) return null;

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TeamOutlined style={{ color: "#1890ff" }} />
          <span>Người dùng có vai trò: {roleData.name}</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={1000}
      footer={[
        <Button key="close" onClick={onCancel}>
          Đóng
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Card size="small" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <SafetyOutlined style={{ color: "#1890ff" }} />
              <Text strong>Vai trò:</Text>
              <Tag color="blue">{roleData.name}</Tag>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Text strong>Tổng số người dùng:</Text>
              <Badge
                count={users.length}
                style={{ backgroundColor: users.length > 0 ? "#52c41a" : "#d9d9d9" }}
              />
            </div>
          </div>
        </Card>

        <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
          <MemoizedInput
            placeholder="Tìm kiếm theo tên hoặc email..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Lọc theo trạng thái"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
          >
            <Option value="all">Tất cả</Option>
            <Option value="active">Hoạt động</Option>
            <Option value="inactive">Không hoạt động</Option>
          </Select>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filteredUsers}
        loading={loading}
        rowKey="id"
        size="small"
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} người dùng`,
          pageSizeOptions: ["10", "20", "50"],
          defaultPageSize: 10}}
        scroll={{ x: 800 }}
      />
    </Modal>
  );
};

export default RoleUsersModal;

