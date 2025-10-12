"use client";
import React, { useState, useEffect } from "react";
import { Select, Spin, Empty, Tag, Typography, Card, Row, Col } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { ProductService } from "@/lib/api/services/product.service";
import { Product } from "@/lib/api/types/product.types";

const { Option } = Select;
const { Text } = Typography;

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
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchValue.trim()) {
        searchProducts(searchValue.trim());
      } else {
        setProducts([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchValue]);

  const searchProducts = async (keyword: string) => {
    try {
      setLoading(true);
      const response = await ProductService.getAllProducts({
        page: 1,
        size: 20,
        filters: {
          searchText: keyword,
          is_active: true,
        },
      });

      if (response.success && response.data?.content) {
        setProducts(response.data.content);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Search products error:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const handleSelect = (productId: string) => {
    const product = products.find(p => p.productId === productId);
    if (product) {
      onChange?.(productId, product);
      onSelect?.(product);
    }
  };

  const handleClear = () => {
    setSearchValue("");
    setProducts([]);
    onChange?.("");
    onClear?.();
  };

  const renderProductOption = (product: Product) => (
    <Option key={product.productId} value={product.productId}>
      <Card size="small" style={{ margin: 0, border: "none" }}>
        <Row gutter={8} align="middle">
          <Col flex="auto">
            <div>
              <Text strong style={{ fontSize: 14 }}>
                {product.productName}
              </Text>
              <div style={{ marginTop: 2 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  SKU: {product.sku} | Brand: {product.brand}
                </Text>
              </div>
              <div style={{ marginTop: 2 }}>
                <Tag color="blue">
                  {product.categoryName}
                </Tag>
                <Tag color="green">
                  {product.unitOfMeasure}
                </Tag>
                {product.isFeatured && (
                  <Tag color="gold">
                    Nổi bật
                  </Tag>
                )}
              </div>
            </div>
          </Col>
          <Col>
            <div style={{ textAlign: "right" }}>
              <Text strong style={{ color: "#52c41a", fontSize: 14 }}>
                {(product.sellingPrice || 0).toLocaleString()}đ
              </Text>
              <div>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Tồn: {product.minStockLevel || 0}
                </Text>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </Option>
  );


  return (
    <Select
      value={value}
      onChange={handleSelect}
      onSearch={handleSearch}
      onClear={handleClear}
      placeholder={placeholder}
      disabled={disabled}
      style={style}
      size={size}
      showSearch={showSearch}
      allowClear={allowClear}
      loading={loading}
      notFoundContent={
        loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin size="small" />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">Đang tìm kiếm...</Text>
            </div>
          </div>
        ) : searchValue ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <Text type="secondary">Không tìm thấy sản phẩm</Text>
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Thử từ khóa khác
                  </Text>
                </div>
              </div>
            }
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <Text type="secondary">Nhập từ khóa để tìm kiếm</Text>
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Tên sản phẩm, SKU, brand...
                  </Text>
                </div>
              </div>
            }
          />
        )
      }
      filterOption={false}
      styles={{
        popup: {
          root: {
            maxHeight: 400,
            overflow: "auto"
          }
        }
      }}
      suffixIcon={<SearchOutlined />}
    >
      {products.map(renderProductOption)}
    </Select>
  );
};

export default ProductSearchSelect;
