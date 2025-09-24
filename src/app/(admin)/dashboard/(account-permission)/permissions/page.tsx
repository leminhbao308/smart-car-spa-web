"use client";
import React, { useState, useEffect } from "react";
import { AdminTable } from "@/components/ui/Table";
import {
  useConfirmationModalContext,
  RoleModal,
  RoleDetailModal,
  RoleUsersModal,
  PermissionModal,
  PermissionDetailModal,
} from "@/components/ui/Modal";
import { ColumnsType } from "antd/es/table";
import { Tag, message, Tabs } from "antd";
import { Role, Permission } from "@/lib/api/types";

const PermissionPage = () => {
  const [rolesData, setRolesData] = useState<Role[]>([]);
  const [permissionsData, setPermissionsData] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const { } = useConfirmationModalContext();

  // Modal states for roles
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [usersModalVisible, setUsersModalVisible] = useState(false);
  const [detailData, setDetailData] = useState<Role | null>(null);
  const [editData, setEditData] = useState<Role | null>(null);

  // Modal states for permissions
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [permissionDetailModalVisible, setPermissionDetailModalVisible] = useState(false);
  const [permissionDetailData, setPermissionDetailData] = useState<Permission | null>(null);
  const [permissionEditData, setPermissionEditData] = useState<Permission | null>(null);

  // Fetch data
  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await roleService.getAllRoles();
      // setRolesData(response.data);
      
      // Mock data based on API response
      const mockRoles: Role[] = [
        {
          role_id: "6250fd0d-dbce-4d59-881c-005a43f6a039",
          role_name: "Customer Service",
          role_code: "CS",
          description: "Customer support access"
        },
        {
          role_id: "91cc1277-709a-4312-98a2-db8c47d7efb1",
          role_name: "Administrator",
          role_code: "ADMIN",
          description: "Full system access"
        },
        {
          role_id: "10b82023-96c8-4d6e-8f35-d01d59663538",
          role_name: "Inventory Manager",
          role_code: "INV_MGR",
          description: "Inventory management access"
        },
        {
          role_id: "8ed98905-0562-4dba-af32-27839d86a087",
          role_name: "Technician",
          role_code: "TECHNICIAN",
          description: "Service technician access"
        },
        {
          role_id: "af686f51-4781-4fc2-8176-8ada13495db9",
          role_name: "Cashier",
          role_code: "CASHIER",
          description: "Sales and payment processing"
        },
        {
          role_id: "94f2b37a-aca0-4cdd-90db-263e27d744a4",
          role_name: "Customer",
          role_code: "CUSTOMER",
          description: "Customer access"
        },
        {
          role_id: "eee6cddd-f7d8-463a-a2ca-c6784a4282d5",
          role_name: "Manager",
          role_code: "MANAGER",
          description: "Branch management access"
        }
      ];
      setRolesData(mockRoles);
    } catch {
      message.error("Không thể tải danh sách vai trò");
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await permissionService.getAllPermissions();
      // setPermissionsData(response.data);
      
      // Mock data for permissions
      const mockPermissions: Permission[] = [
        {
          permission_id: "perm_001",
          permission_name: "Xem dashboard",
          permission_code: "DASHBOARD_VIEW",
          module: "Dashboard",
          description: "Quyền xem trang dashboard"
        },
        {
          permission_id: "perm_002",
          permission_name: "Quản lý người dùng",
          permission_code: "USER_MANAGE",
          module: "User Management",
          description: "Quyền quản lý người dùng, vai trò và quyền hạn"
        },
        {
          permission_id: "perm_003",
          permission_name: "Quản lý đặt lịch",
          permission_code: "BOOKING_MANAGE",
          module: "Booking",
          description: "Quyền quản lý đặt lịch dịch vụ"
        },
        {
          permission_id: "perm_004",
          permission_name: "Quản lý sản phẩm",
          permission_code: "PRODUCT_MANAGE",
          module: "Product",
          description: "Quyền quản lý sản phẩm và danh mục"
        },
        {
          permission_id: "perm_005",
          permission_name: "Quản lý dịch vụ",
          permission_code: "SERVICE_MANAGE",
          module: "Service",
          description: "Quyền quản lý dịch vụ và gói dịch vụ"
        },
        {
          permission_id: "perm_006",
          permission_name: "Quản lý kho",
          permission_code: "INVENTORY_MANAGE",
          module: "Inventory",
          description: "Quyền quản lý kho hàng"
        },
        {
          permission_id: "perm_007",
          permission_name: "Bán hàng",
          permission_code: "SALES_PROCESS",
          module: "Sales",
          description: "Quyền thực hiện bán hàng và thanh toán"
        },
        {
          permission_id: "perm_008",
          permission_name: "Quản lý báo cáo",
          permission_code: "REPORT_VIEW",
          module: "Report",
          description: "Quyền xem và quản lý báo cáo"
        }
      ];
      setPermissionsData(mockPermissions);
    } catch {
      message.error("Không thể tải danh sách quyền hạn");
    }
  };

  // Định nghĩa columns cho roles
  const roleColumns: ColumnsType<Role> = [
    {
      title: "Mã vai trò",
      dataIndex: "role_code",
      key: "role_code",
      width: 120,
      render: (code: string) => (
        <Tag color="blue" style={{ fontFamily: "monospace" }}>
          {code}
        </Tag>
      ),
      sorter: (a, b) => a.role_code.localeCompare(b.role_code),
    },
    {
      title: "Tên vai trò",
      dataIndex: "role_name",
      key: "role_name",
      width: 200,
      render: (name: string, record: Role) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 14 }}>{name}</div>
          <div style={{ fontSize: 12, color: "#666", fontFamily: "monospace" }}>
            {record.role_code}
          </div>
        </div>
      ),
      sorter: (a, b) => a.role_name.localeCompare(b.role_name),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 300,
      ellipsis: true,
    },
    {
      title: "Loại vai trò",
      key: "role_type",
      width: 120,
      render: (_, record: Role) => {
        const isCustomer = record.role_code === "CUSTOMER";
        return (
          <Tag color={isCustomer ? "green" : "blue"}>
            {isCustomer ? "Khách hàng" : "Nhân viên"}
          </Tag>
        );
      },
      filters: [
        { text: "Khách hàng", value: "customer" },
        { text: "Nhân viên", value: "staff" },
      ],
      onFilter: (value, record: Role) => {
        if (value === "customer") return record.role_code === "CUSTOMER";
        if (value === "staff") return record.role_code !== "CUSTOMER";
        return true;
      },
    },
  ];

  // Định nghĩa columns cho permissions
  const permissionColumns: ColumnsType<Permission> = [
    {
      title: "Mã quyền",
      dataIndex: "permission_code",
      key: "permission_code",
      width: 150,
      render: (code: string) => (
        <Tag color="purple" style={{ fontFamily: "monospace" }}>
          {code}
        </Tag>
      ),
      sorter: (a, b) => a.permission_code.localeCompare(b.permission_code),
    },
    {
      title: "Tên quyền",
      dataIndex: "permission_name",
      key: "permission_name",
      width: 200,
      render: (name: string, record: Permission) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 14 }}>{name}</div>
          <div style={{ fontSize: 12, color: "#666", fontFamily: "monospace" }}>
            {record.permission_code}
          </div>
        </div>
      ),
      sorter: (a, b) => a.permission_name.localeCompare(b.permission_name),
    },
    {
      title: "Module",
      dataIndex: "module",
      key: "module",
      width: 150,
      render: (module: string) => (
        <Tag color="green">{module}</Tag>
      ),
      filters: [
        { text: "Dashboard", value: "Dashboard" },
        { text: "User Management", value: "User Management" },
        { text: "Booking", value: "Booking" },
        { text: "Product", value: "Product" },
        { text: "Service", value: "Service" },
        { text: "Inventory", value: "Inventory" },
        { text: "Sales", value: "Sales" },
        { text: "Report", value: "Report" },
      ],
      onFilter: (value, record: Permission) => record.module === value,
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
    setRoleModalVisible(true);
  };

  const handleEditRole = (record: Role) => {
    setEditData(record);
    setRoleModalVisible(true);
  };

  const handleViewRole = (record: Role) => {
    setDetailData(record);
    setDetailModalVisible(true);
  };

  const handleViewUsers = (record: Role) => {
    setDetailData(record);
    setUsersModalVisible(true);
  };

  const handleRoleModalSuccess = (roleData: Role) => {
    if (editData) {
      // Update existing role
      setRolesData((prev) =>
        prev.map((item) =>
          item.role_id === roleData.role_id ? { ...item, ...roleData } : item
        )
      );
    } else {
      // Add new role
      setRolesData((prev) => [...prev, roleData]);
    }
  };

  // Handlers for permissions
  const handleAddPermission = () => {
    setPermissionEditData(null);
    setPermissionModalVisible(true);
  };

  const handleEditPermission = (record: Permission) => {
    setPermissionEditData(record);
    setPermissionModalVisible(true);
  };

  const handleViewPermission = (record: Permission) => {
    setPermissionDetailData(record);
    setPermissionDetailModalVisible(true);
  };

  const handlePermissionModalSuccess = (permissionData: Permission) => {
    if (permissionEditData) {
      // Update existing permission
      setPermissionsData((prev) =>
        prev.map((item) =>
          item.permission_id === permissionData.permission_id ? { ...item, ...permissionData } : item
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
      label: "Quản lý vai trò",
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
          searchFields={["role_name", "role_code", "description"]}
          actions={[
            {
              key: "view-users",
              label: "Xem người dùng",
              type: "default",
              onClick: handleViewUsers,
            },
          ]}
          scroll={{ x: 800 }}
          rowKey="role_id"
        />
      ),
    },
    {
      key: "permissions",
      label: "Quản lý quyền hạn",
      children: (
        <AdminTable
          title="Quản lý quyền hạn"
          dataSource={permissionsData}
          columns={permissionColumns}
          loading={loading}
          onAdd={handleAddPermission}
          onEdit={handleEditPermission}
          onView={handleViewPermission}
          addButtonText="Thêm quyền hạn"
          searchable={true}
          searchPlaceholder="Tìm kiếm quyền hạn theo tên, mã, module..."
          searchFields={["permission_name", "permission_code", "module", "description"]}
          scroll={{ x: 800 }}
          rowKey="permission_id"
        />
      ),
    },
  ];

  return (
    <>
      <Tabs
        defaultActiveKey="roles"
        items={tabItems}
        size="large"
        style={{ marginTop: 16 }}
      />

      {/* Role Modal */}
      <RoleModal
        visible={roleModalVisible}
        onCancel={() => setRoleModalVisible(false)}
        onSuccess={handleRoleModalSuccess}
        editData={editData}
        title={editData ? "Chỉnh sửa vai trò" : "Thêm vai trò mới"}
      />

      {/* Role Detail Modal */}
      <RoleDetailModal
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

      {/* Permission Modal */}
      <PermissionModal
        visible={permissionModalVisible}
        onCancel={() => setPermissionModalVisible(false)}
        onSuccess={handlePermissionModalSuccess}
        editData={permissionEditData}
        title={permissionEditData ? "Chỉnh sửa quyền hạn" : "Thêm quyền hạn mới"}
      />

      {/* Permission Detail Modal */}
      <PermissionDetailModal
        visible={permissionDetailModalVisible}
        onCancel={() => setPermissionDetailModalVisible(false)}
        data={permissionDetailData}
      />
    </>
  );
};

export default PermissionPage;
