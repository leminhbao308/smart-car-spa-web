"use client";

import React from "react";
import { Select, Spin } from "antd";
import { useVehicleModelsDropdown } from "@/lib/api/hooks/useVehicleModels";

const { Option } = Select;

interface VehicleModelSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
  allowClear?: boolean;
  showSearch?: boolean;
  filterOption?: (input: string, option: any) => boolean;
  size?: 'small' | 'middle' | 'large';
}

const VehicleModelSelect: React.FC<VehicleModelSelectProps> = ({
  value,
  onChange,
  placeholder = "Chọn dòng xe",
  loading: externalLoading = false,
  disabled = false,
  style,
  className,
  allowClear = true,
  showSearch = true,
  filterOption,
  size = 'middle',
}) => {
  const { dropdownData, loading: apiLoading, error } = useVehicleModelsDropdown();

  const isLoading = externalLoading || apiLoading;

  const defaultFilterOption = (input: string, option: any) => {
    return (
      option?.children?.toString().toLowerCase().includes(input.toLowerCase()) ||
      option?.value?.toString().toLowerCase().includes(input.toLowerCase())
    );
  };

  if (error) {
    return (
      <Select
        value={value}
        onChange={onChange}
        placeholder="Lỗi tải dữ liệu"
        disabled={true}
        style={style}
        className={className}
        size={size}
      >
        <Option value="" disabled>
          Không thể tải dữ liệu
        </Option>
      </Select>
    );
  }

  return (
    <Select
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      loading={isLoading}
      disabled={disabled || isLoading}
      style={style}
      className={className}
      allowClear={allowClear}
      showSearch={showSearch}
      filterOption={filterOption || defaultFilterOption}
      notFoundContent={isLoading ? <Spin size="small" /> : "Không tìm thấy dòng xe"}
      size={size}
    >
      {dropdownData.map((model) => (
        <Option key={model.model_id} value={model.model_id}>
          {model.model_name}
        </Option>
      ))}
    </Select>
  );
};

export default VehicleModelSelect;
