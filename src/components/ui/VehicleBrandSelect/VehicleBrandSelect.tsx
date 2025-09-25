"use client";
import React from "react";
import { Select, Spin } from "antd";
import type { SelectProps } from "antd";
import {
  useVehicleBrandsDropdown,
  convertToSelectOptions,
} from "@/lib/api/hooks/useVehicleBrands";

interface VehicleBrandSelectProps extends Omit<SelectProps, "options"> {
  options?: Array<{
    label: string;
    value: string;
    code?: string;
  }>;
}

const VehicleBrandSelect: React.FC<VehicleBrandSelectProps> = ({
  placeholder = "Chọn hãng xe",
  allowClear = true,
  showSearch = true,
  filterOption = (input, option) => {
    const inputLower = input.toLowerCase();

    // Check if option has label property (from our custom options)
    if (option?.label && typeof option.label === "string") {
      return option.label.toLowerCase().includes(inputLower);
    }

    // Check if option has code property (from our custom options)
    if (option?.code && typeof option.code === "string") {
      return option.code.toLowerCase().includes(inputLower);
    }

    return false;
  },
  loading: externalLoading,
  notFoundContent,
  size = "middle",
  dropdownMatchSelectWidth = true,
  options: externalOptions,
  ...restProps
}) => {
  const {
    dropdownData,
    loading: apiLoading,
    error,
  } = useVehicleBrandsDropdown();

  const loading = externalLoading || apiLoading;
  const options = externalOptions || convertToSelectOptions(dropdownData);

  return (
    <Select
      {...restProps}
      placeholder={placeholder}
      allowClear={allowClear}
      showSearch={showSearch}
      filterOption={filterOption}
      loading={loading}
      notFoundContent={
        error
          ? "Không thể tải dữ liệu"
          : notFoundContent ||
            (loading ? <Spin size="small" /> : "Không có dữ liệu")
      }
      size={size}
      dropdownMatchSelectWidth={dropdownMatchSelectWidth}
      options={error ? [] : options}
    />
  );
};

export default VehicleBrandSelect;
