"use client";
import React, { useState } from "react";
import { AdminTable } from "@/components/ui/Table";
import { useConfirmationModalContext } from "@/components/ui/Modal";
import { ColumnsType } from "antd/es/table";
import { Tag, Avatar } from "antd";
import {
  vehicleBrandsData,
  countries,
  brandStatuses,
} from "@/components/utils/data/vehicle-brands.data";
import { calculateBrandAge } from "@/components/utils/helper/vehicle.brand.helper";
import {
  VehicleBrandDetailModal,
  VehicleBrandAddModal,
  VehicleBrandEditModal,
} from "@/components/ui/Modal/VehicleBrandModals";
import { VehicleBrandFilterPanel } from "@/components/ui/FilterPanel";

interface VehicleBrand {
  id: number;
  brandCode: string;
  brandName: string;
  country: string;
  foundedYear: number;
  logo: string;
  website: string;
  description: string;
  status: string;
  totalModels: number;
  totalVehicles: number;
  averageRating: number;
  popularModels: string[];
  priceRange: string;
  specialties: string[];
  createdAt: string;
  updatedAt: string;
}

const VehicleBrandsPage = () => {
  const [data, setData] = useState(vehicleBrandsData);
  const [filteredData, setFilteredData] = useState(vehicleBrandsData);
  const [loading, setLoading] = useState(false);
  const { showModal } = useConfirmationModalContext();
  
  // Modal states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<VehicleBrand | null>(null);

  // Định nghĩa columns
  const columns: ColumnsType<VehicleBrand> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Logo",
      dataIndex: "logo",
      key: "logo",
      width: 80,
      render: (logo: string, record: VehicleBrand) => (
        <Avatar size={50} src={logo} style={{ backgroundColor: "#f0f0f0" }}>
          {record.brandName.charAt(0)}
        </Avatar>
      ),
    },
    {
      title: "Hãng xe",
      key: "brand",
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>
            {record.brandName}
          </div>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>
            {record.brandCode}
          </div>
          <div style={{ fontSize: 11, color: "#999" }}>
            {record.description}
          </div>
        </div>
      ),
    },
    {
      title: "Quốc gia",
      dataIndex: "country",
      key: "country",
      width: 120,
      render: (country: string) => {
        const countryConfig = countries.find((c) => c.label === country);
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 16 }}>{countryConfig?.flag}</span>
            <span style={{ fontSize: 12 }}>{country}</span>
          </div>
        );
      },
      filters: countries.map((country) => ({
        text: country.label,
        value: country.label,
      })),
      onFilter: (value, record) => record.country === value,
    },
    {
      title: "Năm thành lập",
      dataIndex: "foundedYear",
      key: "foundedYear",
      width: 120,
      sorter: (a, b) => a.foundedYear - b.foundedYear,
      render: (year: number) => (
        <div>
          <div style={{ fontWeight: 500 }}>{year}</div>
          <div style={{ fontSize: 11, color: "#666" }}>
            {calculateBrandAge(year)} tuổi
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
        const statusConfig = brandStatuses.find((s) => s.value === status);
        return <Tag color={statusConfig?.color}>{statusConfig?.label}</Tag>;
      },
      filters: brandStatuses.map((status) => ({
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

  const handleEdit = (record: VehicleBrand) => {
    setSelectedBrand(record);
    setEditModalVisible(true);
  };

  const handleView = (record: VehicleBrand) => {
    setSelectedBrand(record);
    setDetailModalVisible(true);
  };

  const handleAddSuccess = (newBrand: VehicleBrand) => {
    const newData = [...data, newBrand];
    setData(newData);
    setFilteredData(newData);
  };

  const handleEditSuccess = (updatedBrand: VehicleBrand) => {
    const newData = data.map((item) => (item.id === updatedBrand.id ? updatedBrand : item));
    setData(newData);
    setFilteredData(newData);
  };

  const handleFilter = (filters: {
    search: string;
    country: string;
    status: string;
    foundedYearRange: [number | null, number | null];
    priceSegment: string;
    averageRating: number | null;
  }) => {
    let filtered = [...data];

    // Tìm kiếm
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (brand) =>
          brand.brandName.toLowerCase().includes(searchLower) ||
          brand.brandCode.toLowerCase().includes(searchLower) ||
          brand.description.toLowerCase().includes(searchLower)
      );
    }

    // Quốc gia
    if (filters.country) {
      filtered = filtered.filter((brand) => brand.country === filters.country);
    }

    // Trạng thái
    if (filters.status) {
      filtered = filtered.filter((brand) => brand.status === filters.status);
    }

    // Năm thành lập
    if (filters.foundedYearRange[0] || filters.foundedYearRange[1]) {
      filtered = filtered.filter((brand) => {
        const year = brand.foundedYear;
        const minYear = filters.foundedYearRange[0] || 0;
        const maxYear = filters.foundedYearRange[1] || 9999;
        return year >= minYear && year <= maxYear;
      });
    }

    // Đánh giá trung bình
    if (filters.averageRating !== null) {
      filtered = filtered.filter((brand) => brand.averageRating >= filters.averageRating!);
    }

    setFilteredData(filtered);
  };

  const handleClearFilter = () => {
    setFilteredData(data);
  };

  const handleToggleStatus = (record: VehicleBrand) => {
    const action = record.status === "active" ? "vô hiệu hóa" : "kích hoạt";
    showModal({
      title: `${
        action === "vô hiệu hóa" ? "Vô hiệu hóa" : "Kích hoạt"
      } hãng xe`,
      content: `Bạn có chắc chắn muốn ${action} hãng xe ${record.brandName}?`,
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
      <VehicleBrandFilterPanel
        onFilter={handleFilter}
        onClear={handleClearFilter}
      />
      
      <AdminTable
        title="Quản lý hãng xe"
        dataSource={filteredData}
        columns={columns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        addButtonText="Thêm hãng xe"
        actions={[
          {
            key: "toggle-status",
            label: (record: VehicleBrand) =>
              record.status === "active" ? "Vô hiệu hóa" : "Kích hoạt",
            type: "default",
            danger: (record: VehicleBrand) => record.status === "active",
            onClick: handleToggleStatus,
          },
        ]}
        searchable={false}
        scroll={{ x: 1400 }}
      />

      {/* Modals */}
      <VehicleBrandDetailModal
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        brandId={selectedBrand?.id || null}
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
