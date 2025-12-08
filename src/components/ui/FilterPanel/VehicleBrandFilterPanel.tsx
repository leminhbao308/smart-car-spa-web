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
  GlobalOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import {
  countries,
  brandStatuses,
} from "@/components/utils/data/vehicle-brands.data";

const { Title, Text } = Typography;
const { Option } = Select;

interface VehicleBrandFilterPanelProps {
  onFilter: (filters: any) => void;
  onClear: () => void;
}

const VehicleBrandFilterPanel: React.FC<VehicleBrandFilterPanelProps> = ({
  onFilter,
  onClear,
}) => {
  const [filters, setFilters] = useState({
    search: "",
    country: "",
    status: "",
    foundedYearRange: [null, null] as [number | null, number | null],
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
      country: "",
      status: "",
      foundedYearRange: [null, null] as [number | null, number | null],
      priceSegment: "",
      averageRating: null as number | null,
    };
    setFilters(clearedFilters);
    onClear();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.country) count++;
    if (filters.status) count++;
    if (filters.foundedYearRange[0] || filters.foundedYearRange[1]) count++;
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
              placeholder="Tên hãng, mã hãng..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              onPressEnter={handleApplyFilter}
            />
          </div>
        </Col>

        {/* Quốc gia */}
        <Col span={6}>
          <div>
            <Text strong style={{ marginBottom: 4, display: "block" }}>
              Quốc gia
            </Text>
            <Select
              placeholder="Chọn quốc gia"
              style={{ width: "100%" }}
              value={filters.country}
              onChange={(value) => handleFilterChange("country", value)}
              suffixIcon={<GlobalOutlined />}
              allowClear
            >
              {countries.map((country) => (
                <Option key={country.value} value={country.label}>
                  <Space>
                    <span>{country.flag}</span>
                    <span>{country.label}</span>
                  </Space>
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
              {brandStatuses.map((status) => (
                <Option key={status.value} value={status.value}>
                  <Tag color={status.color}>{status.label}</Tag>
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
            {filters.country && (
              <Tag closable onClose={() => handleFilterChange("country", "")}>
                Quốc gia: {filters.country}
              </Tag>
            )}
            {filters.status && (
              <Tag closable onClose={() => handleFilterChange("status", "")}>
                Trạng thái:{" "}
                {brandStatuses.find((s) => s.value === filters.status)?.label}
              </Tag>
            )}
            {(filters.foundedYearRange[0] || filters.foundedYearRange[1]) && (
              <Tag
                closable
                onClose={() =>
                  handleFilterChange("foundedYearRange", [null, null])
                }
              >
                Năm: {filters.foundedYearRange[0] || "..."} -{" "}
                {filters.foundedYearRange[1] || "..."}
              </Tag>
            )}
            {filters.priceSegment && (
              <Tag
                closable
                onClose={() => handleFilterChange("priceSegment", "")}
              >
                Phân khúc: {filters.priceSegment}
              </Tag>
            )}
            {filters.averageRating && (
              <Tag
                closable
                onClose={() => handleFilterChange("averageRating", null)}
              >
                Đánh giá: {filters.averageRating}+
              </Tag>
            )}
          </Space>
        </div>
      )}
    </Card>
  );
};

export default VehicleBrandFilterPanel;
