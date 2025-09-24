"use client";
import React, { useState } from "react";
import { Tag, Space, Typography } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  UserOutlined, 
} from "@ant-design/icons";
import AdminTable from "@/components/ui/Table/AdminTable";
import BranchModal from "@/components/ui/Modal/BranchModal/BranchModal";
import BranchDetailModal from "@/components/ui/Modal/BranchModal/BranchDetailModal";
import { useConfirmationModalContext } from "@/components/ui/Modal";
import { branchesData, Branch } from "@/components/utils/data/branches.data";
import {
  getStatusColor,
  getStatusLabel,
} from "@/components/utils/helper/center.helper";

const { Text } = Typography;

const BranchesPage = () => {
  const [data, setData] = useState<Branch[]>(branchesData);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [viewingBranch, setViewingBranch] = useState<Branch | null>(null);
  const { showModal } = useConfirmationModalContext();

  const columns = [
    {
      title: "Tên chi nhánh",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (text: string, record: Branch) => (
        <div>
          <Text strong style={{ fontSize: 14 }}>
            {text}
          </Text>
          <div style={{ marginTop: 4 }}>
            <Space size="small">
              <EnvironmentOutlined style={{ color: "#8c8c8c", fontSize: 12 }} />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.address}
              </Text>
            </Space>
          </div>
        </div>
      ),
    },
    {
      title: "Thông tin liên hệ",
      dataIndex: "contact",
      key: "contact",
      width: 180,
      render: (_: unknown, record: Branch) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <Space size="small">
              <PhoneOutlined style={{ color: "#1890ff", fontSize: 12 }} />
              <Text style={{ fontSize: 12 }}>{record.phone}</Text>
            </Space>
          </div>
          <div>
            <Space size="small">
              <MailOutlined style={{ color: "#52c41a", fontSize: 12 }} />
              <Text style={{ fontSize: 12 }}>{record.email}</Text>
            </Space>
          </div>
        </div>
      ),
    },
    {
      title: "Quản lý",
      dataIndex: "manager",
      key: "manager",
      width: 120,
      render: (text: string) => (
        <Space>
          <UserOutlined style={{ color: "#722ed1" }} />
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>
      ),
    },
    {
      title: "Slot chăm sóc",
      dataIndex: "careSlots",
      key: "careSlots",
      width: 120,
      render: (_: unknown, record: Branch) => (
        <div>
          <Text strong style={{ color: "#52c41a" }}>{record.availableSlots}</Text>
          <Text type="secondary">/{record.totalSlots}</Text>
          <div style={{ fontSize: 11, color: "#8c8c8c" }}>
            slot trống
          </div>
        </div>
      ),
    },
  ];

  const actions = [
    {
      key: "view",
      label: "Xem chi tiết",
      icon: <EyeOutlined />,
      onClick: (record: Branch) => {
        setViewingBranch(record);
        setDetailModalOpen(true);
      },
    },
    {
      key: "edit",
      label: "Chỉnh sửa",
      icon: <EditOutlined />,
      onClick: (record: Branch) => {
        setEditingBranch(record);
        setModalOpen(true);
      },
    },
    {
      key: "delete",
      label: "Xóa",
      icon: <DeleteOutlined />,
      danger: true,
      condition: (record: Branch) => record.status === "inactive",
      onClick: (record: Branch) => {
        showModal({
          title: "Xác nhận xóa chi nhánh",
          content: `Bạn có chắc chắn muốn xóa chi nhánh "${record.name}"?`,
          type: "error",
          onConfirm: () => {
            setData(data.filter((item) => item.id !== record.id));
          },
        });
      },
    },
    {
      key: "deactivate",
      label: "Ngừng hoạt động",
      icon: <DeleteOutlined />,
      danger: true,
      condition: (record: Branch) => record.status === "active",
      onClick: (record: Branch) => {
        showModal({
          title: "Xác nhận ngừng hoạt động",
          content: `Bạn có chắc chắn muốn ngừng hoạt động chi nhánh "${record.name}"?`,
          type: "warning",
          onConfirm: () => {
            setData(
              data.map((item) =>
                item.id === record.id
                  ? { ...item, status: "inactive" as const, currentBookings: 0 }
                  : item
              )
            );
          },
        });
      },
    },
    {
      key: "activate",
      label: "Kích hoạt",
      icon: <EditOutlined />,
      condition: (record: Branch) => record.status === "inactive",
      onClick: (record: Branch) => {
        showModal({
          title: "Xác nhận kích hoạt",
          content: `Bạn có chắc chắn muốn kích hoạt chi nhánh "${record.name}"?`,
          type: "success",
          onConfirm: () => {
            setData(
              data.map((item) =>
                item.id === record.id
                  ? { ...item, status: "active" as const }
                  : item
              )
            );
          },
        });
      },
    },
  ];

  const handleAddNew = () => {
    setEditingBranch(null);
    setModalOpen(true);
  };

  const handleModalOk = (branchData: Branch) => {
    if (editingBranch) {
      // Cập nhật chi nhánh
      setData(
        data.map((item) =>
          item.id === editingBranch.id
            ? { ...branchData, id: editingBranch.id }
            : item
        )
      );
    } else {
      // Thêm chi nhánh mới
      setData([...data, branchData]);
    }
    setModalOpen(false);
    setEditingBranch(null);
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setEditingBranch(null);
  };

  return (
    <div>
      <AdminTable
        title="Quản lý chi nhánh"
        dataSource={data}
        columns={columns}
        actions={actions}
        onAdd={handleAddNew}
        addButtonText="Thêm chi nhánh mới"
        searchable={true}
        searchPlaceholder="Tìm kiếm chi nhánh theo tên, địa chỉ, số điện thoại..."
        searchFields={["name", "address", "phone", "managerName"]}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: number, range: [number, number]) =>
            `${range[0]}-${range[1]} của ${total} chi nhánh`,
        }}
      />

      <BranchModal
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        initialData={editingBranch}
        title={editingBranch ? "Chỉnh sửa chi nhánh" : "Thêm chi nhánh mới"}
      />

      <BranchDetailModal
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setViewingBranch(null);
        }}
        branch={viewingBranch}
      />
    </div>
  );
};

export default BranchesPage;
