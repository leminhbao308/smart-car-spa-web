"use client";

import React, { useMemo, useState } from "react";
import {
  Card,
  Row,
  Col,
  Input,
  Select,
  Button,
  Space,
  Tag,
  Empty,
  Spin,
  Typography,
  Badge,
  Tabs,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  ShopOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { Product } from "@/lib/api";
import type { BranchDisplay } from "@/lib/api/types/branch.types";
import type { UserManagementInfo } from "@/lib/api";
import type { BookingInfoDto } from "@/lib/api/types/booking.types";
import type { Service } from "@/lib/api/types/service.types";
import BookingSection from "./BookingSection";
import ProductImageThumbnail from "./ProductImageThumbnail";

const { Text } = Typography;
const { Option } = Select;

export interface ProductWithStock extends Product {
  sellingPrice: number;
  availableStock: number;
}

interface ProductSectionProps {
  products: ProductWithStock[];
  categories: string[];
  selectedBranch: BranchDisplay | null;
  selectedCustomer: UserManagementInfo | null;
  isLoading: boolean;
  onAddToCart: (product: ProductWithStock) => void;
  onRefresh: () => void;
  onBranchClick: () => void;
  onCustomerClick: () => void;
  // New props for booking integration
  bookings: BookingInfoDto[];
  isLoadingBookings: boolean;
  bookingsError: string | null;
  onAddBookingToCart: (booking: BookingInfoDto) => void;
  onRefreshBookings: () => void;
  // Services data for booking items
  services: Service[];
  isLoadingServices: boolean;
  servicesError: string | null;
  // Price books data
  activePriceBooks: any[];
  isLoadingPriceBooks: boolean;
  priceBooksError: string | null;
  // All price books data
  allPriceBooks: any[];
  isLoadingAllPriceBooks: boolean;
  allPriceBooksError: string | null;
}

const ProductSection: React.FC<ProductSectionProps> = ({
  products,
  categories,
  selectedBranch,
  selectedCustomer,
  isLoading,
  onAddToCart,
  onRefresh,
  onBranchClick,
  onCustomerClick,
  // New props for booking integration
  bookings,
  isLoadingBookings,
  bookingsError,
  onAddBookingToCart,
  onRefreshBookings,
  // Services data for booking items
  services,
  isLoadingServices,
  servicesError,
  // Price books data
  activePriceBooks,
  isLoadingPriceBooks,
  priceBooksError,
  // All price books data
  allPriceBooks,
  isLoadingAllPriceBooks,
  allPriceBooksError,
}) => {
  const [searchText, setSearchText] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [activeTab, setActiveTab] = useState<string>("products");

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.product_name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchText.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchText.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" ||
        product.product_type_name === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchText, categoryFilter]);

  return (
    <Card
      extra={
        <Button
          icon={<ReloadOutlined />}
          onClick={onRefresh}
          loading={isLoading}
        >
          Làm mới dữ liệu
        </Button>
      }
      style={{ height: "100%", borderRadius: "12px" }}
      styles={{
        body: { height: "calc(100% - 57px)", overflow: "auto" },
      }}
    >
      {/* Filters */}
      <Row
        gutter={[16, 16]}
        style={{ marginBottom: "16px" }}
      >
        <Col span={8}>
          <Input
            placeholder="Tìm kiếm sản phẩm, mã SKU..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            size="large"
            allowClear
          />
        </Col>
        <Col span={4}>
          <Select
            placeholder="Danh mục"
            value={categoryFilter}
            onChange={setCategoryFilter}
            style={{ width: "100%" }}
            size="large"
          >
            <Option value="all">Tất cả</Option>
            {categories.map((cat) => (
              <Option
                key={cat}
                value={cat}
              >
                {cat}
              </Option>
            ))}
          </Select>
        </Col>
        <Col span={6}>
          <Button
            size="large"
            icon={<ShopOutlined />}
            onClick={onBranchClick}
            style={{ width: "100%" }}
            type={selectedBranch ? "primary" : "default"}
          >
            {selectedBranch ? (
              <Text
                ellipsis={{ tooltip: true }}
                style={{ color: "white" }}
              >
                {selectedBranch.branch_name}
              </Text>
            ) : (
              <Text ellipsis={{ tooltip: true }}>Chọn chi nhánh</Text>
            )}
          </Button>
        </Col>
        <Col span={6}>
          <Button
            size="large"
            icon={<UserOutlined />}
            onClick={onCustomerClick}
            style={{ width: "100%" }}
          >
            <Text ellipsis={{ tooltip: true }}>
              {selectedCustomer ? selectedCustomer.full_name : "Khách hàng"}
            </Text>
          </Button>
        </Col>
      </Row>

      {/* Content with Tabs */}
      {!selectedBranch ? (
        <Empty
          style={{ marginTop: "100px" }}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Space direction="vertical">
              <Text type="secondary">
                Vui lòng chọn chi nhánh để xem sản phẩm và booking
              </Text>
            </Space>
          }
        />
      ) : (
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "products",
              label: "Sản phẩm",
              children: (
                <div>
                  {isLoading ? (
                    <div style={{ textAlign: "center", padding: "80px 20px" }}>
                      <Spin size="large" />
                      <div style={{ marginTop: "16px" }}>
                        Đang tải sản phẩm...
                      </div>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <Empty description="Không tìm thấy sản phẩm" />
                  ) : (
                    <Row gutter={[16, 16]}>
                      {filteredProducts.map((product) => (
                        <Col
                          xs={24}
                          sm={12}
                          md={8}
                          lg={8}
                          xl={8}
                          key={product.product_id}
                        >
                          <Badge.Ribbon
                            text={
                              product.availableStock === 0
                                ? "Hết hàng"
                                : `Còn ${product.availableStock}`
                            }
                            color={
                              product.availableStock === 0
                                ? "red"
                                : product.availableStock <= 10
                                ? "orange"
                                : "green"
                            }
                          >
                            <Card
                              hoverable={product.availableStock > 0}
                              style={{
                                borderRadius: "8px",
                                opacity: product.availableStock === 0 ? 0.5 : 1,
                                cursor:
                                  product.availableStock === 0
                                    ? "not-allowed"
                                    : "pointer",
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                              }}
                              styles={{
                                body: {
                                  padding: "12px",
                                  flex: 1,
                                  display: "flex",
                                  flexDirection: "column",
                                  height: "100%",
                                },
                              }}
                              onClick={() =>
                                product.availableStock > 0 &&
                                onAddToCart(product)
                              }
                            >
                              <div
                                style={{
                                  textAlign: "center",
                                  display: "flex",
                                  flexDirection: "column",
                                  height: "100%",
                                }}
                              >
                                <ProductImageThumbnail
                                  productId={product.product_id}
                                  productName={product.product_name}
                                />
                                <div
                                  style={{
                                    flex: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                  }}
                                >
                                  <Text
                                    strong
                                    style={{
                                      fontSize: "13px",
                                      display: "block",
                                      marginBottom: "8px",
                                      minHeight: "40px",
                                      lineHeight: "1.4",
                                    }}
                                    ellipsis={{
                                      tooltip: product.product_name,
                                    }}
                                  >
                                    {product.product_name}
                                  </Text>
                                  <Text
                                    style={{
                                      color: "#1890ff",
                                      fontSize: "16px",
                                      fontWeight: "bold",
                                      display: "block",
                                      marginBottom: "8px",
                                    }}
                                  >
                                    ₫{product.sellingPrice?.toLocaleString()}
                                  </Text>
                                  <div
                                    style={{
                                      marginTop: "auto",
                                      marginBottom: "8px",
                                      display: "flex",
                                      flexWrap: "wrap",
                                      justifyContent: "center",
                                    }}
                                  >
                                    {product.brand && (
                                      <Tag
                                        color="purple"
                                        style={{
                                          fontSize: "10px",
                                          margin: 0,
                                          maxWidth: "100%",
                                        }}
                                      >
                                        <Text
                                          ellipsis={{ tooltip: product.brand }}
                                          style={{ maxWidth: "100%" }}
                                        >
                                          {product.brand}
                                        </Text>
                                      </Tag>
                                    )}
                                  </div>
                                  <div
                                    style={{
                                      marginTop: "auto",
                                      marginBottom: "8px",
                                      display: "flex",
                                      flexWrap: "wrap",
                                      justifyContent: "center",
                                    }}
                                  >
                                    {product.sku && (
                                      <Tag
                                        color="blue"
                                        style={{
                                          fontSize: "10px",
                                          margin: 0,
                                          maxWidth: "100%",
                                        }}
                                      >
                                        <Text
                                          ellipsis={{ tooltip: product.sku }}
                                          style={{ maxWidth: "100%" }}
                                        >
                                          {product.sku}
                                        </Text>
                                      </Tag>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </Badge.Ribbon>
                        </Col>
                      ))}
                    </Row>
                  )}
                </div>
              ),
            },
            {
              key: "bookings",
              label: "Booking",
              children: (
                <BookingSection
                  bookings={bookings}
                  selectedBranch={selectedBranch}
                  isLoading={isLoadingBookings}
                  error={bookingsError}
                  onAddBookingToCart={onAddBookingToCart}
                  onRefresh={onRefreshBookings}
                  services={services}
                  isLoadingServices={isLoadingServices}
                  servicesError={servicesError}
                  activePriceBooks={activePriceBooks}
                  isLoadingPriceBooks={isLoadingPriceBooks}
                  priceBooksError={priceBooksError}
                  allPriceBooks={allPriceBooks}
                  isLoadingAllPriceBooks={isLoadingAllPriceBooks}
                  allPriceBooksError={allPriceBooksError}
                />
              ),
            },
          ]}
        />
      )}
    </Card>
  );
};

export default ProductSection;
