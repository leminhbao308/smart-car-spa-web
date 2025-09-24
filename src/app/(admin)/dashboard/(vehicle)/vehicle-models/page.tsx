"use client";
import React, { useState } from "react";
import { AdminTable } from "@/components/ui/Table";
import { useConfirmationModalContext } from "@/components/ui/Modal";
import { ColumnsType } from "antd/es/table";
import { Tag } from "antd";
import {
  vehicleModelsData,
  modelStatuses,
} from "@/components/utils/data/vehicle-models.data";
import {
  VehicleModelDetailModal,
  VehicleModelAddModal,
  VehicleModelEditModal,
} from "@/components/ui/Modal/VehicleModelModals";
import { VehicleModelFilterPanel } from "@/components/ui/FilterPanel";

interface VehicleModel {
  id: number;
  modelCode: string;
  modelName: string;
  brandId: number;
  brandName: string;
  typeId: number;
  typeName: string;
  year: number;
  generation: string;
  description: string;
  engineOptions: Array<{
    engine: string;
    power: string;
    fuelType: string;
  }>;
  transmissionOptions: string[];
  drivetrainOptions: string[];
  priceRange: string;
  fuelEfficiency: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
    wheelbase: string;
  };
  features: string[];
  colors: string[];
  status: string;
  totalVehicles: number;
  averageRating: number;
  launchDate: string;
  endDate: null;
  competitors: string[];
  targetMarket: string;
  createdAt: string;
  updatedAt: string;
}

const VehicleModelsPage = () => {
  const [data, setData] = useState(vehicleModelsData);
  const [filteredData, setFilteredData] = useState(vehicleModelsData);
  const [loading, setLoading] = useState(false);
  const { showModal } = useConfirmationModalContext();
  
  // Modal states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedModel, setSelectedModel] = useState<VehicleModel | null>(null);

  // Định nghĩa columns
  const columns: ColumnsType<VehicleModel> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Model",
      key: "model",
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>
            {record.modelName}
          </div>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>
            {record.brandName} • {record.typeName}
          </div>
          <div style={{ fontSize: 11, color: "#999" }}>
            {record.generation} • {record.year}
          </div>
        </div>
      ),
    },

    {
      title: "Động cơ",
      dataIndex: "engineOptions",
      key: "engineOptions",
      width: 180,
      render: (engines: Array<{engine: string; power: string; fuelType: string}>) => (
        <div>
          {engines.slice(0, 1).map((engine, index) => (
            <div key={index} style={{ marginBottom: 2 }}>
              <div style={{ fontSize: 11, fontWeight: 500 }}>
                {engine.engine}
              </div>
              <div style={{ fontSize: 10, color: "#666" }}>
                {engine.power} • {engine.fuelType}
              </div>
            </div>
          ))}
          {engines.length > 1 && (
            <Tag color="default" style={{ fontSize: 10 }}>
              +{engines.length - 1} khác
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Hộp số",
      dataIndex: "transmissionOptions",
      key: "transmissionOptions",
      width: 120,
      render: (transmissions: string[]) => (
        <div>
          {transmissions.slice(0, 1).map((transmission, index) => (
            <Tag
              key={index}
              color="blue"
              style={{ fontSize: 10, marginBottom: 2 }}
            >
              {transmission}
            </Tag>
          ))}
          {transmissions.length > 1 && (
            <Tag color="default" style={{ fontSize: 10 }}>
              +{transmissions.length - 1}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Dẫn động",
      dataIndex: "drivetrainOptions",
      key: "drivetrainOptions",
      width: 100,
      render: (drivetrains: string[]) => (
        <div>
          {drivetrains.slice(0, 1).map((drivetrain, index) => (
            <Tag
              key={index}
              color="green"
              style={{ fontSize: 10, marginBottom: 2 }}
            >
              {drivetrain}
            </Tag>
          ))}
          {drivetrains.length > 1 && (
            <Tag color="default" style={{ fontSize: 10 }}>
              +{drivetrains.length - 1}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Giá",
      dataIndex: "priceRange",
      key: "priceRange",
      width: 150,
      render: (range: string) => (
        <div style={{ fontSize: 12, color: "#666" }}>{range}</div>
      ),
    },
    {
      title: "Tiêu thụ",
      dataIndex: "fuelEfficiency",
      key: "fuelEfficiency",
      width: 100,
      render: (efficiency: string) => (
        <div style={{ fontSize: 12, fontWeight: 500, color: "#52c41a" }}>
          {efficiency}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => {
        const statusConfig = modelStatuses.find((s) => s.value === status);
        return <Tag color={statusConfig?.color}>{statusConfig?.label}</Tag>;
      },
      filters: modelStatuses.map((status) => ({
        text: status.label,
        value: status.value,
      })),
      onFilter: (value, record) => record.status === value,
    },
  ];

  // Handlers
  const handleAdd = () => {
    setAddModalVisible(true);
  };

  const handleEdit = (record: VehicleModel) => {
    setSelectedModel(record);
    setEditModalVisible(true);
  };

  const handleView = (record: VehicleModel) => {
    setSelectedModel(record);
    setDetailModalVisible(true);
  };

  const handleAddSuccess = (newModel: VehicleModel) => {
    const newData = [...data, newModel];
    setData(newData);
    setFilteredData(newData);
  };

  const handleEditSuccess = (updatedModel: VehicleModel) => {
    const newData = data.map((item) => (item.id === updatedModel.id ? updatedModel : item));
    setData(newData);
    setFilteredData(newData);
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
    let filtered = [...data];

    // Tìm kiếm
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (model) =>
          model.modelName.toLowerCase().includes(searchLower) ||
          model.modelCode.toLowerCase().includes(searchLower) ||
          model.brandName.toLowerCase().includes(searchLower) ||
          model.typeName.toLowerCase().includes(searchLower)
      );
    }

    // Hãng xe
    if (filters.brandId) {
      filtered = filtered.filter((model) => model.brandId === Number(filters.brandId));
    }

    // Loại xe
    if (filters.typeId) {
      filtered = filtered.filter((model) => model.typeId === Number(filters.typeId));
    }

    // Trạng thái
    if (filters.status) {
      filtered = filtered.filter((model) => model.status === filters.status);
    }

    // Năm sản xuất
    if (filters.yearRange[0] || filters.yearRange[1]) {
      filtered = filtered.filter((model) => {
        const year = model.year;
        const minYear = filters.yearRange[0] || 0;
        const maxYear = filters.yearRange[1] || 9999;
        return year >= minYear && year <= maxYear;
      });
    }

    // Loại nhiên liệu
    if (filters.fuelType) {
      filtered = filtered.filter((model) =>
        model.engineOptions.some((engine) => engine.fuelType === filters.fuelType)
      );
    }

    // Đánh giá trung bình
    if (filters.averageRating !== null) {
      filtered = filtered.filter((model) => model.averageRating >= filters.averageRating!);
    }

    setFilteredData(filtered);
  };

  const handleClearFilter = () => {
    setFilteredData(data);
  };

  const handleToggleStatus = (record: VehicleModel) => {
    const action = record.status === "active" ? "ngừng sản xuất" : "kích hoạt";
    showModal({
      title: `${
        action === "ngừng sản xuất" ? "Ngừng sản xuất" : "Kích hoạt"
      } model`,
      content: `Bạn có chắc chắn muốn ${action} model ${record.modelName}?`,
      type: "warning",
      onConfirm: async () => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const newData = data.map((item) =>
          item.id === record.id
            ? {
                ...item,
                status: item.status === "active" ? "discontinued" : "active",
              }
            : item
        );
        setData(newData);
        setFilteredData(newData);
        setLoading(false);
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
        dataSource={filteredData}
        columns={columns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        addButtonText="Thêm model xe"
        actions={[
          {
            key: "toggle-status",
            label: (record: VehicleModel) =>
              record.status === "active" ? "Ngừng sản xuất" : "Kích hoạt",
            type: "default",
            danger: (record: VehicleModel) => record.status === "active",
            onClick: handleToggleStatus,
          },
        ]}
        searchable={false}
        scroll={{ x: 1800 }}
      />

      {/* Modals */}
      <VehicleModelDetailModal
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        modelId={selectedModel?.id || null}
      />

      <VehicleModelAddModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
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
