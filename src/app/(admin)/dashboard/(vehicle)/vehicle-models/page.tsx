"use client";
import React, { useState, useMemo } from "react";
import { AdminTable } from "@/components/ui/Table";
import { useConfirmationModalContext } from "@/components/ui/Modal";
import { ColumnsType } from "antd/es/table";
import { Tag, Avatar, message } from "antd";
import { VehicleModel } from "@/lib/api/types";
import { useVehicleModels, useDeleteVehicleModel } from "@/lib/api/hooks";
import {
  VehicleModelDetailModal,
  VehicleModelAddModal,
  VehicleModelEditModal,
} from "@/components/ui/Modal/VehicleModelModals";
import { VehicleModelFilterPanel } from "@/components/ui/FilterPanel";

const VehicleModelsPage = () => {
  const { showModal } = useConfirmationModalContext();

  const params = useMemo(
    () => ({
      page: 0,
      size: 10,
      direction: "DESC" as const,
      sort: "createdDate",
    }),
    []
  );

  // Use the custom hook for vehicle models
  const {
    models: data,
    loading,
    error,
    refetch: refreshModels,
  } = useVehicleModels(params);

  const deleteModelMutation = useDeleteVehicleModel();

  // Modal states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedModel, setSelectedModel] = useState<VehicleModel | null>(null);

  // Định nghĩa columns
  const columns: ColumnsType<VehicleModel> = useMemo(
    () => [
      {
        title: "Icon",
        dataIndex: "model_code",
        key: "model_code",
        width: 80,
        render: (modelCode: string, record: VehicleModel) => (
          <Avatar size={50} style={{ backgroundColor: "#f0f0f0" }}>
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
            <div
              style={{
                fontSize: 12,
                color: "#666",
                marginBottom: 2,
                fontFamily: "monospace",
              }}
            >
              {record.model_code}
            </div>
            <div style={{ fontSize: 11, color: "#999", marginBottom: 2 }}>
              {record.brand_name || `Brand ID: ${record.brand_id}`} •{" "}
              {record.type_name || `Type ID: ${record.type_id}`}
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
        sorter: (a, b) =>
          new Date(a.created_date).getTime() -
          new Date(b.created_date).getTime(),
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
    ],
    []
  );

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

  const handleDelete = (record: VehicleModel) => {
    showModal({
      title: "Xóa model xe",
      content: `Bạn có chắc chắn muốn xóa model xe "${record.model_name}"? Hành động này không thể hoàn tác.`,
      type: "error",
      onConfirm: async () => {
        deleteModelMutation.mutate(record.model_id);
      },
    });
  };

  return (
    <>
      {/* <VehicleModelFilterPanel
        onFilter={handleFilter}
        onClear={handleClearFilter}
      /> */}

      <AdminTable
        title="Quản lý model xe"
        dataSource={data}
        columns={columns}
        loading={loading || deleteModelMutation.isPending}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onEditCondition={(record: VehicleModel) => !record.is_deleted}
        onView={handleView}
        addButtonText="Thêm model xe"
        actions={[
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
