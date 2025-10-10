"use client";
import React, { useState, useEffect } from "react";
import { AdminTable } from "@/components/ui/Table";
import { useConfirmationModalContext } from "@/components/ui/Modal";
import { ColumnsType } from "antd/es/table";
import { Tag, Avatar, message } from "antd";
import { VehicleType } from "@/lib/api/types";
import { VehicleService } from "@/lib/api/services/vehicle.service";
import {
  VehicleTypeDetailModal,
  VehicleTypeAddModal,
  VehicleTypeEditModal,
} from "@/components/ui/Modal/VehicleTypeModals";

const VehicleTypesPage = () => {
  const [data, setData] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(false);
  const { showModal } = useConfirmationModalContext();

  // Modal states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<VehicleType | null>(null);

  // Fetch vehicle types data
  useEffect(() => {
    fetchVehicleTypes();
  }, []);

  const fetchVehicleTypes = async () => {
    setLoading(true);
    try {
      const response = await VehicleService.getAllVehicleTypes({
        page: 0,
        size: 100, // Get all types for now
        direction: "DESC",
        sort: "createdDate",
      });

      setData(response.data.content);
    } catch (error) {
      console.error("Error fetching vehicle types:", error);
      message.error("Không thể tải danh sách loại xe");
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleAdd = () => {
    setAddModalVisible(true);
  };

  const handleEdit = (record: VehicleType) => {
    if (record.is_deleted) {
      message.warning("Không thể chỉnh sửa loại xe đã bị xóa!");
      return;
    }
    setSelectedType(record);
    setEditModalVisible(true);
  };

  const handleView = (record: VehicleType) => {
    setSelectedType(record);
    setDetailModalVisible(true);
  };

  const handleAddSuccess = () => {
    // Close modal and refresh the types list after create
    setAddModalVisible(false);
    fetchVehicleTypes();
  };

  const handleEditSuccess = () => {
    // Close modal and refresh the types list after update
    setEditModalVisible(false);
    fetchVehicleTypes();
  };

  const handleDelete = (record: VehicleType) => {
    showModal({
      title: "Xóa loại xe",
      content: `Bạn có chắc chắn muốn xóa loại xe "${record.type_name}"? Hành động này không thể hoàn tác.`,
      type: "error",
      onConfirm: async () => {
        try {
          setLoading(true);
          await VehicleService.deleteVehicleType(record.type_id);
          message.success(`Đã xóa loại xe ${record.type_name} thành công!`);
          // Refresh the data to ensure the table is updated
          fetchVehicleTypes();
        } catch (error) {
          console.error("Error deleting vehicle type:", error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Có lỗi xảy ra khi xóa loại xe!";
          message.error(errorMessage);
        } finally {
          setLoading(false);
        }
      },
    });
  };


  // Định nghĩa columns
  const columns: ColumnsType<VehicleType> = [
    {
      title: "Icon",
      dataIndex: "type_code",
      key: "type_code",
      width: 80,
      render: (typeCode: string, record: VehicleType) => (
        <Avatar size={50} style={{ backgroundColor: "#f0f0f0" }}>
          {record.type_name.charAt(0)}
        </Avatar>
      ),
    },
    {
      title: "Loại xe",
      key: "type",
      width: 250,
      render: (_, record: VehicleType) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>
            {record.type_name}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#666",
              marginBottom: 2,
              fontFamily: "monospace",
            }}
          >
            {record.type_code}
          </div>
          <div style={{ fontSize: 11, color: "#999" }}>
            {record.description}
          </div>
        </div>
      ),
      sorter: (a, b) => a.type_name.localeCompare(b.type_name),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_date",
      key: "created_date",
      width: 120,
      render: (createdDate: string) => (
        <div style={{ fontSize: 12 }}>
          {new Date(createdDate).toLocaleDateString("vi-VN")}
        </div>
      ),
      sorter: (a, b) =>
        new Date(a.created_date).getTime() - new Date(b.created_date).getTime(),
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "modified_date",
      key: "modified_date",
      width: 120,
      render: (modifiedDate: string) => (
        <div style={{ fontSize: 12 }}>
          {new Date(modifiedDate).toLocaleDateString("vi-VN")}
        </div>
      ),
      sorter: (a, b) =>
        new Date(a.modified_date).getTime() -
        new Date(b.modified_date).getTime(),
    },
    {
      title: "Người tạo",
      dataIndex: "created_by",
      key: "created_by",
      width: 150,
      render: (createdBy: string) => (
        <div style={{ fontSize: 12, color: "#666" }}>{createdBy}</div>
      ),
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
      onFilter: (value, record: VehicleType) => record.is_active === value,
    },
  ];

  return (
    <>
      <AdminTable
        title="Quản lý loại xe"
        dataSource={data}
        columns={columns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onEditCondition={(record: VehicleType) => !record.is_deleted}
        onView={handleView}
        addButtonText="Thêm loại xe"
        actions={[
          {
            key: "delete",
            label: "Xóa",
            type: "default",
            danger: true,
            onClick: handleDelete,
            condition: (record: VehicleType) => !record.is_deleted,
          },
        ]}
        searchable={true}
        searchPlaceholder="Tìm kiếm loại xe theo tên, mã..."
        searchFields={["type_name", "type_code", "description"]}
        scroll={{ x: 1200 }}
        rowKey="type_id"
      />

      {/* Modals */}
      <VehicleTypeDetailModal
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        typeId={selectedType?.type_id || null}
      />

      <VehicleTypeAddModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSuccess={handleAddSuccess}
      />

      <VehicleTypeEditModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSuccess={handleEditSuccess}
        typeData={selectedType}
      />
    </>
  );
};

export default VehicleTypesPage;
