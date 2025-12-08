"use client";
import React, { useState, useMemo, useCallback } from "react";
import { AdminTable } from "@/components/ui/Table";
import { useConfirmationModalContext } from "@/components/ui/Modal";
import { ColumnsType } from "antd/es/table";
import { Tag, Avatar, message, Card, Row, Col, Select, Input, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { VehicleModel } from "@/lib/api/types";
import { useVehicleModels, useDeleteVehicleModel, useVehicleBrandsDropdown, useVehicleTypesDropdown } from "@/lib/api/hooks";
import {
  VehicleModelDetailModal,
  VehicleModelAddModal,
  VehicleModelEditModal,
} from "@/components/ui/Modal/VehicleModelModals";

const { Option } = Select;

const VehicleModelsPage = () => {
  const { showModal } = useConfirmationModalContext();

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");

  const params = useMemo(
    () => ({
      page: 0,
      size: 100, // Get more data for filtering
      direction: "DESC" as const,
      sort: "createdDate",
    }),
    []
  );

  // Use the custom hook for vehicle models
  const {
    models: allModels,
    loading,
    refetch: refreshModels,
  } = useVehicleModels(params);

  const deleteModelMutation = useDeleteVehicleModel();
  const { dropdownData: brandsData } = useVehicleBrandsDropdown();
  const { dropdownData: typesData } = useVehicleTypesDropdown();

  // Modal states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedModel, setSelectedModel] = useState<VehicleModel | null>(null);

  // Filter models based on search and filters
  const filteredModels = useMemo(() => {
    let filtered = allModels;

    // Search filter
    if (searchText) {
      filtered = filtered.filter((model: VehicleModel) =>
        model.model_name.toLowerCase().includes(searchText.toLowerCase()) ||
        model.model_code.toLowerCase().includes(searchText.toLowerCase()) ||
        model.description?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Brand filter
    if (selectedBrand) {
      filtered = filtered.filter((model: VehicleModel) => model.brand_id === selectedBrand);
    }

    // Type filter
    if (selectedType) {
      filtered = filtered.filter((model: VehicleModel) => model.type_id === selectedType);
    }

    return filtered;
  }, [allModels, searchText, selectedBrand, selectedType]);

  // Helper functions
  const getBrandName = useCallback((brandId: string) => {
    const brand = brandsData.find(b => b.brand_id === brandId);
    return brand ? brand.brand_name : `Brand ID: ${brandId}`;
  }, [brandsData]);

  const getTypeName = useCallback((typeId: string) => {
    const type = typesData.find(t => t.type_id === typeId);
    return type ? type.type_name : `Type ID: ${typeId}`;
  }, [typesData]);

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
              {getBrandName(record.brand_id)} • {getTypeName(record.type_id)}
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
              : description || "Không có mô tả"}
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
    [getBrandName, getTypeName]
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
      {/* Filter Panel */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Input
              placeholder="Tìm kiếm model xe..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select
              placeholder="Chọn hãng xe"
              value={selectedBrand}
              onChange={setSelectedBrand}
              allowClear
              style={{ width: "100%" }}
            >
              {brandsData.map(brand => (
                <Option key={brand.brand_id} value={brand.brand_id}>
                  {brand.brand_name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select
              placeholder="Chọn loại xe"
              value={selectedType}
              onChange={setSelectedType}
              allowClear
              style={{ width: "100%" }}
            >
              {typesData.map(type => (
                <Option key={type.type_id} value={type.type_id}>
                  {type.type_name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={6}>
            <Typography.Text type="secondary">
              Hiển thị: {filteredModels.length} / {allModels.length} model
            </Typography.Text>
          </Col>
        </Row>
      </Card>

      <AdminTable
        title="Quản lý model xe"
        dataSource={filteredModels}
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
        searchable={false} // Disable built-in search since we have custom filter
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
