"use client";
import React, { useState } from "react";
import { AdminTable } from "@/components/ui/Table";
import {
  useConfirmationModalContext,
  PermissionModal,
  PermissionDetailModal,
  RoleUsersModal,
  PermissionItemModal,
} from "@/components/ui/Modal";
import { ColumnsType } from "antd/es/table";
import { Tag, Badge, Tabs, Card } from "antd";
import {
  perData,
  allPermissions,
} from "@/components/utils/data/permissions.data";
import { getCategoryColorPermission } from "@/components/utils/helper/category.color.helper";

const PermissionPage = () => {
  const [rolesData, setRolesData] = useState(perData);
  const [permissionsData, setPermissionsData] = useState(allPermissions);
  const [loading, setLoading] = useState(false);
  const { showModal } = useConfirmationModalContext();

  // Modal states for roles
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [usersModalVisible, setUsersModalVisible] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);
  const [editData, setEditData] = useState<any>(null);

  // Modal states for permissions
  const [permissionItemModalVisible, setPermissionItemModalVisible] =
    useState(false);
  const [permissionItemEditData, setPermissionItemEditData] =
    useState<any>(null);

  // Định nghĩa columns cho roles
  const roleColumns: ColumnsType<any> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Tên vai trò",
      key: "role",
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 14 }}>{record.name}</div>
          <div style={{ fontSize: 12, color: "#666", fontFamily: "monospace" }}>
            {record.code}
          </div>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 300,
      ellipsis: true,
    },
    {
      title: "Số người dùng",
      dataIndex: "userCount",
      key: "userCount",
      width: 120,
      sorter: (a, b) => a.userCount - b.userCount,
      render: (count: number) => (
        <Badge
          count={count}
          style={{ backgroundColor: count > 0 ? "#52c41a" : "#d9d9d9" }}
        />
      ),
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
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Cập nhật cuối",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 120,
      sorter: (a, b) =>
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
  ];

  // Định nghĩa columns cho permissions
  const permissionColumns: ColumnsType<any> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Mã quyền hạn",
      dataIndex: "code",
      key: "code",
      width: 150,
      render: (code: string) => (
        <Tag color="blue" style={{ fontFamily: "monospace" }}>
          {code}
        </Tag>
      ),
      sorter: (a, b) => a.code.localeCompare(b.code),
    },
    {
      title: "Tên quyền hạn",
      dataIndex: "name",
      key: "name",
      width: 200,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      width: 120,
      render: (category: string) => (
        <Tag color={getCategoryColorPermission(category)}>{category}</Tag>
      ),
      filters: [
        { text: "Hệ thống", value: "Hệ thống" },
        { text: "Nhân sự", value: "Nhân sự" },
        { text: "Khách hàng", value: "Khách hàng" },
        { text: "Xe", value: "Xe" },
        { text: "Dịch vụ", value: "Dịch vụ" },
        { text: "Sản phẩm", value: "Sản phẩm" },
        { text: "Tài chính", value: "Tài chính" },
        { text: "Nhà cung cấp", value: "Nhà cung cấp" },
        { text: "Trung tâm", value: "Trung tâm" },
        { text: "Báo cáo", value: "Báo cáo" },
      ],
      onFilter: (value, record) => record.category === value,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 300,
      ellipsis: true,
    },
  ];

  // Handlers for roles
  const handleAddRole = () => {
    setEditData(null);
    setPermissionModalVisible(true);
  };

  const handleEditRole = (record: any) => {
    setEditData(record);
    setPermissionModalVisible(true);
  };

  // Handlers for permissions
  const handleAddPermission = () => {
    setPermissionItemEditData(null);
    setPermissionItemModalVisible(true);
  };

  const handleEditPermission = (record: any) => {
    setPermissionItemEditData(record);
    setPermissionItemModalVisible(true);
  };

  const handleDeletePermission = (record: any) => {
    showModal({
      title: "Xóa quyền hạn",
      content: `Bạn có chắc chắn muốn xóa quyền hạn "${record.name}"?`,
      type: "error",
      onConfirm: async () => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setPermissionsData(
          permissionsData.filter((item) => item.id !== record.id)
        );
        setLoading(false);
      },
    });
  };

  const handleViewRole = (record: any) => {
    setDetailData(record);
    setDetailModalVisible(true);
  };

  const handleToggleStatusRole = (record: any) => {
    const action = record.status === "active" ? "vô hiệu hóa" : "kích hoạt";
    showModal({
      title: `${
        action === "vô hiệu hóa" ? "Vô hiệu hóa" : "Kích hoạt"
      } vai trò`,
      content: `Bạn có chắc chắn muốn ${action} vai trò "${record.name}"? ${
        record.userCount > 0
          ? `Vai trò này đang được sử dụng bởi ${record.userCount} người dùng.`
          : ""
      }`,
      type: "warning",
      onConfirm: async () => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setRolesData(
          rolesData.map((item) =>
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

  const handleDuplicateRole = (record: any) => {
    showModal({
      title: "Sao chép vai trò",
      content: `Bạn có chắc chắn muốn sao chép vai trò "${record.name}"?`,
      type: "info",
      onConfirm: async () => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const newRole = {
          ...record,
          id: Math.max(...rolesData.map((d) => d.id)) + 1,
          name: `${record.name} (Copy)`,
          code: `${record.code}_copy`,
          userCount: 0,
          createdAt: new Date()
            .toISOString()
            .replace("T", " ")
            .substring(0, 19),
          updatedAt: new Date()
            .toISOString()
            .replace("T", " ")
            .substring(0, 19),
        };

        setRolesData([...rolesData, newRole]);
        setLoading(false);
      },
    });
  };

  const handleViewUsers = (record: any) => {
    setDetailData(record);
    setUsersModalVisible(true);
  };

  const handlePermissionModalSuccess = (roleData: any) => {
    if (editData) {
      // Update existing role
      setRolesData((prev) =>
        prev.map((item) =>
          item.id === roleData.id ? { ...item, ...roleData } : item
        )
      );
    } else {
      // Add new role
      setRolesData((prev) => [...prev, roleData]);
    }
  };

  const handlePermissionItemModalSuccess = (permissionData: any) => {
    if (permissionItemEditData) {
      // Update existing permission
      setPermissionsData((prev) =>
        prev.map((item) =>
          item.id === permissionData.id ? { ...item, ...permissionData } : item
        )
      );
    } else {
      // Add new permission
      setPermissionsData((prev) => [...prev, permissionData]);
    }
  };

  const tabItems = [
    {
      key: "roles",
      label: "Vai trò",
      children: (
        <AdminTable
          title="Quản lý vai trò"
          dataSource={rolesData}
          columns={roleColumns}
          loading={loading}
          onAdd={handleAddRole}
          onEdit={handleEditRole}
          onView={handleViewRole}
          addButtonText="Thêm vai trò"
          searchable={true}
          searchPlaceholder="Tìm kiếm vai trò theo tên, mã, mô tả..."
          searchFields={["name", "code", "description"]}
          actions={[
            {
              key: "view-users",
              label: "Xem người dùng",
              type: "default",
              onClick: handleViewUsers,
            },
            {
              key: "duplicate",
              label: "Sao chép",
              type: "default",
              onClick: handleDuplicateRole,
            },
            {
              key: "toggle-status",
              label: (record: any) =>
                record.status === "active" ? "Vô hiệu hóa" : "Kích hoạt",
              type: "default",
              danger: (record: any) => record.status === "active",
              onClick: handleToggleStatusRole,
            },
          ]}
          scroll={{ x: 1000 }}
        />
      ),
    },
    {
      key: "permissions",
      label: "Quyền hạn",
      children: (
        <AdminTable
          title="Quản lý quyền hạn"
          dataSource={permissionsData}
          columns={permissionColumns}
          loading={loading}
          onAdd={handleAddPermission}
          onEdit={handleEditPermission}
          onDelete={handleDeletePermission}
          addButtonText="Thêm quyền hạn"
          searchable={true}
          searchPlaceholder="Tìm kiếm quyền hạn theo tên, mã, danh mục..."
          searchFields={["name", "code", "category", "description"]}
          scroll={{ x: 800 }}
        />
      ),
    },
  ];

  return (
    <>
      <Card>
        <Tabs defaultActiveKey="roles" items={tabItems} />
      </Card>

      {/* Permission Modal */}
      <PermissionModal
        visible={permissionModalVisible}
        onCancel={() => setPermissionModalVisible(false)}
        onSuccess={handlePermissionModalSuccess}
        editData={editData}
        title={editData ? "Chỉnh sửa vai trò" : "Thêm vai trò mới"}
      />

      {/* Permission Detail Modal */}
      <PermissionDetailModal
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        data={detailData}
      />

      {/* Role Users Modal */}
      <RoleUsersModal
        visible={usersModalVisible}
        onCancel={() => setUsersModalVisible(false)}
        roleData={detailData}
      />

      {/* Permission Item Modal */}
      <PermissionItemModal
        visible={permissionItemModalVisible}
        onCancel={() => setPermissionItemModalVisible(false)}
        onSuccess={handlePermissionItemModalSuccess}
        editData={permissionItemEditData}
        title={
          permissionItemEditData ? "Chỉnh sửa quyền hạn" : "Thêm quyền hạn mới"
        }
      />
    </>
  );
};

export default PermissionPage;
