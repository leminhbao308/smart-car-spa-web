"use client";
import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Tag,
  Space,
  Skeleton,
  Empty,
  Typography,
  Breadcrumb,
  InputNumber,
  Divider,
  Tabs,
  Rate,
} from "antd";
import {
  ShoppingCartOutlined,
  HeartOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";
import { useProductByUrl } from "@/lib/api/hooks/useProducts";
import { useProductImages } from "@/lib/api/hooks/useProductImages";
import { usePricing } from "@/lib/api/hooks/usePricing";
import { useParams } from "next/navigation";
import { useCart } from "@/contexts/CartContext";

const { Title, Text, Paragraph } = Typography;

export default function ProductDetailPage() {
  const params = useParams();
  const productUrl = params.productUrl as string; // Will be renamed to 'url' when folder is renamed
  const { product, isLoading, error } = useProductByUrl(productUrl);
  const { mainImage } = useProductImages(product?.product_id || "");
  const { preview, loading: pricingLoading } = usePricing();
  const { addToCart } = useCart();
  const [displayPrice, setDisplayPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);

  // Fetch pricing when product is loaded (quantity always = 1 for display price)
  useEffect(() => {
    const fetchPrice = async () => {
      if (product?.product_id) {
        try {
          const priceResponse = await preview({
            product_id: product.product_id,
            qty: 1, // Always use 1 for display price
          });
          setDisplayPrice(priceResponse.total_price || 0);
        } catch (error) {
          console.error("Error fetching price:", error);
          setDisplayPrice(0);
        }
      }
    };
    fetchPrice();
  }, [product?.product_id, preview]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (isLoading) {
    return (
      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        <Skeleton
          active
          paragraph={{ rows: 10 }}
        />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        <Empty description="Không tìm thấy sản phẩm" />
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Breadcrumb */}
      <Breadcrumb
        style={{ marginBottom: "20px" }}
        items={[
          { title: <Link href="/">Trang chủ</Link> },
          { title: <Link href="/products">Sản phẩm</Link> },
          { title: product.product_name },
        ]}
      />

      {/* Main Content */}
      <Row gutter={[32, 32]}>
        {/* Left: Product Images */}
        <Col
          xs={24}
          sm={24}
          md={12}
          lg={12}
        >
          <Card style={{ borderRadius: "12px" }}>
            <div
              style={{
                position: "relative",
                width: "100%",
                paddingBottom: "100%",
                borderRadius: "8px",
                overflow: "hidden",
                backgroundColor: "#f0f0f0",
              }}
            >
              <Image
                src={mainImage?.media_url || "/images/placeholder.jpg"}
                alt={product.product_name}
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </Card>
        </Col>

        {/* Right: Product Info */}
        <Col
          xs={24}
          sm={24}
          md={12}
          lg={12}
        >
          <Space
            direction="vertical"
            style={{ width: "100%" }}
            size="large"
          >
            {/* Title */}
            <div>
              <Title
                level={2}
                style={{ margin: 0 }}
              >
                {product.product_name}
              </Title>
              <Text type="secondary">{product.brand}</Text>
            </div>

            {/* Rating */}
            {/* <div>
              <Space>
                <Rate
                  disabled
                  defaultValue={4}
                />
                <Text>(128 đánh giá)</Text>
              </Space>
            </div> */}

            {/* Price */}
            <div
              style={{
                backgroundColor: "#f5f5f5",
                padding: "12px",
                borderRadius: "8px",
              }}
            >
              <Text
                strong
                style={{ fontSize: "24px", color: "#6C7BEA" }}
              >
                {pricingLoading ? "Đang tải..." : formatPrice(displayPrice)}
              </Text>
            </div>

            {/* Tags */}
            <div>
              <Space wrap>
                {product.is_featured && <Tag color="gold">Nổi Bật</Tag>}
                {product.brand && <Tag color="blue">{product.brand}</Tag>}
                {product.is_active && <Tag color="green">Còn hàng</Tag>}
              </Space>
            </div>

            {/* Quantity - Placeholder for future shopping cart */}
            <div>
              <Space>
                <Text>Số lượng:</Text>
                <InputNumber
                  min={1}
                  max={100}
                  value={quantity}
                  onChange={(value) => setQuantity(value || 1)}
                />
              </Space>
            </div>

            {/* Action Buttons */}
            <Space>
              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                onClick={() => {
                  if (product) {
                    addToCart({
                      ...product,
                      pricing: {
                        basePrice: displayPrice,
                        salePrice: displayPrice,
                      },
                      mainImageUrl: mainImage?.media_url,
                      isAvailable: product.is_active,
                      availableStock: 999, // You may want to fetch actual stock
                    } as any, quantity);
                  }
                }}
                disabled={!product?.is_active || pricingLoading}
                style={{
                  backgroundColor: "#6C7BEA",
                  borderColor: "#6C7BEA",
                  minWidth: "200px",
                  height: "50px",
                  fontWeight: "bold",
                }}
              >
                Thêm Vào Giỏ
              </Button>
              {/* <Button
                size="large"
                icon={<HeartOutlined />}
                style={{ height: "50px" }}
              /> */}
              {/* <Button
                size="large"
                icon={<ShareAltOutlined />}
                style={{ height: "50px" }}
              /> */}
            </Space>

            <Divider />

            {/* Product Details */}
            <div>
              <Title level={4}>Chi tiết sản phẩm</Title>
              <Space
                direction="vertical"
                style={{ width: "100%" }}
              >
                <div>
                  <Text strong>SKU:</Text>
                  <Text>{product.sku}</Text>
                </div>
                <div>
                  <Text strong>Danh mục:</Text>
                  <Text>{product.brand}</Text>
                </div>
                <div>
                  <Text strong>Tình trạng:</Text>
                  <Tag color={product.is_active ? "green" : "red"}>
                    {product.is_active ? "Còn hàng" : "Hết hàng"}
                  </Tag>
                </div>
              </Space>
            </div>
          </Space>
        </Col>
      </Row>

      {/* Description & Reviews Tabs */}
      <Card style={{ marginTop: "40px", borderRadius: "12px" }}>
        <Tabs
          items={[
            {
              key: "description",
              label: "Mô tả",
              children: (
                <div>
                  <Paragraph>{product.description}</Paragraph>
                </div>
              ),
            },
            {
              key: "specifications",
              label: "Thông số kỹ thuật",
              children: (
                <div>
                  <Space
                    direction="vertical"
                    style={{ width: "100%", gap: "16px" }}
                  >
                    {/* Basic Info */}
                    <Card
                      size="small"
                      title="Thông tin cơ bản"
                      style={{ backgroundColor: "#fafafa" }}
                    >
                      <Row gutter={[16, 12]}>
                        {product.brand && (
                          <Col
                            xs={24}
                            sm={12}
                          >
                            <Text
                              strong
                              style={{ color: "#595959" }}
                            >
                              Thương hiệu:
                            </Text>
                            <br />
                            <Text style={{ fontSize: "15px" }}>
                              {product.brand}
                            </Text>
                          </Col>
                        )}
                        {product.model && (
                          <Col
                            xs={24}
                            sm={12}
                          >
                            <Text
                              strong
                              style={{ color: "#595959" }}
                            >
                              Model:
                            </Text>
                            <br />
                            <Text style={{ fontSize: "15px" }}>
                              {product.model}
                            </Text>
                          </Col>
                        )}
                        {product.sku && (
                          <Col
                            xs={24}
                            sm={12}
                          >
                            <Text
                              strong
                              style={{ color: "#595959" }}
                            >
                              SKU:
                            </Text>
                            <br />
                            <Text
                              code
                              style={{ fontSize: "14px" }}
                            >
                              {product.sku}
                            </Text>
                          </Col>
                        )}
                        {product.unit_of_measure && (
                          <Col
                            xs={24}
                            sm={12}
                          >
                            <Text
                              strong
                              style={{ color: "#595959" }}
                            >
                              Đơn vị:
                            </Text>
                            <br />
                            <Text style={{ fontSize: "15px" }}>
                              {product.unit_of_measure}
                            </Text>
                          </Col>
                        )}
                      </Row>
                    </Card>

                    {/* Product Attributes */}
                    {product.attribute_values &&
                      product.attribute_values.length > 0 && (
                        <Card
                          size="small"
                          title="Thuộc tính sản phẩm"
                          style={{ backgroundColor: "#fafafa" }}
                        >
                          <Row gutter={[16, 12]}>
                            {product.attribute_values.map((attr) => (
                              <Col
                                xs={24}
                                sm={12}
                                key={attr.attribute_id}
                              >
                                <Text
                                  strong
                                  style={{ color: "#595959" }}
                                >
                                  {attr.attribute_name}
                                  {attr.unit && (
                                    <Text type="secondary"> ({attr.unit})</Text>
                                  )}
                                  :
                                </Text>
                                <br />
                                <Text style={{ fontSize: "15px" }}>
                                  {attr.display_value ||
                                    attr.value_text ||
                                    attr.value_number ||
                                    "N/A"}
                                </Text>
                              </Col>
                            ))}
                          </Row>
                        </Card>
                      )}
                  </Space>
                </div>
              ),
            },
            // {
            //   key: "reviews",
            //   label: "Đánh giá",
            //   children: (
            //     <div>
            //       <Text type="secondary">Chưa có đánh giá nào</Text>
            //     </div>
            //   ),
            // },
          ]}
        />
      </Card>
    </div>
  );
}
