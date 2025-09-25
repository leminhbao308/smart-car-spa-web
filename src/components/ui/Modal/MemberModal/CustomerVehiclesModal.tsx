"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Table,
  Tag,
  Avatar,
  Typography,
  Button,
  Input,
  Select,
  Card,
  Badge,
} from "antd";
import { CarOutlined, SearchOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import { UserManagementInfo } from "@/lib/api/types";

const { Text } = Typography;
const { Option } = Select;

interface CustomerVehiclesModalProps {
  visible: boolean;
  onCancel: () => void;
  customerData: UserManagementInfo | null;
}

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  color?: string;
  engineType?: string;
  fuelType?: string;
  mileage?: number;
  lastService?: string;
  nextService?: string;
  status: string;
}

const CustomerVehiclesModal: React.FC<CustomerVehiclesModalProps> = ({
  visible,
  onCancel,
  customerData,
}) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");

  // Mock data for vehicles
  const mockVehicles: Vehicle[] = [
    {
      id: 1,
      brand: "Toyota",
      model: "Camry",
      year: 2020,
      licensePlate: "51A-12345",
      color: "Trắng",
      engineType: "2.5L",
      fuelType: "Xăng",
      mileage: 45000,
      lastService: "2024-01-10",
      nextService: "2024-04-10",
      status: "active",
    },
    {
      id: 2,
      brand: "Honda",
      model: "CR-V",
      year: 2021,
      licensePlate: "51B-67890",
      color: "Đen",
      engineType: "1.5L Turbo",
      fuelType: "Xăng",
      mileage: 32000,
      lastService: "2024-01-15",
      nextService: "2024-04-15",
      status: "active",
    },
  ];

  useEffect(() => {
    if (visible && customerData) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setVehicles(mockVehicles);
        setLoading(false);
      }, 1000);
    }
  }, [visible, customerData]);

  const columns: ColumnsType<Vehicle> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Thông tin xe",
      key: "vehicle",
      width: 200,
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar
            size="small"
            style={{ backgroundColor: "#1890ff" }}
            icon={<CarOutlined />}
          />
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>
              {record.brand} {record.model}
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>
              Năm: {record.year}
            </div>
          </div>
        </div>
      ),
      sorter: (a, b) => a.brand.localeCompare(b.brand),
    },
    {
      title: "Biển số",
      dataIndex: "licensePlate",
      key: "licensePlate",
      width: 120,
      render: (plate: string) => (
        <Tag color="blue" style={{ fontFamily: "monospace" }}>
          {plate}
        </Tag>
      ),
    },
    {
      title: "Màu sắc",
      dataIndex: "color",
      key: "color",
      width: 100,
      render: (color: string) =>
        color ? <Tag color="default">{color}</Tag> : "-",
    },
    {
      title: "Động cơ",
      dataIndex: "engineType",
      key: "engineType",
      width: 120,
      render: (engine: string) => engine || "-",
    },
    {
      title: "Nhiên liệu",
      dataIndex: "fuelType",
      key: "fuelType",
      width: 100,
      render: (fuel: string) => (fuel ? <Tag color="green">{fuel}</Tag> : "-"),
    },
    {
      title: "Số km",
      dataIndex: "mileage",
      key: "mileage",
      width: 100,
      sorter: (a, b) => (a.mileage || 0) - (b.mileage || 0),
      render: (mileage: number) =>
        mileage ? `${mileage.toLocaleString()} km` : "-",
    },
    {
      title: "Bảo dưỡng cuối",
      dataIndex: "lastService",
      key: "lastService",
      width: 120,
      sorter: (a, b) =>
        new Date(a.lastService || "").getTime() -
        new Date(b.lastService || "").getTime(),
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "-",
    },
    {
      title: "Bảo dưỡng tiếp",
      dataIndex: "nextService",
      key: "nextService",
      width: 120,
      sorter: (a, b) =>
        new Date(a.nextService || "").getTime() -
        new Date(b.nextService || "").getTime(),
      render: (date: string) => {
        if (!date) return "-";
        const dateObj = new Date(date);
        const now = new Date();
        const diffDays = Math.floor(
          (dateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        let color = "green";
        if (diffDays < 0) color = "red";
        else if (diffDays < 7) color = "orange";

        return (
          <div>
            <div style={{ fontSize: 12 }}>
              {dateObj.toLocaleDateString("vi-VN")}
            </div>
            <Tag color={color} style={{ fontSize: 10 }}>
              {diffDays < 0
                ? "Quá hạn"
                : diffDays < 7
                ? "Sắp đến"
                : "Bình thường"}
            </Tag>
          </div>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status === "active" ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
      filters: [
        { text: "Hoạt động", value: "active" },
        { text: "Không hoạt động", value: "inactive" },
      ],
      onFilter: (value, record) => record.status === value,
    },
  ];

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.brand.toLowerCase().includes(searchText.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchText.toLowerCase()) ||
      vehicle.licensePlate.toLowerCase().includes(searchText.toLowerCase());
    const matchesBrand = brandFilter === "all" || vehicle.brand === brandFilter;
    return matchesSearch && matchesBrand;
  });

  const uniqueBrands = [...new Set(vehicles.map((v) => v.brand))];

  if (!customerData) return null;

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CarOutlined style={{ color: "#1890ff" }} />
          <span>Xe của khách hàng: {customerData.full_name}</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={1200}
      footer={[
        <Button key="close" onClick={onCancel}>
          Đóng
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Card size="small" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CarOutlined style={{ color: "#1890ff" }} />
              <Text strong>Khách hàng:</Text>
              <Text>{customerData.full_name}</Text>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Text strong>Tổng số xe:</Text>
              <Badge
                count={vehicles.length}
                style={{
                  backgroundColor: vehicles.length > 0 ? "#52c41a" : "#d9d9d9",
                }}
              />
            </div>
          </div>
        </Card>

        <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
          <Input
            placeholder="Tìm kiếm theo hãng, model hoặc biển số..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Lọc theo hãng xe"
            value={brandFilter}
            onChange={setBrandFilter}
            style={{ width: 150 }}
          >
            <Option value="all">Tất cả</Option>
            {uniqueBrands.map((brand) => (
              <Option key={brand} value={brand}>
                {brand}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filteredVehicles}
        loading={loading}
        rowKey="id"
        size="small"
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} xe`,
          pageSizeOptions: ["10", "20", "50"],
          defaultPageSize: 10,
        }}
        scroll={{ x: 1000 }}
      />
    </Modal>
  );
};

export default CustomerVehiclesModal;
