"use client";
import React, { useState, useMemo } from "react";
import { AdminTable } from "@/components/ui/Table";
import { useConfirmationModalContext } from "@/components/ui/Modal";
import { ColumnsType } from "antd/es/table";
import { Tag, Avatar, message } from "antd";
import {
  VehicleModel,
} from "@/lib/api/types";
import { useVehicleModels } from "@/lib/api/hooks";
import {
  VehicleModelDetailModal,
  VehicleModelAddModal,
  VehicleModelEditModal,
} from "@/components/ui/Modal/VehicleModelModals";
import { VehicleModelFilterPanel } from "@/components/ui/FilterPanel";


const VehicleModelsPage = () => {
  const { showModal } = useConfirmationModalContext();
  
  // Use the custom hook for vehicle models
  const {
    models: data,
    isLoading: loading,
    fetchModels,
    refreshModels,
    deleteModel,
    toggleModelStatus,
  } = useVehicleModels({
    page: 0,
    size: 10,
    direction: "DESC",
    sort: "createdDate"
  });
  
  // Modal states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedModel, setSelectedModel] = useState<VehicleModel | null>(null);

  // Định nghĩa columns
  const columns: ColumnsType<VehicleModel> = useMemo(() => [
    {
      title: "Icon",
      dataIndex: "model_code",
      key: "model_code",
      width: 80,
      render: (modelCode: string, record: VehicleModel) => (
        <Avatar 
          size={50} 
          style={{ backgroundColor: "#f0f0f0" }}
        >
          {record.model_name.charAt(0)}
        </Avatar>
      ),
    },
    {
      title: "Model",
      key: "model",
      width: 250,
      render: (_, record: VehicleModel) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>
            {record.model_name}
          </div>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 2, fontFamily: "monospace" }}>
            {record.model_code}
          </div>
          <div style={{ fontSize: 11, color: "#999", marginBottom: 2 }}>
            {record.brand_name || `Brand ID: ${record.brand_id}`} • {record.type_name || `Type ID: ${record.type_id}`}
          </div>
        </div>
      ),
      sorter: (a, b) => a.model_name.localeCompare(b.model_name),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 200,
      render: (description: string) => (
        <div style={{ fontSize: 12, color: "#666" }}>
          {description && description.length > 50 
            ? `${description.substring(0, 50)}...` 
            : description}
        </div>
      ),
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
      onFilter: (value, record: VehicleModel) => record.is_active === value,
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
      onFilter: (value, record: VehicleModel) => record.is_deleted === value,
    },
  ], []);

  // Handlers
  const handleAdd = () => {
    setAddModalVisible(true);
  };

  const handleEdit = (record: VehicleModel) => {
    if (record.is_deleted) {
      message.warning("Không thể chỉnh sửa model xe đã bị xóa!");
      return;
    }
    setSelectedModel(record);
    setEditModalVisible(true);
  };

  const handleView = (record: VehicleModel) => {
    setSelectedModel(record);
    setDetailModalVisible(true);
  };

  const handleAddSuccess = () => {
    // Close modal and refresh the models list after create
    setAddModalVisible(false);
    refreshModels();
  };

  const handleEditSuccess = () => {
    // Close modal and refresh the models list after update
    setEditModalVisible(false);
    refreshModels();
  };

  const handleFilter = (filters: {
    search: string;
    brandId: string;
    typeId: string;
    status: string;
    yearRange: [number | null, number | null];
    fuelType: string;
    priceSegment: string;
    averageRating: number | null;
  }) => {
    // Use API filtering instead of client-side filtering
    const apiFilters: {
      page: number;
      size: number;
      direction: "ASC" | "DESC";
      sort: string;
      search?: string;
      brand_id?: string;
      type_id?: string;
      year_from?: number;
      year_to?: number;
      fuel_type?: string;
    } = {
      page: 0,
      size: 10,
      direction: "DESC",
      sort: "createdDate"
    };

    if (filters.search) {
      apiFilters.search = filters.search;
    }
    if (filters.brandId) {
      apiFilters.brand_id = filters.brandId;
    }
    if (filters.typeId) {
      apiFilters.type_id = filters.typeId;
    }
    if (filters.yearRange[0] || filters.yearRange[1]) {
      if (filters.yearRange[0]) {
        apiFilters.year_from = filters.yearRange[0];
      }
      if (filters.yearRange[1]) {
        apiFilters.year_to = filters.yearRange[1];
      }
    }
    if (filters.fuelType) {
      apiFilters.fuel_type = filters.fuelType;
    }

    fetchModels(apiFilters);
  };

  const handleClearFilter = () => {
    fetchModels({
      page: 0,
      size: 10,
      direction: "DESC",
      sort: "createdDate"
    });
  };

  const handleToggleStatus = (record: VehicleModel) => {
    const action = record.is_active ? "vô hiệu hóa" : "kích hoạt";
    showModal({
      title: `${
        action === "vô hiệu hóa" ? "Vô hiệu hóa" : "Kích hoạt"
      } model`,
      content: `Bạn có chắc chắn muốn ${action} model ${record.model_name}?`,
      type: "warning",
      onConfirm: async () => {
        try {
          await toggleModelStatus(record.model_id, !record.is_active);
        } catch (error) {
          console.error("Error toggling model status:", error);
        }
      },
    });
  };

  const handleDelete = (record: VehicleModel) => {
    showModal({
      title: "Xóa model xe",
      content: `Bạn có chắc chắn muốn xóa model xe "${record.model_name}"? Hành động này không thể hoàn tác.`,
      type: "error",
      onConfirm: async () => {
        try {
          await deleteModel(record.model_id);
        } catch (error) {
          console.error("Error deleting model:", error);
        }
      },
    });
  };

  return (
    <>
      <VehicleModelFilterPanel
        onFilter={handleFilter}
        onClear={handleClearFilter}
      />
      
      <AdminTable
        title="Quản lý model xe"
        dataSource={data}
        columns={columns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onEditCondition={(record: VehicleModel) => !record.is_deleted}
        onView={handleView}
        addButtonText="Thêm model xe"
        actions={[
          {
            key: "toggle-status",
            label: (record: VehicleModel) =>
              record.is_active ? "Vô hiệu hóa" : "Kích hoạt",
            type: "default",
            danger: (record: VehicleModel) => record.is_active,
            onClick: handleToggleStatus,
            condition: (record: VehicleModel) => !record.is_deleted,
          },
          {
            key: "delete",
            label: "Xóa",
            type: "default",
            danger: true,
            onClick: handleDelete,
            condition: (record: VehicleModel) => !record.is_deleted,
          },
        ]}
        searchable={true}
        searchPlaceholder="Tìm kiếm model xe theo tên, mã..."
        searchFields={["model_name", "model_code", "description"]}
        scroll={{ x: 1000 }}
        rowKey="model_id"
      />

      {/* Modals */}
      <VehicleModelDetailModal
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        modelId={selectedModel?.model_id || null}
      />

      <VehicleModelAddModal
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onSuccess={handleAddSuccess}
      />

      <VehicleModelEditModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSuccess={handleEditSuccess}
        modelData={selectedModel}
      />
    </>
  );
};

export default VehicleModelsPage;
