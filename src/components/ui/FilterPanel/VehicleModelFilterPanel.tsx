"use client";
import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Select,
  Input,
  Button,
  Space,
  Typography,
  InputNumber,
  Tag,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
  CarOutlined,
  DollarOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { vehicleBrandsData } from "@/components/utils/data/vehicle-brands.data";
import { vehicleTypesData } from "@/components/utils/data/vehicle-types.data";
import { modelStatuses, fuelTypes } from "@/components/utils/data/vehicle-models.data";

const { Title, Text } = Typography;
const { Option } = Select;

interface VehicleModelFilterPanelProps {
  onFilter: (filters: any) => void;
  onClear: () => void;
}

const VehicleModelFilterPanel: React.FC<VehicleModelFilterPanelProps> = ({
  onFilter,
  onClear,
}) => {
  const [filters, setFilters] = useState({
    search: "",
    brandId: "",
    typeId: "",
    status: "",
    yearRange: [null, null] as [number | null, number | null],
    fuelType: "",
    priceSegment: "",
    averageRating: null as number | null,
  });

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleApplyFilter = () => {
    onFilter(filters);
  };

  const handleClearFilter = () => {
    const clearedFilters = {
      search: "",
      brandId: "",
      typeId: "",
      status: "",
      yearRange: [null, null] as [number | null, number | null],
      fuelType: "",
      priceSegment: "",
      averageRating: null as number | null,
    };
    setFilters(clearedFilters);
    onClear();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.brandId) count++;
    if (filters.typeId) count++;
    if (filters.status) count++;
    if (filters.yearRange[0] || filters.yearRange[1]) count++;
    if (filters.fuelType) count++;
    if (filters.priceSegment) count++;
    if (filters.averageRating) count++;
    return count;
  };

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FilterOutlined style={{ color: "#1890ff" }} />
          <Title level={5} style={{ margin: 0 }}>
            Bộ lọc nâng cao
          </Title>
          {getActiveFiltersCount() > 0 && (
            <Tag color="blue">{getActiveFiltersCount()} bộ lọc</Tag>
          )}
        </div>
      }
      size="small"
      style={{ marginBottom: 16 }}
    >
      <Row gutter={[16, 16]}>
        {/* Tìm kiếm */}
        <Col span={6}>
          <div>
            <Text strong style={{ marginBottom: 4, display: "block" }}>
              Tìm kiếm
            </Text>
            <Input
              placeholder="Tên model, mã model..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              onPressEnter={handleApplyFilter}
            />
          </div>
        </Col>

        {/* Hãng xe */}
        <Col span={6}>
          <div>
            <Text strong style={{ marginBottom: 4, display: "block" }}>
              Hãng xe
            </Text>
            <Select
              placeholder="Chọn hãng xe"
              style={{ width: "100%" }}
              value={filters.brandId}
              onChange={(value) => handleFilterChange("brandId", value)}
              suffixIcon={<CarOutlined />}
              allowClear
            >
              {vehicleBrandsData.map((brand) => (
                <Option key={brand.id} value={brand.id}>
                  {brand.brandName}
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        {/* Loại xe */}
        <Col span={6}>
          <div>
            <Text strong style={{ marginBottom: 4, display: "block" }}>
              Loại xe
            </Text>
            <Select
              placeholder="Chọn loại xe"
              style={{ width: "100%" }}
              value={filters.typeId}
              onChange={(value) => handleFilterChange("typeId", value)}
              allowClear
            >
              {vehicleTypesData.map((type) => (
                <Option key={type.id} value={type.id}>
                  {type.typeName}
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        {/* Trạng thái */}
        <Col span={6}>
          <div>
            <Text strong style={{ marginBottom: 4, display: "block" }}>
              Trạng thái
            </Text>
            <Select
              placeholder="Chọn trạng thái"
              style={{ width: "100%" }}
              value={filters.status}
              onChange={(value) => handleFilterChange("status", value)}
              allowClear
            >
              {modelStatuses.map((status) => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        {/* Năm sản xuất */}
        <Col span={6}>
          <div>
            <Text strong style={{ marginBottom: 4, display: "block" }}>
              Năm sản xuất
            </Text>
            <Space.Compact style={{ width: "100%" }}>
              <InputNumber
                placeholder="Từ"
                style={{ width: "50%" }}
                value={filters.yearRange[0]}
                onChange={(value) =>
                  handleFilterChange("yearRange", [value, filters.yearRange[1]])
                }
                min={1900}
                max={new Date().getFullYear() + 2}
                suffix={<CalendarOutlined />}
              />
              <InputNumber
                placeholder="Đến"
                style={{ width: "50%" }}
                value={filters.yearRange[1]}
                onChange={(value) =>
                  handleFilterChange("yearRange", [filters.yearRange[0], value])
                }
                min={1900}
                max={new Date().getFullYear() + 2}
              />
            </Space.Compact>
          </div>
        </Col>

        {/* Loại nhiên liệu */}
        <Col span={6}>
          <div>
            <Text strong style={{ marginBottom: 4, display: "block" }}>
              Loại nhiên liệu
            </Text>
            <Select
              placeholder="Chọn nhiên liệu"
              style={{ width: "100%" }}
              value={filters.fuelType}
              onChange={(value) => handleFilterChange("fuelType", value)}
              allowClear
            >
              {fuelTypes.map((fuel) => (
                <Option key={fuel.value} value={fuel.label}>
                  <Space>
                    <span>{fuel.icon}</span>
                    <span>{fuel.label}</span>
                  </Space>
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        {/* Phân khúc giá */}
        <Col span={6}>
          <div>
            <Text strong style={{ marginBottom: 4, display: "block" }}>
              Phân khúc giá
            </Text>
            <Select
              placeholder="Chọn phân khúc"
              style={{ width: "100%" }}
              value={filters.priceSegment}
              onChange={(value) => handleFilterChange("priceSegment", value)}
              suffixIcon={<DollarOutlined />}
              allowClear
            >
              <Option value="budget">Bình dân (Dưới 500 triệu)</Option>
              <Option value="mid">Trung bình (500 triệu - 1.5 tỷ)</Option>
              <Option value="premium">Cao cấp (1.5 tỷ - 3 tỷ)</Option>
              <Option value="luxury">Siêu sang (Trên 3 tỷ)</Option>
            </Select>
          </div>
        </Col>

        {/* Đánh giá trung bình */}
        <Col span={6}>
          <div>
            <Text strong style={{ marginBottom: 4, display: "block" }}>
              Đánh giá tối thiểu
            </Text>
            <InputNumber
              placeholder="Đánh giá"
              style={{ width: "100%" }}
              value={filters.averageRating}
              onChange={(value) => handleFilterChange("averageRating", value)}
              min={0}
              max={5}
              step={0.1}
              precision={1}
            />
          </div>
        </Col>

        {/* Nút hành động */}
        <Col span={12}>
          <div style={{ display: "flex", alignItems: "end", height: "100%" }}>
            <Space>
              <Button
                type="primary"
                icon={<FilterOutlined />}
                onClick={handleApplyFilter}
              >
                Áp dụng bộ lọc
              </Button>
              <Button
                icon={<ClearOutlined />}
                onClick={handleClearFilter}
                disabled={getActiveFiltersCount() === 0}
              >
                Xóa bộ lọc
              </Button>
            </Space>
          </div>
        </Col>
      </Row>

      {/* Hiển thị bộ lọc đang áp dụng */}
      {getActiveFiltersCount() > 0 && (
        <div
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <Text strong style={{ marginBottom: 8, display: "block" }}>
            Bộ lọc đang áp dụng:
          </Text>
          <Space wrap>
            {filters.search && (
              <Tag closable onClose={() => handleFilterChange("search", "")}>
                Tìm kiếm: {filters.search}
              </Tag>
            )}
            {filters.brandId && (
              <Tag closable onClose={() => handleFilterChange("brandId", "")}>
                Hãng: {vehicleBrandsData.find((b) => b.id === Number(filters.brandId))?.brandName}
              </Tag>
            )}
            {filters.typeId && (
              <Tag closable onClose={() => handleFilterChange("typeId", "")}>
                Loại: {vehicleTypesData.find((t) => t.id === Number(filters.typeId))?.typeName}
              </Tag>
            )}
            {filters.status && (
              <Tag closable onClose={() => handleFilterChange("status", "")}>
                Trạng thái: {modelStatuses.find((s) => s.value === filters.status)?.label}
              </Tag>
            )}
            {(filters.yearRange[0] || filters.yearRange[1]) && (
              <Tag
                closable
                onClose={() => handleFilterChange("yearRange", [null, null])}
              >
                Năm: {filters.yearRange[0] || "..."} - {filters.yearRange[1] || "..."}
              </Tag>
            )}
            {filters.fuelType && (
              <Tag closable onClose={() => handleFilterChange("fuelType", "")}>
                Nhiên liệu: {filters.fuelType}
              </Tag>
            )}
            {filters.priceSegment && (
              <Tag closable onClose={() => handleFilterChange("priceSegment", "")}>
                Phân khúc: {filters.priceSegment}
              </Tag>
            )}
            {filters.averageRating && (
              <Tag closable onClose={() => handleFilterChange("averageRating", null)}>
                Đánh giá: {filters.averageRating}+
              </Tag>
            )}
          </Space>
        </div>
      )}
    </Card>
  );
};

export default VehicleModelFilterPanel;
