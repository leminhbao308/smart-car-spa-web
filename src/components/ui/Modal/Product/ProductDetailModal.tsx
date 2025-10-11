"use client";
import React from "react";
import {
  Modal,
  Card,
  Row,
  Col,
  Descriptions,
  Tag,
  Badge,
  Typography,
  Divider,
  Space,
  Statistic,
  Image,
  Tooltip,
  Avatar,
  Button,
} from "antd";
import {
  ShoppingOutlined,
  DollarOutlined,
  CalendarOutlined,
  TagOutlined,
  InboxOutlined,
  InfoCircleOutlined,
  StarOutlined,
  SafetyOutlined,
  BarcodeOutlined,
  ShopOutlined,
  ClockCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {Product} from "@/lib/api/types/product.types";
import formatCurrency from "@/components/utils/helper/currency.format.helper";
import {SupplierDetailModal} from "../SupplierModal";
import {useSupplier} from "@/lib/api/hooks/useSuppliers";

const {Title, Text, Paragraph} = Typography;

interface ProductDetailModalProps {
  visible: boolean;
  onCancel: () => void;
  data?: Product | null;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
                                                                 visible,
                                                                 onCancel,
                                                                 data,
                                                               }) => {
  const [supplierModalVisible, setSupplierModalVisible] = React.useState(false);

  const {supplier} = useSupplier(
    supplierModalVisible && data ? data.supplierId : null
  );

  if (!data) return null;

  const profit = data.sellingPrice - data.costPrice;
  const profitMargin =
    data.costPrice > 0 ? ((profit / data.costPrice) * 100).toFixed(1) : "0";

  console.log(data)

  return (
    <Modal
      title={
        <div style={{display: "flex", alignItems: "center", gap: 12}}>
          <Avatar
            size={40}
            icon={<ShoppingOutlined/>}
            style={{backgroundColor: "#1890ff"}}
          />
          <div>
            <Title level={4} style={{margin: 0, color: "#262626"}}>
              {data.productName}
            </Title>
            <Text type="secondary" style={{fontSize: 12}}>
              {data.sku} • {data.brand}
            </Text>
          </div>
          {data.isFeatured && (
            <Tooltip title="Sản phẩm nổi bật">
              <StarOutlined style={{color: "#faad14", fontSize: 20}}/>
            </Tooltip>
          )}
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={1000}
      footer={null}
      styles={{
        body: {
          padding: "24px",
          maxHeight: "70vh",
          overflowY: "auto",
          overflowX: "hidden",
        },
      }}
    >
      <div style={{ width: "100%", overflowX: "hidden" }}>
        {/* Header với thông tin tổng quan */}
        <Card
          size="small"
          style={{
            marginBottom: 16,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <Row gutter={24} align="middle">
            {/* <Col span={6}>
              <Statistic
                title={
                  <span style={{ color: "rgba(255,255,255,0.8)" }}>
                    Giá bán
                  </span>
                }
                value={data.sellingPrice}
                formatter={(value) => formatCurrency(Number(value))}
                valueStyle={{ color: "#fff", fontSize: 20 }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title={
                  <span style={{ color: "rgba(255,255,255,0.8)" }}>
                    Lợi nhuận
                  </span>
                }
                value={profit}
                formatter={(value) => formatCurrency(Number(value))}
                valueStyle={{
                  color: profit > 0 ? "#52c41a" : "#ff4d4f",
                  fontSize: 20,
                }}
                suffix={`(${profitMargin}%)`}
              />
            </Col> */}
            <Col span={6}>
              <Statistic
                title={
                  <span style={{ color: "rgba(255,255,255,0.8)" }}>Đơn vị</span>
                }
                value={data.unitOfMeasure}
                valueStyle={{ color: "#fff", fontSize: 20 }}
                prefix={<TagOutlined />}
              />
            </Col>
            <Col span={6}>
              <div style={{ textAlign: "center" }}>
                <Badge
                  status={
                    data.is_deleted
                      ? "default"
                      : data.is_active
                        ? "success"
                        : "error"
                  }
                  text={
                    <span
                      style={{
                        color: data.is_deleted ? "#999" : "white",
                        fontSize: 16,
                        fontWeight: 500
                      }}
                    >
                      {data.is_deleted
                        ? "Đã xóa"
                        : data.is_active
                          ? "Hoạt động"
                          : "Tạm dừng"
                      }
                    </span>
                  }
                />
              </div>
            </Col>
          </Row>
        </Card>

        <Row gutter={[16, 16]}>
          {/* Cột trái - Hình ảnh và thông tin cơ bản */}
          <Col xs={24} lg={10}>
            {/* Hình ảnh sản phẩm */}
            <Card
              title={
                <Space>
                  <EyeOutlined/>
                  Hình ảnh sản phẩm
                </Space>
              }
              size="small"
              style={{marginBottom: 16}}
            >
              {data.imageUrls?.main ? (
                <Image
                  preview={true}
                  src={data.imageUrls.main}
                  alt={data.productName}
                  style={{width: "100%", borderRadius: 8, maxHeight: 300}}
                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                />
              ) : (
                <div
                  style={{
                    height: 200,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#999",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <ShoppingOutlined style={{fontSize: 48}}/>
                  <Text type="secondary">Chưa có hình ảnh</Text>
                </div>
              )}
            </Card>

            {/* Thông tin cơ bản */}
            <Card
              title={
                <Space>
                  <InfoCircleOutlined />
                  Thông tin cơ bản
                </Space>
              }
              size="small"
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Product ID">
                  <Text code>{data.productId}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="SKU">
                  <Text code>{data.sku}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Barcode">
                  <Space>
                    <BarcodeOutlined />
                    <Text code>{data.barcode}</Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="URL">
                  <Text code>{data.productUrl}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Danh mục">
                  <Tag color="blue">{data.categoryName}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Đơn vị">
                  <Tag color="green">{data.unitOfMeasure}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Nhà cung cấp">
                  <Button
                    type="link"
                    size="small"
                    onClick={() => setSupplierModalVisible(true)}
                    style={{ padding: 0, height: "auto" }}
                  >
                    <Text code>Xem chi tiết</Text>
                  </Button>
                </Descriptions.Item>
                <Descriptions.Item label="Mô tả">
                  <Paragraph
                    ellipsis={{ rows: 3, expandable: true, symbol: "Xem thêm" }}
                    style={{ margin: 0 }}
                  >
                    {data.description}
                  </Paragraph>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Cột phải - Thông tin chi tiết */}
          <Col xs={24} lg={14}>
            {/* Thông tin giá cả */}
            {/* <Card
              title={
                <Space>
                  <DollarOutlined />
                  Thông tin giá cả
                </Space>
              }
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Row gutter={[8, 8]}>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="Giá nhập"
                    value={data.costPrice}
                    formatter={(value) => formatCurrency(Number(value))}
                    valueStyle={{ color: "#1890ff" }}
                    prefix={<ShopOutlined />}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="Giá bán"
                    value={data.sellingPrice}
                    formatter={(value) => formatCurrency(Number(value))}
                    valueStyle={{ color: "#52c41a" }}
                    prefix={<DollarOutlined />}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="Tỷ lệ lợi nhuận"
                    value={profitMargin}
                    suffix="%"
                    valueStyle={{ color: profit > 0 ? "#52c41a" : "#f5222d" }}
                    prefix={<TagOutlined />}
                  />
                </Col>
              </Row>
            </Card> */}

            {/* Thông tin tồn kho */}
            <Card
              title={
                <Space>
                  <InboxOutlined />
                  Cài đặt tồn kho
                </Space>
              }
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Row gutter={[8, 8]}>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="Mức tối thiểu"
                    value={data.minStockLevel}
                    suffix={data.unitOfMeasure}
                    valueStyle={{ color: "#ff4d4f" }}
                    prefix={<InboxOutlined />}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="Mức tối đa"
                    value={data.maxStockLevel}
                    suffix={data.unitOfMeasure}
                    valueStyle={{ color: "#52c41a" }}
                    prefix={<InboxOutlined />}
                  />
                </Col>
              </Row>
            </Card>

            {/* Thông tin kỹ thuật */}
            <Card
              title={
                <Space>
                  <InfoCircleOutlined/>
                  Thông tin kỹ thuật
                </Space>
              }
              size="small"
              style={{marginBottom: 16}}
            >
              <Row gutter={[8, 8]}>
                <Col xs={24} sm={12}>
                  <Statistic
                    title="Trọng lượng"
                    value={data.weight}
                    suffix="kg"
                    valueStyle={{color: "#722ed1"}}
                    prefix={<InfoCircleOutlined/>}
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <Statistic
                    title="Bảo hành"
                    value={data.warrantyPeriodMonths}
                    suffix="tháng"
                    valueStyle={{color: "#fa8c16"}}
                    prefix={<SafetyOutlined/>}
                  />
                </Col>
              </Row>

              {data.dimensions && Object.keys(data.dimensions).length > 0 && (
                <>
                  <Divider style={{margin: "12px 0"}}/>
                  <Text strong>Kích thước:</Text>
                  <Row gutter={[8, 8]} style={{marginTop: 8}}>
                    {Object.entries(data.dimensions).map(([key, value]) => (
                      <Col xs={12} sm={8} key={key}>
                        <Tag color="cyan">
                          {key}: {value}
                        </Tag>
                      </Col>
                    ))}
                  </Row>
                </>
              )}
            </Card>

            {/* Thông số kỹ thuật */}
            {data.specifications &&
              Object.keys(data.specifications).length > 0 && (
                <Card
                  title={
                    <Space>
                      <TagOutlined/>
                      Thông số kỹ thuật
                    </Space>
                  }
                  size="small"
                  style={{marginBottom: 16}}
                >
                  <Row gutter={[8, 8]}>
                    {Object.entries(data.specifications).map(([key, value]) => (
                      <Col xs={24} sm={12} key={key}>
                        <div
                          style={{
                            padding: "8px 12px",
                            backgroundColor: "#f6f8fa",
                            borderRadius: 6,
                            border: "1px solid #e1e4e8",
                          }}
                        >
                          <Text
                            strong
                            style={{
                              textTransform: "capitalize",
                              color: "#24292e",
                            }}
                          >
                            {key}:
                          </Text>
                          <br/>
                          <Text style={{color: "#586069"}}>{value}</Text>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Card>
              )}

            {/* Tags */}
            {data.tags && Object.keys(data.tags).length > 0 && (
              <Card
                title={
                  <Space>
                    <TagOutlined/>
                    Tags
                  </Space>
                }
                size="small"
                style={{marginBottom: 16}}
              >
                <Space wrap>
                  {Object.entries(data.tags).map(([key, value]) => (
                    <Tag key={key} color="blue" style={{marginBottom: 4}}>
                      {key}: {value}
                    </Tag>
                  ))}
                </Space>
              </Card>
            )}
          </Col>

          {/* Cột phải - Thông tin chi tiết */}
          <Col xs={24} lg={14}>
            {/* Thông tin cơ bản */}
            <Card
              title={
                <Space>
                  <InfoCircleOutlined/>
                  Thông tin cơ bản
                </Space>
              }
              size="small"
              style={{marginBottom: 16}}
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Product ID">
                  <Text code>{data.productId}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="SKU">
                  <Text code>{data.sku}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Barcode">
                  <Space>
                    <BarcodeOutlined/>
                    <Text code>{data.barcode}</Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="URL">
                  <Text code>{data.productUrl}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Danh mục">
                  <Tag color="blue">{data.categoryName}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Đơn vị">
                  <Tag color="green">{data.unitOfMeasure}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Nhà cung cấp">
                  <Button
                    type="link"
                    size="small"
                    onClick={() => setSupplierModalVisible(true)}
                    style={{padding: 0, height: "auto"}}
                  >
                    <Text code>Xem chi tiết</Text>
                  </Button>
                </Descriptions.Item>
                <Descriptions.Item label="Mô tả">
                  <Paragraph
                    ellipsis={{rows: 3, expandable: true, symbol: "Xem thêm"}}
                    style={{margin: 0}}
                  >
                    {data.description}
                  </Paragraph>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Paragraph
                    style={{margin: 0, color: data.is_deleted ? "#999" : "black",}}
                  >
                    {data.is_deleted
                      ? "Đã xóa"
                      : data.is_active
                        ? "Đang hoạt động"
                        : "Tạm dừng bán"
                    }
                  </Paragraph>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Thông tin thời gian */}
            <Card
              title={
                <Space>
                  <CalendarOutlined/>
                  Thông tin thời gian
                </Space>
              }
              size="small"
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={24}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Ngày tạo">
                      <Space>
                        <ClockCircleOutlined/>
                        {new Date(data.created_date).toLocaleString("vi-VN")}
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Người tạo">
                      <Text code>{data.created_by}</Text>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col xs={24} sm={24}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Ngày cập nhật">
                      <Space>
                        <ClockCircleOutlined/>
                        {new Date(data.modified_date).toLocaleString("vi-VN")}
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Người cập nhật">
                      <Text code>{data.modified_by}</Text>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Supplier Detail Modal */}
      <SupplierDetailModal
        visible={supplierModalVisible}
        onCancel={() => setSupplierModalVisible(false)}
        onEdit={() => {
        }} // Empty function since we don't need edit functionality
        supplier={supplier}
        loading={false}
        showEditButton={false}
      />
    </Modal>
  );
};

export default ProductDetailModal;
