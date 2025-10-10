"use client";
import React, { useState, useEffect, useMemo } from "react";
import { AdminTable } from "@/components/ui/Table";
import { useConfirmationModalContext } from "@/components/ui/Modal";
import { ColumnsType } from "antd/es/table";
import { Tag, Avatar, message } from "antd";
import { VehicleBrand } from "@/lib/api/types";
import { VehicleService } from "@/lib/api/services/vehicle.service";
import { useVehicleBrands } from "@/lib/api/hooks/useVehicleBrands";
import {
  VehicleBrandDetailModal,
  VehicleBrandAddModal,
  VehicleBrandEditModal,
} from "@/components/ui/Modal/VehicleBrandModals";

const VehicleBrandsPage = () => {
  const { showModal } = useConfirmationModalContext();

  // Memoize params to prevent unnecessary re-renders
  const params = useMemo(() => ({
    page: 0,
    size: 100, // Get all brands for now
    direction: "DESC" as const,
    sort: "createdDate",
  }), []);

  // Use the vehicle brands hook
  const {
    brands: data,
    loading,
    error,
    refetch: fetchVehicleBrands,
  } = useVehicleBrands(params);

  // Modal states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<VehicleBrand | null>(null);

  // Handle error from hook
  useEffect(() => {
    if (error) {
      message.error("Không thể tải danh sách hãng xe");
    }
  }, [error]);

  // Định nghĩa columns
  const columns: ColumnsType<VehicleBrand> = [
    {
      title: "Logo",
      dataIndex: "brand_logo_url",
      key: "brand_logo_url",
      width: 80,
      render: (logoUrl: string | null, record: VehicleBrand) => (
        <Avatar size={50} src={logoUrl} style={{ backgroundColor: "#f0f0f0" }}>
          {record.brand_name.charAt(0)}
        </Avatar>
      ),
    },
    {
      title: "Hãng xe",
      key: "brand",
      width: 250,
      render: (_, record: VehicleBrand) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>
            {record.brand_name}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#666",
              marginBottom: 2,
              fontFamily: "monospace",
            }}
          >
            {record.brand_code}
          </div>
          <div style={{ fontSize: 11, color: "#999" }}>
            {record.description}
          </div>
        </div>
      ),
      sorter: (a, b) => a.brand_name.localeCompare(b.brand_name),
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
      onFilter: (value, record: VehicleBrand) => record.is_active === value,
    },
  ];

  // Handlers
  const handleAdd = () => {
    setAddModalVisible(true);
  };

  const handleEdit = (record: VehicleBrand) => {
    if (record.is_deleted) {
      message.warning("Không thể chỉnh sửa hãng xe đã bị xóa!");
      return;
    }
    setSelectedBrand(record);
    setEditModalVisible(true);
  };

  const handleView = (record: VehicleBrand) => {
    setSelectedBrand(record);
    setDetailModalVisible(true);
  };

  const refreshData = () => {
    // Refresh the brands list after update or create
    fetchVehicleBrands();
  };

  const handleDelete = (record: VehicleBrand) => {
    showModal({
      title: "Xóa hãng xe",
      content: `Bạn có chắc chắn muốn xóa hãng xe "${record.brand_name}"? Hành động này không thể hoàn tác.`,
      type: "error",
      onConfirm: async () => {
        try {
          await VehicleService.deleteVehicleBrand(record.brand_id);
          // Refresh data using hook
          await fetchVehicleBrands();
          message.success(`Đã xóa hãng xe ${record.brand_name} thành công!`);
        } catch (error) {
          console.error("Error deleting vehicle brand:", error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Có lỗi xảy ra khi xóa hãng xe!";
          message.error(errorMessage);
        }
      },
    });
  };

  return (
    <>
      <AdminTable
        title="Quản lý hãng xe"
        dataSource={data}
        columns={columns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onEditCondition={(record: VehicleBrand) => !record.is_deleted}
        onView={handleView}
        addButtonText="Thêm hãng xe"
        actions={[
          {
            key: "delete",
            label: "Xóa",
            type: "default",
            danger: true,
            onClick: handleDelete,
            condition: (record: VehicleBrand) => !record.is_deleted,
          },
        ]}
        searchable={true}
        searchPlaceholder="Tìm kiếm hãng xe theo tên, mã..."
        searchFields={["brand_name", "brand_code", "description"]}
        scroll={{ x: 1200 }}
        rowKey="brand_id"
      />

      {/* Modals */}
      <VehicleBrandDetailModal
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        brandId={selectedBrand?.brand_id || ""}
      />

      <VehicleBrandAddModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSuccess={refreshData}
      />

      <VehicleBrandEditModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSuccess={refreshData}
        brandData={selectedBrand}
      />
    </>
  );
};

export default VehicleBrandsPage;
