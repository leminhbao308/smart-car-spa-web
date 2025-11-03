import React, {useEffect, useState} from "react";
import {Modal, Table, Tag, Spin, Empty, Statistic, Row, Col, Card} from "antd";
import {ColumnsType} from "antd/es/table";
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from "recharts";
import {ArrowUpOutlined, ArrowDownOutlined, MinusOutlined} from "@ant-design/icons";
import formatCurrency from "@/components/utils/helper/currency.format.helper";
import {Product, PurchaseHistory, PurchaseOrderLine} from "@/lib/api";

interface PriceHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  product: Product | null;
  // Function to fetch price history - should be passed from parent
  onFetchHistory?: (productId: string) => Promise<PurchaseHistory | null>;
}

const PriceHistoryModal: React.FC<PriceHistoryModalProps> = ({
                                                               visible,
                                                               onClose,
                                                               product,
                                                               onFetchHistory,
                                                             }) => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<PurchaseOrderLine[]>([]);

  useEffect(() => {
    if (visible && product && onFetchHistory) {
      fetchHistory();
    }
  }, [visible, product]);

  const fetchHistory = async () => {
    if (!product || !onFetchHistory) return;

    setLoading(true);
    try {
      const data = await onFetchHistory(product.product_id);

      if (!data || !data.lines) {
        setHistory([]);
        return;
      }

      // Sort by date descending
      const sortedData = data.lines.sort(
        (a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
      );
      setHistory(sortedData);
    } catch (error) {
      console.log("Failed to fetch price history:", error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  // Calculate statistics
  const prices = history.map((item) => item.unit_cost);
  const currentPrice = prices.length > 0 ? prices[0] : 0;
  const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  // Calculate price trend
  let priceTrend: "up" | "down" | "stable" = "stable";
  let priceChange = 0;
  if (prices.length >= 2) {
    const previousPrice = prices[1];
    priceChange = ((currentPrice - previousPrice) / previousPrice) * 100;
    if (Math.abs(priceChange) < 1) {
      priceTrend = "stable";
    } else if (priceChange > 0) {
      priceTrend = "up";
    } else {
      priceTrend = "down";
    }
  }

  // Prepare chart data (reversed for chronological order)
  const chartData = [...history]
    .reverse()
    .map((item, index) => ({
      name: `Lần ${history.length - index}`,
      date: new Date(item.created_date).toLocaleDateString("vi-VN"),
      price: item.unit_cost,
      qty: item.qty_ordered,
    }));

  const columns: ColumnsType<PurchaseOrderLine> = [
    {
      title: "Ngày nhập",
      dataIndex: "created_date",
      key: "created_date",
      width: 150,
      render: (date: string) => new Date(date).toLocaleString("vi-VN"),
    },
    {
      title: "Nhà cung cấp",
      key: "supplier",
      width: 200,
      render: (_, record) => record.supplier?.supplier_name || "N/A",
    },
    {
      title: "Số lượng nhập",
      dataIndex: "qty_ordered",
      key: "qty_ordered",
      width: 100,
      align: "center",
      render: (qty: number) => <strong>{qty}</strong>,
    },
    {
      title: "Đơn giá nhập",
      dataIndex: "unit_cost",
      key: "unit_cost",
      width: 150,
      align: "right",
      render: (price: number, record, index) => {
        let color = "#1890ff";
        if (index > 0 && history[index - 1]) {
          const prevPrice = history[index - 1].unit_cost;
          if (price > prevPrice) color = "#ff4d4f";
          else if (price < prevPrice) color = "#52c41a";
        }
        return (
          <span style={{fontWeight: 600, color}}>
            {formatCurrency(price)}
          </span>
        );
      },
    },
    {
      title: "Tổng tiền",
      key: "total",
      width: 150,
      align: "right",
      render: (_, record) => {
        const total = record.qty_ordered * record.unit_cost;
        return (
          <span style={{fontWeight: 500, color: "#52c41a"}}>
            {formatCurrency(total)}
          </span>
        );
      },
    },
    {
      title: "Thay đổi",
      key: "change",
      width: 120,
      align: "center",
      render: (_, record, index) => {
        if (index === history.length - 1) {
          return <Tag color="default">Lần đầu</Tag>;
        }
        const prevPrice = history[index + 1].unit_cost;
        const change = ((record.unit_cost - prevPrice) / prevPrice) * 100;

        if (Math.abs(change) < 0.1) {
          return (
            <Tag icon={<MinusOutlined/>} color="default">
              Không đổi
            </Tag>
          );
        }

        return change > 0 ? (
          <Tag icon={<ArrowUpOutlined/>}>
            +{change.toFixed(1)}%
          </Tag>
        ) : (
          <Tag icon={<ArrowDownOutlined/>}>
            {change.toFixed(1)}%
          </Tag>
        );
      },
    },
  ];

  return (
    <Modal
      height={800}
      title={
        <div>
          <div style={{fontSize: 18, fontWeight: 600}}>Lịch sử giá nhập</div>
          <div style={{fontSize: 14, fontWeight: 400, color: "#666", marginTop: 4}}>
            {product.product_name} ({product.sku})
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1200}
      destroyOnHidden
    >
      <Spin spinning={loading}>
        {history.length === 0 && !loading ? (
          <Empty description="Sản phẩm này chưa được nhập hàng lần nào"/>
        ) : (
          <div>
            {/* Statistics Cards */}
            <Row gutter={16} style={{marginBottom: 24}}>
              <Col span={6}>
                <Card style={{height: "100%"}}>
                  <Statistic
                    title="Giá nhập hiện tại"
                    value={currentPrice}
                    precision={0}
                    formatter={(value) => formatCurrency(Number(value))}
                    valueStyle={{color: "#1890ff"}}
                  />
                  {priceTrend !== "stable" && (
                    <div style={{marginTop: 8, fontSize: 12}}>
                      {priceTrend === "up" ? (
                        <Tag icon={<ArrowUpOutlined/>}>
                          Tăng {Math.abs(priceChange).toFixed(1)}%
                        </Tag>
                      ) : (
                        <Tag icon={<ArrowDownOutlined/>}>
                          Giảm {Math.abs(priceChange).toFixed(1)}%
                        </Tag>
                      )}
                    </div>
                  )}
                </Card>
              </Col>
              <Col span={6}>
                <Card style={{height: "100%"}}>
                  <Statistic
                    title="Giá trung bình"
                    value={avgPrice}
                    precision={0}
                    formatter={(value) => formatCurrency(Number(value))}
                    valueStyle={{color: "#52c41a"}}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card style={{height: "100%"}}>
                  <Statistic
                    title="Giá thấp nhất"
                    value={minPrice}
                    precision={0}
                    formatter={(value) => formatCurrency(Number(value))}
                    valueStyle={{color: "#52c41a"}}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card style={{height: "100%"}}>
                  <Statistic
                    title="Giá cao nhất"
                    value={maxPrice}
                    precision={0}
                    formatter={(value) => formatCurrency(Number(value))}
                    valueStyle={{color: "#ff4d4f"}}
                  />
                </Card>
              </Col>
            </Row>

            {/* Price Chart */}
            {chartData.length > 1 && (
              <Card title="Biểu đồ biến động giá" style={{marginBottom: 24}}>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis
                      dataKey="date"
                      style={{fontSize: 12}}
                    />
                    <YAxis
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                      style={{fontSize: 12}}
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      labelStyle={{color: "#666"}}
                    />
                    <Legend/>
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#1890ff"
                      strokeWidth={2}
                      name="Đơn giá"
                      dot={{r: 4}}
                      activeDot={{r: 6}}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* History Table */}
            <Card title={`Lịch sử nhập hàng (${history.length} lần)`}>
              <Table
                dataSource={history}
                columns={columns}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Tổng ${total} lần nhập`,
                }}
                size="small"
                rowKey="id"
                scroll={{x: 900}}
              />
            </Card>
          </div>
        )}
      </Spin>
    </Modal>
  );
};

export default PriceHistoryModal;
