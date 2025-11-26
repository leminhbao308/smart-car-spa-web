"use client";

import React, { useState, useMemo } from "react";
import {
  Row,
  Col,
  Card,
  Input,
  Select,
  Slider,
  Button,
  Badge,
  Typography,
  Space,
  Empty,
  Spin,
  Tag,
} from "antd";
import {
  SearchOutlined,
  ShoppingCartOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { CatalogProduct } from "@/lib/api/types/customer-order.types";
import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { usePublicProducts, usePricing } from "@/lib/api/hooks";
import { useEffect } from "react";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

/**
 * Product Card Component
 */
const ProductCard: React.FC<{
  product: CatalogProduct;
  onAddToCart: (product: CatalogProduct) => void;
  onViewDetail: (product: CatalogProduct) => void;
}> = ({ product, onAddToCart, onViewDetail }) => {
  const { pricing, isAvailable } = product;
  const hasDiscount =
    pricing.salePrice && pricing.salePrice < pricing.basePrice;

  return (
    <Card
      hoverable
      cover={
        <div
          style={{
            position: "relative",
            width: "100%",
            paddingTop: "100%",
            overflow: "hidden",
            cursor: "pointer",
          }}
          onClick={() => onViewDetail(product)}
        >
          <Image
            src={product.mainImageUrl || "/images/placeholder-product.png"}
            alt={product.product_name}
            fill
            style={{ objectFit: "cover" }}
          />
          {hasDiscount && (
            <Tag
              color="red"
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              -{pricing.discountPercentage}%
            </Tag>
          )}
          {!isAvailable && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Tag
                color="default"
                style={{ fontSize: "16px" }}
              >
                Hết hàng
              </Tag>
            </div>
          )}
        </div>
      }
      actions={[
        <Button
          key="add-to-cart"
          type="primary"
          icon={<ShoppingCartOutlined />}
          onClick={() => onAddToCart(product)}
          disabled={!isAvailable}
          size="large"
          style={{
            width: "100%",
            height: "44px",
            fontWeight: 600,
            borderRadius: "8px",
            fontSize: "15px",
          }}
        >
          Thêm vào giỏ
        </Button>,
      ]}
    >
      <div
        onClick={() => onViewDetail(product)}
        style={{ cursor: "pointer" }}
      >
        <Paragraph
          ellipsis={{ rows: 2 }}
          style={{ minHeight: "44px", marginBottom: 8 }}
        >
          <Text strong>{product.product_name}</Text>
        </Paragraph>

        <Space
          direction="vertical"
          size={4}
          style={{ width: "100%" }}
        >
          {hasDiscount ? (
            <>
              <Text
                delete
                type="secondary"
              >
                {pricing.basePrice.toLocaleString("vi-VN")}đ
              </Text>
              <Text
                strong
                style={{ fontSize: "18px", color: "#ff4d4f" }}
              >
                {pricing.salePrice?.toLocaleString("vi-VN")}đ
              </Text>
            </>
          ) : (
            <Text
              strong
              style={{ fontSize: "18px" }}
            >
              {pricing.basePrice.toLocaleString("vi-VN")}đ
            </Text>
          )}
        </Space>
      </div>
    </Card>
  );
};

/**
 * Products Page Component
 */
export default function ProductsPage() {
  const router = useRouter();
  const { addToCart } = useCart();

  // Fetch all public products (không cần branch)
  const { products: rawProducts, loading } = usePublicProducts();

  // Pricing hook
  const { previewBatch } = usePricing();

  // State for pricing data
  const [pricingMap, setPricingMap] = useState<Record<string, number>>({});
  const [pricingLoading, setPricingLoading] = useState(false);

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState<string>("name");

  // Fetch pricing when products are loaded (only once)
  useEffect(() => {
    const fetchPricing = async () => {
      if (!rawProducts.length || pricingLoading) return;

      setPricingLoading(true);
      try {
        const items = rawProducts.map((p) => ({
          product_id: p.product_id,
          qty: 1,
        }));

        const result = await previewBatch({ items });

        // Map pricing to product IDs
        const newPricingMap: Record<string, number> = {};
        result.items?.forEach((item) => {
          newPricingMap[item.product_id] = item.total_price / item.qty;
        });

        setPricingMap(newPricingMap);
      } catch (error) {
        console.log("Failed to fetch pricing:", error);
      } finally {
        setPricingLoading(false);
      }
    };

    fetchPricing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawProducts.length]);

  // Merge pricing into products
  const products = useMemo(() => {
    return rawProducts.map((product) => ({
      ...product,
      pricing: {
        basePrice: pricingMap[product.product_id] || 0,
        salePrice: undefined,
        discountPercentage: undefined,
      },
    }));
  }, [rawProducts, pricingMap]);

  // Extract unique brands and categories
  const brands = useMemo(() => {
    const uniqueBrands = [...new Set(products.map((p) => p.brand))].filter(
      Boolean
    );
    return uniqueBrands;
  }, [products]);

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(products.map((p) => p.product_type_name)),
    ].filter(Boolean);
    return uniqueCategories;
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchText) {
      const search = searchText.toLowerCase();
      result = result.filter(
        (p) =>
          p.product_name.toLowerCase().includes(search) ||
          p.brand?.toLowerCase().includes(search) ||
          p.sku?.toLowerCase().includes(search)
      );
    }

    // Brand filter
    if (selectedBrand) {
      result = result.filter((p) => p.brand === selectedBrand);
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter((p) => p.product_type_name === selectedCategory);
    }

    // Price range filter
    result = result.filter((p) => {
      const price = p.pricing.salePrice || p.pricing.basePrice;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Availability filter
    if (showOnlyAvailable) {
      result = result.filter((p) => p.isAvailable);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return (
            (a.pricing.salePrice || a.pricing.basePrice) -
            (b.pricing.salePrice || b.pricing.basePrice)
          );
        case "price-desc":
          return (
            (b.pricing.salePrice || b.pricing.basePrice) -
            (a.pricing.salePrice || a.pricing.basePrice)
          );
        case "name":
        default:
          return a.product_name.localeCompare(b.product_name);
      }
    });

    return result;
  }, [
    products,
    searchText,
    selectedBrand,
    selectedCategory,
    priceRange,
    showOnlyAvailable,
    sortBy,
  ]);

  const handleAddToCart = (product: CatalogProduct) => {
    addToCart(product, 1);
  };

  const handleViewDetail = (product: CatalogProduct) => {
    router.push(`/products/${product.product_url}`);
  };

  const handleResetFilters = () => {
    setSearchText("");
    setSelectedBrand(undefined);
    setSelectedCategory(undefined);
    setPriceRange([0, 10000000]);
    setShowOnlyAvailable(false);
    setSortBy("name");
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Sản phẩm</Title>
        <Text type="secondary">
          Khám phá các sản phẩm chăm sóc ô tô chất lượng cao
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Sidebar Filters */}
        <Col
          xs={24}
          md={6}
        >
          <Card
            title={
              <>
                <FilterOutlined /> Bộ lọc
              </>
            }
            size="small"
          >
            <Space
              direction="vertical"
              style={{ width: "100%" }}
              size={16}
            >
              {/* Search */}
              <div>
                <Text strong>Tìm kiếm</Text>
                <Input
                  placeholder="Tên sản phẩm, SKU..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ marginTop: 8 }}
                  allowClear
                />
              </div>

              {/* Brand */}
              <div>
                <Text strong>Thương hiệu</Text>
                <Select
                  placeholder="Tất cả thương hiệu"
                  value={selectedBrand}
                  onChange={setSelectedBrand}
                  style={{ width: "100%", marginTop: 8 }}
                  allowClear
                >
                  {brands.map((brand) => (
                    <Option
                      key={brand}
                      value={brand}
                    >
                      {brand}
                    </Option>
                  ))}
                </Select>
              </div>

              {/* Category */}
              <div>
                <Text strong>Danh mục</Text>
                <Select
                  placeholder="Tất cả danh mục"
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  style={{ width: "100%", marginTop: 8 }}
                  allowClear
                >
                  {categories.map((category) => (
                    <Option
                      key={category}
                      value={category}
                    >
                      {category}
                    </Option>
                  ))}
                </Select>
              </div>

              {/* Price Range */}
              <div>
                <Text strong>Khoảng giá</Text>
                <Slider
                  range
                  min={0}
                  max={10000000}
                  step={100000}
                  value={priceRange}
                  onChange={(value) => setPriceRange(value as [number, number])}
                  style={{ marginTop: 16 }}
                  tooltip={{
                    formatter: (value) => `${value?.toLocaleString("vi-VN")}đ`,
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 8,
                  }}
                >
                  <Text type="secondary">
                    {priceRange[0].toLocaleString("vi-VN")}đ
                  </Text>
                  <Text type="secondary">
                    {priceRange[1].toLocaleString("vi-VN")}đ
                  </Text>
                </div>
              </div>

              {/* Availability */}
              <Button
                type={showOnlyAvailable ? "primary" : "default"}
                onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
                block
              >
                {showOnlyAvailable ? "Tất cả sản phẩm" : "Chỉ còn hàng"}
              </Button>

              {/* Reset */}
              <Button
                onClick={handleResetFilters}
                block
              >
                Xóa bộ lọc
              </Button>
            </Space>
          </Card>
        </Col>

        {/* Products Grid */}
        <Col
          xs={24}
          md={18}
        >
          {/* Sort and Count */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text>
              Hiển thị <strong>{filteredProducts.length}</strong> sản phẩm
            </Text>
            <Select
              value={sortBy}
              onChange={setSortBy}
              style={{ width: 200 }}
            >
              <Option value="name">Tên A-Z</Option>
              <Option value="price-asc">Giá thấp đến cao</Option>
              <Option value="price-desc">Giá cao đến thấp</Option>
            </Select>
          </div>

          {/* Products */}
          {loading || pricingLoading ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <Spin size="large" />
              {pricingLoading && (
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">Đang tải giá sản phẩm...</Text>
                </div>
              )}
            </div>
          ) : filteredProducts.length === 0 ? (
            <Empty description="Không tìm thấy sản phẩm" />
          ) : (
            <Row gutter={[16, 16]}>
              {filteredProducts.map((product) => (
                <Col
                  xs={24}
                  sm={12}
                  lg={8}
                  key={product.product_id}
                >
                  <ProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                    onViewDetail={handleViewDetail}
                  />
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>
    </div>
  );
}
