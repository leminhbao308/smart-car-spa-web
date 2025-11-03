"use client";
import React, { useState, useEffect } from "react";
import { Select, Spin, Empty } from "antd";

const { Option } = Select;
import { ProductService } from "@/lib/api/services/product.service";
import { Product } from "@/lib/api/types/product.types";

interface ProductSearchSelectProps {
  value?: string;
  onChange?: (value: string, product?: Product) => void;
  placeholder?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  size?: "small" | "middle" | "large";
  showSearch?: boolean;
  allowClear?: boolean;
  onSelect?: (product: Product) => void;
  onClear?: () => void;
  excludeProductIds?: string[]; // Danh sách product IDs đã được chọn ở nơi khác
}

const ProductSearchSelect: React.FC<ProductSearchSelectProps> = ({
  value,
  onChange,
  placeholder = "Tìm kiếm sản phẩm...",
  disabled = false,
  style,
  size = "middle",
  showSearch = true,
  allowClear = true,
  onSelect,
  onClear,
  excludeProductIds = [],
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Load products on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await ProductService.getAllProducts({
          page: 1,
          size: 1000,
          filters: {
            is_active: true,
          },
        });

        if (response.success && response.data?.content) {
          setProducts(response.data.content);
        }
      } catch (error) {
        console.log("Load products error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleSelect = (productId: string) => {
    const product = products.find((p) => p.product_id === productId);
    if (product) {
      console.log("ProductSearchSelect handleSelect - productId:", productId, "product:", product);
      onChange?.(productId, product);
      onSelect?.(product);
    }
  };

  const handleClear = () => {
    onChange?.("");
    onClear?.();
  };

  // Filter products based on exclusions
  const filteredProducts = products.filter(product => 
    !excludeProductIds.includes(product.product_id)
  );

  // Convert products to options format for Ant Design Select
  let options = filteredProducts.map(product => ({
    value: product.product_id,
    label: product.product_name,
  }));

  // If there's a selected product, ensure it's always in options (even if excluded)
  if (value) {
    const selectedProduct = products.find(p => p.product_id === value);
    console.log("ProductSearchSelect - value:", value, "selectedProduct:", selectedProduct);
    if (selectedProduct) {
      // Check if selected product is already in options
      const isAlreadyInOptions = options.some(option => option.value === value);
      console.log("ProductSearchSelect - isAlreadyInOptions:", isAlreadyInOptions);
      if (!isAlreadyInOptions) {
        // Add selected product to the beginning of options
        options = [{
          value: selectedProduct.product_id,
          label: selectedProduct.product_name,
        }, ...options];
        console.log("ProductSearchSelect - added selected product to options:", options[0]);
      }
    } else {
      console.log("ProductSearchSelect - selected product not found in products list");
    }
  }

  return (
    <Select
      value={value || undefined}
      onChange={handleSelect}
      onClear={handleClear}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        width: "100%",
        ...style
      }}
      size={size}
      showSearch={showSearch}
      allowClear={allowClear}
      loading={loading}
      optionLabelProp="label"
      filterSort={showSearch ? (optionA, optionB) =>
        (String(optionA?.label ?? '')).toLowerCase().localeCompare((String(optionB?.label ?? '')).toLowerCase())
      : undefined}
      filterOption={showSearch ? (input, option) => {
        const children = option?.children as unknown as string;
        return children?.toLowerCase().includes(input.toLowerCase()) || false;
      } : undefined}
      notFoundContent={
        loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin size="small" />
            <div style={{ marginTop: 8 }}>Đang tải...</div>
          </div>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không có sản phẩm"
          />
        )
      }
      getPopupContainer={(trigger) => trigger.parentElement}
    >
      {options.map(option => (
        <Option key={option.value} value={option.value} label={option.label}>
          {option.label}
        </Option>
      ))}
    </Select>
  );
};

export default ProductSearchSelect;