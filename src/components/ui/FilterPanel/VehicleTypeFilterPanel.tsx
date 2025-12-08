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
  Tag,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
  CarOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { typeStatuses, fuelEfficiencyLevels, comfortLevels, performanceLevels } from "@/components/utils/data/vehicle-types.data";

const { Title, Text } = Typography;
const { Option } = Select;

interface VehicleTypeFilterPanelProps {
  onFilter: (filters: any) => void;
  onClear: () => void;
}

const VehicleTypeFilterPanel: React.FC<VehicleTypeFilterPanelProps> = ({
  onFilter,
  onClear,
}) => {
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    fuelEfficiency: "",
    comfort: "",
    performance: "",
    priceSegment: "",
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
      status: "",
      fuelEfficiency: "",
      comfort: "",
      performance: "",
      priceSegment: "",
    };
    setFilters(clearedFilters);
    onClear();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status) count++;
    if (filters.fuelEfficiency) count++;
    if (filters.comfort) count++;
    if (filters.performance) count++;
    if (filters.priceSegment) count++;
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
              placeholder="Tên loại xe, mã loại..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              onPressEnter={handleApplyFilter}
            />
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
              {typeStatuses.map((status) => (
                <Option key={status.value} value={status.value}>
                  <Tag color={status.color}>{status.label}</Tag>
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        {/* Tiết kiệm nhiên liệu */}
        <Col span={6}>
          <div>
            <Text strong style={{ marginBottom: 4, display: "block" }}>
              Tiết kiệm nhiên liệu
            </Text>
            <Select
              placeholder="Chọn mức độ"
              style={{ width: "100%" }}
              value={filters.fuelEfficiency}
              onChange={(value) => handleFilterChange("fuelEfficiency", value)}
              allowClear
            >
              {fuelEfficiencyLevels.map((level) => (
                <Option key={level.value} value={level.value}>
                  <Space>
                    <span>{level.icon}</span>
                    <span>{level.label}</span>
                  </Space>
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        {/* Mức độ thoải mái */}
        <Col span={6}>
          <div>
            <Text strong style={{ marginBottom: 4, display: "block" }}>
              Mức độ thoải mái
            </Text>
            <Select
              placeholder="Chọn mức độ"
              style={{ width: "100%" }}
              value={filters.comfort}
              onChange={(value) => handleFilterChange("comfort", value)}
              allowClear
            >
              {comfortLevels.map((level) => (
                <Option key={level.value} value={level.value}>
                  <Space>
                    <span>{level.icon}</span>
                    <span>{level.label}</span>
                  </Space>
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        {/* Hiệu suất */}
        <Col span={6}>
          <div>
            <Text strong style={{ marginBottom: 4, display: "block" }}>
              Hiệu suất
            </Text>
            <Select
              placeholder="Chọn mức độ"
              style={{ width: "100%" }}
              value={filters.performance}
              onChange={(value) => handleFilterChange("performance", value)}
              allowClear
            >
              {performanceLevels.map((level) => (
                <Option key={level.value} value={level.value}>
                  <Space>
                    <span>{level.icon}</span>
                    <span>{level.label}</span>
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
            {filters.status && (
              <Tag closable onClose={() => handleFilterChange("status", "")}>
                Trạng thái: {typeStatuses.find((s) => s.value === filters.status)?.label}
              </Tag>
            )}
            {filters.fuelEfficiency && (
              <Tag closable onClose={() => handleFilterChange("fuelEfficiency", "")}>
                Tiết kiệm: {fuelEfficiencyLevels.find((f) => f.value === filters.fuelEfficiency)?.label}
              </Tag>
            )}
            {filters.comfort && (
              <Tag closable onClose={() => handleFilterChange("comfort", "")}>
                Thoải mái: {comfortLevels.find((c) => c.value === filters.comfort)?.label}
              </Tag>
            )}
            {filters.performance && (
              <Tag closable onClose={() => handleFilterChange("performance", "")}>
                Hiệu suất: {performanceLevels.find((p) => p.value === filters.performance)?.label}
              </Tag>
            )}
            {filters.priceSegment && (
              <Tag closable onClose={() => handleFilterChange("priceSegment", "")}>
                Phân khúc: {filters.priceSegment}
              </Tag>
            )}
          </Space>
        </div>
      )}
    </Card>
  );
};

export default VehicleTypeFilterPanel;
