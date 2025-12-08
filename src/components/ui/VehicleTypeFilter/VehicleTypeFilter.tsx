"use client";
import React from "react";
import { Card, Row, Col, Select, Button, Space, DatePicker } from "antd";
import { FilterOutlined, ReloadOutlined } from "@ant-design/icons";
import { GetAllVehicleTypesRequest } from "@/lib/api/types";

const { Option } = Select;
const { RangePicker } = DatePicker;

interface VehicleTypeFilterProps {
  onFilter: (filters: GetAllVehicleTypesRequest) => void;
  onReset: () => void;
  loading?: boolean;
}

const VehicleTypeFilter: React.FC<VehicleTypeFilterProps> = ({
  onFilter,
  onReset,
  loading = false,
}) => {
  const [filters, setFilters] = React.useState<GetAllVehicleTypesRequest>({
    page: 0,
    size: 10,
    direction: "DESC",
    sort: "createdDate",
  });

  const handleFilterChange = (key: keyof GetAllVehicleTypesRequest, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleApplyFilter = () => {
    onFilter(filters);
  };

  const handleReset = () => {
    const resetFilters: GetAllVehicleTypesRequest = {
      page: 0,
      size: 10,
      direction: "DESC",
      sort: "createdDate",
    };
    setFilters(resetFilters);
    onReset();
  };

  return (
    <Card className="mb-4" size="small">
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={6}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <Select
              placeholder="Tất cả trạng thái"
              value={filters.active}
              onChange={(value) => handleFilterChange("active", value)}
              allowClear
              className="w-full"
            >
              <Option value={true}>Hoạt động</Option>
              <Option value={false}>Không hoạt động</Option>
            </Select>
          </div>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái xóa
            </label>
            <Select
              placeholder="Tất cả"
              value={filters.deleted}
              onChange={(value) => handleFilterChange("deleted", value)}
              allowClear
              className="w-full"
            >
              <Option value={false}>Chưa xóa</Option>
              <Option value={true}>Đã xóa</Option>
            </Select>
          </div>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sắp xếp
            </label>
            <Select
              value={filters.sort}
              onChange={(value) => handleFilterChange("sort", value)}
              className="w-full"
            >
              <Option value="createdDate">Ngày tạo</Option>
              <Option value="modifiedDate">Ngày sửa</Option>
              <Option value="typeName">Tên loại xe</Option>
              <Option value="typeCode">Mã loại xe</Option>
            </Select>
          </div>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thứ tự
            </label>
            <Select
              value={filters.direction}
              onChange={(value) => handleFilterChange("direction", value)}
              className="w-full"
            >
              <Option value="DESC">Giảm dần</Option>
              <Option value="ASC">Tăng dần</Option>
            </Select>
          </div>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kích thước trang
            </label>
            <Select
              value={filters.size}
              onChange={(value) => handleFilterChange("size", value)}
              className="w-full"
            >
              <Option value={10}>10</Option>
              <Option value={20}>20</Option>
              <Option value={50}>50</Option>
              <Option value={100}>100</Option>
            </Select>
          </div>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày tạo
            </label>
            <RangePicker
              className="w-full"
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  handleFilterChange("created_date_from", dates[0].toISOString());
                  handleFilterChange("created_date_to", dates[1].toISOString());
                } else {
                  handleFilterChange("created_date_from", undefined);
                  handleFilterChange("created_date_to", undefined);
                }
              }}
            />
          </div>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <div className="flex items-end h-full">
            <Space>
              <Button
                type="primary"
                icon={<FilterOutlined />}
                onClick={handleApplyFilter}
                loading={loading}
              >
                Lọc
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReset}
                loading={loading}
              >
                Reset
              </Button>
            </Space>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default VehicleTypeFilter;
