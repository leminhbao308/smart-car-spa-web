"use client";

import React, { useMemo, useEffect } from "react";
import { Select, Spin, Avatar, Empty, Button } from "antd";
import { UserOutlined, SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { useCustomersDropdown } from "@/lib/api/hooks/useUsers";

const { Option } = Select;

interface CustomerSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
  allowClear?: boolean;
  showSearch?: boolean;
  filterOption?: (input: string, option: { value: string; label: string } | undefined) => boolean;
  size?: 'small' | 'middle' | 'large';
  onCreateCustomer?: () => void;
  onRefresh?: (refetchFn: () => void) => void;
}

const CustomerSelect: React.FC<CustomerSelectProps> = ({
  value,
  onChange,
  placeholder = "Chọn khách hàng",
  loading: externalLoading = false,
  disabled = false,
  style,
  className,
  allowClear = true,
  showSearch = true,
  filterOption,
  size = 'middle',
  onCreateCustomer,
  onRefresh,
}) => {
  const { customers, loading: apiLoading, error, refetch } = useCustomersDropdown();

  const isLoading = externalLoading || apiLoading;

  // Expose refetch function to parent
  useEffect(() => {
    if (onRefresh) {
      onRefresh(refetch);
    }
  }, [onRefresh, refetch]);

  // Handle selection change
  const handleChange = (selectedValue: string) => {
    if (selectedValue === 'create-customer' && onCreateCustomer) {
      onCreateCustomer();
      return;
    }
    if (onChange) {
      onChange(selectedValue);
    }
  };

  // Memoize filtered customers for better performance
  const filteredCustomers = useMemo(() => {
    return customers.sort((a, b) => {
      // Sort by full_name alphabetically
      return (a.full_name || '').localeCompare(b.full_name || '');
    });
  }, [customers]);

  // Enhanced search function that searches across multiple fields
  const defaultFilterOption = (input: string, option: { value: string; label: string } | undefined) => {
    if (!option) return false;
    const customer = customers.find(c => c.user_id === option.value);
    if (!customer) return false;
    
    const searchText = input.toLowerCase().trim();
    if (!searchText) return true;
    
    // Search in multiple fields
    const searchableFields = [
      customer.full_name,
      customer.email,
      customer.phone_number,
      // Add more fields if needed
    ].filter(Boolean).map(field => field?.toLowerCase() || '');
    
    return searchableFields.some(field => field.includes(searchText));
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
      onChange={handleChange}
      placeholder={placeholder}
      loading={isLoading}
      disabled={disabled || isLoading}
      style={style}
      className={className}
      allowClear={allowClear}
      showSearch={showSearch}
      filterOption={filterOption || defaultFilterOption}
      notFoundContent={
        isLoading ? (
          <div style={{ textAlign: 'center', padding: '12px' }}>
            <Spin size="small" />
            <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>
              Đang tải danh sách khách hàng...
            </div>
          </div>
        ) : (
          <div style={{ padding: '12px', textAlign: 'center' }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div style={{ fontSize: 12, color: '#666' }}>
                  <div>Không tìm thấy khách hàng</div>
                  <div style={{ marginTop: 4, fontSize: 11 }}>
                    Thử tìm kiếm bằng tên, email hoặc số điện thoại
                  </div>
                </div>
              }
            />
            {onCreateCustomer && (
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={onCreateCustomer}
                style={{
                  marginTop: 8,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  borderRadius: 6
                }}
              >
                Tạo khách hàng mới
              </Button>
            )}
          </div>
        )
      }
      optionLabelProp="label"
      size={size}
      styles={{
        popup: {
          root: {
            maxHeight: 300,
            overflow: 'auto'
          }
        }
      }}
      suffixIcon={<SearchOutlined style={{ color: '#bfbfbf' }} />}
    >
      {/* Add Customer Option - Always at the top */}
      {onCreateCustomer && (
        <Option 
          key="create-customer" 
          value="create-customer"
          label="Tạo khách hàng mới"
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12,
            padding: '4px 0',
            color: '#10b981'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '50%',
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              flexShrink: 0
            }}>
              <PlusOutlined style={{ fontSize: 12 }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontWeight: 500, 
                fontSize: 14,
                color: '#10b981'
              }}>
                Tạo khách hàng mới
              </div>
              <div style={{ 
                fontSize: 12, 
                color: '#6b7280'
              }}>
                Thêm khách hàng mới vào hệ thống
              </div>
            </div>
          </div>
        </Option>
      )}
      
      {filteredCustomers.map((customer) => (
        <Option 
          key={customer.user_id} 
          value={customer.user_id}
          label={customer.full_name}
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12,
            padding: '4px 0'
          }}>
            <Avatar 
              size="small" 
              icon={<UserOutlined />}
              src={customer.avatar_url}
              style={{ 
                backgroundColor: '#1890ff',
                flexShrink: 0
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ 
                fontWeight: 500, 
                fontSize: 14,
                color: '#262626',
                marginBottom: 2
              }}>
                {customer.full_name}
              </div>
              <div style={{ 
                fontSize: 12, 
                color: '#8c8c8c',
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}>
                {customer.email && (
                  <div>📧 {customer.email}</div>
                )}
                {customer.phone_number && (
                  <div>📱 {customer.phone_number}</div>
                )}
              </div>
            </div>
          </div>
        </Option>
      ))}
    </Select>
  );
};

export default CustomerSelect;
