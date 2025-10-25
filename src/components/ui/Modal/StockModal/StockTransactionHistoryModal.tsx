"use client";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Table,
  Tag,
  Spin,
  Empty,
  Card,
  Row,
  Col,
  Statistic,
  Space,
  Select,
  DatePicker,
} from "antd";
import { ColumnsType } from "antd/es/table";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  SwapOutlined,
  ToolOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import formatCurrency from "@/components/utils/helper/currency.format.helper";
import { Product, StockTransactionDTO } from "@/lib/api";
import { InventoryLotService } from "@/lib/api/services/inventory-lot.service";
import dayjs, { Dayjs } from "dayjs";

interface StockTransactionHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  product: Product | null;
  branchId: string | null;
}

const StockTransactionHistoryModal: React.FC<
  StockTransactionHistoryModalProps
> = ({ visible, onClose, product, branchId }) => {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<StockTransactionDTO[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    StockTransactionDTO[]
  >([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    null,
    null,
  ]);

  useEffect(() => {
    if (visible && product && branchId) {
      fetchHistory();
    } else {
      // Reset when closed
      setTransactions([]);
      setFilteredTransactions([]);
      setSelectedType(null);
      setDateRange([null, null]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, product, branchId]);

  useEffect(() => {
    // Apply filters
    let filtered = [...transactions];

    // Filter by transaction type
    if (selectedType) {
      filtered = filtered.filter((txn) => txn.type === selectedType);
    }

    // Filter by date range
    if (dateRange[0] && dateRange[1]) {
      filtered = filtered.filter((txn) => {
        const txnDate = dayjs(txn.created_date);
        return (
          txnDate.isAfter(dateRange[0]!) &&
          txnDate.isBefore(dateRange[1]!.add(1, "day"))
        );
      });
    }

    setFilteredTransactions(filtered);
  }, [transactions, selectedType, dateRange]);

  const fetchHistory = async () => {
    if (!product || !branchId) return;

    setLoading(true);
    try {
      const data = await InventoryLotService.getProductTransactionHistory(
        branchId,
        product.product_id
      );

      if (!data) {
        setTransactions([]);
        setFilteredTransactions([]);
        return;
      }

      // Sort by date descending
      const sortedData = [...data].sort(
        (a, b) =>
          new Date(b.created_date).getTime() -
          new Date(a.created_date).getTime()
      );

      setTransactions(sortedData);
      setFilteredTransactions(sortedData);
    } catch (error) {
      console.error("Failed to fetch transaction history:", error);
      setTransactions([]);
      setFilteredTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  // Transaction type configuration - simplified to 4 main types
  const txnTypeConfig: Record<
    string,
    {
      label: string;
      icon: React.ReactNode;
      color: string;
      description: string;
    }
  > = {
    PURCHASE_RECEIPT: {
      label: "Nhập kho",
      icon: <ArrowDownOutlined />,
      color: "green",
      description: "Nhập hàng từ đơn mua",
    },
    SALE: {
      label: "Xuất kho",
      icon: <ArrowUpOutlined />,
      color: "red",
      description: "Xuất hàng từ đơn bán",
    },
    RETURN: {
      label: "Trả hàng",
      icon: <SwapOutlined />,
      color: "orange",
      description: "Trả hàng (nhập/xuất)",
    },
    ADJUSTMENT: {
      label: "Điều chỉnh",
      icon: <ToolOutlined />,
      color: "gold",
      description: "Điều chỉnh tồn kho",
    },
  };

  // Calculate statistics based on quantity direction
  const totalTransactions = transactions.length;
  const inboundTransactions = transactions.filter((t) => t.quantity > 0);
  const outboundTransactions = transactions.filter((t) => t.quantity < 0);

  const totalIn = inboundTransactions.reduce((sum, t) => sum + t.quantity, 0);
  const totalOut = outboundTransactions.reduce(
    (sum, t) => sum + Math.abs(t.quantity),
    0
  );
  const netChange = totalIn - totalOut;

  const columns: ColumnsType<StockTransactionDTO> = [
    {
      title: "Thời gian",
      dataIndex: "created_date",
      key: "created_date",
      width: 160,
      fixed: "left",
      render: (date: string) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {new Date(date).toLocaleDateString("vi-VN")}
          </div>
          <div style={{ fontSize: 12, color: "#999" }}>
            {new Date(date).toLocaleTimeString("vi-VN")}
          </div>
        </div>
      ),
      sorter: (a, b) =>
        new Date(a.created_date).getTime() - new Date(b.created_date).getTime(),
    },
    {
      title: "Loại giao dịch",
      dataIndex: "type",
      key: "type",
      width: 150,
      render: (type: string) => {
        const config = txnTypeConfig[type] || {
          label: type,
          icon: <HistoryOutlined />,
          color: "default",
          description: "",
        };
        return (
          <Tag
            icon={config.icon}
            color={config.color}
            style={{ fontSize: 13, padding: "4px 10px" }}
          >
            {config.label}
          </Tag>
        );
      },
      filters: Object.entries(txnTypeConfig).map(([key, value]) => ({
        text: value.label,
        value: key,
      })),
      onFilter: (value, record) => record.type === value,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 120,
      align: "right",
      render: (qty: number) => {
        const isInbound = qty > 0;
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 4,
            }}
          >
            {isInbound ? (
              <ArrowDownOutlined style={{ color: "#52c41a", fontSize: 16 }} />
            ) : (
              <ArrowUpOutlined style={{ color: "#ff4d4f", fontSize: 16 }} />
            )}
            <span
              style={{
                fontWeight: 600,
                fontSize: 16,
                color: isInbound ? "#52c41a" : "#ff4d4f",
              }}
            >
              {isInbound ? "+" : ""}
              {qty}
            </span>
          </div>
        );
      },
      sorter: (a, b) => Math.abs(a.quantity) - Math.abs(b.quantity),
    },
    {
      title: "Đơn giá",
      dataIndex: "unit_cost",
      key: "unit_cost",
      width: 140,
      align: "right",
      render: (cost: number | null) => (
        <span style={{ fontWeight: 500 }}>
          {cost !== null ? (
            formatCurrency(cost)
          ) : (
            <span style={{ color: "#999" }}>-</span>
          )}
        </span>
      ),
    },
    {
      title: "Giá trị",
      key: "total_value",
      width: 150,
      align: "right",
      render: (_, record) => {
        if (record.unit_cost === null) {
          return <span style={{ color: "#999" }}>-</span>;
        }
        const value = Math.abs(record.quantity) * record.unit_cost;
        return (
          <span style={{ fontWeight: 600, color: "#1890ff" }}>
            {formatCurrency(value)}
          </span>
        );
      },
      sorter: (a, b) => {
        const valueA = a.unit_cost ? Math.abs(a.quantity) * a.unit_cost : 0;
        const valueB = b.unit_cost ? Math.abs(b.quantity) * b.unit_cost : 0;
        return valueA - valueB;
      },
    },
    {
      title: "Mã lô",
      dataIndex: "lot_code",
      key: "lot_code",
      width: 130,
      render: (code: string | null) => (
        <span
          style={{ fontFamily: "monospace", color: code ? "#1890ff" : "#999" }}
        >
          {code || "N/A"}
        </span>
      ),
    },
    {
      title: "Loại chứng từ",
      dataIndex: "ref_type",
      key: "ref_type",
      width: 140,
      render: (refType: string | null) => {
        if (!refType) return <span style={{ color: "#999" }}>-</span>;

        const refTypeLabels: Record<string, { label: string; color: string }> =
          {
            SALE_ORDER: { label: "Đơn bán hàng", color: "blue" },
            PURCHASE_ORDER: { label: "Đơn mua hàng", color: "green" },
            SALE_RETURN: { label: "Trả hàng bán", color: "orange" },
            PURCHASE_RETURN: { label: "Trả hàng mua", color: "purple" },
            ADJUSTMENT: { label: "Điều chỉnh", color: "gold" },
          };

        const config = refTypeLabels[refType] || {
          label: refType,
          color: "default",
        };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: "Người thực hiện",
      dataIndex: "created_by",
      key: "created_by",
      width: 140,
      render: (user: string) => (
        <span style={{ color: "#666" }}>{user || "Hệ thống"}</span>
      ),
    },
  ];

  return (
    <Modal
      title={
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
            <HistoryOutlined style={{ marginRight: 8, color: "#1890ff" }} />
            Lịch sử giao dịch kho
          </div>
          <div style={{ fontSize: 14, fontWeight: 400, color: "#666" }}>
            {product.product_name} ({product.sku})
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1400}
      style={{ top: 20 }}
    >
      <Spin spinning={loading}>
        {transactions.length === 0 && !loading ? (
          <Empty
            description="Chưa có giao dịch kho nào cho sản phẩm này"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <div>
            {/* Statistics Cards */}
            <Row
              gutter={16}
              style={{ marginBottom: 24 }}
            >
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Tổng giao dịch"
                    value={totalTransactions}
                    prefix={<HistoryOutlined />}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Tổng nhập"
                    value={totalIn}
                    prefix={<ArrowDownOutlined />}
                    valueStyle={{ color: "#52c41a", fontWeight: 600 }}
                    suffix={
                      <span style={{ fontSize: 12, color: "#999" }}>
                        ({inboundTransactions.length} lần)
                      </span>
                    }
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Tổng xuất"
                    value={totalOut}
                    prefix={<ArrowUpOutlined />}
                    valueStyle={{ color: "#ff4d4f", fontWeight: 600 }}
                    suffix={
                      <span style={{ fontSize: 12, color: "#999" }}>
                        ({outboundTransactions.length} lần)
                      </span>
                    }
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Thay đổi tịnh"
                    value={netChange}
                    prefix={netChange >= 0 ? "+" : ""}
                    valueStyle={{
                      color: netChange >= 0 ? "#52c41a" : "#ff4d4f",
                      fontWeight: 600,
                    }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Filters */}
            <Card style={{ marginBottom: 16, padding: 16 }}>
              <Space
                size="large"
                wrap
              >
                <div>
                  <div style={{ marginBottom: 8, fontWeight: 500 }}>
                    Loại giao dịch:
                  </div>
                  <Select
                    style={{ width: 200 }}
                    placeholder="Tất cả loại"
                    allowClear
                    value={selectedType}
                    onChange={setSelectedType}
                  >
                    {Object.entries(txnTypeConfig).map(([key, value]) => (
                      <Select.Option
                        key={key}
                        value={key}
                      >
                        <Space>
                          <Tag
                            icon={value.icon}
                            color={value.color}
                          >
                            {value.label}
                          </Tag>
                        </Space>
                      </Select.Option>
                    ))}
                  </Select>
                </div>
                <div>
                  <div style={{ marginBottom: 8, fontWeight: 500 }}>
                    Khoảng thời gian:
                  </div>
                  <DatePicker.RangePicker
                    value={dateRange}
                    onChange={(dates) =>
                      setDateRange(dates as [Dayjs | null, Dayjs | null])
                    }
                    format="DD/MM/YYYY"
                    placeholder={["Từ ngày", "Đến ngày"]}
                    style={{ width: 300 }}
                  />
                </div>
              </Space>
            </Card>

            {/* Transaction Types Legend - Simplified */}
            <Card
              style={{ marginBottom: 16 }}
              bodyStyle={{ padding: 12 }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  marginBottom: 8,
                  color: "#666",
                }}
              >
                Chú thích loại giao dịch:
              </div>
              <Space
                size="small"
                wrap
              >
                {Object.entries(txnTypeConfig).map(([key, value]) => (
                  <Tag
                    key={key}
                    icon={value.icon}
                    color={value.color}
                    style={{
                      margin: "2px 4px",
                      fontSize: 13,
                      padding: "4px 12px",
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>{value.label}</span>
                    <span style={{ fontSize: 11, marginLeft: 4, opacity: 0.8 }}>
                      - {value.description}
                    </span>
                  </Tag>
                ))}
              </Space>
            </Card>

            {/* Transactions Table */}
            <Card
              title={
                <Space>
                  <span>Lịch sử giao dịch</span>
                  <Tag color="blue">
                    {filteredTransactions.length} giao dịch
                  </Tag>
                </Space>
              }
            >
              <Table
                dataSource={filteredTransactions}
                columns={columns}
                rowKey="id"
                pagination={{
                  pageSize: 15,
                  showSizeChanger: true,
                  showTotal: (total) => `Tổng ${total} giao dịch`,
                }}
                size="middle"
                scroll={{ x: 1300 }}
                summary={(pageData) => {
                  // Calculate page totals based on quantity direction
                  const pageIn = pageData
                    .filter((t) => t.quantity > 0)
                    .reduce((sum, t) => sum + t.quantity, 0);
                  const pageOut = pageData
                    .filter((t) => t.quantity < 0)
                    .reduce((sum, t) => sum + Math.abs(t.quantity), 0);
                  const pageNet = pageIn - pageOut;

                  return (
                    <Table.Summary fixed>
                      <Table.Summary.Row style={{ backgroundColor: "#fafafa" }}>
                        <Table.Summary.Cell
                          index={0}
                          colSpan={2}
                        >
                          <strong>Tổng trang này:</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell
                          index={2}
                          align="right"
                        >
                          <Space
                            direction="vertical"
                            size={0}
                          >
                            <span style={{ color: "#52c41a", fontWeight: 600 }}>
                              Nhập: +{pageIn}
                            </span>
                            <span style={{ color: "#ff4d4f", fontWeight: 600 }}>
                              Xuất: -{pageOut}
                            </span>
                            <span style={{ fontWeight: 600 }}>
                              Tịnh: {pageNet}
                            </span>
                          </Space>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell
                          index={3}
                          colSpan={5}
                        />
                      </Table.Summary.Row>
                    </Table.Summary>
                  );
                }}
              />
            </Card>
          </div>
        )}
      </Spin>
    </Modal>
  );
};

export default StockTransactionHistoryModal;
