"use client";
import React, { useState, useEffect } from "react";
import { AdminTable } from "@/components/ui/Table";
import { useConfirmationModalContext } from "@/components/ui/Modal";
import { ColumnsType } from "antd/es/table";
import { Tag, Avatar, message } from "antd";
import {
  VehicleBrand,
} from "@/lib/api/types";
import { VehicleService } from "@/lib/api/services/vehicle.service";
import {
  VehicleBrandDetailModal,
  VehicleBrandAddModal,
  VehicleBrandEditModal,
} from "@/components/ui/Modal/VehicleBrandModals";


const VehicleBrandsPage = () => {
  const [data, setData] = useState<VehicleBrand[]>([]);
  const [loading, setLoading] = useState(false);
  const { showModal } = useConfirmationModalContext();
  
  // Modal states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<VehicleBrand | null>(null);

  // Fetch vehicle brands data
  useEffect(() => {
    fetchVehicleBrands();
  }, []);

  const fetchVehicleBrands = async () => {
    setLoading(true);
    try {
      const response = await VehicleService.getAllVehicleBrands({
        page: 0,
        size: 100, // Get all brands for now
        direction: "DESC",
        sort: "createdDate"
      });
      
      setData(response.data.content);
    } catch (error) {
      console.error("Error fetching vehicle brands:", error);
      message.error("Không thể tải danh sách hãng xe");
    } finally {
      setLoading(false);
    }
  };

  // Định nghĩa columns
  const columns: ColumnsType<VehicleBrand> = [
    {
      title: "Logo",
      dataIndex: "brand_logo_url",
      key: "brand_logo_url",
      width: 80,
      render: (logoUrl: string | null, record: VehicleBrand) => (
        <Avatar 
          size={50} 
          src={logoUrl} 
          style={{ backgroundColor: "#f0f0f0" }}
        >
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
          <div style={{ fontSize: 12, color: "#666", marginBottom: 2, fontFamily: "monospace" }}>
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
      sorter: (a, b) => new Date(a.created_date).getTime() - new Date(b.created_date).getTime(),
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
      sorter: (a, b) => new Date(a.modified_date).getTime() - new Date(b.modified_date).getTime(),
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
    {
      title: "Đã xóa",
      dataIndex: "is_deleted",
      key: "is_deleted",
      width: 100,
      render: (isDeleted: boolean) => (
        <Tag color={isDeleted ? "red" : "green"}>
          {isDeleted ? "Đã xóa" : "Chưa xóa"}
        </Tag>
      ),
      filters: [
        { text: "Đã xóa", value: true },
        { text: "Chưa xóa", value: false },
      ],
      onFilter: (value, record: VehicleBrand) => record.is_deleted === value,
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

  const handleAddSuccess = () => {
    // Refresh the brands list after create
    fetchVehicleBrands();
  };

  const handleEditSuccess = () => {
    // Refresh the brands list after update
    fetchVehicleBrands();
  };

  const handleDelete = (record: VehicleBrand) => {
    showModal({
      title: "Xóa hãng xe",
      content: `Bạn có chắc chắn muốn xóa hãng xe "${record.brand_name}"? Hành động này không thể hoàn tác.`,
      type: "error",
      onConfirm: async () => {
        try {
          setLoading(true);
          await VehicleService.deleteVehicleBrand(record.brand_id);
          setData(prev => prev.filter(item => item.brand_id !== record.brand_id));
          message.success(`Đã xóa hãng xe ${record.brand_name} thành công!`);
        } catch (error) {
          console.error("Error deleting vehicle brand:", error);
          const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi xóa hãng xe!";
          message.error(errorMessage);
        } finally {
          setLoading(false);
        }
      },
    });
  };


  const handleToggleStatus = (record: VehicleBrand) => {
    const action = record.is_active ? "vô hiệu hóa" : "kích hoạt";
    showModal({
      title: `${
        action === "vô hiệu hóa" ? "Vô hiệu hóa" : "Kích hoạt"
      } hãng xe`,
      content: `Bạn có chắc chắn muốn ${action} hãng xe ${record.brand_name}?`,
      type: "warning",
      onConfirm: async () => {
        try {
          setLoading(true);
          await VehicleService.updateVehicleBrandStatus(record.brand_id, !record.is_active);
          setData(prev => prev.map(item => 
            item.brand_id === record.brand_id 
              ? { ...item, is_active: !item.is_active }
              : item
          ));
          message.success(`Đã ${action} hãng xe ${record.brand_name} thành công!`);
        } catch (error) {
          console.error("Error updating vehicle brand status:", error);
          message.error(`Không thể ${action} hãng xe ${record.brand_name}`);
        } finally {
          setLoading(false);
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
            key: "toggle-status",
            label: (record: VehicleBrand) =>
              record.is_active ? "Vô hiệu hóa" : "Kích hoạt",
            type: "default",
            danger: (record: VehicleBrand) => record.is_active,
            onClick: handleToggleStatus,
            condition: (record: VehicleBrand) => !record.is_deleted,
          },
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
        onSuccess={handleAddSuccess}
      />

      <VehicleBrandEditModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSuccess={handleEditSuccess}
        brandData={selectedBrand}
      />
    </>
  );
};

export default VehicleBrandsPage;
