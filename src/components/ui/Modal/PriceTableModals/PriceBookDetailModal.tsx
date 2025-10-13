import {Button, Card, Col, Descriptions, Empty, Modal, Row, Space, Statistic, Table, Tag, Typography} from "antd";
import {CalendarOutlined, CloseOutlined, DollarOutlined, EyeOutlined, ShoppingOutlined} from "@ant-design/icons";
import {PriceBook, PriceBookItem, Product} from "@/lib/api";

const {Text} = Typography;

interface PriceBookDetailModalProps {
  open: boolean;
  onCancel: () => void;
  priceBook: PriceBook;
  products: Product[];
}

interface ProductInfoRecord extends PriceBookItem {
  product_info: Product;
}

const PriceBookDetailModal = (props: PriceBookDetailModalProps) => {
  const {open, onCancel, priceBook, products} = props;

  if (!priceBook) return null;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  const formatCurrency = (amount: number) => {
    if (amount === null || amount === undefined) return "N/A";
    return `${amount.toLocaleString("vi-VN")} ₫`;
  };

  const getProductInfo = (productId: string) => {
    const product = products.find(p => p.product_id === productId);
    return product || {productName: "N/A", sku: "N/A", brand: "N/A", costPrice: 0};
  };

  const itemsWithProductInfo = (priceBook.items || []).map(item => {
    const productInfo = getProductInfo(item?.product?.product_id);
    return {
      ...item,
      product_info: productInfo,
    };
  });

  const columns = [
    {
      title: "Sản phẩm",
      key: "product",
      render: (_, record: ProductInfoRecord) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.product_info.product_name}</Text>
          <Text type="secondary" style={{fontSize: 12}}>
            SKU: {record.product_info.sku} | {record.product_info.brand}
          </Text>
          {record.product_info.costPrice > 0 && (
            <Text type="secondary" style={{fontSize: 11}}>
              Giá vốn: {formatCurrency(record.product_info.costPrice)}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Chính sách giá",
      dataIndex: "policy_type",
      key: "policy_type",
      width: 180,
      render: (policy: string) => (
        <Tag color={policy === "FIXED" ? "blue" : "orange"}>
          {policy === "FIXED" ? "Giá cố định" : "Markup theo giá vốn"}
        </Tag>
      ),
    },
    {
      title: "Giá",
      key: "value",
      width: 180,
      render: (_, record: ProductInfoRecord) => {
        if (record.policy_type === "FIXED") {
          return <Text strong style={{color: "#52c41a"}}>{formatCurrency(record.price ? record.price : 0)}</Text>;
        } else {
          return (
            <Space direction="vertical" size={0}>
              <Text strong style={{color: "#fa8c16"}}>+{record.markup_percent}%</Text>
              {record.product_info.costPrice > 0 && record.markup_percent !== null && (
                <Text type="secondary" style={{fontSize: 11}}>
                  ≈ {formatCurrency(Math.round(record.product_info.costPrice * (1 + record.markup_percent / 100)))}
                </Text>
              )}
            </Space>
          );
        }
      },
    },
  ];

  const fixedPriceItems = itemsWithProductInfo.filter(item => item.policy_type === "FIXED");
  const markupItems = itemsWithProductInfo.filter(item => item.policy_type === "MARKUP_ON_PEAK");

  return (
    <Modal
      title={<Space><EyeOutlined/>Chi tiết bảng giá</Space>}
      open={open}
      onCancel={onCancel}
      footer={[<Button key="close" type="primary" icon={<CloseOutlined/>} onClick={onCancel}>Đóng</Button>]}
      width={1000}
      styles={{body: {maxHeight: "80vh", overflowY: "auto"}}}
    >
      <Card title="Thông tin bảng giá" size="small" style={{marginBottom: 16}}>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="Mã"><Text code strong>{priceBook.code}</Text></Descriptions.Item>
          <Descriptions.Item label="Tên"><Text strong>{priceBook.name}</Text></Descriptions.Item>
          <Descriptions.Item label="Đơn vị tiền tệ"><Tag color="blue">{priceBook.currency}</Tag></Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={priceBook.active ? "success" : "default"}>
              {priceBook.active ? "Đang áp dụng" : "Ngừng áp dụng"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày hiệu lực">
            <Space><CalendarOutlined style={{color: "#52c41a"}}/>{formatDate(priceBook.valid_from)}</Space>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày hết hạn">
            <Space>
              <CalendarOutlined style={{color: "#ff4d4f"}}/>
              {priceBook.valid_fo ? formatDate(priceBook.valid_fo) : "Không giới hạn"}
            </Space>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Thống kê" size="small" style={{marginBottom: 16}}>
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="Tổng sản phẩm"
              value={itemsWithProductInfo.length}
              prefix={<ShoppingOutlined/>}
              valueStyle={{color: "#1890ff"}}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Giá cố định"
              value={fixedPriceItems.length}
              prefix={<DollarOutlined/>}
              valueStyle={{color: "#52c41a"}}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Markup theo giá vốn"
              value={markupItems.length}
              prefix={<DollarOutlined/>}
              valueStyle={{color: "#fa8c16"}}
            />
          </Col>
        </Row>
      </Card>

      <Card title={<Space><span>Danh sách sản phẩm</span><Tag color="blue">{itemsWithProductInfo.length}</Tag></Space>} size="small">
        {itemsWithProductInfo.length > 0 ? (
          <Table
            dataSource={itemsWithProductInfo}
            columns={columns}
            rowKey={(r) => r.product.id}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Tổng ${total} sản phẩm`
            }}
            size="small"
          />
        ) : (
          <Empty description="Chưa có sản phẩm" image={Empty.PRESENTED_IMAGE_SIMPLE}/>
        )}
      </Card>
    </Modal>
  );
};
