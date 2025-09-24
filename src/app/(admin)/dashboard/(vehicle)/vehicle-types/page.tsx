"use client";
import React, { useState } from "react";
import { AdminTable } from "@/components/ui/Table";
import { useConfirmationModalContext } from "@/components/ui/Modal";
import { ColumnsType } from "antd/es/table";
import { Tag } from "antd";
import {
  vehicleTypesData,
  typeStatuses,
} from "@/components/utils/data/vehicle-types.data";
import {
  VehicleTypeDetailModal,
  VehicleTypeAddModal,
  VehicleTypeEditModal,
} from "@/components/ui/Modal/VehicleTypeModals";
import { VehicleTypeFilterPanel } from "@/components/ui/FilterPanel";

interface VehicleType {
  id: number;
  typeCode: string;
  typeName: string;
  description: string;
  icon: string;
  color: string;
  characteristics: string[];
  targetCustomers: string[];
  priceRange: string;
  fuelEfficiency: string;
  comfort: string;
  performance: string;
  status: string;
  totalModels: number;
  totalVehicles: number;
  popularBrands: string[];
  examples: string[];
  createdAt: string;
  updatedAt: string;
}

const VehicleTypesPage = () => {
  const [data, setData] = useState(vehicleTypesData);
  const [filteredData, setFilteredData] = useState(vehicleTypesData);
  const [loading, setLoading] = useState(false);
  const { showModal } = useConfirmationModalContext();
  
  // Modal states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<VehicleType | null>(null);

  // Định nghĩa columns
  const columns: ColumnsType<VehicleType> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Icon",
      dataIndex: "icon",
      key: "icon",
      width: 80,
      render: (icon: string) => (
        <div
          style={{
            fontSize: 32,
            textAlign: "center",
            padding: "8px",
            backgroundColor: "#f0f0f0",
            borderRadius: "8px",
          }}
        >
          {icon}
        </div>
      ),
    },
    {
      title: "Loại xe",
      key: "type",
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>
            {record.typeName}
          </div>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>
            {record.typeCode}
          </div>
          <div style={{ fontSize: 11, color: "#999" }}>
            {record.description}
          </div>
        </div>
      ),
    },
    {
      title: "Phân khúc giá",
      dataIndex: "priceRange",
      key: "priceRange",
      width: 180,
      render: (range: string) => (
        <div style={{ fontSize: 12, color: "#666" }}>{range}</div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => {
        const statusConfig = typeStatuses.find((s) => s.value === status);
        return <Tag color={statusConfig?.color}>{statusConfig?.label}</Tag>;
      },
      filters: typeStatuses.map((status) => ({
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

  const handleEdit = (record: VehicleType) => {
    setSelectedType(record);
    setEditModalVisible(true);
  };

  const handleView = (record: VehicleType) => {
    setSelectedType(record);
    setDetailModalVisible(true);
  };

  const handleAddSuccess = (newType: VehicleType) => {
    const newData = [...data, newType];
    setData(newData);
    setFilteredData(newData);
  };

  const handleEditSuccess = (updatedType: VehicleType) => {
    const newData = data.map((item) => (item.id === updatedType.id ? updatedType : item));
    setData(newData);
    setFilteredData(newData);
  };

  const handleFilter = (filters: {
    search: string;
    status: string;
    fuelEfficiency: string;
    comfort: string;
    performance: string;
    priceSegment: string;
  }) => {
    let filtered = [...data];

    // Tìm kiếm
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (type) =>
          type.typeName.toLowerCase().includes(searchLower) ||
          type.typeCode.toLowerCase().includes(searchLower) ||
          type.description.toLowerCase().includes(searchLower)
      );
    }

    // Trạng thái
    if (filters.status) {
      filtered = filtered.filter((type) => type.status === filters.status);
    }

    // Tiết kiệm nhiên liệu
    if (filters.fuelEfficiency) {
      filtered = filtered.filter((type) => type.fuelEfficiency === filters.fuelEfficiency);
    }

    // Mức độ thoải mái
    if (filters.comfort) {
      filtered = filtered.filter((type) => type.comfort === filters.comfort);
    }

    // Hiệu suất
    if (filters.performance) {
      filtered = filtered.filter((type) => type.performance === filters.performance);
    }

    setFilteredData(filtered);
  };

  const handleClearFilter = () => {
    setFilteredData(data);
  };

  const handleToggleStatus = (record: VehicleType) => {
    const action = record.status === "active" ? "vô hiệu hóa" : "kích hoạt";
    showModal({
      title: `${
        action === "vô hiệu hóa" ? "Vô hiệu hóa" : "Kích hoạt"
      } loại xe`,
      content: `Bạn có chắc chắn muốn ${action} loại xe ${record.typeName}?`,
      type: "warning",
      onConfirm: async () => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const newData = data.map((item) =>
          item.id === record.id
            ? {
                ...item,
                status: item.status === "active" ? "inactive" : "active",
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
      <VehicleTypeFilterPanel
        onFilter={handleFilter}
        onClear={handleClearFilter}
      />
      
      <AdminTable
        title="Quản lý loại xe"
        dataSource={filteredData}
        columns={columns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        addButtonText="Thêm loại xe"
        actions={[
          {
            key: "toggle-status",
            label: (record: VehicleType) =>
              record.status === "active" ? "Vô hiệu hóa" : "Kích hoạt",
            type: "default",
            danger: (record: VehicleType) => record.status === "active",
            onClick: handleToggleStatus,
          },
        ]}
        searchable={false}
        scroll={{ x: 1600 }}
      />

      {/* Modals */}
      <VehicleTypeDetailModal
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        typeId={selectedType?.id || null}
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
